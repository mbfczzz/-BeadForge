import React, { memo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

const PH_BGS = ['#5B5FFF', '#FF6B6B', '#20C997', '#F5A623', '#C084FC'];
const PLACEHOLDER_BG = '#e6e8ec';

const AvatarImpl: React.FC<Props> = ({ uri, name, size = 40 }) => {
  const r = size / 2;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: r, backgroundColor: PLACEHOLDER_BG }}
        // RN 的 Image 默认带缓存；force-cache 可最大化复用已下载图片
        {...({ defaultSource: undefined } as any)}
      />
    );
  }
  const initial = (name || '?').charAt(0).toUpperCase();
  const bg = PH_BGS[(name || '').charCodeAt(0) % PH_BGS.length];
  return (
    <View style={[styles.ph, { width: size, height: size, borderRadius: r, backgroundColor: bg }]}>
      <Text style={[styles.t, { fontSize: size * 0.36 }]}>{initial}</Text>
    </View>
  );
};

// Avatar 常被放在列表中；memo 可避免父组件 re-render 时重新创建 Image 节点
export const Avatar = memo(AvatarImpl, (a, b) => a.uri === b.uri && a.name === b.name && a.size === b.size);

const styles = StyleSheet.create({
  ph: { justifyContent: 'center', alignItems: 'center' },
  t: { color: '#FFF', fontWeight: '600' },
});
