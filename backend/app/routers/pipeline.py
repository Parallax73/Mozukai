from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from fastapi.responses import StreamingResponse, Response
from typing import Optional
import httpx
import asyncio
from app.core.security import get_subject_from_token
import logging

# Configure logger for this module
logger = logging.getLogger(__name__)

# Create FastAPI router instance
router = APIRouter()

# URL of the GPU server to which requests will be proxied
GPU_SERVER_URL = "http://localhost:8090"

async def get_current_user_from_token(authorization: Optional[str] = Header(None)):
    """
    Extract and validate user ID from the Authorization header.
    Expected header format: "Bearer <token>".
    Raises 401 if missing or invalid.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        # Check for correct Bearer token format
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization format")
        
        # Extract token part after "Bearer "
        token = authorization.split(" ")[1]
        
        # Validate token and extract user ID (subject)
        user_id = get_subject_from_token(token)
        logger.info(f"Authenticated user: {user_id}")
        
        return user_id
        
    except ValueError as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

async def test_gpu_connection():
    """
    Check if the GPU server is reachable by calling its /health endpoint.
    Returns True if reachable (HTTP 200), False otherwise.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{GPU_SERVER_URL}/health")
            logger.info(f"GPU server health check: {response.status_code}")
            return response.status_code == 200
    except Exception as e:
        logger.error(f"GPU server connection test failed: {str(e)}")
        return False

async def stream_from_gpu_server(file_content: bytes, filename: str, user_id: str):
    """
    Send the uploaded ZIP file to the GPU server's pipeline endpoint,
    then stream back the server-sent events (SSE) response asynchronously.
    """
    logger.info(f"Starting stream_from_gpu_server for user {user_id}, file {filename}")
    
    # Check GPU server availability before forwarding
    if not await test_gpu_connection():
        yield b"data: ERROR: GPU server is not reachable\n\n"
        return
    
    # Prepare multipart/form-data payload with file
    files = {"file": (filename, file_content, "application/zip")}
    
    # Optionally send user ID in headers for tracking
    headers = {"X-User-ID": user_id}
    
    try:
        # Set generous timeouts: connect/read/write/pool
        timeout = httpx.Timeout(connect=30.0, read=3600.0, write=30.0, pool=30.0)
        
        logger.info(f"Making request to {GPU_SERVER_URL}/run-pipeline/")
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info(f"Forwarding pipeline request to GPU server for user {user_id}")
            
            try:
                # Stream response from GPU server (SSE)
                async with client.stream(
                    "POST",
                    f"{GPU_SERVER_URL}/run-pipeline/",
                    files=files,
                    headers=headers
                ) as response:
                    
                    logger.info(f"GPU server response status: {response.status_code}")
                    
                    # If GPU server returns error status, read error message and yield it
                    if response.status_code != 200:
                        error_text = await response.aread()
                        error_msg = error_text.decode()
                        logger.error(f"GPU server error: {response.status_code} - {error_msg}")
                        yield f"data: GPU server error ({response.status_code}): {error_msg}\n\n".encode()
                        return
                    
                    # Stream chunks of data to client
                    logger.info("Starting to stream response from GPU server")
                    try:
                        chunk_count = 0
                        async for chunk in response.aiter_bytes():
                            if chunk:  # only send non-empty chunks
                                chunk_count += 1
                                if chunk_count % 10 == 0:
                                    logger.info(f"Streamed {chunk_count} chunks")
                                yield chunk
                        logger.info(f"Streaming completed. Total chunks: {chunk_count}")
                    except Exception as stream_error:
                        logger.error(f"Streaming error: {str(stream_error)}")
                        yield f"data: STREAMING ERROR: {str(stream_error)}\n\n".encode()
                        
            except httpx.ReadTimeout:
                logger.error("GPU server read timeout")
                yield b"data: ERROR: GPU server read timeout\n\n"
            except httpx.ConnectTimeout:
                logger.error("GPU server connection timeout")
                yield b"data: ERROR: GPU server connection timeout\n\n"
                    
    except httpx.ConnectError as e:
        logger.error(f"Cannot connect to GPU server: {str(e)}")
        yield f"data: ERROR: Cannot connect to GPU server: {str(e)}\n\n".encode()
    except Exception as e:
        logger.error(f"Pipeline forwarding error: {str(e)}")
        yield f"data: ERROR: {str(e)}\n\n".encode()

@router.post("/run-pipeline/")
async def run_pipeline(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Endpoint to receive a ZIP file, authenticate user via JWT,
    and stream pipeline processing results from GPU server back to client.
    """
    
    logger.info(f"Received pipeline request for file: {file.filename}")
    
    # Authenticate user
    user_id = await get_current_user_from_token(authorization)
    logger.info(f"User authenticated: {user_id}")
    
    # Validate that file is ZIP
    if not file.filename or not file.filename.endswith(".zip"):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only ZIP files are accepted")
    
    # Read file content bytes
    try:
        file_content = await file.read()
        if len(file_content) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        logger.info(f"Processing pipeline request for user {user_id}, file: {file.filename}, size: {len(file_content)} bytes")
    except Exception as e:
        logger.error(f"Error reading file: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
    
    # Return StreamingResponse with the SSE stream from GPU server
    logger.info("Starting StreamingResponse")
    return StreamingResponse(
        stream_from_gpu_server(file_content, file.filename, user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )

@router.get("/download/{job_id}")
async def download_results(
    job_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Endpoint to download processed results ZIP file for a given job ID
    from the GPU server, with user authentication.
    """
    user_id = await get_current_user_from_token(authorization)
    logger.info(f"Download request for job {job_id} by user {user_id}")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{GPU_SERVER_URL}/download/{job_id}")
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Download failed")
            
            # Return the ZIP file content with correct headers for download
            return Response(
                content=response.content,
                media_type="application/zip",
                headers={
                    "Content-Disposition": f"attachment; filename=photogrammetry_results_{job_id}.zip"
                }
            )
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="GPU server unavailable")
    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

@router.get("/jobs/{job_id}/files")
async def get_job_files(
    job_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Retrieve file tree (list of files) for a specific job from GPU server.
    Requires user authentication.
    """
    user_id = await get_current_user_from_token(authorization)
    logger.info(f"File tree request for job {job_id} by user {user_id}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{GPU_SERVER_URL}/jobs/{job_id}/files")
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Failed to get files")
            
            return response.json()
    except httpx.ConnectError:
        raise HTTPException(status_code=503, detail="GPU server unavailable")
    except Exception as e:
        logger.error(f"Get files error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get files")

@router.get("/pipeline/health")
async def pipeline_health():
    """
    Health check endpoint to verify if the GPU server is available.
    Returns combined status of main backend and GPU server.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{GPU_SERVER_URL}/health")
            if response.status_code == 200:
                gpu_status = response.json()
                return {
                    "status": "healthy",
                    "main_backend": "running",
                    "gpu_server": gpu_status
                }
            else:
                return {
                    "status": "unhealthy",
                    "main_backend": "running",
                    "gpu_server": "unreachable"
                }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "main_backend": "running", 
            "gpu_server": f"error: {str(e)}"
        }
