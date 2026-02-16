import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerBackTitle: '',
        headerTitleStyle: {
          fontSize: 17,
          fontWeight: '600',
        },
      }}
    />
  );
}
