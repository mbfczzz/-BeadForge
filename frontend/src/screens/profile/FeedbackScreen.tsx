import * as ImagePicker from 'expo-image-picker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import type { FeedbackTicketItem, FeedbackTicketType } from '../../api/feedback';
import { AppHeader, SurfaceCard } from '../../components/common';
import { FEEDBACK_STATUS_COLORS, FEEDBACK_TICKET_TYPES } from '../../mock/feedback';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  onBack: () => void;
  tickets: FeedbackTicketItem[];
  onSubmitTicket: (ticket: Omit<FeedbackTicketItem, 'id' | 'createdAt' | 'status' | 'replies'>) => string;
  onOpenTicket: (ticketId: string) => void;
}

export const FeedbackScreen: React.FC<Props> = ({
  onBack,
  tickets,
  onSubmitTicket,
  onOpenTicket,
}) => {
  const { colors } = useTheme();
  const [ticketType, setTicketType] = useState<FeedbackTicketType>('功能问题');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [screenshots, setScreenshots] = useState<string[]>([]);

  const canSubmit = useMemo(
    () => title.trim().length > 1 && content.trim().length > 4,
    [content, title],
  );

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('无法访问相册', '请在系统设置中允许应用访问图片。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 3 - screenshots.length),
      quality: 0.82,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setScreenshots((current) => [
      ...current,
      ...result.assets.map((item) => item.uri),
    ].slice(0, 3));
  };

  const removeScreenshot = (uri: string) => {
    setScreenshots((current) => current.filter((item) => item !== uri));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('无法提交', '请至少填写标题和详细描述。');
      return;
    }

    const ticketId = onSubmitTicket({
      type: ticketType,
      title: title.trim(),
      content: content.trim(),
      screenshots,
    });

    setTitle('');
    setContent('');
    setScreenshots([]);
    Alert.alert('提交成功', `工单 ${ticketId} 已创建。`);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader title="意见反馈" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SurfaceCard
          title="提交工单"
          description="描述你遇到的问题或建议，方便我们更快定位和处理。"
        >
          <View style={styles.typeRow}>
            {FEEDBACK_TICKET_TYPES.map((item) => {
              const active = item === ticketType;
              return (
                <TouchableOpacity
                  key={item}
                  activeOpacity={0.84}
                  onPress={() => setTicketType(item)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: active ? colors.accent : colors.surface,
                      borderColor: active ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: active ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>标题</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="例如：订单状态显示异常"
              placeholderTextColor={colors.textHint}
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>详细描述</Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="请尽量描述现象、出现路径、是否可复现。"
              placeholderTextColor={colors.textHint}
              multiline
              textAlignVertical="top"
              style={[
                styles.textarea,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.uploadHeader}>
              <Text style={[styles.fieldLabel, styles.noMargin, { color: colors.text }]}>
                截图上传
              </Text>
              <Text style={[styles.uploadHint, { color: colors.textHint }]}>最多 3 张</Text>
            </View>
            <View style={styles.uploadRow}>
              <TouchableOpacity
                activeOpacity={0.86}
                onPress={pickScreenshot}
                disabled={screenshots.length >= 3}
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Feather name="image" size={18} color={colors.textSecondary} />
                <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                  选择截图
                </Text>
              </TouchableOpacity>

              {screenshots.map((uri) => (
                <View key={uri} style={styles.previewWrap}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => removeScreenshot(uri)}
                    style={styles.previewRemove}
                  >
                    <Feather name="x" size={12} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={[
              styles.submitButton,
              { backgroundColor: canSubmit ? colors.accent : colors.border },
            ]}
          >
            <Text style={styles.submitText}>提交工单</Text>
          </TouchableOpacity>
        </SurfaceCard>

        <SurfaceCard title="最近工单" description="你最近提交的反馈会显示在这里。">
          <View style={styles.ticketList}>
            {tickets.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => onOpenTicket(item.id)}
                style={[
                  styles.ticketRow,
                  {
                    borderBottomWidth:
                      index === tickets.length - 1 ? 0 : StyleSheet.hairlineWidth,
                    borderBottomColor: colors.divider,
                  },
                ]}
              >
                <View style={styles.ticketTop}>
                  <View style={styles.ticketTopLeft}>
                    <Text style={[styles.ticketTitle, { color: colors.text }]}>{item.title}</Text>
                    <View
                      style={[
                        styles.ticketIdBadge,
                        { backgroundColor: colors.inputBg, borderColor: colors.border },
                      ]}
                    >
                      <Text style={[styles.ticketIdText, { color: colors.textHint }]}>
                        {item.id}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${FEEDBACK_STATUS_COLORS[item.status]}16` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: FEEDBACK_STATUS_COLORS[item.status] },
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.ticketMeta, { color: colors.textHint }]}>
                  {item.type} · {item.createdAt}
                  {item.screenshots.length ? ` · ${item.screenshots.length} 张截图` : ''}
                </Text>

                <Text
                  numberOfLines={2}
                  style={[styles.ticketContent, { color: colors.textSecondary }]}
                >
                  {item.content}
                </Text>

                <View style={styles.ticketFoot}>
                  <Text style={[styles.ticketCount, { color: colors.textHint }]}>
                    {item.replies.length} 条记录
                  </Text>
                  <View style={styles.ticketEntry}>
                    <Text style={[styles.ticketEntryText, { color: colors.accent }]}>
                      查看详情
                    </Text>
                    <Feather name="chevron-right" size={14} color={colors.accent} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </SurfaceCard>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: wp(16),
    paddingTop: wp(12),
    paddingBottom: wp(40),
    gap: wp(16),
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: wp(6),
  },
  typeChip: {
    height: wp(34),
    paddingHorizontal: wp(14),
    marginRight: wp(8),
    marginBottom: wp(8),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeChipText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  field: {
    marginTop: wp(10),
  },
  fieldLabel: {
    marginBottom: wp(8),
    fontSize: fp(13),
    fontWeight: '700',
  },
  noMargin: {
    marginBottom: 0,
  },
  input: {
    height: wp(42),
    borderRadius: wp(14),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    fontSize: fp(14),
  },
  textarea: {
    minHeight: wp(108),
    borderRadius: wp(16),
    borderWidth: 1,
    paddingHorizontal: wp(14),
    paddingVertical: wp(12),
    fontSize: fp(14),
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: wp(8),
  },
  uploadHint: {
    fontSize: fp(11),
  },
  uploadRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  uploadButton: {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(16),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    marginTop: wp(8),
    fontSize: fp(12),
    fontWeight: '600',
  },
  previewWrap: {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(16),
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewRemove: {
    position: 'absolute',
    top: wp(6),
    right: wp(6),
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: wp(16),
    height: wp(42),
    borderRadius: wp(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: fp(14),
    fontWeight: '800',
  },
  ticketList: {
    marginTop: wp(2),
  },
  ticketRow: {
    paddingVertical: wp(14),
  },
  ticketTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp(10),
  },
  ticketTopLeft: {
    flex: 1,
  },
  ticketTitle: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  ticketIdBadge: {
    alignSelf: 'flex-start',
    marginTop: wp(8),
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
    borderWidth: 1,
  },
  ticketIdText: {
    fontSize: fp(10),
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  ticketMeta: {
    marginTop: wp(8),
    fontSize: fp(11),
  },
  ticketContent: {
    marginTop: wp(8),
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  ticketFoot: {
    marginTop: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCount: {
    fontSize: fp(11),
  },
  ticketEntry: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketEntryText: {
    fontSize: fp(12),
    fontWeight: '700',
    marginRight: wp(2),
  },
});
