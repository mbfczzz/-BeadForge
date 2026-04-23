import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { addressRegionApi, buildRegionSelection } from '../../api/address';
import type { ProfileAddressItem } from '../../api/profile';
import type { AddressRegionNode } from '../../mock/address';
import { AppHeader, SurfaceCard, Toggle } from '../../components/common';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface Props {
  onBack: () => void;
  addresses: ProfileAddressItem[];
  onCreate: (data: Omit<ProfileAddressItem, 'id'>) => void;
  onUpdate: (id: string, data: Omit<ProfileAddressItem, 'id'>) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

type DraftAddress = {
  receiver: string;
  phone: string;
  region: string;
  detail: string;
  tag: string;
  isDefault: boolean;
};

const EMPTY_DRAFT: DraftAddress = {
  receiver: '',
  phone: '',
  region: '',
  detail: '',
  tag: '',
  isDefault: false,
};

const TAG_OPTIONS = ['家', '公司', '学校'];

function normalizePhone(value: string) {
  return value.replace(/\s+/g, '');
}

function normalizeDraft(draft: DraftAddress) {
  return {
    receiver: draft.receiver.trim(),
    phone: normalizePhone(draft.phone),
    region: draft.region.trim(),
    detail: draft.detail.trim(),
    tag: draft.tag.trim(),
    isDefault: draft.isDefault,
  };
}

function getRegionSelection(region: string, tree: AddressRegionNode[]) {
  const [provinceName, cityName, districtName] = region.split(' ').filter(Boolean);
  const province = tree.find((item) => item.name === provinceName) ?? tree[0];
  const city = province?.children?.find((item) => item.name === cityName) ?? province?.children?.[0];
  const district = city?.children?.find((item) => item.name === districtName) ?? city?.children?.[0];

  return {
    province: province?.name || '',
    city: city?.name || '',
    district: district?.name || '',
  };
}

export const AddressScreen: React.FC<Props> = ({
  onBack,
  addresses,
  onCreate,
  onUpdate,
  onDelete,
  onSetDefault,
}) => {
  const { colors } = useTheme();
  const [editorVisible, setEditorVisible] = useState(false);
  const [regionPickerVisible, setRegionPickerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftAddress>(EMPTY_DRAFT);
  const [initialDraft, setInitialDraft] = useState<DraftAddress>(EMPTY_DRAFT);
  const [toastMessage, setToastMessage] = useState('');
  const [regionTree, setRegionTree] = useState<AddressRegionNode[]>(addressRegionApi.getFallbackRegionTree());
  const fallbackTree = addressRegionApi.getFallbackRegionTree();
  const [tempProvince, setTempProvince] = useState(fallbackTree[0]?.name || '');
  const [tempCity, setTempCity] = useState(fallbackTree[0]?.children?.[0]?.name || '');
  const [tempDistrict, setTempDistrict] = useState(fallbackTree[0]?.children?.[0]?.children?.[0]?.name || '');

  useEffect(() => {
    let active = true;
    void addressRegionApi.getRegionTree().then((nextTree) => {
      if (active && nextTree.length > 0) {
        setRegionTree(nextTree);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = setTimeout(() => setToastMessage(''), 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault))),
    [addresses],
  );

  const provinceOptions = regionTree;
  const cityOptions = useMemo(
    () => regionTree.find((item) => item.name === tempProvince)?.children ?? regionTree[0]?.children ?? [],
    [regionTree, tempProvince],
  );
  const districtOptions = useMemo(
    () => cityOptions.find((item) => item.name === tempCity)?.children ?? cityOptions[0]?.children ?? [],
    [cityOptions, tempCity],
  );

  const isDirty = useMemo(
    () => JSON.stringify(normalizeDraft(draft)) !== JSON.stringify(normalizeDraft(initialDraft)),
    [draft, initialDraft],
  );

  const showToast = (message: string) => setToastMessage(message);

  const closeEditor = () => {
    setEditorVisible(false);
    setRegionPickerVisible(false);
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setInitialDraft(EMPTY_DRAFT);
  };

  const requestCloseEditor = () => {
    if (regionPickerVisible) {
      setRegionPickerVisible(false);
      return;
    }

    if (!isDirty) {
      closeEditor();
      return;
    }

    Alert.alert('放弃修改？', '当前地址内容还没有保存，返回后将丢失。', [
      { text: '继续编辑', style: 'cancel' },
      { text: '放弃', style: 'destructive', onPress: closeEditor },
    ]);
  };

  const openCreate = () => {
    const nextDraft = { ...EMPTY_DRAFT, isDefault: addresses.length === 0 };
    setEditingId(null);
    setDraft(nextDraft);
    setInitialDraft(nextDraft);
    setEditorVisible(true);
  };

  const openEdit = (item: ProfileAddressItem) => {
    const nextDraft: DraftAddress = {
      receiver: item.receiver,
      phone: item.phone,
      region: item.region,
      detail: item.detail,
      tag: item.tag || '',
      isDefault: Boolean(item.isDefault),
    };
    setEditingId(item.id);
    setDraft(nextDraft);
    setInitialDraft(nextDraft);
    setEditorVisible(true);
  };

  const openRegionPicker = () => {
    const selection = getRegionSelection(draft.region, regionTree);
    setTempProvince(selection.province);
    setTempCity(selection.city);
    setTempDistrict(selection.district);
    setRegionPickerVisible(true);
  };

  const applyRegionSelection = () => {
    const province = provinceOptions.find((item) => item.name === tempProvince);
    const city = cityOptions.find((item) => item.name === tempCity);
    const district = districtOptions.find((item) => item.name === tempDistrict);

    if (!province || !city || !district) {
      return;
    }

    const selection = buildRegionSelection(province, city, district);
    setDraft((current) => ({ ...current, region: selection.text }));
    setRegionPickerVisible(false);
  };

  const saveAddress = () => {
    const payload = {
      receiver: draft.receiver.trim(),
      phone: normalizePhone(draft.phone),
      region: draft.region.trim(),
      detail: draft.detail.trim(),
      tag: draft.tag.trim() || undefined,
      isDefault: draft.isDefault,
    };

    if (!payload.receiver || !payload.phone || !payload.region || !payload.detail) {
      Alert.alert('信息不完整', '请补全收件人、手机号、地区和详细地址。');
      return;
    }

    if (!/^1\\d{10}$/.test(payload.phone)) {
      Alert.alert('手机号格式错误', '请输入正确的 11 位手机号。');
      return;
    }

    if (editingId) {
      onUpdate(editingId, payload);
      showToast('地址已更新');
    } else {
      onCreate(payload);
      showToast('地址已新增');
    }

    closeEditor();
  };

  const confirmDelete = (id: string) => {
    const target = addresses.find((item) => item.id === id);
    const fallbackDefault = sortedAddresses.find((item) => item.id !== id);

    Alert.alert('删除地址', '删除后不可恢复，确认继续吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: () => {
          onDelete(id);
          if (target?.isDefault && fallbackDefault) {
            showToast(`地址已删除，已自动将“${fallbackDefault.receiver}”设为默认`);
            return;
          }
          showToast('地址已删除');
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    onSetDefault(id);
    showToast('默认地址已更新');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader
        title="收货地址管理"
        onBack={onBack}
        right={(
          <TouchableOpacity activeOpacity={0.82} onPress={openCreate}>
            <Text style={[styles.headerAction, { color: colors.accent }]}>新增</Text>
          </TouchableOpacity>
        )}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sortedAddresses.length === 0 ? (
          <SurfaceCard style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name="map-pin" size={18} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>还没有收货地址</Text>
            <Text style={[styles.emptyDesc, { color: colors.textHint }]}>
              新增后下单时可以快速选择，也支持设置默认地址。
            </Text>
            <TouchableOpacity activeOpacity={0.88} onPress={openCreate} style={[styles.emptyButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.emptyButtonText}>新增地址</Text>
            </TouchableOpacity>
          </SurfaceCard>
        ) : null}

        {sortedAddresses.map((item) => (
          <SurfaceCard key={item.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.userRow}>
                <Text style={[styles.receiver, { color: colors.text }]}>{item.receiver}</Text>
                <Text style={[styles.phone, { color: colors.textSecondary }]}>{item.phone}</Text>
              </View>
              {!item.isDefault ? (
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() => handleSetDefault(item.id)}
                  style={[styles.defaultActionBtn, { backgroundColor: colors.accentLight }]}
                >
                  <Text style={[styles.defaultActionText, { color: colors.accent }]}>设为默认</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.addressRow}>
              {item.tag ? (
                <View style={[styles.tagBadge, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>{item.tag}</Text>
                </View>
              ) : null}
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                {item.region} {item.detail}
              </Text>
            </View>

            <View style={[styles.actionRow, { borderTopColor: colors.divider }]}>
              {item.isDefault ? (
                <View style={[styles.defaultBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.defaultText, { color: colors.accent }]}>默认</Text>
                </View>
              ) : (
                <View />
              )}

              <View style={styles.actionGroup}>
                <TouchableOpacity activeOpacity={0.82} onPress={() => openEdit(item)} style={styles.actionBtn}>
                  <Feather name="edit-3" size={15} color={colors.textSecondary} />
                  <Text style={[styles.actionText, { color: colors.textSecondary }]}>编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.82} onPress={() => confirmDelete(item.id)} style={styles.actionBtn}>
                  <Feather name="trash-2" size={15} color={colors.error} />
                  <Text style={[styles.actionText, { color: colors.error }]}>删除</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SurfaceCard>
        ))}
      </ScrollView>

      <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={requestCloseEditor}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={requestCloseEditor}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => undefined}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{editingId ? '编辑地址' : '新增地址'}</Text>
              <TouchableOpacity activeOpacity={0.82} onPress={requestCloseEditor}>
                <Text style={[styles.sheetClose, { color: colors.textHint }]}>关闭</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>收件人</Text>
                <TextInput
                  value={draft.receiver}
                  onChangeText={(receiver) => setDraft((current) => ({ ...current, receiver }))}
                  placeholder="请输入收件人姓名"
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>手机号</Text>
                <TextInput
                  value={draft.phone}
                  onChangeText={(phone) => setDraft((current) => ({ ...current, phone }))}
                  keyboardType="phone-pad"
                  maxLength={11}
                  placeholder="请输入 11 位手机号"
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>地区</Text>
                <TouchableOpacity activeOpacity={0.82} onPress={openRegionPicker} style={[styles.selector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                  <Text style={[styles.selectorText, { color: draft.region ? colors.text : colors.textHint }]}>
                    {draft.region || '请选择省 / 市 / 区'}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.textHint} />
                </TouchableOpacity>
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>详细地址</Text>
                <TextInput
                  value={draft.detail}
                  onChangeText={(detail) => setDraft((current) => ({ ...current, detail }))}
                  placeholder="街道门牌、楼栋房号等"
                  placeholderTextColor={colors.textHint}
                  multiline
                  textAlignVertical="top"
                  style={[styles.textarea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>地址标签</Text>
                <TextInput
                  value={draft.tag}
                  onChangeText={(tag) => setDraft((current) => ({ ...current, tag }))}
                  placeholder="例如：家 / 公司"
                  placeholderTextColor={colors.textHint}
                  style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                />
                <View style={styles.tagOptionRow}>
                  {TAG_OPTIONS.map((item) => {
                    const active = draft.tag === item;
                    return (
                      <TouchableOpacity
                        key={item}
                        activeOpacity={0.82}
                        onPress={() => setDraft((current) => ({ ...current, tag: item }))}
                        style={[styles.tagOption, { backgroundColor: active ? colors.accentLight : colors.inputBg, borderColor: active ? colors.accent : colors.border }]}
                      >
                        <Text style={[styles.tagOptionText, { color: active ? colors.accent : colors.textSecondary }]}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={[styles.defaultRow, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <View style={styles.defaultTextWrap}>
                  <Text style={[styles.defaultRowTitle, { color: colors.text }]}>设为默认地址</Text>
                  <Text style={[styles.defaultRowDesc, { color: colors.textHint }]}>下单时优先使用这条地址</Text>
                </View>
                <Toggle value={draft.isDefault} onValueChange={(value) => setDraft((current) => ({ ...current, isDefault: value }))} />
              </View>
            </ScrollView>

            <TouchableOpacity activeOpacity={0.88} onPress={saveAddress} style={[styles.saveButton, { backgroundColor: colors.accent }]}>
              <Text style={styles.saveText}>{editingId ? '保存修改' : '保存地址'}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={regionPickerVisible} animationType="fade" transparent onRequestClose={() => setRegionPickerVisible(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={() => setRegionPickerVisible(false)}>
          <Pressable style={[styles.regionSheet, { backgroundColor: colors.surface }]} onPress={() => undefined}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>选择地区</Text>
              <TouchableOpacity activeOpacity={0.82} onPress={() => setRegionPickerVisible(false)}>
                <Text style={[styles.sheetClose, { color: colors.textHint }]}>关闭</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.regionPreview, { backgroundColor: colors.inputBg }]}>
              <Text style={[styles.regionPreviewText, { color: colors.text }]}>{`${tempProvince} ${tempCity} ${tempDistrict}`}</Text>
            </View>

            <View style={styles.regionColumns}>
              <ScrollView style={[styles.regionColumn, { borderColor: colors.divider }]} showsVerticalScrollIndicator={false}>
                {provinceOptions.map((item) => {
                  const active = item.name === tempProvince;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      activeOpacity={0.82}
                      onPress={() => {
                        const nextCity = item.children?.[0];
                        setTempProvince(item.name);
                        setTempCity(nextCity?.name || '');
                        setTempDistrict(nextCity?.children?.[0]?.name || '');
                      }}
                      style={[styles.regionOption, active && { backgroundColor: colors.accentLight }]}
                    >
                      <Text style={[styles.regionOptionText, { color: active ? colors.accent : colors.textSecondary }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView style={[styles.regionColumn, { borderColor: colors.divider }]} showsVerticalScrollIndicator={false}>
                {cityOptions.map((item) => {
                  const active = item.name === tempCity;
                  return (
                    <TouchableOpacity
                      key={item.name}
                      activeOpacity={0.82}
                      onPress={() => {
                        setTempCity(item.name);
                        setTempDistrict(item.children?.[0]?.name || '');
                      }}
                      style={[styles.regionOption, active && { backgroundColor: colors.accentLight }]}
                    >
                      <Text style={[styles.regionOptionText, { color: active ? colors.accent : colors.textSecondary }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <ScrollView style={styles.regionColumn} showsVerticalScrollIndicator={false}>
                {districtOptions.map((item) => {
                  const active = item.name === tempDistrict;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      activeOpacity={0.82}
                      onPress={() => setTempDistrict(item.name)}
                      style={[styles.regionOption, active && { backgroundColor: colors.accentLight }]}
                    >
                      <Text style={[styles.regionOptionText, { color: active ? colors.accent : colors.textSecondary }]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity activeOpacity={0.88} onPress={applyRegionSelection} style={[styles.saveButton, { backgroundColor: colors.accent, marginTop: wp(16) }]}>
              <Text style={styles.saveText}>确认地区</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {toastMessage ? (
        <View pointerEvents="none" style={styles.toastWrap}>
          <View style={[styles.toast, { backgroundColor: colors.text }]}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: wp(16), paddingTop: wp(12), paddingBottom: wp(40) },
  headerAction: { fontSize: fp(14), fontWeight: '700' },
  emptyCard: { alignItems: 'center', marginBottom: wp(12) },
  emptyIcon: { width: wp(44), height: wp(44), borderRadius: wp(22), alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { marginTop: wp(12), fontSize: fp(15), fontWeight: '700' },
  emptyDesc: { marginTop: wp(8), fontSize: fp(12), lineHeight: fp(18), textAlign: 'center' },
  emptyButton: { marginTop: wp(16), minWidth: wp(108), height: wp(40), borderRadius: wp(14), alignItems: 'center', justifyContent: 'center' },
  emptyButtonText: { color: '#FFFFFF', fontSize: fp(13), fontWeight: '800' },
  card: { marginBottom: wp(12) },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: wp(10) },
  userRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: wp(10) },
  receiver: { fontSize: fp(15), fontWeight: '700' },
  phone: { fontSize: fp(13) },
  defaultActionBtn: { minWidth: wp(72), height: wp(28), paddingHorizontal: wp(10), borderRadius: wp(999), alignItems: 'center', justifyContent: 'center' },
  defaultActionText: { fontSize: fp(11), fontWeight: '700' },
  defaultBadge: { paddingHorizontal: wp(10), paddingVertical: wp(5), borderRadius: wp(999) },
  defaultText: { fontSize: fp(10), fontWeight: '700' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: wp(12) },
  tagBadge: { marginRight: wp(8), paddingHorizontal: wp(8), paddingVertical: wp(4), borderRadius: wp(999), borderWidth: 1 },
  tagText: { fontSize: fp(10), fontWeight: '700' },
  addressText: { flex: 1, fontSize: fp(13), lineHeight: fp(20) },
  actionRow: { marginTop: wp(14), paddingTop: wp(12), borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: wp(14) },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: wp(5), fontSize: fp(12), fontWeight: '600' },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(20) },
  regionSheet: { borderTopLeftRadius: wp(24), borderTopRightRadius: wp(24), paddingHorizontal: wp(16), paddingTop: wp(16), paddingBottom: wp(20) },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: wp(10) },
  sheetTitle: { fontSize: fp(16), fontWeight: '800' },
  sheetClose: { fontSize: fp(13), fontWeight: '600' },
  field: { marginTop: wp(12) },
  fieldLabel: { marginBottom: wp(8), fontSize: fp(13), fontWeight: '700' },
  input: { height: wp(44), borderRadius: wp(14), borderWidth: 1, paddingHorizontal: wp(14), fontSize: fp(14) },
  selector: { height: wp(44), borderRadius: wp(14), borderWidth: 1, paddingHorizontal: wp(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorText: { fontSize: fp(14) },
  textarea: { minHeight: wp(96), borderRadius: wp(16), borderWidth: 1, paddingHorizontal: wp(14), paddingVertical: wp(12), fontSize: fp(14) },
  tagOptionRow: { marginTop: wp(10), flexDirection: 'row', flexWrap: 'wrap', gap: wp(8) },
  tagOption: { paddingHorizontal: wp(12), paddingVertical: wp(7), borderRadius: wp(999), borderWidth: 1 },
  tagOptionText: { fontSize: fp(12), fontWeight: '600' },
  defaultRow: { marginTop: wp(14), borderRadius: wp(16), borderWidth: 1, paddingHorizontal: wp(14), paddingVertical: wp(12), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: wp(12) },
  defaultTextWrap: { flex: 1 },
  defaultRowTitle: { fontSize: fp(14), fontWeight: '700' },
  defaultRowDesc: { marginTop: wp(4), fontSize: fp(12) },
  regionPreview: { borderRadius: wp(14), paddingHorizontal: wp(14), paddingVertical: wp(12) },
  regionPreviewText: { fontSize: fp(13), fontWeight: '700' },
  regionColumns: { marginTop: wp(14), flexDirection: 'row', gap: wp(10) },
  regionColumn: { flex: 1, maxHeight: wp(220), borderRadius: wp(16), borderWidth: 1 },
  regionOption: { minHeight: wp(44), alignItems: 'center', justifyContent: 'center', paddingHorizontal: wp(10) },
  regionOptionText: { fontSize: fp(12), fontWeight: '600', textAlign: 'center' },
  saveButton: { marginTop: wp(18), height: wp(44), borderRadius: wp(14), alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#FFFFFF', fontSize: fp(14), fontWeight: '800' },
  toastWrap: { position: 'absolute', left: 0, right: 0, bottom: wp(32), alignItems: 'center' },
  toast: { borderRadius: wp(999), paddingHorizontal: wp(16), paddingVertical: wp(10) },
  toastText: { color: '#FFFFFF', fontSize: fp(12), fontWeight: '700' },
});
