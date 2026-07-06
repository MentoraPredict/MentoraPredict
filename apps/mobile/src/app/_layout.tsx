import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerTitle: 'MentoraPredict Mobile',
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
