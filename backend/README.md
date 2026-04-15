---
title: AI Image Processing
emoji: 🖼️
colorFrom: blue
colorTo: purple
sdk: gradio
pinned: false
license: mit
---

# AI Image Processing (AI 图像处理与 3D 重建平台)

本项目提供基于 **Swin2SR** 的图像超分辨率增强，以及基于 **3DGS (3D Gaussian Splatting)** 的三维重建服务。支持 API 调用与可视化网页端（Web UI）操作。

---

## 🖥️ 网页版操作指南 (Web UI Guide)

项目启动后，可以在浏览器中访问 `/ui` 路径（如果你部署在 Hugging Face Spaces，主页默认就是该界面）进入可视化操作后台。

### 功能一：Swin2SR 图像超分辨率 (Image Super-Resolution)
1. **进入面板**：在页面顶部点击 `SR3 Super-Resolution` 选项卡。
2. **上传图片**：在左侧 `Input Image` 区域点击上传你需要处理的低分辨率图片。
3. **开始处理**：点击 `Process with SR3` 按钮。
4. **获取结果**：等待几秒钟（Swin2SR 处理速度极快），右侧 `Enhanced Image` 区域会自动展示高清放大后的图片，你可以直接右键另存为。

### 功能二：3DGS 三维高斯重建 (3D Gaussian Splatting)
1. **进入面板**：在页面顶部点击 `3DGS 3D Reconstruction` 选项卡。
2. **上传图集**：在左侧 `Input Images` 区域，批量上传针对同一物体/场景拍摄的多角度照片序列。
3. **提交任务**：点击 `Process with 3DGS` 按钮。
4. **后台排队与下载**：
   - 由于 3D 训练耗时较长（可能需要几分钟到几十分钟），系统会将任务放入后台队列，并在右侧 `Status` 框内返回一个 **Task ID** 和**状态查询链接**。
   - 训练完成后，点击右侧的 `Download .ply file` 即可下载生成的 3D 点云文件。

---

## 🚀 部署与运行说明 (Deployment)

### 1. 本地运行测试
确保你已经安装了所需的环境依赖（如 `transformers`, `torch`, `fastapi`, `gradio`, `uvicorn` 等）。

在项目根目录下，打开终端运行：
```bash
uvicorn app:app --host 0.0.0.0 --port 7860