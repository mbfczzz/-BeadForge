import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

interface Props {
  uri?: string | null;
  name?: string;
  size?: number;
}

function renderPresetAvatar(preset: string, size: number, fallback: string) {
  const inner = Math.max(12, size * 0.34);

  if (preset === 'github') {
    return (
      <LinearGradient
        colors={['#121212', '#121212', '#F5A623', '#F5A623']}
        locations={[0, 0.62, 0.62, 1]}
        style={[styles.presetWrap, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <Text style={[styles.githubText, { fontSize: Math.max(10, size * 0.16) }]}>GitHub</Text>
      </LinearGradient>
    );
  }

  const presetMap: Record<string, { colors: [string, string]; text: string; textColor: string }> = {
    ocean: { colors: ['#4A90FF', '#7BC6FF'], text: fallback, textColor: '#FFFFFF' },
    violet: { colors: ['#635BFF', '#9B8CFF'], text: fallback, textColor: '#FFFFFF' },
    coral: { colors: ['#FF7B72', '#FFB36B'], text: fallback, textColor: '#FFFFFF' },
    moss: { colors: ['#2BBF88', '#79D7A7'], text: fallback, textColor: '#FFFFFF' },
  };

  const current = presetMap[preset] || presetMap.ocean;

  return (
    <LinearGradient
      colors={current.colors}
      style={[styles.presetWrap, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.fallback, { color: current.textColor, fontSize: inner }]}>{current.text}</Text>
    </LinearGradient>
  );
}

export const Avatar: React.FC<Props> = ({ uri, name, size = 40 }) => {
  const { colors } = useTheme();
  const fallback = (name || '?').trim().slice(0, 2).toUpperCase() || 'BF';

  if (uri?.startsWith('preset:')) {
    return renderPresetAvatar(uri.replace('preset:', ''), size, fallback);
  }

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.accentLight,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={[styles.fallback, { color: colors.accent, fontSize: Math.max(12, size * 0.34) }]}>{fallback}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetWrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  githubText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
