# Fonctionnalité de Chat avec l'Hôte

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de discuter avec l'hôte de chaque destination via un chat simulé utilisant l'API OpenAI. Chaque hôte possède une personnalité unique définie dans la base de données.

## Architecture

### Modèles
- **`Host`** (`models/Host.ts`) - Représente un hôte avec prénom, nom, persona et avatar
- **`ChatMessage`** (`models/ChatMessage.ts`) - Représente un message de chat (user ou assistant)

### Services
- **`ChatService`** (`services/ChatService.ts`) - Gère les appels à l'API OpenAI
  - Configure la clé API
  - Construit les prompts système basés sur le persona de l'hôte
  - Envoie les messages et reçoit les réponses
  - Limite l'historique aux 10 derniers messages pour optimiser les tokens

- **`DatabaseService`** - Étendu avec :
  - Table `hosts` - Stocke les informations des hôtes
  - Table `chat_messages` - Stocke l'historique des conversations
  - Méthodes : `getHostByDestinationId()`, `getChatMessages()`, `saveChatMessage()`, `clearChatMessages()`

### ViewModel
- **`ChatViewModel`** (`viewmodels/ChatViewModel.ts`)
  - Gère l'état du chat (messages, hôte, loading, erreurs)
  - Envoie les messages à OpenAI
  - Sauvegarde les messages dans la base de données
  - Permet de supprimer l'historique de conversation

### Interface Utilisateur
- **Route `(chat)/[destinationId].tsx`** - Écran de chat
  - Interface de chat moderne avec bulles de messages
  - Avatar de l'hôte
  - Indicateur de chargement pendant l'envoi
  - Gestion des erreurs
  - Bouton pour effacer la conversation
  - Clavier adaptatif (iOS/Android)

## Configuration

### 1. Clé API OpenAI

Créez un fichier `.env` à la racine du projet :

```bash
cp .env.example .env
```

Ajoutez votre clé API OpenAI :

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your-api-key-here
```

**Important** : Le préfixe `EXPO_PUBLIC_` est nécessaire pour que la variable soit accessible dans l'application Expo.

### 2. Obtenir une clé API

1. Créez un compte sur [OpenAI Platform](https://platform.openai.com/)
2. Accédez à [API Keys](https://platform.openai.com/api-keys)
3. Créez une nouvelle clé secrète
4. Copiez-la dans votre fichier `.env`

### 3. Redémarrer l'application

Après avoir ajouté la clé API, redémarrez le serveur de développement :

```bash
npm start
# ou
expo start
```

## Utilisation

1. Naviguez vers les détails d'une destination
2. Cliquez sur l'icône de chat dans la section "Hôte"
3. Commencez à discuter avec l'hôte
4. L'hôte répondra selon sa personnalité définie

## Personas des Hôtes

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

## Limitations

- Utilise le modèle `gpt-3.5-turbo` (économique et rapide)
- Limite de 500 tokens par réponse
- Historique limité aux 10 derniers messages
- Les réponses sont en français
- Les hôtes ne peuvent pas gérer les réservations (ils redirigent vers la plateforme)

## Base de Données

### Table `hosts`
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

### Table `chat_messages`
```sql
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  destination_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp INTEGER DEFAULT (strftime('%s', 'now'))
);
```

## Coûts OpenAI

Le modèle `gpt-3.5-turbo` est très économique :
- ~$0.0015 par 1000 tokens d'entrée
- ~$0.002 par 1000 tokens de sortie

Une conversation typique de 20 messages coûte moins de $0.01.

## Améliorations Futures

- [ ] Support de plusieurs langues
- [ ] Suggestions de questions prédéfinies
- [ ] Partage de photos dans le chat
- [ ] Notifications push pour les réponses
- [ ] Modèles GPT-4 pour des réponses plus sophistiquées
- [ ] Analyse de sentiment des conversations
- [ ] Résumés automatiques des conversations longues
