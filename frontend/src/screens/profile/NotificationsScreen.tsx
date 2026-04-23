import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AppHeader, StateView, SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import type { ProfileNoticeAction, ProfileNoticeItem, ProfileNoticeType } from '../../api/profile';
import { fp, wp } from '../../utils/responsive';

const NOTICE_TABS: Array<'全部' | ProfileNoticeType> = ['全部', '系统', '订单', '互动'];

interface Props {
  notices: ProfileNoticeItem[];
  onBack: () => void;
  onReadNotice: (id: number) => void;
  onReadAll: () => void;
  onOpenAction: (action?: ProfileNoticeAction) => void;
}

export const NotificationsScreen: React.FC<Props> = ({
  notices,
  onBack,
  onReadNotice,
  onReadAll,
  onOpenAction,
}) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<typeof NOTICE_TABS[number]>('全部');

  const filtered = useMemo(() => {
    if (activeTab === '全部') return notices;
    return notices.filter((item) => item.type === activeTab);
  }, [activeTab, notices]);

  const unreadCount = useMemo(
    () => notices.filter((item) => item.unread).length,
    [notices],
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader
        title="通知"
        onBack={onBack}
        right={(
          <TouchableOpacity activeOpacity={0.8} onPress={onReadAll} disabled={unreadCount === 0}>
            <Text style={[styles.readAllText, { color: unreadCount === 0 ? colors.textHint : colors.accent }]}>全部已读</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.tabsRow}>
        {NOTICE_TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={0.82}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                {
                  backgroundColor: active ? colors.accent : colors.surface,
                  borderColor: active ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={[styles.tabText, { color: active ? '#FFFFFF' : colors.textSecondary }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.84}
            onPress={() => {
              onReadNotice(item.id);
              onOpenAction(item.action);
            }}
          >
            <SurfaceCard style={styles.card} bodyStyle={styles.cardBody}>
              <View style={styles.cardTop}>
                <View style={styles.titleWrap}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                  {item.unread ? <View style={styles.dot} /> : null}
                </View>
                <View style={[styles.typeBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.typeText, { color: colors.accent }]}>{item.type}</Text>
                </View>
              </View>
              <Text style={[styles.cardContent, { color: colors.textSecondary }]}>{item.content}</Text>
              <View style={styles.bottomRow}>
                <View style={styles.timeRow}>
                  <Feather name="clock" size={fp(12)} color={colors.textHint} />
                  <Text style={[styles.timeText, { color: colors.textHint }]}>{item.timeAgo}</Text>
                </View>
                {item.action ? (
                  <View style={styles.linkRow}>
                    <Text style={[styles.linkText, { color: colors.accent }]}>查看</Text>
                    <Feather name="chevron-right" size={14} color={colors.accent} />
                  </View>
                ) : null}
              </View>
            </SurfaceCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<StateView empty emptyText="暂无通知" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  readAllText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: wp(8),
    paddingHorizontal: wp(16),
    paddingTop: wp(8),
    paddingBottom: wp(12),
  },
  tab: {
    minHeight: wp(34),
    paddingHorizontal: wp(14),
    borderRadius: wp(999),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: wp(16),
    paddingBottom: wp(40),
  },
  card: {
    marginBottom: wp(10),
  },
  cardBody: {
    gap: wp(10),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: wp(12),
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: fp(14),
    fontWeight: '700',
  },
  dot: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#EF4444',
    marginLeft: wp(8),
  },
  typeBadge: {
    paddingHorizontal: wp(10),
    paddingVertical: wp(5),
    borderRadius: wp(999),
  },
  typeText: {
    fontSize: fp(10),
    fontWeight: '700',
  },
  cardContent: {
    fontSize: fp(12),
    lineHeight: fp(18),
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  timeText: {
    fontSize: fp(11),
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  linkText: {
    fontSize: fp(12),
    fontWeight: '700',
  },
});
