import gradio as gr
import socket
import sys

# 创建一个简单的Gradio应用
with gr.Blocks() as demo:
    gr.Markdown("# Simple Test")
    input_text = gr.Textbox(label="Input")
    output_text = gr.Textbox(label="Output")

    def echo(text):
        return f"You said: {text}"

    input_text.change(echo, inputs=[input_text], outputs=[output_text])

if __name__ == "__main__":
    # 尝试不同的端口
    ports_to_try = [7860, 7861, 7862, 7863, 7864]

    for port in ports_to_try:
        try:
            # 检查端口是否可用
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex(('127.0.0.1', port))
            sock.close()

            if result == 0:
                print(f"Port {port} is already in use, trying next...")
                continue

            print(f"Attempting to launch simple Gradio on port {port}")
            demo.launch(
                share=False,
                server_name="127.0.0.1",
                server_port=port,
                show_error=True,
                quiet=False,
                show_api=False  # 禁用API显示
            )
            break  # 如果成功启动，退出循环

        except Exception as e:
            print(f"Failed to launch on port {port}: {e}")
            if port == ports_to_try[-1]:
                print("All ports failed.")
                sys.exit(1)