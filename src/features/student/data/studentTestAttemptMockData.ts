import type { StudentTestDetails } from "../types/student.types";

export const studentTestAttemptMockTests: StudentTestDetails[] = [
  {
    batch: "JFS-2026-A",
    durationMinutes: 45,
    instructions: [
      "The timer starts immediately after you click Start Test.",
      "Do not refresh, close, or leave the page during the attempt.",
      "Frontend locking is UX protection only. Final enforcement must also happen on the backend.",
      "You can submit early after reviewing all answers.",
    ],
    sections: [
      {
        id: "react-hooks-mcq",
        marks: 20,
        questions: [
          {
            correctOptionIndex: 1,
            id: "react-hooks-mcq-1",
            marks: 5,
            options: ["useClass", "useState", "createState", "stateOf"],
            questionText: "Which React hook is used to store local component state?",
          },
          {
            correctOptionIndex: 2,
            id: "react-hooks-mcq-2",
            marks: 5,
            options: ["Render the DOM", "Create CSS modules", "Run side effects", "Declare routes"],
            questionText: "What is the primary purpose of useEffect?",
          },
          {
            correctOptionIndex: 0,
            id: "react-hooks-mcq-3",
            marks: 5,
            options: ["useMemo", "useFetch", "useBind", "useStatic"],
            questionText: "Which hook can memoize an expensive computed value?",
          },
          {
            correctOptionIndex: 3,
            id: "react-hooks-mcq-4",
            marks: 5,
            options: ["In a loop", "Inside a callback", "Inside a condition", "At the top level of a component"],
            questionText: "Where should React hooks be called?",
          },
        ],
        sectionType: "MCQ",
        title: "MCQ",
      },
      {
        id: "react-hooks-qa",
        marks: 20,
        questions: [
          {
            expectedAnswer: "A dependency array controls when an effect re-runs by listing values the effect depends on.",
            id: "react-hooks-qa-1",
            marks: 10,
            questionText: "Explain the role of the dependency array in useEffect.",
          },
          {
            expectedAnswer: "Custom hooks extract reusable stateful logic and must follow the same hook rules.",
            id: "react-hooks-qa-2",
            marks: 10,
            questionText: "What is a custom hook and when would you create one?",
          },
        ],
        sectionType: "QA",
        title: "Question & Answer",
      },
      {
        id: "react-hooks-coding",
        marks: 30,
        questions: [
          {
            allowedLanguages: ["JavaScript", "TypeScript"],
            constraints: "Use React functional components. Do not mutate state directly.",
            id: "react-hooks-code-1",
            inputFormat: "A list of todo item strings.",
            marks: 30,
            outputFormat: "A working component that can add and remove todos.",
            problemStatement: "Build a simple TodoList component using useState. Include add and remove actions.",
            sampleInput: "['Read notes', 'Practice hooks']",
            sampleOutput: "Todo list renders two items and supports adding/removing items.",
            starterCode: "function TodoList() {\n  // write your solution here\n}\n",
            title: "Todo List With useState",
          },
        ],
        sectionType: "CODING",
        title: "Coding",
      },
    ],
    subject: "React",
    testId: "test-react-hooks-upcoming",
    testType: "WEEKLY",
    title: "React Hooks Checkpoint",
    totalMarks: 70,
  },
  {
    batch: "JFS-2026-A",
    durationMinutes: 60,
    instructions: [
      "This retake is timed and can only be submitted once in this frontend flow.",
      "Refresh restores the active timer from the original start time.",
      "Backend retake eligibility must be enforced server-side.",
    ],
    sections: [
      {
        id: "spring-security-mcq",
        marks: 20,
        questions: [
          {
            correctOptionIndex: 0,
            id: "spring-security-mcq-1",
            marks: 10,
            options: ["Authentication", "Serialization", "Compilation", "Hydration"],
            questionText: "Which term describes verifying a user's identity?",
          },
          {
            correctOptionIndex: 1,
            id: "spring-security-mcq-2",
            marks: 10,
            options: ["Repository", "Filter chain", "Bean scanner", "Template engine"],
            questionText: "Which Spring Security concept processes incoming HTTP requests?",
          },
        ],
        sectionType: "MCQ",
        title: "MCQ",
      },
      {
        id: "spring-security-qa",
        marks: 20,
        questions: [
          {
            expectedAnswer: "JWT carries signed claims and is validated by filters before protected resources are accessed.",
            id: "spring-security-qa-1",
            marks: 20,
            questionText: "Explain how JWT authentication fits into a Spring Security flow.",
          },
        ],
        sectionType: "QA",
        title: "Question & Answer",
      },
    ],
    subject: "Spring Boot",
    testId: "test-spring-security-retake",
    testType: "MOCK",
    title: "Spring Security Retake",
    totalMarks: 40,
  },
];

export function getMockStudentTestDetails(testId: string) {
  return studentTestAttemptMockTests.find((test) => test.testId === testId) ?? studentTestAttemptMockTests[0];
}
