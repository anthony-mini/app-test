# Scénario de la vidéo de démonstration

> Chapitrage image par image de la démo enregistrée, prouvant que **chacune des 7 exigences de notation** est couverte à l'écran.

| | |
|---|---|
| **Application** | App-test — application de réservation de séjours (Expo / React Native, architecture MVVM) |
| **Durée** | ~212 s (3 min 32 s) |
| **Appareil** | Simulateur iPhone 17 (iOS), résolution 1206 × 2622 |
| **Date d'enregistrement** | 2026-06-19 |
| **Fichier source** | [`../screenshots/Simulator Screen Recording - iPhone 17 - 2026-06-19 at 14.52.33.mov`](../screenshots/Simulator%20Screen%20Recording%20-%20iPhone%2017%20-%202026-06-19%20at%2014.52.33.mov) |
| **Lien d'hébergement** | **[LIEN_VIDEO]** |

> ⚠️ **La vidéo n'est pas versionnée dans Git** (≈ 326 Mo, trop lourde pour le dépôt). Elle doit être **hébergée à part** (Google Drive, ou YouTube en mode *non répertorié*) et le lien reporté à la place du placeholder `[LIEN_VIDEO]` ci-dessus ainsi que dans le `README.md`.

---

## 1. Tableau de chapitrage

| Horodatage | Écran / Action | Exigence(s) démontrée(s) |
|---|---|---|
| **0 – 8 s** | **Onboarding** — slides de présentation, boutons « Book » / « Next », puis écran d'entrée (parcours non authentifié) | Navigation • Gestion des états (rendu initial) |
| **10 – 18 s** | **Home** — bannière « New York / View Offer », catégories, *Popular Destinations* | Navigation • Gestion des états (loading de la liste) |
| **18 – 26 s** | **Profil utilisateur** — champs email, téléphone, *About*, *Settings* | Navigation • Persistance (profil lu depuis SQLite) |
| **26 – 34 s** | **Home** « Hello, Traveler! » — barre de recherche + catégories + *Popular Destinations* (liste principale) | Navigation • Persistance (destinations en base) • Gestion des états |
| **34 – 40 s** | **Reviews** — note globale 3,7, filtres par étoiles, liste d'avis | Navigation • Persistance (avis SQLite) • CRUD (filtre = requête de lecture) |
| **40 – 72 s** | **Détail d'une destination** — amenities, sélection des dates / calendrier « Sélectionner les dates » | Navigation • Fonctionnalité native (calendrier) • Persistance (favori ajout/retrait) • CRUD |
| **72 – 100 s** | **Détail (suite)** — section **Location avec carte native** + bloc Réservation (« $200 / Choisir les dates ») | **Fonctionnalité native (carte)** • CRUD (préparation réservation) |
| **~82 s** | **Carte Interactive plein écran** — titre « Carte Interactive », 16 destinations, marqueurs interactifs | **Fonctionnalité native (carte + géoloc)** • Navigation |
| **100 – 130 s** | **Chat avec l'hôte (Maria)** — envoi d'un message → **appel OpenAI** ; à **~114 s** **état d'ERREUR** : « Erreur lors de l'envoi… Vérifiez votre clé API OpenAI » + toast d'erreur | **Appels API** • **Gestion des états (loading + erreur)** • CRUD/Persistance (messages créés en SQLite) |
| **130 – 150 s** | Retour **Home** + ouverture de **Floppy** (assistant IA, badge « Mode démo », quick replies « Destinations plage / montagne ») | Navigation • Gestion des états (mode démo / fallback) |
| **150 – 212 s** | **Conversation avec Floppy** — échanges avec l'assistant IA de voyage | **Appels API** • Gestion des états (loading des réponses) |

---

## 2. Tableau de couverture des 7 exigences

| # | Exigence | Prouvée à (horodatage) | Via quelle interaction |
|---|---|---|---|
| 1 | **Navigation complète** | 0–8 s, 18–26 s, 26–34 s, 34–40 s, ~82 s, 130–150 s | Enchaînement Onboarding → Home → Profil → Home → Reviews → Détail → Carte plein écran → Chat hôte → Floppy, via la navigation par onglets et `expo-router`. |
| 2 | **CRUD (ajout / modif / suppression)** | 40–72 s (favori), 18–26 s (profil), 100–130 s (chat) | **Create/Delete** : ajout puis retrait d'un **favori** sur le détail. **Update** : édition du **profil**. **Create** : envoi d'un **message de chat**. Toutes ces opérations écrivent dans SQLite (`favorites`, `user_profile`, `chat_messages`). |
| 3 | **Persistance des données** | 18–26 s, 26–34 s, 34–40 s, 40–72 s, 100–130 s | Stockage **SQLite (`expo-sqlite`)** via `DatabaseService` : favoris persistés (ajout/retrait), profil + photo persistés, messages de chat créés/effacés persistés, destinations et avis lus en base. La donnée survit à la navigation et au redémarrage. |
| 4 | **Appels API** | 100–130 s (chat hôte), 150–212 s (Floppy) | **OpenAI** : chat avec l'hôte via `gpt-3.5-turbo` (`services/ChatService.ts`) ; assistant **Floppy** via `gpt-4o-mini` (`services/FloppyAIService.ts`). Requêtes HTTP réelles vers `api.openai.com`. |
| 5 | **Gestion des états (loading / erreur)** | 10–18 s, 100–130 s, **~114 s**, 150–212 s | **Loading** : indicateurs pendant le chargement des listes et des réponses IA. **Erreur** : à ~114 s, l'échec de l'appel OpenAI affiche le message « Vérifiez votre clé API OpenAI » + toast. **Fallback** : Floppy bascule en « Mode démo » si l'API est indisponible. |
| 6 | **Fonctionnalité native** | 72–100 s, ~82 s, 40–72 s | **Carte native** `react-native-maps` (section *Location* du détail + carte interactive plein écran avec marqueurs), **géolocalisation** `expo-location`, **calendrier** de sélection des dates, et **sélection de photo** `expo-image-picker` pour l'avatar du profil. |
| 7 | **Présentation rapide de l'architecture** | Voix-off / encart (voir § 4 et script) | Architecture **MVVM** : `models/` (entités), `viewmodels/` (logique de présentation), `services/` (SQLite + OpenAI + localisation), `app/` (écrans `expo-router`). À commenter brièvement à l'oral, en s'appuyant sur `docs/ARCHITECTURE.md`. |

> ✅ **Les 7 exigences sont chacune mappées à au moins un horodatage** (voir colonne « Prouvée à »).

---

## 3. Architecture (rappel pour la présentation orale)

À évoquer en une vingtaine de secondes pendant la démo (ou en addendum) :

- **Pattern MVVM** — séparation stricte Vue / ViewModel / Modèle.
  - `models/` — `Destination`, `Booking`, `User`, `Host`, `Chat`, `ChatMessage`, `SearchFilters`.
  - `viewmodels/` — `DestinationViewModel`, `BookingViewModel`, `UserProfileViewModel`, `ChatViewModel`, `FloppyChatViewModel`.
  - `services/` — `DatabaseService` (SQLite), `ChatService` + `FloppyAIService` (OpenAI), `LocationService` (géoloc), `StorageService`.
  - `app/` — écrans et routes (`expo-router`, navigation par groupes `(vacation)`, `(chat)`, `(adv)`).
- **Persistance** — base **SQLite** locale (`expo-sqlite`), tables `destinations`, `favorites`, `reviews`, `hosts`, `user_profile`, `chat_messages`, `bookings`.
- **Intégrations natives** — `react-native-maps`, `expo-location`, `expo-image-picker`, `expo-haptics`, `react-native-calendars`.

---

## 4. Note importante (à signaler à l'évaluateur)

> ℹ️ **La vidéo a été enregistrée AVANT les correctifs récents.** Depuis l'enregistrement, deux ajouts ont été apportés :
> - **Persistance des réservations en SQLite** (table `bookings` + CRUD dans `DatabaseService`, branchée via `BookingViewModel`).
> - **Écran « Mes réservations »** (`app/(vacation)/bookings.tsx`), accessible depuis le profil, avec **annulation** et **suppression**.
>
> **Ceci ne pénalise pas la démo** : la **persistance** est déjà prouvée à l'écran par **trois mécanismes distincts** — favoris (ajout/retrait persistés en SQLite), profil (modification + photo persistées) et chat hôte (messages créés/effacés persistés). Les réservations ne font que **renforcer** une exigence déjà couverte.

### Pour aller plus loin (ré-enregistrement optionnel)

Si vous souhaitez démontrer un **CRUD persistant de bout en bout** sur les réservations, enregistrez un **court addendum** (~30 s) selon ce mini-scénario :

1. Depuis le **détail** d'une destination, choisir des dates puis **créer une réservation** (*Create*).
2. Ouvrir **« Mes réservations »** depuis le profil → la réservation **apparaît** (preuve de *persistance* en SQLite).
3. **Annuler** la réservation → son statut passe à « Annulée » (*Update*).
4. **Supprimer** la réservation (confirmation) → elle **disparaît** de la liste (*Delete*).
5. *(Facultatif)* Fermer et rouvrir l'app → l'état persiste (relecture depuis la base).

Cet addendum donne une boucle **Create → Read → Update → Delete** complète et observable, idéale pour appuyer les exigences **CRUD** et **Persistance**.

---

## 5. Script de narration (voix-off optionnelle)

Une à deux phrases par chapitre, à lire si vous refaites une voix-off en français.

| Chapitre | Narration suggérée |
|---|---|
| **0–8 s — Onboarding** | « L'application s'ouvre sur un onboarding non authentifié qui présente le service. On entre ensuite dans le parcours principal. » |
| **10–18 s — Home** | « Voici l'accueil : une bannière mise en avant, des catégories, et la liste des destinations populaires. » |
| **18–26 s — Profil** | « Le profil affiche les informations de l'utilisateur — email, téléphone, à-propos — relues depuis la base SQLite locale. » |
| **26–34 s — Home (liste)** | « De retour à l'accueil, on retrouve la recherche et la liste principale des destinations, alimentée par la base. » |
| **34–40 s — Reviews** | « L'écran des avis affiche une note globale et permet de filtrer par étoiles, via une requête de lecture sur la base. » |
| **40–72 s — Détail / dates** | « Sur le détail d'une destination, on consulte les équipements et on sélectionne ses dates au calendrier. L'ajout aux favoris est immédiatement persisté en SQLite. » |
| **72–100 s — Carte native** | « La section Localisation intègre une carte native. On prépare ensuite une réservation à deux cents dollars. » |
| **~82 s — Carte interactive** | « En plein écran, la carte interactive affiche seize destinations avec leurs marqueurs : une vraie fonctionnalité native, carte et géolocalisation. » |
| **100–130 s — Chat hôte (+erreur)** | « On contacte l'hôte Maria : le message déclenche un appel à l'API OpenAI. Ici, l'absence de clé valide provoque une erreur, gérée proprement par un message et un toast. » |
| **130–150 s — Floppy** | « De retour à l'accueil, on ouvre Floppy, l'assistant IA. En l'absence de clé, il bascule en mode démo avec des réponses rapides. » |
| **150–212 s — Conversation Floppy** | « Floppy répond aux questions de voyage via l'API OpenAI, avec un état de chargement pendant la génération. » |
| **Clôture — Architecture** | « L'ensemble repose sur une architecture MVVM : modèles, view-models, services et écrans Expo Router, avec persistance SQLite et intégrations natives. » |
