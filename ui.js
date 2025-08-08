// ===========================================
// MoodBoarder Pro Figma 插件 UI 逻辑
// 职责：处理用户交互，发起网络请求，与 Code 线程通信
// 从原 app.js 复用：图片搜索、消息提示、占位图逻辑等
// ===========================================

// 从原项目复用的配置
const CONFIG = {
    // Pexels API 配置 - 使用你的真实 API Key
    PEXELS_API_KEY: 'K41Yre5D4FPEGjAT2dXtiodalKENP5C47qO1JLS5qf9q66AYtJDlKXrK', // 你的 Pexels API Key
    
    // 图片搜索设置
    IMAGES_PER_REQUEST: 12, // 每次搜索返回的图片数量
    
    // 占位图片 - 复用原项目的高质量占位图
    PLACEHOLDER_IMAGES: [
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    ]
};

// 应用状态管理 - 复用原项目的状态结构
let appState = {
    currentImages: [],
    currentKeywords: '',
    isSearching: false,
    isAnalyzing: false,
    figmaReady: false
};

// DOM 元素引用
const elements = {
    keywordInput: document.getElementById('keywordInput'),
    searchBtn: document.getElementById('searchBtn'),
    imageGrid: document.getElementById('imageGrid'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    messageContainer: document.getElementById('messageContainer'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analysisResult: document.getElementById('analysisResult'),
    closeBtn: document.getElementById('closeBtn')
};

// ===========================================
// 初始化和事件监听
// ===========================================

document.addEventListener('DOMContentLoaded', function() {
    initializePlugin();
    attachEventListeners();
    showEmptyState();
});

function initializePlugin() {
    console.log('🎨 MoodBoarder Pro UI 初始化');
    
    // 检查 API 配置状态
    if (CONFIG.PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
        showMessage('⚠️ Pexels API key not configured, using placeholder images', 'warning');
    }
}

function attachEventListeners() {
    // 搜索功能
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.keywordInput.addEventListener('keypress', handleKeywordKeyPress);
    elements.keywordInput.addEventListener('input', handleInputValidation);
    
    // 搜索建议标签
    document.querySelectorAll('.suggestion-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const keyword = tag.dataset.keyword;
            elements.keywordInput.value = keyword;
            handleSearch();
        });
    });
    
    // 分析功能
    elements.analyzeBtn.addEventListener('click', handleAnalyze);
    
    // 关闭插件
    elements.closeBtn.addEventListener('click', () => {
        sendMessageToCode({ type: 'close-plugin' });
    });
}

// ===========================================
// 事件处理函数 - 复用原项目逻辑
// ===========================================

function handleKeywordKeyPress(event) {
    if (event.key === 'Enter' && !appState.isSearching) {
        handleSearch();
    }
}

function handleInputValidation() {
    const keywords = elements.keywordInput.value.trim();
    const isValid = keywords.length >= 3 && !appState.isSearching;
    elements.searchBtn.disabled = !isValid;
    
    // 更新搜索按钮文本
    const btnText = elements.searchBtn.querySelector('.btn-text');
    if (btnText) {
        btnText.textContent = appState.isSearching ? 'Searching...' : 'Search';
    }
}

async function handleSearch() {
    const keywords = elements.keywordInput.value.trim();
    
    if (!keywords || keywords.length < 3) {
        showMessage('Please enter at least 3 characters', 'error');
        return;
    }
    
    appState.currentKeywords = keywords;
    appState.isSearching = true;
    
    // 更新 UI 状态
    showLoadingState();
    updateButtonStates();
    
    try {
        // 搜索图片
        const images = await searchImages(keywords);
        
        if (images.length === 0) {
            throw new Error('No images found for the given keywords');
        }
        
        appState.currentImages = images;
        displayImageGrid(images);
        showMessage(`✅ Found ${images.length} images for "${keywords}"`, 'success');
        
    } catch (error) {
        console.error('搜索失败:', error);
        showMessage(`Search failed: ${error.message}`, 'error');
        showEmptyState();
    } finally {
        appState.isSearching = false;
        hideLoadingState();
        updateButtonStates();
    }
}

async function handleAnalyze() {
    if (appState.currentImages.length === 0) {
        showMessage('Please search for images first', 'error');
        return;
    }
    
    appState.isAnalyzing = true;
    updateButtonStates();
    
    try {
        // 使用 Mock 分析 - 复用原项目的 Mock 逻辑
        const analysis = generateMockAnalysis(appState.currentKeywords);
        displayAnalysis(analysis);
        showMessage('🤖 Design analysis completed!', 'success');
        
    } catch (error) {
        console.error('分析失败:', error);
        showMessage(`Analysis failed: ${error.message}`, 'error');
    } finally {
        appState.isAnalyzing = false;
        updateButtonStates();
    }
}

// ===========================================
// 图片搜索功能 - 复用和改进原项目逻辑
// ===========================================

async function searchImages(keywords) {
    console.log(`🔍 搜索图片: "${keywords}"`);
    
    // 优先尝试 Pexels API
    if (CONFIG.PEXELS_API_KEY !== 'YOUR_PEXELS_API_KEY_HERE') {
        try {
            const pexelsImages = await fetchPexelsImages(keywords);
            if (pexelsImages.length > 0) {
                return pexelsImages;
            }
        } catch (error) {
            console.warn('Pexels API 请求失败，使用占位图:', error);
        }
    }
    
    // 回退到占位图
    return getPlaceholderImages(keywords);
}

async function fetchPexelsImages(keywords) {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=${CONFIG.IMAGES_PER_REQUEST}&orientation=landscape`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': CONFIG.PEXELS_API_KEY
        }
    });
    
    if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.photos.map(photo => ({
        id: `pexels-${photo.id}`,
        url: photo.src.original, // 原始高清图片
        thumbnail: photo.src.medium, // 缩略图
        source: 'Pexels',
        photographer: photo.photographer,
        title: photo.alt || keywords,
        width: photo.width,
        height: photo.height
    }));
}

function getPlaceholderImages(keywords) {
    // 复用原项目的占位图逻辑
    const placeholders = [];
    const baseImages = CONFIG.PLACEHOLDER_IMAGES;
    
    for (let i = 0; i < CONFIG.IMAGES_PER_REQUEST && i < baseImages.length; i++) {
        placeholders.push({
            id: `placeholder-${i}`,
            url: baseImages[i],
            thumbnail: baseImages[i],
            source: 'Placeholder',
            photographer: 'Demo Image',
            title: `${keywords} inspiration ${i + 1}`,
            width: 800,
            height: 600
        });
    }
    
    return placeholders;
}

// ===========================================
// UI 显示函数 - 复用原项目组件逻辑
// ===========================================

function displayImageGrid(images) {
    elements.imageGrid.innerHTML = '';
    elements.emptyState.style.display = 'none';
    elements.imageGrid.style.display = 'grid';
    
    images.forEach((image, index) => {
        const imageElement = createImageElement(image, index);
        elements.imageGrid.appendChild(imageElement);
    });
}

function createImageElement(image, index) {
    // 创建图片容器
    const container = document.createElement('div');
    container.className = 'image-item';
    container.setAttribute('data-image-id', image.id);
    
    // 创建骨架屏
    const skeleton = document.createElement('div');
    skeleton.className = 'image-skeleton';
    container.appendChild(skeleton);
    
    // 创建图片元素
    const img = document.createElement('img');
    img.alt = image.title || `${appState.currentKeywords} inspiration ${index + 1}`;
    img.loading = 'lazy';
    
    // 图片加载完成处理
    img.onload = function() {
        skeleton.remove();
        img.style.opacity = '1';
    };
    
    // 图片加载失败处理
    img.onerror = function() {
        skeleton.remove();
        container.classList.add('image-error');
        img.alt = 'Failed to load image';
    };
    
    // 设置图片源
    img.src = image.thumbnail;
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    // 创建覆盖层信息
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    
    const source = document.createElement('div');
    source.className = 'image-source';
    source.textContent = image.source;
    overlay.appendChild(source);
    
    if (image.photographer && image.photographer !== 'Demo Image') {
        const photographer = document.createElement('div');
        photographer.className = 'image-photographer';
        photographer.textContent = `by ${image.photographer}`;
        overlay.appendChild(photographer);
    }
    
    // 添加点击事件 - 插入图片到 Figma
    container.addEventListener('click', async () => {
        await insertImageToFigma(image);
    });
    
    container.appendChild(img);
    container.appendChild(overlay);
    
    return container;
}

// ===========================================
// Figma 集成 - 图片插入功能
// ===========================================

async function insertImageToFigma(image) {
    try {
        showMessage('📥 Downloading image...', 'info');
        
        // 获取高清图片数据
        const response = await fetch(image.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }
        
        // 转换为字节数组
        const arrayBuffer = await response.arrayBuffer();
        const bytes = Array.from(new Uint8Array(arrayBuffer));
        
        // 发送给 Code 线程处理
        sendMessageToCode({
            type: 'insert-image',
            bytes: bytes,
            name: image.title,
            source: image.source,
            photographer: image.photographer
        });
        
        showMessage(`✅ Inserted "${image.title}" to Figma`, 'success');
        
    } catch (error) {
        console.error('插入图片失败:', error);
        showMessage(`Failed to insert image: ${error.message}`, 'error');
    }
}

// ===========================================
// AI 分析功能 - 复用原项目 Mock 逻辑
// ===========================================

function generateMockAnalysis(keywords) {
    // 复用原项目的 Mock 分析逻辑
    return `
## 🎨 Visual Theme Summary

Based on your search for "${keywords}", this collection presents a cohesive design direction that emphasizes modern UI principles and user-centered design.

## 💡 UI Design Recommendations

**Color & Visual Hierarchy:**
- Use a sophisticated neutral palette with strategic accent colors
- Maintain high contrast ratios for accessibility (4.5:1 minimum)  
- Consider using color psychology to enhance user experience

**Layout & Spacing:**
- Implement consistent grid systems for visual harmony
- Use generous white space for better readability
- Create clear visual hierarchies with size and positioning

**Component Design:**
- Design interactive elements with clear feedback states
- Use subtle shadows and modern styling techniques
- Ensure components are reusable and scalable

**Typography & Content:**
- Choose readable, modern typefaces
- Establish consistent typography scales
- Balance text density with visual breathing room

## 🚀 Implementation Tips

1. **Create a design system** - Establish consistent patterns before building
2. **Focus on user needs** - Design with your target audience in mind  
3. **Test and iterate** - Validate designs with real users when possible

---
*📝 This is a mock analysis. Configure Azure OpenAI API for AI-powered insights based on actual image content.*
    `;
}

function displayAnalysis(analysisText) {
    // 复用原项目的文本格式化逻辑
    const formattedText = formatAnalysisText(analysisText);
    elements.analysisResult.innerHTML = formattedText;
    elements.analysisResult.style.display = 'block';
}

function formatAnalysisText(text) {
    // 复用原项目的 Markdown 转 HTML 逻辑
    return text
        .replace(/## (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
}

// ===========================================
// UI 状态管理 - 复用原项目 UI 逻辑
// ===========================================

function showLoadingState() {
    elements.loadingState.style.display = 'block';
    elements.imageGrid.style.display = 'none';
    elements.emptyState.style.display = 'none';
}

function hideLoadingState() {
    elements.loadingState.style.display = 'none';
}

function showEmptyState() {
    elements.emptyState.style.display = 'block';
    elements.imageGrid.style.display = 'none';
    elements.loadingState.style.display = 'none';
}

function updateButtonStates() {
    // 搜索按钮状态
    elements.searchBtn.disabled = appState.isSearching;
    const btnText = elements.searchBtn.querySelector('.btn-text');
    if (btnText) {
        btnText.textContent = appState.isSearching ? 'Searching...' : 'Search';
    }
    
    // 分析按钮状态
    elements.analyzeBtn.disabled = appState.isAnalyzing || appState.currentImages.length === 0;
    elements.analyzeBtn.textContent = appState.isAnalyzing ? 
        '🔄 Analyzing...' : '🤖 Get Design Suggestions';
}

function showMessage(message, type = 'success') {
    // 复用原项目的消息提示逻辑
    const messageEl = elements.messageContainer;
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // 自动隐藏消息
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 3000);
}

// ===========================================
// 与 Code 线程通信
// ===========================================

function sendMessageToCode(message) {
    parent.postMessage({ pluginMessage: message }, '*');
}

// 监听来自 Code 线程的消息
window.addEventListener('message', (event) => {
    const msg = event.data.pluginMessage;
    if (!msg) return;
    
    console.log('UI 线程收到消息:', msg.type);
    
    switch (msg.type) {
        case 'plugin-ready':
            appState.figmaReady = true;
            console.log('Figma 插件已就绪:', msg);
            break;
            
        default:
            console.log('未处理的消息:', msg);
    }
});

// ===========================================
// 工具函数
// ===========================================

// 防抖函数 - 优化搜索体验
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 错误处理
window.addEventListener('error', function(event) {
    console.error('UI 线程全局错误:', event.error);
    showMessage('An unexpected error occurred. Please try again.', 'error');
});

console.log('🎨 MoodBoarder Pro UI 加载完成');
