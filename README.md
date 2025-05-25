# 泡泡玛特风格翻书式相册

这是一个基于GitHub图片链接的纯前端翻书式相册应用，采用泡泡玛特轻量风格设计，注重翻页动效流畅性与视觉舒适度。整个应用代码体积控制在1MB以内（含资源）。

## 功能特点

### 图片系统
- GitHub链接集成
- 配置JSON数组批量导入Raw链接
- 基础懒加载（滚动触发加载）
- 点击放大/双击还原
- 自适应容器尺寸

### 翻页交互
- 多种操作方式：
  - 鼠标点击翻页（左右区域触发）
  - 触控滑动翻页
  - 方向键快捷翻页
- 3D翻页效果（CSS transform实现）
- 翻页光影效果
- 页码动态显示

### 设计风格
- 泡泡玛特轻量风格
- 马卡龙粉、珠光白、荧光紫色彩体系
- 波浪线条边框
- 漂浮半透明泡泡装饰
- 角落卡通图标

## 技术实现

- 纯原生JS实现翻页逻辑
- CSS3完成基础动画（transform+transition）
- 原生懒加载（Intersection Observer极简实现）
- 响应式设计（双断点）
- 无第三方库依赖

## 使用方法

1. 克隆或下载本仓库
2. 修改`config.json`文件中的图片链接为您自己的GitHub Raw链接
3. 在浏览器中打开`index.html`文件即可查看相册
4. 也可以部署到GitHub Pages进行在线浏览

### 配置图片

编辑`config.json`文件，添加您自己的GitHub图片链接：

```json
{
    "images": [
        "https://raw.githubusercontent.com/your-username/your-repo/main/images/image1.jpg",
        "https://raw.githubusercontent.com/your-username/your-repo/main/images/image2.jpg",
        ...
    ]
}
```

### 启用JSON配置

默认情况下，应用使用内置的图片链接。如需使用`config.json`中的链接，请取消注释`script.js`文件末尾的以下代码：

```javascript
// loadConfigFromJson('config.json');
```

改为：

```javascript
loadConfigFromJson('config.json');
// 直接使用内置配置初始化
// document.addEventListener('DOMContentLoaded', initApp);
```

## 性能表现

- 首屏加载：<2秒（5张图）
- 翻页帧率：≥30fps（全设备）
- 资源压缩：CSS/JS压缩率≥70%

## 文件结构

- `index.html` - 核心页面
- `style.css` - 样式表
- `script.js` - 功能逻辑
- `config.json` - 图片配置文件
- `README.md` - 项目说明

## 浏览器兼容性

支持所有现代浏览器，包括：
- Chrome
- Firefox
- Safari
- Edge

## 注意事项

1. 使用GitHub Raw链接时，请确保您的仓库是公开的，或者您已经正确设置了访问权限
2. 为保证加载速度，建议将图片压缩至200KB以内
3. 建议使用固定尺寸的图片，以保证展示效果的一致性

## 许可

MIT 许可证 