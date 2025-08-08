# MoodBoarder Pro - Azure部署指南

这是一个专业的情绪板生成器，集成了Pexels、Pinterest和Azure OpenAI API。

## 🚀 Azure部署步骤

### 1. 准备GitHub仓库
1. 在GitHub上创建一个新的仓库
2. 将本地代码推送到GitHub仓库

### 2. 创建Azure Static Web App
1. 登录 [Azure Portal](https://portal.azure.com)
2. 点击 "Create a resource" (创建资源)
3. 搜索 "Static Web Apps" 并选择
4. 填写基本信息：
   - **Subscription**: 选择你的Azure订阅
   - **Resource Group**: 创建新的或选择现有的
   - **Name**: 为你的应用命名（如：moodboarder-pro）
   - **Plan type**: 选择 "Free" (免费套餐)
   - **Region**: 选择 "East Asia" 或其他离你较近的区域

### 3. 配置GitHub集成
在 "Deployment details" 部分：
- **Source**: 选择 "GitHub"
- **GitHub account**: 授权你的GitHub账户
- **Organization**: 选择你的GitHub用户名
- **Repository**: 选择包含代码的仓库
- **Branch**: 选择 "main" 或 "master"

在 "Build Details" 部分：
- **Build Presets**: 选择 "Custom"
- **App location**: 输入 "/"
- **Api location**: 留空
- **Output location**: 输入 "/"

### 4. 完成部署
1. 点击 "Review + create"
2. 检查配置后点击 "Create"
3. 等待部署完成（约2-3分钟）

### 5. 获取分享链接
部署完成后，你会得到一个类似这样的URL：
```
https://your-app-name.azurestaticapps.net
```

## 🔧 配置API密钥

为了让应用正常工作，你需要在Azure Static Web Apps中配置环境变量：

1. 在Azure Portal中进入你的Static Web App
2. 点击左侧菜单的 "Configuration"
3. 添加以下应用设置：
   - `PEXELS_API_KEY`: 你的Pexels API密钥
   - `GOOGLE_API_KEY`: 你的Google Custom Search API密钥
   - `GOOGLE_CX`: 你的Google Custom Search Engine ID
   - `AZURE_OPENAI_API_KEY`: 你的Azure OpenAI API密钥
   - `AZURE_OPENAI_ENDPOINT`: 你的Azure OpenAI端点URL

## 📱 功能特性

- 🎨 多源图片搜索（Pexels + Pinterest）
- 🤖 AI设计分析（Azure OpenAI）
- 📱 响应式设计
- 🌙 深色/浅色主题切换
- 💾 情绪板下载功能
- ⚡ 高质量图片优化

## 🔗 分享你的应用

部署完成后，你就可以将URL分享给任何人：
- 设计师朋友
- 客户
- 团队成员
- 社交媒体

应用完全免费托管在Azure上，支持全球访问！
