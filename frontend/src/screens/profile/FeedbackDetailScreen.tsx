import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { FeedbackTicketItem, FeedbackTicketStatus } from '../../api/feedback';
import { AppHeader, SurfaceCard, StateView } from '../../components/common';
import { useUiConfig } from '../../store/useUiConfigStore';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

const FALLBACK_STATUS_COLORS: Record<FeedbackTicketStatus, string> = {
  处理中: '#2563EB',
  待回复: '#F59E0B',
  已完成: '#10B981',
};

interface Props {
  ticket?: FeedbackTicketItem;
  onBack: () => void;
}

export const FeedbackDetailScreen: React.FC<Props> = ({ ticket, onBack }) => {
  const { colors } = useTheme();
  const statusColors = useUiConfig<Record<FeedbackTicketStatus, string>>('feedback.statusColors', FALLBACK_STATUS_COLORS);

  if (!ticket) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <AppHeader title="工单详情" onBack={onBack} />
        <StateView empty emptyText="未找到对应工单" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader title="工单详情" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <SurfaceCard title={ticket.title} description={`${ticket.type} · ${ticket.createdAt}`}>
          <View style={styles.topMeta}>
            <View
              style={[
                styles.ticketIdBadge,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.ticketIdText, { color: colors.textHint }]}>{ticket.id}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColors[ticket.status]}16` },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: statusColors[ticket.status] },
                ]}
              >
                {ticket.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>问题描述</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>{ticket.content}</Text>

          {ticket.screenshots.length ? (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>截图附件</Text>
              <View style={styles.imageRow}>
                {ticket.screenshots.map((uri) => (
                  <Image key={uri} source={{ uri }} style={styles.image} />
                ))}
              </View>
            </>
          ) : null}
        </SurfaceCard>

        <SurfaceCard title="沟通记录" description={`共 ${ticket.replies.length} 条`}>
          <View style={styles.replyList}>
            {ticket.replies.map((reply, index) => (
              <View
                key={reply.id}
                style={[
                  styles.replyCard,
                  {
                    backgroundColor: reply.from === '客服' ? colors.inputBg : colors.surface,
                    borderColor: colors.border,
                    marginBottom: index === ticket.replies.length - 1 ? 0 : wp(8),
                  },
                ]}
              >
                <View style={styles.replyHeader}>
                  <Text
                    style={[
                      styles.replyFrom,
                      {
                        color: reply.from === '客服' ? colors.accent : colors.textSecondary,
                      },
                    ]}
                  >
                    {reply.from}
                  </Text>
                  <Text style={[styles.replyTime, { color: colors.textHint }]}>
                    {reply.createdAt}
                  </Text>
                </View>
                <Text style={[styles.replyContent, { color: colors.textSecondary }]}>
                  {reply.content}
                </Text>
              </View>
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
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketIdBadge: {
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
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  statusText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: wp(6),
    fontSize: fp(13),
    fontWeight: '700',
  },
  bodyText: {
    fontSize: fp(13),
    lineHeight: fp(20),
  },
  imageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(10),
  },
  image: {
    width: wp(88),
    height: wp(88),
    borderRadius: wp(16),
  },
  replyList: {
    marginTop: wp(2),
  },
  replyCard: {
    borderWidth: 1,
    borderRadius: wp(14),
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
  },
  replyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: wp(10),
  },
  replyFrom: {
    fontSize: fp(11),
    fontWeight: '700',
  },
  replyTime: {
    fontSize: fp(10),
  },
  replyContent: {
    marginTop: wp(6),
    fontSize: fp(12),
    lineHeight: fp(18),
  },
});
