import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';

interface Props { message: string }

export const Toast: React.FC<Props> = ({ message }) => {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View style={$.wrap} pointerEvents="none">
      <View style={[$.box, { backgroundColor: colors.text }]}>
        <Feather name="check-circle" size={fp(13)} color={colors.bg} />
        <Text style={[$.text, { color: colors.bg }]}>{message}</Text>
      </View>
    </View>
  );
};

const $ = StyleSheet.create({
  wrap: { position: 'absolute', bottom: wp(90), left: 0, right: 0, alignItems: 'center', zIndex: 999 },
  box: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(16), paddingVertical: wp(9),
    borderRadius: wp(20),
  },
  text: { fontSize: fp(13), fontWeight: '500', marginLeft: wp(6) },
});
