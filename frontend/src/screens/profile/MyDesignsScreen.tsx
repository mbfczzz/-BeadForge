import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader, ALL_PATTERNS, BeadGrid, StateView } from '../../components/common';
import { useTheme } from '../../theme';
import { useDesignStore } from '../../store/useDesignStore';
import type { RootStackParamList } from '../../navigation/types';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);
const THUMB_SIZE = wp(72);

// designData 后端是 JSON 字符串、本地 mock 可能是数组，这里做一次容错解析
function parseDesignData(raw: unknown): string[][] | null {
  if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) return raw as string[][];
  if (typeof raw === 'string' && raw.length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
        return parsed as string[][];
      }
    } catch { /* ignore */ }
  }
  return null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: '#f59e0b' },
  PUBLISHED: { label: '已发布', color: '#22c55e' },
  ARCHIVED: { label: '已归档', color: '#6b7280' },
};

interface Props {
  onBack: () => void;
  /** 进入时强制把 tab 切到这个状态（如从「我的草稿」入口直达 DRAFT） */
  initialStatus?: string | null;
}

const STATUS_TABS: { key: string | null; label: string }[] = [
  { key: null, label: '全部' },
  { key: 'DRAFT', label: '草稿' },
  { key: 'PUBLISHED', label: '已发布' },
];

export const MyDesignsScreen: React.FC<Props> = ({ onBack, initialStatus }) => {
  const { colors } = useTheme();
  const { myDesigns, myLoading, myHasMore, myStatus, setMyStatus, fetchMyDesigns } = useDesignStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 入口要求预筛某个 status 时（如「我的草稿」直达 DRAFT），同步到 store
  useEffect(() => {
    if (initialStatus !== undefined && initialStatus !== myStatus) {
      setMyStatus(initialStatus);
    } else {
      void fetchMyDesigns(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="我的作品" onBack={onBack} />

      <View style={[$.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {STATUS_TABS.map((t) => {
          const active = myStatus === t.key;
          return (
            <TouchableOpacity
              key={t.label}
              activeOpacity={0.85}
              onPress={() => setMyStatus(t.key)}
              style={[$.tabBtn, active && { backgroundColor: colors.accent }]}
            >
              <Text style={[$.tabText, { color: active ? '#fff' : colors.textSecondary }]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={myDesigns}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: PAD, paddingBottom: wp(40) }}
        renderItem={({ item }) => {
          // 优先用真实保存的 grid；缺省退回 mock 占位
          const realGrid = parseDesignData(item.designData);
          const pattern = realGrid || ALL_PATTERNS[item.id % ALL_PATTERNS.length];
          const status = STATUS_MAP[item.status] || { label: item.status, color: '#6b7280' };
          // AI 生成可能是 32×32，必须按 grid 尺寸自适应，否则会溢出 thumb
          const maxDim = Math.max(pattern.length, pattern[0]?.length ?? 1);
          const beadSize = THUMB_SIZE / maxDim;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('DesignDetail', { item })}
              style={[$.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[$.thumb, { backgroundColor: colors.inputBg }]}>
                <BeadGrid pixels={pattern} beadSize={beadSize} gap={0} round />
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
            </TouchableOpacity>
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
            : <StateView empty emptyText={
                myStatus === 'DRAFT' ? '暂无草稿，进编辑器画几笔自动会保存到这里'
                  : myStatus === 'PUBLISHED' ? '还没有已发布的作品'
                  : '还没有作品，去创作吧'
              } />
        }
      />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: PAD,
    paddingVertical: wp(8),
    gap: wp(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: {
    paddingHorizontal: wp(14),
    paddingVertical: wp(6),
    borderRadius: wp(14),
  },
  tabText: {
    fontSize: fp(13),
    fontWeight: '600',
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
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: wp(16),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
