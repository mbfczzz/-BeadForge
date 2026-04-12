import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { StateView } from '../../components/common';
import { BeadGrid, HEART_PATTERN, CAT_PATTERN, MUSHROOM_PATTERN, FLOWER_PATTERN, STAR_PATTERN } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

interface Props { onBack: () => void; }

const PATTERNS = [HEART_PATTERN, CAT_PATTERN, MUSHROOM_PATTERN, FLOWER_PATTERN, STAR_PATTERN];
const STATUS: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ARCHIVED: '已归档' };

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();
  useEffect(() => { fetchMyDesigns(true); }, []);

  const renderItem = ({ item }: { item: DesignItem }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} activeOpacity={0.7}>
      <View style={[styles.cardCover, { backgroundColor: colors.inputBg }]}>
        <BeadGrid pixels={PATTERNS[item.id % PATTERNS.length]} beadSize={6} gap={1} round />
      </View>
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <Text style={[styles.cardMeta, { color: colors.textHint }]}>
          {STATUS[item.status] || item.status} · {item.createdAt?.slice(0, 10)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity onPress={onBack}><Text style={[styles.navBack, { color: colors.textSecondary }]}>← 返回</Text></TouchableOpacity>
        <Text style={[styles.navTitle, { color: colors.text }]}>我的作品</Text>
        <View style={{ width: wp(50) }} />
      </View>
      <FlatList
        data={myDesigns}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={myLoading && myDesigns.length > 0} onRefresh={() => fetchMyDesigns(true)} tintColor={colors.accent} />}
        onEndReached={() => { if (myHasMore) fetchMyDesigns(false); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={myLoading ? <StateView loading /> : <StateView empty emptyText="还没有作品" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: wp(16), height: wp(48), borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBack: { fontSize: fp(15), fontWeight: '500' },
  navTitle: { fontSize: fp(17), fontWeight: '700' },
  list: { padding: wp(16) },
  card: {
    flexDirection: 'row', marginBottom: wp(12), borderRadius: BorderRadius.md,
    overflow: 'hidden', ...shadow(0, 3, 0.06, '#000', 2),
  },
  cardCover: { width: wp(80), height: wp(80), justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, paddingHorizontal: wp(14), paddingVertical: wp(12), justifyContent: 'center' },
  cardTitle: { fontSize: fp(15), fontWeight: '600' },
  cardMeta: { fontSize: fp(12), marginTop: wp(5) },
});
