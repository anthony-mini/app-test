const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Lazy load OpenAI pour réduire le bundle initial
let OpenAI: any = null;
const loadOpenAI = async () => {
  if (!OpenAI) {
    OpenAI = (await import('openai')).default;
  }
  return OpenAI;
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class FloppyAIService {
  private static instance: FloppyAIService;
  private openai: any = null;
  private conversationHistory: Message[] = [];

  private readonly SYSTEM_PROMPT = `Tu es Floppy, un assistant de voyage IA sympathique et enthousiaste pour l'application "Vacation Booking". 

CONTEXTE DE L'APPLICATION:
- Application mobile de réservation de vacances
- Destinations disponibles: Bali (Indonésie), Swiss Alps (Suisse), Tokyo (Japon), Santorini (Grèce)
- Fonctionnalités: recherche de destinations, favoris, réservations, profil utilisateur, géolocalisation, cartes interactives

TON RÔLE:
- Aide les utilisateurs à trouver leur destination de rêve
- Donne des conseils de voyage personnalisés
- Réponds aux questions sur les destinations, prix, équipements
- Sois enthousiaste, amical et encourageant
- Utilise des emojis occasionnellement pour rendre la conversation vivante
- Reste concis (2-3 phrases maximum par réponse)

PRIX MOYENS:
- Bali Beach Resort: 150$/nuit (plage, spa, piscine)
- Swiss Alps Chalet: 280$/nuit (montagne, ski, jacuzzi)
- Tokyo City Hotel: 120$/nuit (ville, moderne, shopping)
- Santorini Villa: 320$/nuit (plage, piscine privée, vue caldera)

STYLE DE RÉPONSE:
- Toujours positif et encourageant
- Pose des questions pour mieux comprendre les besoins
- Suggère des destinations adaptées au budget et préférences
- Mentionne les fonctionnalités de l'app quand pertinent

IMPORTANT:
- Ne parle QUE de voyage et des fonctionnalités de l'app
- Si on te pose une question hors sujet, redirige gentiment vers le voyage
- Reste dans le contexte de l'application de réservation de vacances`;

  private constructor() {
    this.initializeOpenAI();
  }

  static getInstance(): FloppyAIService {
    if (!FloppyAIService.instance) {
      FloppyAIService.instance = new FloppyAIService();
    }
    return FloppyAIService.instance;
  }

  private async initializeOpenAI() {
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here' || OPENAI_API_KEY === '') {
      if (__DEV__) console.warn('⚠️ OpenAI API key not configured. Floppy will use fallback responses.');
      return;
    }
    
    if (__DEV__) console.log('✅ OpenAI API key loaded successfully');

    try {
      const OpenAIClass = await loadOpenAI();
      this.openai = new OpenAIClass({
        apiKey: OPENAI_API_KEY,
      });
      this.conversationHistory = [
        {
          role: 'system',
          content: this.SYSTEM_PROMPT,
        },
      ];
    } catch (error) {
      if (__DEV__) console.error('Error initializing OpenAI:', error);
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    if (!this.openai) {
      return this.getFallbackResponse(userMessage);
    }

    try {
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: this.conversationHistory,
        max_tokens: 150,
        temperature: 0.8,
      });

      const assistantMessage = completion.choices[0]?.message?.content || 
        'Désolé, je n\'ai pas pu générer une réponse. 😅';

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      if (this.conversationHistory.length > 20) {
        this.conversationHistory = [
          this.conversationHistory[0],
          ...this.conversationHistory.slice(-10),
        ];
      }

      return assistantMessage;
    } catch (error) {
      if (__DEV__) console.error('Error calling OpenAI:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
      return "Bonjour ! 👋 Je suis Floppy, ton assistant de voyage ! Comment puis-je t'aider à planifier tes prochaines vacances ?";
    }

    if (lowerMessage.includes('bali')) {
      return "Bali est magnifique ! 🏝️ Notre Bali Beach Resort à Seminyak coûte 150$/nuit avec piscine et spa. Parfait pour se détendre sur la plage ! Ça t'intéresse ?";
    }

    if (lowerMessage.includes('montagne') || lowerMessage.includes('ski') || lowerMessage.includes('alpes')) {
      return "Les Alpes Suisses sont spectaculaires ! ⛷️ Notre chalet à Zermatt (280$/nuit) offre un accès ski-in/ski-out et un jacuzzi avec vue sur les montagnes. Envie d'aventure ?";
    }

    if (lowerMessage.includes('tokyo') || lowerMessage.includes('japon') || lowerMessage.includes('ville')) {
      return "Tokyo est incroyable ! 🗼 Notre hôtel à Shibuya (120$/nuit) est parfait pour explorer la ville, faire du shopping et découvrir la culture japonaise. Ça te tente ?";
    }

    if (lowerMessage.includes('santorini') || lowerMessage.includes('grèce')) {
      return "Santorini est un paradis ! 🇬🇷 Notre villa à Oia (320$/nuit) avec piscine privée et vue sur la caldera est parfaite pour un séjour romantique. Intéressé ?";
    }

    if (lowerMessage.includes('prix') || lowerMessage.includes('budget') || lowerMessage.includes('coût')) {
      return "Nos destinations vont de 120$/nuit (Tokyo) à 320$/nuit (Santorini) ! 💰 Quel est ton budget ? Je peux te suggérer la meilleure option !";
    }

    if (lowerMessage.includes('recommand') || lowerMessage.includes('conseil') || lowerMessage.includes('suggère')) {
      return "Avec plaisir ! 😊 Tu préfères la plage, la montagne ou la ville ? Et quel est ton budget approximatif ? Je vais te trouver la destination parfaite !";
    }

    return "Je suis là pour t'aider à trouver ta destination de rêve ! 🌍 Tu peux me parler de tes préférences (plage, montagne, ville) ou me demander des infos sur nos destinations. Que recherches-tu ?";
  }

  clearHistory() {
    this.conversationHistory = [
      {
        role: 'system',
        content: this.SYSTEM_PROMPT,
      },
    ];
  }

  isConfigured(): boolean {
    return this.openai !== null;
  }
}

export default FloppyAIService.getInstance();
