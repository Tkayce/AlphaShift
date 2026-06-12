import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Flame, Info, Shield, Volume2, Zap } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';
import { useSpellingEngine } from '../hooks/useSpellingEngine';
import { Difficulty } from '../utils/dictionaryData';

const SettingsScreen = () => {
  const router = useRouter();
  const { difficulty, updateDifficulty, resetGame, soundEnabled, setSoundEnabled, filteredLevels, getBestScore } = useSpellingEngine();
  const [hapticsEnabled, setHapticsEnabled] = React.useState(true);

  const difficulties: { label: Difficulty; icon: any; color: string }[] = [
    { label: 'Easy', icon: Shield, color: 'text-green-500' },
    { label: 'Medium', icon: Zap, color: 'text-yellow-500' },
    { label: 'Hard', icon: Flame, color: 'text-red-500' },
  ];

  return (
    <SafeAreaView style={s`flex-1 bg-black`}>
      <ScrollView style={s`flex-1 px-6 pt-4`}>
        {/* Header */}
        <View style={s`flex-row mt-2 items-center mb-10`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={s`p-2 bg-slate-900 rounded-xl mr-4`}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <Text style={s`text-white text-2xl font-bold`}>Settings</Text>
        </View>

        {/* Difficulty Section */}
        <Text style={s`text-slate-500 text-sm font-bold uppercase tracking-widest mb-4`}>Game Difficulty</Text>
        <View style={s`flex-row gap-3 mb-10`}>
          {difficulties.map((d) => (
            <TouchableOpacity
              key={d.label}
              onPress={() => updateDifficulty(d.label)}
              style={[
                s`flex-1 items-center justify-center p-4 rounded-2xl border-2`,
                difficulty === d.label 
                  ? s`bg-orange-600/20 border-orange-600` 
                  : s`bg-slate-900 border-slate-800`
              ]}
            >
              <d.icon color={difficulty === d.label ? "#f97316" : "#475569"} size={24} />
              <Text style={[
                s`mt-2 font-bold`,
                difficulty === d.label ? s`text-white` : s`text-slate-500`
              ]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* General Options */}
        <Text style={s`text-slate-500 text-sm font-bold uppercase tracking-widest mb-4`}>Preferences</Text>
        <View style={s`bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 mb-10`}>
          <View style={s`flex-row items-center justify-between p-5 border-b border-slate-800`}>
            <View style={s`flex-row items-center`}>
              <Bell color="#f97316" size={20} />
              <Text style={s`text-white text-lg ml-3`}>Haptic Feedback</Text>
            </View>
            <Switch 
              value={hapticsEnabled} 
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#1e293b', true: '#ea580c' }}
              thumbColor="white"
            />
          </View>

          <View style={s`flex-row items-center justify-between p-5 border-b border-slate-800`}>
            <View style={s`flex-row items-center`}>
              <Volume2 color="#f97316" size={20} />
              <Text style={s`text-white text-lg ml-3`}>Sound Effects</Text>
            </View>
            <Switch 
              value={soundEnabled} 
              onValueChange={(next) => { void setSoundEnabled(next); }}
              trackColor={{ false: '#1e293b', true: '#ea580c' }}
              thumbColor="white"
            />
          </View>

          <View style={s`flex-row items-center justify-between p-5`}>
            <View style={s`flex-row items-center`}>
              <Info color="#f97316" size={20} />
              <Text style={s`text-white text-lg ml-3`}>About AlphaShift</Text>
            </View>
            <Text style={s`text-slate-500`}>v1.1.0</Text>
          </View>
        </View>

        <Text style={s`text-gray-500 text-sm font-bold uppercase tracking-widest mb-4`}>Best Scores</Text>
        <View style={s`bg-gray-900 rounded-3xl border border-gray-800 p-4 mb-10`}>
          <View style={s`flex-row flex-wrap justify-between`}>
            {filteredLevels.map((level, idx) => {
            const score = getBestScore(level.id);
            return (
              <View
                key={level.id}
                style={s`w-[48%] bg-black border border-gray-800 rounded-2xl p-4 mb-3`}
              >
                <Text style={s`text-gray-500 text-xs font-bold uppercase tracking-widest`}>Level {idx + 1}</Text>
                <Text style={s`text-white text-xl font-black mt-2`}>{score > 0 ? score : '-'}</Text>
                <Text style={s`text-gray-500 text-xs mt-1`}>{score > 0 ? 'Best run' : 'No score yet'}</Text>
              </View>
            );
            })}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            resetGame();
            router.replace('/');
          }}
          style={s`mb-12 bg-red-900/20 border border-red-900/50 p-4 rounded-2xl items-center`}
        >
          <Text style={s`text-red-500 font-bold`}>Reset All Progress</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;
