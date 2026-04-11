import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
  borderColor?: string;
}

export const Avatar: React.FC<Props> = ({ uri, name, size = 48, borderColor = Colors.primary }) => {
  const radius = size / 2;

  if (uri) {
    return (
      <View style={[styles.ring, { width: size + 6, height: size + 6, borderRadius: radius + 3, borderColor }]}>
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius }} />
      </View>
    );
  }

  const initial = (name || '?').charAt(0).toUpperCase();
  const bgColors = [Colors.primary, Colors.blue, Colors.orange, Colors.purple, Colors.pink];
  const bg = bgColors[(name || '').charCodeAt(0) % bgColors.length];

  return (
    <View style={[styles.ring, { width: size + 6, height: size + 6, borderRadius: radius + 3, borderColor }]}>
      <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius, backgroundColor: bg }]}>
        <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: Colors.white,
    fontWeight: '800',
  },
});
