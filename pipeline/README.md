# AliceVision Photogrammetry Pipeline

A high-performance photogrammetry pipeline using AliceVision framework for 3D reconstruction and camera tracking.

## Prerequisites

Before you begin, ensure you have the following:

### Hardware Requirements
- **NVIDIA CUDA-enabled GPU** with compute capability 3.0 or higher
- **Minimum 16GB RAM** (32GB+ recommended for large datasets)  
- **50GB+ storage** for builds, dependencies, and processing
- **High-speed internet** for data transfer (when using cloud instances)

### Software Requirements
- Ubuntu 18.04/20.04/22.04 LTS
- NVIDIA GPU drivers (latest recommended)
- CUDA Toolkit 10.0+ (CUDA 11+ recommended)
- CMake 3.11+
- Git
- Python 3.7+

## Installation

### AliceVision Setup
For AliceVision installation, I recommend using the official build script:

```bash
# Download and run the AliceVision build script
wget https://raw.githubusercontent.com/alicevision/AliceVision/develop/scripts/build_ubuntu.sh
chmod +x build_ubuntu.sh
./build_ubuntu.sh --cuda
```

For detailed installation instructions and dependencies, refer to the [AliceVision Build Documentation](https://github.com/alicevision/AliceVision/blob/develop/INSTALL.md).

### Pipeline Dependencies
```bash
# Clone the repository
git clone https://github.com/Parallax73/Mozukai.git
cd Mozukai

# Install Python dependencies for the pipeline
pip install -r requirements.txt
```

## Pipeline Usage

### Basic Pipeline Execution
```bash
# Run photogrammetry pipeline 
Usage: pipeline.sh <input_folder> <output_folder>
```

### Pipeline Configuration
```yaml
# Processing settings
image_describer: SIFT
matching_method: CASCADE_HASHING
reconstruction_method: INCREMENTAL
meshing_method: DELAUNAY

# Quality settings
feature_quality: NORMAL
matching_ratio: 0.8
reconstruction_angle_threshold: 5.0

# GPU settings
cuda_device: 0
max_gpu_memory: 10000

# Output settings
output_formats: [OBJ, PLY, FBX]
texture_resolution: 4096
```

## License & Credits

This pipeline utilizes:
- **AliceVision**: Photogrammetric Computer Vision framework for 3D Reconstruction and Camera Tracking
- **CUDA**: NVIDIA parallel computing platform
- **OpenCV**: Computer vision library

## Support

For pipeline-specific issues:
- Check the troubleshooting section above
- Review AliceVision documentation: https://alicevision.org/
- GPU compute capability requirements: NVIDIA CUDA-enabled GPU with compute capability 3.0 to 7.5

⚠️ **Important Notes:**
- NVIDIA CUDA compatible video card is required
- Force CPU extraction disabled - CUDA compute capability 3+ required
- Processing time varies significantly based on dataset size and GPU performance
- Always backup your original images before processing
- Monitor GPU temperature during long processing sessions