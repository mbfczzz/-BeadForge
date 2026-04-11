import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

interface Props { onBack: () => void; }

const STATUS: Record<string, string> = { DRAFT: '草稿', PUBLISHED: '已发布', ARCHIVED: '已归档' };
const COLORS = ['#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2', '#00796B'];

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();
  useEffect(() => { fetchMyDesigns(true); }, []);

  const renderItem = ({ item }: { item: DesignItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
      <View style={[styles.cardCover, { backgroundColor: COLORS[item.id % COLORS.length] }]}>
        <Text style={styles.emoji}>🧩</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.cardMeta}>{STATUS[item.status] || item.status} · {item.createdAt?.slice(0, 10)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={onBack}><Text style={styles.navBack}>← 返回</Text></TouchableOpacity>
        <Text style={styles.navTitle}>我的作品</Text>
        <View style={{ width: 50 }} />
      </View>
      <FlatList
        data={myDesigns}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={myLoading && myDesigns.length > 0} onRefresh={() => fetchMyDesigns(true)} tintColor={Colors.black} />}
        onEndReached={() => { if (myHasMore) fetchMyDesigns(false); }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={myLoading ? <StateView loading /> : <StateView empty emptyText="还没有作品" />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, height: 48, borderBottomWidth: 1, borderBottomColor: Colors.grayBg,
  },
  navBack: { fontSize: FontSize.md, color: Colors.grayDark },
  navTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.black },
  list: { padding: Spacing.md },
  card: { flexDirection: 'row', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.grayBg, paddingBottom: 12 },
  cardCover: { width: 80, height: 80, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  emoji: { fontSize: 28, opacity: 0.5 },
  cardInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.black },
  cardMeta: { fontSize: FontSize.sm, color: Colors.gray, marginTop: 4 },
});
