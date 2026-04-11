import { Platform } from 'react-native';

/**
 * 注入全局 Web hover + 光标 + 过渡 CSS
 */
export function injectWebHoverStyles() {
  if (Platform.OS !== 'web') return;

  const css = `
    /* ===== 全局过渡 ===== */
    * {
      -webkit-tap-highlight-color: transparent;
    }

    /* 所有可点击元素 */
    [role="button"] {
      cursor: pointer !important;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* ===== 卡片 hover ===== */
    [data-class="card"] {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    [data-class="card"]:hover {
      transform: translateY(-4px) scale(1.01) !important;
      box-shadow: 0 12px 28px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06) !important;
    }
    [data-class="card"]:active {
      transform: translateY(0) scale(0.98) !important;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
    }

    /* ===== 分类标签 hover ===== */
    [data-class="cat"] {
      transition: all 0.2s ease !important;
    }
    [data-class="cat"]:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 3px 10px rgba(0,0,0,0.08) !important;
      opacity: 0.85;
    }
    [data-class="cat"]:active {
      transform: translateY(0) scale(0.96) !important;
    }

    /* ===== Banner hover ===== */
    [data-class="banner"] {
      transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                  box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    [data-class="banner"]:hover {
      transform: scale(1.02) !important;
      box-shadow: 0 16px 40px rgba(0,0,0,0.18) !important;
    }
    [data-class="banner"]:active {
      transform: scale(0.99) !important;
    }

    /* ===== 菜单项 hover ===== */
    [data-class="menu"] {
      transition: background-color 0.2s ease !important;
    }
    [data-class="menu"]:hover {
      background-color: rgba(0,0,0,0.035) !important;
    }
    [data-class="menu"]:active {
      background-color: rgba(0,0,0,0.06) !important;
    }

    /* ===== 导航按钮 hover ===== */
    [data-class="nav-btn"] {
      transition: all 0.2s ease !important;
    }
    [data-class="nav-btn"]:hover {
      background-color: rgba(0,0,0,0.08) !important;
      transform: scale(1.05) !important;
    }
    [data-class="nav-btn"]:active {
      transform: scale(0.95) !important;
    }

    /* ===== FAB hover ===== */
    [data-class="fab"] {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    [data-class="fab"]:hover {
      transform: scale(1.1) translateY(-2px) !important;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15) !important;
    }
    [data-class="fab"]:active {
      transform: scale(0.95) !important;
    }

    /* ===== Tab hover ===== */
    [data-class="tab"] {
      transition: all 0.2s ease !important;
    }
    [data-class="tab"]:hover {
      opacity: 0.7 !important;
      transform: translateY(-1px) !important;
    }
    [data-class="tab"]:active {
      transform: translateY(0) scale(0.95) !important;
    }

    /* ===== 搜索框 ===== */
    [data-class="search"] {
      transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
    }
    [data-class="search"]:focus-within {
      box-shadow: 0 0 0 3px rgba(75, 120, 255, 0.1) !important;
    }

    /* ===== 输入框 ===== */
    input {
      outline: none !important;
      caret-color: #4b78ff;
    }

    /* ===== 滚动条 ===== */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; transition: background 0.2s; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }

    /* ===== 文字选中 ===== */
    ::selection { background: rgba(75, 120, 255, 0.15); }
  `;

  const el = document.createElement('style');
  el.id = 'beadforge-hover-css';
  el.textContent = css;
  document.head.appendChild(el);
}
