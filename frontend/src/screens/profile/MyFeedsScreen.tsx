import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { AppHeader, Avatar, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { buildMockMyFeeds } from '../../mock/profile';
import { useAuthStore } from '../../store/useAuthStore';
import { getFeedMockMedia } from '../../utils/feedMedia';
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
      <AppHeader title="我的动态" onBack={onBack} />

      <FlatList
        data={feeds}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => {
          const media = getFeedMockMedia(item);
          const mediaHeight = wp(310) / media.aspectRatio;

          return (
            <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={$.topRow}>
                <Avatar name={user?.nickname || user?.username || '测试用户'} size={wp(40)} />
                <View style={$.topText}>
                  <Text style={[$.name, { color: colors.text }]}>{user?.nickname || user?.username || '测试用户'}</Text>
                  <Text style={[$.time, { color: colors.textHint }]}>{item.timeAgo}</Text>
                </View>
              </View>

              <Text style={[$.content, { color: colors.text }]}>{item.content}</Text>
              {item.caption ? <Text style={[$.caption, { color: colors.textHint }]}>{item.caption}</Text> : null}

              <View style={[$.mediaCard, { height: mediaHeight, borderColor: `${media.accent}20` }]}>
                <SvgXml xml={media.svg} width={wp(310)} height={mediaHeight} />
                <View style={$.mediaBadgeRow}>
                  <View style={[$.mediaBadge, { backgroundColor: 'rgba(15,23,42,0.72)' }]}>
                    <Text style={$.mediaBadgeText}>{item.media.type === 'video' ? 'VIDEO' : item.media.type === 'gif' ? 'GIF' : 'PHOTO'}</Text>
                  </View>
                  {item.media.type === 'video' && item.media.durationSec ? (
                    <View style={[$.mediaBadge, { backgroundColor: 'rgba(15,23,42,0.72)' }]}>
                      <MCI name="play" size={fp(10)} color="#FFFFFF" />
                      <Text style={$.mediaBadgeText}>{`0:${`${item.media.durationSec}`.padStart(2, '0')}`}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

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
          );
        }}
        ListEmptyComponent={<StateView empty emptyText="暂无动态" />}
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  card: {
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(14),
    marginBottom: wp(12),
  },
  mediaCard: {
    marginTop: wp(14),
    borderRadius: wp(18),
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#F7FAFF',
  },
  mediaBadgeRow: {
    position: 'absolute',
    top: wp(10),
    left: wp(10),
    flexDirection: 'row',
    gap: wp(8),
  },
  mediaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
  },
  mediaBadgeText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '700',
  },
  topRow: {
    flexDirection: 'row',
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
  caption: {
    fontSize: fp(12),
    lineHeight: fp(18),
    marginTop: wp(8),
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
