export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface LevelData {
  id: number;
  clue: string;
  word: string;
  difficulty: Difficulty;
}

export const LEVELS: LevelData[] = [
  // --- EASY (20 Levels) ---
  { id: 1, clue: "A domestic animal that meows", word: "CAT", difficulty: 'Easy' },
  { id: 2, clue: "The color of the sky on a clear day", word: "BLUE", difficulty: 'Easy' },
  { id: 3, clue: "Something you use to open a locked door", word: "KEY", difficulty: 'Easy' },
  { id: 4, clue: "A fruit that is often red and crunchy", word: "APPLE", difficulty: 'Easy' },
  { id: 5, clue: "The star at the center of our solar system", word: "SUN", difficulty: 'Easy' },
  { id: 6, clue: "You wear these on your feet", word: "SHOES", difficulty: 'Easy' },
  { id: 7, clue: "The liquid that falls from clouds", word: "RAIN", difficulty: 'Easy' },
  { id: 8, clue: "A place where you live", word: "HOME", difficulty: 'Easy' },
  { id: 9, clue: "You use this to write on paper", word: "PEN", difficulty: 'Easy' },
  { id: 10, clue: "A large body of salt water", word: "OCEAN", difficulty: 'Easy' },
  { id: 11, clue: "The opposite of cold", word: "HOT", difficulty: 'Easy' },
  { id: 12, clue: "A structure for birds to live in", word: "NEST", difficulty: 'Easy' },
  { id: 13, clue: "The time after sunset", word: "NIGHT", difficulty: 'Easy' },
  { id: 14, clue: "Something you read", word: "BOOK", difficulty: 'Easy' },
  { id: 15, clue: "The organ used for sight", word: "EYE", difficulty: 'Easy' },
  { id: 16, clue: "A person's best friend (animal)", word: "DOG", difficulty: 'Easy' },
  { id: 17, clue: "The color of grass", word: "GREEN", difficulty: 'Easy' },
  { id: 18, clue: "Something you sit on", word: "CHAIR", difficulty: 'Easy' },
  { id: 19, clue: "A source of light in a room", word: "LAMP", difficulty: 'Easy' },
  { id: 20, clue: "A young human", word: "CHILD", difficulty: 'Easy' },

  // --- MEDIUM (20 Levels) ---
  { id: 21, clue: "A large vehicle for passengers", word: "BUS", difficulty: 'Medium' },
  { id: 22, clue: "A place for learning", word: "SCHOOL", difficulty: 'Medium' },
  { id: 23, clue: "Season after summer", word: "AUTUMN", difficulty: 'Medium' },
  { id: 24, clue: "A device for taking photos", word: "CAMERA", difficulty: 'Medium' },
  { id: 25, clue: "The capital city of France", word: "PARIS", difficulty: 'Medium' },
  { id: 26, clue: "A large musical instrument with keys", word: "PIANO", difficulty: 'Medium' },
  { id: 27, clue: "Something that tells the time", word: "CLOCK", difficulty: 'Medium' },
  { id: 28, clue: "A structure that crosses water", word: "BRIDGE", difficulty: 'Medium' },
  { id: 29, clue: "A small computer you carry", word: "LAPTOP", difficulty: 'Medium' },
  { id: 30, clue: "A colorful arch in the sky after rain", word: "RAINBOW", difficulty: 'Medium' },
  { id: 31, clue: "A person who cooks in a restaurant", word: "CHEF", difficulty: 'Medium' },
  { id: 32, clue: "The largest planet in our solar system", word: "JUPITER", difficulty: 'Medium' },
  { id: 33, clue: "A building for exercise", word: "GYM", difficulty: 'Medium' },
  { id: 34, clue: "A person who treats sick people", word: "DOCTOR", difficulty: 'Medium' },
  { id: 35, clue: "Something you use to brush your hair", word: "COMB", difficulty: 'Medium' },
  { id: 36, clue: "A large area covered with trees", word: "FOREST", difficulty: 'Medium' },
  { id: 37, clue: "A vehicle that travels through space", word: "ROCKET", difficulty: 'Medium' },
  { id: 38, clue: "A shape with three sides", word: "TRIANGLE", difficulty: 'Medium' },
  { id: 39, clue: "A soft thing you put your head on in bed", word: "PILLOW", difficulty: 'Medium' },
  { id: 40, clue: "A small, long-eared animal", word: "RABBIT", difficulty: 'Medium' },

  // --- HARD (20 Levels) ---
  { id: 41, clue: "Design and build machines", word: "ENGINEER", difficulty: 'Hard' },
  { id: 42, clue: "Natural satellite of Earth", word: "MOON", difficulty: 'Hard' },
  { id: 43, clue: "Device for photography", word: "CAMERA", difficulty: 'Hard' },
  { id: 44, clue: "The study of the mind", word: "PSYCHOLOGY", difficulty: 'Hard' },
  { id: 45, clue: "A person who travels in space", word: "ASTRONAUT", difficulty: 'Hard' },
  { id: 46, clue: "The process of light to energy", word: "PHOTOSYNTHESIS", difficulty: 'Hard' },
  { id: 47, clue: "A complex set of instructions", word: "ALGORITHM", difficulty: 'Hard' },
  { id: 48, clue: "The layer of air around Earth", word: "ATMOSPHERE", difficulty: 'Hard' },
  { id: 49, clue: "A large prehistoric reptile", word: "DINOSAUR", difficulty: 'Hard' },
  { id: 50, clue: "A place for scientific research", word: "LABORATORY", difficulty: 'Hard' },
  { id: 51, clue: "The smallest unit of an element", word: "ATOM", difficulty: 'Hard' },
  { id: 52, clue: "A deep crack in the Earth's surface", word: "CANYON", difficulty: 'Hard' },
  { id: 53, clue: "The force that pulls objects down", word: "GRAVITY", difficulty: 'Hard' },
  { id: 54, clue: "A building for art or history", word: "MUSEUM", difficulty: 'Hard' },
  { id: 55, clue: "A massive explosion of a star", word: "SUPERNOVA", difficulty: 'Hard' },
  { id: 56, clue: "The study of heredity", word: "GENETICS", difficulty: 'Hard' },
  { id: 57, clue: "A geometric solid with six faces", word: "CUBE", difficulty: 'Hard' },
  { id: 58, clue: "A period of one thousand years", word: "MILLENNIUM", difficulty: 'Hard' },
  { id: 59, clue: "A very large, ice-covered continent", word: "ANTARCTICA", difficulty: 'Hard' },
  { id: 60, clue: "The main source of Earth's heat", word: "GEOTHERMAL", difficulty: 'Hard' },
];
