import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { ProfileCard } from './ProfileCard';

interface ProfileUserCardProps {
  displayName: string;
  avatarText: string;
  signature: string;
  levelLabel: string;
  levelHint: string;
  pointsLabel: string;
  pointsValue: string;
  checkInHint: string;
  onPressProfile: () => void;
  onPressSignIn: () => void;
}

export const ProfileUserCard: React.FC<ProfileUserCardProps> = ({
  displayName,
  avatarText,
  signature,
  levelLabel,
  levelHint,
  pointsLabel,
  pointsValue,
  checkInHint,
  onPressProfile,
  onPressSignIn,
}) => {
  const { colors, dark } = useTheme();
  const secondaryTextColor = dark ? colors.textSecondary : '#6A7E99';

  return (
    <ProfileCard style={styles.card}>
      <View style={styles.heroGlow} />
      <View style={styles.heroGlowSecondary} />

      <View style={styles.topRow}>
        <Pressable onPress={onPressProfile} style={styles.identityWrap}>
          <View style={styles.avatarShell}>
            <View style={styles.avatarCore}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>
          </View>

          <View style={styles.identityTextWrap}>
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>
                {displayName}
              </Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{levelLabel}</Text>
              </View>
            </View>
            <Text style={[styles.signature, { color: secondaryTextColor }]} numberOfLines={2}>
              {signature}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onPressProfile}
          style={[
            styles.editChip,
            {
              backgroundColor: dark ? colors.surfaceHover : '#F4F8FF',
              borderColor: dark ? colors.border : 'rgba(59, 108, 255, 0.18)',
            },
          ]}
        >
          <Feather name="edit-3" size={14} color={colors.accent} />
          <Text style={[styles.editChipText, { color: colors.accent }]}>编辑</Text>
        </Pressable>
      </View>

      <Text style={[styles.levelHint, { color: secondaryTextColor }]}>{levelHint}</Text>

      <View style={styles.bottomRow}>
        <View
          style={[
            styles.pointsPanel,
            {
              backgroundColor: dark ? colors.surfaceHover : '#F7FAFF',
              borderColor: dark ? colors.border : '#E5EDFF',
            },
          ]}
        >
          <Text style={[styles.pointsLabel, { color: secondaryTextColor }]}>{pointsLabel}</Text>
          <View style={styles.pointsValueRow}>
            <Feather name="award" size={15} color="#F59E0B" />
            <Text style={[styles.pointsValue, { color: colors.text }]}>{pointsValue}</Text>
          </View>
        </View>

        <Pressable onPress={onPressSignIn} style={styles.signInButton}>
          <Feather name="calendar" size={15} color="#FFFFFF" />
          <Text style={styles.signInText}>签到</Text>
        </Pressable>
      </View>

      <Text style={[styles.checkInHint, { color: secondaryTextColor }]}>{checkInHint}</Text>
    </ProfileCard>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    padding: 22,
    marginBottom: 18,
  },
  heroGlow: {
    position: 'absolute',
    top: -42,
    right: -16,
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(111, 163, 255, 0.18)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -64,
    left: -18,
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },
  identityWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarShell: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E2ECFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3B6CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  identityTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    maxWidth: '70%',
  },
  levelBadge: {
    borderRadius: 999,
    backgroundColor: '#E8F0FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelBadgeText: {
    color: '#2F5FE3',
    fontSize: 11,
    fontWeight: '700',
  },
  signature: {
    fontSize: 13,
    lineHeight: 19,
    paddingRight: 12,
  },
  editChip: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  levelHint: {
    marginTop: 14,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 18,
  },
  pointsPanel: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pointsLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  pointsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  signInButton: {
    minWidth: 104,
    height: 52,
    borderRadius: 20,
    backgroundColor: '#3B6CFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  checkInHint: {
    marginTop: 12,
    fontSize: 12,
  },
});
