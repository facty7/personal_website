#!/usr/bin/env python3
"""
Alternative launcher for the Gradio app with multiple fallback strategies.
"""

import os
import sys
import socket
import time

# 禁用Gradio分析
os.environ['GRADIO_ANALYTICS_ENABLED'] = 'False'

# 添加当前目录到路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 尝试导入
try:
    from app import gradio_app
    print("Successfully imported gradio_app")
except Exception as e:
    print(f"Error importing app: {e}")
    sys.exit(1)

def is_port_available(port, host='127.0.0.1'):
    """检查端口是否可用"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((host, port))
        sock.close()
        return result != 0
    except Exception:
        return False

def try_launch(config_name, config):
    """尝试启动应用"""
    print(f"\n=== Trying config: {config_name} ===")
    print(f"Config: {config}")

    try:
        gradio_app.launch(**config)
        return True
    except Exception as e:
        print(f"Config {config_name} failed: {e}")
        return False

def main():
    """主函数"""
    # 可用的端口
    base_port = 7860
    max_attempts = 5

    # 不同的配置策略
    configs = [
        {
            "name": "Minimal local",
            "config": {
                "share": False,
                "server_name": "127.0.0.1",
                "server_port": base_port,
                "show_error": True,
                "quiet": True,
                "show_api": False,
                "enable_queue": False,
                "inbrowser": False,
                "show_tips": False,
                "debug": False
            }
        },
        {
            "name": "All interfaces",
            "config": {
                "share": False,
                "server_name": "0.0.0.0",
                "server_port": base_port,
                "show_error": True,
                "quiet": True,
                "show_api": False,
                "enable_queue": False
            }
        },
        {
            "name": "With share enabled",
            "config": {
                "share": True,
                "server_name": "127.0.0.1",
                "server_port": base_port,
                "show_error": True,
                "quiet": True,
                "show_api": False
            }
        },
        {
            "name": "Very minimal",
            "config": {
                "share": False,
                "server_name": "127.0.0.1",
                "server_port": base_port,
                "inbrowser": False,
                "show_tips": False
            }
        }
    ]

    # 尝试不同的端口
    for attempt in range(max_attempts):
        port = base_port + attempt

        if not is_port_available(port):
            print(f"Port {port} is not available, trying next...")
            continue

        print(f"\n=== Attempting port {port} ===")

        # 为每个配置设置端口
        for config_item in configs:
            config_item["config"]["server_port"] = port

            # 如果是WSL环境，尝试使用0.0.0.0
            if "WSL" in os.uname().release or "microsoft" in os.uname().release.lower():
                config_item["config"]["server_name"] = "0.0.0.0"
                print("Detected WSL environment, using 0.0.0.0")

            if try_launch(config_item["name"], config_item["config"]):
                return

    print("\n=== All attempts failed ===")
    print("Please try the following:")
    print("1. Update gradio: pip install --upgrade gradio")
    print("2. Or downgrade gradio: pip install gradio==3.50.2")
    print("3. Check firewall settings")
    print("4. Try running as administrator")

    # 最后尝试使用uvicorn直接运行
    print("\n=== Trying uvicorn fallback ===")
    try:
        import uvicorn
        print("Starting with uvicorn directly...")

        # 我们需要将Gradio应用转换为FastAPI应用
        # 首先尝试获取FastAPI应用
        fastapi_app = None
        try:
            # 检查app.py中是否有FastAPI应用
            import app
            if hasattr(app, 'app'):
                fastapi_app = app.app
        except:
            pass

        if fastapi_app:
            uvicorn.run(fastapi_app, host="127.0.0.1", port=8000, log_level="info")
        else:
            print("No FastAPI app found, cannot use uvicorn fallback.")
            sys.exit(1)

    except Exception as e:
        print(f"Uvicorn fallback also failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()