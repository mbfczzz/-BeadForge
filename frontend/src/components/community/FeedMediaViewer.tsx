import React, { useEffect, useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { SvgXml } from 'react-native-svg';
import { fp, wp } from '../../utils/responsive';
import type { FeedMockMedia } from '../../utils/feedMedia';

export const FeedMediaViewer: React.FC<{
  visible: boolean;
  gallery: FeedMockMedia[];
  initialIndex: number;
  onClose: () => void;
}> = ({ visible, gallery, initialIndex, onClose }) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
    }
  }, [initialIndex, visible]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.viewerTop}>
          <TouchableOpacity activeOpacity={0.8} onPress={onClose} style={styles.viewerBtn}>
            <MCI name="close" size={fp(24)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.viewerCount}>{activeIndex + 1} / {gallery.length}</Text>
          <View style={styles.viewerBtn} />
        </View>

        <ScrollView
          key={`viewer-${initialIndex}`}
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
            const imageH = Math.min(height * 0.82, width / item.aspectRatio);

            return (
              <View key={`viewer-item-${index}`} style={[styles.viewerPage, { width, height }]}>
                {item.uri ? (
                  <Image source={{ uri: item.uri }} style={{ width: imageW, height: imageH }} resizeMode="contain" />
                ) : (
                  <SvgXml xml={item.svg} width={imageW} height={imageH} />
                )}
              </View>
            );
          })}
        </ScrollView>

        {gallery.length > 1 ? (
          <View style={styles.viewerDots}>
            {gallery.map((item, index) => (
              <View
                key={`viewer-dot-${index}`}
                style={[
                  styles.viewerDot,
                  {
                    width: index === activeIndex ? wp(18) : wp(6),
                    backgroundColor: index === activeIndex ? '#FFFFFF' : 'rgba(255,255,255,0.42)',
                  },
                ]}
              />
            ))}
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
  },
  viewerTop: {
    position: 'absolute',
    top: wp(24),
    left: wp(14),
    right: wp(14),
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewerBtn: {
    width: wp(42),
    height: wp(42),
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: fp(13),
    fontWeight: '800',
  },
  viewerPage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerDots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: wp(34),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp(6),
  },
  viewerDot: {
    height: wp(6),
    borderRadius: wp(999),
  },
});
