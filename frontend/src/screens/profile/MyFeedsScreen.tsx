import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { HoverView, Avatar, StateView } from '../../components/common';
import { useAuthStore } from '../../store/useAuthStore';
import { wp, fp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import client from '../../api/client';

const PAD = wp(16);

interface FeedItem {
  id: number;
  content: string;
  tags: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
}

interface Props { onBack: () => void }

export const MyFeedsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const { user } = useAuthStore();
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeeds = useCallback(async () => {
    try {
      const res: any = await client.get('/feeds/list', { params: { page: 1, size: 50 } });
      const all: FeedItem[] = res.data?.records || res.data || [];
      const mine = all.filter((f: any) => f.userId === user?.id);
      setFeeds(mine);
    } catch {
      setFeeds([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchFeeds(); }, [fetchFeeds]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchFeeds(); }, [fetchFeeds]);

  const formatTime = (t: string) => {
    if (!t) return '';
    const d = new Date(t);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return t.slice(0, 10);
  };

  const renderItem = ({ item }: { item: FeedItem }) => (
    <View style={[$.card, {
      backgroundColor: colors.surface,
      borderColor: dark ? colors.border : 'transparent',
      borderWidth: dark ? 1 : 0,
      ...(dark ? {} : shadow(3, 10, 0.08, '#5A4A3E', 2)),
    }]}>
      {/* 头部 */}
      <View style={$.cardHeader}>
        <Avatar uri={user?.avatar} name={user?.nickname || user?.username} size={wp(38)} />
        <View style={$.cardHeaderInfo}>
          <Text style={[$.cardNick, { color: colors.text }]}>{user?.nickname || user?.username}</Text>
          <Text style={[$.cardTime, { color: colors.textHint }]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>

      {/* 内容 */}
      <Text style={[$.cardContent, { color: colors.text }]}>{item.content}</Text>

      {/* 标签 */}
      {item.tags ? (
        <View style={$.tagsRow}>
          {item.tags.split(',').map((tag) => (
            <View key={tag} style={[$.tag, { backgroundColor: dark ? colors.accent + '15' : colors.accentLight }]}>
              <Text style={[$.tagText, { color: colors.accent }]}>#{tag.trim()}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* 互动栏 */}
      <View style={[$.cardActions, { borderTopColor: colors.divider }]}>
        {[
          { icon: 'heart' as const, count: item.likeCount, activeColor: '#C8302B' },       // 朱砂
          { icon: 'message-circle' as const, count: item.commentCount, activeColor: '#7BA4C9' }, // 天青
          { icon: 'share-2' as const, count: item.shareCount, activeColor: '#4D8A5E' },     // 松绿
        ].map((a) => (
          <View key={a.icon} style={$.actionItem}>
            <Feather name={a.icon} size={fp(14)} color={a.count > 0 ? a.activeColor : colors.textHint} />
            <Text style={[$.actionNum, { color: a.count > 0 ? colors.textSecondary : colors.textHint }]}>
              {a.count > 0 ? a.count : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>我的动态</Text>
        <View style={{ width: wp(34) }} />
      </View>

      {/* 统计条 */}
      {!loading && feeds.length > 0 && (
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textSecondary }]}>共 {feeds.length} 条动态</Text>
        </View>
      )}

      <FlatList
        data={feeds}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: PAD, gap: wp(12), paddingBottom: wp(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={loading
          ? <StateView loading />
          : (
            <View style={$.emptyWrap}>
              <View style={[$.emptyIcon, { backgroundColor: dark ? colors.candy.lavender + '30' : '#EEE8F5' }]}>
                <Feather name="edit" size={fp(28)} color={colors.accent} />
              </View>
              <Text style={[$.emptyTitle, { color: colors.text }]}>还没有动态</Text>
              <Text style={[$.emptySub, { color: colors.textHint }]}>去社区发布你的第一条动态吧</Text>
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
    borderRadius: wp(20), padding: PAD,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: wp(12) },
  cardHeaderInfo: { marginLeft: wp(10), flex: 1 },
  cardNick: { fontSize: fp(14), fontWeight: '700' },
  cardTime: { fontSize: fp(10), marginTop: wp(2) },
  cardContent: { fontSize: fp(14), lineHeight: fp(22), letterSpacing: 0.2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: wp(6), marginTop: wp(10) },
  tag: { paddingHorizontal: wp(10), paddingVertical: wp(4), borderRadius: wp(6) },
  tagText: { fontSize: fp(11), fontWeight: '600' },
  cardActions: {
    flexDirection: 'row', gap: wp(28), marginTop: wp(14),
    paddingTop: wp(12), borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: wp(5) },
  actionNum: { fontSize: fp(12), fontWeight: '500' },

  emptyWrap: { alignItems: 'center', paddingTop: wp(60) },
  emptyIcon: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
  },
  emptyTitle: { fontSize: fp(16), fontWeight: '700', marginBottom: wp(6) },
  emptySub: { fontSize: fp(13) },
});
