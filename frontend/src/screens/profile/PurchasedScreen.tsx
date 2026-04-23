import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HoverView, StateView } from '../../components/common';
import { wp, fp, screenW } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import client from '../../api/client';

const PAD = wp(16);
const GAP = wp(10);
const CARD_W = (screenW - PAD * 2 - GAP) / 2;

interface PatternItem {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  isFree: boolean;
  cols: number;
  rows: number;
  downloads: number;
  rating: number;
}

// 水墨国风分类色
const CATEGORY_COLORS: Record<string, string> = {
  '抽象': '#6B4F8F', // 青莲
  '动物': '#CC7B3F', // 柿红
  '卡通': '#C8302B', // 朱砂
  '花卉': '#C94F5D', // 胭脂
  '美食': '#4D8A5E', // 松绿
  '像素': '#7BA4C9', // 天青
  '风景': '#8FB59A', // 竹青
};

interface Props { onBack: () => void }

export const PurchasedScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [idsRes, listRes]: any[] = await Promise.all([
        client.get('/patterns/purchased'),
        client.get('/patterns/list', { params: { page: 1, size: 100 } }),
      ]);
      const ids: number[] = idsRes.data || [];
      const all: PatternItem[] = listRes.data?.records || listRes.data || [];
      setPatterns(all.filter((p) => ids.includes(p.id)));
    } catch {
      setPatterns([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    return (
      <View style={$.starsRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <Feather
            key={i}
            name="star"
            size={fp(9)}
            color={i < full ? '#FBBF24' : i === full && half ? '#FBBF24' : colors.border}
          />
        ))}
        <Text style={[$.ratingNum, { color: colors.textHint }]}>{rating}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: PatternItem }) => {
    const catColor = CATEGORY_COLORS[item.category] || colors.accent;
    return (
      <View style={[$.card, {
        backgroundColor: colors.surface,
        borderColor: dark ? colors.border : colors.border,
        ...(dark ? {} : shadow(3, 10, 0.08, '#5A4A3E', 2)),
      }]}>
        {/* 封面占位 */}
        <View style={[$.cardCover, { backgroundColor: dark ? '#1e1e1e' : '#FAFAFA' }]}>
          {/* 网格装饰 */}
          <View style={$.gridDeco}>
            {Array.from({ length: 9 }, (_, i) => (
              <View key={i} style={[$.gridCell, {
                backgroundColor: i % 3 === 1 ? catColor + '30' : (dark ? '#2a2a2a' : '#ECECEC'),
              }]} />
            ))}
          </View>
          <Text style={[$.cardSize, { color: colors.textHint }]}>{item.cols} x {item.rows}</Text>

          {/* 分类标签 */}
          <View style={[$.catBadge, { backgroundColor: catColor + '18' }]}>
            <Text style={[$.catText, { color: catColor }]}>{item.category}</Text>
          </View>
        </View>

        {/* 信息 */}
        <View style={$.cardBody}>
          <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
          <Text style={[$.cardDesc, { color: colors.textHint }]} numberOfLines={1}>{item.description}</Text>

          {renderStars(item.rating)}

          <View style={$.cardFooter}>
            <View style={$.downloadStat}>
              <Feather name="download-cloud" size={fp(10)} color={colors.textHint} />
              <Text style={[$.downloadNum, { color: colors.textHint }]}>{item.downloads}</Text>
            </View>
            <View style={[$.priceBadge, {
              backgroundColor: item.isFree ? '#22C55E12' : catColor + '12',
            }]}>
              <Text style={[$.priceText, { color: item.isFree ? '#4D8A5E' : catColor }]}>
                {item.isFree ? '免费' : `¥${item.price}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>已购图纸</Text>
        <View style={{ width: wp(34) }} />
      </View>

      {/* 统计条 */}
      {!loading && patterns.length > 0 && (
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textSecondary }]}>共 {patterns.length} 份图纸</Text>
        </View>
      )}

      <FlatList
        data={patterns}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ padding: PAD, gap: GAP, paddingBottom: wp(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={loading
          ? <StateView loading />
          : (
            <View style={$.emptyWrap}>
              <View style={[$.emptyIcon, { backgroundColor: dark ? colors.candy.sky + '30' : '#E5EEF5' }]}>
                <Feather name="shopping-bag" size={fp(28)} color="#7BA4C9" />
              </View>
              <Text style={[$.emptyTitle, { color: colors.text }]}>还没有购买图纸</Text>
              <Text style={[$.emptySub, { color: colors.textHint }]}>去图纸市场逛逛吧</Text>
            </View>
          )
        }
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

  statsBar: {
    paddingHorizontal: PAD, paddingVertical: wp(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsText: { fontSize: fp(12), fontWeight: '500' },

  card: {
    width: CARD_W, borderRadius: wp(20), borderWidth: 1, overflow: 'hidden',
  },
  cardCover: {
    height: wp(95), justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  gridDeco: {
    width: wp(42), height: wp(42),
    flexDirection: 'row', flexWrap: 'wrap', gap: wp(3),
    marginBottom: wp(4),
  },
  gridCell: {
    width: wp(12), height: wp(12), borderRadius: wp(2),
  },
  cardSize: { fontSize: fp(9), fontWeight: '500' },
  catBadge: {
    position: 'absolute', top: wp(6), right: wp(6),
    paddingHorizontal: wp(6), paddingVertical: wp(2),
    borderRadius: wp(4),
  },
  catText: { fontSize: fp(9), fontWeight: '700' },

  cardBody: { padding: wp(10), gap: wp(3) },
  cardTitle: { fontSize: fp(13), fontWeight: '700' },
  cardDesc: { fontSize: fp(10), lineHeight: fp(14) },

  starsRow: { flexDirection: 'row', alignItems: 'center', gap: wp(1), marginTop: wp(2) },
  ratingNum: { fontSize: fp(9), marginLeft: wp(3), fontWeight: '500' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: wp(4) },
  downloadStat: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  downloadNum: { fontSize: fp(10) },
  priceBadge: { paddingHorizontal: wp(7), paddingVertical: wp(2), borderRadius: wp(5) },
  priceText: { fontSize: fp(10), fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: wp(60) },
  emptyIcon: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
  },
  emptyTitle: { fontSize: fp(16), fontWeight: '700', marginBottom: wp(6) },
  emptySub: { fontSize: fp(13) },
});
