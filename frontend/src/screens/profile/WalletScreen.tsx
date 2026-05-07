import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { SurfaceCard } from '../../components/common';
import { useTheme } from '../../theme';
import { useResourceAccessStore } from '../../store/useResourceAccessStore';
import { fp, wp } from '../../utils/responsive';

const PAD = wp(16);

interface Props {
  onBack: () => void;
}

export const WalletScreen: React.FC<Props> = ({ onBack }) => {
  const { colors } = useTheme();
  const pointsBalance = useResourceAccessStore((state) => state.pointsBalance);
  const pointsLogs = useResourceAccessStore((state) => state.pointsLogs);
  const membershipActive = useResourceAccessStore((state) => state.membershipActive);
  const loadWallet = useResourceAccessStore((state) => state.loadWallet);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <TouchableOpacity style={$.navButton} onPress={onBack} activeOpacity={0.75}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </TouchableOpacity>
        <Text style={[$.navTitle, { color: colors.text }]}>积分明细</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        <View style={[$.balanceCard, { backgroundColor: colors.accent }]}>
          <Text style={$.balanceLabel}>当前积分</Text>
          <Text style={$.balanceValue}>{pointsBalance}</Text>
          <View style={$.statsRow}>
            <View style={$.statsItem}>
              <Text style={$.statsLabel}>会员状态</Text>
              <Text style={$.statsValue}>{membershipActive ? '体验中' : '未开启'}</Text>
            </View>
            <View style={$.statsDivider} />
            <View style={$.statsItem}>
              <Text style={$.statsLabel}>积分用途</Text>
              <Text style={$.statsValue}>图纸兑换</Text>
            </View>
          </View>
        </View>

        <View style={$.section}>
          <Text style={[$.sectionTitle, { color: colors.text }]}>积分记录</Text>
          <SurfaceCard bodyStyle={$.logsBody}>
            {pointsLogs.map((item, index) => (
              <View
                key={item.id}
                style={[
                  $.logRow,
                  index > 0 ? { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth } : null,
                ]}
              >
                <View
                  style={[
                    $.logIcon,
                    { backgroundColor: item.amount > 0 ? '#dcfce7' : '#fee2e2' },
                  ]}
                >
                  <Feather
                    name={item.amount > 0 ? 'arrow-down-left' : 'arrow-up-right'}
                    size={fp(13)}
                    color={item.amount > 0 ? '#16a34a' : '#ef4444'}
                  />
                </View>
                <View style={$.logContent}>
                  <Text style={[$.logTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[$.logDesc, { color: colors.textHint }]}>{item.description}</Text>
                  <Text style={[$.logTime, { color: colors.textHint }]}>{item.createdAt}</Text>
                </View>
                <Text style={[$.logAmount, { color: item.amount > 0 ? '#16a34a' : '#ef4444' }]}>
                  {item.amount > 0 ? '+' : ''}
                  {item.amount}
                </Text>
              </View>
            ))}
          </SurfaceCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: PAD,
    height: wp(52),
    borderBottomWidth: 1,
  },
  navButton: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fp(16),
    fontWeight: '700',
  },
  balanceCard: {
    marginHorizontal: PAD,
    marginTop: wp(16),
    borderRadius: wp(20),
    padding: wp(18),
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fp(12),
  },
  balanceValue: {
    color: '#fff',
    fontSize: fp(34),
    fontWeight: '800',
    marginTop: wp(8),
  },
  statsRow: {
    marginTop: wp(18),
    paddingTop: wp(14),
    borderTopColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  statsItem: {
    flex: 1,
  },
  statsLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: fp(11),
  },
  statsValue: {
    color: '#fff',
    fontSize: fp(16),
    fontWeight: '700',
    marginTop: wp(6),
  },
  statsDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginHorizontal: wp(16),
  },
  section: {
    marginTop: wp(22),
    paddingHorizontal: PAD,
  },
  sectionTitle: {
    fontSize: fp(16),
    fontWeight: '700',
    marginBottom: wp(10),
  },
  logsBody: {
    gap: 0,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(14),
    paddingVertical: wp(14),
  },
  logIcon: {
    width: wp(34),
    height: wp(34),
    borderRadius: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
    marginLeft: wp(12),
  },
  logTitle: {
    fontSize: fp(13),
    fontWeight: '700',
  },
  logDesc: {
    fontSize: fp(11),
    marginTop: wp(4),
  },
  logTime: {
    fontSize: fp(10),
    marginTop: wp(4),
  },
  logAmount: {
    fontSize: fp(14),
    fontWeight: '700',
    marginLeft: wp(12),
  },
});
