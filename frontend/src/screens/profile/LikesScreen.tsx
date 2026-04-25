import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Avatar, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { profileApi, type ProfileReceivedLikeItem } from '../../api/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const LikesScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<ProfileReceivedLikeItem[]>([]);

  useEffect(() => {
    profileApi.receivedLikes().then((res) => setItems(res.data || [])).catch(() => setItems([]));
  }, []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>谁赞了我</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textHint }]}>
            共 {items.length} 条获赞记录
          </Text>
        </View>

        {items.length === 0 ? (
          <StateView empty emptyText="暂无获赞记录" />
        ) : (
          items.map((item, index) => (
            <View
              key={item.id}
              style={[
                $.row,
                {
                  backgroundColor: colors.surface,
                  borderBottomColor: index < items.length - 1 ? colors.divider : 'transparent',
                  borderBottomWidth: index < items.length - 1 ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              <Avatar name={item.userName} size={wp(44)} />

              <View style={$.content}>
                <View style={$.headlineRow}>
                  <Text style={[$.headline, { color: colors.text }]} numberOfLines={1}>
                    <Text style={$.userName}>{item.userName}</Text>
                    <Text> 赞了你的{item.targetType}</Text>
                  </Text>
                  <View style={[$.badge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[$.badgeText, { color: colors.accent }]}>{item.userTitle}</Text>
                  </View>
                </View>

                <Text style={[$.meta, { color: colors.textHint }]} numberOfLines={1}>
                  账号：{item.username}
                </Text>
                <Text style={[$.target, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.targetType}：{item.targetTitle}
                </Text>
              </View>

              <View style={$.right}>
                <View style={$.heartRow}>
                  <Feather name="heart" size={fp(11)} color="#ef4444" />
                  <Text style={[$.heartText, { color: colors.textHint }]}>已点赞</Text>
                </View>
                <Text style={[$.time, { color: colors.textHint }]}>{item.timeAgo}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    alignItems: 'flex-start',
    paddingHorizontal: PAD,
    paddingVertical: wp(14),
  },
  content: {
    flex: 1,
    marginLeft: wp(12),
    marginRight: wp(10),
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headline: {
    flex: 1,
    fontSize: fp(14),
    lineHeight: fp(20),
    fontWeight: '500',
    marginRight: wp(8),
  },
  userName: {
    fontWeight: '700',
  },
  badge: {
    borderRadius: wp(10),
    paddingHorizontal: wp(8),
    paddingVertical: wp(4),
  },
  badgeText: {
    fontSize: fp(10),
    fontWeight: '600',
  },
  meta: {
    fontSize: fp(11),
    marginTop: wp(5),
  },
  target: {
    fontSize: fp(12),
    marginTop: wp(4),
  },
  right: {
    alignItems: 'flex-end',
    paddingTop: wp(2),
  },
  heartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartText: {
    fontSize: fp(11),
    marginLeft: wp(4),
  },
  time: {
    fontSize: fp(10),
    marginTop: wp(6),
  },
});
