import { useMemo, useState, type ReactNode } from "react";
import { CalendarClock, ClipboardList, FileText, Save, X } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { navigateToLecturerPath } from "../components/LecturerShell";
import { LecturerBackButton, LecturerCard, LecturerPage, LecturerPageTitle } from "../components/LecturerPrimitives";
import { getLecturerSubmissionErrorMessage, lecturerApi } from "../services/lecturerApi";

const batchOptions = ["JFS-2026-A", "JFS-2026-B", "PY-2026-A", "MERN-2026-A"];
const subjectOptions = ["Spring Boot", "React", "Python APIs", "Node.js", "MySQL"];

type AssignmentDraft = {
  batch: string;
  description: string;
  dueDate: string;
  dueTime: string;
  marks: number;
  subject: string;
  title: string;
};

const initialAssignmentDraft: AssignmentDraft = {
  batch: "JFS-2026-A",
  description: "Build and submit the assigned implementation with screenshots and a short explanation.",
  dueDate: "",
  dueTime: "18:00",
  marks: 50,
  subject: "Spring Boot",
  title: "",
};

export function LecturerAssignmentCreate() {
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentDraft>(initialAssignmentDraft);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!assignmentDraft.title.trim()) errors.push("Assignment title is required.");
    if (!assignmentDraft.batch) errors.push("Batch is required.");
    if (!assignmentDraft.subject) errors.push("Subject is required.");
    if (!assignmentDraft.dueDate) errors.push("Due date is required.");
    if (!assignmentDraft.description.trim()) errors.push("Task description is required.");
    if (!Number.isFinite(assignmentDraft.marks) || assignmentDraft.marks <= 0) errors.push("Marks must be greater than 0.");
    return errors;
  }, [assignmentDraft]);

  const canCreate = validationErrors.length === 0 && !submitting;

  const updateDraft = <Key extends keyof AssignmentDraft>(key: Key, value: AssignmentDraft[Key]) => {
    setAssignmentDraft((current) => ({ ...current, [key]: value }));
  };

  const handleCreateAssignment = async () => {
    if (!canCreate) return;

    setSubmitting(true);
    setStatusMessage("Creating assignment...");

    try {
      await lecturerApi.createAssignment({
        batchId: assignmentDraft.batch,
        description: assignmentDraft.description,
        dueDate: `${assignmentDraft.dueDate}T${assignmentDraft.dueTime || "23:59"}`,
        marks: assignmentDraft.marks,
        subjectId: assignmentDraft.subject,
        title: assignmentDraft.title,
      });
      setStatusMessage("Assignment created successfully.");
      navigateToLecturerPath("/lecturer/assignments");
    } catch (error) {
      setStatusMessage(getLecturerSubmissionErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LecturerPage>
      <LecturerBackButton />
      <LecturerPageTitle
        title="Create Assignment"
        description="Create a batch assignment with due date, marks, and task instructions."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,62fr)_minmax(320px,38fr)]">
        <LecturerCard title="Assignment Details" description="Prepare the assignment content for your selected batch." icon={FileText}>
          <div className="grid gap-4">
            <Field label="Assignment title">
              <input
                className={inputClassName}
                onChange={(event) => updateDraft("title", event.target.value)}
                placeholder="Example: Spring Boot CRUD API project"
                value={assignmentDraft.title}
              />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Batch">
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("batch", event.target.value)}
                  value={assignmentDraft.batch}
                >
                  {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Subject">
                <select
                  className={inputClassName}
                  onChange={(event) => updateDraft("subject", event.target.value)}
                  value={assignmentDraft.subject}
                >
                  {subjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Due date">
                <input
                  className={inputClassName}
                  onChange={(event) => updateDraft("dueDate", event.target.value)}
                  type="date"
                  value={assignmentDraft.dueDate}
                />
              </Field>
              <Field label="Due time">
                <input
                  className={inputClassName}
                  onChange={(event) => updateDraft("dueTime", event.target.value)}
                  type="time"
                  value={assignmentDraft.dueTime}
                />
              </Field>
              <Field label="Marks">
                <input
                  className={inputClassName}
                  min={1}
                  onChange={(event) => updateDraft("marks", Number(event.target.value))}
                  type="number"
                  value={assignmentDraft.marks}
                />
              </Field>
            </div>

            <Field label="Task description">
              <textarea
                className={cn(inputClassName, "min-h-[170px] resize-y py-3 leading-6")}
                onChange={(event) => updateDraft("description", event.target.value)}
                placeholder="Describe what students need to submit."
                value={assignmentDraft.description}
              />
            </Field>
          </div>
        </LecturerCard>

        <aside className="space-y-4">
          <LecturerCard title="Assignment Preview" description="Review before creating." icon={ClipboardList}>
            <div className="space-y-4">
              <PreviewRow label="Title" value={assignmentDraft.title || "Untitled assignment"} />
              <PreviewRow label="Batch" value={assignmentDraft.batch} />
              <PreviewRow label="Subject" value={assignmentDraft.subject} />
              <PreviewRow
                label="Due"
                value={assignmentDraft.dueDate ? `${assignmentDraft.dueDate} ${assignmentDraft.dueTime}` : "Not selected"}
              />
              <PreviewRow label="Marks" value={`${assignmentDraft.marks || 0}`} />
            </div>

            {validationErrors.length ? (
              <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4">
                <p className="text-[13px] font-extrabold text-amber-100">Complete before creating</p>
                <ul className="mt-2 space-y-1 text-[12px] font-semibold text-amber-100/80">
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-[13px] font-extrabold text-emerald-100">
                Ready to create assignment.
              </div>
            )}

            {statusMessage ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4 text-[13px] font-semibold text-slate-300">
                {statusMessage}
              </div>
            ) : null}

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.075] px-4 text-[13px] font-extrabold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
                onClick={() => navigateToLecturerPath("/lecturer/assignments")}
              >
                <X aria-hidden="true" size={16} strokeWidth={2.5} />
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 text-[13px] font-extrabold text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.18)] transition hover:from-cyan-300 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={!canCreate}
                onClick={handleCreateAssignment}
              >
                <Save aria-hidden="true" size={16} strokeWidth={2.5} />
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </LecturerCard>

          <LecturerCard title="Submission Window" icon={CalendarClock}>
            <p className="text-[14px] leading-6 text-slate-400">
              Students will see the assignment after it is created. If the API is unavailable, this form keeps your
              current draft values and shows the backend error clearly.
            </p>
          </LecturerCard>
        </aside>
      </div>
    </LecturerPage>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.075] px-4 text-[14px] font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50";

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-extrabold uppercase text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
      <span className="text-[12px] font-extrabold uppercase text-slate-500">{label}</span>
      <strong className="max-w-[220px] text-right text-[13px] text-slate-100">{value}</strong>
    </div>
  );
}
