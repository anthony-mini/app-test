# Vacation Booking Mobile App

> ⚠️ **Document historique (archivé).** Ceci est l'ancien README du projet, conservé pour référence. La documentation à jour et faisant autorité se trouve dans le [README principal](../README.md) et les fichiers du dossier `docs/`.

Une application mobile de réservation de vacances construite avec React Native, Expo et une architecture MVVM.

## 🏗️ Architecture MVVM

L'application suit le pattern MVVM (Model-View-ViewModel) pour une séparation claire des responsabilités :

### **Models** (`/models`)
- `Destination.ts` - Modèle de données pour les destinations
- `Booking.ts` - Modèle de données pour les réservations
- `User.ts` - Modèle de données pour les utilisateurs

### **ViewModels** (`/viewmodels`)
- `DestinationViewModel.ts` - Logique métier pour les destinations (recherche, filtrage, favoris)
- `BookingViewModel.ts` - Logique métier pour les réservations

### **Views** (`/app/(vacation)`)
- `onboarding.tsx` - Écran d'accueil avec slides de présentation
- `home.tsx` - Écran principal avec recherche et destinations populaires
- `destination/[id].tsx` - Détails d'une destination
- `booking-confirmation.tsx` - Confirmation de réservation

## 🎨 Fonctionnalités

### ✅ Implémentées
- **Onboarding** : Présentation de l'app avec 3 slides + haptic feedback
- **Page d'accueil** :
  - Barre de recherche
  - Filtres par catégories (Beach, Mountain, City, Countryside)
  - Liste de destinations populaires (scroll horizontal)
  - Recommandations personnalisées
  - **Géolocalisation** : Affichage de la ville de l'utilisateur
  - **Favoris persistants** : Sauvegarde locale avec AsyncStorage
- **Détails destination** :
  - Galerie d'images
  - Informations complètes (rating, prix, localisation)
  - Liste des équipements
  - **Carte interactive** : MapView avec marqueur de localisation
  - Bouton de réservation
  - Système de favoris avec haptic feedback
- **Confirmation de réservation** : Feedback haptique de succès
- **Profil utilisateur** :
  - Modification des informations personnelles
  - **Changement de photo de profil** : Caméra ou galerie d'images
  - Stockage local des données de profil
  - Popup de consentement pour les permissions
- **Floppy - Assistant IA** 🤖 :
  - Chatbot conversationnel avec OpenAI
  - Conseils de voyage personnalisés
  - Réponses contextuelles sur les destinations
  - Interface de chat moderne avec animations
  - Réponses de secours si API non configurée

## 📱 Fonctionnalités Natives (6/6 implémentées)

### 1. ✅ **Géolocalisation** (`expo-location`)
- Demande de permissions automatique
- Récupération de la position GPS de l'utilisateur
- Géocodage inversé pour afficher ville/pays
- Service singleton pour gérer la localisation
- Affichage de la ville dans le header de la page d'accueil
- Bouton de rafraîchissement de la localisation

**Fichiers concernés:**
- `services/LocationService.ts` - Service de géolocalisation
- `viewmodels/DestinationViewModel.ts` - Intégration dans le ViewModel
- `app/(vacation)/home.tsx` - Affichage de la localisation

### 2. ✅ **Stockage Local** (`@react-native-async-storage/async-storage`)
- Sauvegarde persistante des favoris
- Service de stockage avec API simple
- Préférences utilisateur sauvegardées
- Chargement automatique au démarrage

**Fichiers concernés:**
- `services/StorageService.ts` - Service de stockage
- `viewmodels/DestinationViewModel.ts` - Persistance des favoris

### 3. ✅ **Vibration / Haptic Feedback** (`expo-haptics`)
- Feedback léger pour les interactions (catégories, navigation)
- Feedback moyen pour les favoris
- Feedback de succès pour les réservations
- Améliore l'expérience utilisateur

**Implémenté dans:**
- `app/(vacation)/home.tsx` - Catégories et favoris
- `app/(vacation)/destination/[id].tsx` - Favoris et réservation
- `app/(vacation)/onboarding.tsx` - Navigation
- `app/(vacation)/booking-confirmation.tsx` - Confirmation

### 4. ✅ **Dark / Light Mode** (API système)
- Détection automatique du thème système
- Palette de couleurs adaptée (light/dark)
- Tous les écrans supportent les deux modes
- Transitions fluides entre les thèmes

**Fichiers concernés:**
- `constants/Colors.ts` - Palettes de couleurs
- `contexts/ThemeContext.tsx` - Contexte de thème
- Tous les écrans utilisent `useColorScheme()`

### 5. ✅ **Carte Interactive** (`react-native-maps`)
- Affichage de carte interactive sur la page de détails
- Marqueur personnalisé pour chaque destination
- Zoom et défilement activés
- Coordonnées GPS réelles pour chaque destination
- Bouton "Open in Maps" avec haptic feedback

**Fichiers concernés:**
- `models/Destination.ts` - Ajout du champ coordinates
- `viewmodels/DestinationViewModel.ts` - Coordonnées pour chaque destination
- `app/(vacation)/destination/[id].tsx` - MapView avec marqueur

### 6. ✅ **Caméra / Galerie d'Images** (`expo-image-picker`)
- Sélection de photo depuis la galerie
- Prise de photo avec la caméra
- Demande de permissions avec popup de consentement
- Édition et recadrage de l'image (aspect 1:1)
- Sauvegarde de la photo de profil en local

**Fichiers concernés:**
- `models/User.ts` - Modèle de profil utilisateur étendu
- `services/StorageService.ts` - Sauvegarde du profil
- `viewmodels/UserProfileViewModel.ts` - Logique de sélection d'image
- `app/(vacation)/profile.tsx` - Page de profil avec upload de photo

### 🎯 Design
- Interface moderne et épurée
- Couleur principale : Indigo (#6366F1)
- Animations fluides
- Cards avec ombres et coins arrondis
- Images de haute qualité (Unsplash)

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Configurer Floppy AI (optionnel)
# 1. Copier .env.example vers .env
# 2. Ajouter votre clé OpenAI dans .env
# Voir FLOPPY-AI.md pour plus de détails

# Lancer l'application
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android
```

## 📱 Navigation

```
Index (/) 
  └─> Onboarding (/vacation/onboarding)
       └─> Home (/vacation/home)
            ├─> Destination Details (/vacation/destination/[id])
            │    └─> Booking Confirmation (/vacation/booking-confirmation)
            └─> Back to Home
```

## 🛠️ Technologies

### Core
- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **Expo Router** - Navigation basée sur les fichiers
- **TypeScript** - Typage statique
- **React Hooks** - Gestion d'état moderne

### Fonctionnalités Natives
- **expo-location** - Géolocalisation GPS
- **@react-native-async-storage/async-storage** - Stockage local persistant
- **expo-haptics** - Feedback haptique/vibration
- **useColorScheme** (React Native) - Détection du thème système
- **react-native-maps** - Cartes interactives avec marqueurs
- **expo-image-picker** - Caméra et galerie d'images

## 📦 Structure du projet

```
app-test/
├── models/              # Modèles de données
│   ├── Destination.ts
│   ├── Booking.ts
│   ├── User.ts
│   └── Chat.ts          # Messages Floppy
├── viewmodels/          # Logique métier
│   ├── DestinationViewModel.ts
│   ├── BookingViewModel.ts
│   ├── UserProfileViewModel.ts
│   └── FloppyChatViewModel.ts  # IA conversationnelle
├── services/            # Services natifs
│   ├── LocationService.ts      # Géolocalisation
│   ├── StorageService.ts       # AsyncStorage
│   └── FloppyAIService.ts      # OpenAI integration
├── components/          # Composants réutilisables
│   ├── FloppyButton.tsx        # Bouton flottant
│   └── FloppyChat.tsx          # Interface de chat
├── contexts/            # Contextes React
│   └── ThemeContext.tsx        # Thème dark/light
├── constants/           # Constantes
│   └── Colors.ts               # Palettes de couleurs
├── app/                 # Vues (écrans)
│   ├── (vacation)/
│   │   ├── onboarding.tsx
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   │   ├── destination/
│   │   │   └── [id].tsx
│   │   ├── booking-confirmation.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   └── index.tsx
├── .env                 # Variables d'environnement (API keys)
├── .env.example         # Template pour .env
├── README-VACATION-APP.md
└── FLOPPY-AI.md        # Documentation Floppy
```

## 🎨 Palette de couleurs

- **Primary**: #6366F1 (Indigo)
- **Success**: #10B981 (Green)
- **Warning**: #FFD700 (Gold)
- **Error**: #FF6B6B (Red)
- **Background**: #F8F9FA (Light Gray)
- **Text**: #1F2937 (Dark Gray)

## 📝 Notes

- Les données sont actuellement mockées dans les ViewModels
- Les images proviennent d'Unsplash
- L'application est optimisée pour iOS et Android
- **Permissions requises** :
  - Localisation (foreground) pour la géolocalisation
  - Aucune autre permission nécessaire

## 🔐 Permissions

L'application demande les permissions suivantes :

### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show nearby destinations</string>
<key>NSCameraUsageDescription</key>
<string>We need access to your camera to take profile photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need access to your photo library to select profile photos</string>
```

### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🎯 Fonctionnalités Natives - Détails d'implémentation

### Géolocalisation
```typescript
// Utilisation dans le ViewModel
const location = await LocationService.getCurrentLocation();
// Retourne: { latitude, longitude, city?, country? }
```

### Stockage Local
```typescript
// Sauvegarder un favori
await StorageService.addFavorite(destinationId);
// Récupérer tous les favoris
const favorites = await StorageService.getFavorites();
```

### Haptic Feedback
```typescript
// Feedback léger (navigation, catégories)
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
// Feedback moyen (favoris)
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
// Feedback de succès (réservation)
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

### Dark Mode
```typescript
// Détection automatique
const colorScheme = useColorScheme(); // 'light' | 'dark'
const colors = Colors[colorScheme ?? 'light'];
```

### Carte Interactive
```typescript
// Affichage de la carte avec marqueur
<MapView
  initialRegion={{
    latitude: destination.coordinates.latitude,
    longitude: destination.coordinates.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker
    coordinate={destination.coordinates}
    title={destination.name}
  />
</MapView>
```

### Caméra / Galerie d'Images
```typescript
// Prendre une photo avec la caméra
const result = await ImagePicker.launchCameraAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});

// Sélectionner depuis la galerie
const result = await ImagePicker.launchImageLibraryAsync({
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.8,
});
```
