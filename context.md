Act as a senior React Native and Expo developer. Help me build an educational language-spelling connection puzzle game named "AlphaShift" inside this Expo SDK 56 project.

### Game Concept
- **Theme**: Educational Language Spelling Connection Puzzle
- **Target Audience**: Adults (Ages 15+)
- **Gameplay**: Touch & Trace Mechanic with Clue-Based Spelling. Also make this game compatible with web via mouse drag too (I am testing with expo web)
- **Language**: English
- **Difficulty**: Beginner to Intermediate


### Game Rules & Mechanics
1. Game Board: A 5x5 matrix grid populated with randomized alphabet character tiles.
2. The Educational Clue: A definition block is placed at the top of the screen (e.g., "Clue: A word that replaces a noun"). The secret answer is "PRONOUN".
3. Touch & Tracing Mechanic:
   - The player presses down on a starting letter tile and drags their finger to connect adjacent letter blocks (horizontally, vertically, or diagonally).
   - As the player drags, a vector line tracks their finger path, and a live preview text string builds up at the top showing the spelling assembly progress.
4. Verification & Progression:
   - When the user lifts their finger, if the spelled word matches the target answer for the clue, those letter blocks pop and flash green.
   - New letters cascade downward to refill the grid spaces. The user advances to the next level track.
   - If the player gets stuck, a "Reveal Hint" button can be tapped to highlight the first letter of the target word on the grid.
5. Level System:
   - Tracks unlock iteratively using expo-secure-store and web storage. Higher levels demand longer words, abstract vocabulary clues, and morpheme root combinations.

### Technical Stack & Implementation Constraints
- UI Styling Constraints:
  - We are using the `react-native-wind` package for layout styling via the `s` style function.
  - Do NOT use raw StyleSheet objects, standard NativeWind className strings, or `twrnc`.
  - Every component file that requires styling MUST explicitly use this exact import syntax at the top:
    import { s } from 'react-native-wind';
  - Apply layout structures directly using the `s` method:
    <View style={s`flex-1 bg-slate-950 items-center justify-center p-4`} />
  - Use conditional array styling with the `s` function to contrast active connection selections against background matrix pads:
    <View style={[s`w-12 h-12 m-1 rounded-2xl items-center justify-center bg-slate-900 border`, isSelected ? s`border-violet-400 bg-violet-950/40 scale-105` : s`border-slate-800`]} />
- Haptics: Integrate `expo-haptics`. Trigger a gentle selection tick on letters, and a triplet-vibe celebratory impact burst on typing out a correct semantic fit.

### Expected Architecture
Please generate a modular TypeScript structure:
1. `src/utils/dictionaryData.ts` - Contains the levels configuration array mapping clues to words and defining structural hint indexes.
2. `src/components/AlphaGrid.tsx` - Handles continuous dragging touch point position calculations relative to the 5x5 letter layouts.
3. `src/hooks/useSpellingEngine.ts` - Hook managing matrix population strings, evaluation triggers, letter drops, and local file storage indicators.
4. `src/screens/AlphaGameScreen.tsx` - Renders current clue panes, spelling buffers, grid arrays, and progress status tracking lines.
5. `src/screens/WelcomeScreen.tsx` - Displays the initial welcome screen with a button to navigate to the AlphaGameScreen. This should include a title and a brief description of the game, including "Start Game" to move to main game screen.
6. `src/screens/GameOverScreen.tsx` - Displays a game-over screen with a message, a score counter, and a button to restart the game.
7. `src/screens/SettingsScreen.tsx` - Displays a settings screen with options to adjust game difficulty, sound effects, and other preferences. The settings icon should be in the main screen, when clicked, it 

Please provide the implementation step-by-step, starting with the level dictionary arrays and cell coordinate boundary math hooks.


Build this game professionally and ensure it is compatible with web (I am testing with expo web)

We will use deep orange color, black for background, text in white, and buttons in deep orange and white (use where needed). 

