"""
3D Gaussian Splatting Handler for Hugging Face Spaces.

This module provides 3DGS training functionality.
Based on the reference implementation from C:\\Users\\PC\\Desktop\\3DGS_Project\\train.py
"""

import os
import sys
import torch
import logging
from random import randint
import uuid
from tqdm import tqdm

# Add 3DGS_Project to path to import modules
_3DGS_PROJECT_PATH = os.environ.get("GS_PROJECT_PATH", "/mnt/c/Users/PC/Desktop/3DGS_Project")
if _3DGS_PROJECT_PATH not in sys.path:
    sys.path.insert(0, _3DGS_PROJECT_PATH)

try:
    from utils.loss_utils import l1_loss, ssim
    from gaussian_renderer import render
    from scene import Scene, GaussianModel
    from utils.general_utils import safe_state, get_expon_lr_func
    from utils.image_utils import psnr
    from arguments import ModelParams, PipelineParams, OptimizationParams
    _3DGS_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Failed to import 3DGS modules: {e}")
    _3DGS_AVAILABLE = False
    # Define dummy classes to prevent crashes
    class Scene:
        pass
    class GaussianModel:
        pass
    class ModelParams:
        pass
    class PipelineParams:
        pass
    class OptimizationParams:
        pass

# Setup logging
logger = logging.getLogger(__name__)

def training(dataset, opt, pipe, testing_iterations, saving_iterations, checkpoint_iterations, checkpoint, debug_from):
    """
    Core training loop from 3DGS train.py, stripped of network GUI and other non-essential parts.
    """
    if not _3DGS_AVAILABLE:
        raise RuntimeError("3DGS modules not available")

    # Check for fused ssim and sparse adam availability
    try:
        from fused_ssim import fused_ssim
        FUSED_SSIM_AVAILABLE = True
    except:
        FUSED_SSIM_AVAILABLE = False
    try:
        from diff_gaussian_rasterization import SparseGaussianAdam
        SPARSE_ADAM_AVAILABLE = True
    except:
        SPARSE_ADAM_AVAILABLE = False

    if not SPARSE_ADAM_AVAILABLE and opt.optimizer_type == "sparse_adam":
        logger.warning("Sparse Adam not available, falling back to default optimizer")
        opt.optimizer_type = "default"

    first_iter = 0
    tb_writer = None  # TensorBoard not needed for inference
    gaussians = GaussianModel(dataset.sh_degree, opt.optimizer_type)
    scene = Scene(dataset, gaussians)
    gaussians.training_setup(opt)
    if checkpoint:
        (model_params, first_iter) = torch.load(checkpoint)
        gaussians.restore(model_params, opt)

    bg_color = [1, 1, 1] if dataset.white_background else [0, 0, 0]
    background = torch.tensor(bg_color, dtype=torch.float32, device="cuda")

    iter_start = torch.cuda.Event(enable_timing=True)
    iter_end = torch.cuda.Event(enable_timing=True)

    use_sparse_adam = opt.optimizer_type == "sparse_adam" and SPARSE_ADAM_AVAILABLE
    depth_l1_weight = get_expon_lr_func(opt.depth_l1_weight_init, opt.depth_l1_weight_final, max_steps=opt.iterations)

    viewpoint_stack = scene.getTrainCameras().copy()
    viewpoint_indices = list(range(len(viewpoint_stack)))
    ema_loss_for_log = 0.0
    ema_Ll1depth_for_log = 0.0

    progress_bar = tqdm(range(first_iter, opt.iterations), desc="Training progress")
    first_iter += 1
    for iteration in range(first_iter, opt.iterations + 1):
        iter_start.record()

        gaussians.update_learning_rate(iteration)

        # Every 1000 its we increase the levels of SH up to a maximum degree
        if iteration % 1000 == 0:
            gaussians.oneupSHdegree()

        # Pick a random Camera
        if not viewpoint_stack:
            viewpoint_stack = scene.getTrainCameras().copy()
            viewpoint_indices = list(range(len(viewpoint_stack)))
        rand_idx = randint(0, len(viewpoint_indices) - 1)
        viewpoint_cam = viewpoint_stack.pop(rand_idx)
        vind = viewpoint_indices.pop(rand_idx)

        # Render
        if (iteration - 1) == debug_from:
            pipe.debug = True

        bg = torch.rand((3), device="cuda") if opt.random_background else background

        render_pkg = render(viewpoint_cam, gaussians, pipe, bg)
        image, viewspace_point_tensor, visibility_filter, radii = render_pkg["render"], render_pkg["viewspace_points"], render_pkg["visibility_filter"], render_pkg["radii"]

        if viewpoint_cam.alpha_mask is not None:
            alpha_mask = viewpoint_cam.alpha_mask.cuda()
            image *= alpha_mask

        # Loss
        gt_image = viewpoint_cam.original_image.cuda()
        Ll1 = l1_loss(image, gt_image)
        if FUSED_SSIM_AVAILABLE:
            ssim_value = fused_ssim(image.unsqueeze(0), gt_image.unsqueeze(0))
        else:
            ssim_value = ssim(image, gt_image)
        loss = (1.0 - opt.lambda_dssim) * Ll1 + opt.lambda_dssim * (1.0 - ssim_value)

        # Depth regularization (simplified, assumes no depth)
        Ll1depth = 0.0
        loss.backward()

        iter_end.record()

        with torch.no_grad():
            # Progress bar
            ema_loss_for_log = 0.4 * loss.item() + 0.6 * ema_loss_for_log
            ema_Ll1depth_for_log = 0.4 * Ll1depth + 0.6 * ema_Ll1depth_for_log

            if iteration % 10 == 0:
                progress_bar.set_postfix({"Loss": f"{ema_loss_for_log:.{7}f}"})
                progress_bar.update(10)
            if iteration == opt.iterations:
                progress_bar.close()

            # Save checkpoint at specified iterations
            if (iteration in saving_iterations):
                logger.info(f"[ITER {iteration}] Saving Gaussians")
                scene.save(iteration)

            # Densification
            if iteration < opt.densify_until_iter:
                # Keep track of max radii in image-space for pruning
                gaussians.max_radii2D[visibility_filter] = torch.max(gaussians.max_radii2D[visibility_filter], radii[visibility_filter])
                gaussians.add_densification_stats(viewspace_point_tensor, visibility_filter)

                if iteration > opt.densify_from_iter and iteration % opt.densification_interval == 0:
                    size_threshold = 20 if iteration > opt.opacity_reset_interval else None
                    gaussians.densify_and_prune(opt.densify_grad_threshold, 0.005, scene.cameras_extent, size_threshold, radii)

                if iteration % opt.opacity_reset_interval == 0 or (dataset.white_background and iteration == opt.densify_from_iter):
                    gaussians.reset_opacity()

            # Optimizer step
            if iteration < opt.iterations:
                gaussians.exposure_optimizer.step()
                gaussians.exposure_optimizer.zero_grad(set_to_none=True)
                if use_sparse_adam:
                    visible = radii > 0
                    gaussians.optimizer.step(visible, radii.shape[0])
                    gaussians.optimizer.zero_grad(set_to_none=True)
                else:
                    gaussians.optimizer.step()
                    gaussians.optimizer.zero_grad(set_to_none=True)

            if (iteration in checkpoint_iterations):
                logger.info(f"[ITER {iteration}] Saving Checkpoint")
                torch.save((gaussians.capture(), iteration), scene.model_path + "/chkpnt" + str(iteration) + ".pth")

    # Return path to final ply file
    final_ply = os.path.join(scene.model_path, "point_cloud", f"iteration_{opt.iterations}", "point_cloud.ply")
    if not os.path.exists(final_ply):
        # Fallback to last saved iteration
        # Find latest iteration directory
        iter_dirs = [d for d in os.listdir(os.path.join(scene.model_path, "point_cloud")) if d.startswith("iteration_")]
        if iter_dirs:
            latest = max(iter_dirs, key=lambda x: int(x.split("_")[1]))
            final_ply = os.path.join(scene.model_path, "point_cloud", latest, "point_cloud.ply")
        else:
            # If no saved iterations, save now
            scene.save(opt.iterations)
            final_ply = os.path.join(scene.model_path, "point_cloud", f"iteration_{opt.iterations}", "point_cloud.ply")

    return final_ply

def train_3dgs(source_path, output_path=None, iterations=30000):
    """
    Train 3D Gaussian Splatting model on given source path.

    Args:
        source_path: Path to directory containing 'images' and 'sparse' (COLMAP output)
        output_path: Directory to save model and results. If None, creates a subdirectory under output/
        iterations: Number of training iterations

    Returns:
        Path to generated .ply file
    """
    if not _3DGS_AVAILABLE:
        raise RuntimeError("3DGS modules not available. Ensure 3DGS_Project is accessible.")

    from argparse import ArgumentParser

    # Create parser and add parameter groups
    parser = ArgumentParser()
    model_params = ModelParams(parser, sentinel=False)
    opt_params = OptimizationParams(parser)
    pipe_params = PipelineParams(parser)
    # Add additional arguments that might be needed
    parser.add_argument('--ip', type=str, default="127.0.0.1")
    parser.add_argument('--port', type=int, default=6009)
    parser.add_argument('--debug_from', type=int, default=-1)
    parser.add_argument('--detect_anomaly', action='store_true', default=False)
    parser.add_argument("--test_iterations", nargs="+", type=int, default=[7_000, 30_000])
    parser.add_argument("--save_iterations", nargs="+", type=int, default=[7_000, 30_000])
    parser.add_argument("--quiet", action="store_true")
    parser.add_argument('--disable_viewer', action='store_true', default=True)  # disable viewer
    parser.add_argument("--checkpoint_iterations", nargs="+", type=int, default=[])
    parser.add_argument("--start_checkpoint", type=str, default=None)

    # Parse empty arguments to get defaults
    args = parser.parse_args([])
    # Override critical parameters
    args.source_path = source_path
    args.model_path = output_path
    args.images = "images"
    args.depths = ""
    args.resolution = -1
    args.white_background = False
    args.train_test_exp = False
    args.data_device = "cuda"
    args.eval = False
    args.sh_degree = 3
    args.iterations = iterations
    args.save_iterations = [iterations]
    args.test_iterations = []
    args.checkpoint_iterations = []
    args.start_checkpoint = None
    args.debug_from = -1
    args.disable_viewer = True
    args.optimizer_type = "default"
    args.random_background = False

    # Extract parameter groups
    dataset = model_params.extract(args)
    opt = opt_params.extract(args)
    pipe = pipe_params.extract(args)

    # If output_path is None, generate a unique one
    if output_path is None:
        unique_str = str(uuid.uuid4())[:10]
        output_path = os.path.join("./output/", unique_str)
    os.makedirs(output_path, exist_ok=True)
    dataset.model_path = output_path

    logger.info(f"Starting 3DGS training with source: {source_path}, output: {output_path}")
    logger.info(f"Training for {iterations} iterations")

    # Run training
    final_ply = training(dataset, opt, pipe,
                         testing_iterations=args.test_iterations,
                         saving_iterations=args.save_iterations,
                         checkpoint_iterations=args.checkpoint_iterations,
                         checkpoint=args.start_checkpoint,
                         debug_from=args.debug_from)

    logger.info(f"Training completed. PLY file: {final_ply}")
    return final_ply

if __name__ == "__main__":
    # Simple test
    import sys
    if len(sys.argv) > 1:
        src = sys.argv[1]
    else:
        src = os.path.join(os.environ.get("GS_PROJECT_PATH", "/mnt/c/Users/PC/Desktop/3DGS_Project"), "room")  # example scene
    print(f"Testing with source: {src}")
    try:
        ply = train_3dgs(src, iterations=1000)  # small iteration count for test
        print(f"Generated PLY: {ply}")
    except Exception as e:
        print(f"Error: {e}")