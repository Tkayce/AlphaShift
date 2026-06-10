import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { s } from "react-native-wind";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameProvider } from '../context/GameContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <View style={s`flex-1 bg-black`}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: 'black' }
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="levels" />
            <Stack.Screen name="game" />
            <Stack.Screen name="game-over" />
            <Stack.Screen name="settings" />
          </Stack>
        </View>
      </GameProvider>
    </GestureHandlerRootView>
  );
}
