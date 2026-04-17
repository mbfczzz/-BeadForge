import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { SearchField } from 'heroui-native/search-field';
import { StateView, PressableScale, CardSkeleton, HoverView } from '../../components/common';
import { BeadGrid, ALL_PATTERNS } from '../../components/common/BeadGrid';
import { useDesignStore } from '../../store/useDesignStore';
import { BorderRadius, FontSize, useTheme } from '../../theme';
import type { DesignItem } from '../../api/design';
import { HOME_CATEGORY_KEYS } from '../../mock/app';
import { BOTTOM_SAFE_H, fp, wp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

const GAP = wp(10);
const PAD = wp(15);
const TAB_H = wp(60) + BOTTOM_SAFE_H;

const CAROUSEL_AUTOPLAY_MS = 5000;
const CAROUSEL_VELOCITY_THRESHOLD = 0.18;
const TAG_GAP = wp(8);
const TAG_EDGE_RESISTANCE = 0.34;
const TAG_MOMENTUM_FACTOR = wp(96);
const MAX_CONTENT_WIDTH = 980;
const MAX_CAROUSEL_WIDTH = 760;

const BG_L = ['#fef2f2', '#fef9ee', '#eef6ff', '#f0fdf4', '#fdf2f8', '#fffbeb', '#eef2ff', '#fff7ed'];
const BG_D = ['#352020', '#352a18', '#1a2535', '#1a2a1c', '#351a30', '#35300a', '#1a1a35', '#352518'];

const DISPLAY_CATEGORIES = ['全部', '动物', '卡通', '花卉', '美食', '风景', '抽象', '像素', '节日', '手办', '建筑', '游戏', '国风'];
const DISPLAY_SORT_OPTIONS = [
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热度' },
  { key: 'popular', label: '点赞' },
  { key: 'views', label: '浏览' },
];
const DISPLAY_BANNERS = [
  { id: 1, title: '热门精选', sub: '近期收藏与浏览都很高的图案', pi: 0, bg: '#4B78FF', sort: 'hot', cat: '' },
  { id: 2, title: '动物主题', sub: '适合挂件和卡片的小尺寸作品', pi: 1, bg: '#D6B161', sort: 'popular', cat: 'animal' },
  { id: 3, title: '像素经典', sub: '复古游戏与像素角色的灵感合集', pi: 2, bg: '#549DA5', sort: 'popular', cat: 'pixel' },
  { id: 4, title: '花束系列', sub: '适合作为节日和礼物场景的花卉图纸', pi: 3, bg: '#BF60FE', sort: 'latest', cat: 'flower' },
];
const HOME_DISPLAY_OVERRIDES: Record<number, Partial<DesignItem>> = {
  101: { authorName: '测试用户', title: '奶茶杯垫', description: '16x16 入门杯垫，适合练习配色和收边。' },
  102: { authorName: '测试用户', title: '像素花束卡片', description: '适合节日贺卡封面的花束图案。' },
  103: { authorName: '测试用户', title: '云朵钥匙挂件', description: '轻量的小图案，适合做挂件和包饰。' },
  104: { authorName: '测试用户', title: '草莓贴片', description: '迷你规格的小贴片，适合新手快速完成。' },
  105: { authorName: '木木手作', title: '橘猫头像', description: '适合做冰箱贴和书签装饰的小图。' },
  106: { authorName: '像素研究所', title: '复古蘑菇', description: '经典像素风图案，适合做挂件。' },
  107: { authorName: '清晨花园', title: '郁金香书签', description: '竖版书签图案，适合作为礼物。' },
  108: { authorName: '小景观工作室', title: '山谷日出', description: '风景向拼豆挂画的小尺寸版本。' },
  109: { authorName: '国风像素社', title: '祥云纹样', description: '适合胸针和装饰牌的小型图案。' },
  110: { authorName: '节日工坊', title: '节庆灯笼', description: '节日主题的小尺寸作品。' },
  111: { authorName: '玩具盒子', title: '机器人手办', description: '适合摆件底座装饰的像素图案。' },
  112: { authorName: '建筑线稿', title: '拱门街景', description: '建筑主题拼豆卡片图案。' },
};

export const HomeScreen: React.FC = () => {
  const { colors, dark } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const {
    designs,
    loading,
    refreshing,
    error,
    hasMore,
    category,
    searchKeyword,
    setFilter,
    setSearchKeyword,
    fetchDesigns,
  } = useDesignStore();

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const catScrollX = useRef(new Animated.Value(0)).current;
  const bannerPhysicalIndex = useRef(DISPLAY_BANNERS.length > 1 ? 1 : 0);
  const bannerDragStartX = useRef(0);
  const catDragStartX = useRef(0);
  const catCurrentX = useRef(0);
  const tagWidthsRef = useRef<Record<number, number>>({});
  const bannerAutoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animateToBannerRef = useRef<(physicalIndex: number) => void>(() => undefined);

  const [showTop, setShowTop] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [catViewportWidth, setCatViewportWidth] = useState(0);
  const [tagLayoutVersion, setTagLayoutVersion] = useState(0);

  const activeCat = HOME_CATEGORY_KEYS.indexOf(category || '');
  const searchActive = searchFocused || searchKeyword.length > 0;
  const isTabletWidth = windowWidth >= 768;
  const contentWidth = Math.max(0, Math.min(windowWidth - PAD * 2, isTabletWidth ? MAX_CONTENT_WIDTH : windowWidth - PAD * 2));
  const carouselViewportWidth = Math.min(contentWidth, isTabletWidth ? MAX_CAROUSEL_WIDTH : contentWidth);
  const carouselGap = isTabletWidth ? 16 : wp(12);
  const carouselReveal = isTabletWidth ? Math.min(120, carouselViewportWidth * 0.18) : wp(54);
  const carouselItemWidth = Math.max(0, carouselViewportWidth - carouselReveal);
  const carouselSnap = carouselItemWidth + carouselGap;
  const carouselEdgePad = Math.max(0, carouselReveal / 2 - carouselGap / 2);
  const carouselDragThreshold = carouselSnap * 0.32;
  const bannerHeight = Math.min(isTabletWidth ? 220 : 166, Math.max(isTabletWidth ? 176 : 142, carouselItemWidth * (isTabletWidth ? 0.36 : 0.44)));
  const columnCount = windowWidth >= 1180 ? 4 : windowWidth >= 720 ? 3 : windowWidth >= 480 ? 3 : 2;
  const gridGap = isTabletWidth ? 16 : GAP;
  const cardWidth = Math.max(0, (contentWidth - gridGap * (columnCount - 1)) / columnCount);
  const tagContentInset = isTabletWidth ? 2 : PAD;
  const searchWidth = contentWidth;
  const bannerLoopData = useMemo(() => {
    if (DISPLAY_BANNERS.length <= 1) return DISPLAY_BANNERS;
    return [DISPLAY_BANNERS[DISPLAY_BANNERS.length - 1], ...DISPLAY_BANNERS, DISPLAY_BANNERS[0]];
  }, []);
  const bannerMaxOffset = useMemo(() => Math.max(0, (bannerLoopData.length - 1) * carouselSnap), [bannerLoopData.length, carouselSnap]);
  const catMaxOffset = useMemo(() => {
    const totalItemWidth = DISPLAY_CATEGORIES.reduce((sum, _, index) => sum + (tagWidthsRef.current[index] || 0), 0);
    const totalGapWidth = TAG_GAP * Math.max(0, DISPLAY_CATEGORIES.length - 1);
    const totalTrackWidth = totalItemWidth + totalGapWidth + tagContentInset * 2;
    return Math.max(0, totalTrackWidth - catViewportWidth);
  }, [catViewportWidth, tagContentInset, tagLayoutVersion]);

  useEffect(() => {
    void fetchDesigns(true);
  }, [fetchDesigns]);

  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: showTop ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [fabAnim, showTop]);

  const animateSearch = useCallback((toValue: number) => {
    Animated.spring(searchAnim, {
      toValue,
      tension: 180,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [searchAnim]);

  const onRefresh = useCallback(() => {
    void fetchDesigns(true);
  }, [fetchDesigns]);

  const onPageScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowTop(event.nativeEvent.contentOffset.y > 300);
    const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 200 && hasMore && !loading) {
      void fetchDesigns(false);
    }
  }, [fetchDesigns, hasMore, loading]);

  const handleSearch = useCallback((text: string) => {
    setSearchKeyword(text);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void fetchDesigns(true);
    }, 300);
  }, [fetchDesigns, setSearchKeyword]);

  const stopBannerAutoplay = useCallback(() => {
    if (bannerAutoplayTimer.current) {
      clearTimeout(bannerAutoplayTimer.current);
      bannerAutoplayTimer.current = null;
    }
  }, []);

  const scrollToBanner = useCallback((physicalIndex: number, animated: boolean) => {
    const nextIndex = Math.max(0, Math.min(physicalIndex, bannerLoopData.length - 1));
    bannerPhysicalIndex.current = nextIndex;
    bannerScrollX.stopAnimation();
    const toValue = nextIndex * carouselSnap;

    if (animated) {
      Animated.spring(bannerScrollX, {
        toValue,
        tension: 110,
        friction: 16,
        useNativeDriver: true,
      }).start();
      return;
    }

    bannerScrollX.setValue(toValue);
  }, [bannerLoopData.length, bannerScrollX, carouselSnap]);

  const restartBannerAutoplay = useCallback(() => {
    if (DISPLAY_BANNERS.length <= 1) return;
    stopBannerAutoplay();
    bannerAutoplayTimer.current = setTimeout(() => {
      animateToBannerRef.current(bannerPhysicalIndex.current + 1);
    }, CAROUSEL_AUTOPLAY_MS);
  }, [stopBannerAutoplay]);

  const normalizeBannerIndex = useCallback((physicalIndex: number) => {
    if (DISPLAY_BANNERS.length <= 1) {
      bannerPhysicalIndex.current = 0;
      return;
    }

    if (physicalIndex <= 0) {
      scrollToBanner(DISPLAY_BANNERS.length, false);
      return;
    }

    if (physicalIndex >= bannerLoopData.length - 1) {
      scrollToBanner(1, false);
      return;
    }

    bannerPhysicalIndex.current = physicalIndex;
  }, [bannerLoopData.length, scrollToBanner]);

  const animateToBanner = useCallback((physicalIndex: number) => {
    if (DISPLAY_BANNERS.length <= 1) return;

    const nextIndex = Math.max(0, Math.min(physicalIndex, bannerLoopData.length - 1));
    stopBannerAutoplay();
    bannerPhysicalIndex.current = nextIndex;
    bannerScrollX.stopAnimation();
    Animated.spring(bannerScrollX, {
      toValue: nextIndex * carouselSnap,
      tension: 110,
      friction: 16,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      normalizeBannerIndex(nextIndex);
      restartBannerAutoplay();
    });
  }, [bannerLoopData.length, bannerScrollX, carouselSnap, normalizeBannerIndex, restartBannerAutoplay, stopBannerAutoplay]);

  const snapBannerFromRelease = useCallback((deltaX: number, velocityX = 0) => {
    if (DISPLAY_BANNERS.length <= 1) return;

    const baseIndex = Math.round(bannerDragStartX.current / carouselSnap);
    const offsetVelocity = -velocityX;
    const moveByVelocity = Math.abs(offsetVelocity) >= CAROUSEL_VELOCITY_THRESHOLD ? (offsetVelocity > 0 ? 1 : -1) : 0;
    const moveByDistance = Math.abs(deltaX) >= carouselDragThreshold ? (deltaX > 0 ? 1 : -1) : 0;
    const nextIndex = baseIndex + (moveByVelocity || moveByDistance || 0);

    animateToBanner(nextIndex);
  }, [animateToBanner, carouselDragThreshold, carouselSnap]);

  useEffect(() => {
    animateToBannerRef.current = animateToBanner;
  }, [animateToBanner]);

  const animateTagTo = useCallback((toValue: number) => {
    catScrollX.stopAnimation();
    Animated.spring(catScrollX, {
      toValue: Math.max(0, Math.min(toValue, catMaxOffset)),
      tension: 120,
      friction: 18,
      useNativeDriver: true,
    }).start();
  }, [catMaxOffset, catScrollX]);

  const handleTagViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setCatViewportWidth(event.nativeEvent.layout.width);
  }, []);

  const handleTagItemLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (tagWidthsRef.current[index] === nextWidth) return;

    tagWidthsRef.current[index] = nextWidth;
    setTagLayoutVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    catScrollX.stopAnimation((value) => {
      if (value < 0) {
        catScrollX.setValue(0);
        return;
      }

      if (value > catMaxOffset) {
        catScrollX.setValue(catMaxOffset);
      }
    });
  }, [catMaxOffset, catScrollX]);

  useEffect(() => {
    const listenerId = catScrollX.addListener(({ value }) => {
      catCurrentX.current = value;
    });

    return () => {
      catScrollX.removeListener(listenerId);
    };
  }, [catScrollX]);

  const bannerPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => (
      Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
    ),
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      stopBannerAutoplay();
      bannerScrollX.stopAnimation((value) => {
        bannerDragStartX.current = value;
      });
    },
    onPanResponderMove: (_, gestureState) => {
      const nextOffset = Math.max(
        0,
        Math.min(bannerMaxOffset, bannerDragStartX.current - gestureState.dx),
      );
      bannerScrollX.setValue(nextOffset);
    },
    onPanResponderRelease: (_, gestureState) => {
      bannerScrollX.stopAnimation((value) => {
        const deltaOffset = value - bannerDragStartX.current;
        snapBannerFromRelease(deltaOffset, gestureState.vx);
      });
    },
    onPanResponderTerminate: (_, gestureState) => {
      bannerScrollX.stopAnimation((value) => {
        const deltaOffset = value - bannerDragStartX.current;
        snapBannerFromRelease(deltaOffset, gestureState.vx);
      });
    },
  }), [bannerMaxOffset, bannerScrollX, snapBannerFromRelease, stopBannerAutoplay]);

  const tagPanResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => (
      catMaxOffset > 0 &&
      Math.abs(gestureState.dx) > 6 &&
      Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
    ),
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      catDragStartX.current = catCurrentX.current;
      catScrollX.stopAnimation((value) => {
        catCurrentX.current = value;
        catDragStartX.current = value;
      });
    },
    onPanResponderMove: (_, gestureState) => {
      const rawOffset = catDragStartX.current - gestureState.dx;

      if (rawOffset < 0) {
        catScrollX.setValue(rawOffset * TAG_EDGE_RESISTANCE);
        return;
      }

      if (rawOffset > catMaxOffset) {
        catScrollX.setValue(catMaxOffset + (rawOffset - catMaxOffset) * TAG_EDGE_RESISTANCE);
        return;
      }

      catScrollX.setValue(rawOffset);
    },
    onPanResponderRelease: (_, gestureState) => {
      catScrollX.stopAnimation((value) => {
        catCurrentX.current = value;
        const projected = value + (-gestureState.vx * TAG_MOMENTUM_FACTOR);
        animateTagTo(projected);
      });
    },
    onPanResponderTerminate: (_, gestureState) => {
      catScrollX.stopAnimation((value) => {
        catCurrentX.current = value;
        const projected = value + (-gestureState.vx * TAG_MOMENTUM_FACTOR);
        animateTagTo(projected);
      });
    },
  }), [animateTagTo, catMaxOffset, catScrollX]);

  useEffect(() => {
    if (DISPLAY_BANNERS.length <= 1) return undefined;

    const frame = requestAnimationFrame(() => {
      const nextIndex = Math.max(1, Math.min(bannerPhysicalIndex.current, bannerLoopData.length - 2));
      scrollToBanner(nextIndex, false);
      bannerDragStartX.current = nextIndex * carouselSnap;
      restartBannerAutoplay();
    });

    return () => cancelAnimationFrame(frame);
  }, [bannerLoopData.length, carouselSnap, restartBannerAutoplay, scrollToBanner]);

  useEffect(() => () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (bannerAutoplayTimer.current) clearTimeout(bannerAutoplayTimer.current);
  }, []);

  const { filtered, columns } = useMemo(() => {
    const deduped = Array.from(new Map(designs.map((item) => [
      item.id,
      { ...item, ...(HOME_DISPLAY_OVERRIDES[item.id] || {}) },
    ])).values());
    const list = searchKeyword.trim()
      ? deduped.filter((item) => item.title.includes(searchKeyword.trim()))
      : deduped;
    const nextColumns: DesignItem[][] = Array.from({ length: columnCount }, () => []);
    list.forEach((item, index) => {
      nextColumns[index % columnCount].push(item);
    });
    return { filtered: list, columns: nextColumns };
  }, [columnCount, designs, searchKeyword]);

  const isFirstLoad = loading && designs.length === 0;

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onScroll={onPageScroll}
        scrollEventThrottle={80}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textHint} />}
      >
        <View style={$.searchWrap}>
          <View style={[$.searchFrame, { width: searchWidth }]}>
            <Animated.View
              pointerEvents="none"
              style={[
                $.searchGlow,
                {
                  backgroundColor: colors.accent,
                  opacity: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, dark ? 0.16 : 0.08] }),
                  transform: [{ scale: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }],
                },
              ]}
            />
            <Animated.View
              style={[
                $.searchCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: searchActive ? colors.accent : colors.border,
                  ...shadow(searchActive ? 6 : 3, searchActive ? 18 : 10, dark ? 0.28 : 0.08, '#000', searchActive ? 5 : 2),
                  transform: [
                    { translateY: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
                    { scale: searchAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.01] }) },
                  ],
                },
              ]}
            >
              <SearchField value={searchKeyword} onChange={handleSearch} animation="disable-all">
                <SearchField.Group className="h-9 rounded-full bg-transparent px-0">
                  <SearchField.SearchIcon
                    className="left-3"
                    iconProps={{ size: 14, color: searchActive ? colors.accent : colors.textHint }}
                  />
                  <SearchField.Input
                    className="h-9 flex-1 rounded-full border-0 bg-transparent pl-10 pr-9 text-[13px] text-foreground"
                    placeholder="搜索图案、作者或分类"
                    placeholderTextColor={colors.textHint}
                    onFocus={() => {
                      setSearchFocused(true);
                      animateSearch(1);
                    }}
                    onBlur={() => {
                      setSearchFocused(false);
                      animateSearch(0);
                    }}
                  />
                  <SearchField.ClearButton
                    className="right-1 h-6 w-6 rounded-full bg-default"
                    iconProps={{ size: 13, color: colors.textSecondary }}
                  />
                </SearchField.Group>
              </SearchField>
            </Animated.View>
          </View>
        </View>

        <View style={$.carouselShell}>
          <View style={[$.carouselViewport, { width: carouselViewportWidth }]}>
            <Animated.View
              {...bannerPanResponder.panHandlers}
              style={[
                $.carouselTrack,
                {
                  paddingHorizontal: carouselEdgePad,
                  transform: [{ translateX: Animated.multiply(bannerScrollX, -1) }],
                },
              ]}
            >
              {bannerLoopData.map((banner, index) => {
                const inputRange = [
                  (index - 1) * carouselSnap,
                  index * carouselSnap,
                  (index + 1) * carouselSnap,
                ];

                const scale = bannerScrollX.interpolate({
                  inputRange,
                  outputRange: [0.84, 1, 0.84],
                  extrapolate: 'clamp',
                });

                const translateY = bannerScrollX.interpolate({
                  inputRange,
                  outputRange: [wp(12), 0, wp(12)],
                  extrapolate: 'clamp',
                });

                const opacity = bannerScrollX.interpolate({
                  inputRange,
                  outputRange: [0.7, 1, 0.7],
                  extrapolate: 'clamp',
                });

                return (
                  <Animated.View
                    key={`${banner.id}-${index}`}
                    style={[
                      $.bannerSlot,
                      {
                        width: carouselItemWidth,
                        marginHorizontal: carouselGap / 2,
                        opacity,
                        transform: [{ translateY }, { scale }],
                      },
                    ]}
                  >
                    <HoverView
                      hoverScale={1.01}
                      hoverLift={2}
                      onPress={() => setFilter(banner.sort, banner.cat || null)}
                      style={[$.banner, { backgroundColor: banner.bg, height: bannerHeight }]}
                    >
                      <View style={$.bannerInner}>
                        <Text style={$.bannerTitle}>{banner.title}</Text>
                        <Text style={$.bannerSub}>{banner.sub}</Text>
                      </View>
                      <View style={$.bannerArt}>
                        <BeadGrid
                          pixels={ALL_PATTERNS[banner.pi]}
                          beadSize={Math.max(7, Math.min(10, Math.floor(carouselItemWidth / 38)))}
                          gap={wp(1)}
                          round
                          glossy={false}
                        />
                      </View>
                    </HoverView>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </View>
        </View>
        <View style={$.catShell}>
          <View style={[$.catViewport, { width: contentWidth }]} onLayout={handleTagViewportLayout}>
            <Animated.View
              {...tagPanResponder.panHandlers}
              style={[
                $.catWrap,
                {
                  paddingHorizontal: tagContentInset,
                  transform: [{ translateX: Animated.multiply(catScrollX, -1) }],
                },
              ]}
            >
              {DISPLAY_CATEGORIES.map((name, index) => {
                const active = activeCat === index;
                return (
                  <View key={name} onLayout={(event) => handleTagItemLayout(index, event)}>
                    <HoverView
                      onPress={() => setFilter(undefined, HOME_CATEGORY_KEYS[index] || null)}
                      hoverScale={1.05}
                      hoverLift={1}
                      style={[$.cat, { backgroundColor: active ? colors.text : colors.surface, borderColor: active ? colors.text : colors.border }]}
                    >
                      <Text style={[$.catText, { color: active ? '#fff' : colors.textSecondary }]}>{name}</Text>
                    </HoverView>
                  </View>
                );
              })}
            </Animated.View>
          </View>
        </View>

        <View style={[$.sectionRow, { width: contentWidth }]}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>作品广场</Text>
          {filtered.length > 0 && (
            <Text style={[$.sectionCount, { color: colors.textHint }]}>
              {filtered.length} 个作品
            </Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ width: contentWidth, alignSelf: 'center' }}
          contentContainerStyle={{ paddingBottom: wp(8) }}
        >
          {DISPLAY_SORT_OPTIONS.map((item) => {
            const active = useDesignStore.getState().sortBy === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.7}
                onPress={() => setFilter(item.key)}
                style={{ marginRight: wp(12) }}
              >
                <Text
                  style={{
                    fontSize: fp(12),
                    fontWeight: active ? '700' : '400',
                    color: active ? colors.accent : colors.textHint,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isFirstLoad && (
          <View style={[$.grid, { width: contentWidth, gap: gridGap }]}>
            {Array.from({ length: columnCount }).map((_, columnIndex) => (
              <View key={columnIndex} style={[$.column, { gap: gridGap }]}>
                {[0, 1, 2].map((itemIndex) => (
                  <CardSkeleton key={itemIndex} height={wp(120 + itemIndex * 25)} />
                ))}
              </View>
            ))}
          </View>
        )}

        {error && designs.length === 0 && <StateView error={error} onRetry={onRefresh} />}
        {!loading && !error && filtered.length === 0 && <StateView empty emptyText="暂无相关作品" />}

        {filtered.length > 0 && (
          <View style={[$.grid, { width: contentWidth, gap: gridGap }]}>
            {columns.map((column, columnIndex) => (
              <View key={columnIndex} style={[$.column, { gap: gridGap }]}>
                {column.map((item) => <Card key={item.id} item={item} cardWidth={cardWidth} />)}
              </View>
            ))}
          </View>
        )}

        {loading && designs.length > 0 && <StateView loading />}
        {!hasMore && designs.length > 0 && (
          <Text style={[$.endText, { color: colors.textHint }]}>已经到底了</Text>
        )}
        <View style={{ height: TAB_H }} />
      </ScrollView>

      <Animated.View
        style={[$.fab, {
          bottom: TAB_H + wp(10),
          opacity: fabAnim,
          transform: [{ translateY: fabAnim.interpolate({ inputRange: [0, 1], outputRange: [wp(20), 0] }) }],
        }]}
      >
        <HoverView
          style={[$.fabBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          hoverScale={1.12}
          hoverLift={2}
        >
          <Feather name="chevron-up" size={fp(18)} color={colors.textSecondary} />
        </HoverView>
      </Animated.View>
    </SafeAreaView>
  );
};

const Card = memo(({ item, cardWidth }: { item: DesignItem; cardWidth: number }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation<any>();
  const pattern = ALL_PATTERNS[item.id % ALL_PATTERNS.length];
  const height = Math.round(cardWidth * (0.72 + ((item.id % 5) * 0.07)));
  const background = (dark ? BG_D : BG_L)[item.id % BG_L.length];
  const beadSize = Math.min(Math.max(Math.floor(cardWidth / (pattern[0]?.length || 9)) - 2, 3), 10);

  return (
    <PressableScale
      style={[$.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
      scale={0.98}
      dataClass="card"
      onPress={() => navigation.navigate('DesignDetail', { item })}
    >
      <View style={[$.cardCover, { height, backgroundColor: background }]}>
        <BeadGrid pixels={pattern} beadSize={beadSize} gap={1} round />
      </View>
      <View style={$.cardBody}>
        <Text style={[$.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
        <View style={$.cardMeta}>
          <Text style={[$.cardAuthor, { color: colors.textHint }]}>{item.authorName || '创作者'}</Text>
          <View style={$.likeRow}>
            <Feather name="heart" size={fp(11)} color={colors.textHint} />
            <Text style={[$.likeCount, { color: colors.textHint }]}>{item.likeCount}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
});

const $ = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: {
    paddingTop: wp(4),
    paddingBottom: wp(8),
    alignItems: 'center',
  },
  searchFrame: {
    position: 'relative',
  },
  searchGlow: {
    position: 'absolute',
    left: wp(6),
    right: wp(6),
    top: wp(8),
    height: wp(40),
    borderRadius: wp(20),
  },
  searchCard: {
    borderRadius: wp(20),
    borderWidth: 1,
    paddingHorizontal: wp(8),
    paddingVertical: wp(2),
  },
  carouselShell: {
    paddingTop: wp(10),
    paddingBottom: wp(8),
  },
  carouselViewport: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  carouselTrack: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bannerSlot: {
    paddingBottom: wp(8),
  },
  banner: {
    height: wp(142),
    borderRadius: wp(22),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(20),
  },
  bannerInner: { flex: 1, zIndex: 1, paddingRight: wp(12) },
  bannerTitle: { fontSize: fp(20), fontWeight: '700', color: '#fff' },
  bannerSub: { fontSize: fp(12), color: 'rgba(255,255,255,0.82)', marginTop: wp(6), lineHeight: fp(18) },
  bannerArt: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: wp(10),
    borderRadius: wp(16),
  },
  catShell: {
    paddingTop: wp(10),
    paddingBottom: wp(10),
  },
  catViewport: {
    alignSelf: 'center',
    overflow: 'hidden',
  },
  catWrap: {
    alignSelf: 'flex-start',
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: TAG_GAP,
  },
  cat: {
    paddingHorizontal: wp(15),
    paddingVertical: wp(6),
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  catToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
  catText: { fontSize: FontSize.sm, fontWeight: '500' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginBottom: wp(10),
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: '700' },
  sectionCount: { fontSize: FontSize.xs },
  grid: { flexDirection: 'row', alignSelf: 'center' },
  column: { flex: 1 },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardCover: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  cardBody: { padding: wp(10) },
  cardTitle: { fontSize: FontSize.md, fontWeight: '500', marginBottom: wp(5) },
  cardMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthor: { fontSize: FontSize.xs },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: wp(3) },
  likeCount: { fontSize: FontSize.xs },
  endText: { textAlign: 'center', fontSize: FontSize.xs, paddingVertical: wp(20), letterSpacing: wp(1) },
  fab: { position: 'absolute', right: wp(15) },
  fabBtn: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    ...shadow(2, 6, 0.1, '#000', 3),
  },
});
