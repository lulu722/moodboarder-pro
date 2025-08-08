# 🎨 MoodBoarder Pro

一个专业的UI/UX设计师情绪板生成器，集成多个图片源和AI分析功能。

![MoodBoarder Pro](https://img.shields.io/badge/Status-Ready%20for%20Deployment-brightgreen)
![Azure](https://img.shields.io/badge/Deploy-Azure%20Static%20Web%20Apps-blue)
![JavaScript](https://img.shields.io/badge/Built%20with-Vanilla%20JavaScript-yellow)

## ✨ 功能特性

- 🔍 **多源图片搜索**: 集成Pexels和Pinterest API
- 🤖 **AI设计分析**: 使用Azure OpenAI分析设计趋势和色彩搭配
- 🎨 **智能情绪板**: 自动生成专业级设计情绪板
- 📱 **响应式设计**: 完美适配桌面和移动设备
- 🌙 **主题切换**: 支持深色和浅色主题
- 💾 **一键下载**: 将情绪板保存为高质量图片
- ⚡ **图片优化**: 高分辨率图片加载和显示优化

## 🚀 在线体验

访问部署后的应用：`https://your-app-name.azurestaticapps.net`

## 📋 本地运行

1. 克隆仓库
```bash
git clone https://github.com/your-username/moodboarder-pro.git
cd moodboarder-pro
```

2. 启动本地服务器
```bash
python3 -m http.server 8000
```

3. 在浏览器中访问 `http://localhost:8000`

## 🔧 API配置

在 `app.js` 中配置你的API密钥：

```javascript
const CONFIG = {
    PEXELS_API_KEY: 'your-pexels-api-key',
    GOOGLE_API_KEY: 'your-google-api-key',
    GOOGLE_CX: 'your-custom-search-engine-id',
    AZURE_OPENAI: {
        API_KEY: 'your-azure-openai-key',
        ENDPOINT: 'your-azure-openai-endpoint',
        DEPLOYMENT_NAME: 'your-deployment-name'
    }
};
```

## 🌐 Azure部署

查看 [DEPLOY.md](./DEPLOY.md) 获取详细的Azure部署指南。

快速部署：
```bash
./deploy.sh
```

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **图片源**: Pexels API, Google Custom Search API (Pinterest)
- **AI服务**: Azure OpenAI GPT模型
- **部署**: Azure Static Web Apps
- **版本控制**: Git + GitHub

## 📸 使用截图

### 主界面
- 简洁的搜索界面
- 实时图片加载
- 智能关键词建议

### 情绪板生成
- 网格布局显示
- 高质量图片渲染
- 流畅的加载动画

### AI分析
- 专业设计分析
- 色彩趋势建议
- 设计元素识别

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 作者

专为UI/UX设计师打造的专业工具

---

**立即部署到Azure，获得你的专属分享链接！** 🚀
