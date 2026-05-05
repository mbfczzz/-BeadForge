import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader, Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import type { ProfileNoticeAction, ProfileNoticeItem } from '../../api/profile';
import type { RootStackParamList } from '../../navigation/types';
import { fp, wp } from '../../utils/responsive';
import { directMessageApi, type DmChatItem } from '../../api/directMessage';
import { officialMessageApi, type OfficialMessageItem } from '../../api/officialMessage';
import { notificationApi } from '../../api/notification';
import { commentApi, type MyCommentItem } from '../../api/community';

type EntryKey = 'comments' | 'likes' | 'follows' | 'orders' | 'mentions';
type CommentTab = '评论我的' | '我评论的';

interface QuickEntryDef {
  key: EntryKey;
  label: string;
  icon: string;
  color: string;
}

// 快捷分类的 icon/label/color 仍是前端 UI 常量，未读计数从后端 unreadCountByType 拉
const QUICK_ENTRIES: QuickEntryDef[] = [
  { key: 'comments', label: '所有评论', icon: 'comment-text-outline', color: '#6366F1' },
  { key: 'likes',    label: '赞和收藏', icon: 'heart-outline',         color: '#EF476F' },
  { key: 'follows',  label: '关注消息', icon: 'account-plus-outline',  color: '#22C55E' },
  { key: 'orders',   label: '订单消息', icon: 'package-variant-closed',color: '#F59E0B' },
  { key: 'mentions', label: '@我的',   icon: 'at',                    color: '#06A6C8' },
];

interface NotifItem {
  id: number;
  title: string;
  content: string;
  time: string;
}

interface CommentReceivedItem {
  id: string;
  user: string;
  content: string;
  target: string;
  time: string;
}

interface Props {
  notices: ProfileNoticeItem[];
  onBack: () => void;
  onReadNotice: (id: number) => void;
  onReadAll: () => void;
  onOpenAction: (action?: ProfileNoticeAction) => void;
}

function noticeToReceivedComment(n: ProfileNoticeItem): CommentReceivedItem {
  // 通知 title 形如 "像素研究所 评论了你"，content 是评论原文
  const title = n.title || '';
  const userName = title.replace(/\s*评论了你.*$/, '').trim() || title;
  return {
    id: `cm-${n.id}`,
    user: userName,
    content: n.content || '',
    target: '',
    time: n.timeAgo || '',
  };
}

function noticeToInfoRow(n: ProfileNoticeItem): NotifItem {
  return {
    id: n.id,
    title: n.title || '',
    content: n.content || '',
    time: n.timeAgo || '',
  };
}

export const NotificationsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeEntry, setActiveEntry] = useState<EntryKey | null>(null);
  const [commentTab, setCommentTab] = useState<CommentTab>('评论我的');

  const [directChats, setDirectChats] = useState<DmChatItem[]>([]);
  const [officialChannels, setOfficialChannels] = useState<OfficialMessageItem[]>([]);
  const [unreadByType, setUnreadByType] = useState<Record<string, number>>({});

  const [commentsReceived, setCommentsReceived] = useState<CommentReceivedItem[]>([]);
  const [commentsMine, setCommentsMine] = useState<MyCommentItem[]>([]);
  const [likeItems, setLikeItems] = useState<NotifItem[]>([]);
  const [followItems, setFollowItems] = useState<NotifItem[]>([]);
  const [orderItems, setOrderItems] = useState<NotifItem[]>([]);
  const [mentionItems, setMentionItems] = useState<NotifItem[]>([]);

  // 主页 - 私信 + 官方推送 + 红点未读数
  useEffect(() => {
    let alive = true;
    Promise.all([
      directMessageApi.sessions().catch(() => ({ data: [] as DmChatItem[] })),
      officialMessageApi.list().catch(() => ({ data: [] as OfficialMessageItem[] })),
      notificationApi.unreadCountByType().catch(() => ({ data: {} as Record<string, number> })),
    ]).then(([sess, official, unread]) => {
      if (!alive) return;
      setDirectChats(sess.data || []);
      setOfficialChannels(official.data || []);
      setUnreadByType(unread.data || {});
    });
    return () => { alive = false; };
  }, []);

  // 切换 entry → 拉对应 type 列表
  useEffect(() => {
    if (!activeEntry) return;
    let alive = true;
    if (activeEntry === 'comments') {
      if (commentTab === '评论我的') {
        notificationApi.list('comments').then((res) => {
          if (!alive) return;
          setCommentsReceived((res.data?.records || []).map(noticeToReceivedComment));
        }).catch(() => undefined);
      } else {
        commentApi.mine().then((res) => {
          if (!alive) return;
          setCommentsMine(res.data || []);
        }).catch(() => undefined);
      }
    } else if (activeEntry === 'likes') {
      notificationApi.list('likes').then((res) => {
        if (!alive) return;
        setLikeItems((res.data?.records || []).map(noticeToInfoRow));
      }).catch(() => undefined);
    } else if (activeEntry === 'follows') {
      notificationApi.list('follows').then((res) => {
        if (!alive) return;
        setFollowItems((res.data?.records || []).map(noticeToInfoRow));
      }).catch(() => undefined);
    } else if (activeEntry === 'orders') {
      notificationApi.list('orders').then((res) => {
        if (!alive) return;
        setOrderItems((res.data?.records || []).map(noticeToInfoRow));
      }).catch(() => undefined);
    } else if (activeEntry === 'mentions') {
      notificationApi.list('mentions').then((res) => {
        if (!alive) return;
        setMentionItems((res.data?.records || []).map(noticeToInfoRow));
      }).catch(() => undefined);
    }
    return () => { alive = false; };
  }, [activeEntry, commentTab]);

  const unreadCount = useMemo(() => {
    const dmUnread = directChats.reduce((sum, item) => sum + item.unread, 0);
    const notifUnread = Object.values(unreadByType).reduce((s, n) => s + n, 0);
    return dmUnread + notifUnread;
  }, [directChats, unreadByType]);
  void unreadCount; // 顶部红点目前不展示，但保留以便后续接入

  const openDirectMessage = (userName: string) => {
    setDirectChats((current) => current.map((item) => (
      item.name === userName ? { ...item, unread: 0 } : item
    )));
    navigation.navigate('DirectMessage', { userName });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="消息" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.quickPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {QUICK_ENTRIES.map((item) => {
            const active = activeEntry === item.key;
            const unread = quickEntryTypeKey(item.key)
              .reduce((sum, t) => sum + (unreadByType[t] || 0), 0);

            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.82}
                onPress={() => setActiveEntry(active ? null : item.key)}
                style={styles.quickItem}
              >
                <View
                  style={[
                    styles.quickIcon,
                    {
                      backgroundColor: `${item.color}14`,
                      borderColor: active ? item.color : 'transparent',
                    },
                  ]}
                >
                  <MCI name={item.icon as any} size={fp(22)} color={item.color} />
                  {unread > 0 ? (
                    <View style={[styles.quickBadge, { backgroundColor: colors.error }]}>
                      <Text style={styles.quickBadgeText}>{unread}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.quickLabel, { color: active ? colors.text : colors.textSecondary }]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeEntry ? (
          <EntryPanel
            activeEntry={activeEntry}
            commentTab={commentTab}
            setCommentTab={setCommentTab}
            commentsReceived={commentsReceived}
            commentsMine={commentsMine}
            likeItems={likeItems}
            followItems={followItems}
            orderItems={orderItems}
            mentionItems={mentionItems}
            colors={colors}
            dark={dark}
          />
        ) : (
          <MessageHome
            directChats={directChats}
            officialChannels={officialChannels}
            colors={colors}
            onOpenChat={openDirectMessage}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function quickEntryTypeKey(k: EntryKey): string[] {
  // 后端 type 是英文枚举：COMMENT / LIKE / FOLLOW / ORDER / MENTION
  switch (k) {
    case 'comments': return ['COMMENT'];
    case 'likes':    return ['LIKE'];
    case 'follows':  return ['FOLLOW'];
    case 'orders':   return ['ORDER'];
    case 'mentions': return ['MENTION'];
  }
}

function MessageHome({
  directChats,
  officialChannels,
  colors,
  onOpenChat,
}: {
  directChats: DmChatItem[];
  officialChannels: OfficialMessageItem[];
  colors: ReturnType<typeof useTheme>['colors'];
  onOpenChat: (userName: string) => void;
}) {
  return (
    <>
      <View style={styles.section}>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {officialChannels.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              style={[
                styles.messageRow,
                styles.pinnedRow,
                { backgroundColor: `${item.color}0E` },
                index > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <View style={[styles.channelIcon, { backgroundColor: item.color }]}>
                <Feather name={item.icon as any} size={fp(19)} color="#FFFFFF" />
              </View>
              <View style={styles.messageMain}>
                <View style={styles.messageTop}>
                  <Text style={[styles.messageTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <Text style={[styles.messageTime, { color: colors.textHint }]}>{item.time}</Text>
                </View>
                <Text style={[styles.messagePreview, { color: colors.textHint }]} numberOfLines={1}>{item.content}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {directChats.map((chat, index) => (
            <TouchableOpacity
              key={chat.id}
              activeOpacity={0.82}
              onPress={() => onOpenChat(chat.name)}
              style={[
                styles.messageRow,
                { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
              ]}
            >
              <Avatar name={chat.name} size={wp(46)} />
              <View style={styles.messageMain}>
                <View style={styles.messageTop}>
                  <Text style={[styles.messageTitle, { color: colors.text }]} numberOfLines={1}>{chat.name}</Text>
                  <Text style={[styles.messageTime, { color: colors.textHint }]}>{chat.time}</Text>
                </View>
                <Text style={[styles.messagePreview, { color: colors.textHint }]} numberOfLines={1}>
                  {chat.preview}
                </Text>
              </View>
              {chat.unread > 0 ? (
                <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.unreadText}>{chat.unread}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );
}

function EntryPanel({
  activeEntry,
  commentTab,
  setCommentTab,
  commentsReceived,
  commentsMine,
  likeItems,
  followItems,
  orderItems,
  mentionItems,
  colors,
  dark,
}: {
  activeEntry: EntryKey;
  commentTab: CommentTab;
  setCommentTab: (tab: CommentTab) => void;
  commentsReceived: CommentReceivedItem[];
  commentsMine: MyCommentItem[];
  likeItems: NotifItem[];
  followItems: NotifItem[];
  orderItems: NotifItem[];
  mentionItems: NotifItem[];
  colors: ReturnType<typeof useTheme>['colors'];
  dark: boolean;
}) {
  if (activeEntry === 'comments') {
    const list = commentTab === '评论我的'
      ? commentsReceived.map((c) => ({ id: c.id, user: c.user, content: c.content, target: c.target, time: c.time }))
      : commentsMine.map((c) => ({ id: c.id, user: c.user, content: c.content, target: c.target, time: c.time }));

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textHint }]}>所有评论</Text>
        <View style={[styles.segment, { backgroundColor: dark ? colors.surfaceHover : '#EAF2FF' }]}>
          {(['评论我的', '我评论的'] as CommentTab[]).map((tab) => {
            const active = tab === commentTab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.84}
                onPress={() => setCommentTab(tab)}
                style={[styles.segmentItem, active && { backgroundColor: colors.surface }]}
              >
                <Text style={[styles.segmentText, { color: active ? colors.text : colors.textSecondary }]}>{tab}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {list.map((item, index) => (
            <InfoRow
              key={item.id}
              icon="message-circle"
              iconColor="#6366F1"
              title={item.user}
              content={item.target ? `${item.content} · ${item.target}` : item.content}
              time={item.time}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  }

  if (activeEntry === 'likes') {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textHint }]}>赞和收藏</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {likeItems.map((item, index) => (
            <InfoRow
              key={item.id}
              icon="heart"
              iconColor="#EF476F"
              title={item.title}
              content={item.content}
              time={item.time}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  }

  if (activeEntry === 'follows') {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textHint }]}>关注消息</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {followItems.map((item, index) => (
            <InfoRow
              key={item.id}
              icon="user-plus"
              iconColor="#22C55E"
              title={item.title}
              content={item.content}
              time={item.time}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  }

  if (activeEntry === 'orders') {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textHint }]}>订单消息</Text>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {orderItems.map((item, index) => (
            <InfoRow
              key={item.id}
              icon="shopping-bag"
              iconColor="#F59E0B"
              title={item.title}
              content={item.content}
              time={item.time}
              index={index}
              colors={colors}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textHint }]}>@我的</Text>
      <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {mentionItems.map((item, index) => (
          <InfoRow
            key={item.id}
            icon="at-sign"
            iconColor="#06A6C8"
            title={item.title}
            content={item.content}
            time={item.time}
            index={index}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

function InfoRow({
  icon,
  iconColor,
  title,
  content,
  time,
  index,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  title: string;
  content: string;
  time: string;
  index: number;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      style={[
        styles.messageRow,
        index > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <View style={[styles.channelIcon, { backgroundColor: iconColor }]}>
        <Feather name={icon} size={fp(19)} color="#FFFFFF" />
      </View>
      <View style={styles.messageMain}>
        <View style={styles.messageTop}>
          <Text style={[styles.messageTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
          <Text style={[styles.messageTime, { color: colors.textHint }]}>{time}</Text>
        </View>
        <Text style={[styles.messagePreview, { color: colors.textHint }]} numberOfLines={1}>{content}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingBottom: wp(42),
  },
  quickPanel: {
    marginTop: wp(2),
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: wp(10),
    paddingBottom: wp(14),
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickItem: {
    alignItems: 'center',
    width: wp(66),
  },
  quickIcon: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickBadge: {
    position: 'absolute',
    top: -wp(2),
    right: -wp(2),
    minWidth: wp(17),
    height: wp(17),
    borderRadius: wp(9),
    paddingHorizontal: wp(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(9),
    fontWeight: '900',
  },
  quickLabel: {
    marginTop: wp(8),
    fontSize: fp(11),
    fontWeight: '800',
  },
  section: {
    marginTop: wp(12),
  },
  sectionHeader: {
    marginHorizontal: wp(16),
    marginBottom: wp(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginLeft: wp(16),
    marginBottom: wp(8),
    fontSize: fp(11),
    fontWeight: '900',
  },
  sectionHeaderTitle: {
    fontSize: fp(11),
    fontWeight: '900',
  },
  sectionMeta: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  listCard: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  messageRow: {
    minHeight: wp(76),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(16),
    paddingVertical: wp(10),
    gap: wp(10),
  },
  pinnedRow: {
    minHeight: wp(72),
  },
  messageMain: {
    flex: 1,
    minWidth: 0,
  },
  messageTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  messageTitle: {
    flexShrink: 1,
    fontSize: fp(13),
    fontWeight: '900',
  },
  messageTime: {
    fontSize: fp(10),
  },
  messagePreview: {
    marginTop: wp(5),
    fontSize: fp(11),
    lineHeight: fp(16),
  },
  unreadBadge: {
    minWidth: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    paddingHorizontal: wp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '900',
  },
  channelIcon: {
    width: wp(46),
    height: wp(46),
    borderRadius: wp(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  segment: {
    marginHorizontal: wp(16),
    marginBottom: wp(10),
    borderRadius: wp(12),
    padding: wp(4),
    flexDirection: 'row',
  },
  segmentItem: {
    flex: 1,
    height: wp(34),
    borderRadius: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: fp(11),
    fontWeight: '900',
  },
});
