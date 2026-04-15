@echo off
echo 正在配置网络代理...
set HTTPS_PROXY=http://127.0.0.1:7890
set HTTP_PROXY=http://127.0.0.1:7890

echo 正在启动 Claude Code (Qwen模型)...
npx @anthropic-ai/claude-code 

pause