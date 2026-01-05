# Floppy - Assistant IA Conversationnel 🤖

Floppy est l'assistant de voyage IA intégré à l'application Vacation Booking. Il aide les utilisateurs à trouver leur destination de rêve grâce à des conversations naturelles.

## 🎯 Fonctionnalités

### Conversation Intelligente
- Répond aux questions sur les destinations
- Donne des conseils de voyage personnalisés
- Suggère des destinations selon le budget et les préférences
- Maintient le contexte de la conversation

### Interface Utilisateur
- **Bouton flottant** : Pastille avec emoji 🤖 en bas à droite
- **Chat moderne** : Interface de messagerie avec animations
- **Quick replies** : Réponses rapides prédéfinies
- **Indicateur de frappe** : Animation pendant que Floppy réfléchit
- **Support dark mode** : S'adapte au thème système

### Réponses Contextuelles
Floppy connaît :
- Les 4 destinations disponibles (Bali, Swiss Alps, Tokyo, Santorini)
- Les prix et équipements de chaque destination
- Les fonctionnalités de l'application
- Comment guider l'utilisateur dans sa recherche

## 🔧 Configuration

### 1. Obtenir une clé API OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Allez dans [API Keys](https://platform.openai.com/api-keys)
3. Créez une nouvelle clé API
4. Copiez la clé (elle commence par `sk-...`)

### 2. Configurer l'application

Ouvrez le fichier `.env` à la racine du projet et ajoutez votre clé :

```env
OPENAI_API_KEY=sk-votre-cle-api-ici
```

**⚠️ Important** : Ne partagez JAMAIS votre clé API et ne la committez pas sur Git !

### 3. Mode Démo (Sans API)

Si aucune clé API n'est configurée, Floppy fonctionne en **mode démo** avec des réponses prédéfinies :
- Réponses contextuelles basiques
- Pas de coût
- Parfait pour tester l'interface

## 💬 Prompt Système

Floppy utilise un prompt système détaillé qui définit :

```
Tu es Floppy, un assistant de voyage IA sympathique et enthousiaste 
pour l'application "Vacation Booking".

CONTEXTE:
- Application de réservation de vacances
- 4 destinations: Bali, Swiss Alps, Tokyo, Santorini
- Fonctionnalités: recherche, favoris, réservations, profil, géolocalisation, cartes

RÔLE:
- Aide à trouver la destination de rêve
- Donne des conseils personnalisés
- Répond aux questions sur destinations, prix, équipements
- Enthousiaste, amical, encourageant
- Utilise des emojis occasionnellement
- Reste concis (2-3 phrases max)

STYLE:
- Toujours positif
- Pose des questions pour comprendre les besoins
- Suggère des destinations adaptées
- Mentionne les fonctionnalités de l'app
```

## 🏗️ Architecture

### Services
```
services/FloppyAIService.ts
├── Singleton pattern
├── Gestion OpenAI API
├── Historique de conversation
├── Réponses de secours (fallback)
└── Prompt système contextualisé
```

### ViewModels
```
viewmodels/FloppyChatViewModel.ts
├── Gestion des messages
├── État de frappe (typing)
├── Envoi de messages
├── Quick replies
└── Réinitialisation du chat
```

### Composants
```
components/
├── FloppyButton.tsx      # Bouton flottant animé
└── FloppyChat.tsx        # Interface de chat complète
```

## 📊 Modèle de données

```typescript
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
```

## 🎨 Interface

### Bouton Flottant
- Position : Bas droite de l'écran
- Taille : 70x70px
- Animation : Scale au clic
- Emoji : 🤖
- Label : "Floppy"

### Chat
- Hauteur : 80% de l'écran
- Animation : Slide up
- Header : Avatar Floppy + titre + boutons
- Messages : Bulles différenciées user/bot
- Quick replies : Scroll horizontal
- Input : Multi-ligne avec bouton d'envoi

## 💡 Exemples d'utilisation

### Questions typiques
```
User: "Bonjour !"
Floppy: "Bonjour ! 👋 Je suis Floppy, ton assistant de voyage ! 
         Comment puis-je t'aider à planifier tes prochaines vacances ?"

User: "Je cherche une destination plage"
Floppy: "Super choix ! 🏖️ J'ai deux destinations plage magnifiques :
         - Bali (150$/nuit) : Spa, piscine, plage
         - Santorini (320$/nuit) : Villa privée, vue caldera
         Quel est ton budget ?"

User: "Autour de 150$ par nuit"
Floppy: "Parfait ! Bali Beach Resort à Seminyak est idéal pour toi ! 
         150$/nuit avec piscine, spa et accès direct à la plage. 
         Tu veux voir plus de détails ? 😊"
```

### Quick Replies
- 🏖️ Destinations plage
- ⛰️ Destinations montagne
- 💰 Budget 150$/nuit
- 🌟 Recommandations

## 🔐 Sécurité

### Bonnes pratiques
1. ✅ Clé API dans `.env` (non versionné)
2. ✅ `.env` ajouté au `.gitignore`
3. ✅ Validation des entrées utilisateur
4. ✅ Gestion des erreurs API
5. ✅ Limite de tokens (150 max par réponse)
6. ✅ Historique limité (20 messages max)

### Coûts OpenAI
- Modèle : `gpt-3.5-turbo`
- ~150 tokens par réponse
- Coût estimé : ~$0.0003 par message
- Budget mensuel recommandé : $5-10 pour usage normal

## 🧪 Tests

### Tester Floppy
1. Lancer l'application
2. Cliquer sur le bouton Floppy (bas droite)
3. Envoyer un message : "Bonjour"
4. Tester les quick replies
5. Poser des questions sur les destinations
6. Vérifier le mode démo (sans API key)

### Scénarios de test
- ✅ Salutation initiale
- ✅ Questions sur destinations spécifiques
- ✅ Demandes de recommandations
- ✅ Questions sur le budget
- ✅ Réponses hors sujet (redirection)
- ✅ Réinitialisation du chat
- ✅ Mode démo (fallback)

## 📱 Intégration

### Pages avec Floppy
- ✅ Home (page d'accueil)
- Peut être ajouté à d'autres pages si besoin

### Ajouter Floppy à une nouvelle page
```tsx
import { useState } from 'react';
import FloppyButton from '../../components/FloppyButton';
import FloppyChat from '../../components/FloppyChat';

export default function MyScreen() {
  const [isFloppyOpen, setIsFloppyOpen] = useState(false);

  return (
    <View>
      {/* Votre contenu */}
      
      <FloppyButton onPress={() => setIsFloppyOpen(true)} />
      <FloppyChat 
        isOpen={isFloppyOpen} 
        onClose={() => setIsFloppyOpen(false)} 
      />
    </View>
  );
}
```

## 🚀 Améliorations futures

### Fonctionnalités potentielles
- [ ] Intégration avec les données réelles de l'app
- [ ] Réservation directe via Floppy
- [ ] Historique de conversations persistant
- [ ] Suggestions proactives basées sur le profil
- [ ] Support multilingue
- [ ] Analyse de sentiment
- [ ] Intégration avec d'autres APIs (météo, vols, etc.)

## 🐛 Dépannage

### Problème : Floppy ne répond pas
- Vérifier la clé API dans `.env`
- Vérifier la connexion internet
- Consulter les logs de la console

### Problème : Réponses génériques
- Floppy est en mode démo (pas de clé API)
- Les réponses de secours sont utilisées

### Problème : Erreur API
- Vérifier que la clé API est valide
- Vérifier les crédits OpenAI
- Vérifier les limites de rate limiting

## 📚 Ressources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices for Prompts](https://platform.openai.com/docs/guides/prompt-engineering)

---

**Note** : Floppy est un assistant IA expérimental. Les réponses sont générées par GPT-3.5 et peuvent varier. Toujours vérifier les informations importantes avant de prendre des décisions de réservation.
