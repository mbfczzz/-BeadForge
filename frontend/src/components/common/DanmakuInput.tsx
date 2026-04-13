import React, { memo } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { HoverView } from './HoverView';
import { wp } from '../../utils/responsive';

interface DanmakuInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  colors: ThemeColors;
  maxLength?: number;
  placeholder?: string;
}

export const DanmakuInput: React.FC<DanmakuInputProps> = memo(({
  value, onChangeText, onSend, colors,
  maxLength = 30,
  placeholder = '发条友善的弹幕...',
}) => {
  const hasText = value.trim().length > 0;
  return (
    <View style={[s.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TextInput
        style={[s.input, { backgroundColor: colors.inputBg, color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textHint}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSend}
        maxLength={maxLength}
        returnKeyType="send"
      />
      <HoverView
        onPress={onSend}
        style={[s.sendBtn, { backgroundColor: hasText ? colors.accent : colors.inputBg }]}
        hoverScale={1.05}
        hoverLift={1}
      >
        <Text style={[s.sendText, { color: hasText ? '#fff' : colors.textHint }]}>发送</Text>
      </HoverView>
    </View>
  );
});

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: wp(8), borderRadius: BorderRadius.lg,
    borderWidth: 1, gap: wp(8),
  },
  input: {
    flex: 1, height: wp(36),
    borderRadius: BorderRadius.md,
    paddingHorizontal: wp(12),
    fontSize: FontSize.md,
  },
  sendBtn: {
    paddingHorizontal: wp(16), height: wp(36),
    borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center',
  },
  sendText: {
    fontSize: FontSize.sm, fontWeight: '600',
  },
});
