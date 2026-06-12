import { useRouter } from 'expo-router';
import { ArrowLeft, Lock } from 'lucide-react-native';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';
import { useSpellingEngine } from '../hooks/useSpellingEngine';

const LevelSelectionScreen = () => {
  const router = useRouter();
  const { filteredLevels, unlockedLevelCount, selectLevel, difficulty } = useSpellingEngine();

  return (
    <SafeAreaView style={s`flex-1 bg-black`}>
      <View style={s`flex-1 px-6 pt-4`}>
        {/* Header */}
        <View style={s`flex-row items-center mb-6`}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={s`p-2 bg-slate-900 rounded-xl mr-4`}
          >
            <ArrowLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={s`flex-1`}>
            <Text style={s`text-white text-2xl font-bold`}>{difficulty} Levels</Text>
            <Text style={s`text-slate-400 text-sm mt-1`}>Choose a level and keep your streak alive.</Text>
          </View>
        </View>

        <View style={s`bg-slate-900 border border-slate-800 rounded-3xl p-4 mb-6`}>
          <View style={s`flex-row items-center justify-between`}>
            <View>
              <Text style={s`text-slate-500 text-xs font-bold uppercase tracking-widest`}>Unlocked</Text>
              <Text style={s`text-white text-2xl font-black mt-1`}>{unlockedLevelCount} / 20</Text>
            </View>
            <View style={s`bg-orange-600/15 border border-orange-500/30 rounded-2xl px-4 py-3`}>
              <Text style={s`text-orange-500 text-xs font-bold uppercase tracking-widest`}>Current Difficulty</Text>
              <Text style={s`text-white font-bold mt-1`}>{difficulty}</Text>
            </View>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s`flex-row flex-wrap justify-between pb-10`}>
          {filteredLevels.map((level, index) => {
            const isUnlocked = index < unlockedLevelCount;
            const isCurrent = index === unlockedLevelCount - 1;

            return (
              <TouchableOpacity
                key={level.id}
                disabled={!isUnlocked}
                onPress={() => selectLevel(level.id)}
                style={[
                  s`w-[31%] aspect-square mb-4 rounded-2xl items-center justify-center border`,
                  isUnlocked 
                    ? (isCurrent ? s`bg-orange-600/15 border-orange-500` : s`bg-slate-900 border-slate-800`)
                    : s`bg-slate-950 border-slate-800 opacity-70`
                ]}
              >
                {!isUnlocked ? (
                  <>
                    <Lock color="#475569" size={22} />
                    <Text style={s`text-gray-500 text-xs font-bold mt-2`}>Locked</Text>
                  </>
                ) : (
                  <>
                    <View
                      style={[
                        s`absolute top-3 right-3 rounded-full px-3 py-1`,
                        isCurrent ? s`` : s``,
                      ]}
                    >
                      {/* <Text style={[s`text-xs   font-bold uppercase`, isCurrent ? s`text-white` : s`text-slate-400`]}>
                        {isCurrent ? '' : ''}
                      </Text> */}
                    </View>
                    <Text style={[
                      s`text-3xl font-medium`,
                      isCurrent ? s`text-orange-500` : s`text-white`
                    ]}>
                      {index + 1}
                    </Text>
                    <Text style={[s`text-xs font-sm mt-2 uppercase p-2`, isCurrent ? s`text-orange-400` : s`text-gray-500`]}>
                      {isCurrent ? 'Current' : 'Played'}
                    </Text>
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
