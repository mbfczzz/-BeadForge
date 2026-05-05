import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { MineOrderShortcut } from '../../api/mine';
import { ProfileCard } from './ProfileCard';

interface ProfileOrdersCardProps {
  items: MineOrderShortcut[];
  onPressAll: () => void;
  onPressItem: (item: MineOrderShortcut) => void;
}

export const ProfileOrdersCard: React.FC<ProfileOrdersCardProps> = ({
  items,
  onPressAll,
  onPressItem,
}) => {
  const { colors, dark } = useTheme();
  const helperColor = dark ? colors.textSecondary : '#7B8CA5';

  return (
    <ProfileCard style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>我的订单</Text>
          <Text style={[styles.subtitle, { color: helperColor }]}>管理待处理订单与售后服务</Text>
        </View>

        <Pressable onPress={onPressAll} style={styles.allButton}>
          <Text style={[styles.allButtonText, { color: colors.accent }]}>查看全部</Text>
          <Feather name="chevron-right" size={16} color={colors.accent} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onPressItem(item)} style={styles.orderItem}>
            <View
              style={[
                styles.orderIconBubble,
                {
                  backgroundColor: dark ? colors.surfaceHover : '#EEF4FF',
                  borderColor: dark ? colors.border : '#DDE7FB',
                },
              ]}
            >
              <Feather name={item.icon} size={18} color={colors.accent} />
              {item.pendingCount > 0 ? (
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>{item.pendingCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.orderLabel, { color: colors.text }]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </ProfileCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
  allButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  allButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  orderItem: {
    flex: 1,
    alignItems: 'center',
  },
  orderIconBubble: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  orderBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
