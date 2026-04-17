import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { buildMockMyFeeds } from '../../mock/profile';
import { useAuthStore } from '../../store/useAuthStore';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const MyFeedsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);

  const feeds = buildMockMyFeeds(user?.nickname || user?.username || '测试用户');

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>我的动态</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <FlatList
        data={feeds}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => (
          <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={$.topRow}>
              <View style={[$.thumb, { backgroundColor: colors.inputBg }]}>
                <BeadGrid
                  pixels={ALL_PATTERNS[item.patternIndex % ALL_PATTERNS.length]}
                  beadSize={wp(5)}
                  gap={0.5}
                  round
                />
              </View>
              <View style={$.topText}>
                <Text style={[$.name, { color: colors.text }]}>{user?.nickname || user?.username || '测试用户'}</Text>
                <Text style={[$.time, { color: colors.textHint }]}>{item.timeAgo}</Text>
              </View>
            </View>

            <Text style={[$.content, { color: colors.text }]}>{item.content}</Text>

            <View style={$.tagsRow}>
              {item.tags.map((tag) => (
                <View key={`${item.id}-${tag}`} style={[$.tag, { backgroundColor: colors.accentLight }]}>
                  <Text style={[$.tagText, { color: colors.accent }]}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={[$.actionsRow, { borderTopColor: colors.divider }]}>
              <View style={$.action}>
                <Feather name="heart" size={fp(13)} color={colors.textHint} />
                <Text style={[$.actionText, { color: colors.textHint }]}>{item.likeCount}</Text>
              </View>
              <View style={$.action}>
                <Feather name="message-circle" size={fp(13)} color={colors.textHint} />
                <Text style={[$.actionText, { color: colors.textHint }]}>{item.commentCount}</Text>
              </View>
              <View style={$.action}>
                <Feather name="share-2" size={fp(13)} color={colors.textHint} />
                <Text style={[$.actionText, { color: colors.textHint }]}>{item.shareCount}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<StateView empty emptyText="暂无动态" />}
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
  card: {
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(14),
    marginBottom: wp(12),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: wp(56),
    height: wp(56),
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  topText: {
    marginLeft: wp(12),
    flex: 1,
  },
  name: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  time: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
  content: {
    fontSize: fp(14),
    lineHeight: fp(22),
    marginTop: wp(14),
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: wp(12),
  },
  tag: {
    borderRadius: wp(12),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    marginRight: wp(8),
    marginBottom: wp(8),
  },
  tagText: {
    fontSize: fp(11),
    fontWeight: '600',
  },
  actionsRow: {
    marginTop: wp(8),
    paddingTop: wp(12),
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(18),
  },
  actionText: {
    fontSize: fp(11),
    marginLeft: wp(5),
  },
});
