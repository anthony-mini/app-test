import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { UserProfile } from '../models/User';
import StorageService from '../services/StorageService';

export const useUserProfileViewModel = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Traveler',
    email: 'traveler@vacation.com',
    phone: '',
    avatar: undefined,
    bio: '',
    location: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const savedProfile = await StorageService.getUserProfile();
      if (savedProfile) {
        setProfile(savedProfile);
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (updatedProfile: UserProfile): Promise<boolean> => {
    setIsSaving(true);
    try {
      const success = await StorageService.saveUserProfile(updatedProfile);
      if (success) {
        setProfile(updatedProfile);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      }
      return false;
    } catch (error) {
      if (__DEV__) console.error('Error saving profile:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select photos. Please enable it in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromCamera = async (): Promise<boolean> => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return false;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...profile, avatar: result.assets[0].uri };
        const success = await saveProfile(newProfile);
        if (success) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return false;
    }
  };

  const pickImageFromLibrary = async (): Promise<boolean> => {
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return false;

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newProfile = { ...profile, avatar: result.assets[0].uri };
        const success = await saveProfile(newProfile);
        if (success) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error picking image from library:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      return false;
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImageFromCamera(),
        },
        {
          text: 'Choose from Library',
          onPress: () => pickImageFromLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const updateProfile = async (field: keyof UserProfile, value: string): Promise<boolean> => {
    const updatedProfile = { ...profile, [field]: value };
    return await saveProfile(updatedProfile);
  };

  return {
    profile,
    isLoading,
    isSaving,
    saveProfile,
    updateProfile,
    pickImageFromCamera,
    pickImageFromLibrary,
    showImagePickerOptions,
  };
};
