import { Platform } from 'react-native';

let injected = false;

/**
 * 注入全局 Web CSS - 在 useEffect 中调用确保 document 存在
 */
export function injectWebHoverStyles() {
  if (Platform.OS !== 'web' || injected) return;
  if (typeof document === 'undefined') return;
  injected = true;

  const el = document.createElement('style');
  el.textContent = `
    /* 指针 */
    [role="button"], button { cursor: pointer !important; }
    input { outline: none !important; caret-color: #4b78ff; }
    * { -webkit-tap-highlight-color: transparent; }

    /* 滚动条 */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.02); border-radius: 3px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
    ::selection { background: rgba(75,120,255,0.15); }
  `;
  document.head.appendChild(el);
}
