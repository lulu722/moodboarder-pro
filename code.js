// ===========================================
// Figma 插件主代码 - 与 Figma API 交互
// 职责：接收 UI 消息，操作 Figma 画布，不处理网络请求和 DOM
// ===========================================

// 显示插件 UI 界面
figma.showUI(__html__, { 
  width: 460, 
  height: 640,
  title: "🎨 MoodBoarder Pro"
});

// 监听来自 UI 线程的消息
figma.ui.onmessage = async (msg) => {
  console.log('Code 线程收到消息:', msg.type);
  
  try {
    switch (msg.type) {
      case 'insert-image':
        await handleInsertImage(msg);
        break;
        
      case 'close-plugin':
        figma.closePlugin('MoodBoarder Pro 已关闭');
        break;
        
      case 'resize-ui':
        figma.ui.resize(msg.width || 460, msg.height || 640);
        break;
        
      case 'notify':
        figma.notify(msg.message, { 
          timeout: msg.timeout || 3000,
          error: msg.isError || false 
        });
        break;
        
      default:
        console.warn('未知消息类型:', msg.type);
    }
  } catch (error) {
    console.error('Code 线程处理消息错误:', error);
    figma.notify('插件操作失败: ' + error.message, { error: true });
  }
};

/**
 * 处理图片插入到 Figma 画布
 * @param {Object} msg - 包含图片数据的消息对象
 * @param {number[]} msg.bytes - 图片的字节数组
 * @param {string} msg.name - 图片名称
 * @param {string} msg.source - 图片来源
 * @param {string} msg.photographer - 摄影师信息
 */
async function handleInsertImage(msg) {
  if (!msg.bytes || !Array.isArray(msg.bytes)) {
    throw new Error('无效的图片数据');
  }
  
  // 将字节数组转换为 Uint8Array
  const imageBytes = new Uint8Array(msg.bytes);
  
  // 在 Figma 中创建图片资源
  const image = figma.createImage(imageBytes);
  
  // 创建矩形节点作为图片容器
  const rect = figma.createRectangle();
  
  // 设置矩形尺寸 (16:10 比例，适合设计展示)
  const width = 320;
  const height = 200;
  rect.resize(width, height);
  
  // 设置图片填充
  rect.fills = [{
    type: 'IMAGE',
    scaleMode: 'FILL', // 填充整个矩形
    imageHash: image.hash
  }];
  
  // 设置圆角，让图片更美观
  rect.cornerRadius = 8;
  
  // 添加阴影效果
  rect.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.15 },
    offset: { x: 0, y: 4 },
    radius: 12,
    visible: true,
    blendMode: 'NORMAL'
  }];
  
  // 设置节点名称，包含来源信息
  const imageName = msg.name || 'Mood Board Image';
  const sourceInfo = msg.source ? ` (${msg.source})` : '';
  const photographerInfo = msg.photographer && msg.photographer !== 'Demo Image' 
    ? ` by ${msg.photographer}` : '';
  
  rect.name = `${imageName}${sourceInfo}${photographerInfo}`;
  
  // 将矩形添加到当前页面
  figma.currentPage.appendChild(rect);
  
  // 获取当前选中的节点，用于智能定位
  const selection = figma.currentPage.selection;
  
  if (selection.length > 0) {
    // 如果有选中的节点，在其右侧放置新图片
    const lastSelected = selection[selection.length - 1];
    rect.x = lastSelected.x + lastSelected.width + 20;
    rect.y = lastSelected.y;
  } else {
    // 如果没有选中节点，放置在视口中心
    const viewport = figma.viewport.center;
    rect.x = viewport.x - width / 2;
    rect.y = viewport.y - height / 2;
  }
  
  // 选中新创建的图片节点
  figma.currentPage.selection = [rect];
  
  // 将视口滚动并缩放到新图片
  figma.viewport.scrollAndZoomIntoView([rect]);
  
  // 通知用户操作成功
  const successMessage = `✅ 已插入图片${sourceInfo}`;
  figma.notify(successMessage, { timeout: 2000 });
  
  console.log('图片插入成功:', {
    name: rect.name,
    size: `${width}×${height}`,
    position: `(${rect.x}, ${rect.y})`
  });
}

/**
 * 插件初始化
 */
function initializePlugin() {
  console.log('🎨 MoodBoarder Pro Figma 插件已启动');
  
  // 向 UI 发送初始化完成消息
  figma.ui.postMessage({
    type: 'plugin-ready',
    figmaUser: figma.currentUser?.name || 'Guest',
    figmaVersion: figma.version
  });
}

// 启动插件
initializePlugin();
