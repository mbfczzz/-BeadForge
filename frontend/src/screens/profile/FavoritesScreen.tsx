import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { HoverView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { wp, fp, screenW } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(15);
const GAP = wp(10);
const CARD_W = (screenW - PAD * 2 - GAP) / 2;

interface FavItem {
  id: number;
  title: string;
  author: string;
  patIdx: number;
  likeCount: number;
}

const MOCK_FAVS: FavItem[] = [
  { id: 1, title: '像素爱心', author: '小豆子', patIdx: 0, likeCount: 328 },
  { id: 2, title: '橘猫咪咪', author: '拼豆达人', patIdx: 1, likeCount: 512 },
  { id: 3, title: '超级蘑菇', author: '游戏迷', patIdx: 2, likeCount: 445 },
  { id: 4, title: '粉色小花', author: '花花世界', patIdx: 3, likeCount: 267 },
  { id: 5, title: '闪耀金星', author: '星空漫步', patIdx: 4, likeCount: 189 },
  { id: 6, title: '双子樱桃', author: '水果控', patIdx: 5, likeCount: 376 },
];

interface Props { onBack: () => void }

export const FavoritesScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>我的收藏</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <Text style={[$.count, { color: colors.textHint }]}>共 {MOCK_FAVS.length} 个收藏</Text>
        {MOCK_FAVS.length === 0 && (
          <View style={$.empty}>
            <Feather name="bookmark" size={fp(32)} color={colors.textHint} />
            <Text style={[$.emptyText, { color: colors.textHint }]}>还没有收藏，去发现页逛逛吧</Text>
          </View>
        )}
        <View style={$.grid}>
          {MOCK_FAVS.map((item) => {
            const pat = ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length];
            const bs = Math.floor((CARD_W - wp(24)) / (pat[0]?.length || 9)) - 1;
            return (
              <HoverView key={item.id} onPress={() => Alert.alert(item.title, `作者：${item.author}\n点赞：${item.likeCount}`)} style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]} hoverScale={1.02} hoverLift={3}>
                <View style={[$.cardCover, { backgroundColor: dark ? '#2a2a2a' : '#fafafa' }]}>
                  <BeadGrid pixels={pat} beadSize={Math.min(bs, wp(12))} gap={1} round />
                </View>
                <View style={$.cardBody}>
                  <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={$.cardFooter}>
                    <Text style={[$.cardAuthor, { color: colors.textHint }]}>{item.author}</Text>
                    <View style={$.cardLike}>
                      <Feather name="heart" size={fp(10)} color="#EF4444" />
                      <Text style={[$.cardLikeNum, { color: colors.textHint }]}>{item.likeCount}</Text>
                    </View>
                  </View>
                </View>
              </HoverView>
            );
          })}
        </View>
      </ScrollView>
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
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '600', textAlign: 'center' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  count: { fontSize: FontSize.xs, paddingHorizontal: PAD, marginTop: wp(12) },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: wp(60), gap: wp(10) },
  emptyText: { fontSize: FontSize.sm },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: PAD, paddingTop: wp(10), gap: GAP,
  },
  card: {
    width: CARD_W, borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden',
    ...shadow(1, 4, 0.06, '#000', 2),
  },
  cardCover: {
    height: wp(100), justifyContent: 'center', alignItems: 'center',
    borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg,
  },
  cardBody: { padding: wp(10), gap: wp(4) },
  cardTitle: { fontSize: FontSize.sm, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardAuthor: { fontSize: FontSize.xs },
  cardLike: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  cardLikeNum: { fontSize: FontSize.xs },
});
