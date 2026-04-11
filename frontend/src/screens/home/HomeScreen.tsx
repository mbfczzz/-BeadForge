import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';
import { StateView } from '../../components/common';
import {
  BeadGrid,
  HEART_PATTERN, MUSHROOM_PATTERN, STAR_PATTERN, FLOWER_PATTERN, CAT_PATTERN,
} from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { DesignItem } from '../../api/design';

const { width: SCREEN_W } = Dimensions.get('window');
const BANNER_W = SCREEN_W - 32;
const BANNER_H = 200;

const CATEGORIES = [
  '推荐', '动物', '卡通', '花卉', '美食', '风景', '抽象', '节日', '像素',
];
const CAT_KEYS = ['', 'animal', 'character', 'flower', 'food', 'scenery', 'abstract', 'festival', 'pixel'];

const CARD_W = 140;
const CARD_H = 190;
const WIDE_CARD_W = 220;
const WIDE_CARD_H = 130;

const COVER_COLORS = [
  '#D32F2F', '#1976D2', '#388E3C', '#F57C00', '#7B1FA2',
  '#00796B', '#C2185B', '#455A64', '#E64A19', '#512DA8',
];

/** 轮播图数据 */
const BANNERS = [
  {
    id: 1,
    title: '人气爱心图案',
    subtitle: '最受欢迎的经典拼豆造型',
    pattern: HEART_PATTERN,
    bg: '#FFF0F0',
    beadSize: 14,
  },
  {
    id: 2,
    title: '可爱小猫咪',
    subtitle: '萌宠系列 · 新手友好',
    pattern: CAT_PATTERN,
    bg: '#FFF8EE',
    beadSize: 14,
  },
  {
    id: 3,
    title: '超级蘑菇',
    subtitle: '经典像素游戏角色还原',
    pattern: MUSHROOM_PATTERN,
    bg: '#FFF5F5',
    beadSize: 14,
  },
  {
    id: 4,
    title: '花之物语',
    subtitle: '春日限定 · 花卉系列',
    pattern: FLOWER_PATTERN,
    bg: '#FFF0F8',
    beadSize: 12,
  },
  {
    id: 5,
    title: '闪耀之星',
    subtitle: '热门收藏 · 人气 Top 10',
    pattern: STAR_PATTERN,
    bg: '#FFFDE7',
    beadSize: 14,
  },
];

export const HomeScreen: React.FC = () => {
  const {
    designs, loading, refreshing, error,
    category, searchKeyword,
    setFilter, setSearchKeyword, fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bannerRef = useRef<ScrollView>(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  const activeCatIdx = CAT_KEYS.indexOf(category || '');

  useEffect(() => { fetchDesigns(true); }, []);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIdx((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: next * (BANNER_W + 12), animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const onBannerScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_W + 12));
    setBannerIdx(idx);
  }, []);

  const onRefresh = useCallback(() => { fetchDesigns(true); }, [fetchDesigns]);

  const handleCat = useCallback((idx: number) => {
    setFilter(undefined, CAT_KEYS[idx] || null);
  }, [setFilter]);

  const handleSearch = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchDesigns(true), 500);
  }, [setSearchKeyword, fetchDesigns]);

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
        {/* 分类标签 */}
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
          <Text style={styles.searchIcon}>🔍</Text>
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

        {/* ===== 拼豆作品轮播图 ===== */}
        <View style={styles.bannerSection}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            snapToInterval={BANNER_W + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.bannerList}
          >
            {BANNERS.map((b) => (
              <TouchableOpacity key={b.id} activeOpacity={0.9} style={[styles.bannerCard, { backgroundColor: b.bg }]}>
                {/* 左侧文字 */}
                <View style={styles.bannerTextWrap}>
                  <Text style={styles.bannerTitle}>{b.title}</Text>
                  <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                  <View style={styles.bannerTag}>
                    <Text style={styles.bannerTagText}>查看详情 →</Text>
                  </View>
                </View>
                {/* 右侧拼豆图案 */}
                <View style={styles.bannerArt}>
                  <BeadGrid pixels={b.pattern} beadSize={b.beadSize} gap={2} round />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* 指示器 */}
          <View style={styles.dotsWrap}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, bannerIdx === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* Loading / Error */}
        {loading && designs.length === 0 && <StateView loading />}
        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {filtered.length > 0 && (
          <>
            <SectionHeader title="时下最热门的拼豆图案" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {hotDesigns.map((item) => (
                <VerticalCard key={`hot-${item.id}`} item={item} />
              ))}
            </ScrollView>

            <SectionHeader title="最新上架" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {newDesigns.map((item) => (
                <WideCard key={`new-${item.id}`} item={item} />
              ))}
            </ScrollView>

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

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

/** 竖向卡片 - 封面用像素珠子网格 */
const VerticalCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const patterns = [HEART_PATTERN, MUSHROOM_PATTERN, STAR_PATTERN, FLOWER_PATTERN, CAT_PATTERN];
  const bgs = ['#FFF0F0', '#FFF5F5', '#FFFDE7', '#FFF0F8', '#FFF8EE'];
  const p = patterns[item.id % patterns.length];
  const bg = bgs[item.id % bgs.length];

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.vCard}>
      <View style={[styles.vCardCover, { backgroundColor: bg }]}>
        <BeadGrid pixels={p} beadSize={10} gap={1} round />
      </View>
      <Text style={styles.vCardTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.vCardMeta} numberOfLines={1}>
        {item.category || '拼豆'} · {item.authorName || '创作者'}
      </Text>
    </TouchableOpacity>
  );
};

/** 宽横向卡片 */
const WideCard: React.FC<{ item: DesignItem }> = ({ item }) => {
  const patterns = [CAT_PATTERN, FLOWER_PATTERN, HEART_PATTERN, STAR_PATTERN, MUSHROOM_PATTERN];
  const bgs = ['#FFF8EE', '#FFF0F8', '#FFF0F0', '#FFFDE7', '#FFF5F5'];
  const p = patterns[item.id % patterns.length];
  const bg = bgs[item.id % bgs.length];

  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.wCard}>
      <View style={[styles.wCardCover, { backgroundColor: bg }]}>
        <View style={styles.wCardLeft}>
          <Text style={styles.wCardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.wCardMeta} numberOfLines={1}>
            {item.category || '拼豆'} · ❤ {item.likeCount}
          </Text>
        </View>
        <View style={styles.wCardRight}>
          <BeadGrid pixels={p} beadSize={8} gap={1} round />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  catRow: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  catItem: { marginRight: Spacing.md, paddingBottom: 6 },
  catItemActive: { borderBottomWidth: 2.5, borderBottomColor: Colors.black },
  catText: { fontSize: FontSize.md, color: Colors.gray },
  catTextActive: { color: Colors.black, fontWeight: '700' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: Colors.grayBg, borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md, height: 40,
  },
  searchIcon: { fontSize: 14, marginRight: 6 },
  searchInput: { flex: 1, fontSize: FontSize.md, color: Colors.black, padding: 0 },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, color: Colors.gray },

  // 轮播图
  bannerSection: { marginBottom: Spacing.sm },
  bannerList: { paddingHorizontal: Spacing.md },
  bannerCard: {
    width: BANNER_W,
    height: BANNER_H,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginRight: 12,
    overflow: 'hidden',
  },
  bannerTextWrap: { flex: 1, paddingRight: Spacing.md },
  bannerTitle: { fontSize: FontSize.xxl, fontWeight: '800', color: Colors.black, marginBottom: 6 },
  bannerSubtitle: { fontSize: FontSize.sm, color: Colors.grayDark, lineHeight: 20 },
  bannerTag: {
    marginTop: 12,
    backgroundColor: Colors.black,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  bannerTagText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: '600' },
  bannerArt: {
    width: 130,
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 指示器
  dotsWrap: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.grayLight, marginHorizontal: 3,
  },
  dotActive: { backgroundColor: Colors.black, width: 18 },

  // Section
  sectionHeader: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: FontSize.title, fontWeight: '800', color: Colors.black },

  hList: { paddingLeft: Spacing.md, paddingRight: Spacing.sm },

  // 竖卡
  vCard: { width: CARD_W, marginRight: 12 },
  vCardCover: {
    width: CARD_W, height: CARD_H,
    borderRadius: BorderRadius.md, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center',
  },
  vCardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.black, marginTop: 8 },
  vCardMeta: { fontSize: FontSize.xs, color: Colors.gray, marginTop: 2 },

  // 宽卡
  wCard: { width: WIDE_CARD_W, marginRight: 12 },
  wCardCover: {
    width: WIDE_CARD_W, height: WIDE_CARD_H,
    borderRadius: BorderRadius.md, overflow: 'hidden',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14,
  },
  wCardLeft: { flex: 1 },
  wCardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.black },
  wCardMeta: { fontSize: FontSize.xs, color: Colors.grayDark, marginTop: 4 },
  wCardRight: { marginLeft: 8 },
});
