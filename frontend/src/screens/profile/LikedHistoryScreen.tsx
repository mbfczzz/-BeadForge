import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { profileApi, type ProfileGivenLikeItem } from '../../api/profile';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const LikedHistoryScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const [items, setItems] = useState<ProfileGivenLikeItem[]>([]);

  useEffect(() => {
    profileApi.givenLikes().then((res) => setItems(res.data || [])).catch(() => setItems([]));
  }, []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>我的点赞</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textHint }]}>
            共 {items.length} 条点赞记录
          </Text>
        </View>

        {items.length === 0 ? (
          <StateView empty emptyText="暂无点赞记录" />
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
              <View style={[$.thumb, { backgroundColor: colors.inputBg }]}>
                <BeadGrid
                  pixels={ALL_PATTERNS[item.patternIndex % ALL_PATTERNS.length]}
                  beadSize={wp(5)}
                  gap={0.5}
                  round
                />
              </View>

              <View style={$.content}>
                <View style={$.topRow}>
                  <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                  <View style={[$.typeBadge, { backgroundColor: colors.accentLight }]}>
                    <Text style={[$.typeText, { color: colors.accent }]}>{item.targetType}</Text>
                  </View>
                </View>

                <Text style={[$.author, { color: colors.textHint }]} numberOfLines={1}>
                  作者：{item.author}
                </Text>

                <View style={$.metaRow}>
                  <View style={$.likeRow}>
                    <Feather name="heart" size={fp(11)} color="#ef4444" />
                    <Text style={[$.likeText, { color: colors.textHint }]}>{item.likeCount}</Text>
                  </View>
                  <Text style={[$.time, { color: colors.textHint }]}>{item.timeAgo}</Text>
                </View>
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
    alignItems: 'center',
    paddingHorizontal: PAD,
    paddingVertical: wp(14),
  },
  thumb: {
    width: wp(54),
    height: wp(54),
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: wp(12),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: fp(14),
    fontWeight: '700',
    marginRight: wp(8),
  },
  typeBadge: {
    borderRadius: wp(10),
    paddingHorizontal: wp(8),
    paddingVertical: wp(4),
  },
  typeText: {
    fontSize: fp(10),
    fontWeight: '600',
  },
  author: {
    fontSize: fp(11),
    marginTop: wp(5),
  },
  metaRow: {
    marginTop: wp(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: fp(11),
    marginLeft: wp(4),
  },
  time: {
    fontSize: fp(10),
  },
});
