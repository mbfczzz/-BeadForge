import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';

interface ProfileHeaderProps {
  title: string;
  unreadCount: number;
  onPressMessages: () => void;
  onPressSettings: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  title,
  unreadCount,
  onPressMessages,
  onPressSettings,
}) => {
  const { colors, dark } = useTheme();
  const actionBackground = dark ? colors.surfaceHover : 'rgba(255,255,255,0.82)';
  const actionBorder = dark ? colors.border : 'rgba(107, 142, 195, 0.16)';

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <View style={styles.actions}>
        <Pressable
          onPress={onPressMessages}
          style={[styles.actionButton, { backgroundColor: actionBackground, borderColor: actionBorder }]}
        >
          <View style={styles.actionContent}>
            <Feather name="message-circle" size={18} color={colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>消息</Text>
          </View>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          ) : null}
        </Pressable>

        <Pressable
          onPress={onPressSettings}
          style={[styles.actionButton, { backgroundColor: actionBackground, borderColor: actionBorder }]}
        >
          <View style={styles.actionContent}>
            <Feather name="settings" size={18} color={colors.textSecondary} />
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>设置</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    minWidth: 74,
    height: 44,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
