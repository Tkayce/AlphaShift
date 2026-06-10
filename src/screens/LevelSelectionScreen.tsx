import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { s } from 'react-native-wind';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, Play } from 'lucide-react-native';
import { useSpellingEngine } from '../hooks/useSpellingEngine';

const LevelSelectionScreen = () => {
  const router = useRouter();
  const { filteredLevels, unlockedLevelCount, selectLevel, difficulty } = useSpellingEngine();

  return (
    <SafeAreaView style={s`flex-1 bg-black`}>
      <View style={s`flex-1 px-6 pt-4`}>
        {/* Header */}
        <View style={s`flex-row items-center mb-8`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={s`p-2 bg-slate-900 rounded-xl mr-4`}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View>
            <Text style={s`text-white text-2xl mt-2 font-bold`}>{difficulty} Levels</Text>
            <Text style={s`text-black text-sm`}>{unlockedLevelCount} / 20 Unlocked</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={s`flex-row flex-wrap justify-between pb-10`}>
          {filteredLevels.map((level, index) => {
            const isUnlocked = index < unlockedLevelCount;
            const isCurrent = index === unlockedLevelCount - 1;

            return (
              <TouchableOpacity
                key={level.id}
                disabled={!isUnlocked}
                onPress={() => selectLevel(level.id)}
                style={[
                  s`w-[30%] aspect-square mb-4 rounded-3xl items-center justify-center border-2`,
                  isUnlocked 
                    ? (isCurrent ? s`bg-orange-600 border-orange-400` : s`bg-black border-gray-500`)
                    : s`bg-black border-gray-500 opacity-60`
                ]}
              >
                {!isUnlocked ? (
                  <Lock color="#475569" size={24} />
                ) : (
                  <>
                    <Text style={[
                      s`text-xl font-bold`,
                      isCurrent ? s`text-white` : s`text-orange-500`
                    ]}>
                      {index + 1}
                    </Text>
                    {isCurrent && (
                      <View style={s`absolute -bottom-1 bg-white px-2 rounded-full`}>
                        <Text style={s`text-sm font-bold text-orange-600 uppercase`}>Next</Text>
                      </View>
                    )}
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default LevelSelectionScreen;
