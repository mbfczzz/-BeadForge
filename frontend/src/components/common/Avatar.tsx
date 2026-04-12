import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

export const Avatar: React.FC<Props> = ({ uri, name, size = 40 }) => {
  const r = size / 2;
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r, backgroundColor: '#e6e8ec' }} />;
  const initial = (name || '?').charAt(0).toUpperCase();
  const bgs = ['#5B5FFF', '#FF6B6B', '#20C997', '#F5A623', '#C084FC'];
  const bg = bgs[(name || '').charCodeAt(0) % bgs.length];
  return (
    <View style={[styles.ph, { width: size, height: size, borderRadius: r, backgroundColor: bg }]}>
      <Text style={[styles.t, { fontSize: size * 0.36 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ph: { justifyContent: 'center', alignItems: 'center' },
  t: { color: '#FFF', fontWeight: '600' },
});
