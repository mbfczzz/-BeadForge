import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { MineToolItem } from '../../mock/profileMine';
import { ProfileCard } from './ProfileCard';

interface ProfileToolsGridProps {
  items: MineToolItem[];
  onPressItem: (item: MineToolItem) => void;
}

export const ProfileToolsGrid: React.FC<ProfileToolsGridProps> = ({ items, onPressItem }) => {
  const { colors, dark } = useTheme();
  const textColor = dark ? colors.textSecondary : '#61758D';

  return (
    <ProfileCard style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>常用功能</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onPressItem(item)} style={styles.gridItem}>
            <View style={[styles.iconBubble, { backgroundColor: item.iconBackground }]}>
              <Feather name={item.icon} size={21} color={item.iconTint} />
              {item.badgeCount ? (
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>{item.badgeCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.itemLabel, { color: colors.text }]}>{item.label}</Text>
            <Text style={[styles.itemCaption, { color: textColor }]}>点击进入</Text>
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
    paddingBottom: 8,
    marginBottom: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  iconBubble: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  itemLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  itemCaption: {
    fontSize: 10,
  },
});
