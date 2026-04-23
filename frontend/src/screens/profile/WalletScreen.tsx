import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme, BorderRadius, candyShadow } from '../../theme';
import { HoverView } from '../../components/common';
import { Toast } from '../../components/common/Toast';
import { useToast, hapticSuccess, hapticLight } from '../../hooks/useFeedback';
import client from '../../api/client';
import { wp, fp } from '../../utils/responsive';
import { LinearGradient } from 'expo-linear-gradient';

const PAD = wp(16);

const CHARGE_OPTIONS = [
  { amount: 6, coins: 60, label: '60', badge: '' },
  { amount: 30, coins: 300, label: '300', badge: '' },
  { amount: 68, coins: 680, label: '680', badge: '热门' },
  { amount: 128, coins: 1280, label: '1280', badge: '' },
  { amount: 328, coins: 3280, label: '3280', badge: '超值' },
  { amount: 648, coins: 6480, label: '6480', badge: '' },
];

interface Props { onBack: () => void }

export const WalletScreen: React.FC<Props> = ({ onBack }) => {
  const { colors, dark } = useTheme();
  const toast = useToast();
  const [balance, setBalance] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [selected, setSelected] = useState(-1);
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');
  const [paying, setPaying] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [coinRate, setCoinRate] = useState(10);

  const fetchWallet = async () => {
    try {
      const res: any = await client.get('/wallet/balance');
      setBalance(res.data?.balance || 0);
      setTotalCharged(res.data?.totalCharged || 0);
      setTotalSpent(res.data?.totalSpent || 0);
    } catch {}
    try {
      const cfgRes: any = await client.get('/payment/config');
      setCoinRate(cfgRes.data?.coinRate || 10);
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const res: any = await client.get('/wallet/logs');
      setLogs(res.data || []);
    } catch {}
  };

  useEffect(() => { fetchWallet(); fetchLogs(); }, []);

  const handlePay = async () => {
    if (selected < 0) return;
    const opt = CHARGE_OPTIONS[selected];
    setPaying(true);
    try {
      // 1. 创建订单
      const orderRes: any = await client.post('/payment/create-order', {
        amount: opt.amount,
        method: payMethod,
      });
      const orderId = orderRes.data?.orderId;

      // 2. 模拟支付等待（真实支付会跳转微信/支付宝）
      await new Promise(r => setTimeout(r, 1500));

      // 3. 确认支付
      const confirmRes: any = await client.post('/payment/confirm', {
        orderId,
        amount: opt.amount,
        method: payMethod,
      });

      hapticSuccess();
      toast.show(`充值成功！+${confirmRes.data?.coins || opt.coins} 拼豆币`);
      setShowPay(false);
      setSelected(-1);
      fetchWallet();
      fetchLogs();
    } catch (e: any) {
      Alert.alert('支付失败', e.message);
    } finally {
      setPaying(false);
    }
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
        {/* 余额卡片 — 糖果渐变 */}
        <LinearGradient
          colors={dark ? ['#3D1F32', '#2A1A28'] as const : ['#FF8FB1', '#FFB894'] as const}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={[$.balanceCard, candyShadow(colors.accent, 'md')]}
        >
          <Text style={$.balanceLabel}>拼豆币余额 💎</Text>
          <View style={$.balanceValueRow}>
            <Feather name="hexagon" size={fp(22)} color="#FCD34D" />
            <Text style={$.balanceValue}>{balance}</Text>
          </View>
          <View style={$.balanceStatRow}>
            <View style={$.balanceStat}>
              <Text style={$.balanceStatLabel}>累计充值</Text>
              <Text style={$.balanceStatVal}>{totalCharged}</Text>
            </View>
            <View style={[$.balanceStatDivider]} />
            <View style={$.balanceStat}>
              <Text style={$.balanceStatLabel}>累计消费</Text>
              <Text style={$.balanceStatVal}>{totalSpent}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* 充值选项 */}
        <Text style={[$.secTitle, { color: colors.text }]}>选择充值</Text>
        <View style={$.chargeGrid}>
          {CHARGE_OPTIONS.map((opt, i) => {
            const on = i === selected;
            return (
              <TouchableOpacity key={opt.amount} activeOpacity={0.7}
                onPress={() => { hapticLight(); setSelected(i); }}
                style={[$.chargeItem, {
                  backgroundColor: on ? colors.accent : colors.surface,
                  borderColor: on ? colors.accent : colors.border,
                }]}>
                {opt.badge ? <View style={[$.chargeBadge, { backgroundColor: '#EF4444' }]}><Text style={$.chargeBadgeT}>{opt.badge}</Text></View> : null}
                <Feather name="hexagon" size={fp(14)} color={on ? '#FCD34D' : '#FBBF24'} />
                <Text style={[$.chargeCoins, { color: on ? '#fff' : colors.text }]}>{opt.label}</Text>
                <Text style={[$.chargePrice, { color: on ? 'rgba(255,255,255,0.7)' : colors.textHint }]}>¥{opt.amount}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 支付方式 */}
        {selected >= 0 && (
          <>
            <Text style={[$.secTitle, { color: colors.text }]}>支付方式</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => setPayMethod('wechat')}
              style={[$.payOption, { backgroundColor: colors.surface, borderColor: payMethod === 'wechat' ? '#07C160' : colors.border }]}>
              <View style={[$.payIcon, { backgroundColor: '#07C160' }]}>
                <Feather name="message-circle" size={fp(16)} color="#fff" />
              </View>
              <Text style={[$.payLabel, { color: colors.text }]}>微信支付</Text>
              <View style={{ flex: 1 }} />
              <View style={[$.radio, { borderColor: payMethod === 'wechat' ? '#07C160' : colors.border }]}>
                {payMethod === 'wechat' && <View style={[$.radioDot, { backgroundColor: '#07C160' }]} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7} onPress={() => setPayMethod('alipay')}
              style={[$.payOption, { backgroundColor: colors.surface, borderColor: payMethod === 'alipay' ? '#1677FF' : colors.border }]}>
              <View style={[$.payIcon, { backgroundColor: '#1677FF' }]}>
                <Feather name="credit-card" size={fp(16)} color="#fff" />
              </View>
              <Text style={[$.payLabel, { color: colors.text }]}>支付宝</Text>
              <View style={{ flex: 1 }} />
              <View style={[$.radio, { borderColor: payMethod === 'alipay' ? '#1677FF' : colors.border }]}>
                {payMethod === 'alipay' && <View style={[$.radioDot, { backgroundColor: '#1677FF' }]} />}
              </View>
            </TouchableOpacity>

            {/* 确认支付按钮 */}
            <TouchableOpacity activeOpacity={0.8} onPress={handlePay} disabled={paying}
              style={[$.payBtn, { backgroundColor: payMethod === 'wechat' ? '#07C160' : '#1677FF', opacity: paying ? 0.6 : 1 }]}>
              {paying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={$.payBtnText}>
                    {payMethod === 'wechat' ? '微信支付' : '支付宝支付'} ¥{CHARGE_OPTIONS[selected]?.amount}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={[$.payHint, { color: colors.textHint }]}>
              支付 ¥{CHARGE_OPTIONS[selected]?.amount} 获得 {CHARGE_OPTIONS[selected]?.coins} 拼豆币
            </Text>
          </>
        )}

        {/* 交易记录 */}
        <Text style={[$.secTitle, { color: colors.text }]}>交易记录</Text>
        {logs.length === 0 ? (
          <View style={$.emptyLogs}>
            <Feather name="inbox" size={fp(28)} color={colors.textHint} />
            <Text style={[$.emptyText, { color: colors.textHint }]}>暂无交易记录</Text>
          </View>
        ) : (
          logs.map((log: any) => (
            <View key={log.id} style={[$.logItem, { borderBottomColor: colors.divider }]}>
              <View style={[$.logIcon, { backgroundColor: log.amount > 0 ? colors.candy.mint + '40' : colors.accentLight }]}>
                <Feather name={log.amount > 0 ? 'arrow-down-left' : 'arrow-up-right'} size={fp(14)} color={log.amount > 0 ? colors.success : colors.error} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[$.logDesc, { color: colors.text }]} numberOfLines={1}>{log.description}</Text>
                <Text style={[$.logTime, { color: colors.textHint }]}>{log.createdAt?.replace('T', ' ').slice(0, 16)}</Text>
              </View>
              <Text style={[$.logAmount, { color: log.amount > 0 ? colors.success : colors.error }]}>
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

  // 余额
  balanceCard: { marginHorizontal: PAD, marginTop: wp(14), borderRadius: wp(24), padding: wp(22) },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: fp(12) },
  balanceValueRow: { flexDirection: 'row', alignItems: 'center', gap: wp(6), marginTop: wp(6) },
  balanceValue: { color: '#fff', fontSize: fp(36), fontWeight: '800' },
  balanceStatRow: { flexDirection: 'row', marginTop: wp(16), paddingTop: wp(12), borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: fp(11) },
  balanceStatVal: { color: '#fff', fontSize: fp(16), fontWeight: '700', marginTop: wp(2) },
  balanceStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },

  secTitle: { fontSize: fp(15), fontWeight: '700', paddingHorizontal: PAD, marginTop: wp(20), marginBottom: wp(10) },

  // 充值选项
  chargeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: PAD, justifyContent: 'space-between' },
  chargeItem: {
    width: '31%' as any, paddingVertical: wp(16), borderRadius: wp(18),
    borderWidth: 1.5, alignItems: 'center', marginBottom: wp(10),
  },
  chargeBadge: { position: 'absolute', top: -wp(1), right: wp(6), paddingHorizontal: wp(5), paddingVertical: wp(1), borderRadius: wp(4) },
  chargeBadgeT: { color: '#fff', fontSize: fp(8), fontWeight: '700' },
  chargeCoins: { fontSize: fp(18), fontWeight: '800', marginTop: wp(4) },
  chargePrice: { fontSize: fp(11), marginTop: wp(2) },

  // 支付方式
  payOption: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: PAD, marginBottom: wp(10),
    padding: wp(14), borderRadius: wp(18), borderWidth: 1.5,
  },
  payIcon: { width: wp(36), height: wp(36), borderRadius: wp(18), justifyContent: 'center', alignItems: 'center', marginRight: wp(12) },
  payLabel: { fontSize: fp(14), fontWeight: '600' },
  radio: { width: wp(20), height: wp(20), borderRadius: wp(10), borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: wp(10), height: wp(10), borderRadius: wp(5) },

  payBtn: {
    marginHorizontal: PAD, marginTop: wp(6), height: wp(52),
    borderRadius: wp(9999), justifyContent: 'center', alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontSize: fp(16), fontWeight: '700' },
  payHint: { textAlign: 'center', fontSize: fp(11), marginTop: wp(8) },

  // 记录
  emptyLogs: { alignItems: 'center', paddingVertical: wp(30) },
  emptyText: { fontSize: fp(13), marginTop: wp(8) },
  logItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: PAD, paddingVertical: wp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logIcon: { width: wp(34), height: wp(34), borderRadius: wp(17), justifyContent: 'center', alignItems: 'center', marginRight: wp(10) },
  logDesc: { fontSize: fp(13), fontWeight: '500' },
  logTime: { fontSize: fp(10), marginTop: wp(2) },
  logAmount: { fontSize: fp(16), fontWeight: '800' },
});
