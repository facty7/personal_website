FROM pytorch/pytorch:2.1.0-cuda12.1-cudnn8-runtime

WORKDIR /app

# Install system dependencies (including COLMAP for 3DGS)
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libgl1-mesa-glx \
    libglib2.0-0 \
    colmap \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install 3DGS CUDA extensions
RUN pip install --no-cache-dir \
    diff-gaussian-rasterization \
    simple-knn

# Copy application code
COPY . .

# Expose port (HF Spaces requires 7860)
EXPOSE 7860

# Start
CMD ["python", "app.py"]
