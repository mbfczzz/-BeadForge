import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import type { HomeBannerItem } from '../../api/discovery';
import { fp, screenW, wp } from '../../utils/responsive';
import { ALL_PATTERNS, BeadGrid } from './BeadGrid';

const OUTER_PAD = wp(10);
const VIEWPORT_WIDTH = screenW - OUTER_PAD * 2;
const CARD_WIDTH = VIEWPORT_WIDTH-wp(6);
const SIDE_GAP = (VIEWPORT_WIDTH - CARD_WIDTH) / 2;
const CARD_HEIGHT = wp(150);

interface HomeBannerCarouselProps {
  banners: HomeBannerItem[];
}

export const HomeBannerCarousel: React.FC<HomeBannerCarouselProps> = ({ banners }) => {
  const data = React.useMemo(
    () =>
      [...banners]
        .filter((item) => item.enabled !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [banners],
  );

  if (data.length === 0) {
    return null;
  }

  return (
    <View style={styles.block}>
      <Carousel<HomeBannerItem>
        autoPlay={data.length > 1}
        autoPlayInterval={2600}
        data={data}
        loop={data.length > 1}
        pagingEnabled
        snapEnabled
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        style={styles.carousel}
        containerStyle={styles.carouselContainer}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.84,
          parallaxAdjacentItemScale: 0.74,
          parallaxScrollingOffset: wp(60),
        }}
        renderItem={({ item }) => {
          const pixels = ALL_PATTERNS[item.pi % ALL_PATTERNS.length];
          const textColor = item.textColor || '#FFFFFF';
          const subColor = item.textColor ? `${item.textColor}CC` : 'rgba(255,255,255,0.88)';

          return (
            <View style={[styles.card, { backgroundColor: item.bg }]}>
              <View style={styles.textWrap}>
                <Text style={[styles.eyebrow, { color: subColor }]}>{item.eyebrow || '发现图纸'}</Text>
                <Text style={[styles.title, { color: textColor }]}>{item.title}</Text>
                <Text style={[styles.sub, { color: subColor }]}>{item.sub}</Text>
                {item.buttonText ? (
                  <View style={styles.ctaWrap}>
                    <Text style={styles.ctaText}>{item.buttonText}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.previewWrap}>
                <BeadGrid pixels={pixels} beadSize={wp(8)} gap={0.8} round glossy={false} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  block: {
    marginTop: wp(12),
    width: VIEWPORT_WIDTH,
    alignSelf: 'center',
  },
  carousel: {
    width: VIEWPORT_WIDTH,
    height: CARD_HEIGHT,
  },
  carouselContainer: {
    paddingHorizontal: SIDE_GAP,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: CARD_HEIGHT,
    borderRadius: wp(20),
    paddingHorizontal: wp(18),
    paddingVertical: wp(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrap: {
    flex: 1,
    paddingRight: wp(12),
  },
  eyebrow: {
    fontSize: fp(10),
    fontWeight: '700',
    marginBottom: wp(6),
  },
  title: {
    fontSize: fp(14),
    fontWeight: '800',
    lineHeight: fp(13),
  },
  sub: {
    fontSize: fp(11),
    lineHeight: fp(16),
    marginTop: wp(8),
  },
  ctaWrap: {
    alignSelf: 'flex-start',
    marginTop: wp(12),
    paddingHorizontal: wp(10),
    paddingVertical: wp(6),
    borderRadius: wp(999),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: fp(10),
    fontWeight: '700',
  },
  previewWrap: {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
