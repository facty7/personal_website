"""
Swin2SR Super-Resolution Handler for Hugging Face Spaces.

This module provides image super-resolution using Swin2SR model.
Replaces the original SR3 diffusion-based approach with Swin2SR for
better availability of pretrained weights and simpler inference.
"""

import torch
from torchvision import transforms
from PIL import Image
import os
import logging
from typing import Optional, Tuple
from functools import lru_cache

# Import spaces decorator for GPU acceleration on Hugging Face Spaces
try:
    from gradio import spaces
except ImportError:
    # Fallback for local development
    class spaces:
        @staticmethod
        def GPU(*args, **kwargs):
            def decorator(func):
                return func
            return decorator

# Setup logging
logger = logging.getLogger(__name__)

# Local weights directory (config.json + model.safetensors + preprocessor_config.json)
LOCAL_WEIGHTS_DIR = os.path.join(os.path.dirname(__file__), "weights")
DEFAULT_MODEL_NAME = "caidas/swin2SR-classical-sr-x2-64"


# ==========================================
# Model Loading and Management
# ==========================================

@lru_cache(maxsize=1)
def load_sr_model(
    model_path: Optional[str] = None,
    device: Optional[str] = None,
) -> Tuple:
    """
    Load Swin2SR model for image super-resolution.
    Uses local weights by default, falls back to HF Hub if local files are missing.

    Args:
        model_path: Optional override path to model directory or safetensors file
        device: Device to load model on ('cuda' or 'cpu')

    Returns:
        Tuple of (model, processor, device_str)
    """
    from transformers import Swin2SRForImageSuperResolution, Swin2SRImageProcessor

    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    has_local_weights = (
        os.path.isdir(LOCAL_WEIGHTS_DIR)
        and os.path.isfile(os.path.join(LOCAL_WEIGHTS_DIR, "config.json"))
        and os.path.isfile(os.path.join(LOCAL_WEIGHTS_DIR, "model.safetensors"))
    )

    if has_local_weights:
        logger.info(f"Loading Swin2SR from local weights: {LOCAL_WEIGHTS_DIR}")
        model = Swin2SRForImageSuperResolution.from_pretrained(
            LOCAL_WEIGHTS_DIR, use_safetensors=True
        )
        processor = Swin2SRImageProcessor.from_pretrained(LOCAL_WEIGHTS_DIR)
    else:
        logger.info(f"Local weights not found, downloading from HF Hub: {DEFAULT_MODEL_NAME}")
        model = Swin2SRForImageSuperResolution.from_pretrained(DEFAULT_MODEL_NAME)
        processor = Swin2SRImageProcessor.from_pretrained(DEFAULT_MODEL_NAME)

    model = model.to(device)
    model.eval()

    logger.info("Swin2SR model loaded successfully")
    return model, processor, device


# ==========================================
# Main Prediction Function
# ==========================================

@spaces.GPU
def predict_sr(
    image: Image.Image,
    model_path: Optional[str] = None,
) -> Image.Image:
    """
    Perform super-resolution on input image using Swin2SR model.

    Args:
        image: Input PIL image
        model_path: Optional path to local model directory or HF model name

    Returns:
        Super-resolved PIL image
    """
    logger.info(f"Starting Swin2SR inference for image size: {image.size}")

    # Load model
    model, processor, device = load_sr_model(model_path=model_path)

    # Preprocess
    inputs = processor(image, return_tensors="pt").to(device)

    # Inference
    with torch.no_grad():
        outputs = model(**inputs)

    # Post-process: get the reconstructed image
    # outputs.reconstruction shape: [1, 3, H, W], values roughly in [0, 1]
    output = outputs.reconstruction.data.squeeze().cpu().clamp(0, 1)

    # Convert to PIL
    output_image = transforms.ToPILImage()(output)

    logger.info(f"Swin2SR inference completed, output size: {output_image.size}")
    return output_image


# ==========================================
# For backward compatibility and testing
# ==========================================

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        input_path = sys.argv[1]
    else:
        input_path = "origin.png"

    if not os.path.exists(input_path):
        print(f"Error: Input image not found: {input_path}")
        print("Usage: python sr_handler.py <input_image_path>")
        sys.exit(1)

    # Load image
    input_image = Image.open(input_path).convert("RGB")
    print(f"Input image: {input_path} ({input_image.size})")

    # Run prediction
    output_image = predict_sr(input_image)

    # Save output
    output_path = "sr_output.png"
    output_image.save(output_path)
    print(f"Output saved: {output_path} ({output_image.size})")
