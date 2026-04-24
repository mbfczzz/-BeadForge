import React, { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppHeader } from '../../components/common';
import type { RootScreenProps } from '../../navigation/types';
import { useCommunityFeedStore } from '../../store/useCommunityFeedStore';
import { useTheme } from '../../theme';
import { fp, wp, BOTTOM_SAFE_H } from '../../utils/responsive';

const PUBLISH_BLUE = '#3B82F6';
const PUBLISH_ROSE = '#E11D48';
const PAD = wp(16);

export const PublishComposerScreen: React.FC<RootScreenProps<'PublishComposer'>> = ({ navigation }) => {
  const { colors } = useTheme();
  const addLocalFeed = useCommunityFeedStore((state) => state.addLocalFeed);
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [error, setError] = useState('');

  const pickMedia = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('需要相册权限后才能选择照片或视频。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      setAssets(result.assets.slice(0, 6));
      setError('');
    }
  }, []);

  const publish = useCallback(() => {
    const nextContent = content.trim();
    const nextCaption = caption.trim();
    const tags = tagsText
      .split(/[,\s，#]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (!nextContent) {
      setError('先写一点动态内容。');
      return;
    }

    if (assets.length === 0) {
      setError('至少选择一张照片、动图或视频。');
      return;
    }

    const firstAsset = assets[0];
    const isVideo = firstAsset.type === 'video';
    const isGif = firstAsset.uri.toLowerCase().includes('.gif');

    addLocalFeed({
      id: Date.now(),
      user: { name: '测试用户', title: '本地创作者' },
      content: nextContent,
      caption: nextCaption || undefined,
      media: {
        type: isVideo ? 'video' : isGif ? 'gif' : 'image',
        demoAssetId: `local-${Date.now()}`,
        aspectRatio: firstAsset.width && firstAsset.height ? firstAsset.width / firstAsset.height : 1,
        durationSec: isVideo && firstAsset.duration ? Math.max(1, Math.round(firstAsset.duration / 1000)) : undefined,
        assetUris: assets.map((asset) => asset.uri),
      },
      coverAccent: PUBLISH_BLUE,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      timeAgo: '刚刚',
      tags: tags.length ? tags : ['新动态'],
    });

    navigation.goBack();
  }, [addLocalFeed, assets, caption, content, navigation, tagsText]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader title="发布动态" onBack={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TextInput
          value={content}
          onChangeText={(text) => {
            setContent(text);
            if (error) setError('');
          }}
          multiline
          placeholder="分享你的成品、过程或灵感..."
          placeholderTextColor={colors.textHint}
          style={[styles.mainInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        />

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="补充说明，可不填"
          placeholderTextColor={colors.textHint}
          style={[styles.lineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        />

        <TextInput
          value={tagsText}
          onChangeText={setTagsText}
          placeholder="标签，用空格或逗号分隔，例如 挂件 成品照"
          placeholderTextColor={colors.textHint}
          style={[styles.lineInput, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
        />

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>素材</Text>
          <Text style={[styles.sectionHint, { color: colors.textHint }]}>{assets.length}/6</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assetRow}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={pickMedia}
            style={[styles.assetPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <MCI name="image-plus" size={fp(26)} color={PUBLISH_BLUE} />
            <Text style={[styles.assetPickerText, { color: colors.textSecondary }]}>选择素材</Text>
          </TouchableOpacity>
          {assets.map((asset, index) => (
            <View key={`${asset.uri}-${index}`} style={styles.assetThumbWrap}>
              <Image source={{ uri: asset.uri }} style={styles.assetThumb} resizeMode="cover" />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAssets((items) => items.filter((_, itemIndex) => itemIndex !== index))}
                style={styles.assetRemove}
              >
                <MCI name="close" size={fp(13)} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: colors.navBg, borderTopColor: colors.navBorder }]}>
        <TouchableOpacity activeOpacity={0.86} onPress={publish} style={styles.publishButton}>
          <Text style={styles.publishButtonText}>发布</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: PAD,
    paddingTop: wp(12),
    paddingBottom: wp(96) + BOTTOM_SAFE_H,
  },
  mainInput: {
    minHeight: wp(150),
    borderRadius: wp(14),
    borderWidth: 1,
    paddingHorizontal: wp(13),
    paddingTop: wp(12),
    paddingBottom: wp(12),
    fontSize: fp(14),
    lineHeight: fp(22),
    textAlignVertical: 'top',
  },
  lineInput: {
    minHeight: wp(46),
    borderRadius: wp(13),
    borderWidth: 1,
    paddingHorizontal: wp(13),
    marginTop: wp(10),
    fontSize: fp(13),
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: wp(18),
  },
  sectionTitle: {
    fontSize: fp(15),
    fontWeight: '900',
  },
  sectionHint: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  assetRow: {
    gap: wp(10),
    paddingTop: wp(12),
    paddingBottom: wp(6),
  },
  assetPicker: {
    width: wp(92),
    height: wp(92),
    borderRadius: wp(14),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
  },
  assetPickerText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
  assetThumbWrap: {
    width: wp(92),
    height: wp(92),
    borderRadius: wp(14),
    overflow: 'hidden',
    position: 'relative',
  },
  assetThumb: {
    width: '100%',
    height: '100%',
  },
  assetRemove: {
    position: 'absolute',
    top: wp(5),
    right: wp(5),
    width: wp(21),
    height: wp(21),
    borderRadius: wp(11),
    backgroundColor: 'rgba(15,23,42,0.68)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: PUBLISH_ROSE,
    fontSize: fp(12),
    fontWeight: '700',
    marginTop: wp(10),
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: PAD,
    paddingTop: wp(10),
    paddingBottom: Math.max(BOTTOM_SAFE_H, wp(12)),
  },
  publishButton: {
    height: wp(46),
    borderRadius: wp(14),
    backgroundColor: PUBLISH_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: fp(14),
    fontWeight: '900',
  },
});
