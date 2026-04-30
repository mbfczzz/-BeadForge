import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Image, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { fp, wp } from '../../utils/responsive';
import type { FeedMockMedia } from '../../utils/feedMedia';
import { BeadGrid } from '../common';

interface GridStats {
  cols: number;
  rows: number;
  beadCount: number;
  colorCount: number;
}

function calcGridStats(grid: string[][]): GridStats {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  let beadCount = 0;
  const colorSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell && cell !== 'transparent') {
        beadCount++;
        colorSet.add(cell);
      }
    }
  }
  return { cols, rows, beadCount, colorCount: colorSet.size };
}

export const FeedMediaViewer: React.FC<{
  visible: boolean;
  gallery: FeedMockMedia[];
  initialIndex: number;
  onClose: () => void;
}> = ({ visible, gallery, initialIndex, onClose }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [chromeVisible, setChromeVisible] = useState(true);
  const chromeAnim = useMemo(() => new Animated.Value(1), []);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      setChromeVisible(true);
      chromeAnim.setValue(1);
    }
  }, [initialIndex, visible, chromeAnim]);

  if (!visible) {
    return null;
  }

  const safeTop = insets.top || (Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44);
  const headerVPad = wp(8);
  const btnSize = wp(40);
  const headerHeight = safeTop + headerVPad * 2 + btnSize;
  const footerSpace = wp(80) + insets.bottom;

  const toggleChrome = () => {
    const next = !chromeVisible;
    setChromeVisible(next);
    Animated.timing(chromeAnim, {
      toValue: next ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const activeStats: GridStats | null = (() => {
    const item = gallery[Math.min(activeIndex, gallery.length - 1)];
    if (!item?.beadGrid || item.beadGrid.length === 0) return null;
    return calcGridStats(item.beadGrid);
  })();

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        {/* 渐变背景 — 比纯黑柔和，中间略亮把焦点引到作品上 */}
        <LinearGradient
          colors={['#1A1A24', '#000000']}
          locations={[0, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 中央内容区：包了 Pressable 监听 tap → 切换 chrome */}
        <Pressable style={{ flex: 1 }} onPress={toggleChrome} android_disableSound>
          <ScrollView
            key={`viewer-${initialIndex}`}
            style={{ flex: 1 }}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: initialIndex * width, y: 0 }}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveIndex(Math.max(0, Math.min(gallery.length - 1, nextIndex)));
            }}
          >
            {gallery.map((item, index) => {
              const imageW = width;
              const imageH = Math.max(200, height - headerHeight - footerSpace);
              return (
                <View key={`viewer-item-${index}`} style={[styles.viewerPage, { width, height: imageH, marginTop: headerHeight }]}>
                  {item.uri ? (
                    <Image source={{ uri: item.uri }} style={{ width: imageW, height: imageH }} resizeMode="contain" />
                  ) : item.beadGrid && item.beadGrid.length > 0 ? (
                    (() => {
                      const cols = Math.max(item.beadGrid[0]?.length || 1, 1);
                      const rows = Math.max(item.beadGrid.length, 1);
                      const padding = wp(24);
                      const innerW = imageW - padding * 2 - wp(20);
                      const innerH = imageH - padding * 2 - wp(20);
                      const beadSize = Math.max(4, Math.min(
                        Math.floor(innerW / cols) - 1,
                        Math.floor(innerH / rows) - 1,
                      ));
                      const gridW = cols * beadSize + (cols - 1);
                      const gridH = rows * beadSize + (rows - 1);
                      return (
                        <View style={[styles.cardShadow, {
                          width: gridW + padding,
                          height: gridH + padding,
                        }]}>
                          <View style={styles.cardInner}>
                            <BeadGrid pixels={item.beadGrid} beadSize={beadSize} gap={1} round glossy />
                          </View>
                        </View>
                      );
                    })()
                  ) : item.svg ? (
                    <SvgXml xml={item.svg} width={imageW} height={imageH} />
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </Pressable>

        {/* 顶部 chrome —— 绝对定位浮在内容上，但渲染顺序在 Pressable 之后，所以始终能接收点击 */}
        <Animated.View
          pointerEvents={chromeVisible ? 'box-none' : 'none'}
          style={[
            styles.headerWrap,
            {
              opacity: chromeAnim,
              transform: [{
                translateY: chromeAnim.interpolate({ inputRange: [0, 1], outputRange: [-headerHeight, 0] }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'transparent']}
            style={[StyleSheet.absoluteFill, { height: headerHeight + wp(20) }]}
            pointerEvents="none"
          />
          <View style={[styles.header, { paddingTop: safeTop + headerVPad, paddingBottom: headerVPad }]}>
            <Pressable
              onPress={onClose}
              hitSlop={20}
              android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true, radius: btnSize / 2 + 4 }}
              style={({ pressed }) => [styles.closeBtn, { opacity: pressed ? 0.6 : 1 }]}
            >
              <MCI name="close" size={fp(22)} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.viewerCount}>{activeIndex + 1} / {gallery.length}</Text>
            <View style={styles.closeBtn} />
          </View>
        </Animated.View>

        {/* 底部 chrome：拼豆作品时显示统计；多图时显示分页指示 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.footerWrap,
            {
              paddingBottom: insets.bottom + wp(16),
              opacity: chromeAnim,
              transform: [{
                translateY: chromeAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }),
              }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={[StyleSheet.absoluteFill]}
            pointerEvents="none"
          />

          {gallery.length > 1 ? (
            <View style={styles.viewerDots}>
              {gallery.map((_, index) => (
                <View
                  key={`viewer-dot-${index}`}
                  style={[
                    styles.viewerDot,
                    {
                      width: index === activeIndex ? wp(18) : wp(6),
                      backgroundColor: index === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {activeStats ? (
            <View style={styles.statsRow}>
              <StatChip icon="grid" label={`${activeStats.cols}×${activeStats.rows}`} />
              <StatChip icon="circle" label={`${activeStats.beadCount} 颗豆`} />
              <StatChip icon="palette" label={`${activeStats.colorCount} 色`} />
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
};

const StatChip: React.FC<{ icon: keyof typeof MCI.glyphMap; label: string }> = ({ icon, label }) => (
  <View style={styles.statChip}>
    <MCI name={icon} size={fp(11)} color="rgba(255,255,255,0.85)" />
    <Text style={styles.statText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(14),
  },
  closeBtn: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: fp(13),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  viewerPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardShadow: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 18,
  },
  cardInner: {
    padding: wp(10),
    borderRadius: wp(10),
    overflow: 'hidden',
  },
  footerWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: wp(20),
    alignItems: 'center',
    zIndex: 10,
  },
  viewerDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(6),
    marginBottom: wp(12),
  },
  viewerDot: {
    height: wp(6),
    borderRadius: wp(999),
  },
  statsRow: {
    flexDirection: 'row',
    gap: wp(8),
    paddingHorizontal: wp(14),
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(4),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  statText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: fp(11),
    fontWeight: '600',
  },
});
