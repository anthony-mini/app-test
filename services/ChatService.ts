import { ChatMessage } from '../models/ChatMessage';
import { Host } from '../models/Host';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class ChatService {
  private static instance: ChatService;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  setApiKey(key: string) {
    this.apiKey = key;
  }

  async sendMessage(
    userMessage: string,
    host: Host,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = this.buildSystemPrompt(host);
    const messages = this.buildMessages(systemPrompt, conversationHistory, userMessage);

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to get response from OpenAI');
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
    } catch (error) {
      if (__DEV__) console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }

  private buildSystemPrompt(host: Host): string {
    return `Tu es ${host.firstName} ${host.lastName}, l'hôte d'une location de vacances.

Voici ta personnalité et ton contexte :
${host.persona}

Instructions importantes :
- Réponds toujours en français
- Sois chaleureux, accueillant et professionnel
- Reste dans ton rôle d'hôte de location de vacances
- Fournis des informations utiles sur la destination, les équipements, les activités locales
- Si on te pose des questions sur la réservation, les prix ou les disponibilités, reste vague et invite à consulter les détails sur la plateforme
- Sois concis dans tes réponses (2-3 phrases maximum sauf si plus de détails sont demandés)
- Utilise un ton amical et personnalisé`;
  }

  private buildMessages(
    systemPrompt: string,
    history: ChatMessage[],
    newMessage: string
  ): { role: string; content: string }[] {
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    const recentHistory = history.slice(-10);
    
    for (const msg of recentHistory) {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    messages.push({
      role: 'user',
      content: newMessage,
    });

    return messages;
  }
}

const chatService = ChatService.getInstance();
export default chatService;
