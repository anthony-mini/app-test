import { useCallback, useEffect, useState } from 'react';
import { ChatMessage } from '../models/ChatMessage';
import { Host } from '../models/Host';
import ChatService from '../services/ChatService';
import DatabaseService from '../services/DatabaseService';

export const useChatViewModel = (destinationId: string, openAiApiKey?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [host, setHost] = useState<Host | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadChatData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [hostData, chatMessages] = await Promise.all([
        DatabaseService.getHostByDestinationId(destinationId),
        DatabaseService.getChatMessages(destinationId),
      ]);

      setHost(hostData);
      setMessages(chatMessages);
    } catch (err) {
      if (__DEV__) console.error('Error loading chat data:', err);
      setError('Erreur lors du chargement de la conversation');
    } finally {
      setIsLoading(false);
    }
  }, [destinationId]);

  useEffect(() => {
    loadChatData();
  }, [loadChatData]);

  useEffect(() => {
    if (openAiApiKey) {
      ChatService.setApiKey(openAiApiKey);
    }
  }, [openAiApiKey]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !host) return;

    setIsSending(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      destinationId,
      role: 'user',
      content: content.trim(),
      timestamp: Math.floor(Date.now() / 1000),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      await DatabaseService.saveChatMessage(destinationId, 'user', content.trim());

      const assistantResponse = await ChatService.sendMessage(
        content.trim(),
        host,
        messages
      );

      const assistantMessage: ChatMessage = {
        id: `temp_assistant_${Date.now()}`,
        destinationId,
        role: 'assistant',
        content: assistantResponse,
        timestamp: Math.floor(Date.now() / 1000),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      await DatabaseService.saveChatMessage(destinationId, 'assistant', assistantResponse);
    } catch (err) {
      if (__DEV__) console.error('Error sending message:', err);
      setError('Erreur lors de l\'envoi du message. Vérifiez votre clé API OpenAI.');
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [destinationId, host, messages]);

  const clearConversation = useCallback(async () => {
    try {
      await DatabaseService.clearChatMessages(destinationId);
      setMessages([]);
      setError(null);
    } catch (err) {
      if (__DEV__) console.error('Error clearing conversation:', err);
      setError('Erreur lors de la suppression de la conversation');
    }
  }, [destinationId]);

  return {
    messages,
    host,
    isLoading,
    isSending,
    error,
    sendMessage,
    clearConversation,
    refreshChat: loadChatData,
  };
};
