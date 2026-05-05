import { useEffect, useState, useCallback } from 'react';
import type { DanmakuItem } from '../components/common/Danmaku';

/** 用户发送弹幕的高亮色 */
const USER_DANMAKU_COLOR = '#ffe066';

interface UseDanmakuReturn {
  visible: boolean;
  toggle: () => void;
  list: DanmakuItem[];
  inputText: string;
  setInputText: (text: string) => void;
  showInput: boolean;
  toggleInput: () => void;
  send: () => void;
}

interface UseDanmakuOptions {
  /** 发送时同步把弹幕落库；返回 promise，失败时本地条目保留 */
  onSend?: (text: string, color: string) => Promise<unknown>;
}

/**
 * 弹幕业务逻辑 hook — 管理弹幕开关、列表、输入状态。
 * 当外部 source 异步加载完成（initialData 引用变化），自动重置 list。
 */
export function useDanmaku(initialData: DanmakuItem[], options?: UseDanmakuOptions): UseDanmakuReturn {
  const [visible, setVisible] = useState(true);
  const [list, setList] = useState<DanmakuItem[]>(initialData);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);

  // 跟随外部数据更新（首次拉接口/切换页面）
  useEffect(() => { setList(initialData); }, [initialData]);

  const toggle = useCallback(() => setVisible((v) => !v), []);
  const toggleInput = useCallback(() => setShowInput((v) => !v), []);

  const send = useCallback(() => {
    const txt = inputText.trim();
    if (!txt) return;
    const localId = Date.now();
    setList((prev) => [{ id: localId, text: txt, color: USER_DANMAKU_COLOR }, ...prev]);
    setInputText('');
    setVisible(true);
    if (options?.onSend) {
      void options.onSend(txt, USER_DANMAKU_COLOR).catch(() => {
        setList((prev) => prev.filter((it) => it.id !== localId));
      });
    }
  }, [inputText, options]);

  return { visible, toggle, list, inputText, setInputText, showInput, toggleInput, send };
}
