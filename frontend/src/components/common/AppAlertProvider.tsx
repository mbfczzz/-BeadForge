import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type AlertButton,
  type AlertOptions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { fp, wp } from '../../utils/responsive';

interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
  options?: AlertOptions;
}

const DEFAULT_BUTTONS: AlertButton[] = [{ text: 'OK' }];

function getIconName(title: string): keyof typeof Feather.glyphMap {
  if (/成功|完成|已保存|获取成功|支付成功|清理完成/.test(title)) return 'check-circle';
  if (/失败|错误|不足|无法|删除|退出|举报/.test(title)) return 'alert-triangle';
  return 'info';
}

export const AppAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors, dark } = useTheme();
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  const originalAlertRef = useRef(Alert.alert);

  useEffect(() => {
    Alert.alert = (title, message, buttons, options) => {
      setAlertState({
        title: String(title || ''),
        message: typeof message === 'string' ? message : undefined,
        buttons: buttons && buttons.length > 0 ? buttons : DEFAULT_BUTTONS,
        options,
      });
    };

    return () => {
      Alert.alert = originalAlertRef.current;
    };
  }, []);

  useEffect(() => {
    if (!alertState) {
      opacity.setValue(0);
      scale.setValue(0.96);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [alertState, opacity, scale]);

  const resolvedButtons = useMemo(() => {
    if (!alertState) return DEFAULT_BUTTONS;
    return alertState.buttons.length > 0 ? alertState.buttons : DEFAULT_BUTTONS;
  }, [alertState]);

  const close = (button?: AlertButton) => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setAlertState(null);
      if (button?.onPress) {
        setTimeout(() => button.onPress?.(), 0);
      }
    });
  };

  const dismiss = () => {
    if (alertState?.options?.cancelable === false) return;

    Animated.timing(opacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setAlertState(null);
      alertState?.options?.onDismiss?.();
    });
  };

  const iconName = alertState ? getIconName(alertState.title) : 'info';
  const destructive = resolvedButtons.some((button) => button.style === 'destructive');
  const iconColor = destructive ? colors.error : colors.accent;

  return (
    <>
      {children}
      <Modal visible={!!alertState} transparent statusBarTranslucent animationType="none" onRequestClose={dismiss}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                transform: [{ scale }],
              },
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: destructive ? `${colors.error}14` : colors.accentLight }]}>
              <Feather name={iconName} size={fp(22)} color={iconColor} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>{alertState?.title}</Text>
            {alertState?.message ? (
              <Text style={[styles.message, { color: colors.textSecondary }]}>{alertState.message}</Text>
            ) : null}

            <View style={[styles.buttonRow, resolvedButtons.length > 2 ? styles.buttonColumn : null]}>
              {resolvedButtons.map((button, index) => {
                const isCancel = button.style === 'cancel';
                const isDanger = button.style === 'destructive';
                const primary = !isCancel && index === resolvedButtons.length - 1;

                return (
                  <Pressable
                    key={`${button.text || 'OK'}-${index}`}
                    onPress={() => close(button)}
                    style={[
                      styles.button,
                      resolvedButtons.length > 2 ? styles.buttonFull : null,
                      {
                        backgroundColor: primary
                          ? isDanger
                            ? colors.error
                            : colors.accent
                          : dark
                            ? colors.inputBg
                            : '#F7FAFF',
                        borderColor: primary ? 'transparent' : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        {
                          color: primary
                            ? '#FFFFFF'
                            : isDanger
                              ? colors.error
                              : colors.textSecondary,
                        },
                      ]}
                    >
                      {button.text || 'OK'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(24),
  },
  card: {
    width: '100%',
    maxWidth: wp(340),
    borderRadius: wp(22),
    borderWidth: 1,
    paddingHorizontal: wp(18),
    paddingTop: wp(20),
    paddingBottom: wp(16),
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  iconWrap: {
    width: wp(48),
    height: wp(48),
    borderRadius: wp(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: wp(12),
  },
  title: {
    fontSize: fp(17),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: wp(8),
    fontSize: fp(13),
    lineHeight: fp(20),
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: wp(10),
    marginTop: wp(18),
  },
  buttonColumn: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    minHeight: wp(42),
    borderRadius: wp(14),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp(12),
  },
  buttonFull: {
    width: '100%',
    flex: 0,
  },
  buttonText: {
    fontSize: fp(13),
    fontWeight: '900',
  },
});
