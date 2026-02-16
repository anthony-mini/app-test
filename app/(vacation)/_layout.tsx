import { Stack } from 'expo-router';

export default function VacationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="home" />
      <Stack.Screen name="conversations" options={{ headerShown: true }} />
      <Stack.Screen name="destination/[id]" />
      <Stack.Screen name="booking-confirmation" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
