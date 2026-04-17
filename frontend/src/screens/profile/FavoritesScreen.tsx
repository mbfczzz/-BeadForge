import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { MOCK_PROFILE_FAVORITES } from '../../mock/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);
const GAP = wp(10);
const CARD_W = Math.floor((Dimensions.get('window').width - PAD * 2 - GAP) / 2);

interface Props {
  onBack: () => void;
}

export const FavoritesScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>我的收藏</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <View style={[$.statsBar, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          <Text style={[$.statsText, { color: colors.textHint }]}>共 {MOCK_PROFILE_FAVORITES.length} 个收藏</Text>
        </View>

        {MOCK_PROFILE_FAVORITES.length === 0 ? (
          <StateView empty emptyText="暂无收藏" />
        ) : (
          <View style={$.grid}>
            {MOCK_PROFILE_FAVORITES.map((item, index) => {
              const pattern = ALL_PATTERNS[item.patternIndex % ALL_PATTERNS.length];
              const beadSize = Math.min(Math.floor((CARD_W - wp(20)) / (pattern[0]?.length || 9)), wp(8));

              return (
                <View key={item.id} style={{ width: CARD_W, marginLeft: index % 2 === 1 ? GAP : 0, marginBottom: GAP }}>
                  <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={[$.cover, { backgroundColor: colors.inputBg }]}>
                      <BeadGrid pixels={pattern} beadSize={beadSize} gap={1} round />
                    </View>
                    <View style={$.body}>
                      <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                      <View style={$.metaRow}>
                        <Text style={[$.author, { color: colors.textHint }]} numberOfLines={1}>{item.author}</Text>
                        <View style={$.likeRow}>
                          <Feather name="heart" size={fp(10)} color="#ef4444" />
                          <Text style={[$.likeText, { color: colors.textHint }]}>{item.likeCount}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PAD,
    paddingTop: wp(12),
  },
  card: {
    borderRadius: wp(16),
    borderWidth: 1,
    overflow: 'hidden',
  },
  cover: {
    height: wp(96),
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: wp(10),
  },
  title: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: wp(6),
  },
  author: {
    flex: 1,
    fontSize: fp(10),
    marginRight: wp(8),
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeText: {
    fontSize: fp(10),
    marginLeft: wp(4),
  },
});
