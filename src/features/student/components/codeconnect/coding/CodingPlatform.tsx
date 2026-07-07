import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { codingProblems } from "../../../data/codeconnectMockData";
import type {
  CodingExecutionResult,
  CodingLanguage,
  CodingProblem,
  Difficulty,
} from "../../../types/codeconnect.types";
import { CodeEditor } from "./CodeEditor";
import { OutputPanel } from "./OutputPanel";
import { ProblemTabs } from "./ProblemTabs";

type CodingPlatformProps = {
  initialProblemId?: string;
};

const difficultyClasses: Record<Difficulty, string> = {
  easy: "bg-primary-soft text-primary-dark",
  medium: "bg-orange-soft text-orange",
  hard: "bg-red-soft text-red",
};

const initialProblemIndex = Math.max(
  codingProblems.findIndex(
    (problem) => problem.id === "coding-longest-substring",
  ),
  0,
);

export function CodingPlatform({
  initialProblemId,
}: CodingPlatformProps) {
  const requestedProblemIndex = codingProblems.findIndex(
    (problem) => problem.id === initialProblemId,
  );

  const resolvedInitialProblemIndex =
    requestedProblemIndex >= 0 ? requestedProblemIndex : initialProblemIndex;

  const [selectedProblemIndex, setSelectedProblemIndex] = useState(
    resolvedInitialProblemIndex,
  );
  const [language, setLanguage] = useState<CodingLanguage>("java");
  const [connectedFriend, setConnectedFriend] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSyncedCode, setHasSyncedCode] = useState(false);

  const problem = codingProblems[selectedProblemIndex];

  const starterCode = useMemo(
    () => getStarterCode(problem, language),
    [language, problem],
  );

  const [code, setCode] = useState(() =>
    getStarterCode(codingProblems[resolvedInitialProblemIndex], "java"),
  );

  const [executionResult, setExecutionResult] =
    useState<CodingExecutionResult>(() => makeReadyResult(problem));

  useEffect(() => {
    setSelectedProblemIndex(resolvedInitialProblemIndex);
  }, [resolvedInitialProblemIndex]);

  useEffect(() => {
    setCode(starterCode);
    setExecutionResult(makeReadyResult(problem));
  }, [problem, starterCode]);

  useEffect(() => {
    if (!isSyncing) {
      return;
    }

    const syncTimer = window.setTimeout(() => setIsSyncing(false), 900);
    const syncedTimer = window.setTimeout(() => setHasSyncedCode(true), 900);

    return () => {
      window.clearTimeout(syncTimer);
      window.clearTimeout(syncedTimer);
    };
  }, [code, isSyncing]);

  const handlePreviousProblem = () => {
    setSelectedProblemIndex((current) =>
      current === 0 ? codingProblems.length - 1 : current - 1,
    );
  };

  const handleNextProblem = () => {
    setSelectedProblemIndex((current) =>
      current === codingProblems.length - 1 ? 0 : current + 1,
    );
  };

  const handleCodeChange = (nextCode: string) => {
    setCode(nextCode);

    if (connectedFriend) {
      setHasSyncedCode(false);
      setIsSyncing(true);
    }
  };

  const handleResetCode = () => {
    setCode(starterCode);
    setExecutionResult(makeReadyResult(problem));
  };

  const handleRun = () => {
    const testCases = getTestCases(problem);

    setExecutionResult({
      status: "Run completed",
      output: `Run completed\n\nInput:\n${
        testCases[0]?.input ?? problem.sampleInput
      }\n\nOutput:\n${testCases[0]?.expectedOutput ?? problem.sampleOutput}`,
      runtime: "68ms",
      memory: "41MB",
      passed: Math.min(3, testCases.length),
      total: testCases.length,
    });
  };

  const handleSubmit = () => {
    setExecutionResult({
      status: "Accepted",
      output: problem.sampleOutput,
      runtime: "72ms",
      memory: "42MB",
      passed: 12,
      total: 12,
    });
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-background shadow-card">
      <div className="space-y-4 p-3 sm:p-4 lg:p-5">
        <CodingProblemToolbar
          onNextProblem={handleNextProblem}
          onPreviousProblem={handlePreviousProblem}
          problem={problem}
        />

        <section className="grid items-start gap-4 lg:grid-cols-[45fr_55fr]">
          <div className="h-[720px] max-h-[calc(100vh-150px)] min-h-[560px]">
            <ProblemTabs problem={problem} />
          </div>

          <div className="h-[720px] max-h-[calc(100vh-150px)] min-h-[560px]">
            <CodeEditor
              code={code}
              language={language}
              onCodeChange={handleCodeChange}
              onLanguageChange={setLanguage}
              onResetCode={handleResetCode}
              problem={problem}
            />
          </div>
        </section>

        <section className="grid gap-4">
          <OutputPanel
            customInputDefault={problem.sampleInput}
            onRun={handleRun}
            onSubmit={handleSubmit}
            problem={problem}
            result={executionResult}
          />
        </section>
      </div>
    </section>
  );
}

function CodingProblemToolbar({
  onNextProblem,
  onPreviousProblem,
  problem,
}: {
  onNextProblem: () => void;
  onPreviousProblem: () => void;
  problem: CodingProblem;
}) {
  return (
    <section className="rounded-[1.5rem] border border-border bg-surface p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase text-text-muted">Current problem</p>
          <h1 className="mt-1 truncate text-[20px] font-extrabold text-text-primary">{problem.title}</h1>
          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
              Difficulty: <strong className="text-text-primary">{capitalize(problem.difficulty)}</strong>
            </span>
            <span className="rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
              Problem: {problem.problemNumber ?? problem.id}
            </span>
            <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${difficultyClasses[problem.difficulty]}`}>
              {capitalize(problem.difficulty)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-2xl border border-border bg-surface-soft px-3 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark"
            onClick={onPreviousProblem}
          >
            <ChevronLeft aria-hidden="true" size={17} strokeWidth={2.5} />
            <span className="hidden sm:inline">Previous Problem</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-2xl border border-border bg-surface-soft px-3 text-[13px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark"
            onClick={onNextProblem}
          >
            <span className="hidden sm:inline">Next Problem</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight aria-hidden="true" size={17} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

function getStarterCode(problem: CodingProblem, language: CodingLanguage) {
  if (problem.starterCode?.[language]) {
    return problem.starterCode[language];
  }

  const functionName = problem.title.replace(/[^a-zA-Z0-9]/g, "");

  const starterCode: Record<CodingLanguage, string> = {
    java: `import java.util.*;\n\nclass Solution {\n    public void ${functionName || "solve"}() {\n        // Write your solution here\n    }\n}`,
    python: `class Solution:\n    def solve(self):\n        # Write your solution here\n        pass`,
    javascript: `function solve() {\n  // Write your solution here\n}\n\nmodule.exports = solve;`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solve() {\n        // Write your solution here\n    }\n};`,
  };

  return starterCode[language];
}

function getTestCases(problem: CodingProblem) {
  if (problem.testCases?.length) {
    return problem.testCases;
  }

  return [
    {
      id: `${problem.id}-sample`,
      description: "Sample case",
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    },
  ];
}

function makeReadyResult(problem: CodingProblem): CodingExecutionResult {
  return {
    status: "Ready",
    output: "Run code to see sample output here.",
    runtime: "-",
    memory: "-",
    passed: 0,
    total: getTestCases(problem).length,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
