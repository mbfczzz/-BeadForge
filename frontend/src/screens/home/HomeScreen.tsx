import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.md * 2 - CARD_GAP) / 2;

/** 分类列表 */
const CATEGORIES = [
  { key: 'all', label: '推荐', icon: '🔥' },
  { key: 'animal', label: '动物', icon: '🐱' },
  { key: 'character', label: '卡通', icon: '🎮' },
  { key: 'flower', label: '花卉', icon: '🌸' },
  { key: 'food', label: '美食', icon: '🍕' },
  { key: 'scenery', label: '风景', icon: '🏔️' },
  { key: 'abstract', label: '抽象', icon: '🎨' },
];

/** Banner 数据 */
const BANNERS = [
  { id: 1, title: '每周精选拼豆图案', subtitle: '编辑推荐', color: '#FF6B6B' },
  { id: 2, title: '春日花卉系列', subtitle: '新品上线', color: '#4ECDC4' },
  { id: 3, title: '像素风角色合集', subtitle: '热门专题', color: '#FFE66D' },
];

/** Mock 瀑布流数据 */
const MOCK_DESIGNS = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `拼豆作品 ${i + 1}`,
  author: `创作者${(i % 5) + 1}`,
  likeCount: Math.floor(Math.random() * 999),
  height: 150 + Math.floor(Math.random() * 100), // 模拟不等高
  color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#DDA0DD', '#87CEEB'][i % 6],
}));

export const HomeScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const leftColumn = MOCK_DESIGNS.filter((_, i) => i % 2 === 0);
  const rightColumn = MOCK_DESIGNS.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <View style={styles.searchInput}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchText}
            placeholder="搜索拼豆图案..."
            placeholderTextColor={Colors.gray}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Banner 轮播 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.bannerWrap}
          contentContainerStyle={styles.bannerContent}
        >
          {BANNERS.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              activeOpacity={0.85}
              style={[styles.bannerCard, { backgroundColor: banner.color }]}
            >
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <View style={styles.bannerDeco}>
                <Text style={styles.bannerDecoText}>🧩</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 分类标签 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              style={[
                styles.categoryChip,
                activeCategory === cat.key && styles.categoryChipActive,
              ]}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  activeCategory === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 瀑布流卡片 */}
        <View style={styles.waterfall}>
          <View style={styles.column}>
            {leftColumn.map((item) => (
              <DesignCard key={item.id} item={item} />
            ))}
          </View>
          <View style={styles.column}>
            {rightColumn.map((item) => (
              <DesignCard key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/** 设计卡片组件 */
const DesignCard: React.FC<{ item: (typeof MOCK_DESIGNS)[0] }> = ({ item }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.card}>
    {/* 模拟图片占位 */}
    <View style={[styles.cardImage, { height: item.height, backgroundColor: item.color }]}>
      <Text style={styles.cardEmoji}>🧩</Text>
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardAuthor}>{item.author}</Text>
        <View style={styles.likeWrap}>
          <Text style={styles.likeIcon}>♥</Text>
          <Text style={styles.likeCount}>{item.likeCount}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grayBg,
  },
  // 搜索栏
  searchBar: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayBg,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  searchText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.black,
    padding: 0,
  },
  // Banner
  bannerWrap: {
    marginTop: Spacing.sm,
  },
  bannerContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  bannerCard: {
    width: SCREEN_WIDTH - Spacing.md * 2,
    height: 140,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    justifyContent: 'center',
    marginRight: Spacing.sm,
    overflow: 'hidden',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: '700',
  },
  bannerDeco: {
    position: 'absolute',
    right: 20,
    bottom: 10,
    opacity: 0.3,
  },
  bannerDecoText: {
    fontSize: 64,
  },
  // 分类
  categoryList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryLabel: {
    fontSize: FontSize.md,
    color: Colors.dark,
  },
  categoryLabelActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  // 瀑布流
  waterfall: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: CARD_GAP,
  },
  column: {
    flex: 1,
    gap: CARD_GAP,
  },
  // 卡片
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    opacity: 0.4,
  },
  cardInfo: {
    padding: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  likeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    color: Colors.primary,
    fontSize: 12,
    marginRight: 2,
  },
  likeCount: {
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
});
