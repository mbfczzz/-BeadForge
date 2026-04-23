import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HoverView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { wp, fp } from '../../utils/responsive';

const PAD = wp(16);

interface LikeItem {
  id: number;
  title: string;
  author: string;
  patIdx: number;
  likeCount: number;
  timeAgo: string;
}

const MOCK_LIKES: LikeItem[] = [
  { id: 1, title: '七色彩虹', author: '彩虹桥', patIdx: 7, likeCount: 421, timeAgo: '1小时前' },
  { id: 2, title: '皮卡丘', author: '小豆子', patIdx: 1, likeCount: 689, timeAgo: '3小时前' },
  { id: 3, title: '冰蓝钻石', author: '珠宝匠', patIdx: 6, likeCount: 298, timeAgo: '昨天' },
  { id: 4, title: '草莓蛋糕', author: '甜品师', patIdx: 3, likeCount: 467, timeAgo: '昨天' },
  { id: 5, title: '橘猫咪咪', author: '拼豆达人', patIdx: 1, likeCount: 512, timeAgo: '2天前' },
  { id: 6, title: '日落渐变', author: '彩虹桥', patIdx: 7, likeCount: 356, timeAgo: '3天前' },
  { id: 7, title: '超级蘑菇', author: '游戏迷', patIdx: 2, likeCount: 445, timeAgo: '3天前' },
  { id: 8, title: '西瓜片', author: '拼豆达人', patIdx: 5, likeCount: 523, timeAgo: '上周' },
];

interface Props { onBack: () => void }

export const LikesScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>我的点赞</Text>
        <View style={{ width: wp(34) }} />
      </View>

      {/* 统计条 */}
      <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text style={[$.statsText, { color: colors.textSecondary }]}>共 {MOCK_LIKES.length} 个点赞</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        {MOCK_LIKES.length === 0 && (
          <View style={$.emptyWrap}>
            <View style={[$.emptyIcon, { backgroundColor: dark ? colors.candy.pink + '30' : colors.accentLight }]}>
              <Feather name="heart" size={fp(28)} color={colors.accent} />
            </View>
            <Text style={[$.emptyTitle, { color: colors.text }]}>还没有点赞</Text>
            <Text style={[$.emptySub, { color: colors.textHint }]}>去发现喜欢的作品吧</Text>
          </View>
        )}
        {MOCK_LIKES.map((item, idx) => {
          const pat = ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length];
          return (
            <HoverView
              key={item.id}
              onPress={() => Alert.alert(item.title, `作者：${item.author}\n点赞：${item.likeCount}`)}
              style={[$.likeCard, {
                backgroundColor: colors.surface,
                borderBottomColor: idx < MOCK_LIKES.length - 1 ? colors.divider : 'transparent',
                borderBottomWidth: idx < MOCK_LIKES.length - 1 ? StyleSheet.hairlineWidth : 0,
              }]}
              hoverScale={1.01} hoverLift={1}
            >
              <View style={[$.thumb, { backgroundColor: dark ? '#1e1e1e' : '#FAFAFA' }]}>
                <BeadGrid pixels={pat} beadSize={wp(5)} gap={0.5} round />
              </View>
              <View style={$.likeInfo}>
                <Text style={[$.likeTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[$.likeAuthor, { color: colors.textHint }]}>{item.author}</Text>
              </View>
              <View style={$.likeRight}>
                <View style={$.likeCountRow}>
                  <Feather name="heart" size={fp(12)} color={colors.accent} />
                  <Text style={[$.likeNum, { color: colors.textSecondary }]}>{item.likeCount}</Text>
                </View>
                <Text style={[$.likeTime, { color: colors.textHint }]}>{item.timeAgo}</Text>
              </View>
            </HoverView>
          );
        })}
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

  likeCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(14),
    gap: wp(12),
  },
  thumb: {
    width: wp(54), height: wp(54), borderRadius: wp(16),
    justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden',
  },
  likeInfo: { flex: 1 },
  likeTitle: { fontSize: fp(14), fontWeight: '700' },
  likeAuthor: { fontSize: fp(11), marginTop: wp(3) },
  likeRight: { alignItems: 'flex-end', gap: wp(4) },
  likeCountRow: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  likeNum: { fontSize: fp(12), fontWeight: '600' },
  likeTime: { fontSize: fp(10) },
});
