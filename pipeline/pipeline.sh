#!/bin/bash
# AliceVision Photogrammetry Pipeline
# Usage: ./photogrammetry_pipeline.sh input_folder output_folder

set -e  # Exit on any error

# Setup AliceVision environment
export PATH="/opt/AliceVision_install/bin:$PATH"
export LD_LIBRARY_PATH="/opt/AliceVision_install/lib:$LD_LIBRARY_PATH"
export ALICEVISION_ROOT="/opt/AliceVision_install"

# Input validation
if [ $# -ne 2 ]; then
    echo "Usage: $0 <input_folder> <output_folder>"
    echo "Example: $0 /data/input /data/output"
    exit 1
fi

INPUT_DIR="$1"
OUTPUT_DIR="$2"
TEMP_DIR="$OUTPUT_DIR/temp"

# Create directories
mkdir -p "$OUTPUT_DIR" "$TEMP_DIR" "$TEMP_DIR/features" "$TEMP_DIR/matches" "$TEMP_DIR/sfm"

echo "=========================================="
echo "AliceVision Photogrammetry Pipeline"
echo "Input: $INPUT_DIR"
echo "Output: $OUTPUT_DIR"
echo "=========================================="

# Check if input directory has images
if [ ! -d "$INPUT_DIR" ]; then
    echo "ERROR: Input directory $INPUT_DIR does not exist"
    exit 1
fi

IMAGE_COUNT=$(find "$INPUT_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.tif" \) | wc -l)

if [ $IMAGE_COUNT -eq 0 ]; then
    echo "ERROR: No images found in $INPUT_DIR"
    echo "Supported formats: JPG, JPEG, PNG, TIFF, TIF"
    exit 1
fi

echo "Found $IMAGE_COUNT images to process"
echo "PROGRESS:INIT:COMPLETE:Found $IMAGE_COUNT images to process"

# Step 1: Camera Initialization
echo "PROGRESS:1:START:Camera Initialization"
echo "Step 1/7: Camera Initialization..."

aliceVision_cameraInit-2.1 \
    --imageFolder "$INPUT_DIR" \
    --sensorDatabase "/opt/AliceVision_install/share/aliceVision/cameraSensors.db" \
    --output "$TEMP_DIR/cameraInit.sfm" \
    --allowSingleView 1

echo "PROGRESS:1:COMPLETE:Camera Initialization completed"

# Step 2: Feature Extraction
echo "PROGRESS:2:START:Feature Extraction"
echo "Step 2/7: Feature Extraction..."

aliceVision_featureExtraction-1.2 \
    --input "$TEMP_DIR/cameraInit.sfm" \
    --output "$TEMP_DIR/features" \
    --describerTypes sift \
    --forceCpuExtraction False

echo "PROGRESS:2:COMPLETE:Feature Extraction completed"

# Step 3: Image Matching
echo "PROGRESS:3:START:Image Matching"
echo "Step 3/7: Image Matching..."

aliceVision_imageMatching-1.0 \
    --input "$TEMP_DIR/cameraInit.sfm" \
    --featuresFolder "$TEMP_DIR/features" \
    --output "$TEMP_DIR/imageMatches.txt" \
    --tree "/opt/AliceVision_install/share/aliceVision/vlfeat_K80L3.SIFT.tree"

echo "PROGRESS:3:COMPLETE:Image Matching completed"

# Step 4: Feature Matching
echo "PROGRESS:4:START:Feature Matching"
echo "Step 4/7: Feature Matching..."

aliceVision_featureMatching-2.0 \
    --input "$TEMP_DIR/cameraInit.sfm" \
    --featuresFolder "$TEMP_DIR/features" \
    --imagePairsList "$TEMP_DIR/imageMatches.txt" \
    --output "$TEMP_DIR/matches"

echo "PROGRESS:4:COMPLETE:Feature Matching completed"

# Step 5: Structure from Motion
echo "PROGRESS:5:START:Structure from Motion"
echo "Step 5/7: Structure from Motion..."

aliceVision_incrementalSfM-2.4 \
    --input "$TEMP_DIR/cameraInit.sfm" \
    --featuresFolder "$TEMP_DIR/features" \
    --matchesFolder "$TEMP_DIR/matches" \
    --output "$TEMP_DIR/sfm.abc"

echo "PROGRESS:5:COMPLETE:Structure from Motion completed"

# Step 6: Meshing
echo "PROGRESS:6:START:Meshing"
echo "Step 6/7: Meshing..."

aliceVision_meshing-4.0 \
    --input "$TEMP_DIR/sfm.abc" \
    --output "$TEMP_DIR/sfm_dense.abc" \
    --outputMesh "$OUTPUT_DIR/mesh.obj"

echo "PROGRESS:6:COMPLETE:Meshing completed"

# Step 7: Texturing
echo "PROGRESS:7:START:Texturing"
echo "Step 7/7: Texturing..."

aliceVision_texturing-3.0 \
    --input "$TEMP_DIR/sfm.abc" \
    --inputMesh "$OUTPUT_DIR/mesh.obj" \
    --output "$OUTPUT_DIR/" \
    --colorMappingFileType exr

echo "PROGRESS:7:COMPLETE:Texturing completed"

echo "=========================================="
echo "Pipeline completed successfully!"
echo "Results saved to: $OUTPUT_DIR"
echo "Main outputs:"
echo "- Mesh: $OUTPUT_DIR/mesh.obj"
echo "- Textured Mesh: $OUTPUT_DIR/texturedMesh.obj"
echo "- Texture files: $OUTPUT_DIR/texture_*.exr"
echo "- Camera reconstruction: $TEMP_DIR/sfm.abc"
echo "=========================================="

echo "PIPELINE:COMPLETE"