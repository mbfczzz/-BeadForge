import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';
import { AppHeader, Avatar } from '../../components/common';
import { useTheme } from '../../theme';
import type { RootScreenProps } from '../../navigation/types';
import type { CommunityUserData } from '../../api/community';
import { userApi } from '../../api/user';
import { directMessageApi, type DmMessageItem } from '../../api/directMessage';
import { fp, wp } from '../../utils/responsive';
import { shadow } from '../../utils/shadow';

type MessageItem = DmMessageItem;

export const DirectMessageScreen: React.FC<RootScreenProps<'DirectMessage'>> = ({ route, navigation }) => {
  const { userName } = route.params;
  const { colors, dark } = useTheme();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState<CommunityUserData>(() => ({
    id: null,
    name: userName,
    title: '创作者',
    bio: '',
    followers: 0,
    following: 0,
    posts: 0,
    likes: 0,
    joinDate: '',
    tags: [],
  }));

  useEffect(() => {
    let alive = true;
    userApi
      .getCommunityProfile(userName)
      .then((res) => { if (alive && res.data) setUser(res.data); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [userName]);

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let alive = true;
    directMessageApi.threadByName(userName)
      .then((res) => {
        if (!alive) return;
        setMessages(res.data?.messages || []);
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [userName]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const localId = `local-${Date.now()}`;
    setMessages((current) => [
      ...current,
      { id: localId, fromMe: true, text, time: '刚刚' },
    ]);
    setDraft('');
    try {
      const res = await directMessageApi.send(userName, text);
      if (res.data) {
        setMessages((current) => current.map((m) => (m.id === localId ? res.data : m)));
      }
    } catch {
      // 失败回退
      setMessages((current) => current.filter((m) => m.id !== localId));
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top']}>
      <AppHeader
        title={user.name}
        onBack={() => navigation.goBack()}
      />

      <View style={[styles.profileStrip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Avatar name={user.name} size={wp(42)} />
        <View style={styles.profileMain}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.profileMeta, { color: colors.textHint }]}>{user.title} · {user.posts} 条动态</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('UserProfile', { userName: user.name })}
          style={[styles.profileButton, { backgroundColor: colors.inputBg }]}
        >
          <Text style={[styles.profileButtonText, { color: colors.textSecondary }]}>主页</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.fromMe ? styles.messageRowMe : null]}>
              {!item.fromMe ? <Avatar name={user.name} size={wp(30)} /> : null}
              <View style={styles.messageStack}>
                {item.attachment ? (
                  <View
                    style={[
                      styles.attachmentCard,
                      {
                        backgroundColor: item.attachment === 'gif' ? '#FFF1F2' : '#EFF6FF',
                        alignSelf: item.fromMe ? 'flex-end' : 'flex-start',
                      },
                    ]}
                  >
                    <MCI
                      name={item.attachment === 'gif' ? 'motion-play-outline' : 'image-multiple-outline'}
                      size={fp(22)}
                      color={item.attachment === 'gif' ? '#E11D48' : '#2563EB'}
                    />
                    <Text style={[styles.attachmentText, { color: colors.text }]}>
                      {item.attachment === 'gif' ? '动图预览' : '多图作品'}
                    </Text>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    item.fromMe
                      ? { backgroundColor: '#3B82F6', borderTopRightRadius: wp(8) }
                      : { backgroundColor: colors.surface, borderColor: colors.border, borderTopLeftRadius: wp(8) },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: item.fromMe ? '#FFFFFF' : colors.text }]}>
                    {item.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageTime,
                    { color: colors.textHint, textAlign: item.fromMe ? 'right' : 'left' },
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            </View>
          )}
        />

        <View
          style={[
            styles.composer,
            {
              backgroundColor: colors.navBg,
              borderTopColor: colors.navBorder,
              paddingBottom: Math.max(insets.bottom, wp(10)),
            },
          ]}
        >
          {/* 图片消息功能尚未做完，先不渲染按钮，避免"看似可点"的死按钮 */}
          <View style={[styles.inputWrap, { backgroundColor: colors.inputBg }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="发一条私信..."
              placeholderTextColor={colors.textHint}
              style={[styles.input, { color: colors.text }]}
              multiline
              textAlignVertical="top"
            />
          </View>
          <Pressable
            onPress={sendMessage}
            style={[
              styles.sendButton,
              { backgroundColor: draft.trim() ? '#3B82F6' : colors.border },
            ]}
          >
            <MCI name="send" size={fp(17)} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  onlinePill: {
    minHeight: wp(28),
    borderRadius: wp(14),
    paddingHorizontal: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(5),
  },
  onlineDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: fp(10),
    fontWeight: '800',
  },
  profileStrip: {
    marginHorizontal: wp(12),
    marginTop: wp(6),
    marginBottom: wp(8),
    borderRadius: wp(16),
    borderWidth: 1,
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
    flexDirection: 'row',
    alignItems: 'center',
    ...shadow(2, 8, 0.025, '#0F172A', 1),
  },
  profileMain: {
    flex: 1,
    marginLeft: wp(10),
  },
  profileName: {
    fontSize: fp(14),
    fontWeight: '900',
  },
  profileMeta: {
    marginTop: wp(3),
    fontSize: fp(11),
  },
  profileButton: {
    minWidth: wp(54),
    height: wp(30),
    borderRadius: wp(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
  messageList: {
    paddingHorizontal: wp(12),
    paddingTop: wp(6),
    paddingBottom: wp(14),
    gap: wp(12),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wp(8),
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageStack: {
    maxWidth: '78%',
  },
  bubble: {
    borderRadius: wp(18),
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: wp(12),
    paddingVertical: wp(10),
  },
  bubbleText: {
    fontSize: fp(13),
    lineHeight: fp(19),
  },
  messageTime: {
    marginTop: wp(4),
    fontSize: fp(10),
  },
  attachmentCard: {
    minWidth: wp(118),
    minHeight: wp(74),
    borderRadius: wp(16),
    paddingHorizontal: wp(12),
    marginBottom: wp(7),
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(6),
  },
  attachmentText: {
    fontSize: fp(11),
    fontWeight: '800',
  },
  composer: {
    borderTopWidth: 1,
    paddingHorizontal: wp(10),
    paddingTop: wp(9),
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: wp(8),
  },
  toolButton: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    minHeight: wp(38),
    maxHeight: wp(92),
    borderRadius: wp(19),
    paddingHorizontal: wp(12),
    justifyContent: 'center',
  },
  input: {
    fontSize: fp(13),
    lineHeight: fp(18),
    paddingVertical: wp(8),
  },
  sendButton: {
    width: wp(38),
    height: wp(38),
    borderRadius: wp(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
