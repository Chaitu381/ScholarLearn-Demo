import type {
  CategoryAccuracyPoint,
  CodingProblem,
  CurrentChallenge,
  DailyPracticeHoursPoint,
  DifficultyProgress,
  PracticeCategoryStats,
  PracticeHubStats,
  PracticeQuestion,
  ProblemSolvingTrendPoint,
  RecentPracticeSubmission,
  RecommendedPracticeItem,
  WeeklyProgressPoint,
} from "../types/codeconnect.types";

export const codingTopics = ["Arrays", "Strings", "Stacks", "Dynamic Programming"];

export const codeconnectCategoryStats: PracticeCategoryStats[] = [
  {
    category: "coding",
    label: "Coding",
    solved: 42,
    streakDays: 7,
    accuracy: 82,
    weakTopics: ["Dynamic Programming", "Graphs", "Recursion"],
  },
  {
    category: "aptitude",
    label: "Aptitude",
    solved: 0,
    accuracy: 0,
    weakTopics: [],
  },
  {
    category: "reasoning",
    label: "Reasoning",
    solved: 0,
    accuracy: 0,
    weakTopics: [],
  },
  {
    category: "verbal",
    label: "Verbal",
    solved: 0,
    accuracy: 0,
    weakTopics: [],
  },
];

export const codeconnectHubStats: PracticeHubStats = {
  totalSolved: 42,
  averageAccuracy: 82,
  activeStreakDays: 7,
  bestStreakDays: 15,
  practiceXp: 2480,
  currentLevel: "Level 8",
  weeklyGoal: {
    completed: 12,
    target: 20,
  },
  categories: codeconnectCategoryStats,
};

export const codeconnectDifficultyProgress: DifficultyProgress[] = [
  { difficulty: "easy", label: "Easy", solved: 22, total: 40 },
  { difficulty: "medium", label: "Medium", solved: 15, total: 45 },
  { difficulty: "hard", label: "Hard", solved: 5, total: 30 },
];

export const codeconnectCurrentChallenge: CurrentChallenge = {
  title: "Longest Substring Without Repeating Characters",
  topic: "Strings",
  difficulty: "medium",
  dueLabel: "Due today",
  recentSolvedProblem: "Valid Parentheses",
  nextProblem: "Merge Intervals",
};

export const codeconnectProblemSolvingTrend: ProblemSolvingTrendPoint[] = [
  { month: "Feb", solved: 18 },
  { month: "Mar", solved: 24 },
  { month: "Apr", solved: 29 },
  { month: "May", solved: 31 },
  { month: "Jun", solved: 38 },
  { month: "Jul", solved: 42 },
];

export const codeconnectDailyPracticeHours: DailyPracticeHoursPoint[] = [
  { day: "Mon", hours: 1.5 },
  { day: "Tue", hours: 2 },
  { day: "Wed", hours: 1.2 },
  { day: "Thu", hours: 2.6 },
  { day: "Fri", hours: 2.1 },
  { day: "Sat", hours: 3.3 },
  { day: "Sun", hours: 1.8 },
];

export const codeconnectWeeklyProgress: WeeklyProgressPoint[] = [
  { week: "W1", coding: 8, aptitude: 0, reasoning: 0, verbal: 0 },
  { week: "W2", coding: 10, aptitude: 0, reasoning: 0, verbal: 0 },
  { week: "W3", coding: 11, aptitude: 0, reasoning: 0, verbal: 0 },
  { week: "W4", coding: 13, aptitude: 0, reasoning: 0, verbal: 0 },
];

export const codeconnectCategoryAccuracy: CategoryAccuracyPoint[] = [
  { category: "Coding", accuracy: 82 },
  { category: "Aptitude", accuracy: 0 },
  { category: "Reasoning", accuracy: 0 },
  { category: "Verbal", accuracy: 0 },
];

export const codeconnectRecommendedProblems: RecommendedPracticeItem[] = [
  {
    id: "rec-merge-intervals",
    title: "Merge Intervals",
    category: "coding",
    topic: "Sorting",
    difficulty: "medium",
  },
  {
    id: "rec-time-work",
    title: "Time and Work Drill",
    category: "aptitude",
    topic: "Time and Work",
    difficulty: "medium",
  },
  {
    id: "rec-series",
    title: "Missing Number Series",
    category: "reasoning",
    topic: "Series",
    difficulty: "easy",
  },
  {
    id: "rec-error-spotting",
    title: "Error Spotting Set",
    category: "verbal",
    topic: "Grammar",
    difficulty: "medium",
  },
];

export const codeconnectRecentSubmissions: RecentPracticeSubmission[] = [
  {
    id: "sub-valid-parentheses",
    title: "Valid Parentheses",
    category: "coding",
    submittedAt: "Today, 9:20 AM",
    status: "accepted",
  },
];

export const codingProblems: CodingProblem[] = [
  {
    id: "coding-two-sum",
    problemNumber: 1,
    title: "Two Sum",
    topic: "Arrays",
    difficulty: "easy",
    status: "solved",
    accuracy: 84,
    solvedCount: 1240,
    description: "Find indices of two numbers that add up to a target.",
    statement: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    inputFormat: "nums array and target integer",
    outputFormat: "Two indices",
    constraints: ["2 <= nums.length <= 10^4", "Each input has one solution"],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "nums[0] + nums[1] = 9.",
      },
    ],
    hints: ["Use a hash map to remember complements."],
    solutionApproach: "Scan once and store value-to-index mappings.",
    complexity: "O(n) time, O(n) space",
    sampleInput: "[2,7,11,15], 9",
    sampleOutput: "[0,1]",
    starterCode: {
      java: "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0, 1}; } }",
      python: "def two_sum(nums, target):\n    return [0, 1]",
      javascript: "function twoSum(nums, target) {\n  return [0, 1];\n}",
      cpp: "vector<int> twoSum(vector<int>& nums, int target) { return {0, 1}; }",
    },
    testCases: [
      {
        id: "two-sum-case-1",
        input: "[2,7,11,15], 9",
        expectedOutput: "[0,1]",
        description: "Basic complement case",
      },
    ],
  },
  {
    id: "coding-valid-parentheses",
    problemNumber: 2,
    title: "Valid Parentheses",
    topic: "Stacks",
    difficulty: "easy",
    status: "in-progress",
    accuracy: 78,
    solvedCount: 980,
    description: "Determine whether bracket pairs close in valid order.",
    statement: "Given a string containing parentheses, determine if the input string is valid.",
    constraints: ["1 <= s.length <= 10^4"],
    examples: [{ input: "s = \"()[]{}\"", output: "true" }],
    sampleInput: "()[]{}",
    sampleOutput: "true",
  },
];

const baseAptitudeQuestions: Array<Omit<PracticeQuestion, "category" | "status">> = [
  {
    id: "apt-time-work-001",
    questionNumber: 1,
    topic: "Time and Work",
    difficulty: "easy",
    question: "A can finish a job in 12 days and B can finish it in 18 days. How many days will they take together?",
    options: ["6.2 days", "7.2 days", "8 days", "9 days"],
    correctAnswer: "7.2 days",
    explanation: "Combined work per day is 1/12 + 1/18 = 5/36, so time is 36/5 = 7.2 days.",
    points: 15,
  },
  {
    id: "apt-percentages-001",
    questionNumber: 2,
    topic: "Percentages",
    difficulty: "easy",
    question: "What is 18% of 250?",
    options: ["35", "40", "45", "50"],
    correctAnswer: "45",
    explanation: "18% of 250 is 0.18 x 250 = 45.",
    points: 15,
  },
  {
    id: "apt-profit-loss-001",
    questionNumber: 3,
    topic: "Profit and Loss",
    difficulty: "medium",
    question: "A product bought for 800 is sold for 920. What is the profit percentage?",
    options: ["12%", "15%", "18%", "20%"],
    correctAnswer: "15%",
    explanation: "Profit is 120. Profit percentage is 120/800 x 100 = 15%.",
    points: 25,
  },
  {
    id: "apt-ratio-001",
    questionNumber: 4,
    topic: "Ratio and Proportion",
    difficulty: "easy",
    question: "If A:B = 3:5 and B:C = 10:7, what is A:C?",
    options: ["3:7", "6:7", "9:14", "15:7"],
    correctAnswer: "6:7",
    explanation: "Make B common: A:B = 6:10 and B:C = 10:7, so A:C = 6:7.",
    points: 15,
  },
  {
    id: "apt-probability-001",
    questionNumber: 5,
    topic: "Probability",
    difficulty: "medium",
    question: "One card is drawn from a standard deck. What is the probability of drawing a king?",
    options: ["1/13", "1/26", "4/13", "1/52"],
    correctAnswer: "1/13",
    explanation: "There are 4 kings in 52 cards, so probability is 4/52 = 1/13.",
    points: 25,
  },
];

const baseReasoningQuestions: Array<Omit<PracticeQuestion, "category" | "status">> = [
  {
    id: "reasoning-series-001",
    questionNumber: 1,
    topic: "Series",
    difficulty: "easy",
    question: "Find the next number: 3, 6, 12, 24, ?",
    options: ["30", "36", "42", "48"],
    correctAnswer: "48",
    explanation: "Each term is doubled.",
    points: 15,
  },
  {
    id: "reasoning-blood-relations-001",
    questionNumber: 2,
    topic: "Blood Relations",
    difficulty: "medium",
    question: "Pointing to a woman, Ravi says, 'She is the daughter of my mother's only son.' Who is she to Ravi?",
    options: ["Sister", "Daughter", "Niece", "Mother"],
    correctAnswer: "Daughter",
    explanation: "Ravi's mother's only son is Ravi, so the woman is Ravi's daughter.",
    points: 25,
  },
  {
    id: "reasoning-direction-001",
    questionNumber: 3,
    topic: "Direction Sense",
    difficulty: "easy",
    question: "A person walks 5 km north, then 3 km east. In which direction is he from the start?",
    options: ["North", "East", "North-East", "South-East"],
    correctAnswer: "North-East",
    explanation: "He is both north and east of the starting point.",
    points: 15,
  },
  {
    id: "reasoning-syllogism-001",
    questionNumber: 4,
    topic: "Syllogism",
    difficulty: "medium",
    question: "All roses are flowers. Some flowers fade quickly. Which conclusion definitely follows?",
    options: ["All roses fade quickly", "Some roses fade quickly", "All roses are flowers", "No flower is a rose"],
    correctAnswer: "All roses are flowers",
    explanation: "Only the stated universal relation definitely follows.",
    points: 25,
  },
  {
    id: "reasoning-analogy-001",
    questionNumber: 5,
    topic: "Analogy",
    difficulty: "easy",
    question: "Book is to Reading as Fork is to ____.",
    options: ["Writing", "Eating", "Drawing", "Cooking"],
    correctAnswer: "Eating",
    explanation: "A book is used for reading; a fork is used for eating.",
    points: 15,
  },
];

const baseVerbalQuestions: Array<Omit<PracticeQuestion, "category" | "status">> = [
  {
    id: "verbal-synonyms-001",
    questionNumber: 1,
    topic: "Synonyms",
    difficulty: "easy",
    question: "Choose the synonym of 'Abundant'.",
    options: ["Scarce", "Plentiful", "Weak", "Brief"],
    correctAnswer: "Plentiful",
    explanation: "Abundant means present in large quantity.",
    points: 15,
    vocabularyNote: "Abundant is commonly used for resources, evidence, or opportunities.",
  },
  {
    id: "verbal-antonyms-001",
    questionNumber: 2,
    topic: "Antonyms",
    difficulty: "easy",
    question: "Choose the antonym of 'Expand'.",
    options: ["Grow", "Stretch", "Contract", "Increase"],
    correctAnswer: "Contract",
    explanation: "Contract means to become smaller, the opposite of expand.",
    points: 15,
  },
  {
    id: "verbal-error-spotting-001",
    questionNumber: 3,
    topic: "Error Spotting",
    difficulty: "medium",
    question: "Choose the correct sentence.",
    options: ["She go to college daily.", "She goes to college daily.", "She going to college daily.", "She gone to college daily."],
    correctAnswer: "She goes to college daily.",
    explanation: "The singular subject 'she' takes the verb 'goes' in simple present.",
    points: 25,
  },
  {
    id: "verbal-fill-blanks-001",
    questionNumber: 4,
    topic: "Fill in the Blanks",
    difficulty: "easy",
    question: "The teacher asked the students to _____ attention.",
    options: ["pay", "give", "make", "take"],
    correctAnswer: "pay",
    explanation: "The correct collocation is 'pay attention'.",
    points: 15,
  },
  {
    id: "verbal-reading-001",
    questionNumber: 5,
    topic: "Reading Comprehension",
    difficulty: "medium",
    passage: "A small team improved its mock test scores by reviewing every incorrect answer and grouping mistakes by topic.",
    question: "What helped the team improve its scores?",
    options: ["Skipping hard tests", "Reviewing wrong answers by topic", "Avoiding mock tests", "Only reading theory"],
    correctAnswer: "Reviewing wrong answers by topic",
    explanation: "The passage says the team reviewed every incorrect answer and grouped mistakes by topic.",
    points: 25,
  },
];

export const aptitudeQuestions: PracticeQuestion[] = expandQuestions(
  baseAptitudeQuestions,
  "aptitude",
  12,
);

export const reasoningQuestions: PracticeQuestion[] = expandQuestions(
  baseReasoningQuestions,
  "reasoning",
  12,
);

export const verbalQuestions: PracticeQuestion[] = expandQuestions(
  baseVerbalQuestions,
  "verbal",
  12,
);

function expandQuestions(
  questions: Array<Omit<PracticeQuestion, "category" | "status">>,
  category: PracticeQuestion["category"],
  targetCount: number,
): PracticeQuestion[] {
  return Array.from({ length: targetCount }, (_, index) => {
    const source = questions[index % questions.length];
    const suffix = (index + 1).toString().padStart(3, "0");

    return {
      ...source,
      id: `${source.id.slice(0, source.id.lastIndexOf("-") + 1)}${suffix}`,
      category,
      questionNumber: index + 1,
      status: index % 3 === 0 ? "in-progress" : "not-started",
    };
  });
}
