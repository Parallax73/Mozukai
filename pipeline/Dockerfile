FROM alicevision/alicevision:develop-a2c32bd3b-ubuntu22.04-cuda12.1.1

# Install dependencies
RUN apt update && apt install -y python3 python3-pip

# Install fastapi + uvicorn + multipart
RUN pip3 install fastapi uvicorn[standard] python-multipart

# Create workspace
WORKDIR /app

# Copy sh to the image
COPY photogrammetry_pipeline.sh /app/photogrammetry_pipeline.sh
COPY app.py /app/app.py

# Give running permission to sh
RUN chmod +x /app/photogrammetry_pipeline.sh

# Open the port
EXPOSE 8090

# Start the server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8090"]