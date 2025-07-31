import os
import shutil
import uuid
import asyncio
import zipfile
import subprocess
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import logging
import json
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GPU Pipeline Server", version="1.0.0")

# Allow your main backend to call this GPU server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",  # Your main backend
        "http://localhost:5173",  # Frontend (for direct calls if needed)
        "http://127.0.0.1:5173",  # Frontend alternative
        "http://localhost:3000",  # Alternative frontend port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WORKDIR = "/data/jobs"
SCRIPT_PATH = "/app/photogrammetry_pipeline.sh"

# Ensure work directory exists
os.makedirs(WORKDIR, exist_ok=True)

def create_file_tree(directory: str) -> Dict:
    """Create a tree structure of files and directories"""
    def get_size(path: str) -> int:
        try:
            if os.path.isfile(path):
                return os.path.getsize(path)
            return 0
        except:
            return 0
    
    def build_tree(dir_path: str, name: str = None) -> Dict:
        if name is None:
            name = os.path.basename(dir_path)
        
        node = {
            "name": name,
            "path": dir_path,
            "type": "directory" if os.path.isdir(dir_path) else "file",
            "size": get_size(dir_path),
            "children": []
        }
        
        if os.path.isdir(dir_path):
            try:
                items = sorted(os.listdir(dir_path))
                for item in items:
                    item_path = os.path.join(dir_path, item)
                    child = build_tree(item_path, item)
                    node["children"].append(child)
            except PermissionError:
                pass
        
        return node
    
    if os.path.exists(directory):
        return build_tree(directory)
    return {"name": "Directory not found", "type": "error", "children": []}

async def run_pipeline_with_progress(input_dir: str, output_dir: str, job_id: str):
    """Run the photogrammetry pipeline and yield progress messages"""
    
    # Create output directory structure early and add status markers
    os.makedirs(output_dir, exist_ok=True)
    
    # Add a marker file to indicate job started
    marker_file = os.path.join(output_dir, ".job_started")
    with open(marker_file, "w") as f:
        f.write(f"Job {job_id} started at {datetime.now()}")
    
    # Check if script exists
    if not os.path.exists(SCRIPT_PATH):
        error_msg = f"ERROR: Script not found at {SCRIPT_PATH}"
        logger.error(error_msg)
        
        # Mark job as failed but preserve directory
        error_file = os.path.join(output_dir, ".job_failed")
        with open(error_file, "w") as f:
            f.write(f"Job {job_id} failed at {datetime.now()}: {error_msg}")
        
        yield f"data: {error_msg}\n\n"
        return
    
    # Make script executable
    try:
        os.chmod(SCRIPT_PATH, 0o755)
        logger.info(f"Made script executable: {SCRIPT_PATH}")
    except Exception as e:
        error_msg = f"Cannot make script executable: {e}"
        logger.error(error_msg)
        
        # Mark job as failed
        error_file = os.path.join(output_dir, ".job_failed")
        with open(error_file, "w") as f:
            f.write(f"Job {job_id} failed at {datetime.now()}: {error_msg}")
        
        yield f"data: ERROR: {error_msg}\n\n"
        return
    
    yield f"data: Starting pipeline: {SCRIPT_PATH} {input_dir} {output_dir}\n\n"
    
    try:
        # Create subprocess with proper environment
        env = os.environ.copy()
        
        process = await asyncio.create_subprocess_exec(
            "bash",  # Use bash explicitly
            SCRIPT_PATH,
            input_dir,
            output_dir,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
            env=env,
            cwd="/app"
        )
        
        logger.info(f"Started subprocess with PID: {process.pid}")
        yield f"data: Process started with PID: {process.pid}\n\n"
        
        # Read output line by line
        line_count = 0
        while True:
            try:
                line = await asyncio.wait_for(process.stdout.readline(), timeout=60.0)
                if not line:
                    break
                    
                decoded = line.decode('utf-8', errors='ignore').strip()
                if decoded:
                    line_count += 1
                    logger.info(f"Pipeline output [{line_count}]: {decoded}")
                    yield f"data: {decoded}\n\n"
                    
            except asyncio.TimeoutError:
                logger.warning("No output for 60 seconds, but process still running...")
                yield f"data: [Heartbeat] Process still running...\n\n"
                continue
        
        # Wait for process to complete
        return_code = await process.wait()
        logger.info(f"Process completed with return code: {return_code}")
        
        if return_code == 0:
            yield f"data: Process completed successfully\n\n"
            
            # Mark job as completed
            completion_file = os.path.join(output_dir, ".job_completed")
            with open(completion_file, "w") as f:
                f.write(f"Job {job_id} completed successfully at {datetime.now()}")
            
            # Generate file tree of results
            file_tree = create_file_tree(output_dir)
            yield f"data: FILETREE:{json.dumps(file_tree)}\n\n"
            
            # Send job completion with job ID for downloads
            yield f"data: JOB_COMPLETE:{job_id}\n\n"
        else:
            error_msg = f"Process failed with return code: {return_code}"
            logger.error(error_msg)
            
            # Mark job as failed but preserve directory for debugging
            error_file = os.path.join(output_dir, ".job_failed")
            with open(error_file, "w") as f:
                f.write(f"Job {job_id} failed at {datetime.now()}: {error_msg}")
            
            yield f"data: {error_msg}\n\n"
            
    except Exception as e:
        error_msg = f"Pipeline execution error: {str(e)}"
        logger.error(error_msg)
        
        # Mark job as failed but preserve directory
        error_file = os.path.join(output_dir, ".job_failed")
        with open(error_file, "w") as f:
            f.write(f"Job {job_id} failed at {datetime.now()}: {error_msg}")
        
        yield f"data: EXECUTION ERROR: {str(e)}\n\n"
    
    finally:
        # Always send completion signal
        yield f"data: PIPELINE:FINISHED\n\n"

@app.post("/run-pipeline/")
async def run_pipeline(
    file: UploadFile = File(...),
    x_user_id: Optional[str] = Header(None, alias="X-User-ID")
):
    """Handle ZIP file upload and run pipeline with SSE progress"""
    
    logger.info(f"Received pipeline request from user: {x_user_id or 'unknown'}")
    logger.info(f"File: {file.filename}, Content-Type: {file.content_type}")
    
    # Validate file type
    if not file.filename or not file.filename.endswith(".zip"):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only ZIP files are accepted")
    
    # Create unique job directory
    job_id = str(uuid.uuid4())
    job_dir = os.path.join(WORKDIR, job_id)
    input_dir = os.path.join(job_dir, "input")
    output_dir = os.path.join(job_dir, "output")
    
    logger.info(f"Created job {job_id} with directories: {job_dir}")
    
    try:
        os.makedirs(input_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)
        
        # Save ZIP file
        zip_path = os.path.join(job_dir, "upload.zip")
        
        logger.info(f"Saving uploaded file to: {zip_path}")
        with open(zip_path, "wb") as buffer:
            file_content = await file.read()
            buffer.write(file_content)
            logger.info(f"Saved {len(file_content)} bytes")
        
        # Extract ZIP contents
        logger.info("Extracting ZIP file...")
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(input_dir)
            extracted_files = zip_ref.namelist()
            logger.info(f"Extracted {len(extracted_files)} files")
        
        # Count images
        image_extensions = ['.jpg', '.jpeg', '.png', '.tiff', '.tif']
        image_files = []
        for root, dirs, files in os.walk(input_dir):
            for file in files:
                if any(file.lower().endswith(ext) for ext in image_extensions):
                    image_files.append(os.path.join(root, file))
        
        logger.info(f"Found {len(image_files)} image files")
        
        if len(image_files) == 0:
            raise HTTPException(status_code=400, detail="No image files found in ZIP")
            
    except zipfile.BadZipFile:
        logger.error("Invalid ZIP file")
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail="Invalid ZIP file")
    except Exception as e:
        logger.error(f"Error processing ZIP file: {str(e)}")
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=f"Error processing ZIP file: {str(e)}")
    
    # Stream progress using Server-Sent Events
    async def event_generator():
        try:
            yield f"data: Job {job_id} started with {len(image_files)} images\n\n"
            
            async for progress_line in run_pipeline_with_progress(input_dir, output_dir, job_id):
                yield progress_line
                
        except Exception as e:
            logger.error(f"Event generator error: {str(e)}")
            yield f"data: GENERATOR ERROR: {str(e)}\n\n"
        finally:
            # IMPORTANT: Keep job directory for file downloads - DO NOT clean up
            logger.info(f"Pipeline completed for job {job_id}, preserving directory: {job_dir}")
    
    logger.info("Starting streaming response")
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "X-Job-ID": job_id,
        }
    )

@app.get("/download/{job_id}")
async def download_results(job_id: str):
    """Download all results as a ZIP file - Enhanced with debugging"""
    logger.info(f"Download request for job: {job_id}")
    
    # Enhanced debugging information
    logger.info(f"WORKDIR: {WORKDIR}")
    logger.info(f"WORKDIR exists: {os.path.exists(WORKDIR)}")
    
    if os.path.exists(WORKDIR):
        all_jobs = os.listdir(WORKDIR)
        logger.info(f"All jobs in WORKDIR ({len(all_jobs)}): {all_jobs[:10]}...")  # Limit output
    else:
        logger.error(f"WORKDIR does not exist: {WORKDIR}")
        raise HTTPException(status_code=500, detail=f"Work directory does not exist: {WORKDIR}")
    
    job_dir = os.path.join(WORKDIR, job_id)
    output_dir = os.path.join(job_dir, "output")
    
    logger.info(f"Looking for job directory: {job_dir}")
    logger.info(f"Job directory exists: {os.path.exists(job_dir)}")
    
    if not os.path.exists(job_dir):
        available_jobs = os.listdir(WORKDIR) if os.path.exists(WORKDIR) else []
        logger.error(f"Job directory not found. Available jobs: {len(available_jobs)}")
        raise HTTPException(
            status_code=404, 
            detail=f"Job directory not found: {job_id}. Available jobs: {len(available_jobs)}"
        )
    
    # Check what's in the job directory
    job_contents = os.listdir(job_dir)
    logger.info(f"Job directory contents: {job_contents}")
    
    if not os.path.exists(output_dir):
        logger.error(f"Output directory not found: {output_dir}")
        raise HTTPException(
            status_code=404, 
            detail=f"Job results not found: {job_id}. Job dir contains: {job_contents}"
        )
    
    # List files in output directory for debugging
    try:
        files_in_output = os.listdir(output_dir)
        logger.info(f"Files in output directory: {files_in_output}")
        
        if len(files_in_output) == 0:
            logger.warning(f"Output directory is empty: {output_dir}")
            raise HTTPException(status_code=404, detail=f"No results found for job: {job_id}")
            
    except Exception as e:
        logger.error(f"Error listing output directory: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error accessing results: {str(e)}")
    
    # Create ZIP file with all results
    zip_path = os.path.join(job_dir, "results.zip")
    logger.info(f"Creating ZIP file: {zip_path}")
    
    try:
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            files_added = 0
            for root, dirs, files in os.walk(output_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, output_dir)
                    logger.info(f"Adding to ZIP: {file_path} as {arcname}")
                    zipf.write(file_path, arcname)
                    files_added += 1
            
            logger.info(f"Added {files_added} files to ZIP")
        
        # Check if ZIP was created successfully
        if not os.path.exists(zip_path):
            raise HTTPException(status_code=500, detail="Failed to create ZIP file")
            
        zip_size = os.path.getsize(zip_path)
        logger.info(f"ZIP file created successfully: {zip_path}, size: {zip_size} bytes")
        
        return FileResponse(
            path=zip_path,
            filename=f"photogrammetry_results_{job_id}.zip",
            media_type="application/zip",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "*",
            }
        )
        
    except Exception as e:
        logger.error(f"Error creating ZIP file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create download package: {str(e)}")

@app.get("/jobs")
async def list_jobs():
    """List all available jobs for debugging"""
    if not os.path.exists(WORKDIR):
        return {"jobs": [], "workdir_exists": False, "workdir": WORKDIR}
    
    jobs = []
    for job_id in os.listdir(WORKDIR):
        job_dir = os.path.join(WORKDIR, job_id)
        if os.path.isdir(job_dir):
            output_dir = os.path.join(job_dir, "output")
            job_info = {
                "job_id": job_id,
                "created": datetime.fromtimestamp(os.path.getctime(job_dir)).isoformat(),
                "has_output": os.path.exists(output_dir),
                "contents": os.listdir(job_dir),
                "status": "unknown"
            }
            
            # Check job status
            if os.path.exists(os.path.join(output_dir, ".job_completed")):
                job_info["status"] = "completed"
            elif os.path.exists(os.path.join(output_dir, ".job_failed")):
                job_info["status"] = "failed"
            elif os.path.exists(os.path.join(output_dir, ".job_started")):
                job_info["status"] = "running"
            
            jobs.append(job_info)
    
    # Sort by creation time, newest first
    jobs.sort(key=lambda x: x["created"], reverse=True)
    
    return {
        "jobs": jobs,
        "total_jobs": len(jobs),
        "workdir": WORKDIR,
        "workdir_exists": True
    }

@app.get("/download/{job_id}/file")
async def download_file(job_id: str, file_path: str):
    """Download a specific file from job results"""
    job_dir = os.path.join(WORKDIR, job_id)
    output_dir = os.path.join(job_dir, "output")
    
    # Security: ensure the file is within the job directory
    full_path = os.path.join(output_dir, file_path)
    if not full_path.startswith(output_dir):
        raise HTTPException(status_code=400, detail="Invalid file path")
    
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    filename = os.path.basename(full_path)
    return FileResponse(path=full_path, filename=filename)

@app.get("/jobs/{job_id}/files")
async def get_job_files(job_id: str):
    """Get file tree for a completed job"""
    job_dir = os.path.join(WORKDIR, job_id)
    output_dir = os.path.join(job_dir, "output")
    
    if not os.path.exists(output_dir):
        raise HTTPException(status_code=404, detail="Job not found")
    
    file_tree = create_file_tree(output_dir)
    return {"job_id": job_id, "files": file_tree}

@app.delete("/jobs/{job_id}")
async def cleanup_job(job_id: str):
    """Clean up job directory"""
    job_dir = os.path.join(WORKDIR, job_id)
    
    if os.path.exists(job_dir):
        shutil.rmtree(job_dir, ignore_errors=True)
        return {"message": f"Job {job_id} cleaned up"}
    else:
        raise HTTPException(status_code=404, detail="Job not found")

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    script_exists = os.path.exists(SCRIPT_PATH)
    script_executable = os.access(SCRIPT_PATH, os.X_OK) if script_exists else False
    
    return {
        "status": "healthy",
        "service": "gpu_pipeline",
        "script_path": SCRIPT_PATH,
        "script_exists": script_exists,
        "script_executable": script_executable,
        "work_dir": WORKDIR,
        "work_dir_exists": os.path.exists(WORKDIR)
    }

@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify server is working"""
    return {"message": "GPU server is working!", "timestamp": "2025-07-30"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8090)