"""
Simplified Gradio application for local deployment.
Removes FastAPI and other potentially conflicting imports.
"""

import gradio as gr
import tempfile
import os
import shutil
import logging
from PIL import Image

# 引入 ZeroGPU 的装饰器（简化版）
class spaces:
    @staticmethod
    def GPU(*args, **kwargs):
        def decorator(func):
            return func
        # 兼容带参数和不带参数的装饰器调用
        if len(args) == 1 and callable(args[0]):
            return args[0]
        return decorator

# Import handlers (will need to adjust them too)
try:
    from sr_handler import predict_sr
    from gs_handler import train_3dgs
except ImportError as e:
    logging.error(f"Failed to import handlers: {e}")
    # 创建模拟函数用于测试
    def predict_sr(image):
        return image  # 原样返回

    def train_3dgs(img_dir, output_dir, iterations=100):
        # 创建模拟的ply文件
        import uuid
        ply_path = os.path.join(output_dir, f"mock_{uuid.uuid4()[:8]}.ply")
        with open(ply_path, 'w') as f:
            f.write("mock ply file")
        return ply_path

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==========================================
# 核心处理函数
# ==========================================

def sr3_interface(image_path):
    """Gradio interface for SR3 processing."""
    if image_path is None:
        return None, "Please upload an image"

    try:
        logger.info("Received SR request")
        input_image = Image.open(image_path).convert("RGB")

        output_image = predict_sr(image=input_image)

        # 将结果保存为临时文件，返回给前端
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
            output_image.save(f, format='PNG')
            return f.name, "Success"

    except Exception as e:
        logger.error(f"SR Error: {e}")
        return None, f"Error: {str(e)}"

# 给 3DGS 分配 120 秒的最大运行时长
@spaces.GPU(duration=120)
def threedgs_interface(image_paths):
    """Gradio interface for 3DGS processing."""
    if not image_paths or len(image_paths) == 0:
        return None, "Please upload images"

    try:
        logger.info(f"Received 3DGS request with {len(image_paths)} images")

        # 1. 准备临时输入目录
        source_dir = tempfile.mkdtemp(prefix="3dgs_source_")
        img_dir = os.path.join(source_dir, "images")
        os.makedirs(img_dir, exist_ok=True)

        # Gradio 传入的是文件路径列表，复制到训练目录
        for i, img_path in enumerate(image_paths):
            shutil.copy(img_path, os.path.join(img_dir, f"img_{i}.jpg"))

        # 2. 准备临时输出目录
        output_dir = tempfile.mkdtemp(prefix="3dgs_out_")

        # 3. 开始训练
        iterations = int(os.environ.get("GS_ITERATIONS", "100"))
        logger.info(f"Starting fast 3DGS training ({iterations} iterations)...")
        ply_path = train_3dgs(img_dir, output_dir, iterations=iterations)

        return ply_path, "3DGS completed successfully"

    except Exception as e:
        logger.error(f"3DGS Error: {e}")
        return None, f"Error: {str(e)}"

# ==========================================
# Gradio UI 构建
# ==========================================

with gr.Blocks(title="SR3 & 3DGS Processing", analytics_enabled=False) as gradio_app:
    gr.Markdown("# AI Image & 3D Processing Engine")
    gr.Markdown("Local deployment version.")

    with gr.Tab("SR3 Super-Resolution"):
        with gr.Row():
            with gr.Column():
                sr3_input = gr.Image(label="Input Image", type="filepath")
                sr3_button = gr.Button("Process with SR3")
            with gr.Column():
                sr3_output = gr.Image(label="Enhanced Image")
                sr3_status = gr.Textbox(label="Status", interactive=False)

        sr3_button.click(
            fn=sr3_interface,
            inputs=[sr3_input],
            outputs=[sr3_output, sr3_status]
        )

    with gr.Tab("3DGS 3D Reconstruction"):
        gr.Markdown("⚠️ Note: Iterations limited to 100 by default.")
        with gr.Row():
            with gr.Column():
                threedgs_input = gr.File(label="Input Images", file_count="multiple", type="filepath")
                threedgs_button = gr.Button("Fast Process with 3DGS")
            with gr.Column():
                threedgs_output = gr.File(label="Download .ply file")
                threedgs_status = gr.Textbox(label="Status", interactive=False)

        threedgs_button.click(
            fn=threedgs_interface,
            inputs=[threedgs_input],
            outputs=[threedgs_output, threedgs_status]
        )

if __name__ == "__main__":
    import socket
    import sys

    # 设置环境变量
    os.environ['GRADIO_ANALYTICS_ENABLED'] = 'False'

    # 尝试不同的端口
    for port in [7860, 7861, 7862, 7863]:
        try:
            # 检查端口
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()

            if result == 0:
                print(f"Port {port} busy, trying next...")
                continue

            print(f"Launching on port {port}")

            # 最简单的启动配置
            gradio_app.launch(
                server_name="127.0.0.1",
                server_port=port,
                share=False,
                show_error=True,
                quiet=True,
                show_api=False,
                enable_queue=False,
                inbrowser=False
            )
            break

        except Exception as e:
            print(f"Failed on port {port}: {e}")

            if port == 7863:  # 最后一次尝试
                print("All ports failed. Trying with 0.0.0.0...")
                try:
                    gradio_app.launch(
                        server_name="0.0.0.0",
                        server_port=port,
                        share=False,
                        show_api=False
                    )
                except Exception as final_error:
                    print(f"Final attempt failed: {final_error}")
                    sys.exit(1)