import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { FontSize, BorderRadius, useTheme } from '../../theme';
import { HoverView, StateView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(16);
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: '#D4A017' },       // 藤黄
  PUBLISHED: { label: '已发布', color: '#4D8A5E' }, // 松绿
  ARCHIVED: { label: '已归档', color: '#8A7C6E' },  // 赭石
};

interface Props { onBack: () => void }

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<any>();
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();
  useEffect(() => { fetchMyDesigns(true); }, []);

  const handlePress = (item: DesignItem) => {
    navigation.navigate('DesignDetail', { item });
  };

  const renderItem = ({ item }: { item: DesignItem }) => {
    const pat = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
    const st = STATUS_MAP[item.status] || { label: item.status, color: '#6B7280' };
    return (
      <HoverView onPress={() => handlePress(item)} style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]} hoverScale={1.01} hoverLift={2}>
        <View style={[$.cardCover, { backgroundColor: dark ? '#2a2a2a' : '#fafafa' }]}>
          <BeadGrid pixels={pat} beadSize={wp(6)} gap={0.5} round />
        </View>
        <View style={$.cardInfo}>
          <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[$.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{item.description}</Text>
          <View style={$.cardFooter}>
            <View style={[$.statusBadge, { backgroundColor: st.color + '18' }]}>
              <View style={[$.statusDot, { backgroundColor: st.color }]} />
              <Text style={[$.statusText, { color: st.color }]}>{st.label}</Text>
            </View>
            <Text style={[$.cardDate, { color: colors.textHint }]}>{item.createdAt?.slice(0, 10)}</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={fp(16)} color={colors.textHint} style={{ marginRight: wp(4) }} />
      </HoverView>
    );
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>我的作品</Text>
        <View style={{ width: wp(34) }} />
      </View>
      <FlatList
        data={myDesigns}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: PAD, gap: wp(10) }}
        refreshControl={<RefreshControl refreshing={myLoading && myDesigns.length > 0} onRefresh={() => fetchMyDesigns(true)} tintColor={colors.accent} />}
        onEndReached={() => { if (myHasMore) fetchMyDesigns(false); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={myLoading ? <StateView loading /> : <StateView empty emptyText="还没有作品，去创作吧" />}
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD,
    borderBottomWidth: 1, gap: wp(10),
  },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.xl, borderWidth: 1, overflow: 'hidden',
    ...shadow(3, 10, 0.08, '#5A4A3E', 2),
  },
  statusBadgeRound: {
    paddingHorizontal: wp(10), paddingVertical: wp(3), borderRadius: wp(9999),
  },
  cardCover: {
    width: wp(72), height: wp(72),
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, padding: wp(10), gap: wp(4) },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600' },
  cardDesc: { fontSize: FontSize.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: wp(8), marginTop: wp(2) },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(10), paddingVertical: wp(3), borderRadius: wp(9999),
  },
  statusDot: { width: wp(5), height: wp(5), borderRadius: wp(2.5) },
  statusText: { fontSize: fp(10), fontWeight: '600' },
  cardDate: { fontSize: FontSize.xs },
});
