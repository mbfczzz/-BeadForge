import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { Avatar, HoverView, StateView } from '../../components/common';
import { useAuthStore } from '../../store/useAuthStore';
import { wp, fp } from '../../utils/responsive';

const PAD = wp(16);

interface FollowUser {
  id: number;
  username: string;
  nickname: string;
  avatar?: string;
  bio?: string;
}

// 后端暂无粉丝/关注列表接口，使用 mock 数据展示
const MOCK_FOLLOWERS: FollowUser[] = [
  { id: 3, username: 'pindoudaren', nickname: '拼豆达人', bio: '手作爱好者，擅长像素风' },
  { id: 5, username: 'huahua', nickname: '花花世界', bio: '花卉主题设计师' },
  { id: 9, username: 'caihongqiao', nickname: '彩虹桥', bio: '配色控，七色彩虹系列作者' },
];

const MOCK_FOLLOWING: FollowUser[] = [
  { id: 2, username: 'xiaodouzi', nickname: '小豆子', bio: '新手一枚，正在努力学习中' },
  { id: 3, username: 'pindoudaren', nickname: '拼豆达人', bio: '手作爱好者，擅长像素风' },
  { id: 9, username: 'caihongqiao', nickname: '彩虹桥', bio: '配色控，七色彩虹系列作者' },
];

interface Props {
  type: 'followers' | 'following';
  onBack: () => void;
}

export const FollowListScreen: React.FC<Props> = ({ type, onBack }) => {
  const { colors, dark } = useTheme();
  const { stats } = useAuthStore();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = () => {
    // TODO: 替换为真实 API
    setTimeout(() => {
      setUsers(type === 'followers' ? MOCK_FOLLOWERS : MOCK_FOLLOWING);
      setLoading(false);
      setRefreshing(false);
    }, 300);
  };

  useEffect(() => { fetchUsers(); }, [type]);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const title = type === 'followers' ? '粉丝' : '关注';
  const count = type === 'followers' ? stats.followerCount : stats.followingCount;

  const renderItem = ({ item, index }: { item: FollowUser; index: number }) => (
    <View style={[$.userCard, {
      backgroundColor: colors.surface,
      borderBottomColor: colors.divider,
      borderBottomWidth: index < users.length - 1 ? StyleSheet.hairlineWidth : 0,
    }]}>
      <Avatar uri={item.avatar} name={item.nickname || item.username} size={wp(46)} />
      <View style={$.userInfo}>
        <View style={$.nameRow}>
          <Text style={[$.userName, { color: colors.text }]}>{item.nickname}</Text>
          <Text style={[$.userHandle, { color: colors.textHint }]}>@{item.username}</Text>
        </View>
        {item.bio ? (
          <Text style={[$.userBio, { color: colors.textSecondary }]} numberOfLines={1}>{item.bio}</Text>
        ) : null}
      </View>
      {type === 'followers' ? (
        <TouchableOpacity style={[$.followBtn, { backgroundColor: colors.accent }]} activeOpacity={0.7}>
          <Feather name="user-plus" size={fp(11)} color="#fff" />
          <Text style={$.followBtnText}>回关</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={[$.followingBtn, { backgroundColor: dark ? colors.border : '#F3F4F6' }]} activeOpacity={0.7}>
          <Feather name="check" size={fp(11)} color={colors.textSecondary} />
          <Text style={[$.followingBtnText, { color: colors.textSecondary }]}>已关注</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: wp(34) }} />
      </View>

      {/* 统计条 */}
      {!loading && (
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textSecondary }]}>
            {count} {type === 'followers' ? '位粉丝' : '位关注'}
          </Text>
        </View>
      )}

      <FlatList
        data={users}
        keyExtractor={(i) => i.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: wp(40) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={loading
          ? <StateView loading />
          : (
            <View style={$.emptyWrap}>
              <View style={[$.emptyIcon, { backgroundColor: dark ? '#1a1a2a' : '#F3EEFF' }]}>
                <Feather name={type === 'followers' ? 'users' : 'user-plus'} size={fp(28)} color={colors.accent} />
              </View>
              <Text style={[$.emptyTitle, { color: colors.text }]}>
                {type === 'followers' ? '还没有粉丝' : '还没有关注的人'}
              </Text>
              <Text style={[$.emptySub, { color: colors.textHint }]}>
                {type === 'followers' ? '发布更多作品来吸引粉丝吧' : '去发现优秀的创作者吧'}
              </Text>
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
    paddingHorizontal: PAD, paddingVertical: wp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsText: { fontSize: fp(12), fontWeight: '500' },

  userCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(14),
  },
  userInfo: { flex: 1, marginLeft: wp(12) },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: wp(6) },
  userName: { fontSize: fp(14), fontWeight: '700' },
  userHandle: { fontSize: fp(11) },
  userBio: { fontSize: fp(11), marginTop: wp(3), lineHeight: fp(15) },

  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(14), paddingVertical: wp(7),
    borderRadius: wp(16),
  },
  followBtnText: { color: '#fff', fontSize: fp(12), fontWeight: '700' },
  followingBtn: {
    flexDirection: 'row', alignItems: 'center', gap: wp(4),
    paddingHorizontal: wp(12), paddingVertical: wp(7),
    borderRadius: wp(16),
  },
  followingBtnText: { fontSize: fp(12), fontWeight: '500' },

  emptyWrap: { alignItems: 'center', paddingTop: wp(60) },
  emptyIcon: {
    width: wp(72), height: wp(72), borderRadius: wp(36),
    justifyContent: 'center', alignItems: 'center', marginBottom: wp(16),
  },
  emptyTitle: { fontSize: fp(16), fontWeight: '700', marginBottom: wp(6) },
  emptySub: { fontSize: fp(13) },
});
