import { useRouter } from 'expo-router';
import { Lightbulb, MousePointer2, Sparkles, Trophy } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { s } from 'react-native-wind';

const WelcomeScreen = () => {
  const router = useRouter();

  const instructions = [
    {
      icon: MousePointer2,
      title: "Touch & Trace",
      desc: "Press and drag horizontally or vertically to connect letters."
    },
    {
      icon: Lightbulb,
      title: "Solve Puzzles",
      desc: "Use the educational clue at the top to find the secret word."
    },
    {
      icon: Trophy,
      title: "Level Up",
      desc: "Correct words pop and advance you to the next challenge."
    }
  ];

  return (
    <ScrollView contentContainerStyle={s`flex-grow bg-black items-center justify-center p-6`}>
      <View style={s`items-center mb-10`}>
        <View style={s`w-20 h-20 bg-orange-600 rounded-3xl items-center justify-center mb-6`}>
          <Sparkles color="white" size={40} />
        </View>
        <Text style={s`text-white text-5xl font-bold tracking-tighter mb-2`}>
          Alpha<Text style={s`text-orange-600`}>Shift</Text>
        </Text>
        <Text style={s`text-slate-400 text-lg text-center px-4`}>
          The educational word connection game.
        </Text>
      </View>

      {/* How to Play Section */}
      <View style={s`w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-6 mb-10`}>
        <Text style={s`text-white text-xl font-bold mb-6 text-center`}>How to Play</Text>
        <View style={s`gap-6`}>
          {instructions.map((item, idx) => (
            <View key={idx} style={s`flex-row items-start`}>
              <View style={s`p-2 bg-orange-600/20 rounded-xl mr-4`}>
                <item.icon color="#f97316" size={20} />
              </View>
              <View style={s`flex-1`}>
                <Text style={s`text-white font-bold mb-1`}>{item.title}</Text>
                <Text style={s`text-slate-400 text-sm leading-5`}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/levels')}
        style={s`bg-orange-600 px-12 py-4 rounded-2xl w-full items-center shadow-lg shadow-orange-600/20`}
      >
        <Text style={s`text-white text-xl font-bold`}>Start Game</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/settings')}
        style={s`mt-6 py-2`}
      >
        <Text style={s`text-slate-500 text-base font-medium`}>Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default WelcomeScreen;
