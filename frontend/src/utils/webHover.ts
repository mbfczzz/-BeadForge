import { Platform } from 'react-native';

let injected = false;

/**
 * 注入全局 Web CSS — 所有 hover/active 效果用纯 CSS 实现
 * 通过 data-class 属性匹配元素，比 JS onHoverIn/onHoverOut 更可靠
 */
export function injectWebHoverStyles() {
  if (Platform.OS !== 'web' || injected) return;
  if (typeof document === 'undefined') return;
  injected = true;

  const el = document.createElement('style');
  el.textContent = `
    /* 字体 */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    /* 基础 */
    * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
    body, input, textarea, button, select { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif; }
    html { scroll-behavior: smooth; }
    body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
    [role="button"], button { cursor: pointer !important; }
    input { outline: none !important; caret-color: #4b78ff; }

    /* 滚动条 */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.16); }
    ::selection { background: rgba(75,120,255,0.18); }

    /* 搜索框 focus */
    [data-class="search"] {
      transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
    }
    [data-class="search"]:focus-within {
      border-color: #4b78ff !important;
      box-shadow: 0 0 0 3px rgba(75,120,255,0.1) !important;
    }

    /* ========== 卡片 hover / active ========== */
    [data-class="card"] {
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  opacity 0.2s ease !important;
      cursor: pointer;
    }
    [data-class="card"]:hover {
      transform: translateY(-8px) scale(1.02) !important;
      box-shadow: 0 20px 48px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.06) !important;
    }
    [data-class="card"]:active {
      transform: translateY(-2px) scale(0.97) !important;
      box-shadow: 0 6px 16px rgba(0,0,0,0.08) !important;
      opacity: 0.88 !important;
    }

    /* ========== 菜单项 hover / active ========== */
    [data-class="menu"] {
      transition: background-color 0.2s ease, transform 0.2s ease !important;
      cursor: pointer;
    }
    [data-class="menu"]:hover {
      background-color: rgba(0,0,0,0.03) !important;
    }
    [data-class="menu"]:active {
      transform: scale(0.985) !important;
    }

    /* ========== 通用 hover 按钮 ========== */
    [data-class="hover-btn"] {
      transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.25s ease,
                  opacity 0.2s ease !important;
      cursor: pointer;
    }
    [data-class="hover-btn"]:hover {
      transform: translateY(-4px) scale(1.06) !important;
      box-shadow: 0 8px 20px rgba(0,0,0,0.12) !important;
    }
    [data-class="hover-btn"]:active {
      transform: translateY(0) scale(0.94) !important;
      opacity: 0.8 !important;
    }

    /* ========== Banner hover ========== */
    [data-class="banner"] {
      transition: transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  box-shadow 0.35s ease !important;
      cursor: pointer;
    }
    [data-class="banner"]:hover {
      transform: translateY(-6px) scale(1.02) !important;
      box-shadow: 0 20px 48px rgba(0,0,0,0.18) !important;
    }
    [data-class="banner"]:active {
      transform: translateY(-1px) scale(0.98) !important;
    }

    /* ========== 分类标签 hover ========== */
    [data-class="cat"] {
      transition: transform 0.2s ease,
                  background-color 0.2s ease,
                  border-color 0.2s ease,
                  box-shadow 0.2s ease !important;
      cursor: pointer;
    }
    [data-class="cat"]:hover {
      transform: translateY(-3px) !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.10) !important;
    }
    [data-class="cat"]:active {
      transform: translateY(0) scale(0.93) !important;
    }

    /* ========== 导航按钮 hover ========== */
    [data-class="nav-btn"] {
      transition: transform 0.2s ease, background-color 0.2s ease !important;
      cursor: pointer;
    }
    [data-class="nav-btn"]:hover {
      transform: scale(1.18) !important;
    }
    [data-class="nav-btn"]:active {
      transform: scale(0.88) !important;
    }

    /* ========== FAB hover ========== */
    [data-class="fab"] {
      transition: transform 0.25s ease, box-shadow 0.25s ease !important;
      cursor: pointer;
    }
    [data-class="fab"]:hover {
      transform: translateY(-4px) scale(1.15) !important;
      box-shadow: 0 10px 24px rgba(0,0,0,0.16) !important;
    }
    [data-class="fab"]:active {
      transform: translateY(0) scale(0.9) !important;
    }

    /* 暗黑模式阴影调整 */
    .dark-mode [data-class="card"]:hover {
      box-shadow: 0 16px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2) !important;
    }
    .dark-mode [data-class="banner"]:hover {
      box-shadow: 0 20px 48px rgba(0,0,0,0.4) !important;
    }
  `;
  document.head.appendChild(el);
}
