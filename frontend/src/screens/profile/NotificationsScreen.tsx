import React, { useMemo, useState } from 'react';
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

type EntryKey = 'comments' | 'likes' | 'follows' | 'orders' | 'mentions';
type CommentTab = '评论我的' | '我评论的';

const QUICK_ENTRIES: Array<{
  key: EntryKey;
  label: string;
  icon: keyof typeof MCI.glyphMap;
  color: string;
  unread?: number;
}> = [
  { key: 'comments', label: '所有评论', icon: 'comment-text-outline', color: '#6366F1', unread: 3 },
  { key: 'likes', label: '赞和收藏', icon: 'heart-outline', color: '#EF476F', unread: 5 },
  { key: 'follows', label: '关注消息', icon: 'account-plus-outline', color: '#22C55E', unread: 2 },
  { key: 'orders', label: '订单消息', icon: 'package-variant-closed', color: '#F59E0B', unread: 1 },
  { key: 'mentions', label: '@我的', icon: 'at', color: '#06A6C8' },
];

const INITIAL_DIRECT_CHATS = [
  {
    id: 'chat-mumu',
    name: '木木手作',
    role: '教程作者',
    preview: '刚刚发来的多图参考我看到了，边缘修得很干净。',
    time: '刚刚',
    unread: 2,
  },
  {
    id: 'chat-studio',
    name: '饰品工作室',
    role: '手作品牌',
    preview: '那张动图可以做封面，循环节奏挺舒服。',
    time: '08:12',
    unread: 0,
  },
];

const OFFICIAL_CHANNELS = [
  {
    id: 'official',
    title: '官方消息',
    content: '您的账号安全状态正常，新的社区创作规范已更新。',
    time: '2天前',
    icon: 'volume-2' as keyof typeof Feather.glyphMap,
    color: '#3B82F6',
  },
  {
    id: 'activity',
    title: '活动消息',
    content: '春日串珠灵感征集开启，发布作品可获得限定徽章。',
    time: '今天 09:20',
    icon: 'gift' as keyof typeof Feather.glyphMap,
    color: '#F59E0B',
  },
];

const COMMENT_THREADS: Record<CommentTab, Array<{ id: string; user: string; content: string; target: string; time: string }>> = {
  评论我的: [
    { id: 'cm-1', user: '像素研究所', content: '这个边缘处理太干净了，配色也很适合做成动图封面。', target: '《像素花束卡片》', time: '12分钟前' },
    { id: 'cm-2', user: '木木手作', content: '第二张参考图更有层次，建议保留透明珠的高光。', target: '多图灵感分享', time: '1小时前' },
  ],
  我评论的: [
    { id: 'cg-1', user: '我', content: '这组颜色更适合浅色背景，深色边缘可以再细一点。', target: '饰品工作室的动态', time: '昨天' },
    { id: 'cg-2', user: '我', content: '循环节奏挺舒服，可以把第一帧留久一点。', target: '木木手作的动图', time: '2天前' },
  ],
};

const LIKE_FAVORITE_ITEMS = [
  { id: 'lf-1', title: '木木手作 赞了你的作品', content: '《像素花束卡片》收到了新的点赞。', time: '1小时前', icon: 'heart' as keyof typeof Feather.glyphMap },
  { id: 'lf-2', title: '饰品工作室 收藏了你的动态', content: '多图参考被加入灵感收藏夹。', time: '昨天', icon: 'bookmark' as keyof typeof Feather.glyphMap },
];

const FOLLOW_ITEMS = [
  { id: 'fw-1', title: '编织研究室 关注了你', content: '你们现在可以互相查看动态更新。', time: '刚刚' },
  { id: 'fw-2', title: '小珠设计 关注了你', content: '对方常发布原创串珠配色。', time: '3小时前' },
];

const ORDER_ITEMS = [
  { id: 'od-1', title: '订单待支付提醒', content: '72 色拼豆新手套装订单尚未支付，库存将为你保留 24 小时。', time: '刚刚' },
  { id: 'od-2', title: '商品已发货', content: '5mm 标准珠 48 色补充包已发货，物流正在揽收中。', time: '20分钟前' },
];

const MENTION_ITEMS = [
  { id: 'at-1', title: '像素研究所 提到了你', content: '在「边缘修图技巧」动态中 @ 了你。', time: '20分钟前' },
];

interface Props {
  notices: ProfileNoticeItem[];
  onBack: () => void;
  onReadNotice: (id: number) => void;
  onReadAll: () => void;
  onOpenAction: (action?: ProfileNoticeAction) => void;
}

export const NotificationsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeEntry, setActiveEntry] = useState<EntryKey | null>(null);
  const [commentTab, setCommentTab] = useState<CommentTab>('评论我的');
  const [directChats, setDirectChats] = useState(INITIAL_DIRECT_CHATS);

  const unreadCount = useMemo(
    () => directChats.reduce((sum, item) => sum + item.unread, 0) + QUICK_ENTRIES.reduce((sum, item) => sum + (item.unread ?? 0), 0),
    [directChats],
  );

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
                  <MCI name={item.icon} size={fp(22)} color={item.color} />
                  {item.unread ? (
                    <View style={[styles.quickBadge, { backgroundColor: colors.error }]}>
                      <Text style={styles.quickBadgeText}>{item.unread}</Text>
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
            colors={colors}
            dark={dark}
          />
        ) : (
          <MessageHome
            directChats={directChats}
            colors={colors}
            onOpenChat={openDirectMessage}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

function MessageHome({
  directChats,
  colors,
  onOpenChat,
}: {
  directChats: typeof INITIAL_DIRECT_CHATS;
  colors: ReturnType<typeof useTheme>['colors'];
  onOpenChat: (userName: string) => void;
}) {
  return (
    <>
      <View style={styles.section}>
        <View style={[styles.listCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {OFFICIAL_CHANNELS.map((item, index) => (
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
                <Feather name={item.icon} size={fp(19)} color="#FFFFFF" />
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
  colors,
  dark,
}: {
  activeEntry: EntryKey;
  commentTab: CommentTab;
  setCommentTab: (tab: CommentTab) => void;
  colors: ReturnType<typeof useTheme>['colors'];
  dark: boolean;
}) {
  if (activeEntry === 'comments') {
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
          {COMMENT_THREADS[commentTab].map((item, index) => (
            <InfoRow
              key={item.id}
              icon="message-circle"
              iconColor="#6366F1"
              title={item.user}
              content={`${item.content} · ${item.target}`}
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
          {LIKE_FAVORITE_ITEMS.map((item, index) => (
            <InfoRow
              key={item.id}
              icon={item.icon}
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
          {FOLLOW_ITEMS.map((item, index) => (
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
          {ORDER_ITEMS.map((item, index) => (
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
        {MENTION_ITEMS.map((item, index) => (
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
