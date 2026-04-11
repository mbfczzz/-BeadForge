import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

interface Props { onBack: () => void; }

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: Colors.orange },
  PUBLISHED: { label: '已发布', color: Colors.primary },
  ARCHIVED: { label: '已归档', color: Colors.gray },
};

const CARD_COLORS = ['#E8F5E9', '#E3F2FD', '#FFF8E1', '#F3E5F5', '#FCE4EC', '#E0F7FA'];

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();

  useEffect(() => { fetchMyDesigns(true); }, []);

  const renderItem = ({ item }: { item: DesignItem }) => {
    const status = STATUS_MAP[item.status] || STATUS_MAP.DRAFT;
    const bg = CARD_COLORS[item.id % CARD_COLORS.length];

    return (
      <TouchableOpacity style={styles.cardOuter} activeOpacity={0.7}>
        <View style={styles.cardShadow} />
        <View style={styles.cardInner}>
          <View style={[styles.cardImage, { backgroundColor: bg }]}>
            <Text style={styles.cardEmoji}>🧩</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description || '暂无描述'}</Text>
            <View style={styles.cardMeta}>
              <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
              <Text style={styles.cardDate}>{item.createdAt?.slice(0, 10)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.navBtn}>
          <Text style={styles.navBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>我的作品</Text>
        <View style={styles.navBtn} />
      </View>
      <FlatList
        data={myDesigns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={myLoading && myDesigns.length > 0}
            onRefresh={() => fetchMyDesigns(true)} colors={[Colors.primary]} />
        }
        onEndReached={() => { if (myHasMore) fetchMyDesigns(false); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          myLoading ? <StateView loading /> : <StateView empty emptyText="还没有作品，快去创作吧" emptyIcon="✏️" />
        }
        ListFooterComponent={
          !myHasMore && myDesigns.length > 0
            ? <Text style={styles.endText}>🎉 全部加载完毕</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.snow },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 52, backgroundColor: Colors.white,
    borderBottomWidth: 2, borderBottomColor: Colors.grayBg,
  },
  navBtn: { width: 70 },
  navBtnText: { fontSize: FontSize.md, color: Colors.blue, fontWeight: '700' },
  navTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  list: { padding: Spacing.md },

  cardOuter: { position: 'relative', marginBottom: 12 },
  cardShadow: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: 100, backgroundColor: Colors.shadowGray, borderRadius: BorderRadius.lg,
  },
  cardInner: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg, overflow: 'hidden', marginBottom: 3,
    borderWidth: 2, borderColor: Colors.grayBg,
  },
  cardImage: { width: 100, height: 100, justifyContent: 'center', alignItems: 'center' },
  cardEmoji: { fontSize: 32, opacity: 0.5 },
  cardInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'space-between' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '800', color: Colors.dark },
  cardDesc: { fontSize: FontSize.sm, color: Colors.gray, fontWeight: '500', marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm, borderWidth: 1.5 },
  statusText: { fontSize: FontSize.xs, fontWeight: '800' },
  cardDate: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.grayLight },
  endText: { textAlign: 'center', fontSize: FontSize.md, fontWeight: '700', color: Colors.grayLight, paddingVertical: Spacing.lg },
});
