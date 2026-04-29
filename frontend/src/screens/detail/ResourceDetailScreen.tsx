import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, Button, StateView, SurfaceCard } from '../../components/common';
import { ALL_PATTERNS, BeadGrid } from '../../components/common/BeadGrid';
import type { RootScreenProps } from '../../navigation/types';
import { usePatternStore } from '../../store/usePatternStore';
import { useResourceAccessStore } from '../../store/useResourceAccessStore';
import { useTheme } from '../../theme';
import { BOTTOM_SAFE_H, fp, screenW, wp } from '../../utils/responsive';

const PAD = wp(16);

export const ResourceDetailScreen: React.FC<RootScreenProps<'ResourceDetail'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const resource = usePatternStore((state) => state.listings.find((item) => item.id === route.params.resourceId));
  const isMine = usePatternStore((state) => state.isMine);
  const canAccessFile = useResourceAccessStore((state) => state.canAccessFile);
  const canDownloadImage = useResourceAccessStore((state) => state.canDownloadImage);
  const unlockFree = useResourceAccessStore((state) => state.unlockFree);
  const unlockWithPoints = useResourceAccessStore((state) => state.unlockWithPoints);
  const unlockWithMember = useResourceAccessStore((state) => state.unlockWithMember);
  const markDownloaded = useResourceAccessStore((state) => state.markDownloaded);
  const membershipActive = useResourceAccessStore((state) => state.membershipActive);
  const pointsBalance = useResourceAccessStore((state) => state.pointsBalance);
  const [loading, setLoading] = useState(false);

  if (!resource) {
    return (
      <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
        <AppHeader title="资源详情" onBack={() => navigation.goBack()} />
        <View style={$.emptyWrap}>
          <StateView empty emptyText="资源不存在或已下架" />
        </View>
      </SafeAreaView>
    );
  }

  const owned = isMine(resource.id) || canAccessFile(resource);
  const downloaded = canDownloadImage(resource) || isMine(resource.id);
  const downloadable = owned && downloaded;
  const previewPixels = resource.gridData || ALL_PATTERNS[resource.patIdx % ALL_PATTERNS.length];
  const previewWidth = screenW - PAD * 2 - wp(36);
  const beadSize = Math.max(8, Math.min(wp(18), Math.floor(previewWidth / Math.max(resource.cols, 1)) - 1));

  const statusText = owned
    ? (downloadable ? '已解锁，可直接下载图纸图片' : '已获得，可继续制作')
    : resource.accessMode === 'free'
      ? '当前资源可免费获取'
      : resource.accessMode === 'member'
        ? (membershipActive ? '会员当前可直接获取' : '开通会员后可直接获取')
        : `订购后可解锁完整图纸，当前余额 ${pointsBalance} 积分`;

  const actionLabel = downloadable
    ? '下载图片'
    : owned
      ? '开始制作'
      : resource.accessMode === 'free'
        ? '免费获取'
        : resource.accessMode === 'member'
          ? (membershipActive ? '会员获取' : '会员可得')
          : `${resource.pointsCost} 积分订购`;

  const actionVariant = owned || downloadable ? 'outline' : 'primary';
  const actionDisabled = !owned && resource.accessMode === 'member' && !membershipActive;

  const handlePrimaryAction = async () => {
    if (loading) return;
    if (downloadable) {
      markDownloaded(resource.id);
      Alert.alert('已保存', '当前演示环境已记录图片下载状态。');
      return;
    }

    if (owned) {
      navigation.navigate('Editor', {
        mode: 'manual',
        cols: resource.cols,
        rows: resource.rows,
        initialGrid: resource.gridData,
      });
      return;
    }

    setLoading(true);
    try {
      let ok = false;
      if (resource.accessMode === 'free') ok = unlockFree(resource.id);
      else if (resource.accessMode === 'points') ok = await unlockWithPoints(resource);
      else if (resource.accessMode === 'member') ok = unlockWithMember(resource.id);

      if (!ok) {
        Alert.alert(
          resource.accessMode === 'points' ? '订购失败' : '解锁失败',
          resource.accessMode === 'points'
            ? `当前余额 ${pointsBalance} 积分，无法订购该图纸。`
            : '当前账户无法解锁该资源。',
        );
        return;
      }

      Alert.alert('获取成功', resource.accessMode === 'points' ? '图纸已订购，可继续制作。' : '图纸已解锁，可继续制作。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="资源详情" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={$.content}>
        <View style={[$.previewWrap, { backgroundColor: dark ? 'rgba(255,255,255,0.04)' : colors.surface, borderColor: colors.border }] }>
          <View style={[$.previewInner, { backgroundColor: colors.inputBg }]}>
            <BeadGrid pixels={previewPixels} beadSize={beadSize} gap={1} round glossy />
          </View>
        </View>

        <View style={$.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[$.title, { color: colors.text }]}>{resource.title}</Text>
            <Text style={[$.subtitle, { color: colors.textHint }]}>{resource.author} · {resource.cat}</Text>
          </View>
          {resource.accessMode === 'points' ? (
            <View style={[$.pricePill, { backgroundColor: colors.text }]}>
              <Text style={$.pricePillText}>{resource.pointsCost} 积分</Text>
            </View>
          ) : (
            <View style={[$.typePill, { backgroundColor: resource.accessMode === 'free' ? colors.accentLight : colors.accentLight }]}>
              <Text style={[$.typePillText, { color: resource.accessMode === 'free' ? colors.success : colors.accent }]}>
                {resource.accessMode === 'free' ? '免费' : '会员'}
              </Text>
            </View>
          )}
        </View>

        <SurfaceCard bodyStyle={$.metaCardBody}>
          <Text style={[$.statusText, { color: colors.text }]}>{statusText}</Text>
          <View style={$.metaGrid}>
            <MetaItem label="尺寸" value={`${resource.cols} × ${resource.rows}`} icon="grid" />
            <MetaItem label="下载" value={`${resource.downloads}`} icon="download" />
            <MetaItem label="评分" value={`${resource.rating}`} icon="star" />
            <MetaItem label="发布" value={resource.createdAt} icon="calendar" />
          </View>
        </SurfaceCard>

        <SurfaceCard title="图纸说明" bodyStyle={$.infoBody}>
          <Text style={[$.desc, { color: colors.textSecondary }]}>{resource.desc}</Text>
          <View style={$.hintRow}>
            <Feather name="info" size={fp(14)} color={colors.textHint} />
            <Text style={[$.hintText, { color: colors.textHint }]}>详情页支持预览图纸，获取后可继续制作或下载图片。</Text>
          </View>
        </SurfaceCard>
      </ScrollView>

      <View style={[$.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <View style={$.balanceBlock}>
          <Text style={[$.balanceLabel, { color: colors.textHint }]}>当前积分</Text>
          <Text style={[$.balanceValue, { color: colors.text }]}>{pointsBalance}</Text>
        </View>
        <Button
          title={actionLabel}
          onPress={handlePrimaryAction}
          loading={loading}
          disabled={actionDisabled}
          variant={actionVariant}
          style={$.ctaBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const MetaItem: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => {
  const { colors } = useTheme();
  return (
    <View style={$.metaItem}>
      <Feather name={icon as any} size={fp(14)} color={colors.textHint} />
      <Text style={[$.metaValue, { color: colors.text }]}>{value}</Text>
      <Text style={[$.metaLabel, { color: colors.textHint }]}>{label}</Text>
    </View>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    height: wp(50),
    paddingHorizontal: PAD,
    borderBottomWidth: 1,
    gap: wp(10),
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(16),
    fontWeight: '700',
  },
  navBtn: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: PAD,
  },
  content: {
    padding: PAD,
    paddingBottom: wp(110),
    gap: wp(12),
  },
  previewWrap: {
    borderWidth: 1,
    borderRadius: wp(24),
    padding: wp(18),
  },
  previewInner: {
    minHeight: wp(240),
    borderRadius: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(16),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  title: {
    fontSize: fp(22),
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fp(12),
    marginTop: wp(6),
  },
  pricePill: {
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
  },
  pricePillText: {
    color: '#FFF',
    fontSize: fp(11),
    fontWeight: '700',
  },
  typePill: {
    borderRadius: wp(999),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
  },
  typePillText: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  metaCardBody: {
    gap: wp(12),
  },
  statusText: {
    fontSize: fp(13),
    lineHeight: fp(19),
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  metaItem: {
    width: '47%' as const,
    borderRadius: wp(16),
    paddingHorizontal: wp(12),
    paddingVertical: wp(12),
    backgroundColor: 'rgba(148,163,184,0.08)',
    gap: wp(4),
  },
  metaValue: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  metaLabel: {
    fontSize: fp(11),
  },
  infoBody: {
    gap: wp(12),
  },
  desc: {
    fontSize: fp(13),
    lineHeight: fp(20),
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(8),
  },
  hintText: {
    flex: 1,
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(12),
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    borderTopWidth: 1,
  },
  balanceBlock: {
    minWidth: wp(72),
  },
  balanceLabel: {
    fontSize: fp(11),
  },
  balanceValue: {
    marginTop: wp(3),
    fontSize: fp(18),
    fontWeight: '800',
  },
  ctaBtn: {
    flex: 1,
  },
});
