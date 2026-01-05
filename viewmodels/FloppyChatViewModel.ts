import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ChatMessage } from '../models/Chat';
import FloppyAIService from '../services/FloppyAIService';

export const useFloppyChatViewModel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Bonjour ! 👋 Je suis Floppy, ton assistant de voyage personnel ! Comment puis-je t'aider à planifier tes prochaines vacances de rêve ?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await FloppyAIService.sendMessage(text.trim());

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Oups ! J'ai eu un petit problème. 😅 Peux-tu réessayer ?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    FloppyAIService.clearHistory();
    setMessages([
      {
        id: '1',
        text: "Conversation réinitialisée ! 🔄 Comment puis-je t'aider maintenant ?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const sendQuickReply = async (reply: string) => {
    await sendMessage(reply);
  };

  return {
    messages,
    isTyping,
    inputText,
    setInputText,
    sendMessage,
    clearChat,
    sendQuickReply,
    isConfigured: FloppyAIService.isConfigured(),
  };
};
