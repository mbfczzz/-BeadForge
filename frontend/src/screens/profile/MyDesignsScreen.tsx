import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

interface Props {
  onBack: () => void;
}

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();

  useEffect(() => {
    fetchMyDesigns(true);
  }, []);

  const renderItem = ({ item }: { item: DesignItem }) => {
    const statusLabel: Record<string, string> = {
      DRAFT: '草稿',
      PUBLISHED: '已发布',
      ARCHIVED: '已归档',
    };

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={[styles.cardImage, { backgroundColor: placeholderColor(item.id) }]}>
          <Text style={styles.cardEmoji}>🧩</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description || '暂无描述'}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.statusBadge, item.status === 'PUBLISHED' && styles.statusPublished]}>
              <Text style={styles.statusText}>{statusLabel[item.status] || item.status}</Text>
            </View>
            <Text style={styles.cardDate}>{item.createdAt?.slice(0, 10)}</Text>
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
          <RefreshControl
            refreshing={myLoading && myDesigns.length > 0}
            onRefresh={() => fetchMyDesigns(true)}
            colors={[Colors.primary]}
          />
        }
        onEndReached={() => { if (myHasMore) fetchMyDesigns(false); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          myLoading
            ? <StateView loading />
            : <StateView empty emptyText="还没有作品，快去创作吧" />
        }
        ListFooterComponent={
          !myHasMore && myDesigns.length > 0
            ? <Text style={styles.noMore}>— 没有更多了 —</Text>
            : null
        }
      />
    </View>
  );
};

const placeholderColor = (id: number) =>
  ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#DDA0DD', '#87CEEB'][id % 6];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.grayBg },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    height: 48,
    backgroundColor: Colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grayBg,
  },
  navBtn: { width: 60 },
  navBtnText: { fontSize: FontSize.md, color: Colors.primary },
  navTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.black },
  list: { padding: Spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  cardImage: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 32, opacity: 0.4 },
  cardInfo: { flex: 1, padding: Spacing.sm, justifyContent: 'space-between' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.black },
  cardDesc: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  statusBadge: {
    backgroundColor: Colors.grayBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusPublished: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: FontSize.xs, color: Colors.gray },
  cardDate: { fontSize: FontSize.xs, color: Colors.grayLight },
  noMore: { textAlign: 'center', color: Colors.grayLight, fontSize: FontSize.sm, paddingVertical: Spacing.lg },
});
