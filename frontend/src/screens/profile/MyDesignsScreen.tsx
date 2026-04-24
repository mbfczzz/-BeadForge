import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader, ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { useDesignStore } from '../../store/useDesignStore';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: '#f59e0b' },
  PUBLISHED: { label: '已发布', color: '#22c55e' },
  ARCHIVED: { label: '已归档', color: '#6b7280' },
};

interface Props {
  onBack: () => void;
}

export const MyDesignsScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const { myDesigns, myLoading, myHasMore, fetchMyDesigns } = useDesignStore();

  useEffect(() => {
    void fetchMyDesigns(true);
  }, [fetchMyDesigns]);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="我的作品" onBack={onBack} />

      <FlatList
        data={myDesigns}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => {
          const pattern = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
          const status = STATUS_MAP[item.status] || { label: item.status, color: '#6b7280' };

          return (
            <View style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[$.thumb, { backgroundColor: colors.inputBg }]}>
                <BeadGrid pixels={pattern} beadSize={wp(5)} gap={0.5} round />
              </View>
              <View style={$.content}>
                <Text style={[$.title, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[$.desc, { color: colors.textHint }]} numberOfLines={2}>{item.description}</Text>
                <View style={$.metaRow}>
                  <View style={[$.statusBadge, { backgroundColor: `${status.color}18` }]}>
                    <Text style={[$.statusText, { color: status.color }]}>{status.label}</Text>
                  </View>
                  <Text style={[$.dateText, { color: colors.textHint }]}>{item.createdAt?.slice(0, 10)}</Text>
                </View>
              </View>
            </View>
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={myLoading && myDesigns.length > 0}
            onRefresh={() => {
              void fetchMyDesigns(true);
            }}
            tintColor={colors.accent}
          />
        }
        onEndReached={() => {
          if (myHasMore) {
            void fetchMyDesigns(false);
          }
        }}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          myLoading
            ? <StateView loading />
            : <StateView empty emptyText="还没有作品，去创作吧" />
        }
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
    flexDirection: 'row',
    borderRadius: wp(18),
    borderWidth: 1,
    padding: wp(12),
    marginBottom: wp(12),
  },
  thumb: {
    width: wp(72),
    height: wp(72),
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: wp(12),
  },
  title: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  desc: {
    fontSize: fp(11),
    lineHeight: fp(17),
    marginTop: wp(6),
  },
  metaRow: {
    marginTop: wp(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: wp(10),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  dateText: {
    fontSize: fp(10),
  },
});
