import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FileText, ShieldAlert } from "lucide-react";
import { PageTitle } from "../../../shared/components/ui/PageTitle";
import { InfoRow, MetricCard, PageCard, StudentPage, ToneBadge } from "../components/StudentPagePrimitives";
import { getStudentTestDetails } from "../services/studentApi";
import { getActiveStudentTestAttemptApi, getStudentTestAttemptApiErrorMessage, startStudentTestAttemptApi } from "../services/studentTestAttemptApi";
import {
  createStudentTestAttempt,
  getStudentTestAttempt,
  navigateToStudentTestPath,
  syncStudentTestAttemptWithBackendTime,
} from "../services/studentTestAttemptStorage";
import type { StudentTestDetails, StudentTestAttemptState } from "../types/student.types";

export function StudentTestStart({ testId }: { testId: string }) {
  const [test, setTest] = useState<StudentTestDetails | null>(null);
  const [attempt, setAttempt] = useState<StudentTestAttemptState | null>(null);
  const [loading, setLoading] = useState(true);
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;

    getStudentTestDetails(testId)
      .then(async (testDetails) => {
        if (!active) return;
        let storedAttempt = getStudentTestAttempt(testDetails.testId);

        try {
          const activeBackendAttempt = await getActiveStudentTestAttemptApi();
          if (activeBackendAttempt?.testId === testDetails.testId && activeBackendAttempt.status !== "SUBMITTED" && activeBackendAttempt.status !== "AUTO_SUBMITTED") {
            storedAttempt = storedAttempt
              ? syncStudentTestAttemptWithBackendTime(storedAttempt, activeBackendAttempt)
              : createStudentTestAttempt(activeBackendAttempt.test ?? testDetails, {
                  attemptId: activeBackendAttempt.attemptId,
                  backendRemainingSeconds: activeBackendAttempt.remainingSeconds,
                  durationMinutes: activeBackendAttempt.durationMinutes,
                  startedAt: activeBackendAttempt.startedAt,
                  status: activeBackendAttempt.status,
                });
          }
        } catch {
          // Starting/resuming still shows the local attempt if backend active lookup is unavailable.
        }

        setTest(testDetails);
        setAttempt(storedAttempt);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [testId]);

  const handleStartTest = async () => {
    if (!test) return;

    if (attempt && !attempt.submitted) {
      navigateToStudentTestPath(`/student/tests/${test.testId}/attempt`);
      return;
    }

    setStartError("");
    setStarting(true);

    try {
      const startedAttempt = await startStudentTestAttemptApi(test.testId);
      const resolvedTest = startedAttempt.test ?? test;
      const activeAttempt = createStudentTestAttempt(resolvedTest, {
        attemptId: startedAttempt.attemptId,
        backendRemainingSeconds: startedAttempt.remainingSeconds,
        durationMinutes: startedAttempt.durationMinutes,
        startedAt: startedAttempt.startedAt,
        status: startedAttempt.status,
      });

      setTest(resolvedTest);
      setAttempt(activeAttempt);
      navigateToStudentTestPath(`/student/tests/${resolvedTest.testId}/attempt`);
    } catch (error) {
      setStartError(getStudentTestAttemptApiErrorMessage(error));
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <StudentPage>
        <PageTitle title="Start Test" description="Loading test instructions..." />
      </StudentPage>
    );
  }

  if (!test) {
    return (
      <StudentPage>
        <PageTitle title="Test not found" description="We could not load this test right now." />
      </StudentPage>
    );
  }

  const submitted = attempt?.submitted;
  const activeAttempt = attempt && !attempt.submitted;

  return (
    <StudentPage>
      <PageTitle title={test.title} description="Read the instructions before starting your timed test." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Clock3} label="Duration" value={`${test.durationMinutes} min`} helper="Timer starts immediately" tone="blue" />
        <MetricCard icon={FileText} label="Sections" value={test.sections.length} helper="Section-wise attempt" tone="primary" />
        <MetricCard icon={CheckCircle2} label="Total Marks" value={test.totalMarks} helper={test.subject} tone="yellow" />
        <MetricCard icon={ShieldAlert} label="Mode" value="Timed" helper="Frontend UX lock enabled" tone="orange" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PageCard title="Instructions" description="Frontend locking helps reduce accidental navigation. Backend enforcement is still required.">
          <div className="space-y-3">
            {test.instructions.map((instruction) => (
              <div key={instruction} className="flex gap-3 rounded-2xl bg-surface-soft p-4">
                <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-orange" size={18} strokeWidth={2.5} />
                <p className="text-[14px] font-semibold leading-6 text-text-secondary">{instruction}</p>
              </div>
            ))}
          </div>
        </PageCard>

        <PageCard title="Test Summary">
          <InfoRow label="Batch" value={test.batch} />
          <InfoRow label="Subject" value={test.subject} />
          <InfoRow label="Type" value={test.testType} />
          <InfoRow label="Duration" value={`${test.durationMinutes} minutes`} />
          <InfoRow label="Total marks" value={test.totalMarks} />
          <div className="mt-5 flex flex-wrap gap-2">
            {test.sections.map((section) => (
              <ToneBadge key={section.id} label={`${section.title} - ${section.marks}m`} tone="blue" />
            ))}
          </div>
          {submitted ? (
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-2xl bg-primary px-4 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
              onClick={() => navigateToStudentTestPath(`/student/tests/${test.testId}/result`)}
            >
              View Summary
            </button>
          ) : (
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-2xl bg-primary px-4 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
              disabled={starting}
              onClick={handleStartTest}
            >
              {starting ? "Starting..." : activeAttempt ? "Resume Test" : "Start Test"}
            </button>
          )}
          {startError ? (
            <p className="mt-3 rounded-2xl border border-red bg-red-soft p-3 text-[13px] font-bold leading-5 text-red">
              {startError}
            </p>
          ) : null}
        </PageCard>
      </div>
    </StudentPage>
  );
}
