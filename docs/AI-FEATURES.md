Documentation détaillée des fonctionnalités IA. Pour une vue d'ensemble, voir le [README](../README.md).

# Fonctionnalités IA

L'application Vacation Booking intègre **deux fonctionnalités IA complémentaires**, toutes deux propulsées par l'API OpenAI :

1. **L'assistant Floppy** — un assistant de voyage conversationnel global qui aide l'utilisateur à trouver sa destination de rêve.
2. **Le chat avec l'hôte** — un chat contextuel par destination, où chaque hôte possède une personnalité (persona) unique stockée en base de données.

Les deux services partagent **une seule et même configuration de clé OpenAI**. Voir la section [Configuration de la clé OpenAI](#configuration-de-la-clé-openai) ci-dessous, valable pour les deux intégrations.

## Configuration de la clé OpenAI

Les deux services (Floppy et le chat avec l'hôte) lisent **une seule variable d'environnement** : `EXPO_PUBLIC_OPENAI_API_KEY`, chargée via `process.env`.

### 1. Obtenir une clé API OpenAI

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/).
2. Accédez à [API Keys](https://platform.openai.com/api-keys).
3. Créez une nouvelle clé secrète.
4. Copiez la clé (elle commence par `sk-...`).

### 2. Configurer l'application

Créez un fichier `.env` à la racine du projet (à partir de l'exemple si disponible) :

```bash
cp .env.example .env
```

Ajoutez votre clé API OpenAI :

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-votre-cle-api-ici
```

**Important** : le préfixe `EXPO_PUBLIC_` est nécessaire pour que la variable soit accessible côté application Expo via `process.env`. Cette même clé est utilisée par l'assistant Floppy **et** par le chat avec l'hôte — il n'y a plus qu'une seule variable à configurer.

> **Note** : la clé est lue directement depuis `process.env` (aucun plugin Babel ni import depuis un module dédié n'est nécessaire).

### 3. Redémarrer l'application

Après avoir ajouté la clé API, redémarrez le serveur de développement :

```bash
npm start
# ou
expo start
```

### 4. Mode démo (sans clé API)

Si aucune clé API n'est configurée, **Floppy fonctionne en mode démo** avec des réponses prédéfinies :

- Réponses contextuelles basiques (réponses de secours / fallback)
- Aucun coût
- Parfait pour tester l'interface

### Note de sécurité

La clé est exposée **côté client** (c'est la conséquence du préfixe `EXPO_PUBLIC_`, requis par Expo pour rendre la variable accessible dans l'application). C'est **acceptable dans un contexte pédagogique / d'apprentissage**, mais ce n'est **pas recommandé en production** : une clé exposée dans un bundle client peut être extraite et utilisée par des tiers. En production, il est recommandé de router les appels OpenAI via un **proxy back-end** qui détient la clé secrète côté serveur.

Bonnes pratiques générales :

1. Clé API dans `.env` (non versionné)
2. `.env` ajouté au `.gitignore`
3. Ne partagez **jamais** votre clé API et ne la committez pas sur Git
4. Validation des entrées utilisateur
5. Gestion des erreurs API
6. Limite de tokens par réponse
7. Historique limité pour maîtriser les coûts

---

## 1. Assistant Floppy

Floppy 🤖 est l'assistant de voyage IA intégré à l'application. Il aide les utilisateurs à trouver leur destination de rêve grâce à des conversations naturelles.

### Fonctionnalités

#### Conversation intelligente
- Répond aux questions sur les destinations
- Donne des conseils de voyage personnalisés
- Suggère des destinations selon le budget et les préférences
- Maintient le contexte de la conversation

#### Interface utilisateur
- **Bouton flottant** : pastille avec emoji 🤖 en bas à droite
- **Chat moderne** : interface de messagerie avec animations
- **Quick replies** : réponses rapides prédéfinies
- **Indicateur de frappe** : animation pendant que Floppy réfléchit
- **Support dark mode** : s'adapte au thème système

#### Réponses contextuelles
Floppy connaît :
- Les 4 destinations disponibles (Bali, Swiss Alps, Tokyo, Santorini)
- Les prix et équipements de chaque destination
- Les fonctionnalités de l'application
- Comment guider l'utilisateur dans sa recherche

### Modèle utilisé

- **Modèle** : `gpt-4o-mini`
- Limite : ~150 tokens par réponse
- Historique limité : 20 messages max

### Prompt système

Floppy utilise un prompt système détaillé qui définit son comportement :

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

### Architecture

#### Services
```
services/FloppyAIService.ts
├── Singleton pattern
├── Gestion OpenAI API (SDK openai)
├── Historique de conversation
├── Réponses de secours (fallback / mode démo)
└── Prompt système contextualisé
```

#### ViewModels
```
viewmodels/FloppyChatViewModel.ts
├── Gestion des messages
├── État de frappe (typing)
├── Envoi de messages
├── Quick replies
└── Réinitialisation du chat
```

#### Composants
```
components/
├── FloppyButton.tsx      # Bouton flottant animé
└── FloppyChat.tsx        # Interface de chat complète
```

### Modèle de données

```typescript
interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
```

### Interface

#### Bouton flottant
- Position : bas droite de l'écran
- Taille : 70x70px
- Animation : scale au clic
- Emoji : 🤖
- Label : "Floppy"

#### Chat
- Hauteur : 80% de l'écran
- Animation : slide up
- Header : avatar Floppy + titre + boutons
- Messages : bulles différenciées user/bot
- Quick replies : scroll horizontal
- Input : multi-ligne avec bouton d'envoi

### Exemples d'utilisation

#### Questions typiques
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

#### Quick replies
- 🏖️ Destinations plage
- ⛰️ Destinations montagne
- 💰 Budget 150$/nuit
- 🌟 Recommandations

### Coûts OpenAI

- Modèle : `gpt-4o-mini`
- ~150 tokens par réponse
- Coût estimé : très faible par message (modèle économique)
- Budget mensuel recommandé : $5-10 pour un usage normal

### Intégration

#### Pages avec Floppy
- ✅ Home (page d'accueil)
- Peut être ajouté à d'autres pages si besoin

#### Ajouter Floppy à une nouvelle page
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

### Tests

#### Tester Floppy
1. Lancer l'application
2. Cliquer sur le bouton Floppy (bas droite)
3. Envoyer un message : "Bonjour"
4. Tester les quick replies
5. Poser des questions sur les destinations
6. Vérifier le mode démo (sans clé API)

#### Scénarios de test
- ✅ Salutation initiale
- ✅ Questions sur destinations spécifiques
- ✅ Demandes de recommandations
- ✅ Questions sur le budget
- ✅ Réponses hors sujet (redirection)
- ✅ Réinitialisation du chat
- ✅ Mode démo (fallback)

### Dépannage

#### Problème : Floppy ne répond pas
- Vérifier la clé API `EXPO_PUBLIC_OPENAI_API_KEY` dans `.env`
- Vérifier la connexion internet
- Consulter les logs de la console

#### Problème : réponses génériques
- Floppy est en mode démo (pas de clé API)
- Les réponses de secours sont utilisées

#### Problème : erreur API
- Vérifier que la clé API est valide
- Vérifier les crédits OpenAI
- Vérifier les limites de rate limiting

### Améliorations futures
- [ ] Intégration avec les données réelles de l'app
- [ ] Réservation directe via Floppy
- [ ] Historique de conversations persistant
- [ ] Suggestions proactives basées sur le profil
- [ ] Support multilingue
- [ ] Analyse de sentiment
- [ ] Intégration avec d'autres APIs (météo, vols, etc.)

> **Note** : Floppy est un assistant IA expérimental. Les réponses sont générées par un modèle OpenAI et peuvent varier. Toujours vérifier les informations importantes avant de prendre des décisions de réservation.

---

## 2. Chat avec l'hôte

Cette fonctionnalité permet aux utilisateurs de discuter avec **l'hôte de chaque destination** via un chat propulsé par l'API OpenAI. Chaque hôte possède une personnalité unique (persona) définie dans la base de données.

### Architecture

#### Modèles
- **`Host`** (`models/Host.ts`) — représente un hôte avec prénom, nom, persona et avatar
- **`ChatMessage`** (`models/ChatMessage.ts`) — représente un message de chat (user ou assistant)

#### Services
- **`ChatService`** (`services/ChatService.ts`) — gère les appels à l'API OpenAI
  - Configure la clé API
  - Construit les prompts système basés sur le persona de l'hôte
  - Envoie les messages et reçoit les réponses
  - Limite l'historique aux 10 derniers messages pour optimiser les tokens

- **`DatabaseService`** — étendu avec :
  - Table `hosts` — stocke les informations des hôtes
  - Table `chat_messages` — stocke l'historique des conversations
  - Méthodes : `getHostByDestinationId()`, `getChatMessages()`, `saveChatMessage()`, `clearChatMessages()`

#### ViewModel
- **`ChatViewModel`** (`viewmodels/ChatViewModel.ts`)
  - Gère l'état du chat (messages, hôte, loading, erreurs)
  - Envoie les messages à OpenAI
  - Sauvegarde les messages dans la base de données
  - Permet de supprimer l'historique de conversation

#### Interface utilisateur
- **Route `(chat)/[destinationId].tsx`** — écran de chat
  - Interface de chat moderne avec bulles de messages
  - Avatar de l'hôte
  - Indicateur de chargement pendant l'envoi
  - Gestion des erreurs
  - Bouton pour effacer la conversation
  - Clavier adaptatif (iOS/Android)

### Utilisation

1. Naviguez vers les détails d'une destination
2. Cliquez sur l'icône de chat dans la section "Hôte"
3. Commencez à discuter avec l'hôte
4. L'hôte répondra selon sa personnalité définie

### Personas des hôtes

Chaque destination a un hôte unique avec un persona spécifique. Les personas incluent :
- Hôtes passionnés par l'hospitalité
- Anciens guides touristiques
- Propriétaires expérimentés
- Natifs de la région

Les hôtes peuvent fournir des informations sur :
- La destination et ses attractions
- Les équipements disponibles
- Les activités locales
- Les restaurants et lieux secrets
- Les conseils pratiques

### Limitations

- Utilise le modèle `gpt-3.5-turbo` (économique et rapide)
- Limite de 500 tokens par réponse
- Historique limité aux 10 derniers messages
- Les réponses sont en français
- Les hôtes ne peuvent pas gérer les réservations (ils redirigent vers la plateforme)

### Base de données

#### Table `hosts`
```sql
CREATE TABLE hosts (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  persona TEXT NOT NULL,
  avatar TEXT,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);
```

#### Table `chat_messages`
```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);
```

### Coûts OpenAI

Le modèle `gpt-3.5-turbo` est très économique :
- ~$0.0015 par 1000 tokens d'entrée
- ~$0.002 par 1000 tokens de sortie

Une conversation typique de 20 messages coûte moins de $0.01.

### Améliorations futures
- [ ] Support de plusieurs langues
- [ ] Suggestions de questions prédéfinies
- [ ] Partage de photos dans le chat
- [ ] Notifications push pour les réponses
- [ ] Modèles GPT-4 pour des réponses plus sophistiquées
- [ ] Analyse de sentiment des conversations
- [ ] Résumés automatiques des conversations longues

---

## Ressources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices for Prompts](https://platform.openai.com/docs/guides/prompt-engineering)
