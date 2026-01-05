import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@vacation_app_favorites';
const USER_PREFERENCES_KEY = '@vacation_app_preferences';
const USER_PROFILE_KEY = '@vacation_app_user_profile';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async saveFavorites(favorites: string[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch (error) {
      console.error('Error saving favorites:', error);
      return false;
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  async addFavorite(destinationId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(destinationId)) {
        favorites.push(destinationId);
        return await this.saveFavorites(favorites);
      }
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  }

  async removeFavorite(destinationId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter((id) => id !== destinationId);
      return await this.saveFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  }

  async saveUserPreferences(preferences: any): Promise<boolean> {
    try {
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  async getUserPreferences(): Promise<any> {
    try {
      const preferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const profile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserAvatar(avatarUri: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile();
      if (profile) {
        profile.avatar = avatarUri;
        return await this.saveUserProfile(profile);
      }
      return false;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      return false;
    }
  }

  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

export default StorageService.getInstance();
