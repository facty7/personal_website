#!/usr/bin/env python3
"""
Minimal test to check if Gradio can launch at all.
"""

import os
# 禁用所有分析功能
os.environ['GRADIO_ANALYTICS_ENABLED'] = 'False'
os.environ['HF_HUB_DISABLE_TELEMETRY'] = '1'

import gradio as gr

print(f"Gradio version: {gr.__version__}")

# 最简单的应用
def echo(text):
    return text

# 创建界面 - 不使用Blocks，使用Interface
demo = gr.Interface(
    fn=echo,
    inputs=gr.Textbox(label="Input"),
    outputs=gr.Textbox(label="Output"),
    title="Test Echo",
    analytics_enabled=False
)

print("Attempting to launch...")

# 尝试不同的配置
configs = [
    {"name": "Basic local", "server_name": "127.0.0.1", "server_port": 7860, "share": False},
    {"name": "All interfaces", "server_name": "0.0.0.0", "server_port": 7861, "share": False},
    {"name": "With share", "server_name": "127.0.0.1", "server_port": 7862, "share": True},
]

for config in configs:
    print(f"\nTrying {config['name']}...")
    try:
        demo.launch(
            server_name=config['server_name'],
            server_port=config['server_port'],
            share=config['share'],
            show_error=True,
            quiet=False,
            show_api=False,  # 关键：禁用API
            enable_queue=False,
            inbrowser=False,
            max_threads=1
        )
        break  # 成功则退出
    except Exception as e:
        print(f"  Failed: {e}")
        continue

print("\n如果所有尝试都失败，可能是Gradio安装问题。")
print("尝试: pip install --upgrade gradio")
print("或: pip install gradio==3.50.2")