# 🎨 MoodBoarder Pro - Figma Plugin

专为 UI/UX 设计师打造的 AI 驱动情绪板生成器 Figma 插件。

## ✨ 功能特性

- 🔍 **智能图片搜索**: 通过 Pexels API 搜索高质量设计图片
- 🖼️ **一键插入 Figma**: 点击缩略图直接插入到 Figma 画布
- 🤖 **AI 设计建议**: 获取基于关键词的设计分析和建议
- 📱 **响应式界面**: 适配 Figma 插件面板的紧凑设计
- 🎯 **快速标签**: 预设计关键词标签，快速开始设计

## 🚀 本地调试步骤

### 1. 准备文件

确保项目目录包含以下文件：
```
/Users/hanlu/Desktop/AI moodboard/
├── manifest.json       # Figma 插件清单
├── code.js             # Figma API 交互代码
├── ui.html             # 插件界面 HTML
├── ui.js               # 插件界面逻辑
└── README.md           # 本文档
```

### 2. 配置 API Key

在 `ui.js` 文件中，确保 Pexels API Key 已正确配置：

```javascript
const CONFIG = {
    PEXELS_API_KEY: 'K41Yre5D4FPEGjAT2dXtiodalKENP5C47qO1JLS5qf9q66AYtJDlKXrK'
    // ... 其他配置
};
```

### 3. 在 Figma 中加载插件

1. 打开 **Figma Desktop** 应用程序
2. 进入任意设计文件或创建新文件
3. 在顶部菜单栏选择 **Plugins** → **Development** → **Import plugin from manifest...**
4. 浏览并选择项目根目录下的 `manifest.json` 文件
5. 点击 **Open** 完成导入

### 4. 运行插件

1. 在 Figma 中，打开 **Plugins** 菜单
2. 在 **Development** 部分找到 "MoodBoarder Pro - Figma Plugin"
3. 点击运行插件

## 📖 使用指南

### 基本功能

1. **搜索图片**
   - 在搜索框中输入设计关键词（至少 3 个字符）
   - 点击 "Search" 按钮或按 Enter 键
   - 等待图片加载完成

2. **插入图片到 Figma**
   - 点击任意缩略图
   - 图片将自动插入到 Figma 画布
   - 插件会创建一个 320×200 的圆角矩形，并应用图片填充

3. **获取设计建议**
   - 搜索图片后，点击 "🤖 Get Design Suggestions" 按钮
   - 查看基于关键词的设计分析和 UI/UX 建议

### 快速开始标签

点击界面中的预设标签快速搜索：
- `minimalist ui` - 极简界面设计
- `dashboard` - 仪表板设计
- `mobile app` - 移动应用界面
- `landing page` - 着陆页设计
- `dark theme` - 深色主题设计

## 🔧 技术架构

### 文件结构和职责

```
├── manifest.json    # 插件配置清单，定义权限和网络访问
├── code.js          # Code 线程 - 与 Figma API 交互，不处理网络请求
├── ui.html          # UI 界面结构
└── ui.js            # UI 线程 - 处理用户交互和网络请求
```

### 线程通信

**UI 线程 → Code 线程**：
```javascript
parent.postMessage({ 
    pluginMessage: { 
        type: 'insert-image', 
        bytes: [/* 图片字节数组 */],
        name: '图片名称',
        source: '图片来源'
    } 
}, '*');
```

**Code 线程 → UI 线程**：
```javascript
figma.ui.postMessage({
    type: 'plugin-ready',
    figmaUser: 'username'
});
```

## 🛠️ 开发说明

### 从网页版迁移的功能

本插件从原 `app.js` 复用了以下功能：

1. **图片搜索逻辑** (`fetchPexelsImages`)
2. **占位图回退机制** (`getPlaceholderImages`)
3. **消息提示系统** (`showMessage`)
4. **UI 状态管理** (`updateButtonStates`)
5. **Mock AI 分析** (`generateMockAnalysis`)
6. **文本格式化** (`formatAnalysisText`)

### 扩展计划

- [ ] 集成 Azure OpenAI API 进行真实的图片分析
- [ ] 添加 Pinterest 和 Google Images 搜索
- [ ] 支持批量图片插入
- [ ] 添加图片尺寸和样式选项
- [ ] 实现本地图片缓存

## 🔍 调试技巧

### 1. 查看控制台日志

- 在 Figma 中按 `Ctrl+Alt+I` (Windows) 或 `Cmd+Option+I` (Mac) 打开开发者工具
- 在 Console 面板查看插件日志

### 2. 重新加载插件

- 修改代码后，在 Figma 中关闭插件
- 重新运行插件以加载最新代码

### 3. 网络请求调试

- 在开发者工具的 Network 面板监控 API 请求
- 检查 Pexels API 响应状态

## ⚠️ 注意事项

1. **API Key 安全**: 
   - 当前 API Key 直接写在代码中，仅适用于开发测试
   - 生产环境请使用代理服务器或环境变量

2. **网络权限**:
   - `manifest.json` 中已配置必要的域名白名单
   - 如需添加新的 API 服务，请更新 `networkAccess.allowedDomains`

3. **Figma 限制**:
   - Code 线程不能发起网络请求
   - UI 线程不能直接操作 Figma API
   - 所有通信必须通过 `postMessage`

## 📄 许可证

MIT License - 详见原项目许可证。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**享受在 Figma 中快速生成设计灵感的乐趣！** 🎨✨
