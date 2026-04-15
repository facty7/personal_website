"""
FastAPI backend for SR3 Super-Resolution and 3DGS 3D Reconstruction.
No Gradio UI, no external connections. Pure REST API.
"""

import os
import sys
import uuid
import shutil
import logging
import tempfile
from pathlib import Path

from PIL import Image
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

# ---- Setup logging ----
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---- Clear all proxy env vars to prevent httpx timeout ----
for key in ["HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy", "ALL_PROXY"]:
    os.environ.pop(key, None)
os.environ["NO_PROXY"] = "*"
os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"

# ---- Create app ----
app = FastAPI(title="SR3 & 3DGS Backend")

# Static files directory for serving processed outputs
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# ---- Import handlers ----
from sr_handler import predict_sr
from gs_handler import train_3dgs


# ==========================================
# SR3 Super-Resolution
# ==========================================

@app.post("/api/predict/sr_process")
async def sr_process(file: UploadFile = File(...)):
    """Process a single image through SR3 super-resolution."""
    try:
        logger.info(f"Received SR request: {file.filename}")
        image = Image.open(file.file).convert("RGB")
        output_image = predict_sr(image=image)

        # Save output
        out_filename = f"sr_{uuid.uuid4().hex[:8]}.png"
        out_path = os.path.join(OUTPUT_DIR, out_filename)
        output_image.save(out_path, format="PNG")

        logger.info(f"SR output saved: {out_filename}")
        return JSONResponse({
            "status": "success",
            "image_url": f"/outputs/{out_filename}",
            "message": "Super-resolution completed",
        })

    except Exception as e:
        logger.error(f"SR error: {e}")
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500,
        )


# ==========================================
# 3DGS Training
# ==========================================

@app.post("/api/predict/gs_process")
async def gs_process(files: list[UploadFile] = File(...)):
    """Process multiple images through 3DGS training."""
    try:
        logger.info(f"Received 3DGS request with {len(files)} images")

        # 1. Prepare temporary input directory
        source_dir = tempfile.mkdtemp(prefix="3dgs_source_")
        img_dir = os.path.join(source_dir, "images")
        os.makedirs(img_dir, exist_ok=True)

        for i, f in enumerate(files):
            ext = os.path.splitext(f.filename)[1] or ".jpg"
            dst = os.path.join(img_dir, f"img_{i}{ext}")
            with open(dst, "wb") as buf:
                buf.write(await f.read())

        # 2. Prepare output directory
        output_dir = tempfile.mkdtemp(prefix="3dgs_out_")

        # 3. Start training
        iterations = int(os.environ.get("GS_ITERATIONS", "100"))
        logger.info(f"Starting 3DGS training ({iterations} iterations)...")
        ply_path = train_3dgs(img_dir, output_dir, iterations=iterations)

        if not ply_path or not os.path.exists(ply_path):
            raise FileNotFoundError(f"PLY file not found after training: {ply_path}")

        # Copy PLY to output dir for serving
        ply_filename = f"model_{uuid.uuid4().hex[:8]}.ply"
        public_ply = os.path.join(OUTPUT_DIR, ply_filename)
        shutil.copy2(ply_path, public_ply)

        logger.info(f"3DGS PLY saved: {ply_filename}")
        return JSONResponse({
            "status": "success",
            "ply_url": f"/outputs/{ply_filename}",
            "message": "3DGS training completed",
        })

    except Exception as e:
        logger.error(f"3DGS error: {e}")
        return JSONResponse(
            {"status": "error", "message": str(e)},
            status_code=500,
        )


# ==========================================
# Health check
# ==========================================

@app.get("/health")
async def health():
    return JSONResponse({"status": "ok"})


# ==========================================
# Run
# ==========================================

if __name__ == "__main__":
    import uvicorn
    import socket

    # Find available port
    for port in [7860, 7861, 7862, 7863, 7864]:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            result = sock.connect_ex(("127.0.0.1", port))
        finally:
            sock.close()
        if result != 0:
            print(f"Starting server on 0.0.0.0:{port}")
            uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
            break
    else:
        print("All ports in use, exiting.")
        sys.exit(1)
