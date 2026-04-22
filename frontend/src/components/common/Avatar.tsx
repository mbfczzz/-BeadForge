import React, { memo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { candyColorFor } from '../../theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  /** 糖果光环：传颜色或 true（自动按 name 取一个糖果色） */
  ring?: string | boolean;
  ringWidth?: number;
}

const PLACEHOLDER_BG = '#e6e8ec';

const AvatarImpl: React.FC<Props> = ({ uri, name, size = 40, ring, ringWidth }) => {
  const r = size / 2;
  const rw = ringWidth ?? Math.max(2, Math.round(size * 0.06));
  const ringColor = ring === true ? candyColorFor(name || '?') : typeof ring === 'string' ? ring : undefined;
  const totalSize = ringColor ? size + rw * 2 : size;

  const avatarNode = uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: r, backgroundColor: PLACEHOLDER_BG }}
    />
  ) : (
    <View
      style={[
        styles.ph,
        { width: size, height: size, borderRadius: r, backgroundColor: candyColorFor(name || '?') },
      ]}
    >
      <Text style={[styles.t, { fontSize: size * 0.38 }]}>{(name || '?').charAt(0).toUpperCase()}</Text>
    </View>
  );

  if (!ringColor) return avatarNode;

  // 结构：ring 色外圆 + padding(rw) 让出给头像；精确 ring 宽度 = rw
  return (
    <View
      style={{
        width: totalSize,
        height: totalSize,
        borderRadius: totalSize / 2,
        backgroundColor: ringColor,
        padding: rw,
      }}
    >
      {avatarNode}
    </View>
  );
};

export const Avatar = memo(AvatarImpl, (a, b) =>
  a.uri === b.uri && a.name === b.name && a.size === b.size && a.ring === b.ring && a.ringWidth === b.ringWidth,
);

const styles = StyleSheet.create({
  ph: { justifyContent: 'center', alignItems: 'center' },
  t: { color: '#FFF', fontWeight: '700' },
});
