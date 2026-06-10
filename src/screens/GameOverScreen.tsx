import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { s } from 'react-native-wind';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';

const GameOverScreen = () => {
  const router = useRouter();

  return (
    <View style={s`flex-1 bg-black items-center justify-center p-6`}>
      <View style={s`items-center mb-12`}>
        <View style={s`w-24 h-24 bg-green-600 rounded-full items-center justify-center mb-6`}>
          <Trophy color="white" size={48} />
        </View>
        <Text style={s`text-white text-4xl font-bold mb-2`}>Congratulations!</Text>
        <Text style={s`text-slate-400 text-lg text-center`}>
          You've completed all available levels in AlphaShift.
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.replace('/')}
        style={s`bg-orange-600 px-12 py-4 rounded-2xl w-full items-center`}
      >
        <Text style={s`text-white text-xl font-bold`}>Back to Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

export default GameOverScreen;
