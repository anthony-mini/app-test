# Vacation Booking Mobile App

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
- **Onboarding** : Présentation de l'app avec 3 slides
- **Page d'accueil** :
  - Barre de recherche
  - Filtres par catégories (Beach, Mountain, City, Countryside)
  - Liste de destinations populaires (scroll horizontal)
  - Recommandations personnalisées
- **Détails destination** :
  - Galerie d'images
  - Informations complètes (rating, prix, localisation)
  - Liste des équipements
  - Bouton de réservation
  - Système de favoris
- **Confirmation de réservation**

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

- **React Native** - Framework mobile
- **Expo** - Plateforme de développement
- **Expo Router** - Navigation basée sur les fichiers
- **TypeScript** - Typage statique
- **React Hooks** - Gestion d'état moderne

## 📦 Structure du projet

```
app-test/
├── models/              # Modèles de données
│   ├── Destination.ts
│   ├── Booking.ts
│   └── User.ts
├── viewmodels/          # Logique métier
│   ├── DestinationViewModel.ts
│   └── BookingViewModel.ts
├── app/                 # Vues (écrans)
│   ├── (vacation)/
│   │   ├── onboarding.tsx
│   │   ├── home.tsx
│   │   ├── destination/
│   │   │   └── [id].tsx
│   │   ├── booking-confirmation.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx
│   └── index.tsx
└── README-VACATION-APP.md
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
