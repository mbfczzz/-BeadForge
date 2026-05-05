import React, { useEffect, useMemo, useState, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import type { ThemeColors } from '../../theme';
import { AppHeader, BeadGrid, ALL_PATTERNS, Avatar, HoverView, DanmakuOverlay, DanmakuInput } from '../../components/common';
import { useDanmaku } from '../../hooks/useDanmaku';
import { useToast } from '../../hooks/useFeedback';
import { hapticLight, hapticSuccess } from '../../hooks/useFeedback';
import { Toast } from '../../components/common/Toast';
import type { RootScreenProps } from '../../navigation/types';
import { wp, fp, screenW, BOTTOM_SAFE_H } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';
import { likeApi, favoriteApi, followApi } from '../../api/community';
import { danmakuApi, type DanmakuRow } from '../../api/danmaku';
import type { DanmakuItem } from '../../components/common/Danmaku';
import { useAuthStore } from '../../store/useAuthStore';

const PAD = wp(15);
const PREVIEW_H = wp(220);

/* ──────────────── 工具函数 ──────────────── */

function analyzePattern(pixels: string[][]) {
  const colorMap = new Map<string, number>();
  let total = 0;
  for (const row of pixels) {
    for (const c of row) {
      if (c !== 'transparent') {
        colorMap.set(c, (colorMap.get(c) || 0) + 1);
        total++;
      }
    }
  }
  const palette = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([color, count]) => ({ color, count }));
  return { rows: pixels.length, cols: pixels[0]?.length || 0, total, palette };
}

function fmtDate(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

function fmtNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ──────────────── 主屏幕 ──────────────── */

export const DesignDetailScreen: React.FC<RootScreenProps<'DesignDetail'>> = ({ route, navigation }) => {
  const { colors, dark } = useTheme();
  const item = route.params.item;
  // 如果有实际的 designData，优先使用；后端存为 JSON 字符串、本地 mock 为 string[][]，都做兼容
  const pat = useMemo(() => {
    const raw = item.designData;
    if (Array.isArray(raw) && raw.length > 0) return raw as string[][];
    if (typeof raw === 'string' && raw.length > 0) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((row) => Array.isArray(row))) {
          return parsed as string[][];
        }
      } catch { /* 非合法 JSON 静默 fallback */ }
    }
    return ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  }, [item.designData, item.id]);
  const info = useMemo(() => analyzePattern(pat), [pat]);

  const currentUser = useAuthStore((state) => state.user);
  const isOwnDesign = currentUser?.id === item.userId;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const toast = useToast();

  const [danmakuItems, setDanmakuItems] = useState<DanmakuItem[]>([]);
  const danmaku = useDanmaku(danmakuItems, {
    onSend: async (text, color) => {
      await danmakuApi.send(item.id, text, color);
    },
  });

  useEffect(() => {
    let alive = true;
    danmakuApi.list(item.id)
      .then((res) => {
        if (!alive) return;
        const list: DanmakuRow[] = res.data || [];
        setDanmakuItems(list.map((d) => ({ id: d.id, text: d.text, color: d.color })));
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [item.id]);

  const previewW = screenW - PAD * 2 - wp(40);
  const beadSize = Math.floor(previewW / (info.cols || 9)) - 1;

  // 进入页面回填三个互动状态
  useEffect(() => {
    let alive = true;
    likeApi.check('design', item.id)
      .then((res) => { if (alive) setLiked(!!res.data?.liked); })
      .catch(() => undefined);
    favoriteApi.check('design', item.id)
      .then((res) => { if (alive) setBookmarkedFromCheck(res.data?.favorited); })
      .catch(() => undefined);
    function setBookmarkedFromCheck(v: boolean | undefined) { if (alive) setSaved(!!v); }
    if (item.userId && !isOwnDesign && currentUser) {
      followApi.check(item.userId)
        .then((res) => { if (alive) setFollowed(!!res.data); })
        .catch(() => undefined);
    } else {
      setFollowed(false);
    }
    return () => { alive = false; };
  }, [item.id, item.userId, isOwnDesign, currentUser?.id]);

  const toggleLike = async () => {
    if (likeBusy) return;
    if (!currentUser) { toast.show('请先登录'); return; }
    const next = !liked;
    setLiked(next);
    setLikeCount((v) => Math.max(0, v + (next ? 1 : -1)));
    hapticLight();
    setLikeBusy(true);
    try {
      if (next) await likeApi.like('design', item.id);
      else await likeApi.unlike('design', item.id);
      if (next) toast.show('已点赞');
    } catch {
      setLiked(!next);
      setLikeCount((v) => Math.max(0, v + (next ? -1 : 1)));
      toast.show('操作失败');
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleSave = async () => {
    if (saveBusy) return;
    if (!currentUser) { toast.show('请先登录'); return; }
    const next = !saved;
    setSaved(next);
    hapticLight();
    setSaveBusy(true);
    try {
      if (next) await favoriteApi.add('design', item.id);
      else await favoriteApi.remove('design', item.id);
      toast.show(next ? '已收藏' : '已取消收藏');
    } catch {
      setSaved(!next);
      toast.show('操作失败');
    } finally {
      setSaveBusy(false);
    }
  };

  const toggleFollow = async () => {
    if (followBusy) return;
    if (!currentUser) { toast.show('请先登录'); return; }
    if (!item.userId) { toast.show('作者信息缺失'); return; }
    if (isOwnDesign) { toast.show('不能关注自己'); return; }
    const next = !followed;
    setFollowed(next);
    hapticSuccess();
    setFollowBusy(true);
    try {
      if (next) await followApi.follow(item.userId);
      else await followApi.unfollow(item.userId);
      toast.show(next ? '已关注' : '已取消关注');
    } catch {
      setFollowed(!next);
      toast.show('操作失败');
    } finally {
      setFollowBusy(false);
    }
  };

  const doShare = () => { hapticLight(); toast.show('链接已复制'); };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader
        title="作品详情"
        onBack={() => navigation.goBack()}
        right={
          <HoverView onPress={() => setShowMore(!showMore)} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
            <Feather name="more-horizontal" size={fp(18)} color={colors.text} />
          </HoverView>
        }
      />

      {/* 更多菜单 */}
      {showMore && (
        <View style={[$.moreMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { icon: 'download', label: '保存图片' },
            { icon: 'flag', label: '举报' },
            { icon: 'copy', label: '复制链接' },
          ].map((m) => (
            <HoverView key={m.label} onPress={() => setShowMore(false)} style={$.moreItem} hoverScale={1.02} hoverLift={0}>
              <Feather name={m.icon as any} size={fp(14)} color={colors.textSecondary} />
              <Text style={[$.moreLabel, { color: colors.text }]}>{m.label}</Text>
            </HoverView>
          ))}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(100) }}>
        {/* 作品预览 + 弹幕 */}
        <View style={[$.previewWrap, { backgroundColor: dark ? '#2a2a2a' : '#fafafa', minHeight: PREVIEW_H }]}>
          <BeadGrid pixels={pat} beadSize={Math.min(beadSize, wp(22))} gap={wp(1.5)} round glossy />
          <DanmakuOverlay visible={danmaku.visible} data={danmaku.list} height={PREVIEW_H} />
          <DanmakuControls
            danmakuOn={danmaku.visible}
            onToggle={danmaku.toggle}
            onEdit={danmaku.toggleInput}
            accentColor={colors.accent}
          />
        </View>

        {/* 弹幕输入栏 */}
        {danmaku.showInput && (
          <View style={$.danmakuInputWrap}>
            <DanmakuInput
              value={danmaku.inputText}
              onChangeText={danmaku.setInputText}
              onSend={danmaku.send}
              colors={colors}
            />
          </View>
        )}

        {/* 标题与描述 */}
        <View style={$.section}>
          <Text style={[$.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          {item.description ? (
            <Text style={[$.desc, { color: colors.textSecondary }]} numberOfLines={3}>{item.description}</Text>
          ) : null}
        </View>

        {/* 作者信息 */}
        <View style={[$.authorRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Avatar name={item.authorName} size={wp(38)} />
          <View style={{ flex: 1, marginLeft: wp(10) }}>
            <Text style={[$.authorName, { color: colors.text }]}>{item.authorName || '创作者'}</Text>
            <Text style={[$.authorSub, { color: colors.textHint }]}>拼豆创作者</Text>
          </View>
          {isOwnDesign ? null : (
            <HoverView
              onPress={toggleFollow}
              style={[$.followBtn, { backgroundColor: followed ? colors.inputBg : colors.accent, opacity: followBusy ? 0.6 : 1 }]}
              hoverScale={1.05}
              hoverLift={1}
            >
              <Text style={[$.followText, followed && { color: colors.textSecondary }]}>{followed ? '已关注' : '关注'}</Text>
            </HoverView>
          )}
        </View>

        {/* 数据统计 */}
        <View style={[$.statsRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <StatItem icon="heart" label="点赞" value={fmtNum(likeCount)} colors={colors} />
          <View style={[$.statDivider, { backgroundColor: colors.divider }]} />
          <StatItem icon="eye" label="浏览" value={fmtNum(item.viewCount)} colors={colors} />
          <View style={[$.statDivider, { backgroundColor: colors.divider }]} />
          <StatItem icon="calendar" label="发布" value={fmtDate(item.createdAt)} colors={colors} />
        </View>

        {/* 作品信息 */}
        <View style={$.section}>
          <Text style={[$.secTitle, { color: colors.text }]}>作品信息</Text>
          <View style={[$.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <InfoRow label="分类" value={item.category} icon="tag" colors={colors} />
            <View style={[$.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow label="尺寸" value={`${info.cols} × ${info.rows} 格`} icon="grid" colors={colors} />
            <View style={[$.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow label="珠子总数" value={`${info.total} 颗`} icon="circle" colors={colors} />
            <View style={[$.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow label="颜色数" value={`${info.palette.length} 种`} icon="droplet" colors={colors} />
            <View style={[$.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow label="状态" value={item.status === 'PUBLISHED' ? '已发布' : item.status} icon="check-circle" colors={colors} />
          </View>
        </View>

        {/* 配色方案 */}
        <View style={$.section}>
          <Text style={[$.secTitle, { color: colors.text }]}>配色方案</Text>
          <View style={[$.paletteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {info.palette.map(({ color, count }) => (
              <View key={color} style={$.paletteItem}>
                <View style={[$.colorDot, { backgroundColor: color }]} />
                <Text style={[$.colorHex, { color: colors.textSecondary }]}>{color.toUpperCase()}</Text>
                <Text style={[$.colorCount, { color: colors.textHint }]}>{count} 颗</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 制作提示 */}
        <View style={$.section}>
          <Text style={[$.secTitle, { color: colors.text }]}>制作提示</Text>
          <View style={[$.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TipRow icon="layout" text={`准备一块 ${info.cols}×${info.rows} 或更大的拼豆板`} colors={colors} />
            <TipRow icon="shopping-bag" text={`共需 ${info.total} 颗珠子，${info.palette.length} 种颜色`} colors={colors} />
            <TipRow icon="thermometer" text="完成后用烫纸覆盖，中温熨烫至珠子融合" colors={colors} />
            <TipRow icon="alert-circle" text="熨烫时注意均匀用力，避免局部过热变形" colors={colors} />
          </View>
        </View>

        {/* 跨模块入口 */}
        <View style={$.section}>
          <View style={[$.crossCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable style={$.crossRow} onPress={() => navigation.navigate('Main' as any, { screen: 'Publish' } as any)}>
              <Feather name="message-circle" size={fp(16)} color={colors.accent} />
              <Text style={[$.crossText, { color: colors.text }]}>查看社区讨论</Text>
              <Text style={[$.crossHint, { color: colors.textHint }]}>看看大家怎么做的</Text>
              <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
            </Pressable>
            <View style={[$.crossDivider, { backgroundColor: colors.divider }]} />
            <Pressable style={$.crossRow} onPress={() => navigation.navigate('Main' as any, { screen: 'Market' } as any)}>
              <Feather name="shopping-bag" size={fp(16)} color="#F5A623" />
              <Text style={[$.crossText, { color: colors.text }]}>购买材料</Text>
              <Text style={[$.crossHint, { color: colors.textHint }]}>珠子、拼豆板、工具</Text>
              <Feather name="chevron-right" size={fp(14)} color={colors.textHint} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={[$.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <ActionBtn
          icon="heart" label={fmtNum(likeCount)}
          active={liked} activeColor="#EF4444" colors={colors}
          onPress={toggleLike}
        />
        <ActionBtn
          icon="bookmark" label={saved ? '已收藏' : '收藏'}
          active={saved} activeColor={colors.accent} colors={colors}
          onPress={toggleSave}
        />
        <ActionBtn icon="share-2" label="分享" colors={colors} onPress={doShare} />
        <View style={{ flex: 1 }} />
        <HoverView
          onPress={() => navigation.navigate('Editor', {
            mode: 'manual', cols: info.cols, rows: info.rows, initialGrid: pat,
            // 自己作品才透传 designId 让后续保存走 update；他人作品保持新建语义
            designId: isOwnDesign ? item.id : undefined,
          })}
          style={[$.makeBtn, { backgroundColor: colors.accent }]}
          hoverScale={1.03} hoverLift={2}
        >
          <Feather name="play" size={fp(14)} color="#fff" />
          <Text style={$.makeBtnText}>开始制作</Text>
        </HoverView>
      </View>
      <Toast message={toast.msg} />
    </SafeAreaView>
  );
};

/* ──────────────── 弹幕控制条 ──────────────── */

const DanmakuControls: React.FC<{
  danmakuOn: boolean;
  onToggle: () => void;
  onEdit: () => void;
  accentColor: string;
}> = memo(({ danmakuOn, onToggle, onEdit, accentColor }) => (
  <View style={$.danmakuBar}>
    <HoverView
      onPress={onToggle}
      style={[$.danmakuCtrlBtn, { backgroundColor: danmakuOn ? accentColor : 'rgba(0,0,0,0.35)' }]}
      hoverScale={1.08} hoverLift={0}
    >
      <Text style={$.danmakuToggleText}>弹</Text>
    </HoverView>
    <HoverView
      onPress={onEdit}
      style={[$.danmakuCtrlBtn, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
      hoverScale={1.08} hoverLift={0}
    >
      <Feather name="edit-3" size={fp(12)} color="#fff" />
    </HoverView>
  </View>
));

/* ──────────────── 子组件 ──────────────── */

const StatItem: React.FC<{ icon: string; label: string; value: string; colors: ThemeColors }> = ({ icon, label, value, colors }) => (
  <View style={$.statItem}>
    <Feather name={icon as any} size={fp(15)} color={colors.textHint} />
    <Text style={[$.statVal, { color: colors.text }]}>{value}</Text>
    <Text style={[$.statLabel, { color: colors.textHint }]}>{label}</Text>
  </View>
);

const InfoRow: React.FC<{ label: string; value: string; icon: string; colors: ThemeColors }> = ({ label, value, icon, colors }) => (
  <View style={$.infoRow}>
    <Feather name={icon as any} size={fp(13)} color={colors.textHint} style={{ marginRight: wp(8) }} />
    <Text style={[$.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[$.infoValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const TipRow: React.FC<{ icon: string; text: string; colors: ThemeColors }> = ({ icon, text, colors }) => (
  <View style={$.tipRow}>
    <Feather name={icon as any} size={fp(13)} color={colors.accent} style={{ marginRight: wp(8), marginTop: wp(1) }} />
    <Text style={[$.tipText, { color: colors.textSecondary }]}>{text}</Text>
  </View>
);

const ActionBtn: React.FC<{
  icon: string; label: string; active?: boolean; activeColor?: string;
  colors: ThemeColors; onPress?: () => void;
}> = ({ icon, label, active, activeColor, colors, onPress }) => {
  const [hovered, setHovered] = useState(false);
  const color = active ? activeColor : colors.textSecondary;
  return (
    <Pressable
      onPress={onPress}
      // @ts-ignore: RN Web hover events
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }: { pressed: boolean }) => [
        $.actionBtn,
        (hovered || pressed) && { opacity: 0.6 },
        pressed && { transform: [{ scale: 0.9 }] },
        Platform.OS === 'web' && { transitionDuration: '0.15s' } as any,
      ]}
    >
      <Feather name={icon as any} size={fp(18)} color={color} />
      <Text style={[$.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
};

/* ──────────────── 样式 ──────────────── */

const $ = StyleSheet.create({
  root: { flex: 1 },

  // 导航
  nav: {
    flexDirection: 'row', alignItems: 'center',
    height: wp(50), paddingHorizontal: PAD,
    borderBottomWidth: 1, gap: wp(10),
  },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '600' },
  navBtn: {
    width: wp(34), height: wp(34), borderRadius: wp(17),
    justifyContent: 'center', alignItems: 'center',
  },

  // 更多菜单
  moreMenu: {
    position: 'absolute', top: wp(52), right: PAD,
    borderRadius: BorderRadius.md, borderWidth: 1,
    paddingVertical: wp(4), zIndex: 50, minWidth: wp(130),
    ...shadow(4, 12, 0.12, '#000', 6),
  },
  moreItem: {
    flexDirection: 'row', alignItems: 'center', gap: wp(10),
    paddingHorizontal: wp(14), paddingVertical: wp(10),
  },
  moreLabel: { fontSize: FontSize.sm },

  // 预览
  previewWrap: {
    marginHorizontal: PAD, marginTop: wp(15),
    borderRadius: BorderRadius.lg,
    paddingVertical: wp(25),
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...shadow(2, 8, 0.06, '#000', 2),
  },

  // 弹幕控制
  danmakuBar: {
    position: 'absolute', bottom: wp(8), right: wp(8),
    flexDirection: 'row', gap: wp(6),
  },
  danmakuCtrlBtn: {
    width: wp(28), height: wp(28), borderRadius: wp(6),
    justifyContent: 'center', alignItems: 'center',
  },
  danmakuToggleText: {
    color: '#fff', fontSize: fp(12), fontWeight: '700',
  },
  danmakuInputWrap: {
    marginHorizontal: PAD, marginTop: wp(10),
  },

  // 标题
  section: { paddingHorizontal: PAD, marginTop: wp(18) },
  title: { fontSize: fp(22), fontWeight: '700', letterSpacing: -0.3 },
  desc: { fontSize: FontSize.md, lineHeight: fp(21), marginTop: wp(8) },

  // 作者
  authorRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginTop: wp(15),
    padding: wp(12), borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  authorName: { fontSize: FontSize.lg, fontWeight: '600' },
  authorSub: { fontSize: FontSize.xs, marginTop: wp(2) },
  followBtn: {
    paddingHorizontal: wp(16), paddingVertical: wp(7),
    borderRadius: BorderRadius.full,
  },
  followText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600' },

  // 统计
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginTop: wp(12),
    padding: wp(14), borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: wp(4) },
  statVal: { fontSize: FontSize.lg, fontWeight: '700' },
  statLabel: { fontSize: FontSize.xs },
  statDivider: { width: 1, height: wp(30) },

  // 作品信息
  secTitle: { fontSize: FontSize.xl, fontWeight: '700', marginBottom: wp(10) },
  infoCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1,
    paddingHorizontal: wp(14), overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: wp(12),
  },
  infoLabel: { fontSize: FontSize.md, width: wp(75) },
  infoValue: { flex: 1, fontSize: FontSize.md, fontWeight: '500', textAlign: 'right' },
  infoDivider: { height: 1 },

  // 配色
  paletteCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1,
    padding: wp(14), gap: wp(10),
  },
  paletteItem: {
    flexDirection: 'row', alignItems: 'center',
  },
  colorDot: {
    width: wp(20), height: wp(20), borderRadius: wp(4),
    ...shadow(0, 1, 0.1, '#000', 1),
  },
  colorHex: { fontSize: FontSize.sm, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', marginLeft: wp(10), width: wp(80) },
  colorCount: { fontSize: FontSize.sm, flex: 1, textAlign: 'right' },

  // 提示
  tipCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1,
    padding: wp(14), gap: wp(12),
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  tipText: { flex: 1, fontSize: FontSize.md, lineHeight: fp(20) },

  // 跨模块入口
  crossCard: {
    borderRadius: BorderRadius.lg, borderWidth: 1, overflow: 'hidden',
  },
  crossRow: {
    flexDirection: 'row', alignItems: 'center', gap: wp(10),
    paddingHorizontal: wp(14), paddingVertical: wp(13),
  },
  crossText: { fontSize: FontSize.md, fontWeight: '500' },
  crossHint: { flex: 1, fontSize: FontSize.xs, textAlign: 'right' },
  crossDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: wp(14) },

  // 底部栏
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(10)),
    borderTopWidth: 1,
    gap: wp(4),
  },
  actionBtn: { alignItems: 'center', paddingHorizontal: wp(10), gap: wp(3) },
  actionLabel: { fontSize: fp(10), fontWeight: '500' },

  makeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wp(20), paddingVertical: wp(10),
    borderRadius: BorderRadius.full, gap: wp(6),
    ...shadow(2, 6, 0.15, '#4b78ff', 3),
  },
  makeBtnText: { color: '#fff', fontSize: FontSize.md, fontWeight: '600' },
});
