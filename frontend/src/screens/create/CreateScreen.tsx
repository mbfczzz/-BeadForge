import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, EditorMode } from '../../navigation/types';
import { Feather } from '@expo/vector-icons';
import { useTheme, BorderRadius } from '../../theme';
import { wp, fp, BOTTOM_SAFE_H } from '../../utils/responsive';
import { CREATE_METHODS, CREATE_SIZES, CREATE_TIPS } from '../../mock/app';

const PAD = wp(15);
const W = Dimensions.get('window').width;
const SIZE_W = Math.floor((W - PAD * 2 - wp(10)) / 2);

export const CreateScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors, dark } = useTheme();
  const [sizeIdx, setSizeIdx] = useState(1);

  const go = (mode: EditorMode) => {
    const size = CREATE_SIZES[sizeIdx];
    navigation.navigate('Editor', { mode, cols: size.cols, rows: size.rows });
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.header, { backgroundColor: colors.accent }]}>
        <View style={$.headerRow}>
          <View style={[$.headerIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Feather name="edit-2" size={fp(14)} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={$.headerTitle}>创作工坊</Text>
            <Text style={$.headerSub}>选择尺寸和方式，开始编辑拼豆图案</Text>
          </View>
          <View style={$.headerDeco}>
            <Feather name="grid" size={fp(18)} color="#fff" />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(60) + BOTTOM_SAFE_H }}>
        <Text style={[$.sectionTitle, { color: colors.text }]}>画布尺寸</Text>
        <View style={$.sizeGrid}>
          {CREATE_SIZES.map((size, index) => {
            const active = index === sizeIdx;
            return (
              <TouchableOpacity
                key={size.label}
                activeOpacity={0.8}
                onPress={() => setSizeIdx(index)}
                style={[$.sizeCard, {
                  width: SIZE_W,
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                }]}
              >
                <Feather name={size.icon} size={fp(16)} color={active ? '#fff' : colors.textHint} />
                <Text style={[$.sizeLabel, { color: active ? '#fff' : colors.text }]}>{size.label}</Text>
                <Text style={[$.sizeDesc, { color: active ? 'rgba(255,255,255,0.75)' : colors.textHint }]}>
                  {size.cols}x{size.rows} · {size.desc}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[$.sectionTitle, { color: colors.text }]}>开始创作</Text>
        {CREATE_METHODS.map((method) => (
          <TouchableOpacity
            key={method.key}
            activeOpacity={0.8}
            onPress={() => go(method.key)}
            style={[$.methodButton, { backgroundColor: dark ? colors.surface : '#fff', borderColor: colors.border }]}
          >
            <View style={[$.methodIcon, { backgroundColor: method.color }]}>
              <Feather name={method.icon as any} size={fp(18)} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.methodTitle, { color: colors.text }]}>{method.title}</Text>
              <Text style={[$.methodDesc, { color: colors.textHint }]}>{method.desc}</Text>
            </View>
            <View style={[$.methodArrow, { backgroundColor: `${method.color}15` }]}>
              <Feather name="arrow-right" size={fp(14)} color={method.color} />
            </View>
          </TouchableOpacity>
        ))}

        <Text style={[$.sectionTitle, { color: colors.text }]}>创作提示</Text>
        {CREATE_TIPS.map((tip) => (
          <TouchableOpacity
            key={tip.title}
            activeOpacity={0.7}
            onPress={() => go(tip.mode)}
            style={[$.tipItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[$.tipIcon, { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : tip.bg }]}>
              <Feather name={tip.icon as any} size={fp(16)} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[$.tipTitle, { color: colors.text }]}>{tip.title}</Text>
              <Text style={[$.tipDesc, { color: colors.textHint }]}>{tip.desc}</Text>
            </View>
            <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: PAD, paddingTop: wp(12), paddingBottom: wp(16) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIconWrap: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(9),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(8),
  },
  headerTitle: { fontSize: fp(16), fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.7)', marginTop: wp(3) },
  headerDeco: {
    width: wp(44),
    height: wp(44),
    borderRadius: wp(14),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: fp(15), fontWeight: '700', paddingHorizontal: PAD, marginTop: wp(18), marginBottom: wp(10) },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' },
  sizeCard: {
    alignItems: 'center',
    paddingVertical: wp(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: wp(10),
  },
  sizeLabel: { fontSize: fp(14), fontWeight: '700', marginTop: wp(4) },
  sizeDesc: { fontSize: fp(10), marginTop: wp(2) },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginBottom: wp(10),
    padding: wp(14),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  methodIcon: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(12),
  },
  methodTitle: { fontSize: fp(14), fontWeight: '600' },
  methodDesc: { fontSize: fp(11), marginTop: wp(1) },
  methodArrow: {
    width: wp(28),
    height: wp(28),
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: PAD,
    marginBottom: wp(8),
    padding: wp(12),
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  tipIcon: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(10),
  },
  tipTitle: { fontSize: fp(13), fontWeight: '600' },
  tipDesc: { fontSize: fp(11), marginTop: wp(1) },
});
