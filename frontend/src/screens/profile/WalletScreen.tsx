import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, FontSize, BorderRadius } from '../../theme';
import { HoverView } from '../../components/common';
import { Toast } from '../../components/common/Toast';
import { useToast, hapticSuccess } from '../../hooks/useFeedback';
import client from '../../api/client';
import { wp, fp } from '../../utils/responsive';

const PAD = wp(16);

const CHARGE_OPTIONS = [
  { amount: 10, label: '10', price: '¥10' },
  { amount: 50, label: '50', price: '¥50' },
  { amount: 100, label: '100', price: '¥98' },
  { amount: 500, label: '500', price: '¥488' },
];

interface Props { onBack: () => void }

export const WalletScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const toast = useToast();
  const [balance, setBalance] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [charging, setCharging] = useState(false);

  const fetchWallet = async () => {
    try {
      const res: any = await client.get('/wallet/balance');
      setBalance(res.data?.balance || 0);
      setTotalCharged(res.data?.totalCharged || 0);
      setTotalSpent(res.data?.totalSpent || 0);
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const res: any = await client.get('/wallet/logs');
      setLogs(res.data || []);
    } catch {}
  };

  useEffect(() => { fetchWallet(); fetchLogs(); }, []);

  const handleCharge = (method: string) => {
    if (selectedAmount <= 0) { Alert.alert('提示', '请选择充值金额'); return; }
    Alert.alert('确认充值', `充值 ${selectedAmount} 拼豆币（${method === 'wechat' ? '微信支付' : '支付宝'}）`, [
      { text: '取消', style: 'cancel' },
      { text: '确认', onPress: async () => {
        setCharging(true);
        try {
          await client.post('/wallet/charge', { amount: selectedAmount, method });
          hapticSuccess();
          toast.show(`充值成功！+${selectedAmount} 拼豆币`);
          fetchWallet();
          fetchLogs();
          setSelectedAmount(0);
        } catch (e: any) { Alert.alert('充值失败', e.message); }
        finally { setCharging(false); }
      }},
    ]);
  };

  return (
    <SafeAreaView style={[$.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <View style={[$.nav, { backgroundColor: colors.navBg, borderBottomColor: colors.navBorder }]}>
        <HoverView onPress={onBack} style={[$.navBtn, { backgroundColor: colors.inputBg }]} hoverScale={1.1} hoverLift={0}>
          <Feather name="arrow-left" size={fp(18)} color={colors.text} />
        </HoverView>
        <Text style={[$.navTitle, { color: colors.text }]}>拼豆币钱包</Text>
        <View style={{ width: wp(34) }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: wp(40) }}>
        {/* 余额卡片 */}
        <View style={[$.balanceCard, { backgroundColor: colors.accent }]}>
          <Text style={$.balanceLabel}>拼豆币余额</Text>
          <Text style={$.balanceValue}>{balance}</Text>
          <View style={$.balanceRow}>
            <View>
              <Text style={$.balanceSub}>累计充值</Text>
              <Text style={$.balanceSubVal}>{totalCharged}</Text>
            </View>
            <View>
              <Text style={$.balanceSub}>累计消费</Text>
              <Text style={$.balanceSubVal}>{totalSpent}</Text>
            </View>
          </View>
        </View>

        {/* 充值选项 */}
        <Text style={[$.secTitle, { color: colors.text }]}>选择充值金额</Text>
        <View style={$.chargeGrid}>
          {CHARGE_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.amount} activeOpacity={0.7}
              onPress={() => setSelectedAmount(opt.amount)}
              style={[$.chargeItem, {
                backgroundColor: selectedAmount === opt.amount ? colors.accent : colors.surface,
                borderColor: selectedAmount === opt.amount ? colors.accent : colors.border,
              }]}>
              <Text style={[$.chargeAmount, { color: selectedAmount === opt.amount ? '#fff' : colors.text }]}>
                {opt.label}
              </Text>
              <Text style={[$.chargePrice, { color: selectedAmount === opt.amount ? 'rgba(255,255,255,0.7)' : colors.textHint }]}>
                {opt.price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 支付方式 */}
        <Text style={[$.secTitle, { color: colors.text }]}>支付方式</Text>
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleCharge('wechat')} disabled={charging}
          style={[$.payBtn, { backgroundColor: '#07C160' }]}>
          <Feather name="message-circle" size={fp(18)} color="#fff" />
          <Text style={$.payBtnText}>微信支付</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={() => handleCharge('alipay')} disabled={charging}
          style={[$.payBtn, { backgroundColor: '#1677FF' }]}>
          <Feather name="credit-card" size={fp(18)} color="#fff" />
          <Text style={$.payBtnText}>支付宝</Text>
        </TouchableOpacity>

        {/* 流水记录 */}
        <Text style={[$.secTitle, { color: colors.text }]}>交易记录</Text>
        {logs.length === 0 ? (
          <Text style={[$.emptyText, { color: colors.textHint }]}>暂无记录</Text>
        ) : (
          logs.map((log: any) => (
            <View key={log.id} style={[$.logItem, { borderBottomColor: colors.divider }]}>
              <View style={{ flex: 1 }}>
                <Text style={[$.logDesc, { color: colors.text }]}>{log.description}</Text>
                <Text style={[$.logTime, { color: colors.textHint }]}>{log.createdAt?.slice(0, 16)}</Text>
              </View>
              <Text style={[$.logAmount, { color: log.amount > 0 ? '#22C55E' : '#EF4444' }]}>
                {log.amount > 0 ? '+' : ''}{log.amount}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <Toast message={toast.msg} />
    </SafeAreaView>
  );
};

const $ = StyleSheet.create({
  root: { flex: 1 },
  nav: { flexDirection: 'row', alignItems: 'center', height: wp(50), paddingHorizontal: PAD, borderBottomWidth: 1, gap: wp(10) },
  navTitle: { flex: 1, fontSize: fp(16), fontWeight: '700', textAlign: 'center' },
  navBtn: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center' },

  balanceCard: {
    marginHorizontal: PAD, marginTop: wp(16), borderRadius: wp(16),
    padding: wp(20), alignItems: 'center',
  },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fp(13) },
  balanceValue: { color: '#fff', fontSize: fp(40), fontWeight: '800', marginTop: wp(4) },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' as any, marginTop: wp(16), paddingTop: wp(12), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  balanceSub: { color: 'rgba(255,255,255,0.6)', fontSize: fp(11), textAlign: 'center' },
  balanceSubVal: { color: '#fff', fontSize: fp(16), fontWeight: '700', textAlign: 'center', marginTop: wp(2) },

  secTitle: { fontSize: fp(15), fontWeight: '700', paddingHorizontal: PAD, marginTop: wp(20), marginBottom: wp(10) },

  chargeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' },
  chargeItem: {
    width: '48%' as any, paddingVertical: wp(14), borderRadius: wp(12),
    borderWidth: 1, alignItems: 'center', marginBottom: wp(10),
  },
  chargeAmount: { fontSize: fp(20), fontWeight: '800' },
  chargePrice: { fontSize: fp(11), marginTop: wp(2) },

  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: PAD, marginBottom: wp(10), height: wp(48),
    borderRadius: wp(12), gap: wp(8),
  },
  payBtnText: { color: '#fff', fontSize: fp(15), fontWeight: '700' },

  emptyText: { textAlign: 'center', fontSize: fp(13), paddingVertical: wp(20) },

  logItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logDesc: { fontSize: fp(13), fontWeight: '500' },
  logTime: { fontSize: fp(10), marginTop: wp(2) },
  logAmount: { fontSize: fp(16), fontWeight: '800' },
});
