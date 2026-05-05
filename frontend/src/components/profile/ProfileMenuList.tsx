import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { MineMenuItem } from '../../api/mine';
import { ProfileCard } from './ProfileCard';

interface ProfileMenuListProps {
  items: MineMenuItem[];
  onPressItem: (item: MineMenuItem) => void;
}

export const ProfileMenuList: React.FC<ProfileMenuListProps> = ({ items, onPressItem }) => {
  const { colors, dark } = useTheme();
  const dividerColor = dark ? colors.divider : '#E8EFFB';
  const secondaryTextColor = dark ? colors.textSecondary : '#7387A1';

  return (
    <ProfileCard style={styles.card}>
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPressItem(item)}
          style={[
            styles.row,
            index < items.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: dividerColor,
            },
          ]}
        >
          <View style={[styles.leadingIcon, { backgroundColor: dark ? colors.surfaceHover : '#EEF4FF' }]}>
            <Feather name={item.icon} size={18} color={colors.accent} />
          </View>

          <View style={styles.content}>
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.description, { color: secondaryTextColor }]}>{item.description}</Text>
          </View>

          <Feather name="chevron-right" size={18} color={secondaryTextColor} />
        </Pressable>
      ))}
    </ProfileCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 18,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  leadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
});
