import { useState, useCallback } from 'react';
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

/**
 * 弹幕业务逻辑 hook — 管理弹幕开关、列表、输入状态
 * 可在详情页、直播页等任意需要弹幕的场景复用
 */
export function useDanmaku(initialData: DanmakuItem[]): UseDanmakuReturn {
  const [visible, setVisible] = useState(true);
  const [list, setList] = useState<DanmakuItem[]>(initialData);
  const [inputText, setInputText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const toggle = useCallback(() => setVisible((v) => !v), []);
  const toggleInput = useCallback(() => setShowInput((v) => !v), []);

  const send = useCallback(() => {
    const txt = inputText.trim();
    if (!txt) return;
    setList((prev) => [{ id: Date.now(), text: txt, color: USER_DANMAKU_COLOR }, ...prev]);
    setInputText('');
    setVisible(true);
  }, [inputText]);

  return { visible, toggle, list, inputText, setInputText, showInput, toggleInput, send };
}
