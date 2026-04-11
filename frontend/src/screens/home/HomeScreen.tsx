import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, RefreshControl, TextInput,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { Spacing, FontSize, BorderRadius, useTheme } from '../../theme';
import { StateView } from '../../components/common';
import { BeadGrid, HEART_PATTERN, MUSHROOM_PATTERN, STAR_PATTERN, FLOWER_PATTERN, CAT_PATTERN } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

const { width: SCREEN_W } = Dimensions.get('window');
const COL_COUNT = SCREEN_W > 600 ? 4 : SCREEN_W > 400 ? 3 : 2;
const GAP = 10;
const CARD_W = (SCREEN_W - Spacing.md * 2 - GAP * (COL_COUNT - 1)) / COL_COUNT;

const PATTERNS = [HEART_PATTERN, CAT_PATTERN, MUSHROOM_PATTERN, FLOWER_PATTERN, STAR_PATTERN];
const CARD_BGS_LIGHT = ['#FFEEF0', '#FFF8EE', '#FFF0F0', '#FFF0FA', '#FFFDE7', '#EEF6FF', '#F0FFF4', '#F5F0FF'];
const CARD_BGS_DARK = ['#3A2030', '#3A3020', '#3A2020', '#3A2035', '#3A3A15', '#202A3A', '#203A25', '#2A2040'];

const NAV_ITEMS = ['推荐', '动物', '卡通', '花卉', '美食', '风景', '抽象', '像素'];
const NAV_KEYS = ['', 'animal', 'character', 'flower', 'food', 'scenery', 'abstract', 'pixel'];

export const HomeScreen: React.FC = () => {
  const { colors, dark, toggle } = useTheme();
  const {
    designs, loading, refreshing, error, hasMore,
    category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const activeNav = NAV_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);

  const onRefresh = useCallback(() => fetchDesigns(true), [fetchDesigns]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowTop(y > 200);
    const { layoutMeasurement, contentSize } = e.nativeEvent;
    if (y + layoutMeasurement.height >= contentSize.height - 150 && hasMore && !loading) {
      fetchDesigns(false);
    }
  }, [hasMore, loading, fetchDesigns]);

  const handleSearch = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, [setSearchKeyword, fetchDesigns]);

  const filtered = searchKeyword.trim()
    ? designs.filter((d) => d.title.toLowerCase().includes(searchKeyword.trim().toLowerCase()))
    : designs;

  // 分列
  const columns: DesignItem[][] = Array.from({ length: COL_COUNT }, () => []);
  filtered.forEach((item, i) => columns[i % COL_COUNT].push(item));

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* 顶部导航栏 */}
      <View style={[styles.navBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[styles.logo, { color: colors.accent }]}>🧩 BeadForge</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navItems}>
          {NAV_ITEMS.map((name, idx) => (
            <TouchableOpacity
              key={name}
              onPress={() => setFilter(undefined, NAV_KEYS[idx] || null)}
              style={[styles.navItem, activeNav === idx && { backgroundColor: colors.accentLight }]}
            >
              <Text style={[styles.navText, { color: activeNav === idx ? colors.accent : colors.textSecondary }]}>
                {name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 搜索栏 */}
      <View style={[styles.searchBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.inputBg }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={colors.textHint}
            value={searchKeyword}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={[styles.clearText, { color: colors.textHint }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 内容区 */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={100}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {/* 瀑布流网格 */}
        {filtered.length > 0 && (
          <View style={styles.grid}>
            {columns.map((col, ci) => (
              <View key={ci} style={styles.column}>
                {col.map((item) => (
                  <GalleryCard key={item.id} item={item} />
                ))}
              </View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={[styles.endText, { color: colors.textHint }]}>— 已加载全部 —</Text>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* 浮动按钮 */}
      <View style={styles.fab}>
        <TouchableOpacity
          style={[styles.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={toggle}
        >
          <Text style={styles.fabIcon}>{dark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
        {showTop && (
          <TouchableOpacity
            style={[styles.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 10 }]}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Text style={styles.fabIcon}>⬆</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/** 画廊卡片 - moely 风格 */
const GalleryCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const { colors, dark } = useTheme();
  const pattern = PATTERNS[item.id % PATTERNS.length];
  const cardH = 140 + (item.id * 31) % 80;
  const bgPool = dark ? CARD_BGS_DARK : CARD_BGS_LIGHT;
  const bg = bgPool[item.id % bgPool.length];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.cardBg, shadowColor: colors.cardShadow }]}
    >
      {/* 封面区域 */}
      <View style={[styles.cardCover, { height: cardH, backgroundColor: bg }]}>
        <BeadGrid pixels={pattern} beadSize={Math.floor(CARD_W / pattern[0].length) - 1} gap={1} round />
      </View>
      {/* 底部信息 */}
      <View style={styles.cardInfo}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardId, { color: colors.textHint }]}>#{item.id}</Text>
          <Text style={[styles.cardAuthor, { color: colors.textSecondary }]}>
            @{item.authorName || '创作者'}
          </Text>
        </View>
        <View style={styles.cardTags}>
          <View style={[styles.tag, { backgroundColor: colors.tagBg }]}>
            <Text style={[styles.tagText, { color: colors.tagText }]}>{item.category || '拼豆'}</Text>
          </View>
          <View style={styles.cardLike}>
            <Text style={{ fontSize: 12 }}>❤</Text>
            <Text style={[styles.likeNum, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Nav
  navBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, height: 50,
    borderBottomWidth: 1,
  },
  logo: { fontSize: FontSize.xl, fontWeight: '700', marginRight: Spacing.md },
  navItems: { alignItems: 'center', gap: 4 },
  navItem: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.md },
  navText: { fontSize: FontSize.sm, fontWeight: '500' },

  // Search
  searchBar: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, height: 38,
  },
  searchIcon: { fontSize: 13, marginRight: 6 },
  searchInput: { flex: 1, fontSize: FontSize.md, padding: 0 },
  clearText: { fontSize: 14, paddingHorizontal: 4 },

  // Grid
  grid: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, gap: GAP },
  column: { flex: 1, gap: GAP },

  // Card
  card: {
    borderRadius: BorderRadius.md, overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8,
    elevation: 3,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardInfo: { padding: 10 },
  cardTitle: { fontSize: FontSize.md, fontWeight: '600', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardId: { fontSize: FontSize.xs, marginRight: 8 },
  cardAuthor: { fontSize: FontSize.xs },
  cardTags: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.sm },
  tagText: { fontSize: FontSize.xs },
  cardLike: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeNum: { fontSize: FontSize.xs },

  // Footer
  endText: { textAlign: 'center', fontSize: FontSize.sm, paddingVertical: Spacing.lg },

  // FAB
  fab: { position: 'absolute', right: 16, bottom: 20 },
  fabBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  fabIcon: { fontSize: 18 },
});
