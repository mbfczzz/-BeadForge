import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

export const Avatar: React.FC<Props> = ({ uri, name, size = 48 }) => {
  const r = size / 2;
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: r, backgroundColor: Colors.grayLight }} />;
  }
  const initial = (name || '?').charAt(0).toUpperCase();
  const colors = ['#FF6D00', '#2196F3', '#4CAF50', '#9C27B0', '#E91E63'];
  const bg = colors[(name || '').charCodeAt(0) % colors.length];
  return (
    <View style={[styles.ph, { width: size, height: size, borderRadius: r, backgroundColor: bg }]}>
      <Text style={[styles.init, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  ph: { justifyContent: 'center', alignItems: 'center' },
  init: { color: Colors.white, fontWeight: '700' },
});
