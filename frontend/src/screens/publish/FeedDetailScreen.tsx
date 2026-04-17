import React, { memo, useMemo, useRef, useState } from 'react';
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
import type { RootScreenProps, RootStackParamList, FeedItemData } from '../../navigation/types';
import { ALL_FEEDS } from '../../mock/app';

const PAD = wp(15);

interface CommentItemData {
  id: number;
  user: string;
  title: string;
  content: string;
  timeAgo: string;
  likeCount: number;
}

const MOCK_COMMENTS: Record<number, CommentItemData[]> = {
  1: [
    { id: 101, user: '新手练习生', title: '入门创作者', content: '这组猫咪挂件的边缘做得很干净，想知道用了几种暖灰色。', timeAgo: '1小时前', likeCount: 5 },
    { id: 102, user: '木木手作', title: '创作者', content: '主体是两种橘色，一种深灰，最后又补了一层浅米色高光。', timeAgo: '50分钟前', likeCount: 8 },
  ],
  2: [
    { id: 201, user: '像素观察者', title: '像素爱好者', content: 'AI 起稿后再微调边缘，这个流程对效率提升很明显。', timeAgo: '2小时前', likeCount: 12 },
    { id: 202, user: '工具记录员', title: '流程整理', content: '如果把提示词也记录下来，会更方便后续复用。', timeAgo: '1小时前', likeCount: 6 },
  ],
};

function buildComments(feedId: number): CommentItemData[] {
  return MOCK_COMMENTS[feedId] || [
    { id: feedId * 100 + 1, user: '路人甲', title: '拼豆爱好者', content: '整体结构很稳，适合继续扩展成完整系列。', timeAgo: '刚刚', likeCount: 3 },
  ];
}

function formatCount(value: number) {
  if (value >= 10000) return `${(value / 10000).toFixed(1)}w`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

export const FeedDetailScreen: React.FC<RootScreenProps<'FeedDetail'>> = ({ route }) => {
  const { feed } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItemData[]>(() => buildComments(feed.id));
  const [showMore, setShowMore] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  const relatedFeeds = useMemo(() => ALL_FEEDS.filter((item) => item.id !== feed.id).slice(0, 3), [feed.id]);
  const pattern = ALL_PATTERNS[feed.patternIdx % ALL_PATTERNS.length];
  const previewW = screenW - PAD * 2 - wp(20);
  const beadSize = Math.max(Math.floor(previewW / (pattern[0]?.length || 9)) - 1, 6);

  const handleLike = () => {
    setLiked((value) => !value);
    Animated.sequence([
      Animated.timing(likeAnim, { toValue: 1.18, duration: 100, useNativeDriver: true }),
      Animated.timing(likeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleSend = () => {
    if (!commentText.trim()) return;
    const content = replyTo ? `回复 ${replyTo}：${commentText.trim()}` : commentText.trim();
    const newComment: CommentItemData = {
      id: Date.now(),
      user: '测试用户',
      title: '本地账号',
      content,
      timeAgo: '刚刚',
      likeCount: 0,
    };
    setComments((prev) => [newComment, ...prev]);
    setCommentText('');
    setReplyTo(null);
  };

  const handleReply = (userName: string) => {
    setReplyTo(userName);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.topBar, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={() => navigation.goBack()} style={$.navBtn} hoverScale={1.08} hoverLift={0}>
          <MCI name="arrow-left" size={fp(22)} color={colors.text} />
        </HoverView>
        <View style={$.topBarCenter}>
          <Avatar name={feed.user.name} size={wp(24)} />
          <Text style={[$.topBarName, { color: colors.text }]} numberOfLines={1}>{feed.user.name}</Text>
        </View>
        <HoverView onPress={() => setShowMore((value) => !value)} style={$.navBtn} hoverScale={1.08} hoverLift={0}>
          <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
        </HoverView>
      </View>

      {showMore && (
        <Pressable style={$.menuOverlay} onPress={() => setShowMore(false)}>
          <View style={[$.menuSheet, { backgroundColor: colors.surface, ...shadow(2, 12, 0.12, '#000', 6) }]}>
            {[
              { icon: 'link-variant' as const, label: '复制链接', action: () => Alert.alert('复制链接', '当前演示环境不生成外部链接。') },
              { icon: 'flag-outline' as const, label: '举报内容', action: () => Alert.alert('举报', '当前演示环境不会提交举报。') },
              { icon: 'eye-off-outline' as const, label: '不感兴趣', action: () => navigation.goBack() },
            ].map((item) => (
              <HoverView key={item.label} onPress={() => { setShowMore(false); item.action(); }} style={$.menuItem} hoverScale={1.02} hoverLift={0}>
                <MCI name={item.icon} size={fp(18)} color={colors.text} />
                <Text style={[$.menuLabel, { color: colors.text }]}>{item.label}</Text>
              </HoverView>
            ))}
          </View>
        </Pressable>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(110) + BOTTOM_SAFE_H }}>
          <View style={$.contentWrap}>
            <Pressable style={$.userRow} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
              <Avatar name={feed.user.name} size={wp(46)} />
              <View style={$.userInfo}>
                <Text style={[$.userName, { color: colors.text }]}>{feed.user.name}</Text>
                <Text style={[$.userMeta, { color: colors.textHint }]}>{feed.user.title} · {feed.timeAgo}</Text>
              </View>
              <HoverView
                onPress={() => setFollowed((value) => !value)}
                style={[$.followBtn, {
                  backgroundColor: followed ? 'transparent' : colors.accent,
                  borderColor: followed ? colors.border : colors.accent,
                }]}
                hoverScale={1.03}
                hoverLift={0}
              >
                <Text style={[$.followBtnText, { color: followed ? colors.textHint : '#fff' }]}>{followed ? '已关注' : '关注'}</Text>
              </HoverView>
            </Pressable>

            <Text style={[$.contentText, { color: colors.textSecondary }]}>{feed.content}</Text>

            <View style={$.tagWrap}>
              {feed.tags.map((tag) => (
                <View key={`${feed.id}-${tag}`} style={[$.tagChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.tagText, { color: colors.textHint }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={[$.previewWrap, { backgroundColor: dark ? '#1E2027' : '#F8FAFC' }]}>
              <BeadGrid pixels={pattern} beadSize={Math.min(beadSize, wp(16))} gap={1} round glossy />
            </View>

            <View style={[$.actionBar, { borderBottomColor: colors.border }]}>
              <HoverView onPress={handleLike} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                  <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(20)} color={liked ? '#EF4444' : colors.textHint} />
                </Animated.View>
                <Text style={[$.actionText, { color: liked ? '#EF4444' : colors.textHint }]}>{formatCount(feed.likeCount + (liked ? 1 : 0))}</Text>
              </HoverView>
              <View style={$.actionItem}>
                <MCI name="comment-outline" size={fp(20)} color={colors.textHint} />
                <Text style={[$.actionText, { color: colors.textHint }]}>{formatCount(comments.length)}</Text>
              </View>
              <HoverView onPress={() => setBookmarked((value) => !value)} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <MCI name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={fp(20)} color={bookmarked ? colors.accent : colors.textHint} />
                <Text style={[$.actionText, { color: bookmarked ? colors.accent : colors.textHint }]}>{bookmarked ? '已收藏' : '收藏'}</Text>
              </HoverView>
              <HoverView onPress={() => Alert.alert('分享', '当前演示环境不接入分享。')} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <MCI name="share-outline" size={fp(20)} color={colors.textHint} />
              </HoverView>
            </View>

            <View style={$.sectionHeader}>
              <Text style={[$.sectionTitle, { color: colors.text }]}>评论</Text>
              <Text style={[$.sectionHint, { color: colors.textHint }]}>{comments.length} 条</Text>
            </View>

            <View style={$.commentList}>
              {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} colors={colors} onReply={handleReply} />
              ))}
            </View>

            <View style={$.sectionHeader}>
              <Text style={[$.sectionTitle, { color: colors.text }]}>相关推荐</Text>
            </View>

            <View style={$.relatedList}>
              {relatedFeeds.map((item) => (
                <Pressable key={item.id} style={[$.relatedCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.push('FeedDetail', { feed: item })}>
                  <Text style={[$.relatedTitle, { color: colors.text }]} numberOfLines={1}>{item.user.name}</Text>
                  <Text style={[$.relatedContent, { color: colors.textHint }]} numberOfLines={2}>{item.content}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[$.inputBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
          <View style={[$.inputWrap, { backgroundColor: colors.inputBg }]}>
            <TextInput
              ref={inputRef}
              style={[$.input, { color: colors.text }]}
              placeholder={replyTo ? `回复 ${replyTo}` : '写下你的评论...'}
              placeholderTextColor={colors.textHint}
              value={commentText}
              onChangeText={setCommentText}
            />
            {replyTo && (
              <Pressable onPress={() => setReplyTo(null)} hitSlop={8}>
                <Feather name="x-circle" size={fp(16)} color={colors.textHint} />
              </Pressable>
            )}
          </View>
          <HoverView onPress={handleSend} style={[$.sendBtn, { backgroundColor: colors.accent, opacity: commentText.trim() ? 1 : 0.45 }]} hoverScale={1.03} hoverLift={0}>
            <Text style={$.sendBtnText}>发送</Text>
          </HoverView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const CommentItem: React.FC<{ comment: CommentItemData; colors: ThemeColors; onReply: (user: string) => void }> = memo(({ comment, colors, onReply }) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={$.commentItem}>
      <Avatar name={comment.user} size={wp(34)} />
      <View style={{ flex: 1, marginLeft: wp(10) }}>
        <View style={$.commentTop}>
          <View>
            <Text style={[$.commentUser, { color: colors.text }]}>{comment.user}</Text>
            <Text style={[$.commentMeta, { color: colors.textHint }]}>{comment.title} · {comment.timeAgo}</Text>
          </View>
          <HoverView onPress={() => setLiked((value) => !value)} style={$.commentLike} hoverScale={1.05} hoverLift={0}>
            <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(16)} color={liked ? '#EF4444' : colors.textHint} />
            <Text style={[$.commentLikeText, { color: liked ? '#EF4444' : colors.textHint }]}>{comment.likeCount + (liked ? 1 : 0)}</Text>
          </HoverView>
        </View>
        <Text style={[$.commentContent, { color: colors.textSecondary }]}>{comment.content}</Text>
        <Pressable style={$.replyBtn} onPress={() => onReply(comment.user)}>
          <Text style={[$.replyText, { color: colors.accent }]}>回复</Text>
        </Pressable>
      </View>
    </View>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(50),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wp(8) },
  topBarName: { maxWidth: wp(180), fontSize: fp(14), fontWeight: '700' },
  menuOverlay: {
    position: 'absolute',
    top: wp(50),
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: 2,
  },
  menuSheet: {
    position: 'absolute',
    right: PAD,
    top: wp(8),
    width: wp(150),
    borderRadius: wp(16),
    paddingVertical: wp(6),
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(14), paddingVertical: wp(11), gap: wp(10) },
  menuLabel: { fontSize: fp(12) },
  contentWrap: { paddingHorizontal: PAD, paddingTop: wp(14) },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  userInfo: { flex: 1, marginLeft: wp(10) },
  userName: { fontSize: fp(14), fontWeight: '700' },
  userMeta: { fontSize: fp(11), marginTop: wp(2) },
  followBtn: {
    minWidth: wp(64),
    height: wp(34),
    borderRadius: wp(12),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followBtnText: { fontSize: fp(12), fontWeight: '700' },
  contentText: { marginTop: wp(12), fontSize: fp(14), lineHeight: fp(21) },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginTop: wp(12) },
  tagChip: { borderRadius: wp(12), paddingHorizontal: wp(10), paddingVertical: wp(6) },
  tagText: { fontSize: fp(11) },
  previewWrap: {
    marginTop: wp(14),
    borderRadius: wp(18),
    paddingVertical: wp(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(16),
    borderBottomWidth: 1,
    paddingVertical: wp(14),
    marginTop: wp(14),
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: wp(6) },
  actionText: { fontSize: fp(11), fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: wp(18) },
  sectionTitle: { fontSize: fp(15), fontWeight: '700' },
  sectionHint: { fontSize: fp(11) },
  commentList: { gap: wp(14), marginTop: wp(14) },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start' },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  commentUser: { fontSize: fp(13), fontWeight: '700' },
  commentMeta: { fontSize: fp(11), marginTop: wp(2) },
  commentLike: { flexDirection: 'row', alignItems: 'center', gap: wp(4) },
  commentLikeText: { fontSize: fp(11) },
  commentContent: { marginTop: wp(8), fontSize: fp(13), lineHeight: fp(18) },
  replyBtn: { marginTop: wp(8), alignSelf: 'flex-start' },
  replyText: { fontSize: fp(11), fontWeight: '700' },
  relatedList: { gap: wp(10), marginTop: wp(12) },
  relatedCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: wp(12),
  },
  relatedTitle: { fontSize: fp(13), fontWeight: '700' },
  relatedContent: { marginTop: wp(6), fontSize: fp(12), lineHeight: fp(17) },
  inputBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    gap: wp(10),
  },
  inputWrap: {
    flex: 1,
    minHeight: wp(42),
    borderRadius: wp(14),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(12),
  },
  input: { flex: 1, fontSize: fp(13), paddingVertical: wp(8) },
  sendBtn: {
    minWidth: wp(56),
    minHeight: wp(42),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#fff', fontSize: fp(12), fontWeight: '700' },
});
