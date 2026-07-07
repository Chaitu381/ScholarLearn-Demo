import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarClock,
  Lock,
  PlayCircle,
} from "lucide-react";
import {
  codeconnectHubStats,
  codingProblems,
} from "../data/codeconnectMockData";
import { codeconnectScheduledTests } from "../data/codeconnectScheduledTests";
import { CodeConnectHeader } from "../components/codeconnect/CodeConnectHeader";
import { CodeConnectHub } from "../components/codeconnect/CodeConnectHub";
import { CodeConnectShell } from "../components/codeconnect/CodeConnectShell";
import { AptitudePlatform } from "../components/codeconnect/aptitude/AptitudePlatform";
import { ProblemList } from "../components/codeconnect/coding/ProblemList";
import { ReasoningPlatform } from "../components/codeconnect/reasoning/ReasoningPlatform";
import { ScheduledTestEntry } from "../components/codeconnect/shared/ScheduledTestEntry";
import { ScheduledTestList } from "../components/codeconnect/shared/ScheduledTestList";
import { ScheduledTestWorkspace } from "../components/codeconnect/shared/ScheduledTestWorkspace";
import { VerbalPlatform } from "../components/codeconnect/verbal/VerbalPlatform";
import { scrollToPageTop } from "../../../shared/utils/scrollToTop";
import type {
  CodeConnectScheduledTest,
  PracticeCategory,
} from "../types/codeconnect.types";

type CodeConnectView =
  | "dashboard"
  | "coding-list"
  | "coding-workspace"
  | "aptitude-list"
  | "aptitude-workspace"
  | "reasoning-list"
  | "reasoning-workspace"
  | "verbal-list"
  | "verbal-workspace"
  | "scheduled-tests"
  | "scheduled-test-waiting"
  | "scheduled-test-workspace";

type StudentCodingPracticeProps = {
  onReturnToStudentDashboard?: () => void;
};

export function StudentCodingPractice({
  onReturnToStudentDashboard,
}: StudentCodingPracticeProps) {
  const [codeConnectView, setCodeConnectView] =
    useState<CodeConnectView>("dashboard");

  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedScheduledTestId, setSelectedScheduledTestId] = useState<
    string | undefined
  >();

  useEffect(() => {
    scrollToPageTop();
  }, [codeConnectView]);

  function handleReturnToStudentDashboard() {
    if (onReturnToStudentDashboard) {
      onReturnToStudentDashboard();
      return;
    }

    if (typeof window !== "undefined") {
      window.location.hash = "dashboard";
    }
  }

  function handleOpenScheduledTest(testId: string) {
    setSelectedScheduledTestId(testId);
    setCodeConnectView("scheduled-test-waiting");
  }

  function handleStartScheduledTest(testId: string) {
    setSelectedScheduledTestId(testId);
    setCodeConnectView("scheduled-test-workspace");
  }

  if (codeConnectView === "dashboard") {
    return (
      <section className="min-h-screen bg-background text-text-primary">
        <CodeConnectHeader
          onOpenScheduledTest={handleOpenScheduledTest}
          onReturnToStudentDashboard={handleReturnToStudentDashboard}
          practiceXp={codeconnectHubStats.practiceXp}
          streakDays={codeconnectHubStats.activeStreakDays}
          variant="dashboard"
        />

        <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <CodeConnectHub
            onOpenScheduledTests={() => setCodeConnectView("scheduled-tests")}
            onSelectMode={(category) =>
              setCodeConnectView(resolveCategoryListView(category))
            }
          />
        </main>
      </section>
    );
  }

  if (codeConnectView === "scheduled-tests") {
    return (
      <ScheduledTestsScreen
        onBackToDashboard={() => setCodeConnectView("dashboard")}
      >
        <ScheduledTestList
          onOpenTest={handleOpenScheduledTest}
          tests={codeconnectScheduledTests}
        />
      </ScheduledTestsScreen>
    );
  }

  if (codeConnectView === "scheduled-test-waiting") {
    const scheduledTest =
      codeconnectScheduledTests.find(
        (test) => test.id === selectedScheduledTestId,
      ) ?? codeconnectScheduledTests[0];

    return (
      <ScheduledTestsScreen
        noPageScroll
        onBackToDashboard={() => setCodeConnectView("dashboard")}
        headerAction={
          scheduledTest ? (
            <StartScheduledTestButton
              test={scheduledTest}
              onStartTest={handleStartScheduledTest}
            />
          ) : null
        }
      >
        {scheduledTest ? (
          <ScheduledTestEntry
            onBack={() => setCodeConnectView("scheduled-tests")}
            onStartTest={handleStartScheduledTest}
            test={scheduledTest}
          />
        ) : null}
      </ScheduledTestsScreen>
    );
  }

  if (codeConnectView === "scheduled-test-workspace") {
    return (
      <ScheduledTestWorkspace
        onBackToList={() => setCodeConnectView("scheduled-tests")}
        scheduledTestId={selectedScheduledTestId}
      />
    );
  }

  if (codeConnectView === "coding-list") {
    return (
      <ListScreen
        activePracticeMode="coding"
        onBackToDashboard={() => setCodeConnectView("dashboard")}
        onOpenScheduledTest={handleOpenScheduledTest}
      >
        <ProblemList
          activeProblemId={selectedItemId}
          onSelectProblem={(problemId) => {
            setSelectedItemId(problemId);
            setCodeConnectView("coding-workspace");
          }}
          problems={codingProblems}
        />
      </ListScreen>
    );
  }

  if (codeConnectView === "aptitude-list") {
    return (
      <ListScreen
        activePracticeMode="aptitude"
        onBackToDashboard={() => setCodeConnectView("dashboard")}
        onOpenScheduledTest={handleOpenScheduledTest}
      >
        <AptitudePlatform
          initialQuestionId={selectedItemId}
          onSelectQuestion={(questionId) => {
            setSelectedItemId(questionId);
            setCodeConnectView("aptitude-workspace");
          }}
        />
      </ListScreen>
    );
  }

  if (codeConnectView === "reasoning-list") {
    return (
      <ListScreen
        activePracticeMode="reasoning"
        onBackToDashboard={() => setCodeConnectView("dashboard")}
        onOpenScheduledTest={handleOpenScheduledTest}
      >
        <ReasoningPlatform
          initialQuestionId={selectedItemId}
          onSelectQuestion={(questionId) => {
            setSelectedItemId(questionId);
            setCodeConnectView("reasoning-workspace");
          }}
        />
      </ListScreen>
    );
  }

  if (codeConnectView === "verbal-list") {
    return (
      <ListScreen
        activePracticeMode="verbal"
        onBackToDashboard={() => setCodeConnectView("dashboard")}
        onOpenScheduledTest={handleOpenScheduledTest}
      >
        <VerbalPlatform
          initialQuestionId={selectedItemId}
          onSelectQuestion={(questionId) => {
            setSelectedItemId(questionId);
            setCodeConnectView("verbal-workspace");
          }}
        />
      </ListScreen>
    );
  }

  const activeWorkspaceMode = resolvePracticeMode(codeConnectView);

  return (
    <section className="min-h-screen bg-background text-text-primary">
      <CodeConnectHeader
        activePracticeMode={activeWorkspaceMode}
        backAriaLabel={`Back to ${formatPracticeMode(
          activeWorkspaceMode,
        )} question list`}
        backLabel="Back to list"
        onBackToHub={() => setCodeConnectView(resolveListView(codeConnectView))}
        onOpenScheduledTest={handleOpenScheduledTest}
        practiceXp={codeconnectHubStats.practiceXp}
        streakDays={codeconnectHubStats.activeStreakDays}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <CodeConnectShell
          activePracticeMode={activeWorkspaceMode}
          onBackToHub={() => setCodeConnectView(resolveListView(codeConnectView))}
          selectedItemId={selectedItemId}
        />
      </main>
    </section>
  );
}

function ListScreen({
  activePracticeMode,
  children,
  onBackToDashboard,
  onOpenScheduledTest,
}: {
  activePracticeMode: PracticeCategory;
  children: ReactNode;
  onBackToDashboard: () => void;
  onOpenScheduledTest: (testId: string) => void;
}) {
  return (
    <section className="min-h-screen bg-background text-text-primary">
      <CodeConnectHeader
        activePracticeMode={activePracticeMode}
        onBackToHub={onBackToDashboard}
        onOpenScheduledTest={onOpenScheduledTest}
        practiceXp={codeconnectHubStats.practiceXp}
        streakDays={codeconnectHubStats.activeStreakDays}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </section>
  );
}

function ScheduledTestsScreen({
  children,
  headerAction,
  noPageScroll = false,
  onBackToDashboard,
}: {
  children: ReactNode;
  headerAction?: ReactNode;
  noPageScroll?: boolean;
  onBackToDashboard: () => void;
}) {
  return (
    <section
      className={
        noPageScroll
          ? "h-screen overflow-hidden bg-background text-text-primary"
          : "min-h-screen bg-background text-text-primary"
      }
    >
      <header className="grid min-h-16 grid-cols-[1fr_auto] items-center gap-3 border-b border-border bg-surface px-4 py-2 sm:px-5 lg:min-h-[72px]">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 rounded-2xl text-left transition hover:bg-surface-soft"
          onClick={onBackToDashboard}
          aria-label="Back to CodeConnect dashboard"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-white">
            <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.5} />
          </span>

          <span className="min-w-0">
            <span className="block truncate text-[16px] font-extrabold text-text-primary">
              CodeConnect
            </span>
            <span className="hidden text-[12px] font-bold text-text-secondary sm:block">
              Back to dashboard
            </span>
          </span>
        </button>

        <div className="flex items-center justify-end gap-3">
          {headerAction}

          <span className="hidden h-10 items-center gap-2 rounded-2xl bg-surface-soft px-3 text-[12px] font-extrabold text-text-secondary sm:inline-flex">
            <CalendarClock
              aria-hidden="true"
              size={14}
              strokeWidth={2.5}
              className="text-orange"
            />
            Teacher Tests
          </span>
        </div>
      </header>

      <main
        className={
          noPageScroll
            ? "mx-auto h-[calc(100dvh-72px)] max-w-[1440px] overflow-hidden px-4 py-4 sm:px-6 lg:px-8"
            : "mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8"
        }
      >
        {children}
      </main>
    </section>
  );
}

function StartScheduledTestButton({
  onStartTest,
  test,
}: {
  onStartTest: (testId: string) => void;
  test: CodeConnectScheduledTest;
}) {
  const canStart = isScheduledTestActive(test);

  return (
    <button
      type="button"
      disabled={!canStart}
      onClick={() => onStartTest(test.id)}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[13px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted"
    >
      {canStart ? (
        <PlayCircle aria-hidden="true" size={17} strokeWidth={2.5} />
      ) : (
        <Lock aria-hidden="true" size={17} strokeWidth={2.5} />
      )}
      {canStart ? "Start Test" : "Not Available"}
    </button>
  );
}

function isScheduledTestActive(test: CodeConnectScheduledTest) {
  const nowMs = Date.now();
  const availableFromMs = new Date(test.availableFrom).getTime();
  const availableUntilMs = new Date(test.availableUntil).getTime();

  if (Number.isNaN(availableFromMs) || Number.isNaN(availableUntilMs)) {
    return false;
  }

  if (test.status === "completed") {
    return false;
  }

  return nowMs >= availableFromMs && nowMs <= availableUntilMs;
}

function resolveCategoryListView(category: PracticeCategory): CodeConnectView {
  if (category === "coding") {
    return "coding-list";
  }

  if (category === "aptitude") {
    return "aptitude-list";
  }

  if (category === "reasoning") {
    return "reasoning-list";
  }

  return "verbal-list";
}

function resolvePracticeMode(view: CodeConnectView): PracticeCategory {
  if (view === "coding-workspace") {
    return "coding";
  }

  if (view === "aptitude-workspace") {
    return "aptitude";
  }

  if (view === "reasoning-workspace") {
    return "reasoning";
  }

  return "verbal";
}

function resolveListView(view: CodeConnectView): CodeConnectView {
  if (view === "coding-workspace") {
    return "coding-list";
  }

  if (view === "aptitude-workspace") {
    return "aptitude-list";
  }

  if (view === "reasoning-workspace") {
    return "reasoning-list";
  }

  return "verbal-list";
}

function formatPracticeMode(mode: PracticeCategory) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}