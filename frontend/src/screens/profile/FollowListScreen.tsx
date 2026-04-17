import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Avatar, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { MOCK_PROFILE_FOLLOWERS, MOCK_PROFILE_FOLLOWING } from '../../mock/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  type: 'followers' | 'following';
  onBack: () => void;
}

export const FollowListScreen: React.FC<Props> = ({ type, onBack }) => {
  const { colors } = useTheme();
  const list = type === 'followers' ? MOCK_PROFILE_FOLLOWERS : MOCK_PROFILE_FOLLOWING;
  const title = type === 'followers' ? '粉丝' : '关注';

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <Text style={[$.statsText, { color: colors.textHint }]}>共 {list.length} 位{title}</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: wp(40) }}
        renderItem={({ item, index }) => (
          <View
            style={[
              $.row,
              {
                backgroundColor: colors.surface,
                borderBottomColor: index < list.length - 1 ? colors.divider : 'transparent',
                borderBottomWidth: index < list.length - 1 ? StyleSheet.hairlineWidth : 0,
              },
            ]}
          >
            <Avatar name={item.nickname} size={wp(46)} />
            <View style={$.content}>
              <Text style={[$.name, { color: colors.text }]}>{item.nickname}</Text>
              <Text style={[$.account, { color: colors.textHint }]}>账号：{item.username}</Text>
              <Text style={[$.bio, { color: colors.textHint }]} numberOfLines={1}>{item.bio}</Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              style={[
                $.button,
                {
                  backgroundColor: type === 'followers' ? colors.accent : colors.inputBg,
                },
              ]}
            >
              <Text style={[
                $.buttonText,
                { color: type === 'followers' ? '#fff' : colors.textSecondary },
              ]}>
                {type === 'followers' ? '回关' : '已关注'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<StateView empty emptyText={`暂无${title}`} />}
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    height: wp(52),
    borderBottomWidth: 1,
  },
  navButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(16),
    fontWeight: '700',
  },
  statsBar: {
    paddingHorizontal: PAD,
    paddingVertical: wp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statsText: {
    fontSize: fp(12),
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: wp(14),
  },
  content: {
    flex: 1,
    marginLeft: wp(12),
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
  button: {
    minWidth: wp(64),
    height: wp(30),
    borderRadius: wp(15),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(12),
  },
  buttonText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
});
