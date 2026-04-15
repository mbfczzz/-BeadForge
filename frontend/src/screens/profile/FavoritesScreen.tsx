import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HoverView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { wp, fp } from '../../utils/responsive';

const PAD = wp(16);
const GAP = wp(10);
const W = Dimensions.get('window').width;
const CARD_W = Math.floor((W - PAD * 2 - GAP) / 2);

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

      <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text style={[$.statsText, { color: colors.textSecondary }]}>共 {MOCK_FAVS.length} 个收藏</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        {MOCK_FAVS.length === 0 ? (
          <View style={$.emptyWrap}>
            <View style={[$.emptyIcon, { backgroundColor: dark ? '#1a1a2a' : '#FFF9E6' }]}>
              <Feather name="bookmark" size={fp(28)} color="#FBBF24" />
            </View>
            <Text style={[$.emptyTitle, { color: colors.text }]}>还没有收藏</Text>
            <Text style={[$.emptySub, { color: colors.textHint }]}>去发现页逛逛吧</Text>
          </View>
        ) : (
          <View style={$.grid}>
            {MOCK_FAVS.map((item, i) => {
              const pat = ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length];
              const bs = Math.min(Math.floor((CARD_W - wp(20)) / (pat[0]?.length || 9)), wp(8));
              return (
                <View key={item.id} style={{ width: CARD_W, marginBottom: GAP, marginLeft: i % 2 === 1 ? GAP : 0 }}>
                  <HoverView
                    onPress={() => Alert.alert(item.title, `作者：${item.author}\n点赞：${item.likeCount}`)}
                    style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
                    hoverScale={1.02} hoverLift={2}
                  >
                    <View style={[$.cardCover, { backgroundColor: dark ? '#1e1e1e' : '#FAFAFA' }]}>
                      <BeadGrid pixels={pat} beadSize={bs} gap={1} round />
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
                </View>
              );
            })}
          </View>
        )}
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
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
  statsBar: {
    paddingHorizontal: PAD, paddingVertical: wp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsText: { fontSize: fp(12), fontWeight: '500' },
  emptyWrap: { alignItems: 'center', paddingTop: wp(60) },
  emptyIcon: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
  },
  emptyTitle: { fontSize: fp(16), fontWeight: '700', marginBottom: wp(6) },
  emptySub: { fontSize: fp(13) },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: PAD, paddingTop: wp(12),
  },
  card: {
    borderRadius: wp(12), borderWidth: 1, overflow: 'hidden',
  },
  cardCover: {
    height: wp(90), justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  cardBody: { padding: wp(10) },
  cardTitle: { fontSize: fp(13), fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: wp(4) },
  cardAuthor: { fontSize: fp(10) },
  cardLike: { flexDirection: 'row', alignItems: 'center' },
  cardLikeNum: { fontSize: fp(10), marginLeft: wp(3) },
});
