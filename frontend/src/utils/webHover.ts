import { Platform } from 'react-native';

/**
 * 注入全局 Web hover/transition CSS
 * React Native Web 不自带 hover 效果，需要手动注入
 */
export function injectWebHoverStyles() {
  if (Platform.OS !== 'web') return;

  const style = document.createElement('style');
  style.textContent = `
    /* 所有可点击元素的通用过渡 */
    [role="button"],
    [data-focusable="true"] {
      transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.25s ease, box-shadow 0.25s ease !important;
      cursor: pointer !important;
    }

    /* 卡片 hover - 上浮 + 阴影加深 */
    [data-testid="card"]:hover,
    [data-class="card"]:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 6px 20px rgba(0,0,0,0.12) !important;
    }

    /* 分类标签 hover */
    [data-class="cat"]:hover {
      background-color: rgba(0,0,0,0.04) !important;
      transform: scale(1.03) !important;
    }

    /* banner hover */
    [data-class="banner"]:hover {
      transform: scale(1.015) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
    }

    /* 菜单项 hover */
    [data-class="menu"]:hover {
      background-color: rgba(0,0,0,0.03) !important;
    }

    /* 按钮 hover */
    [role="button"]:hover {
      opacity: 0.88 !important;
    }

    /* 导航栏按钮 hover */
    [data-class="nav-btn"]:hover {
      background-color: rgba(0,0,0,0.06) !important;
    }

    /* FAB hover */
    [data-class="fab"]:hover {
      transform: scale(1.08) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    }

    /* Tab hover */
    [data-class="tab"]:hover {
      opacity: 0.75 !important;
    }

    /* 输入框聚焦发光 */
    input:focus {
      outline: none !important;
    }

    /* 滚动条美化 */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.03);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.12);
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.2);
    }

    /* 选中文字颜色 */
    ::selection {
      background: rgba(75, 120, 255, 0.2);
    }

    /* 暗色模式滚动条 */
    .dark-mode ::-webkit-scrollbar-track {
      background: rgba(255,255,255,0.03);
    }
    .dark-mode ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.12);
    }
  `;
  document.head.appendChild(style);
}
