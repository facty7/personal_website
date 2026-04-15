# 部署前端到 Vercel 免费白嫖教程

## 一、Vercel 能白嫖到什么

| 资源 | 免费版额度 |
|------|-----------|
| 域名 | `your-project.vercel.app`（免费二级域名，可自定义前缀） |
| 带宽 | 100 GB/月 |
| Serverless 函数执行 | 100 GB-Hrs/月 |
| 自定义域名 | 支持绑定自己的域名 |
| HTTPS | 自动签发 |
| 构建次数 | 无限 |
| 团队项目 | 免费版只能个人项目 |

## 二、关于域名

Vercel 默认给你一个 `xxx.vercel.app` 的免费域名，**xxx 可以随便取**，只要没被占用。比如：
- `my-ai-studio.vercel.app`
- `sr3-3dgs.vercel.app`
- `myname-super-res.vercel.app`

如果你想用自己的域名（如 `mywebsite.com`），Vercel 免费版也支持，但需要你**自己花钱购买域名**（推荐 Namecheap、Cloudflare，每年约 $10）。

## 三、部署步骤

### 第 1 步：把代码推送到 GitHub

Vercel 需要从 GitHub 拉取代码。

```bash
cd C:\Users\PC\Desktop\person_web

# 初始化 git（如果还没初始化）
git init

# 创建 .gitignore
# 在根目录创建 .gitignore 文件，内容如下：
node_modules/
.next/
.env
.env.local
backend/__pycache__/
backend/outputs/
*.pyc
```

```bash
# 添加文件
git add .

# 提交
git commit -m "init: SR3 & 3DGS personal website"

# 去 GitHub 创建一个新仓库，然后关联
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 第 2 步：注册 Vercel

1. 打开 https://vercel.com
2. 点击 **Sign Up**，用 GitHub 账号登录
3. 免费版就够了，不需要升级

### 第 3 步：导入项目

1. 登录 Vercel 后，点击 **Add New...** → **Project**
2. 选择你刚才推送的 GitHub 仓库
3. Vercel 会自动识别这是一个 Next.js 项目

### 第 4 步：配置项目

在部署页面，需要设置以下：

**Framework Preset**: Next.js（自动识别）

**Root Directory**: 点击 Edit，改为 `frontend`（因为你的前端代码在 frontend 目录下）

**Environment Variables**: 添加以下变量

| Key | Value | 说明 |
|-----|-------|------|
| `NEXT_PUBLIC_BACKEND_URL` | `http://你的内网穿透地址` | 后端 API 地址，见下方说明 |

> **重要**: `NEXT_PUBLIC_BACKEND_URL` 必须指向你的后端服务。
> - 如果你用 WSL + 内网穿透（如 frp、ngrok），填入穿透后的公网地址，例如 `https://xxx.ngrok-free.app`
> - 如果后端部署在同一台 Vercel 上（不推荐，Vercel 不支持长时间运行的 Python 服务），则不适用

### 第 5 步：部署

1. 点击 **Deploy**
2. 等待 1-3 分钟，构建完成后访问 Vercel 给你的域名

## 四、自定义 Vercel 二级域名

部署成功后，Vercel 会给你一个随机域名如 `person-web-abc123.vercel.app`。你可以改成自己喜欢的：

1. 进入项目 → **Settings** → **Domains**
2. 点击当前的域名，点击编辑
3. 改成你想要的名字，比如 `myname-studio.vercel.app`
4. 只要这个名字没被占用就能用

## 五、内网穿透方案（配合 Vercel 前端）

Vercel 前端需要能访问到你本地运行的 Python 后端。几种方案：

### 方案 A：ngrok（最简单，免费）

```bash
# 下载 ngrok: https://ngrok.com/download
# 注册账号获取 auth token
ngrok config add-authtoken YOUR_TOKEN
ngrok http 7860
```

ngrok 会给你一个类似 `https://xxxx.ngrok-free.app` 的地址，填入 `NEXT_PUBLIC_BACKEND_URL`。

### 方案 B：Cloudflare Tunnel（免费，更稳定）

```bash
# 安装 cloudflared
# 创建隧道
cloudflared tunnel --url http://localhost:7860
```

会给你一个 `https://xxx-xxx-xxx.trycloudflare.com` 地址。

### 方案 C：frp（需要有自己的 VPS）

如果你有云服务器，可以自建 frp 穿透，地址完全自定义。

## 六、更新部署

每次 push 代码到 GitHub 的 main 分支，Vercel 会**自动重新部署**，无需手动操作。

```bash
git add .
git commit -m "update: your changes"
git push
```

## 七、注意事项

1. **后端服务必须保持运行** — Vercel 只托管前端，你的 WSL 后端需要一直开着
2. **免费 ngrok 地址会变化** — 每次重启 ngrok 地址会变，需要更新 Vercel 环境变量
3. **Vercel 免费版限制** — 100GB 带宽对个人网站绰绰有余
4. **构建失败排查** — Vercel → Project → Deployments → 点击失败的构建 → 查看 Build Logs
