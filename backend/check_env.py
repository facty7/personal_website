import sys
import os

print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

# 尝试导入必要的包
try:
    import gradio
    print(f"Gradio version: {gradio.__version__}")
except Exception as e:
    print(f"Error importing gradio: {e}")

try:
    import torch
    print(f"PyTorch version: {torch.__version__}")
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"CUDA version: {torch.version.cuda}")
except Exception as e:
    print(f"Error importing torch: {e}")

# 检查环境变量
print("\nEnvironment variables:")
for var in ['GRADIO_ANALYTICS_ENABLED', 'GRADIO_SERVER_PORT', 'GS_PROJECT_PATH']:
    value = os.environ.get(var, 'Not set')
    print(f"  {var}: {value}")