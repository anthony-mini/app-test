# Fonctionnalités Natives - Documentation Complète

Cette application de réservation de vacances implémente **4 fonctionnalités natives** conformément aux exigences du projet.

## ✅ 1. Géolocalisation (expo-location)

### Description
Utilisation de la géolocalisation GPS pour détecter la position de l'utilisateur et afficher sa ville/pays.

### Implémentation
- **Service**: `services/LocationService.ts`
- **Singleton pattern** pour gérer l'instance unique
- **Permissions**: Demande automatique au premier accès
- **Géocodage inversé**: Conversion coordonnées → ville/pays

### Fonctionnalités
- Récupération de la position GPS (latitude/longitude)
- Géocodage inversé pour obtenir ville et pays
- Calcul de distance entre deux points
- Cache de la dernière position connue
- Gestion des erreurs et permissions refusées

### Utilisation dans l'app
```typescript
// Dans DestinationViewModel
const location = await LocationService.getCurrentLocation();
setUserLocation(location);

// Affichage dans home.tsx
{userLocation ? `${userLocation.city || 'Your location'}` : 'Where do you want to go?'}
```

### Permissions requises
- **iOS**: `NSLocationWhenInUseUsageDescription`
- **Android**: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`

---

## ✅ 2. Stockage Local (AsyncStorage)

### Description
Persistance des données locales (favoris, préférences) avec AsyncStorage.

### Implémentation
- **Service**: `services/StorageService.ts`
- **Singleton pattern**
- **Clés de stockage**: `@vacation_app_favorites`, `@vacation_app_preferences`

### Fonctionnalités
- Sauvegarde/récupération des favoris
- Ajout/suppression d'un favori
- Sauvegarde des préférences utilisateur
- Nettoyage complet du stockage

### Utilisation dans l'app
```typescript
// Sauvegarder un favori
await StorageService.addFavorite(destinationId);

// Récupérer tous les favoris
const favorites = await StorageService.getFavorites();

// Supprimer un favori
await StorageService.removeFavorite(destinationId);
```

### Persistance
- Les favoris sont chargés automatiquement au démarrage
- Sauvegarde instantanée à chaque modification
- Survit aux redémarrages de l'application

---

## ✅ 3. Vibration / Haptic Feedback (expo-haptics)

### Description
Feedback haptique pour améliorer l'expérience utilisateur lors des interactions.

### Implémentation
- **Package**: `expo-haptics` (déjà inclus dans Expo)
- **3 types de feedback** utilisés

### Types de feedback
1. **Light** - Interactions légères (navigation, catégories)
2. **Medium** - Actions importantes (favoris)
3. **Success** - Confirmations (réservation réussie)

### Utilisation dans l'app

#### Onboarding
```typescript
// Navigation entre slides
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Démarrage de l'app
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

#### Page d'accueil
```typescript
// Sélection de catégorie
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Toggle favori
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
```

#### Détails destination
```typescript
// Retour arrière
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Toggle favori
await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Réservation
await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
```

#### Confirmation
```typescript
// Affichage automatique
useEffect(() => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}, []);
```

---

## ✅ 4. Dark / Light Mode (API système)

### Description
Support complet du mode sombre avec détection automatique du thème système.

### Implémentation
- **Hook**: `useColorScheme()` de React Native
- **Palettes**: `constants/Colors.ts`
- **Contexte**: `contexts/ThemeContext.tsx` (optionnel)

### Palettes de couleurs

#### Light Mode
```typescript
{
  primary: '#6366F1',      // Indigo
  secondary: '#8B5CF6',    // Purple
  success: '#10B981',      // Green
  warning: '#FFD700',      // Gold
  error: '#FF6B6B',        // Red
  background: '#F8F9FA',   // Light Gray
  card: '#FFFFFF',         // White
  text: '#1F2937',         // Dark Gray
  textSecondary: '#6B7280',// Medium Gray
  border: '#E5E7EB',       // Light Border
}
```

#### Dark Mode
```typescript
{
  primary: '#818CF8',      // Light Indigo
  secondary: '#A78BFA',    // Light Purple
  success: '#34D399',      // Light Green
  warning: '#FCD34D',      // Light Gold
  error: '#F87171',        // Light Red
  background: '#111827',   // Dark Gray
  card: '#1F2937',         // Medium Dark
  text: '#F9FAFB',         // White
  textSecondary: '#9CA3AF',// Light Gray
  border: '#374151',       // Dark Border
}
```

### Utilisation dans l'app
```typescript
// Dans chaque écran
const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? 'light'];

// Application des couleurs
<View style={[styles.container, { backgroundColor: colors.background }]}>
  <Text style={{ color: colors.text }}>Hello</Text>
</View>
```

### Écrans supportant le dark mode
- ✅ Onboarding
- ✅ Home
- ✅ Destination Details
- ✅ Booking Confirmation

---

## ✅ 5. Carte Interactive (react-native-maps)

### Description
Affichage de cartes interactives avec marqueurs pour visualiser l'emplacement exact des destinations.

### Implémentation
- **Package**: `react-native-maps`
- **Provider**: Google Maps (iOS et Android)
- **Coordonnées GPS**: Latitude/longitude pour chaque destination

### Fonctionnalités
- Carte interactive avec zoom et défilement
- Marqueur personnalisé pour chaque destination
- Info-bulle avec nom et localisation
- Bouton "Open in Maps" avec haptic feedback
- Coordonnées GPS réelles pour toutes les destinations

### Coordonnées des destinations
- **Bali Beach Resort**: -8.6705, 115.2126 (Seminyak, Indonésie)
- **Swiss Alps Chalet**: 45.9763, 7.6586 (Zermatt, Suisse)
- **Tokyo City Hotel**: 35.6762, 139.6503 (Shibuya, Japon)
- **Santorini Villa**: 36.4618, 25.3753 (Oia, Grèce)

### Utilisation dans l'app
```typescript
// Dans destination/[id].tsx
<MapView
  style={styles.map}
  provider={PROVIDER_GOOGLE}
  initialRegion={{
    latitude: destination.coordinates.latitude,
    longitude: destination.coordinates.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
  scrollEnabled={true}
  zoomEnabled={true}
>
  <Marker
    coordinate={{
      latitude: destination.coordinates.latitude,
      longitude: destination.coordinates.longitude,
    }}
    title={destination.name}
    description={`${destination.location}, ${destination.country}`}
  />
</MapView>
```

### Configuration requise
- **iOS**: Aucune configuration supplémentaire
- **Android**: Google Maps API key (optionnel pour dev)

---

## 📊 Résumé des Fonctionnalités

| Fonctionnalité | Package | Implémentation | Écrans |
|----------------|---------|----------------|---------|
| **Géolocalisation** | `expo-location` | `LocationService.ts` | Home |
| **Stockage Local** | `@react-native-async-storage/async-storage` | `StorageService.ts` | Home, Details |
| **Haptic Feedback** | `expo-haptics` | Inline dans les écrans | Tous |
| **Dark Mode** | React Native API | `Colors.ts` + `useColorScheme()` | Tous |
| **Carte Interactive** | `react-native-maps` | MapView + Marker | Details |

## 🎯 Conformité aux Exigences

✅ **AU MOINS 2 fonctionnalités natives** → **5 implémentées**

1. ✅ Géolocalisation
2. ✅ Stockage local (AsyncStorage)
3. ✅ Vibration (Haptic Feedback)
4. ✅ Dark / Light mode (API système)
5. ✅ Carte Interactive (Maps)

## 🧪 Tests

### Tester la géolocalisation
1. Lancer l'app
2. Accepter les permissions de localisation
3. Vérifier que la ville s'affiche dans le header

### Tester le stockage local
1. Ajouter des favoris (icône cœur)
2. Fermer et relancer l'app
3. Vérifier que les favoris sont toujours là

### Tester le haptic feedback
1. Naviguer entre les catégories → Vibration légère
2. Ajouter/retirer un favori → Vibration moyenne
3. Réserver une destination → Vibration de succès

### Tester le dark mode
1. Activer le mode sombre dans les paramètres système
2. Relancer l'app
3. Vérifier que tous les écrans sont en mode sombre

### Tester la carte interactive
1. Ouvrir les détails d'une destination
2. Scroller jusqu'à la section "Location"
3. Vérifier que la carte s'affiche avec le marqueur
4. Zoomer et déplacer la carte
5. Taper sur le marqueur pour voir les infos

## 📱 Compatibilité

- **iOS**: ✅ Toutes les fonctionnalités supportées
- **Android**: ✅ Toutes les fonctionnalités supportées
- **Web**: ⚠️ Géolocalisation et haptics limités

## 🔧 Installation des dépendances

```bash
npm install @react-native-async-storage/async-storage expo-location
npx expo install react-native-maps
```

Note: `expo-haptics` est déjà inclus dans le SDK Expo.
