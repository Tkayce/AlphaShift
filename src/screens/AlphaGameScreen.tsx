import { useRouter } from 'expo-router';
import { Lightbulb, RotateCcw, Settings, Trophy, XCircle } from 'lucide-react-native';
import React from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { s } from 'react-native-wind';
import { AlphaGrid } from '../components/AlphaGrid';
import { useSpellingEngine } from '../hooks/useSpellingEngine';

const AnimatedCounter = ({ label, value, accent }: { label: string; value: number | string; accent: string }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSequence(
      withTiming(1.12, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 220 })
    );
  }, [scale, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={s`bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex-1`}>
      <Text style={s`text-gray-400 text-xs font-bold uppercase tracking-widest`}>{label}</Text>
      <Animated.Text style={[s`text-xl font-medium text-white mt-1`, { color: accent }, animatedStyle]}>
        {value}
      </Animated.Text>
    </View>
  );
};

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
    maxAttempts,
    attemptsLeft,
    levelScore,
    passScore,
    revealUsesLeft,
    showErrorPopup,
    showLevelOverModal,
    canAdvanceFromLevelOver,
    replayLevel,
    closeLevelOverModal,
    advanceFromLevelOver,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    revealHint,
    currentLevelIndex,
  } = useSpellingEngine();

  const isHintActive = hintPath.length > 0;
  const canReveal = difficulty !== 'Easy' && !isHintActive && (revealUsesLeft === null || revealUsesLeft > 0);
  const revealLabel = revealUsesLeft === null ? 'Reveal Word' : `Reveal Word (${revealUsesLeft} left)`;
  const revealCounterText = revealUsesLeft === null ? '4' : String(revealUsesLeft);

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

        <View style={s`flex-row mb-4 gap-3`}>
          <AnimatedCounter label="Attempts Left" value={attemptsLeft} accent="#f97316" />
          <AnimatedCounter
            label={difficulty === 'Easy' ? 'Hints Locked' : 'Reveal Left'}
            value={difficulty === 'Easy' ? '0' : revealCounterText}
            accent={difficulty === 'Easy' ? '#64748b' : '#eab308'}
          />
          <View style={s`bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 flex-1`}>
            <Text style={s`text-slate-400 text-xs font-bold uppercase tracking-widest`}>Score</Text>
            <Text style={s`text-white text-xl font-black mt-1`}>{levelScore}</Text>
          </View>
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
          {difficulty !== 'Easy' && (
            <TouchableOpacity
              onPress={revealHint}
              disabled={!canReveal}
              style={[
                s`flex-row items-center bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800`,
                !canReveal && s`opacity-50`
              ]}
            >
              <Lightbulb color={canReveal ? "#f97316" : "#475569"} size={20} />
              <Text style={[s`ml-2 font-bold`, canReveal ? s`text-white` : s`text-slate-600`]}>{revealLabel}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => router.replace('/game')}
            style={s`flex-row items-center bg-slate-900 px-6 py-4 rounded-2xl border border-slate-800`}
          >
            <RotateCcw color="white" size={20} />
            <Text style={s`ml-2 text-white font-bold`}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={showLevelOverModal}
        animationType="fade"
        onRequestClose={closeLevelOverModal}
      >
        <View style={s`flex-1 items-center justify-center bg-black px-6`}>
          <View style={s`bg-black p-8 rounded-3xl w-full items-center border border-slate-800`}>
            <View style={s`w-16 h-16 bg-orange-600/20 rounded-2xl items-center justify-center`}>
              <Trophy color="#f97316" size={36} />
            </View>
            <Text style={s`text-white text-2xl font-bold mt-5`}>Game Over</Text>
            <Text style={s`text-slate-400 text-center mt-2`}>
              You used all {maxAttempts} attempts.
            </Text>

            <View style={s`w-full mt-6`}>
              <View style={s`flex-row items-center justify-between py-2`}>
                <Text style={s`text-gray-400 font-bold`}>Your Score</Text>
                <Text style={s`text-white font-bold`}>{levelScore}</Text>
              </View>
              <View style={s`flex-row items-center justify-between py-2`}>
                <Text style={s`text-gray-400 font-bold`}>Pass Score</Text>
                <Text style={s`text-white font-bold`}>{passScore}</Text>
              </View>
            </View>

            <View style={s`flex-row gap-3 mt-7 w-full`}>
              <TouchableOpacity
                onPress={replayLevel}
                style={[
                  s`bg-slate-800 px-6 py-4 rounded-2xl items-center border border-slate-700`,
                  canAdvanceFromLevelOver ? s`flex-1` : s`w-full`
                ]}
              >
                <Text style={s`text-white font-bold`}>Replay</Text>
              </TouchableOpacity>
              {canAdvanceFromLevelOver && (
                <TouchableOpacity
                  onPress={advanceFromLevelOver}
                  style={s`flex-1 px-6 py-4 rounded-2xl items-center border bg-orange-600 border-orange-500`}
                >
                  <Text style={s`text-white font-bold`}>Next Level</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={s`text-slate-500 text-xs text-center mt-5`}>
              Trace longer words and use hints wisely to raise your score.
            </Text>
          </View>
        </View>
      </Modal>

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
