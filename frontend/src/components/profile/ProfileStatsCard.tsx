import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { MineStatItem } from '../../mock/profileMine';
import { ProfileCard } from './ProfileCard';

interface ProfileStatsCardProps {
  items: MineStatItem[];
  onPressItem: (item: MineStatItem) => void;
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({ items, onPressItem }) => {
  const { colors, dark } = useTheme();
  const dividerColor = dark ? colors.divider : '#E8F0FD';
  const labelColor = dark ? colors.textSecondary : '#7788A1';

  return (
    <ProfileCard style={styles.card}>
      <View style={styles.row}>
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            <Pressable onPress={() => onPressItem(item)} style={styles.statButton}>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>{item.label}</Text>
            </Pressable>
            {index < items.length - 1 ? <View style={[styles.divider, { backgroundColor: dividerColor }]} /> : null}
          </React.Fragment>
        ))}
      </View>
    </ProfileCard>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    marginVertical: 10,
  },
});
