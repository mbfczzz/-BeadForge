import React, { useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { usePatternStore, type MarketPattern } from '../../store/usePatternStore';
import { useTheme } from '../../theme';
import type { RootScreenProps } from '../../navigation/types';
import { BOTTOM_SAFE_H, fp, getCardWidth, wp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(18);
const CARD_GAP = wp(12);
const CARD_W = getCardWidth(PAD, CARD_GAP, 2);
const HERO_BODY_H = wp(220);

function sortPatterns(items: MarketPattern[], mode: 'latest' | 'hot' = 'hot') {
  const sorted = [...items];
  if (mode === 'latest') {
    sorted.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    return sorted;
  }
  sorted.sort((a, b) => b.downloads - a.downloads);
  return sorted;
}

function splitIntoColumns(items: MarketPattern[]) {
  return items.reduce<{ left: MarketPattern[]; right: MarketPattern[] }>(
    (acc, item, index) => {
      if (index % 2 === 0) acc.left.push(item);
      else acc.right.push(item);
      return acc;
    },
    { left: [], right: [] },
  );
}

// 简单亮度判断：banner 用浅色背景时状态栏字用 dark，否则 light
function isLightHex(hex?: string) {
  if (!hex) return false;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.replace('#', ''));
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  // 简化版 relative luminance
  return r * 0.299 + g * 0.587 + b * 0.114 > 186;
}

export const BannerDetailScreen: React.FC<RootScreenProps<'BannerDetail'>> = ({ route, navigation }) => {
  const { banner } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const listings = usePatternStore((state) => state.listings);
  const myListings = usePatternStore((state) => state.myListings);
  const refreshing = usePatternStore((state) => state.refreshing);
  const refreshListings = usePatternStore((state) => state.refreshListings);

  const statusBarStyle: 'light' | 'dark' = isLightHex(banner.bg) ? 'dark' : 'light';

  useEffect(() => {
    if (listings.length === 0) {
      void refreshListings();
    }
  }, [listings.length, refreshListings]);

  const filtered = useMemo(() => {
    const list = banner.cat ? listings.filter((item) => item.cat === banner.cat) : listings;
    return sortPatterns(list, banner.sort ?? 'hot');
  }, [banner.cat, banner.sort, listings]);

  const columns = useMemo(() => splitIntoColumns(filtered), [filtered]);

  const heroPixels = ALL_PATTERNS[banner.pi % ALL_PATTERNS.length];
  const isLightBg = isLightHex(banner.bg);
  const heroTextColor = banner.textColor || (isLightBg ? '#1F2937' : '#FFFFFF');
  const heroSubColor = banner.textColor
    ? `${banner.textColor}CC`
    : (isLightBg ? 'rgba(15,23,42,0.66)' : 'rgba(255,255,255,0.86)');
  const heroChipBg = banner.textColor
    ? `${banner.textColor}22`
    : (isLightBg ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.18)');
  const heroChipBorder = banner.textColor
    ? `${banner.textColor}44`
    : (isLightBg ? 'rgba(15,23,42,0.18)' : 'rgba(255,255,255,0.28)');
  const heroDecoColor = isLightBg ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.12)';
  const heroNavBtnBg = isLightBg ? 'rgba(15,23,42,0.08)' : 'rgba(0,0,0,0.18)';
  const heroPreviewBg = isLightBg ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.14)';

  const openDetail = (resourceId: number) => {
    navigation.navigate('ResourceDetail', { resourceId });
  };

  const renderStatusText = (file: MarketPattern) => {
    if (myListings.has(file.id)) return '已购';
    if (file.accessMode === 'free') return '免费';
    if (file.accessMode === 'points') return `${file.pointsCost} 积分`;
    return '会员';
  };

  const renderStatusColor = (file: MarketPattern) => {
    if (myListings.has(file.id)) return colors.success;
    if (file.accessMode === 'free') return colors.success;
    if (file.accessMode === 'points') return colors.gold;
    return colors.accent;
  };

  const renderCoverHeight = (item: MarketPattern) => wp(152) + (item.id % 3) * wp(18);

  const renderCard = (item: MarketPattern) => {
    const pixels = item.gridData || ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length];
    const previewHeight = renderCoverHeight(item);

    return (
      <View key={item.id} style={styles.cardWrap}>
        <Pressable onPress={() => openDetail(item.id)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <LinearGradient
              colors={[colors.inputBg, colors.surface] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.preview, { height: previewHeight, borderColor: colors.divider }]}
            >
              <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
                <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{item.cat}</Text>
              </View>
              <BeadGrid pixels={pixels} beadSize={wp(5.6)} gap={0.8} round glossy={false} />
            </LinearGradient>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <View style={styles.likeRow}>
                  <Feather name="heart" size={fp(12)} color={colors.textHint} />
                  <Text style={[styles.metaText, { color: colors.textHint }]}>{item.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{item.desc}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.metaText, { color: colors.textHint }]}>{item.cols}x{item.rows}</Text>
                <Text style={[styles.statusText, { color: renderStatusColor(item) }]}>{renderStatusText(item)}</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  const heroHeight = insets.top + wp(60) + HERO_BODY_H;

  const header = (
    <View>
      <View style={[styles.heroWrap, { height: heroHeight, backgroundColor: banner.bg }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(0,0,0,0.18)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={[styles.decoCircle, styles.decoCircleA, { backgroundColor: heroDecoColor }]} />
        <View style={[styles.decoCircle, styles.decoCircleB, { backgroundColor: heroDecoColor }]} />

        <View style={[styles.heroNav, { paddingTop: insets.top + wp(8) }]}>
          <TouchableOpacity
            style={[styles.heroNavButton, { backgroundColor: heroNavBtnBg }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Feather name="arrow-left" size={fp(18)} color={heroTextColor} />
          </TouchableOpacity>
          <View style={{ width: wp(36) }} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroTextWrap}>
            {banner.eyebrow ? (
              <View style={[styles.heroChip, { backgroundColor: heroChipBg, borderColor: heroChipBorder }]}>
                <Text style={[styles.heroChipText, { color: heroTextColor }]}>{banner.eyebrow}</Text>
              </View>
            ) : null}
            <Text style={[styles.heroTitle, { color: heroTextColor }]} numberOfLines={2}>{banner.title}</Text>
            {banner.sub ? (
              <Text style={[styles.heroSub, { color: heroSubColor }]} numberOfLines={3}>{banner.sub}</Text>
            ) : null}
            <View style={styles.heroMetaRow}>
              <View style={[styles.heroMetaPill, { backgroundColor: heroChipBg, borderColor: heroChipBorder }]}>
                <Feather
                  name={banner.sort === 'latest' ? 'clock' : 'trending-up'}
                  size={fp(10)}
                  color={heroTextColor}
                />
                <Text style={[styles.heroMetaPillText, { color: heroTextColor }]}>
                  {banner.sort === 'latest' ? '最新上架' : '热门优先'}
                </Text>
              </View>
              {banner.cat ? (
                <View style={[styles.heroMetaPill, { backgroundColor: heroChipBg, borderColor: heroChipBorder }]}>
                  <Feather name="tag" size={fp(10)} color={heroTextColor} />
                  <Text style={[styles.heroMetaPillText, { color: heroTextColor }]}>{banner.cat}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={[styles.heroPreviewWrap, { borderColor: heroChipBorder, backgroundColor: heroPreviewBg }]}>
            <BeadGrid pixels={heroPixels} beadSize={wp(8.5)} gap={0.8} round glossy={false} />
          </View>
        </View>
      </View>

      <View style={[styles.heroSpacer, { backgroundColor: colors.bg }]} />

      <View style={styles.summaryRow}>
        <View style={styles.summaryTitleRow}>
          <View style={[styles.summaryAccent, { backgroundColor: banner.bg }]} />
          <Text style={[styles.summaryTitle, { color: colors.text }]}>
            {banner.cat ? `${banner.cat}主题图纸` : '专题精选'}
          </Text>
        </View>
        <Text style={[styles.summaryHint, { color: colors.textHint }]}>{filtered.length} 个图纸</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar style={statusBarStyle} />
      <FlatList
        data={[0]}
        keyExtractor={() => 'banner-detail'}
        renderItem={() => (
          <View style={styles.masonryRow}>
            <View style={styles.masonryColumn}>{columns.left.map(renderCard)}</View>
            <View style={styles.masonryColumn}>{columns.right.map(renderCard)}</View>
          </View>
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={(
          <View style={styles.emptyWrap}>
            <StateView empty emptyText="暂无该主题图纸，先去其他主题逛逛" />
          </View>
        )}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { void refreshListings(); }}
            tintColor={colors.accent}
            // 顶部下拉指示器从 hero 下沿出现，避免被 hero 圆弧遮挡
            progressViewOffset={insets.top + wp(40)}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingBottom: wp(36) + BOTTOM_SAFE_H,
  },
  heroWrap: {
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: wp(28),
    borderBottomRightRadius: wp(28),
  },
  decoCircle: {
    position: 'absolute',
    borderRadius: 9999,
  },
  decoCircleA: {
    width: wp(180),
    height: wp(180),
    top: -wp(60),
    right: -wp(40),
  },
  decoCircleB: {
    width: wp(120),
    height: wp(120),
    bottom: -wp(40),
    left: -wp(20),
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    paddingBottom: wp(4),
  },
  heroNavButton: {
    width: wp(36),
    height: wp(36),
    borderRadius: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: wp(8),
    paddingBottom: wp(24),
  },
  heroTextWrap: {
    flex: 1,
    paddingRight: wp(12),
  },
  heroChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(10),
    paddingVertical: wp(4),
    borderRadius: wp(999),
    borderWidth: 1,
    marginBottom: wp(10),
  },
  heroChipText: {
    fontSize: fp(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: fp(24),
    fontWeight: '900',
    lineHeight: fp(30),
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: fp(12),
    lineHeight: fp(18),
    marginTop: wp(10),
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(8),
    marginTop: wp(14),
  },
  heroMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
    borderWidth: 1,
  },
  heroMetaPillText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  heroPreviewWrap: {
    width: wp(108),
    height: wp(108),
    borderRadius: wp(22),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSpacer: {
    height: wp(12),
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PAD,
    marginBottom: wp(12),
  },
  summaryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(8),
  },
  summaryAccent: {
    width: wp(4),
    height: fp(18),
    borderRadius: wp(2),
  },
  summaryTitle: {
    fontSize: fp(16),
    fontWeight: '800',
  },
  summaryHint: {
    fontSize: fp(12),
  },
  masonryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: CARD_GAP,
    paddingHorizontal: PAD,
  },
  masonryColumn: {
    width: CARD_W,
    gap: CARD_GAP,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    borderRadius: wp(24),
    borderWidth: 1,
    overflow: 'hidden',
    ...shadow(8, 24, 0.06, '#1D3D6B', 6),
  },
  preview: {
    borderBottomWidth: 1,
    paddingHorizontal: wp(12),
    paddingTop: wp(12),
    paddingBottom: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: wp(12),
    left: wp(12),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  categoryBadgeText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  cardBody: {
    paddingHorizontal: wp(12),
    paddingVertical: wp(12),
    gap: wp(6),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(8),
  },
  cardTitle: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '800',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
  },
  cardDesc: {
    fontSize: fp(11),
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: fp(10),
    fontWeight: '600',
  },
  statusText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
  emptyWrap: {
    paddingVertical: wp(40),
  },
});
