import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useFloppyChatViewModel } from '../viewmodels/FloppyChatViewModel';

interface FloppyChatProps {
  isOpen: boolean;
  onClose: () => void;
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function FloppyChat({ isOpen, onClose }: FloppyChatProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    messages,
    isTyping,
    inputText,
    setInputText,
    sendMessage,
    clearChat,
    sendQuickReply,
    isConfigured,
  } = useFloppyChatViewModel();

  const quickReplies = [
    '🏖️ Destinations plage',
    '⛰️ Destinations montagne',
    '💰 Budget 150$/nuit',
    '🌟 Recommandations',
  ];

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 90,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1000,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, slideAnim, backdropOpacity]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (inputText.trim()) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      sendMessage(inputText);
      Keyboard.dismiss();
    }
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Animated.View 
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1} 
          onPress={handleClose}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.container,
          { 
            backgroundColor: colors.background,
            transform: [{ translateY: slideAnim }],
            paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, keyboardHeight) : keyboardHeight,
          },
        ]}
      >
        <View style={styles.handleBar}>
          <View style={styles.handle} />
        </View>
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.floppyAvatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.floppyEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Floppy</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {isConfigured ? 'Assistant IA' : 'Mode démo'}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.card }]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                clearChat();
              }}
            >
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.headerButton, { backgroundColor: colors.card }]} 
              onPress={handleClose}
            >
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.botBubble,
                { backgroundColor: message.isUser ? colors.primary : colors.card },
              ]}
            >
              {!message.isUser && (
                <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarEmoji}>🤖</Text>
                </View>
              )}
              <View style={styles.messageContent}>
                <Text
                  style={[
                    styles.messageText,
                    { color: message.isUser ? '#fff' : colors.text },
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: colors.card }]}>
              <View style={[styles.avatarSmall, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarEmoji}>🤖</Text>
              </View>
              <View style={styles.messageContent}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                  <View style={[styles.typingDot, { backgroundColor: colors.textSecondary }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {messages.length <= 2 && (
          <View style={[styles.quickRepliesContainer, { backgroundColor: colors.background }]}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickRepliesContent}
            >
              {quickReplies.map((reply, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickReply, { backgroundColor: colors.card, borderColor: colors.primary }]}
                  onPress={() => sendQuickReply(reply)}
                >
                  <Text style={[styles.quickReplyText, { color: colors.primary }]}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <SafeAreaView edges={['bottom']} style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Message..."
              placeholderTextColor={colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              enablesReturnKeyAutomatically
              blurOnSubmit={false}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: inputText.trim() ? colors.primary : 'transparent',
                  transform: [{ scale: inputText.trim() ? 1 : 0.8 }],
                }
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="arrow-up-circle" 
                size={32} 
                color={inputText.trim() ? '#fff' : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '92%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  handleBar: {
    paddingTop: 8,
    paddingBottom: 4,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floppyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  floppyEmoji: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '80%',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  messageContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  botBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickRepliesContainer: {
    paddingVertical: 10,
  },
  quickRepliesContent: {
    paddingHorizontal: 16,
  },
  quickReply: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 8,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 17,
    lineHeight: 21,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 4,
    letterSpacing: -0.4,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
