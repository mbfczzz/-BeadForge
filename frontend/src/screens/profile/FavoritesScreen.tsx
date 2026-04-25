import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ALL_PATTERNS, AppHeader, BeadGrid, StateView, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import { profileApi, type ProfileFavoriteItem } from '../../api/profile';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);
const GAP = wp(10);
const CARD_W = Math.floor((Dimensions.get('window').width - PAD * 2 - GAP) / 2);

interface Props {
  onBack: () => void;
}

export const FavoritesScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<ProfileFavoriteItem[]>([]);

  useEffect(() => {
    profileApi.favorites().then((res) => setFavorites(res.data || [])).catch(() => setFavorites([]));
  }, []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="我的收藏" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$.content}>
        <Text style={[$.statsText, { color: colors.textHint }]}>共 {favorites.length} 个收藏</Text>

        {favorites.length === 0 ? (
          <StateView empty emptyText="暂无收藏" />
        ) : (
          <View style={$.grid}>
            {favorites.map((item, index) => {
              const pattern = ALL_PATTERNS[item.patternIndex % ALL_PATTERNS.length];
              const beadSize = Math.min(Math.floor((CARD_W - wp(28)) / (pattern[0]?.length || 9)), wp(8));

              return (
                <View key={item.id} style={{ width: CARD_W, marginLeft: index % 2 === 1 ? GAP : 0, marginBottom: GAP }}>
                  <SurfaceCard style={$.card} bodyStyle={$.cardBody}>
                    <View style={[$.cover, { backgroundColor: colors.inputBg }]}>
                      <BeadGrid pixels={pattern} beadSize={beadSize} gap={1} round />
                    </View>
                    <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                    <View style={$.metaRow}>
                      <Text style={[$.author, { color: colors.textHint }]} numberOfLines={1}>{item.author}</Text>
                      <View style={$.likeRow}>
                        <Feather name="heart" size={fp(10)} color="#ef4444" />
                        <Text style={[$.likeText, { color: colors.textHint }]}>{item.likeCount}</Text>
                      </View>
                    </View>
                  </SurfaceCard>
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
  content: {
    paddingHorizontal: PAD,
    paddingBottom: wp(40),
    paddingTop: wp(8),
  },
  statsText: {
    fontSize: fp(12),
    fontWeight: '500',
    marginBottom: wp(12),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: wp(18),
  },
  cardBody: {
    gap: wp(10),
  },
  cover: {
    height: wp(104),
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
