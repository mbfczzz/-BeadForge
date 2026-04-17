import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { usePatternStore } from '../../store/usePatternStore';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const PurchasedScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const listings = usePatternStore((state) => state.listings);
  const purchased = usePatternStore((state) => state.purchased);
  const myListings = usePatternStore((state) => state.myListings);

  const owned = listings.filter((item) => purchased.has(item.id) || myListings.has(item.id));
  const displayItems = owned.length > 0 ? owned : listings.slice(0, 4);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>已购图纸</Text>
        <View style={{ width: wp(34) }} />
      </View>

      {owned.length === 0 ? (
        <View style={[$.notice, { backgroundColor: colors.accentLight }]}>
          <Text style={[$.noticeText, { color: colors.accent }]}>当前展示的是本地演示图纸。</Text>
        </View>
      ) : null}

      <FlatList
        data={displayItems}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={$.column}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => (
          <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[$.cover, { backgroundColor: colors.inputBg }]}>
              <BeadGrid
                pixels={ALL_PATTERNS[item.patIdx % ALL_PATTERNS.length]}
                beadSize={wp(5)}
                gap={0.5}
                round
              />
            </View>
            <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[$.desc, { color: colors.textHint }]} numberOfLines={2}>{item.desc}</Text>
            <View style={$.metaRow}>
              <Text style={[$.metaText, { color: colors.textHint }]}>{item.cols} x {item.rows}</Text>
              <Text style={[$.priceText, { color: item.free ? '#22c55e' : colors.text }]}>
                {item.free ? '免费' : `¥ ${item.price}`}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<StateView empty emptyText="暂无已购图纸" />}
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
  notice: {
    marginHorizontal: PAD,
    marginTop: wp(14),
    paddingHorizontal: wp(14),
    paddingVertical: wp(12),
    borderRadius: wp(14),
  },
  noticeText: {
    fontSize: fp(12),
    fontWeight: '600',
  },
  column: {
    justifyContent: 'space-between',
    marginBottom: wp(12),
  },
  card: {
    width: '48%' as const,
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(12),
  },
  cover: {
    height: wp(116),
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(12),
  },
  title: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  desc: {
    fontSize: fp(11),
    lineHeight: fp(17),
    marginTop: wp(6),
    minHeight: fp(34),
  },
  metaRow: {
    marginTop: wp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: fp(10),
  },
  priceText: {
    fontSize: fp(11),
    fontWeight: '700',
  },
});
