import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme';
import type { ThemeColors } from '../../theme';
import { Avatar, HoverView, AppHeader } from '../../components/common';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { getFeedMockGallery } from '../../utils/feedMedia';
import type { RootScreenProps, RootStackParamList } from '../../navigation/types';
import { FeedMediaViewer } from '../../components/community/FeedMediaViewer';
import { likeApi, favoriteApi, followApi, commentApi, type CommentItem } from '../../api/community';
import { useAuthStore } from '../../store/useAuthStore';

const PAD = wp(15);

function formatCount(value: number) {
  if (value >= 10000) {
    const next = value / 10000;
    return `${Number.isInteger(next) ? next.toFixed(0) : next.toFixed(1)}万`;
  }

  return String(value);
}

export const FeedDetailScreen: React.FC<RootScreenProps<'FeedDetail'>> = ({ route }) => {
  const { feed } = route.params;
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const currentUser = useAuthStore((state) => state.user);
  const isOwnFeed = currentUser?.id === feed.user.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(feed.likeCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ commentId: number; userName: string } | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSending, setCommentSending] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [viewerVisible, setViewerVisible] = useState(false);
  const likeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // 进入页面回填三个互动状态
  useEffect(() => {
    let alive = true;
    likeApi.check('feed', feed.id)
      .then((res) => { if (alive) setLiked(!!res.data?.liked); })
      .catch(() => undefined);
    favoriteApi.check('design', feed.id)
      .then((res) => { if (alive) setBookmarked(!!res.data?.favorited); })
      .catch(() => undefined);
    if (feed.user.id && !isOwnFeed) {
      followApi.check(feed.user.id)
        .then((res) => { if (alive) setFollowed(!!res.data); })
        .catch(() => undefined);
    }
    return () => { alive = false; };
  }, [feed.id, feed.user.id, isOwnFeed]);

  // 拉取真实评论
  useEffect(() => {
    let alive = true;
    setCommentsLoading(true);
    commentApi.list('feed', feed.id)
      .then((res) => { if (alive) setComments(res.data || []); })
      .catch(() => { if (alive) setComments([]); })
      .finally(() => { if (alive) setCommentsLoading(false); });
    return () => { alive = false; };
  }, [feed.id]);

  const gallery = useMemo(() => getFeedMockGallery(feed), [feed]);
  const media = gallery[Math.min(activeMediaIndex, gallery.length - 1)];
  const previewW = screenW - PAD * 2 - wp(20);
  const previewH = previewW / gallery[0].aspectRatio;
  const hasGallery = gallery.length > 1;

  const handleLike = async () => {
    if (likeBusy) return;
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再点赞。');
      return;
    }
    const next = !liked;
    // 乐观更新 + 动画
    setLiked(next);
    setLikeCount((value) => Math.max(0, value + (next ? 1 : -1)));
    Animated.sequence([
      Animated.timing(likeAnim, { toValue: 1.18, duration: 100, useNativeDriver: true }),
      Animated.timing(likeAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setLikeBusy(true);
    try {
      if (next) {
        await likeApi.like('feed', feed.id);
      } else {
        await likeApi.unlike('feed', feed.id);
      }
    } catch (err: any) {
      // 失败回滚
      setLiked(!next);
      setLikeCount((value) => Math.max(0, value + (next ? -1 : 1)));
      Alert.alert('操作失败', err?.response?.data?.message || '请稍后重试');
    } finally {
      setLikeBusy(false);
    }
  };

  const handleBookmark = async () => {
    if (bookmarkBusy) return;
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再收藏。');
      return;
    }
    const next = !bookmarked;
    setBookmarked(next);
    setBookmarkBusy(true);
    try {
      if (next) {
        await favoriteApi.add('design', feed.id);
      } else {
        await favoriteApi.remove('design', feed.id);
      }
    } catch (err: any) {
      setBookmarked(!next);
      Alert.alert('操作失败', err?.response?.data?.message || '请稍后重试');
    } finally {
      setBookmarkBusy(false);
    }
  };

  const handleFollow = async () => {
    if (followBusy) return;
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再关注。');
      return;
    }
    if (!feed.user.id) {
      Alert.alert('无法关注', '作者信息缺失。');
      return;
    }
    if (isOwnFeed) {
      Alert.alert('提示', '不能关注自己。');
      return;
    }
    const next = !followed;
    setFollowed(next);
    setFollowBusy(true);
    try {
      if (next) {
        await followApi.follow(feed.user.id);
      } else {
        await followApi.unfollow(feed.user.id);
      }
    } catch (err: any) {
      setFollowed(!next);
      Alert.alert('操作失败', err?.response?.data?.message || '请稍后重试');
    } finally {
      setFollowBusy(false);
    }
  };

  const handleSend = async () => {
    if (commentSending) return;
    const content = commentText.trim();
    if (!content) return;
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再评论。');
      return;
    }

    setCommentSending(true);
    try {
      const res = await commentApi.create('feed', feed.id, content, replyTo?.commentId);
      if (res.data) {
        setComments((prev) => [res.data, ...prev]);
      }
      setCommentText('');
      setReplyTo(null);
    } catch (err: any) {
      Alert.alert('发送失败', err?.response?.data?.message || '请稍后重试');
    } finally {
      setCommentSending(false);
    }
  };

  const handleReply = (commentId: number, userName: string) => {
    setReplyTo({ commentId, userName });
    inputRef.current?.focus();
  };

  // 把扁平 comments 分组：root + 该 root 下所有回复（包括"回复的回复"）
  const grouped = useMemo(() => {
    const roots: CommentItem[] = [];
    const repliesById: Record<number, CommentItem[]> = {};
    const parentToRoot: Record<number, number> = {};

    // 先标记 root
    for (const c of comments) {
      if (c.parentId == null) {
        roots.push(c);
        parentToRoot[c.id] = c.id;
      }
    }
    // 再遍历回复，沿 parentId 找到所属 root
    for (const c of comments) {
      if (c.parentId == null) continue;
      let rootId = parentToRoot[c.parentId];
      if (rootId == null) {
        // parent 也是回复，需要再追溯一层（朴素查找；评论数不大）
        const parent = comments.find((x) => x.id === c.parentId);
        if (parent) rootId = parentToRoot[parent.parentId ?? parent.id] ?? parent.id;
      }
      if (rootId == null) continue;
      parentToRoot[c.id] = rootId;
      (repliesById[rootId] ||= []).push(c);
    }
    // 回复按时间升序（root 列表自身已是 created_at 倒序）
    Object.values(repliesById).forEach((list) => list.sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    return { roots, repliesById };
  }, [comments]);

  const handleDeleteComment = (commentId: number) => {
    Alert.alert('删除评论', '确定删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          // 乐观删除
          const snapshot = comments;
          setComments((prev) => prev.filter((item) => item.id !== commentId));
          try {
            await commentApi.remove(commentId);
          } catch (err: any) {
            setComments(snapshot);
            Alert.alert('删除失败', err?.response?.data?.message || '请稍后重试');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader
        title={feed.user.name}
        onBack={() => navigation.goBack()}
        right={(
          <HoverView onPress={() => setShowMore((value) => !value)} style={$.navBtn} hoverScale={1.08} hoverLift={0}>
            <MCI name="dots-vertical" size={fp(22)} color={colors.text} />
          </HoverView>
        )}
      />

      {showMore ? (
        <Pressable style={$.menuOverlay} onPress={() => setShowMore(false)}>
          <View style={[$.menuSheet, { backgroundColor: colors.surface, ...shadow(2, 12, 0.12, '#000', 6) }]}>
            {[
              { icon: 'link-variant' as const, label: '复制链接', action: () => Alert.alert('复制链接', '当前演示环境不生成外部链接。') },
              { icon: 'flag-outline' as const, label: '举报内容', action: () => Alert.alert('举报', '当前演示环境不会提交举报。') },
              { icon: 'eye-off-outline' as const, label: '不感兴趣', action: () => navigation.goBack() },
            ].map((item) => (
              <HoverView
                key={item.label}
                onPress={() => {
                  setShowMore(false);
                  item.action();
                }}
                style={$.menuItem}
                hoverScale={1.02}
                hoverLift={0}
              >
                <MCI name={item.icon} size={fp(18)} color={colors.text} />
                <Text style={[$.menuLabel, { color: colors.text }]}>{item.label}</Text>
              </HoverView>
            ))}
          </View>
        </Pressable>
      ) : null}

      <KeyboardAvoidingView style={$.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(110) + BOTTOM_SAFE_H }}>
          <View style={$.contentWrap}>
            <Pressable style={$.userRow} onPress={() => navigation.navigate('UserProfile', { userName: feed.user.name })}>
              <Avatar name={feed.user.name} size={wp(46)} />
              <View style={$.userInfo}>
                <Text style={[$.userName, { color: colors.text }]}>{feed.user.name}</Text>
                <Text style={[$.userMeta, { color: colors.textHint }]}>{feed.user.title} · {feed.timeAgo}</Text>
              </View>
              {isOwnFeed ? null : (
                <HoverView
                  onPress={handleFollow}
                  style={[
                    $.followBtn,
                    {
                      backgroundColor: followed ? 'transparent' : colors.accent,
                      borderColor: followed ? colors.border : colors.accent,
                      opacity: followBusy ? 0.6 : 1,
                    },
                  ]}
                  hoverScale={1.03}
                  hoverLift={0}
                >
                  <Text style={[$.followBtnText, { color: followed ? colors.textHint : '#fff' }]}>{followed ? '已关注' : '关注'}</Text>
                </HoverView>
              )}
            </Pressable>

            <Text style={[$.contentText, { color: colors.textSecondary }]}>{feed.content}</Text>
            {feed.caption ? <Text style={[$.captionText, { color: colors.textHint }]}>{feed.caption}</Text> : null}

            <View style={$.tagWrap}>
              {feed.tags.map((tag) => (
                <View key={`${feed.id}-${tag}`} style={[$.tagChip, { backgroundColor: colors.inputBg }]}>
                  <Text style={[$.tagText, { color: colors.textHint }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={[$.previewWrap, { backgroundColor: dark ? '#1E2027' : '#F8FAFC', height: previewH }]}>
              <ScrollView
                horizontal
                pagingEnabled
                nestedScrollEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                onMomentumScrollEnd={(event) => {
                  const nextIndex = Math.round(event.nativeEvent.contentOffset.x / previewW);
                  setActiveMediaIndex(Math.max(0, Math.min(gallery.length - 1, nextIndex)));
                }}
              >
                {gallery.map((item, index) => (
                  <Pressable
                    key={`${feed.id}-detail-media-${index}`}
                    style={{ width: previewW, height: previewH }}
                    onPress={() => {
                      setActiveMediaIndex(index);
                      setViewerVisible(true);
                    }}
                  >
                    {item.uri ? (
                      <Image source={{ uri: item.uri }} style={{ width: previewW, height: previewH }} resizeMode="cover" />
                    ) : (
                      <SvgXml xml={item.svg} width={previewW} height={previewH} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              <View style={$.mediaTopBadges}>
                <View style={$.mediaTypeBadge}>
                  <Text style={$.mediaTypeBadgeText}>{feed.media.type === 'video' ? 'VIDEO' : feed.media.type === 'gif' ? 'GIF' : 'PHOTO'}</Text>
                </View>
                {hasGallery ? (
                  <View style={$.mediaTypeBadge}>
                    <MCI name="image-multiple-outline" size={fp(10)} color="#FFFFFF" />
                    <Text style={$.mediaTypeBadgeText}>{activeMediaIndex + 1}/{gallery.length}</Text>
                  </View>
                ) : feed.media.type === 'video' && feed.media.durationSec ? (
                  <View style={$.mediaTypeBadge}>
                    <MCI name="play" size={fp(10)} color="#FFFFFF" />
                    <Text style={$.mediaTypeBadgeText}>{`0:${`${feed.media.durationSec}`.padStart(2, '0')}`}</Text>
                  </View>
                ) : null}
              </View>
              {hasGallery ? (
                <View style={$.mediaDots}>
                  {gallery.map((item, index) => (
                    <View
                      key={`${feed.id}-detail-dot-${index}`}
                      style={[
                        $.mediaDot,
                        {
                          width: index === activeMediaIndex ? wp(14) : wp(5),
                          backgroundColor: index === activeMediaIndex ? '#FFFFFF' : 'rgba(255,255,255,0.58)',
                        },
                      ]}
                    />
                  ))}
                </View>
              ) : null}
            </View>

            <View style={[$.actionBar, { borderBottomColor: colors.border }]}>
              <HoverView onPress={handleLike} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
                  <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(20)} color={liked ? '#EF4444' : colors.textHint} />
                </Animated.View>
                <Text style={[$.actionText, { color: liked ? '#EF4444' : colors.textHint }]}>{formatCount(likeCount)}</Text>
              </HoverView>
              <View style={$.actionItem}>
                <MCI name="comment-outline" size={fp(20)} color={colors.textHint} />
                <Text style={[$.actionText, { color: colors.textHint }]}>{formatCount(comments.length)}</Text>
              </View>
              <HoverView onPress={handleBookmark} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <MCI name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={fp(20)} color={bookmarked ? colors.accent : colors.textHint} />
                <Text style={[$.actionText, { color: bookmarked ? colors.accent : colors.textHint }]}>{bookmarked ? '已收藏' : '收藏'}</Text>
              </HoverView>
              <HoverView onPress={() => Alert.alert('分享', '当前演示环境不接入分享。')} style={$.actionItem} hoverScale={1.05} hoverLift={0}>
                <MCI name="share-outline" size={fp(20)} color={colors.textHint} />
              </HoverView>
            </View>

            <View style={$.commentHeader}>
              <Text style={[$.sectionTitle, { color: colors.text }]}>评论</Text>
              <Text style={[$.sectionHint, { color: colors.textHint }]}>{comments.length} 条</Text>
            </View>

            <View style={$.commentList}>
              {commentsLoading && comments.length === 0 ? (
                <Text style={[$.commentEmptyText, { color: colors.textHint }]}>加载中...</Text>
              ) : comments.length === 0 ? (
                <Text style={[$.commentEmptyText, { color: colors.textHint }]}>还没有评论，来说两句吧</Text>
              ) : null}
              {grouped.roots.map((root) => (
                <View key={root.id}>
                  <CommentRow
                    comment={root}
                    colors={colors}
                    canDelete={currentUser?.id === root.user.id}
                    currentUser={currentUser ? { id: currentUser.id } : null}
                    onReply={handleReply}
                    onDelete={handleDeleteComment}
                  />
                  {(grouped.repliesById[root.id] || []).map((reply) => (
                    <View key={reply.id} style={$.replyIndent}>
                      <CommentRow
                        comment={reply}
                        colors={colors}
                        canDelete={currentUser?.id === reply.user.id}
                        currentUser={currentUser ? { id: currentUser.id } : null}
                        onReply={handleReply}
                        onDelete={handleDeleteComment}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[$.inputBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
          <View style={[$.inputWrap, { backgroundColor: colors.inputBg }]}>
            <TextInput
              ref={inputRef}
              style={[$.input, { color: colors.text }]}
              placeholder={replyTo ? `回复 ${replyTo.userName}` : '写下你的评论...'}
              editable={!commentSending}
              placeholderTextColor={colors.textHint}
              value={commentText}
              onChangeText={setCommentText}
            />
            {replyTo ? (
              <Pressable onPress={() => setReplyTo(null)} hitSlop={8}>
                <Feather name="x-circle" size={fp(16)} color={colors.textHint} />
              </Pressable>
            ) : null}
          </View>
          <HoverView
            onPress={handleSend}
            style={[$.sendBtn, { backgroundColor: colors.accent, opacity: commentText.trim() && !commentSending ? 1 : 0.45 }]}
            hoverScale={1.03}
            hoverLift={0}
          >
            <Text style={$.sendBtnText}>{commentSending ? '发送中' : '发送'}</Text>
          </HoverView>
        </View>
      </KeyboardAvoidingView>

      <FeedMediaViewer
        visible={viewerVisible}
        gallery={gallery}
        initialIndex={activeMediaIndex}
        onClose={() => setViewerVisible(false)}
      />
    </SafeAreaView>
  );
};

const CommentRow: React.FC<{
  comment: CommentItem;
  colors: ThemeColors;
  canDelete: boolean;
  currentUser: { id: number } | null;
  onReply: (commentId: number, userName: string) => void;
  onDelete: (commentId: number) => void;
}> = memo(({ comment, colors, canDelete, currentUser, onReply, onDelete }) => {
  const [liked, setLiked] = useState(!!comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [busy, setBusy] = useState(false);

  const handleLike = async () => {
    if (busy) return;
    if (!currentUser) {
      Alert.alert('需要登录', '请先登录后再点赞。');
      return;
    }
    const next = !liked;
    setLiked(next);
    setLikeCount((value) => Math.max(0, value + (next ? 1 : -1)));
    setBusy(true);
    try {
      if (next) await likeApi.like('comment', comment.id);
      else await likeApi.unlike('comment', comment.id);
    } catch {
      setLiked(!next);
      setLikeCount((value) => Math.max(0, value + (next ? -1 : 1)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={$.commentItem}>
      <Avatar name={comment.user.name} size={wp(34)} />
      <View style={$.commentBody}>
        <View style={$.commentTop}>
          <View style={{ flex: 1 }}>
            <Text style={[$.commentUser, { color: colors.text }]}>{comment.user.name}</Text>
            <Text style={[$.commentMeta, { color: colors.textHint }]}>{comment.user.title} · {comment.timeAgo}</Text>
          </View>
          <Pressable style={$.commentLikeBtn} onPress={handleLike} hitSlop={6}>
            <MCI name={liked ? 'heart' : 'heart-outline'} size={fp(15)} color={liked ? '#EF4444' : colors.textHint} />
            {likeCount > 0 ? (
              <Text style={[$.commentLikeText, { color: liked ? '#EF4444' : colors.textHint }]}>{likeCount}</Text>
            ) : null}
          </Pressable>
        </View>
        <Text style={[$.commentContent, { color: colors.textSecondary }]}>
          {comment.replyToUserName ? (
            <Text style={{ color: colors.accent }}>@{comment.replyToUserName} </Text>
          ) : null}
          {comment.content}
        </Text>
        <View style={$.commentActions}>
          <Pressable style={$.replyBtn} onPress={() => onReply(comment.id, comment.user.name)}>
            <Text style={[$.replyText, { color: colors.accent }]}>回复</Text>
          </Pressable>
          {canDelete ? (
            <Pressable style={$.replyBtn} onPress={() => onDelete(comment.id)}>
              <Text style={[$.replyText, { color: colors.textHint }]}>删除</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },
  navBtn: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(11),
    gap: wp(10),
  },
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
  captionText: { marginTop: wp(8), fontSize: fp(12), lineHeight: fp(18) },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(8), marginTop: wp(12) },
  tagChip: { borderRadius: wp(12), paddingHorizontal: wp(10), paddingVertical: wp(6) },
  tagText: { fontSize: fp(11) },
  previewWrap: {
    marginTop: wp(14),
    borderRadius: wp(18),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaTopBadges: {
    position: 'absolute',
    top: wp(12),
    left: wp(12),
    flexDirection: 'row',
    gap: wp(8),
  },
  mediaTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  mediaTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '700',
  },
  mediaDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: wp(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(5),
  },
  mediaDot: {
    height: wp(5),
    borderRadius: wp(999),
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
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: wp(18),
  },
  sectionTitle: { fontSize: fp(15), fontWeight: '700' },
  sectionHint: { fontSize: fp(11) },
  commentList: { gap: wp(14), marginTop: wp(14) },
  commentItem: { flexDirection: 'row', alignItems: 'flex-start' },
  commentBody: { flex: 1, marginLeft: wp(10) },
  commentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  commentUser: { fontSize: fp(13), fontWeight: '700' },
  commentMeta: { fontSize: fp(11), marginTop: wp(2) },
  commentContent: { marginTop: wp(8), fontSize: fp(13), lineHeight: fp(18) },
  commentActions: { flexDirection: 'row', gap: wp(16), marginTop: wp(8) },
  commentEmptyText: { fontSize: fp(12), textAlign: 'center', paddingVertical: wp(20) },
  replyIndent: { marginLeft: wp(46) },
  commentLikeBtn: { flexDirection: 'row', alignItems: 'center', gap: wp(3), paddingHorizontal: wp(4), paddingVertical: wp(2) },
  commentLikeText: { fontSize: fp(11), fontWeight: '600' },
  replyBtn: { alignSelf: 'flex-start' },
  replyText: { fontSize: fp(11), fontWeight: '700' },
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
