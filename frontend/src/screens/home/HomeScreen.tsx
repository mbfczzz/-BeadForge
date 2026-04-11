import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

const { width: SCREEN_W } = Dimensions.get('window');

/** 顶部分类横滑标签 */
const CATEGORIES = [
  '推荐', '动物', '卡通', '花卉', '美食', '风景', '抽象', '节日', '像素',
];
const CAT_KEYS = ['', 'animal', 'character', 'flower', 'food', 'scenery', 'abstract', 'festival', 'pixel'];

/** 横滑卡片尺寸 */
const CARD_W = 140;
const CARD_H = 190;
const WIDE_CARD_W = 220;
const WIDE_CARD_H = 130;

/** 占位封面色 */
const COVER_COLORS = [
  '#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2',
  '#00796B', '#C2185B', '#455A64', '#E64A19', '#512DA8',
];

export const HomeScreen: React.FC = () => {
  const {
    designs, loading, refreshing, error,
    category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCatIdx = CAT_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);

  const onRefresh = useCallback(() => { fetchDesigns(true); }, [fetchDesigns]);

  const handleCat = useCallback((idx: number) => {
    setFilter(undefined, CAT_KEYS[idx] || null);
  }, [setFilter]);

  const handleSearch = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, [setSearchKeyword, fetchDesigns]);

  // 按分组模拟：热门推荐 / 最新上架 / 精选合集
  const filtered = searchKeyword.trim()
    ? designs.filter((d) => d.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()))
    : designs;

  const hotDesigns = filtered.slice(0, 8);
  const newDesigns = filtered.slice(3, 11);
  const pickDesigns = filtered.slice(5, 15);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.black} />}
      >
        {/* 顶部分类标签 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((name, idx) => (
            <TouchableOpacity
              key={name}
              onPress={() => handleCat(idx)}
              style={[styles.catItem, activeCatIdx === idx && styles.catItemActive]}
            >
              <Text style={[styles.catText, activeCatIdx === idx && styles.catTextActive]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 搜索栏 */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="搜索拼豆图案"
            placeholderTextColor={Colors.gray}
            value={searchKeyword}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading / Error */}
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {filtered.length > 0 && (
          <>
            {/* 第一组: 热门推荐 - 大竖卡 */}
            <SectionHeader title="时下最热门的拼豆图案" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {hotDesigns.map((item) => (
                <VerticalCard key={`hot-${item.id}`} item={item} />
              ))}
            </ScrollView>

            {/* 第二组: 最新上架 - 宽横卡 */}
            <SectionHeader title="最新上架" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {newDesigns.map((item) => (
                <WideCard key={`new-${item.id}`} item={item} />
              ))}
            </ScrollView>

            {/* 第三组: 精选合集 - 大竖卡 */}
            <SectionHeader title="大家都在拼的图案" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {pickDesigns.map((item) => (
                <VerticalCard key={`pick-${item.id}`} item={item} />
              ))}
            </ScrollView>
          </>
        )}

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </View>
  );
};

/** 分区标题 */
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/** 竖向封面卡片（类似截图中的影视海报卡） */
const VerticalCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const bg = COVER_COLORS[item.id % COVER_COLORS.length];
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.vCard}>
      <View style={[styles.vCardCover, { backgroundColor: bg }]}>
        <Text style={styles.coverEmoji}>🧩</Text>
      </View>
      <Text style={styles.vCardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.vCardMeta} numberOfLines={1}>
        {item.category || '拼豆'} · {item.authorName || '创作者'}
      </Text>
    </TouchableOpacity>
  );
};

/** 宽横向卡片（类似截图中的宽横幅） */
const WideCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const bg = COVER_COLORS[(item.id + 3) % COVER_COLORS.length];
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.wCard}>
      <View style={[styles.wCardCover, { backgroundColor: bg }]}>
        <Text style={styles.coverEmojiLg}>🧩</Text>
        {/* 底部渐变蒙层模拟 */}
        <View style={styles.wCardOverlay}>
          <Text style={styles.wCardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.wCardMeta} numberOfLines={1}>
            {item.category || '拼豆'} · ❤ {item.likeCount}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  // 分类标签
  catRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  catItem: { marginRight: Spacing.md },
  catItemActive: { borderBottomWidth: 2, borderBottomColor: Colors.black, paddingBottom: 4 },
  catText: { fontSize: FontSize.md, color: Colors.gray },
  catTextActive: { color: Colors.black, fontWeight: '700' },

  // 搜索
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.grayBg, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, height: 40,
  },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.black, padding: 0 },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, color: Colors.gray },

  // Section
  sectionHeader: { paddingHorizontal: Spacing.md, marginTop: Spacing.md, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.title, fontWeight: '800', color: Colors.black },

  // 横滑列表
  hList: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },

  // 竖卡
  vCard: { width: CARD_W, marginRight: 12 },
  vCardCover: {
    width: CARD_W, height: CARD_H,
    borderRadius: BorderRadius.md, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  coverEmoji: { fontSize: 40, opacity: 0.5 },
  vCardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.black, marginTop: 8 },
  vCardMeta: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },

  // 宽卡
  wCard: { width: WIDE_CARD_W, marginRight: 12 },
  wCardCover: {
    width: WIDE_CARD_W, height: WIDE_CARD_H,
    borderRadius: BorderRadius.md, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  coverEmojiLg: { fontSize: 48, opacity: 0.4 },
  wCardOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 8,
  },
  wCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  wCardMeta: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
