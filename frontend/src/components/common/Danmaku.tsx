import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { fp, wp, screenW } from '../../utils/responsive';

/* ──────────────── 类型 ──────────────── */

export interface DanmakuItem {
  id: number;
  text: string;
  color?: string;
}

export interface DanmakuConfig {
  /** 弹道数量，默认 4 */
  trackCount?: number;
  /** 单条弹幕飘过屏幕的基础时长(ms)，默认 6000 */
  speed?: number;
  /** 弹幕发射间隔(ms)，默认 900 */
  interval?: number;
  /** 弹幕背景色，默认 rgba(0,0,0,0.35) */
  itemBg?: string;
}

/* ──────────────── 默认配置 ──────────────── */

const DEFAULT_TRACK_COUNT = 4;
const DEFAULT_SPEED = 6000;
const DEFAULT_INTERVAL = 900;
const DEFAULT_ITEM_BG = 'rgba(0,0,0,0.35)';
const DEFAULT_COLOR = '#fff';
const SPEED_JITTER = 1500; // 随机偏移范围(ms)

/* ──────────────── 内部类型 ──────────────── */

interface TrackItem {
  id: number;
  text: string;
  color: string;
  track: number;
  anim: Animated.Value;
}

/* ──────────────── 弹幕覆盖层 ──────────────── */

interface DanmakuOverlayProps {
  visible: boolean;
  data: DanmakuItem[];
  height: number;
  config?: DanmakuConfig;
}

export const DanmakuOverlay: React.FC<DanmakuOverlayProps> = memo(({ visible, data, height, config }) => {
  const trackCount = config?.trackCount ?? DEFAULT_TRACK_COUNT;
  const speed = config?.speed ?? DEFAULT_SPEED;
  const interval = config?.interval ?? DEFAULT_INTERVAL;
  const itemBg = config?.itemBg ?? DEFAULT_ITEM_BG;

  const [items, setItems] = useState<TrackItem[]>([]);
  const idxRef = useRef(0);
  const keyRef = useRef(100);
  const trackBusy = useRef<number[]>(new Array(trackCount).fill(0));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsRef = useRef<TrackItem[]>([]);

  const spawn = useCallback(() => {
    if (!data.length) return;
    const now = Date.now();

    // 找空闲弹道
    let track = -1;
    for (let i = 0; i < trackCount; i++) {
      if (now > trackBusy.current[i]) { track = i; break; }
    }
    if (track === -1) return;

    const src = data[idxRef.current % data.length];
    idxRef.current++;

    const anim = new Animated.Value(screenW + 50);
    const key = keyRef.current++;
    const newItem: TrackItem = {
      id: key, text: src.text, color: src.color || DEFAULT_COLOR, track, anim,
    };

    // 估算文字宽度：每字符约 12px + 两侧 padding
    const estimatedWidth = src.text.length * fp(12) + wp(24);
    // 标记弹道繁忙时间
    trackBusy.current[track] = now + Math.max(1500, (estimatedWidth / screenW) * speed + 800);

    itemsRef.current = [...itemsRef.current, newItem];
    setItems([...itemsRef.current]);

    Animated.timing(anim, {
      toValue: -estimatedWidth - 20,
      duration: speed + Math.random() * SPEED_JITTER,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      itemsRef.current = itemsRef.current.filter((it) => it.id !== key);
      setItems([...itemsRef.current]);
    });
  }, [data, trackCount, speed]);

  useEffect(() => {
    if (!visible) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      itemsRef.current = [];
      setItems([]);
      trackBusy.current = new Array(trackCount).fill(0);
      return;
    }
    spawn();
    timerRef.current = setInterval(spawn, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, spawn, interval, trackCount]);

  if (!visible || items.length === 0) return null;

  const trackH = height / trackCount;

  return (
    <View style={[s.overlay, { height }]} pointerEvents="none">
      {items.map((it) => (
        <Animated.View
          key={it.id}
          style={[
            s.item,
            { backgroundColor: itemBg, top: it.track * trackH + trackH * 0.15,
              transform: [{ translateX: it.anim }] },
          ]}
        >
          <Text style={[s.text, { color: it.color }]}>{it.text}</Text>
        </Animated.View>
      ))}
    </View>
  );
});

/* ──────────────── 样式 ──────────────── */

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  item: {
    position: 'absolute',
    paddingHorizontal: wp(10),
    paddingVertical: wp(3),
    borderRadius: wp(12),
  },
  text: {
    fontSize: fp(13),
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
