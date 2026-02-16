import { Stack } from 'expo-router';

export default function AdvLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ad-banner" />
    </Stack>
  );
}
