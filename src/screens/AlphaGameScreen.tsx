import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { s } from 'react-native-wind';
import { useRouter } from 'expo-router';
import { Settings, Lightbulb, RotateCcw, XCircle } from 'lucide-react-native';
import { AlphaGrid } from '../components/AlphaGrid';
import { useSpellingEngine } from '../hooks/useSpellingEngine';

const AlphaGameScreen = () => {
  const router = useRouter();
  const {
    currentLevel,
    grid,
    selectedIndices,
    currentWord,
    isCorrect,
    hintPath,
    difficulty,
    showErrorPopup,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    revealHint,
    currentLevelIndex,
  } = useSpellingEngine();

  const isHintActive = hintPath.length > 0;

  return (
    <SafeAreaView style={s`flex-1 bg-black`}>
      <View style={s`flex-1 px-6 pt-4 pb-8`}>
        {/* Header */}
        <View style={s`flex-row justify-between items-center mb-8`}>
          <View>
            <View style={s`flex-row items-center gap-2`}>
              <Text style={s`text-slate-500 text-sm font-bold uppercase tracking-widest`}>
                Level {currentLevelIndex + 1}
              </Text>
              <View style={[
                s`px-2 py-0.5 rounded-full`,
                difficulty === 'Easy' ? s`bg-green-900/40` : difficulty === 'Medium' ? s`bg-yellow-900/40` : s`bg-red-900/40`
              ]}>
                <Text style={[
                  s`text-[10px] font-bold uppercase`,
                  difficulty === 'Easy' ? s`text-green-500` : difficulty === 'Medium' ? s`text-yellow-500` : s`text-red-500`
                ]}>
                  {difficulty}
                </Text>
              </View>
            </View>
            <Text style={s`text-white text-2xl font-bold`}>Alpha<Text style={s`text-orange-600`}>Shift</Text></Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/settings')}
            style={s`p-2 bg-slate-900 rounded-xl`}
          >
            <Settings color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Clue Section */}
        <View style={s`bg-slate-900 p-6 rounded-3xl mb-8 border border-slate-800`}>
          <Text style={s`text-orange-500 text-xs font-bold uppercase mb-2 tracking-widest`}>Clue</Text>
          <Text style={s`text-white text-lg font-medium leading-6`}>
            {currentLevel.clue}
          </Text>
        </View>

        {/* Live Preview */}
        <View style={s`h-16 items-center justify-center mb-4`}>
          <Text 
            style={[
              s`text-4xl font-black tracking-widest`,
              isCorrect === true ? s`text-green-500` : isCorrect === false ? s`text-red-500` : s`text-white`
            ]}
          >
            {currentWord || ' '}
          </Text>
          <View style={s`w-full h-1 bg-slate-900 mt-2 rounded-full overflow-hidden`}>
            <View 
              style={[
                s`h-full bg-orange-600`,
                { width: `${(currentWord.length / currentLevel.word.length) * 100}%` }
              ]} 
            />
          </View>
        </View>

        {/* Grid Section */}
        <View style={s`flex-1 justify-center`}>
          <AlphaGrid
            grid={grid}
            selectedIndices={selectedIndices}
            isCorrect={isCorrect}
            hintPath={hintPath}
            targetWord={currentLevel.word}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        </View>

        {/* Actions Section */}
        <View style={s`flex-row justify-center mt-8 gap-4`}>
          <TouchableOpacity
            onPress={revealHint}
            disabled={isHintActive}
            style={[
              s`flex-row items-center bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800`, 
              isHintActive && s`opacity-50`
            ]}
          >
            <Lightbulb color={isHintActive ? "#475569" : "#f97316"} size={20} />
            <Text style={[s`ml-2 font-bold`, isHintActive ? s`text-slate-600` : s`text-white`]}>Reveal Word</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace('/game')}
            style={s`flex-row items-center bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800`}
          >
            <RotateCcw color="white" size={20} />
            <Text style={s`ml-2 text-white font-bold`}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Popup */}
      <Modal
        transparent={true}
        visible={showErrorPopup}
        animationType="fade"
      >
        <View style={s`flex-1 items-center justify-center bg-black/60`}>
          <View style={s`bg-slate-900 p-8 rounded-3xl items-center border border-red-900/50`}>
            <XCircle color="#ef4444" size={48} />
            <Text style={s`text-white text-xl font-bold mt-4`}>Not quite!</Text>
            <Text style={s`text-slate-400 text-center mt-2`}>
              That's not the word we're looking for.
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AlphaGameScreen;
