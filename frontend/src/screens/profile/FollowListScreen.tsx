import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, Avatar, Button, StateView, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import { profileApi, type ProfileFollowUser } from '../../api/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  type: 'followers' | 'following';
  onBack: () => void;
}

export const FollowListScreen: React.FC<Props> = ({ type, onBack }) => {
  const { colors } = useTheme();
  const [list, setList] = useState<ProfileFollowUser[]>([]);
  const title = type === 'followers' ? '粉丝' : '关注';

  useEffect(() => {
    const fetcher = type === 'followers' ? profileApi.followers() : profileApi.following();
    fetcher.then((res) => setList(res.data || [])).catch(() => setList([]));
  }, [type]);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title={title} onBack={onBack} />

      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={$.content}
        renderItem={({ item }) => (
          <SurfaceCard style={$.card} bodyStyle={$.cardBody}>
            <View style={$.row}>
              <Avatar name={item.nickname} size={wp(48)} />
              <View style={$.textWrap}>
                <Text style={[$.name, { color: colors.text }]}>{item.nickname}</Text>
                <Text style={[$.account, { color: colors.textHint }]}>账号：{item.username}</Text>
                <Text style={[$.bio, { color: colors.textHint }]} numberOfLines={1}>{item.bio}</Text>
              </View>
              <Button
                title={type === 'followers' ? '回关' : '已关注'}
                variant={type === 'followers' ? 'primary' : 'outline'}
                size="sm"
                onPress={() => undefined}
                style={$.actionButton}
              />
            </View>
          </SurfaceCard>
        )}
        ListHeaderComponent={
          <Text style={[$.statsText, { color: colors.textHint }]}>共 {list.length} 位{title}</Text>
        }
        ListEmptyComponent={<StateView empty emptyText={`暂无${title}`} />}
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PAD,
    paddingBottom: wp(40),
    paddingTop: wp(8),
  },
  statsText: {
    fontSize: fp(12),
    fontWeight: '500',
    marginBottom: wp(10),
  },
  card: {
    marginBottom: wp(10),
  },
  cardBody: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textWrap: {
    flex: 1,
    marginLeft: wp(12),
    marginRight: wp(12),
  },
  name: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  account: {
    fontSize: fp(11),
    marginTop: wp(3),
  },
  bio: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
  actionButton: {
    minWidth: wp(78),
  },
});
