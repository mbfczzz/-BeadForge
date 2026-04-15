import React, { useState, memo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  KeyboardAvoidingView, Platform, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, HoverView, BeadGrid, ALL_PATTERNS } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import type { RootStackParamList, FeedItemData } from '../../navigation/types';
import type { RootScreenProps } from '../../navigation/types';

const PAD = wp(15);

/* ──────────────── Mock 评论 ──────────────── */

interface Comment {
  id: number;
  user: string;
  title: string;
  content: string;
  timeAgo: string;
  likeCount: number;
  replies?: Comment[];
}

const MOCK_COMMENTS: Record<number, Comment[]> = {
  1: [
    { id: 101, user: '拼豆新手', title: '入门玩家', content: '好可爱的橘猫！请问用的是什么牌子的拼豆板？', timeAgo: '1小时前', likeCount: 5,
      replies: [
        { id: 1011, user: '小豆子', title: '拼豆达人 Lv.5', content: '用的是 Perler 的大板，29×29 的那种~', timeAgo: '50分钟前', likeCount: 2 },
      ],
    },
    { id: 102, user: '猫猫控', title: '创作者', content: '太像了！这配色绝了', timeAgo: '1小时前', likeCount: 12 },
    { id: 103, user: '手工达人小美', title: '拼豆达人 Lv.7', content: '熨烫技巧：先低温快速过一遍定型，再高温慢慢熨，不容易歪~', timeAgo: '30分钟前', likeCount: 28 },
  ],
  2: [
    { id: 201, user: '科技小白', title: '新人', content: 'AI 生成图案太方便了！能分享一下提示词吗？', timeAgo: '2小时前', likeCount: 15 },
    { id: 202, user: '星空迷', title: '像素爱好者', content: '配色好梦幻，想要教程！', timeAgo: '1小时前', likeCount: 8 },
  ],
  3: [
    { id: 301, user: '暖暖妈妈', title: '手作达人', content: '好有心！妈妈收到一定很感动', timeAgo: '4小时前', likeCount: 23 },
    { id: 302, user: '花花世界', title: '拼豆达人 Lv.3', content: '谢谢大家！她戴着去跳广场舞了哈哈', timeAgo: '3小时前', likeCount: 45 },
  ],
  4: [
    { id: 401, user: '红白机怀旧', title: '游戏玩家', content: '这蘑菇太经典了！建议下一个做星星', timeAgo: '6小时前', likeCount: 9 },
    { id: 402, user: '游戏迷', title: '像素爱好者', content: '好主意！星星已经在做了，敬请期待~', timeAgo: '5小时前', likeCount: 14 },
  ],
  5: [
    { id: 501, user: '饰品控', title: '新人创作者', content: '2.6mm 的好难拼吧？手残党表示羡慕！', timeAgo: '20小时前', likeCount: 11 },
    { id: 502, user: '彩虹桥', title: '手作达人', content: '确实需要耐心，但成品真的超精致！用镊子会方便很多~', timeAgo: '18小时前', likeCount: 17 },
    { id: 503, user: '小珠珠', title: '拼豆达人 Lv.2', content: '求链接！耳钩在哪买的？', timeAgo: '15小时前', likeCount: 6 },
  ],
  6: [
    { id: 601, user: '宝石猎人', title: '像素爱好者', content: '期待红宝石！钻石切面做得好棒', timeAgo: '22小时前', likeCount: 4 },
  ],
  7: [
    { id: 701, user: '色彩星球', title: '新人', content: '600 颗！好有毅力，请问大概做了多久？', timeAgo: '1天前', likeCount: 13 },
    { id: 702, user: '拼豆小屋', title: '拼豆达人 Lv.8', content: '断断续续大概 4 个小时，边看剧边拼~', timeAgo: '1天前', likeCount: 20 },
    { id: 703, user: '彩虹控', title: '手作达人', content: '已经按你的教程做了一个！效果真好看', timeAgo: '12小时前', likeCount: 15 },
  ],
};

function getComments(feedId: number): Comment[] {
  return MOCK_COMMENTS[feedId] || [
    { id: 9001, user: '路人甲', title: '新人', content: '好看！收藏了~', timeAgo: '1小时前', likeCount: 3 },
  ];
}

function formatCount(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

// 相关推荐（简单 mock）
function getRelatedFeeds(currentId: number): FeedItemData[] {
  const ALL: FeedItemData[] = [
    { id: 1, user: { name: '小豆子', title: '拼豆达人 Lv.5' }, content: '第一次尝试做橘猫...', patternIdx: 1, likeCount: 128, commentCount: 23, shareCount: 5, timeAgo: '2小时前', tags: ['猫咪'] },
    { id: 3, user: { name: '花花世界', title: '拼豆达人 Lv.3' }, content: '春天来了，做了一朵小花...', patternIdx: 3, likeCount: 342, commentCount: 56, shareCount: 12, timeAgo: '5小时前', tags: ['花卉'] },
    { id: 5, user: { name: '彩虹桥', title: '手作达人' }, content: '给闺蜜做了一对樱桃耳环...', patternIdx: 5, likeCount: 467, commentCount: 89, shareCount: 31, timeAgo: '昨天', tags: ['饰品'] },
    { id: 7, user: { name: '拼豆小屋', title: '拼豆达人 Lv.8' }, content: '彩虹挂画完成了！...', patternIdx: 7, likeCount: 521, commentCount: 78, shareCount: 45, timeAgo: '2天前', tags: ['教程'] },
  ];
  return ALL.filter((f) => f.id !== currentId).slice(0, 3);
}

/* ──────────────── 主屏幕 ──────────────── */

export const FeedDetailScreen: React.FC<RootScreenProps<'FeedDetail'>> = ({ route }) => {
  const { feed } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>(getComments(feed.id));
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});
  const [showMore, setShowMore] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);
  const relatedFeeds = getRelatedFeeds(feed.id);

  const pat = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const previewW = screenW - PAD * 2 - wp(20);
  const bs = Math.floor(previewW / (pat[0]?.length || 9)) - 1;

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      Animated.sequence([
        Animated.timing(likeAnim, { toValue: 1.4, duration: 100, useNativeDriver: true }),
        Animated.timing(likeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleSend = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user: '我',
      title: '拼豆爱好者',
      content: replyTo ? `回复 @${replyTo}：${commentText.trim()}` : commentText.trim(),
      timeAgo: '刚刚',
      likeCount: 0,
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setReplyTo(null);
  };

  const handleReply = (userName: string) => {
    setReplyTo(userName);
    inputRef.current?.focus();
  };

  const handleShare = () => { /* haptic + visual feedback */ };
  const toggleCommentLike = (id: number) => setCommentLikes((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      {/* ═══ 顶栏 ═══ */}
      <View style={[$.topBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={$.navBtn} hoverScale={1.1} hoverLift={0}>
          <MCI name="arrow-left" size={fp(22)} color={colors.text} />
        </HoverView>
        <View style={$.topBarCenter}>
          <Avatar name={feed.user.name} size={wp(24)} />
          <Text style={[$.topBarName, { color: colors.text }]} numberOfLines={1}>{feed.user.name}</Text>
        </View>
        <HoverView onPress={() => setShowMore(!showMore)} style={$.navBtn} hoverScale={1.1} hoverLift={0}>
          <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
        </HoverView>
      </View>

      {/* 更多菜单 */}
      {showMore && (
        <Pressable style={$.menuOverlay} onPress={() => setShowMore(false)}>
          <View style={[$.menuSheet, { backgroundColor: colors.surface, ...shadow(2, 12, 0.12, '#000', 6) }]}>
            {[
              { icon: 'link-variant' as const, label: '复制链接', action: () => {} },
              { icon: 'flag-outline' as const, label: '举报内容', action: () => Alert.alert('举报', '感谢反馈，我们会尽快处理', [{ text: '好的' }]) },
              { icon: 'eye-off-outline' as const, label: '不感兴趣', action: () => { navigation.goBack(); } },
            ].map((m) => (
              <HoverView key={m.label} onPress={() => { setShowMore(false); m.action(); }} style={$.menuItem} hoverScale={1.02} hoverLift={0}>
                <MCI name={m.icon} size={fp(18)} color={colors.text} />
                <Text style={[$.menuLabel, { color: colors.text }]}>{m.label}</Text>
              </HoverView>
            ))}
          </View>
        </Pressable>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={wp(0)}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(20) }}>
          {/* ═══ 用户信息 ═══ */}
          <View style={[$.section, { backgroundColor: colors.surface }]}>
            <View style={$.authorRow}>
              <Pressable style={$.authorInfo} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
                <Avatar name={feed.user.name} size={wp(46)} />
                <View style={{ flex: 1, marginLeft: wp(12) }}>
                  <Text style={[$.authorName, { color: colors.text }]}>{feed.user.name}</Text>
                  <View style={$.authorMeta}>
                    <View style={[$.authorBadge, { backgroundColor: colors.accentLight }]}>
                      <Text style={[$.authorBadgeText, { color: colors.accent }]}>{feed.user.title}</Text>
                    </View>
                    <Text style={[$.authorTime, { color: colors.textHint }]}>{feed.timeAgo}</Text>
                  </View>
                </View>
              </Pressable>
              <HoverView
                onPress={() => setFollowed(!followed)}
                style={[$.followBtn, {
                  backgroundColor: followed ? 'transparent' : colors.accent,
                  borderColor: followed ? colors.border : colors.accent,
                }]}
                hoverScale={1.04} hoverLift={0}
              >
                <Text style={[$.followBtnText, { color: followed ? colors.textHint : '#fff' }]}>
                  {followed ? '已关注' : '+ 关注'}
                </Text>
              </HoverView>
            </View>

            {/* 全文 */}
            <Text style={[$.fullContent, { color: colors.text }]}>{feed.content}</Text>

            {/* 标签 */}
            <View style={$.tags}>
              {feed.tags.map((tag) => (
                <View key={tag} style={[$.tag, { backgroundColor: colors.accentLight }]}>
                  <Text style={[$.tagText, { color: colors.accent }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            {/* 图案预览 */}
            <View style={[$.preview, { backgroundColor: dark ? '#1e1e1e' : '#f8f8fa', borderColor: dark ? '#333' : '#eee' }]}>
              <BeadGrid pixels={pat} beadSize={Math.min(bs, wp(22))} gap={1} round glossy />
            </View>

            {/* 跨模块操作 */}
            <View style={$.crossActions}>
              <HoverView
                onPress={() => navigation.navigate('Editor', { mode: 'manual', cols: pat[0]?.length || 9, rows: pat.length })}
                style={[$.crossBtn, { backgroundColor: colors.accent }]}
                hoverScale={1.03} hoverLift={0}
              >
                <MCI name="palette-outline" size={fp(16)} color="#fff" />
                <Text style={$.crossBtnText}>我也要做</Text>
              </HoverView>
              <HoverView
                onPress={() => {
                  // 跳转到市场 tab
                  navigation.navigate('Main' as any, { screen: 'Market' } as any);
                }}
                style={[$.crossBtnOutline, { borderColor: colors.border }]}
                hoverScale={1.03} hoverLift={0}
              >
                <MCI name="store-outline" size={fp(16)} color={colors.text} />
                <Text style={[$.crossBtnOutlineText, { color: colors.text }]}>买材料</Text>
              </HoverView>
            </View>

            {/* 统计栏 */}
            <View style={[$.statsBar, { borderTopColor: colors.border }]}>
              <View style={$.statItem}>
                <Text style={[$.statCount, { color: colors.text }]}>{formatCount(liked ? feed.likeCount + 1 : feed.likeCount)}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>赞</Text>
              </View>
              <View style={[$.statDivider, { backgroundColor: colors.border }]} />
              <View style={$.statItem}>
                <Text style={[$.statCount, { color: colors.text }]}>{totalComments}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>评论</Text>
              </View>
              <View style={[$.statDivider, { backgroundColor: colors.border }]} />
              <View style={$.statItem}>
                <Text style={[$.statCount, { color: colors.text }]}>{feed.shareCount}</Text>
                <Text style={[$.statLabel, { color: colors.textHint }]}>分享</Text>
              </View>
            </View>

            {/* 互动按钮 */}
            <View style={$.actionBar}>
              <HoverView onPress={handleLike} style={[$.actionChip, { backgroundColor: liked ? '#FEE2E2' : dark ? '#2a2226' : '#faf5f5' }]} hoverScale={1.04} hoverLift={0}>
                <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                  <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(18)} color={liked ? '#EF4444' : '#E8A0A0'} />
                </Animated.View>
                <Text style={[$.actionChipText, { color: liked ? '#EF4444' : colors.textHint }]}>
                  {liked ? '已赞' : '点赞'}
                </Text>
              </HoverView>
              <HoverView onPress={() => inputRef.current?.focus()} style={[$.actionChip, { backgroundColor: dark ? '#1e2530' : '#f0f4ff' }]} hoverScale={1.04} hoverLift={0}>
                <MCI name="comment-text-outline" size={fp(18)} color={dark ? '#7B9FD4' : '#8BA4D0'} />
                <Text style={[$.actionChipText, { color: colors.textHint }]}>评论</Text>
              </HoverView>
              <HoverView onPress={handleShare} style={[$.actionChip, { backgroundColor: dark ? '#1e2e28' : '#f0faf5' }]} hoverScale={1.04} hoverLift={0}>
                <MCI name="share-outline" size={fp(18)} color={dark ? '#6DC4A0' : '#6BB89D'} />
                <Text style={[$.actionChipText, { color: colors.textHint }]}>分享</Text>
              </HoverView>
              <HoverView
                onPress={() => { setBookmarked(!bookmarked); }}
                style={[$.actionChip, { backgroundColor: bookmarked ? colors.accentLight : dark ? '#22222e' : '#f5f3ff' }]}
                hoverScale={1.04} hoverLift={0}
              >
                <MCI name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={fp(18)} color={bookmarked ? colors.accent : dark ? '#9B8FCF' : '#A99BD4'} />
              </HoverView>
            </View>
          </View>

          {/* ═══ 评论列表 ═══ */}
          <View style={[$.section, { backgroundColor: colors.surface, marginTop: wp(8) }]}>
            <View style={$.commentHeaderRow}>
              <Text style={[$.commentHeaderText, { color: colors.text }]}>评论</Text>
              <View style={[$.commentCountBadge, { backgroundColor: colors.accentLight }]}>
                <Text style={[$.commentCountText, { color: colors.accent }]}>{totalComments}</Text>
              </View>
            </View>
            {comments.length === 0 ? (
              <View style={$.commentEmpty}>
                <MCI name="comment-text-outline" size={fp(26)} color={colors.textHint} />
                <Text style={[$.commentEmptyText, { color: colors.textHint }]}>暂无评论，快来抢沙发~</Text>
              </View>
            ) : (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  colors={colors}
                  liked={!!commentLikes[c.id]}
                  onLike={() => toggleCommentLike(c.id)}
                  onUserPress={(name) => navigation.navigate('UserProfile', { userName: name })}
                  onReply={handleReply}
                />
              ))
            )}
          </View>

          {/* ═══ 相关推荐 ═══ */}
          {relatedFeeds.length > 0 && (
            <View style={[$.section, { backgroundColor: colors.surface, marginTop: wp(8) }]}>
              <Text style={[$.relatedTitle, { color: colors.text }]}>相关推荐</Text>
              {relatedFeeds.map((rf) => {
                const rPat = ALL_PATTERNS[rf.patternIdx % ALL_PATTERNS.length];
                const rBs = Math.floor(wp(50) / (rPat[0]?.length || 9)) - 1;
                return (
                  <Pressable
                    key={rf.id}
                    onPress={() => navigation.push('FeedDetail', { feed: rf })}
                    style={[$.relatedItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={[$.relatedPreview, { backgroundColor: dark ? '#222' : '#f8f8fa' }]}>
                      <BeadGrid pixels={rPat} beadSize={Math.max(rBs, wp(4))} gap={0} round />
                    </View>
                    <View style={$.relatedInfo}>
                      <Text style={[$.relatedContent, { color: colors.text }]} numberOfLines={2}>{rf.content}</Text>
                      <View style={$.relatedMeta}>
                        <Text style={[$.relatedUser, { color: colors.textHint }]}>{rf.user.name}</Text>
                        <MCI name="heart-outline" size={fp(12)} color={colors.textHint} />
                        <Text style={[$.relatedLikes, { color: colors.textHint }]}>{formatCount(rf.likeCount)}</Text>
                      </View>
                    </View>
                    <MCI name="chevron-right" size={fp(18)} color={colors.textHint} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* ═══ 评论输入栏 ═══ */}
        <View style={[$.inputBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
          {replyTo && (
            <View style={[$.replyHint, { backgroundColor: colors.accentLight }]}>
              <Text style={[$.replyHintText, { color: colors.accent }]}>回复 @{replyTo}</Text>
              <Pressable onPress={() => setReplyTo(null)}>
                <MCI name="close" size={fp(14)} color={colors.accent} />
              </Pressable>
            </View>
          )}
          <View style={$.inputRow}>
            <Avatar name="我" size={wp(30)} />
            <TextInput
              ref={inputRef}
              style={[$.commentInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder={replyTo ? `回复 ${replyTo}...` : '写评论...'}
              placeholderTextColor={colors.textHint}
              value={commentText}
              onChangeText={setCommentText}
              multiline
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <HoverView
              onPress={handleSend}
              style={[$.sendBtn, { backgroundColor: commentText.trim() ? colors.accent : colors.inputBg }]}
              hoverScale={1.05} hoverLift={0}
            >
              <MCI name="send" size={fp(16)} color={commentText.trim() ? '#fff' : colors.textHint} />
            </HoverView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ──────────────── 评论组件 ──────────────── */

const CommentItem: React.FC<{
  comment: Comment; colors: ThemeColors; liked: boolean;
  onLike: () => void; onUserPress: (name: string) => void; onReply: (name: string) => void;
  isReply?: boolean;
}> = memo(({ comment, colors, liked, onLike, onUserPress, onReply, isReply }) => (
  <View style={[$.commentItem, isReply && $.commentReply, !isReply && { borderBottomColor: colors.border }]}>
    <Pressable onPress={() => onUserPress(comment.user)}>
      <Avatar name={comment.user} size={isReply ? wp(26) : wp(34)} />
    </Pressable>
    <View style={{ flex: 1, marginLeft: wp(10) }}>
      <View style={$.commentMeta}>
        <Pressable onPress={() => onUserPress(comment.user)}>
          <Text style={[$.commentUser, { color: colors.text }]}>{comment.user}</Text>
        </Pressable>
        {comment.user !== '我' && (
          <View style={[$.commentUserBadge, { backgroundColor: colors.inputBg }]}>
            <Text style={[$.commentUserBadgeText, { color: colors.textHint }]}>{comment.title}</Text>
          </View>
        )}
      </View>
      <Text style={[$.commentText, { color: colors.text }]}>{comment.content}</Text>
      <View style={$.commentFooter}>
        <Text style={[$.commentTime, { color: colors.textHint }]}>{comment.timeAgo}</Text>
        <Pressable style={$.commentAction} onPress={onLike}>
          <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(14)} color={liked ? '#EF4444' : colors.textHint} />
          <Text style={[$.commentActionText, { color: liked ? '#EF4444' : colors.textHint }]}>
            {liked ? comment.likeCount + 1 : comment.likeCount}
          </Text>
        </Pressable>
        {!isReply && (
          <Pressable style={$.commentAction} onPress={() => onReply(comment.user)}>
            <MCI name="reply" size={fp(14)} color={colors.textHint} />
            <Text style={[$.commentActionText, { color: colors.textHint }]}>回复</Text>
          </Pressable>
        )}
      </View>
      {comment.replies?.map((r) => (
        <CommentItem key={r.id} comment={r} colors={colors} liked={false} onLike={() => {}} onUserPress={onUserPress} onReply={onReply} isReply />
      ))}
    </View>
  </View>
));

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  /* 顶栏 */
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: wp(48), paddingHorizontal: wp(6), borderBottomWidth: 1,
  },
  navBtn: { width: wp(40), height: wp(40), justifyContent: 'center', alignItems: 'center' },
  topBarCenter: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
  topBarName: { fontSize: FontSize.sm, fontWeight: '600', maxWidth: wp(120) },

  /* 更多菜单 */
  menuOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 100,
  },
  menuSheet: {
    position: 'absolute', top: wp(52), right: PAD,
    borderRadius: BorderRadius.lg, paddingVertical: wp(4), minWidth: wp(150),
    zIndex: 101,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: wp(10),
    paddingHorizontal: wp(14), paddingVertical: wp(11),
  },
  menuLabel: { fontSize: FontSize.sm },

  /* 内容区域 */
  section: { paddingHorizontal: PAD, paddingVertical: wp(16) },

  /* 作者 */
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorName: { fontSize: fp(16), fontWeight: '700' },
  authorMeta: { flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(3) },
  authorBadge: { paddingHorizontal: wp(6), paddingVertical: wp(1), borderRadius: wp(3) },
  authorBadgeText: { fontSize: fp(10), fontWeight: '500' },
  authorTime: { fontSize: fp(11) },
  followBtn: {
    paddingHorizontal: wp(14), paddingVertical: wp(6),
    borderRadius: BorderRadius.full, borderWidth: 1,
  },
  followBtnText: { fontSize: fp(12), fontWeight: '600' },

  /* 正文 */
  fullContent: { fontSize: fp(15), lineHeight: fp(24), marginTop: wp(14) },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(6), marginTop: wp(10) },
  tag: { paddingHorizontal: wp(8), paddingVertical: wp(3), borderRadius: wp(4) },
  tagText: { fontSize: fp(11), fontWeight: '500' },
  preview: {
    marginTop: wp(14), borderRadius: BorderRadius.lg,
    padding: wp(16), alignItems: 'center', borderWidth: 1,
  },

  /* 跨模块 */
  crossActions: {
    flexDirection: 'row', gap: wp(10), marginTop: wp(14),
  },
  crossBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: wp(6), paddingVertical: wp(11), borderRadius: BorderRadius.md,
  },
  crossBtnText: { fontSize: FontSize.sm, fontWeight: '600', color: '#fff' },
  crossBtnOutline: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: wp(6), paddingVertical: wp(11), borderRadius: BorderRadius.md, borderWidth: 1,
  },
  crossBtnOutlineText: { fontSize: FontSize.sm, fontWeight: '500' },

  /* 统计栏 */
  statsBar: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: wp(16), paddingTop: wp(14), borderTopWidth: StyleSheet.hairlineWidth,
    gap: wp(20),
  },
  statItem: { alignItems: 'center', minWidth: wp(50) },
  statCount: { fontSize: fp(16), fontWeight: '700' },
  statLabel: { fontSize: fp(11), marginTop: wp(2) },
  statDivider: { width: 1, height: wp(24), alignSelf: 'center' },

  /* 互动按钮栏 */
  actionBar: {
    flexDirection: 'row', gap: wp(8), marginTop: wp(14),
  },
  actionChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: wp(5), paddingVertical: wp(9), borderRadius: BorderRadius.md,
  },
  actionChipText: { fontSize: fp(12), fontWeight: '500' },

  /* 评论区 */
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8), marginBottom: wp(12) },
  commentHeaderText: { fontSize: fp(16), fontWeight: '700' },
  commentCountBadge: { paddingHorizontal: wp(8), paddingVertical: wp(2), borderRadius: BorderRadius.full },
  commentCountText: { fontSize: fp(11), fontWeight: '600' },
  commentEmpty: { alignItems: 'center', paddingVertical: wp(24), gap: wp(8) },
  commentEmptyText: { fontSize: FontSize.sm },
  commentItem: { flexDirection: 'row', paddingVertical: wp(12), borderBottomWidth: StyleSheet.hairlineWidth },
  commentReply: { marginTop: wp(8), paddingTop: wp(8), paddingLeft: wp(2), borderBottomWidth: 0 },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: wp(6) },
  commentUser: { fontSize: FontSize.sm, fontWeight: '600' },
  commentUserBadge: { paddingHorizontal: wp(5), paddingVertical: wp(1), borderRadius: wp(2) },
  commentUserBadgeText: { fontSize: fp(9) },
  commentText: { fontSize: FontSize.sm, lineHeight: fp(20), marginTop: wp(4) },
  commentFooter: { flexDirection: 'row', alignItems: 'center', gap: wp(14), marginTop: wp(6) },
  commentTime: { fontSize: fp(11) },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  commentActionText: { fontSize: fp(11) },

  /* 相关推荐 */
  relatedTitle: { fontSize: fp(16), fontWeight: '700', marginBottom: wp(10) },
  relatedItem: {
    flexDirection: 'row', alignItems: 'center', gap: wp(10),
    paddingVertical: wp(10), borderBottomWidth: StyleSheet.hairlineWidth,
  },
  relatedPreview: {
    width: wp(56), height: wp(56), borderRadius: BorderRadius.md,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  relatedInfo: { flex: 1 },
  relatedContent: { fontSize: FontSize.sm, lineHeight: fp(18) },
  relatedMeta: { flexDirection: 'row', alignItems: 'center', gap: wp(4), marginTop: wp(4) },
  relatedUser: { fontSize: fp(11), marginRight: wp(4) },
  relatedLikes: { fontSize: fp(11) },

  /* 评论输入栏 */
  inputBar: {
    paddingHorizontal: PAD, paddingTop: wp(6), paddingBottom: wp(8) + BOTTOM_SAFE_H,
    borderTopWidth: 1,
  },
  replyHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: wp(10), paddingVertical: wp(5), borderRadius: wp(4),
    marginBottom: wp(6),
  },
  replyHintText: { fontSize: fp(11), fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: wp(8) },
  commentInput: {
    flex: 1, fontSize: FontSize.sm, borderRadius: BorderRadius.lg,
    paddingHorizontal: wp(12), paddingVertical: wp(8), maxHeight: wp(80),
  },
  sendBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },
});
