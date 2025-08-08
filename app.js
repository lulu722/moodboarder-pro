/**
 * MoodBoarder Pro - JavaScript Application
 * AI-powered visual moodboard generator for UI/UX designers
 * 
 * Features:
 * - Multi-source image fetching (Pexels API + placeholder for Pinterest/Dribbble)
 * - AI-powered design analysis using OpenAI API
 * - Moodboard download functionality
 * - Theme switching (light/dark mode)
 * - Responsive image grid with hover effects
 */

// ====================================
// Configuration & API Keys
// ====================================

const CONFIG = {
    // TODO: Add your Pexels API key here
    // Get it from: https://www.pexels.com/api/
    PEXELS_API_KEY: 'YOUR_PEXELS_API_KEY_HERE',
    
    // TODO: Configure your Azure OpenAI API settings
    // Replace with your Azure OpenAI resource details
    AZURE_OPENAI_API_KEY: 'YOUR_AZURE_OPENAI_API_KEY_HERE',
    AZURE_OPENAI_RESOURCE_NAME: 'YOUR_RESOURCE_NAME', // Your Azure OpenAI resource name
    AZURE_OPENAI_DEPLOYMENT_NAME: 'YOUR_DEPLOYMENT_NAME', // Your deployment name
    AZURE_OPENAI_API_VERSION: '2023-05-15',
    
    // TODO: Add your Google Custom Search API credentials
    // Get API key from: https://developers.google.com/custom-search/v1/introduction
    // Create Custom Search Engine at: https://cse.google.com/cse/
    GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY',
    GOOGLE_CSE_ID: 'YOUR_CUSTOM_SEARCH_ENGINE_ID',
    
    // Image search settings
    IMAGES_PER_SOURCE: 4, // Images from each source (Pexels, Pinterest, Dribbble)
    TOTAL_IMAGES: 12,     // Total images in moodboard
    
    // Placeholder image sources for development - 使用更高质量的图片
    PLACEHOLDER_IMAGES: [
        'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80'
    ]
};

// ====================================
// Global State Management  
// ====================================

let appState = {
    currentImages: [],
    currentKeywords: '',
    isGenerating: false,
    isAnalyzing: false,
    currentTheme: localStorage.getItem('theme') || 'light'
};

// ====================================
// DOM Elements
// ====================================

const elements = {
    keywordInput: document.getElementById('keywordInput'),
    generateBtn: document.getElementById('generateBtn'),
    moodboardGrid: document.getElementById('moodboardGrid'),
    loadingState: document.getElementById('loadingState'),
    actionsSection: document.getElementById('actionsSection'),
    downloadBtn: document.getElementById('downloadBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    analysisPanel: document.getElementById('analysisPanel'),
    analysisContent: document.getElementById('analysisContent'),
    analysisLoading: document.getElementById('analysisLoading'),
    downloadAnalysisBtn: document.getElementById('downloadAnalysisBtn'),
    themeToggle: document.getElementById('themeToggle'),
    messageContainer: document.getElementById('messageContainer')
};

// ====================================
// Initialization
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    attachEventListeners();
    applyTheme(appState.currentTheme);
});

function initializeApp() {
    console.log('🎨 MoodBoarder Pro initialized');
    
    // Check API key configuration
    if (CONFIG.PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
        showMessage('⚠️ Please configure your Pexels API key in app.js', 'error');
    }
    
    if (CONFIG.AZURE_OPENAI_API_KEY === 'YOUR_AZURE_OPENAI_API_KEY_HERE' || 
        CONFIG.AZURE_OPENAI_RESOURCE_NAME === 'YOUR_RESOURCE_NAME' ||
        CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME === 'YOUR_DEPLOYMENT_NAME') {
        showMessage('⚠️ Please configure your Azure OpenAI API credentials in app.js for AI analysis', 'error');
    }
    
    if (CONFIG.GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY' || CONFIG.GOOGLE_CSE_ID === 'YOUR_CUSTOM_SEARCH_ENGINE_ID') {
        showMessage('⚠️ Please configure your Google Custom Search API credentials in app.js for Pinterest integration', 'error');
    }
}

function attachEventListeners() {
    // Main functionality
    elements.generateBtn.addEventListener('click', handleGenerateMoodboard);
    elements.keywordInput.addEventListener('keypress', handleKeywordKeyPress);
    elements.downloadBtn.addEventListener('click', handleDownloadMoodboard);
    elements.analyzeBtn.addEventListener('click', handleAnalyzeMoodboard);
    elements.downloadAnalysisBtn.addEventListener('click', handleDownloadAnalysis);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', handleThemeToggle);
    
    // Input validation
    elements.keywordInput.addEventListener('input', handleInputValidation);
}

// ====================================
// Event Handlers
// ====================================

function handleKeywordKeyPress(event) {
    if (event.key === 'Enter' && !appState.isGenerating) {
        handleGenerateMoodboard();
    }
}

function handleInputValidation() {
    const keywords = elements.keywordInput.value.trim();
    elements.generateBtn.disabled = keywords.length < 3 || appState.isGenerating;
}

async function handleGenerateMoodboard() {
    const keywords = elements.keywordInput.value.trim();
    
    if (!keywords || keywords.length < 3) {
        showMessage('Please enter at least 3 characters for keywords', 'error');
        return;
    }
    
    appState.currentKeywords = keywords;
    appState.isGenerating = true;
    
    // Update UI to loading state
    showLoadingState();
    updateButtonStates();
    
    try {
        // Fetch images from multiple sources
        const images = await fetchImagesFromSources(keywords);
        
        if (images.length === 0) {
            throw new Error('No images found for the given keywords');
        }
        
        appState.currentImages = images;
        displayMoodboard(images);
        showMessage('🎨 Moodboard generated successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating moodboard:', error);
        showMessage(`Error: ${error.message}`, 'error');
        hideLoadingState();
    } finally {
        appState.isGenerating = false;
        updateButtonStates();
    }
}

async function handleAnalyzeMoodboard() {
    if (appState.currentImages.length === 0) {
        showMessage('Please generate a moodboard first', 'error');
        return;
    }
    
    appState.isAnalyzing = true;
    elements.analysisLoading.classList.remove('hidden');
    elements.analysisPanel.classList.add('hidden');
    updateButtonStates();
    
    try {
        const analysis = await generateAIAnalysis(appState.currentImages, appState.currentKeywords);
        displayAnalysis(analysis);
        showMessage('🤖 AI analysis completed!', 'success');
        
    } catch (error) {
        console.error('Error analyzing moodboard:', error);
        showMessage(`Analysis error: ${error.message}`, 'error');
    } finally {
        appState.isAnalyzing = false;
        elements.analysisLoading.classList.add('hidden');
        updateButtonStates();
    }
}

function handleDownloadMoodboard() {
    if (appState.currentImages.length === 0) {
        showMessage('Please generate a moodboard first', 'error');
        return;
    }
    
    // Use html2canvas to capture the moodboard grid
    const gridElement = elements.moodboardGrid;
    
    html2canvas(gridElement, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--surface-color'),
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `moodboard-${appState.currentKeywords.replace(/\s+/g, '-')}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showMessage('📥 Moodboard downloaded successfully!', 'success');
    }).catch(error => {
        console.error('Error downloading moodboard:', error);
        showMessage('Error downloading moodboard. Please try again.', 'error');
    });
}

function handleDownloadAnalysis() {
    const analysisText = elements.analysisContent.textContent || elements.analysisContent.innerText;
    
    if (!analysisText.trim()) {
        showMessage('No analysis to download', 'error');
        return;
    }
    
    const blob = new Blob([analysisText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.download = `design-analysis-${appState.currentKeywords.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
    
    showMessage('📄 Analysis downloaded successfully!', 'success');
}

function handleThemeToggle() {
    const newTheme = appState.currentTheme === 'light' ? 'dark' : 'light';
    appState.currentTheme = newTheme;
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

// ====================================
// Image Fetching Functions
// ====================================

async function fetchImagesFromSources(keywords) {
    console.log(`🔍 Fetching images for: "${keywords}"`);
    
    const allImages = [];
    
    try {
        // 1. Fetch from Pexels API (4 images)
        const pexelsImages = await fetchPexelsImages(keywords);
        allImages.push(...pexelsImages);
        
        // 2. Fetch Pinterest images twice using Google Custom Search API (8 images total)
        const pinterestImages1 = await fetchPinterestImagesUsingGoogleAPI(keywords);
        allImages.push(...pinterestImages1);
        
        const pinterestImages2 = await fetchPinterestImagesUsingGoogleAPI(keywords);
        allImages.push(...pinterestImages2);
        
    } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to placeholder images for development
        return getPlaceholderImages(keywords);
    }
    
    // Shuffle and limit to total images
    return shuffleArray(allImages).slice(0, CONFIG.TOTAL_IMAGES);
}

async function fetchPexelsImages(keywords) {
    if (CONFIG.PEXELS_API_KEY === 'YOUR_PEXELS_API_KEY_HERE') {
        console.log('⚠️ Pexels API key not configured, using placeholders');
        return getPlaceholderImages(keywords, 'Pexels').slice(0, CONFIG.IMAGES_PER_SOURCE);
    }
    
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=${CONFIG.IMAGES_PER_SOURCE}&orientation=landscape&size=large`, {
            headers: {
                'Authorization': CONFIG.PEXELS_API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error(`Pexels API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return data.photos.map(photo => ({
            url: photo.src.original, // 使用原始高清图片而不是large
            thumbnail: photo.src.large, // 使用large作为缩略图而不是medium
            source: 'Pexels',
            photographer: photo.photographer,
            id: photo.id,
            title: photo.alt || '',
            width: photo.width,
            height: photo.height
        }));
        
    } catch (error) {
        console.error('Pexels API error:', error);
        return getPlaceholderImages(keywords, 'Pexels').slice(0, CONFIG.IMAGES_PER_SOURCE);
    }
}

async function fetchPinterestImagesUsingGoogleAPI(keywords) {
    if (CONFIG.GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY' || CONFIG.GOOGLE_CSE_ID === 'YOUR_CUSTOM_SEARCH_ENGINE_ID') {
        console.log('⚠️ Google Custom Search API credentials not configured, using placeholders');
        return getPlaceholderImages(keywords, 'Pinterest').slice(0, CONFIG.IMAGES_PER_SOURCE);
    }
    
    try {
        // Build Google Custom Search API URL - 请求更高质量的图片
        const searchQuery = `${keywords} site:pinterest.com`;
        const apiUrl = `https://www.googleapis.com/customsearch/v1?key=${CONFIG.GOOGLE_API_KEY}&cx=${CONFIG.GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=${CONFIG.IMAGES_PER_SOURCE}&imgSize=xlarge&safe=active&imgType=photo`;
        
        console.log(`🔍 Searching Pinterest via Google API for: "${searchQuery}"`);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Google Custom Search API error: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Check if we have results
        if (!data.items || data.items.length === 0) {
            console.log('No Pinterest images found via Google API, using placeholders');
            return getPlaceholderImages(keywords, 'Pinterest').slice(0, CONFIG.IMAGES_PER_SOURCE);
        }
        
        // Map Google Custom Search results to our image format
        return data.items.map((item, index) => ({
            url: item.link,
            thumbnail: item.image?.thumbnailLink || item.link,
            source: 'Pinterest',
            photographer: 'Unknown',
            id: `pinterest-google-${Date.now()}-${index}`,
            title: item.title || '',
            displayLink: item.displayLink || 'pinterest.com'
        }));
        
    } catch (error) {
        console.error('Google Custom Search API error:', error);
        // Fallback to placeholder images on error
        return getPlaceholderImages(keywords, 'Pinterest').slice(0, CONFIG.IMAGES_PER_SOURCE);
    }
}

function getPlaceholderImages(keywords, source = 'Placeholder') {
    // Generate placeholder images for development and fallback
    const placeholders = [];
    const baseImages = CONFIG.PLACEHOLDER_IMAGES;
    
    for (let i = 0; i < 4; i++) {
        placeholders.push({
            url: baseImages[i % baseImages.length],
            thumbnail: baseImages[i % baseImages.length],
            source: source,
            photographer: 'Demo Image',
            id: `placeholder-${source.toLowerCase()}-${i}`
        });
    }
    
    return placeholders;
}

// ====================================
// AI Analysis Functions
// ====================================

/**
 * Dedicated function to call Azure OpenAI API for AI analysis
 * @param {string} promptText - The prompt to send to the AI
 * @returns {Promise<string>} - The AI response text
 */
async function fetchAIAnalysis(promptText) {
    // Check if Azure OpenAI is configured
    if (CONFIG.AZURE_OPENAI_API_KEY === 'YOUR_AZURE_OPENAI_API_KEY_HERE' || 
        CONFIG.AZURE_OPENAI_RESOURCE_NAME === 'YOUR_RESOURCE_NAME' ||
        CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME === 'YOUR_DEPLOYMENT_NAME') {
        throw new Error('Azure OpenAI API not configured');
    }
    
    try {
        // Build Azure OpenAI API endpoint
        const azureEndpoint = `https://${CONFIG.AZURE_OPENAI_RESOURCE_NAME}.openai.azure.com/openai/deployments/${CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME}/chat/completions?api-version=${CONFIG.AZURE_OPENAI_API_VERSION}`;
        
        const response = await fetch(azureEndpoint, {
            method: 'POST',
            headers: {
                'api-key': CONFIG.AZURE_OPENAI_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'system',
                        content: 'You are a senior UI/UX design consultant with 10+ years of experience in visual design analysis, design systems, and user interface best practices. You excel at identifying design patterns and providing actionable UI/UX recommendations.'
                    },
                    {
                        role: 'user',
                        content: promptText
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Handle specific Azure OpenAI error codes
            if (response.status === 401) {
                throw new Error('Authentication failed. Please check your Azure OpenAI API key and resource configuration.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            } else if (response.status === 404) {
                throw new Error('Azure OpenAI resource or deployment not found. Please check your resource name and deployment name.');
            } else {
                throw new Error(`Azure OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
            }
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error('Azure OpenAI API error:', error);
        throw error;
    }
}

async function generateAIAnalysis(images, keywords) {
    // Check if Azure OpenAI is configured
    if (CONFIG.AZURE_OPENAI_API_KEY === 'YOUR_AZURE_OPENAI_API_KEY_HERE' || 
        CONFIG.AZURE_OPENAI_RESOURCE_NAME === 'YOUR_RESOURCE_NAME' ||
        CONFIG.AZURE_OPENAI_DEPLOYMENT_NAME === 'YOUR_DEPLOYMENT_NAME') {
        return generateMockAnalysis(keywords);
    }
    
    try {
        // Step 1: Create descriptions of images for AI analysis
        const imageDescriptions = images.map((img, index) => {
            return `Image ${index + 1}: ${img.title || img.alt || 'Design inspiration'} (Source: ${img.source})`;
        }).join('\n');
        
        // Step 2: Create comprehensive prompt for visual theme analysis and UI suggestions
        const prompt = createEnhancedAnalysisPrompt(keywords, imageDescriptions, images.length);
        
        // Step 3: Use the dedicated fetchAIAnalysis function
        const analysisResult = await fetchAIAnalysis(prompt);
        return analysisResult;
        
    } catch (error) {
        console.error('AI Analysis error:', error);
        return generateFallbackAnalysis(keywords, error.message);
    }
}

function createEnhancedAnalysisPrompt(keywords, imageDescriptions, imageCount) {
    return `
        I'm creating a UI/UX moodboard and need your expert analysis and design recommendations.

        **Project Context:**
        - Search Keywords: "${keywords}"
        - Number of Images: ${imageCount}
        - Image Sources: Mix of Pexels and Pinterest design inspiration

        **Image Descriptions:**
        ${imageDescriptions}

        Based on these images and the "${keywords}" theme, please provide a comprehensive analysis following this structure:

        ## 🎨 Visual Theme Summary
        Analyze what you can infer about the visual style from the keywords and image sources. What design characteristics would likely be present in images matching "${keywords}"? Consider:
        - Color palettes (warm/cool, monochromatic/vibrant)
        - Visual style (minimal, modern, retro, etc.)
        - Layout patterns (grid-based, asymmetrical, etc.)
        - Typography approach (clean, decorative, etc.)

        ## � UI Design Recommendations
        Based on this visual theme, provide 3-5 specific UI design best practices and actionable tips:

        **Color & Visual Hierarchy:**
        - Specific color implementation advice
        - Contrast and accessibility considerations

        **Layout & Spacing:**
        - Grid system recommendations
        - White space usage guidelines

        **Component Design:**
        - Button and interaction element styling
        - Card and container design patterns

        **Typography & Content:**
        - Font selection and hierarchy tips
        - Content organization best practices

        ## 🚀 Implementation Tips
        Provide 2-3 immediate next steps a designer could take to implement this style in their UI project.

        Keep all recommendations practical, specific, and actionable for modern UI/UX design projects.
    `;
}

function generateFallbackAnalysis(keywords, errorMessage) {
    // Enhanced fallback analysis with more realistic suggestions
    return `
## 🎨 Visual Theme Summary

Based on your search for "${keywords}", this moodboard likely features modern design elements with thoughtful attention to user experience and visual hierarchy.

## 💡 UI Design Recommendations

**Color & Visual Hierarchy:**
- Use a neutral base palette (whites, light grays) with strategic accent colors
- Maintain contrast ratios of at least 4.5:1 for accessibility
- Limit your color palette to 3-5 colors maximum for cohesion

**Layout & Spacing:**
- Implement an 8px or 4px grid system for consistent spacing
- Use generous white space to create breathing room
- Follow the rule of thirds for visual balance

**Component Design:**
- Design buttons with clear hover and active states
- Use subtle shadows and rounded corners for modern appeal
- Create consistent card layouts with proper padding

**Typography & Content:**
- Establish a clear hierarchy with 3-4 font sizes maximum
- Use readable fonts like Inter, Roboto, or system fonts
- Maintain consistent line spacing (1.4-1.6x font size)

## 🚀 Implementation Tips

1. **Start with a design system** - Define your colors, typography, and spacing before designing components
2. **Focus on consistency** - Use the same patterns across all UI elements
3. **Test on multiple devices** - Ensure your design works on mobile, tablet, and desktop

---
*⚠️ AI analysis temporarily unavailable (${errorMessage}). These are general best practices based on your keywords.*
    `;
}

function generateMockAnalysis(keywords) {
    // Mock analysis for development when API is not configured
    return `
## 🎨 Visual Theme Summary

Based on your search for "${keywords}", we can anticipate a design direction that emphasizes modern UI principles and user-centered design.

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
*📝 Configure your Azure OpenAI API credentials in app.js for AI-powered design analysis based on your actual moodboard images.*
    `;
}

// ====================================
// UI Display Functions
// ====================================

function displayMoodboard(images) {
    elements.moodboardGrid.innerHTML = '';
    
    images.forEach((image, index) => {
        const imageElement = createImageElement(image, index);
        elements.moodboardGrid.appendChild(imageElement);
    });
    
    // Show moodboard and hide loading
    elements.moodboardGrid.classList.remove('hidden');
    elements.loadingState.classList.add('hidden');
    elements.actionsSection.classList.remove('hidden');
}

// 预加载图片以提高显示速度和质量
function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        // 设置图片质量优化属性
        img.decoding = 'async';
        img.src = src;
    });
}

function createImageElement(image, index) {
    const container = document.createElement('div');
    container.className = 'moodboard-image';
    
    // 创建图片加载骨架屏
    const skeleton = document.createElement('div');
    skeleton.className = 'image-skeleton';
    skeleton.innerHTML = '<div class="skeleton-shimmer"></div>';
    container.appendChild(skeleton);
    
    const img = document.createElement('img');
    // 优先使用高分辨率图片，确保图片质量
    const highResUrl = image.url;
    const thumbnailUrl = image.thumbnail || image.url;
    
    // 增强的alt文本用于更好的AI分析
    const altText = image.title || image.alt || `${appState.currentKeywords} design inspiration ${index + 1}`;
    img.alt = altText;
    img.loading = 'lazy';
    img.decoding = 'async'; // 异步解码以提高性能
    
    // 存储额外数据用于AI分析
    img.dataset.imageTitle = image.title || '';
    img.dataset.imageSource = image.source;
    img.dataset.imageIndex = index;
    img.dataset.photographer = image.photographer || '';
    
    // 使用预加载确保图片质量
    preloadImage(highResUrl)
        .then(() => {
            img.src = highResUrl;
            // 图片加载完成后的处理
            img.onload = function() {
                skeleton.style.display = 'none';
                img.style.opacity = '1';
            };
        })
        .catch(() => {
            // 高分辨率图片加载失败，尝试缩略图
            img.src = thumbnailUrl;
            img.onload = function() {
                skeleton.style.display = 'none';
                img.style.opacity = '1';
            };
            img.onerror = function() {
                skeleton.style.display = 'none';
                container.classList.add('image-error');
                img.style.opacity = '1';
                img.alt = 'Image failed to load';
            };
        });
    
    // 初始状态设置为透明，加载完成后显示
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    
    const overlay = document.createElement('div');
    overlay.className = 'image-overlay';
    
    const source = document.createElement('div');
    source.className = 'image-source';
    source.textContent = image.source;
    
    // 添加摄影师信息（如果有）
    if (image.photographer && image.photographer !== 'Unknown' && image.photographer !== 'Demo Image') {
        const photographer = document.createElement('div');
        photographer.className = 'image-photographer';
        photographer.textContent = `by ${image.photographer}`;
        overlay.appendChild(photographer);
    }
    
    overlay.appendChild(source);
    container.appendChild(img);
    container.appendChild(overlay);
    
    // 添加点击处理器用于全屏查看
    container.addEventListener('click', () => {
        openImageModal(image);
    });
    
    return container;
}

function displayAnalysis(analysisText) {
    elements.analysisContent.innerHTML = formatAnalysisText(analysisText);
    elements.analysisPanel.classList.remove('hidden');
}

function formatAnalysisText(text) {
    // Convert markdown-style text to HTML
    return text
        .replace(/## (.*$)/gim, '<h4>$1</h4>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n/g, '<br>');
}

function openImageModal(image) {
    // 增强的全屏图片查看模态框
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.cssText = `
        position: fixed; 
        top: 0; 
        left: 0; 
        width: 100%; 
        height: 100%;
        background: rgba(0,0,0,0.95); 
        display: flex; 
        align-items: center;
        justify-content: center; 
        z-index: 2000; 
        cursor: pointer;
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    // 创建图片容器
    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
        max-width: 90vw;
        max-height: 90vh;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    `;
    
    // 创建高清图片
    const img = document.createElement('img');
    img.src = image.url; // 直接使用高清图片URL
    img.alt = image.title || image.alt || 'Full size image';
    img.loading = 'eager'; // 立即加载全屏图片
    img.decoding = 'sync'; // 同步解码确保质量
    img.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        cursor: default;
        /* 图片质量优化 */
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
        image-rendering: high-quality;
        /* 防止模糊 */
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        /* 抗锯齿优化 */
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    `;
    
    // 添加图片信息
    const imageInfo = document.createElement('div');
    imageInfo.style.cssText = `
        color: white;
        text-align: center;
        background: rgba(0,0,0,0.7);
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
    `;
    
    let infoText = `Source: ${image.source}`;
    if (image.photographer && image.photographer !== 'Unknown' && image.photographer !== 'Demo Image') {
        infoText += ` • Photo by ${image.photographer}`;
    }
    imageInfo.textContent = infoText;
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.3)';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
    });
    
    // 防止图片点击事件冒泡
    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    imageContainer.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    imageContainer.appendChild(img);
    imageContainer.appendChild(imageInfo);
    modal.appendChild(imageContainer);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    // 淡入动画
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // 关闭模态框的函数
    const closeModal = () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 300);
    };
    
    // 点击背景或关闭按钮时关闭
    modal.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    
    // ESC键关闭
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
}

// ====================================
// UI State Management
// ====================================

function showLoadingState() {
    elements.loadingState.classList.remove('hidden');
    elements.moodboardGrid.classList.add('hidden');
    elements.actionsSection.classList.add('hidden');
    elements.analysisPanel.classList.add('hidden');
}

function hideLoadingState() {
    elements.loadingState.classList.add('hidden');
}

function updateButtonStates() {
    // Generate button
    elements.generateBtn.disabled = appState.isGenerating;
    elements.generateBtn.querySelector('.btn-text').textContent = 
        appState.isGenerating ? 'Generating...' : 'Generate Moodboard';
    elements.generateBtn.querySelector('.btn-loader').classList.toggle('hidden', !appState.isGenerating);
    
    // Analysis button
    elements.analyzeBtn.disabled = appState.isAnalyzing || appState.currentImages.length === 0;
    elements.analyzeBtn.textContent = appState.isAnalyzing ? '🔄 Analyzing...' : '🤖 Get Design Suggestions';
}

function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    elements.messageContainer.appendChild(messageElement);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 5000);
}

// ====================================
// Theme Management
// ====================================

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const themeIcon = elements.themeToggle.querySelector('.theme-icon');
    themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ====================================
// Utility Functions
// ====================================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ====================================
// Error Handling & Debugging
// ====================================

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    showMessage('An unexpected error occurred. Please try again.', 'error');
});

// Export for debugging in development
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, appState, fetchImagesFromSources, generateAIAnalysis };
}

console.log('🎨 MoodBoarder Pro loaded successfully!');
