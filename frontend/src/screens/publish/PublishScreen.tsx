import React, { useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform, Pressable, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, HoverView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const PAD = wp(15);

/* ──────────────── Mock 数据 ──────────────── */

interface FeedItem {
  id: number;
  user: { name: string; title: string };
  content: string;
  patternIdx: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  timeAgo: string;
  tags: string[];
}

const FEEDS: FeedItem[] = [
  {
    id: 1, user: { name: '小豆子', title: '拼豆达人 Lv.5' },
    content: '第一次尝试做橘猫，熨烫的时候差点烫歪了 😂 不过最终效果还不错！分享给大家~',
    patternIdx: 1, likeCount: 128, commentCount: 23, shareCount: 5, timeAgo: '2小时前',
    tags: ['猫咪', '新手'],
  },
  {
    id: 2, user: { name: '像素艺术家', title: '创作者' },
    content: '用 AI 生成了一个星空主题的图案，然后手动调整了配色。AI + 手工 = 完美搭配！',
    patternIdx: 4, likeCount: 256, commentCount: 41, shareCount: 18, timeAgo: '3小时前',
    tags: ['AI创作', '星空'],
  },
  {
    id: 3, user: { name: '花花世界', title: '拼豆达人 Lv.3' },
    content: '春天来了，做了一朵小花送给妈妈当胸针 🌸 她超开心的！',
    patternIdx: 3, likeCount: 342, commentCount: 56, shareCount: 12, timeAgo: '5小时前',
    tags: ['花卉', '礼物'],
  },
  {
    id: 4, user: { name: '游戏迷', title: '像素爱好者' },
    content: '马里奥蘑菇完成！用了两种红色做渐变，比单色版好看多了。下一个目标：做一套完整角色~',
    patternIdx: 2, likeCount: 189, commentCount: 34, shareCount: 8, timeAgo: '8小时前',
    tags: ['游戏', '马里奥'],
  },
  {
    id: 5, user: { name: '彩虹桥', title: '手作达人' },
    content: '给闺蜜做了一对樱桃耳环，用 2.6mm 迷你珠，精致到哭！配件用的是市场上买的 S925 耳钩',
    patternIdx: 5, likeCount: 467, commentCount: 89, shareCount: 31, timeAgo: '昨天',
    tags: ['饰品', '耳环'],
  },
  {
    id: 6, user: { name: '钻石控', title: '新人创作者' },
    content: '宝石拼豆第一弹！蓝色钻石搞定✨ 接下来挑战红宝石',
    patternIdx: 6, likeCount: 95, commentCount: 12, shareCount: 3, timeAgo: '昨天',
    tags: ['宝石', '新手'],
  },
  {
    id: 7, user: { name: '拼豆小屋', title: '拼豆达人 Lv.8' },
    content: '彩虹挂画完成了！这个用了快 600 颗珠子，7 种颜色。推荐新手从这个练起，配色简单效果好。',
    patternIdx: 7, likeCount: 521, commentCount: 78, shareCount: 45, timeAgo: '2天前',
    tags: ['彩虹', '教程'],
  },
];

const TABS = ['推荐', '关注', '最新'];

/* ──────────────── 主屏幕 ──────────────── */

export const PublishScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const [tabIdx, setTabIdx] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* 顶部 */}
      <View style={[$.header, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <Text style={[$.headerTitle, { color: colors.text }]}>动态</Text>
        <View style={$.tabRow}>
          {TABS.map((t, i) => (
            <HoverView
              key={t}
              onPress={() => setTabIdx(i)}
              style={[$.tab, i === tabIdx && $.tabActive, i === tabIdx && { borderBottomColor: colors.accent }]}
              hoverScale={1.03} hoverLift={0}
            >
              <Text style={[$.tabText, { color: i === tabIdx ? colors.accent : colors.textHint }, i === tabIdx && { fontWeight: '700' }]}>{t}</Text>
            </HoverView>
          ))}
        </View>
        <HoverView onPress={() => setShowSearch(!showSearch)} style={[$.searchBtn, { backgroundColor: showSearch ? colors.accentLight : colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="search" size={fp(16)} color={showSearch ? colors.accent : colors.textHint} />
        </HoverView>
      </View>

      {showSearch && (
        <View style={[$.searchBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Feather name="search" size={fp(14)} color={colors.textHint} />
          <TextInput
            style={[$.searchInput, { color: colors.text }]}
            placeholder="搜索动态、用户..."
            placeholderTextColor={colors.textHint}
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
          />
          {searchText.length > 0 && (
            <HoverView onPress={() => setSearchText('')} hoverScale={1.1} hoverLift={0}>
              <Feather name="x" size={fp(14)} color={colors.textHint} />
            </HoverView>
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(80) }}>
        {FEEDS.map((feed) => (
          <FeedCard key={feed.id} feed={feed} colors={colors} dark={dark} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

/* ──────────────── 动态卡片 ──────────────── */

const FeedCard: React.FC<{ feed: FeedItem; colors: ThemeColors; dark: boolean }> = memo(({ feed, colors, dark }) => {
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const pat = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const previewW = screenW - PAD * 2 - wp(24);
  const bs = Math.floor(previewW / (pat[0]?.length || 9)) - 1;

  return (
    <View style={[$.feedCard, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {/* 用户头部 */}
      <View style={$.feedHeader}>
        <Avatar name={feed.user.name} size={wp(38)} />
        <View style={{ flex: 1, marginLeft: wp(10) }}>
          <Text style={[$.feedUserName, { color: colors.text }]}>{feed.user.name}</Text>
          <Text style={[$.feedUserTitle, { color: colors.textHint }]}>{feed.user.title} · {feed.timeAgo}</Text>
        </View>
        <HoverView onPress={() => setFollowed(!followed)} style={[$.feedFollowBtn, { borderColor: followed ? colors.border : colors.accent, backgroundColor: followed ? colors.inputBg : 'transparent' }]} hoverScale={1.05} hoverLift={0}>
          <Text style={[$.feedFollowText, { color: followed ? colors.textHint : colors.accent }]}>{followed ? '已关注' : '关注'}</Text>
        </HoverView>
      </View>

      {/* 内容 */}
      <Text style={[$.feedContent, { color: colors.text }]} numberOfLines={4}>{feed.content}</Text>

      {/* 标签 */}
      <View style={$.feedTags}>
        {feed.tags.map((tag) => (
          <View key={tag} style={[$.feedTag, { backgroundColor: colors.accentLight }]}>
            <Text style={[$.feedTagText, { color: colors.accent }]}>#{tag}</Text>
          </View>
        ))}
      </View>

      {/* 图案预览 */}
      <View style={[$.feedPreview, { backgroundColor: dark ? '#2a2a2a' : '#fafafa' }]}>
        <BeadGrid pixels={pat} beadSize={Math.min(bs, wp(18))} gap={1} round />
      </View>

      {/* 互动栏 */}
      <View style={$.feedActions}>
        <FeedAction
          icon={liked ? 'heart' : 'heart'}
          label={String(liked ? feed.likeCount + 1 : feed.likeCount)}
          active={liked}
          activeColor="#EF4444"
          color={colors.textHint}
          onPress={() => setLiked(!liked)}
        />
        <FeedAction icon="message-circle" label={String(feed.commentCount)} color={colors.textHint} />
        <FeedAction icon="share-2" label={String(feed.shareCount)} color={colors.textHint} />
        <View style={{ flex: 1 }} />
        <FeedAction icon="bookmark" label="" color={colors.textHint} />
      </View>
    </View>
  );
});

/* ──────────────── 互动按钮 ──────────────── */

const FeedAction: React.FC<{
  icon: string; label: string; color: string;
  active?: boolean; activeColor?: string; onPress?: () => void;
}> = ({ icon, label, color, active, activeColor, onPress }) => {
  const [hovered, setHovered] = useState(false);
  const c = active ? activeColor || color : color;
  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore: RN Web hover events
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[$.feedActionBtn, hovered && { opacity: 0.6 }, Platform.OS === 'web' && { transitionDuration: '0.15s' } as any]}
    >
      <Feather name={icon as any} size={fp(16)} color={c} />
      {label ? <Text style={[$.feedActionLabel, { color: c }]}>{label}</Text> : null}
    </Pressable>
  );
};

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD, borderBottomWidth: 1,
    gap: wp(6),
  },
  headerTitle: { fontSize: fp(22), fontWeight: '700', marginRight: wp(8) },
  tabRow: { flex: 1, flexDirection: 'row', gap: wp(4) },
  tab: { paddingHorizontal: wp(10), paddingVertical: wp(6), borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: FontSize.md },
  searchBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },

  // 搜索栏
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: wp(8),
    paddingHorizontal: PAD, paddingVertical: wp(8),
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1, fontSize: FontSize.md, height: wp(32),
    padding: 0,
  },

  // 动态卡片
  feedCard: {
    paddingHorizontal: PAD, paddingVertical: wp(14),
    borderBottomWidth: 1,
  },
  feedHeader: {
    flexDirection: 'row', alignItems: 'center',
  },
  feedUserName: { fontSize: FontSize.md, fontWeight: '600' },
  feedUserTitle: { fontSize: FontSize.xs, marginTop: wp(2) },
  feedFollowBtn: {
    paddingHorizontal: wp(12), paddingVertical: wp(5),
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  feedFollowText: { fontSize: FontSize.xs, fontWeight: '600' },
  feedContent: {
    fontSize: FontSize.md, lineHeight: fp(21),
    marginTop: wp(10),
  },
  feedTags: {
    flexDirection: 'row', flexWrap: 'wrap', gap: wp(6),
    marginTop: wp(8),
  },
  feedTag: {
    paddingHorizontal: wp(8), paddingVertical: wp(3),
    borderRadius: wp(4),
  },
  feedTagText: { fontSize: fp(11), fontWeight: '500' },
  feedPreview: {
    marginTop: wp(10), borderRadius: BorderRadius.lg,
    padding: wp(14), alignItems: 'center',
    ...shadow(1, 4, 0.05, '#000', 1),
  },
  feedActions: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: wp(10), gap: wp(4),
  },
  feedActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(5),
    paddingHorizontal: wp(10), paddingVertical: wp(6),
  },
  feedActionLabel: { fontSize: FontSize.xs },
});
