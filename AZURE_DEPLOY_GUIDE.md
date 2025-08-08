# 🌐 Azure Static Web Apps 部署指南

## 步骤1: 创建GitHub仓库 📁

1. 访问 [GitHub](https://github.com) 并登录
2. 点击右上角的 "+" 号，选择 "New repository"
3. 输入仓库名称，例如：`moodboarder-pro`
4. 选择 "Public" 仓库
5. 点击 "Create repository"

## 步骤2: 推送代码到GitHub 🚀

在终端中运行以下命令（替换YOUR_USERNAME和YOUR_REPO_NAME）：

```bash
cd "/Users/hanlu/Desktop/AI moodboard"
git remote add origin https://github.com/YOUR_USERNAME/moodboarder-pro.git
git branch -M main
git push -u origin main
```

## 步骤3: 在Azure创建Static Web App 🔧

### 3.1 登录Azure Portal
- 访问 [https://portal.azure.com](https://portal.azure.com)
- 使用你的Azure账户登录

### 3.2 创建Static Web App
1. 点击 "Create a resource" (创建资源)
2. 搜索 "Static Web Apps"
3. 点击 "Create"

### 3.3 填写基本配置
- **Subscription**: 选择你的Azure订阅
- **Resource Group**: 创建新的，命名为 "moodboarder-rg"
- **Name**: `moodboarder-pro` (或你喜欢的名称)
- **Plan type**: 选择 "Free" 
- **Region**: 选择 "East Asia" 或 "Southeast Asia"

### 3.4 配置GitHub集成
- **Source**: 选择 "GitHub"
- 点击 "Sign in with GitHub" 授权
- **Organization**: 选择你的GitHub用户名
- **Repository**: 选择 `moodboarder-pro`
- **Branch**: `main`

### 3.5 构建配置
- **Build Presets**: 选择 "Custom"
- **App location**: `/`
- **Api location**: 留空
- **Output location**: `/`

### 3.6 完成创建
1. 点击 "Review + create"
2. 检查配置后点击 "Create"
3. 等待部署完成（约3-5分钟）

## 步骤4: 获取你的分享链接 🔗

部署完成后：

1. 在Azure Portal中进入你的Static Web App资源
2. 在 "Overview" 页面找到 "URL" 字段
3. 你的分享链接将类似于：
   ```
   https://moodboarder-pro-abc123.azurestaticapps.net
   ```

## 步骤5: 配置API密钥 🔑

为了让应用正常工作，需要配置环境变量：

1. 在Azure Static Web App页面，点击左侧的 "Configuration"
2. 点击 "Add" 添加以下应用设置：

| 名称 | 值 |
|------|-----|
| `PEXELS_API_KEY` | 你的Pexels API密钥 |
| `GOOGLE_API_KEY` | 你的Google API密钥 |
| `GOOGLE_CX` | 你的Google Custom Search Engine ID |
| `AZURE_OPENAI_API_KEY` | 你的Azure OpenAI API密钥 |
| `AZURE_OPENAI_ENDPOINT` | 你的Azure OpenAI端点 |

## 🎉 完成！

现在你的MoodBoarder Pro已经部署成功！你可以：

- ✅ 分享链接给任何人
- ✅ 在任何设备上访问
- ✅ 享受免费的Azure托管
- ✅ 自动SSL证书
- ✅ 全球CDN加速

## 📱 分享建议

你可以将链接分享到：
- 设计师社区
- LinkedIn专业网络
- 个人作品集网站
- 客户演示
- 团队协作

## 🔄 自动更新

每次你向GitHub仓库推送新代码时，Azure会自动重新部署你的应用！

```bash
git add .
git commit -m "更新功能"
git push
```

## 💡 提示

- 首次部署可能需要5-10分钟
- 如果遇到问题，检查GitHub Actions的构建日志
- 免费计划包含100GB带宽/月，足够个人使用
