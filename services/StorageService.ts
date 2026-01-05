import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@vacation_app_favorites';
const USER_PREFERENCES_KEY = '@vacation_app_preferences';

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
