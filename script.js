/**
 * 甜蜜时光相册
 * 纯原生JS实现，无第三方依赖
 */

// 配置信息
const CONFIG = {
    // 图片配置 - 使用本地图片（确保图片放在与HTML相同的目录下）
    images: [
        '1.jpg',  
        '2.jpg',
        '3.jpg',
        '4.jpg',
        '5.jpg',
        '6.jpg',
        '7.jpg',
        '8.jpg',
        '9.jpg',
        '10.jpg',
        '11.jpg',
        '12.jpg'
    ],
    // 每页显示的图片数量 - 修改为固定1张图片/页
    imagesPerPage: 1,
    // 翻页速度（毫秒）
    flipDuration: 600,
    // 预加载图片数量
    preloadCount: 5,
    // 动画类型：'rotate', 'fade'
    animationType: 'rotate',
    // 翻页动效弹性系数 (0-1之间，越小弹性越大)
    elasticity: 0.2,
    // 图片加载淡入时间（毫秒）
    fadeInDuration: 300,
    // 设备类型检测
    isMobile: window.innerWidth <= 480 || ('ontouchstart' in window && window.innerWidth <= 900),
    isTablet: window.innerWidth > 480 && window.innerWidth <= 1024 && !('ontouchstart' in window),
    isDesktop: window.innerWidth > 1024,
    // 鼠标悬停特效配置 - 几何形状特效
    hoverEffect: {
        enabled: true,               // 是否启用悬停特效
        maxElements: 15,             // 最大同时存在的元素数量
        minSize: 8,                  // 最小元素尺寸
        maxSize: 20,                 // 最大元素尺寸
        duration: [3000, 5000],      // 动画持续时间范围(毫秒)
        // 优雅高贵的色彩
        colors: [
            '#212A3E',  // 深蓝
            '#394867',  // 中蓝
            '#9BA4B5',  // 浅灰蓝
            '#D4AF37',  // 金色
            'rgba(33, 42, 62, 0.3)'  // 半透明深蓝
        ],
        // 几何形状类型
        shapeTypes: ['circle', 'square', 'diamond', 'line']
    }
};

// DOM元素
const DOM = {
    pageContainer: document.querySelector('.page-container'),
    prevBtn: document.querySelector('.prev-btn'),
    nextBtn: document.querySelector('.next-btn'),
    currentPage: document.querySelector('.current'),
    totalPages: document.querySelector('.total'),
    loadingAnimation: document.querySelector('.loading-animation'),
    lightbox: document.querySelector('.lightbox'),
    lightboxImg: document.querySelector('.lightbox-img'),
    flipStyleOptions: document.querySelectorAll('.flip-option'),
    mainWrapper: document.querySelector('.main-wrapper'),
    container: document.querySelector('.container'),
    bookContainer: document.querySelector('.book-container'),
    flowersContainer: document.getElementById('hover-flowers-container')
};

// 应用状态
const STATE = {
    currentPage: 0,
    totalPages: Math.ceil(CONFIG.images.length / CONFIG.imagesPerPage),
    isFlipping: false,
    loadedImages: 0,
    touchStartX: 0,
    touchEndX: 0,
    touchStartY: 0,
    touchEndY: 0,
    lastTouchTime: 0,
    swipeVelocity: 0,
    activeElements: []
};

/**
 * 初始化应用
 */
function initApp() {
    // 更新总页数显示
    DOM.totalPages.textContent = STATE.totalPages;
    DOM.currentPage.textContent = '1';
    
    // 预加载初始图片
    preloadImages(0, CONFIG.preloadCount);
    
    // 创建初始页面
    createPage(0);
    
    // 绑定事件
    bindEvents();
    
    // 响应式处理
    handleResponsive();
    
    // 检测设备并优化体验
    optimizeForDevice();
    
    // 初始化鼠标悬停特效
    if (CONFIG.hoverEffect.enabled && !CONFIG.isMobile) {
        initHoverEffect();
    }
}

/**
 * 初始化鼠标悬停特效
 */
function initHoverEffect() {
    // 监听鼠标移动事件
    document.addEventListener('mousemove', handleMouseMove);
}

/**
 * 处理鼠标移动事件，创建悬停特效
 * @param {MouseEvent} e - 鼠标事件
 */
function handleMouseMove(e) {
    // 仅在非移动设备上启用
    if (CONFIG.isMobile || !CONFIG.hoverEffect.enabled) return;
    
    // 限制特效生成频率，避免生成过多
    if (Math.random() > 0.15) return; // 只有约15%的鼠标移动会生成元素
    
    // 检查当前活跃的元素数量是否已达到最大值
    if (STATE.activeElements.length >= CONFIG.hoverEffect.maxElements) {
        // 移除最早创建的元素
        const oldestElement = STATE.activeElements.shift();
        oldestElement.element.remove();
    }
    
    // 创建新的几何元素
    createHoverElement(e.clientX, e.clientY);
}

/**
 * 创建悬停几何元素
 * @param {number} x - 鼠标X坐标
 * @param {number} y - 鼠标Y坐标
 */
function createHoverElement(x, y) {
    // 不在相册区域内部时才显示几何元素
    const bookRect = DOM.bookContainer.getBoundingClientRect();
    const mainWrapperRect = DOM.mainWrapper.getBoundingClientRect();
    
    // 检查是否点击在相册区域内
    if (x >= bookRect.left && x <= bookRect.right && 
        y >= bookRect.top && y <= bookRect.bottom) {
        return;
    }
    
    // 检查是否在主容器区域内
    if (x < mainWrapperRect.left || x > mainWrapperRect.right || 
        y < mainWrapperRect.top || y > mainWrapperRect.bottom) {
        return;
    }
    
    // 创建几何元素容器
    const element = document.createElement('div');
    element.className = 'hover-flower'; // 保留类名以兼容CSS
    
    // 随机尺寸
    const size = Math.floor(Math.random() * 
        (CONFIG.hoverEffect.maxSize - CONFIG.hoverEffect.minSize) + 
        CONFIG.hoverEffect.minSize);
    
    // 随机颜色
    const colorIndex = Math.floor(Math.random() * CONFIG.hoverEffect.colors.length);
    const color = CONFIG.hoverEffect.colors[colorIndex];
    
    // 随机动画持续时间
    const duration = Math.floor(Math.random() * 
        (CONFIG.hoverEffect.duration[1] - CONFIG.hoverEffect.duration[0]) + 
        CONFIG.hoverEffect.duration[0]);
    
    // 随机选择形状类型
    const shapeType = CONFIG.hoverEffect.shapeTypes[
        Math.floor(Math.random() * CONFIG.hoverEffect.shapeTypes.length)
    ];
    
    // 设置元素容器基础样式
    element.style.cssText = `
        position: absolute;
        left: ${x - mainWrapperRect.left}px;
        top: ${y - mainWrapperRect.top}px;
        transform: translate(-50%, -50%);
        opacity: 0.7;
        z-index: 5;
        pointer-events: none;
        transition: transform ${duration}ms ease-out, opacity ${duration}ms ease-out;
    `;
    
    // 根据形状类型创建不同的几何元素
    switch(shapeType) {
        case 'circle':
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.borderRadius = '50%';
            element.style.background = color;
            element.style.boxShadow = `0 0 10px rgba(33, 42, 62, 0.1)`;
            break;
            
        case 'square':
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.background = color;
            element.style.boxShadow = `0 0 10px rgba(33, 42, 62, 0.1)`;
            break;
            
        case 'diamond':
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.background = color;
            element.style.transform = `translate(-50%, -50%) rotate(45deg)`;
            element.style.boxShadow = `0 0 10px rgba(33, 42, 62, 0.1)`;
            break;
            
        case 'line':
            element.style.width = `${size * 2}px`;
            element.style.height = `1px`;
            element.style.background = color;
            element.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 180}deg)`;
            break;
    }
    
    // 添加到容器
    DOM.flowersContainer.appendChild(element);
    
    // 触发回流后应用动画
    setTimeout(() => {
        // 根据形状类型应用不同的动画
        if (shapeType === 'diamond') {
            element.style.transform = `translate(-50%, -50%) translateY(-${40 + Math.random() * 60}px) rotate(${45 + Math.random() * 90}deg)`;
        } else if (shapeType === 'line') {
            element.style.transform = `translate(-50%, -50%) translateY(-${40 + Math.random() * 60}px) rotate(${Math.random() * 360}deg)`;
        } else {
            element.style.transform = `translate(-50%, -50%) translateY(-${40 + Math.random() * 60}px)`;
        }
        element.style.opacity = '0';
    }, 50);
    
    // 记录创建的元素
    const elementObj = {
        element: element,
        createdAt: Date.now()
    };
    
    STATE.activeElements.push(elementObj);
    
    // 动画结束后移除元素
    setTimeout(() => {
        element.remove();
        // 从活跃列表中移除
        const index = STATE.activeElements.findIndex(f => f === elementObj);
        if (index !== -1) {
            STATE.activeElements.splice(index, 1);
        }
    }, duration + 100);
}

/**
 * 针对不同设备优化体验
 */
function optimizeForDevice() {
    if (CONFIG.isMobile) {
        // 在移动设备上优化触摸交互
        CONFIG.flipDuration = 500; // 加快翻页速度
        
        // 如果是移动设备和某些触摸屏设备，禁用一些较重的动画效果
        document.documentElement.classList.add('mobile-device');
        
        // 在移动设备上禁用鼠标悬停特效
        CONFIG.hoverEffect.enabled = false;
    } else if (CONFIG.isTablet) {
        // 平板设备优化
        CONFIG.flipDuration = 550;
        document.documentElement.classList.add('tablet-device');
    } else {
        // 桌面设备可以使用全部效果
        document.documentElement.classList.add('desktop-device');
    }
    
    // 根据设备能力调整特效
    if (!isHighPerformanceDevice()) {
        // 低性能设备减少动画效果
        CONFIG.elasticity = 0.1;
        CONFIG.hoverEffect.maxElements = 5; // 减少最大元素数量
    }
}

/**
 * 检测是否为高性能设备
 * @returns {boolean} 是否为高性能设备
 */
function isHighPerformanceDevice() {
    // 简单检测 - 主要通过新设备的较高分辨率和较新浏览器特性判断
    const isNewBrowser = ('CSS' in window && CSS.supports('(transform-style: preserve-3d)'));
    const isHighResolution = window.devicePixelRatio > 1;
    
    return isNewBrowser && (isHighResolution || CONFIG.isDesktop);
}

/**
 * 预加载图片
 * @param {number} startIndex - 开始索引
 * @param {number} count - 预加载数量
 */
function preloadImages(startIndex, count) {
    let loaded = 0;
    const imagesToLoad = Math.min(count, CONFIG.images.length - startIndex);
    
    if (imagesToLoad <= 0) {
        hideLoading();
        return;
    }
    
    for (let i = 0; i < imagesToLoad; i++) {
        const index = startIndex + i;
        if (index >= CONFIG.images.length) break;
        
        const img = new Image();
        img.src = CONFIG.images[index];
        
        img.onload = () => {
            loaded++;
            STATE.loadedImages++;
            
            if (loaded === imagesToLoad) {
                hideLoading();
            }
        };
        
        img.onerror = () => {
            loaded++;
            console.warn(`图片 ${index + 1} 加载失败: ${CONFIG.images[index]}`);
            
            if (loaded === imagesToLoad) {
                hideLoading();
            }
        };
    }
}

/**
 * 隐藏加载动画
 */
function hideLoading() {
    DOM.loadingAnimation.classList.add('hidden');
    
    // 加载完成后添加缓动动画
    setTimeout(() => {
        const page = DOM.pageContainer.querySelector('.page');
        if (page) {
            if (CONFIG.animationType === 'rotate') {
                page.style.transition = `transform ${CONFIG.flipDuration}ms ease, opacity ${CONFIG.flipDuration}ms ease`;
            } else if (CONFIG.animationType === 'fade') {
                page.style.transition = `opacity ${CONFIG.flipDuration}ms ease, transform ${CONFIG.flipDuration}ms ease`;
            }
        }
    }, 100);
}

/**
 * 创建页面 - 重写以确保居中
 * @param {number} pageIndex - 页面索引
 */
function createPage(pageIndex) {
    // 清空页面容器
    DOM.pageContainer.innerHTML = '';
    
    const startImageIndex = pageIndex * CONFIG.imagesPerPage;
    let endImageIndex = startImageIndex + CONFIG.imagesPerPage - 1;
    
    if (endImageIndex >= CONFIG.images.length) {
        endImageIndex = CONFIG.images.length - 1;
    }
    
    // 创建当前页
    const page = document.createElement('div');
    page.className = 'page';
    
    // 强制居中定位
    page.style.cssText = `
        margin: 0 auto;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // 应用特定动画类型的样式
    if (CONFIG.animationType === 'rotate') {
        page.classList.add('rotate-effect');
    } else if (CONFIG.animationType === 'fade') {
        page.classList.add('fade-effect');
        
        // 为渐变效果添加背景元素
        const fadeBackground = document.createElement('div');
        fadeBackground.className = 'fade-background';
        fadeBackground.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        DOM.pageContainer.appendChild(fadeBackground);
    }
    
    // 设置3D效果参数
    if (CONFIG.animationType === 'rotate') {
        page.style.transformOrigin = 'center center';
        page.style.transition = `transform ${CONFIG.flipDuration}ms ease, opacity ${CONFIG.flipDuration}ms ease`;
    } else if (CONFIG.animationType === 'fade') {
        page.style.transition = `opacity ${CONFIG.flipDuration}ms ease, transform ${CONFIG.flipDuration}ms ease`;
    }
    
    // 创建页面前后内容
    const pageFront = document.createElement('div');
    pageFront.className = 'page-front';
    pageFront.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        margin: 0 auto;
    `;
    
    const pageBack = document.createElement('div');
    pageBack.className = 'page-back';
    pageBack.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        transform: rotateY(180deg);
        margin: 0 auto;
    `;
    
    // 添加内容到页面
    for (let i = startImageIndex; i <= endImageIndex; i++) {
        // 检查是否在图片范围内
        if (i >= CONFIG.images.length) break;
        
        const imageUrl = CONFIG.images[i];
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            position: relative;
            overflow: hidden;
            padding: 5px;
        `;
        
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
        `;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `甜蜜照片 ${i + 1}`;
        img.dataset.index = i;
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            margin: 0 auto;
            display: block;
            opacity: 0;
        `;
        
        img.addEventListener('load', () => {
            // 图片加载完成后淡入
            setTimeout(() => {
                img.style.transition = `opacity ${CONFIG.fadeInDuration}ms ease-out`;
                img.style.opacity = '1';
            }, 50 * (i - startImageIndex)); // 错开时间，产生级联效果
        });
        
        img.addEventListener('click', handleImageClick);
        
        imgContainer.appendChild(img);
        pageContent.appendChild(imgContainer);
        
        // 根据索引决定放在前面还是后面
        if (i === startImageIndex) {
            pageFront.appendChild(pageContent);
        } else {
            pageBack.appendChild(pageContent);
        }
    }
    
    // 添加翻页阴影效果
    const pageShadow = document.createElement('div');
    pageShadow.className = 'page-shadow';
    pageShadow.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0;
    `;
    page.appendChild(pageShadow);
    
    // 组装页面
    page.appendChild(pageFront);
    page.appendChild(pageBack);
    DOM.pageContainer.appendChild(page);
    
    // 确保容器居中
    DOM.pageContainer.style.display = 'flex';
    DOM.pageContainer.style.justifyContent = 'center';
    DOM.pageContainer.style.alignItems = 'center';
    
    // 预加载下一批图片
    const nextStartIndex = endImageIndex + 1;
    if (nextStartIndex < CONFIG.images.length && STATE.loadedImages < CONFIG.images.length) {
        preloadImages(nextStartIndex, CONFIG.preloadCount);
    }
}

/**
 * 翻到下一页
 */
function nextPage() {
    if (STATE.isFlipping || STATE.currentPage >= STATE.totalPages - 1) return;
    
    STATE.isFlipping = true;
    
    // 获取当前页面元素
    const currentPage = DOM.pageContainer.querySelector('.page');
    currentPage.classList.add('flipping');
    
    // 根据动画类型应用不同效果
    if (CONFIG.animationType === 'rotate') {
        // 旋转淡出效果
        currentPage.style.transform = 'rotateZ(5deg) scale(0.9)';
        currentPage.style.opacity = '0';
    } else if (CONFIG.animationType === 'fade') {
        // 渐变效果
        currentPage.style.opacity = '0';
        currentPage.style.transform = 'scale(0.95)';
        
        // 激活背景过渡
        const fadeBackground = DOM.pageContainer.querySelector('.fade-background');
        if (fadeBackground) {
            fadeBackground.classList.add('active');
            
            setTimeout(() => {
                fadeBackground.classList.remove('active');
            }, CONFIG.flipDuration);
        }
    }
    
    // 更新页码
    STATE.currentPage++;
    DOM.currentPage.textContent = STATE.currentPage + 1;
    
    // 翻页完成后创建新页面
    setTimeout(() => {
        createPage(STATE.currentPage);
        STATE.isFlipping = false;
    }, CONFIG.flipDuration);
}

/**
 * 翻到上一页
 */
function prevPage() {
    if (STATE.isFlipping || STATE.currentPage <= 0) return;
    
    STATE.isFlipping = true;
    
    // 创建上一页
    STATE.currentPage--;
    createPage(STATE.currentPage);
    
    // 获取当前页面元素
    const currentPage = DOM.pageContainer.querySelector('.page');
    
    // 根据动画类型应用不同效果
    if (CONFIG.animationType === 'rotate') {
        // 旋转淡入效果
        currentPage.style.transform = 'rotateZ(-5deg) scale(0.9)';
        currentPage.style.opacity = '0';
        
        // 触发回流，以便动画正确执行
        void currentPage.offsetWidth;
        
        currentPage.classList.add('flipping');
        
        setTimeout(() => {
            currentPage.style.transform = 'rotateZ(0deg) scale(1)';
            currentPage.style.opacity = '1';
        }, 50);
    } else if (CONFIG.animationType === 'fade') {
        // 渐变淡入效果
        currentPage.style.opacity = '0';
        currentPage.style.transform = 'scale(0.95)';
        
        // 触发回流，以便动画正确执行
        void currentPage.offsetWidth;
        
        currentPage.classList.add('flipping');
        
        // 激活背景过渡
        const fadeBackground = DOM.pageContainer.querySelector('.fade-background');
        if (fadeBackground) {
            fadeBackground.classList.add('active');
            
            setTimeout(() => {
                fadeBackground.classList.remove('active');
                currentPage.style.opacity = '1';
                currentPage.style.transform = 'scale(1)';
            }, 350);
        } else {
            setTimeout(() => {
                currentPage.style.opacity = '1';
                currentPage.style.transform = 'scale(1)';
            }, 50);
        }
    }
    
    // 更新页码
    DOM.currentPage.textContent = STATE.currentPage + 1;
    
    // 翻页完成
    setTimeout(() => {
        STATE.isFlipping = false;
    }, CONFIG.flipDuration);
}

/**
 * 处理图片点击
 * @param {Event} e - 点击事件
 */
function handleImageClick(e) {
    // 在移动设备上可能需要双击才能放大
    if (CONFIG.isMobile && !e.detail || e.detail < 2) {
        // 单击操作，可以选择不做任何事或做其他操作
        return;
    }
    
    const img = e.currentTarget;
    const imageUrl = img.src;
    
    // 设置灯箱图片
    DOM.lightboxImg.src = imageUrl;
    DOM.lightbox.classList.add('active');
    
    // 添加动态模糊效果
    document.body.style.overflow = 'hidden';
}

/**
 * 关闭灯箱
 */
function closeLightbox() {
    DOM.lightbox.classList.remove('active');
    
    // 移除滚动限制
    setTimeout(() => {
        document.body.style.overflow = '';
    }, 300);
}

/**
 * 切换翻页效果
 * @param {string} animationType - 动画类型
 */
function changeFlipStyle(animationType) {
    CONFIG.animationType = animationType;
    
    // 更新选中状态
    DOM.flipStyleOptions.forEach(option => {
        if (option.dataset.style === animationType) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 重新创建当前页面以应用新效果
    createPage(STATE.currentPage);
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 按钮点击事件
    DOM.prevBtn.addEventListener('click', prevPage);
    DOM.nextBtn.addEventListener('click', nextPage);
    
    // 翻页样式选择器
    DOM.flipStyleOptions.forEach(option => {
        option.addEventListener('click', () => {
            const animationType = option.dataset.style;
            changeFlipStyle(animationType);
        });
    });
    
    // 键盘事件
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevPage();
        } else if (e.key === 'ArrowRight') {
            nextPage();
        } else if (e.key === 'Escape' && DOM.lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    // 灯箱点击关闭
    DOM.lightbox.addEventListener('click', (e) => {
        if (e.target === DOM.lightbox) {
            closeLightbox();
        }
    });
    
    // 关闭按钮点击事件
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    // 双击图片还原
    DOM.lightboxImg.addEventListener('dblclick', closeLightbox);
    
    // 触摸事件（移动设备翻页）
    document.addEventListener('touchstart', (e) => {
        STATE.touchStartX = e.changedTouches[0].screenX;
        STATE.touchStartY = e.changedTouches[0].screenY;
        STATE.lastTouchTime = Date.now();
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        STATE.touchEndX = e.changedTouches[0].screenX;
        STATE.touchEndY = e.changedTouches[0].screenY;
        
        // 计算滑动速度和距离
        const touchDuration = Date.now() - STATE.lastTouchTime;
        const distanceX = STATE.touchEndX - STATE.touchStartX;
        const distanceY = STATE.touchEndY - STATE.touchStartY;
        STATE.swipeVelocity = Math.abs(distanceX) / touchDuration;
        
        // 确保水平滑动的距离大于垂直滑动，避免与页面滚动冲突
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            handleSwipe(distanceX);
        }
    }, { passive: true });
    
    // 窗口调整大小事件 - 使用节流函数避免频繁调用
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsive();
            // 重新检测设备类型
            CONFIG.isMobile = window.innerWidth <= 480 || ('ontouchstart' in window && window.innerWidth <= 900);
            CONFIG.isTablet = window.innerWidth > 480 && window.innerWidth <= 1024 && !('ontouchstart' in window);
            CONFIG.isDesktop = window.innerWidth > 1024;
            optimizeForDevice();
        }, 200);
    }, { passive: true });
    
    // 鼠标滚轮事件 - 使用节流避免过度触发
    let wheelTimeout;
    document.addEventListener('wheel', (e) => {
        if (wheelTimeout) return;
        wheelTimeout = setTimeout(() => {
            handleMouseWheel(e);
            wheelTimeout = null;
        }, 50);
    }, { passive: true });
    
    // 设备方向变化事件
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResponsive, 300); // 延迟处理，等待浏览器完成方向变化
    });
}

/**
 * 处理滑动手势
 * @param {number} swipeDistance - 滑动距离
 */
function handleSwipe(swipeDistance) {
    const swipeThreshold = STATE.swipeVelocity > 0.5 ? 30 : 50; // 根据速度调整灵敏度
    
    if (swipeDistance > swipeThreshold) {
        // 向右滑动，上一页
        prevPage();
    } else if (swipeDistance < -swipeThreshold) {
        // 向左滑动，下一页
        nextPage();
    }
}

/**
 * 处理鼠标滚轮事件
 * @param {WheelEvent} e - 滚轮事件
 */
function handleMouseWheel(e) {
    // 避免过于频繁的滚动触发
    if (STATE.isFlipping) return;
    
    // 向下或向右滚动，下一页
    if (e.deltaY > 50 || e.deltaX > 50) {
        nextPage();
    } 
    // 向上或向左滚动，上一页
    else if (e.deltaY < -50 || e.deltaX < -50) {
        prevPage();
    }
}

/**
 * 处理响应式布局
 */
function handleResponsive() {
    // 固定每页图片数量为1张，不再根据屏幕尺寸调整
    const newImagesPerPage = 1;
    
    if (newImagesPerPage !== CONFIG.imagesPerPage) {
        CONFIG.imagesPerPage = newImagesPerPage;
        STATE.totalPages = Math.ceil(CONFIG.images.length / CONFIG.imagesPerPage);
        
        // 更新总页数
        DOM.totalPages.textContent = STATE.totalPages;
        
        // 重置到第一页
        STATE.currentPage = 0;
        DOM.currentPage.textContent = '1';
        
        // 重新创建页面
        createPage(0);
    }
}

/**
 * 加载配置文件（从JSON获取图片链接）
 * @param {string} configUrl - 配置文件URL
 */
function loadConfigFromJson(configUrl) {
    try {
        fetch(configUrl)
            .then(response => response.json())
            .then(data => {
                if (data.images && Array.isArray(data.images)) {
                    CONFIG.images = data.images;
                    STATE.totalPages = Math.ceil(CONFIG.images.length / CONFIG.imagesPerPage);
                    
                    // 初始化应用
                    initApp();
                }
            })
            .catch(error => {
                console.error('加载配置文件失败:', error);
                // 使用默认配置初始化
                initApp();
            });
    } catch (e) {
        console.error('fetch可能被浏览器安全策略阻止:', e);
        // 直接使用默认配置初始化
        initApp();
    }
}

// 应用启动
// 尝试从配置文件加载图片配置，但如果失败则使用默认配置
try {
    loadConfigFromJson('config.json');
} catch (e) {
    console.warn('无法加载配置文件，使用默认配置');
    // 直接使用内置配置初始化
    document.addEventListener('DOMContentLoaded', initApp);
} 