import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Flame,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import type { DailyProgress } from "../../types/student.types";

type DailyProgressCardProps = {
  progress?: DailyProgress;
};

type DailyProgressTab = "today-plan" | "student-task";

type StudentPlanTask = {
  complete: boolean;
  date: string;
  description: string;
  id: string;
  time: string;
  title: string;
};

type TaskTone = {
  cardClass: string;
  iconClass: string;
  badgeClass: string;
  label: string;
};

const studentPlanTasksStorageKey = "scholarlearn-student-plan-tasks";

function getTodayISODate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function getCurrentTimeValue() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

function getStoredStudentTasks(): StudentPlanTask[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedTasks = window.localStorage.getItem(studentPlanTasksStorageKey);

  if (!storedTasks) {
    return [];
  }

  try {
    const parsedTasks = JSON.parse(storedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks as StudentPlanTask[];
  } catch {
    return [];
  }
}

function parseTaskDateTime(task: StudentPlanTask) {
  if (!task.date || !task.time) {
    return null;
  }

  const parsedDate = new Date(`${task.date}T${task.time}`);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getTaskTimingTone(task: StudentPlanTask): TaskTone {
  if (task.complete) {
    return {
      cardClass: "border-primary/25 bg-primary-soft",
      iconClass: "text-primary",
      badgeClass: "bg-surface text-primary-dark",
      label: "Done",
    };
  }

  const taskDateTime = parseTaskDateTime(task);

  if (!taskDateTime) {
    return {
      cardClass: "border-border bg-surface-soft",
      iconClass: "text-text-muted",
      badgeClass: "bg-surface text-text-secondary",
      label: "No time",
    };
  }

  const now = new Date();
  const minutesDifference = Math.round(
    (taskDateTime.getTime() - now.getTime()) / 60000,
  );

  if (minutesDifference <= 30) {
    return {
      cardClass: "border-red/20 bg-red-soft",
      iconClass: "text-red",
      badgeClass: "bg-surface text-red",
      label: minutesDifference < 0 ? "Overdue" : "Now",
    };
  }

  if (minutesDifference <= 180) {
    return {
      cardClass: "border-orange/20 bg-orange-soft",
      iconClass: "text-orange",
      badgeClass: "bg-surface text-orange",
      label: "Soon",
    };
  }

  return {
    cardClass: "border-primary/20 bg-primary-soft",
    iconClass: "text-primary",
    badgeClass: "bg-surface text-primary-dark",
    label: "Later",
  };
}

export function DailyProgressCard({ progress }: DailyProgressCardProps) {
  const [activeTab, setActiveTab] = useState<DailyProgressTab>("today-plan");
  const [studentTasks, setStudentTasks] = useState<StudentPlanTask[]>(
    getStoredStudentTasks,
  );
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDate, setTaskDate] = useState(getTodayISODate());
  const [taskTime, setTaskTime] = useState("");

  const todayDate = useMemo(() => getTodayISODate(), []);

  const todayTasks = useMemo(() => {
    return studentTasks
      .filter((task) => task.date === todayDate)
      .sort((firstTask, secondTask) => {
        const firstTime = firstTask.time || "00:00";
        const secondTime = secondTask.time || "00:00";

        return firstTime.localeCompare(secondTime);
      });
  }, [studentTasks, todayDate]);

  const checklist = progress?.checklist ?? [];

  useEffect(() => {
    window.localStorage.setItem(
      studentPlanTasksStorageKey,
      JSON.stringify(studentTasks),
    );
  }, [studentTasks]);

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDate(getTodayISODate());
    setTaskTime("");
  };

  const openTaskDialog = () => {
    setTaskDate(getTodayISODate());
    setTaskTime(getCurrentTimeValue());
    setTaskDialogOpen(true);
  };

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = taskTitle.trim();
    const trimmedDescription = taskDescription.trim();

    if (!trimmedTitle || !taskDate || !taskTime) {
      return;
    }

    const newTask: StudentPlanTask = {
      complete: false,
      date: taskDate,
      description: trimmedDescription,
      id: `student-task-${Date.now()}`,
      time: taskTime,
      title: trimmedTitle,
    };

    setStudentTasks((currentTasks) => [...currentTasks, newTask]);
    resetTaskForm();
    setTaskDialogOpen(false);
    setActiveTab("today-plan");
  };

  const handleCancelTask = () => {
    resetTaskForm();
    setTaskDialogOpen(false);
  };

  const toggleStudentTask = (taskId: string) => {
    setStudentTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, complete: !task.complete } : task,
      ),
    );
  };

  return (
    <motion.section
      className="rounded-3xl border border-border bg-surface p-6 shadow-card"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] font-extrabold uppercase text-text-muted">
            Daily progress
          </p>

          <div className="mt-3 grid grid-cols-2 rounded-2xl border border-border bg-surface-soft p-1">
            <button
              type="button"
              className={
                activeTab === "today-plan"
                  ? "h-11 rounded-xl bg-primary px-4 text-[13px] font-extrabold text-white"
                  : "h-11 rounded-xl px-4 text-[13px] font-extrabold text-text-secondary transition hover:text-text-primary"
              }
              onClick={() => setActiveTab("today-plan")}
            >
              Today&apos;s Plan
            </button>
            <button
              type="button"
              className={
                activeTab === "student-task"
                  ? "h-11 rounded-xl bg-primary px-4 text-[13px] font-extrabold text-white"
                  : "h-11 rounded-xl px-4 text-[13px] font-extrabold text-text-secondary transition hover:text-text-primary"
              }
              onClick={() => setActiveTab("student-task")}
            >
              Student Task
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "today-plan" ? (
            <button
              type="button"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-4 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
              onClick={openTaskDialog}
            >
              <Plus aria-hidden="true" size={17} strokeWidth={2.5} />
              Add Task
            </button>
          ) : null}

          {activeTab === "student-task" ? (
            <span className="hidden h-14 w-14 place-items-center rounded-2xl bg-orange-soft text-orange sm:grid">
              <Flame aria-hidden="true" size={27} strokeWidth={2.5} />
            </span>
          ) : null}
        </div>
      </div>

      {activeTab === "today-plan" ? (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-extrabold text-text-primary">
                Today&apos;s plan
              </h2>
              <p className="mt-1 text-[13px] font-semibold text-text-secondary">
                Showing only today&apos;s tasks. Previous tasks stay saved in the
                background.
              </p>
            </div>

            <span className="rounded-full bg-surface-soft px-3 py-1 text-[11px] font-extrabold text-text-secondary">
              {todayTasks.length} today
            </span>
          </div>

          {todayTasks.length > 0 ? (
            <div className="mt-5 max-h-[390px] space-y-3 overflow-y-auto pr-1">
              {todayTasks.map((task) => {
                const Icon = task.complete ? CheckCircle2 : Circle;
                const tone = getTaskTimingTone(task);

                return (
                  <button
                    key={task.id}
                    type="button"
                    className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition hover:border-primary ${tone.cardClass}`}
                    onClick={() => toggleStudentTask(task.id)}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`mt-0.5 ${tone.iconClass}`}
                      size={21}
                      strokeWidth={2.5}
                    />

                    <span className="min-w-0 flex-1">
                      <span
                        className={
                          task.complete
                            ? "block text-[15px] font-extrabold text-text-secondary line-through"
                            : "block text-[15px] font-extrabold text-text-primary"
                        }
                      >
                        {task.title}
                      </span>

                      {task.description ? (
                        <span className="mt-1 block text-[13px] leading-5 text-text-secondary">
                          {task.description}
                        </span>
                      ) : null}

                      <span className="mt-3 flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-text-secondary">
                          <CalendarDays
                            aria-hidden="true"
                            size={13}
                            strokeWidth={2.5}
                          />
                          {task.date}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[11px] font-extrabold text-text-secondary">
                          <Clock3
                            aria-hidden="true"
                            size={13}
                            strokeWidth={2.5}
                          />
                          {task.time}
                        </span>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold ${tone.badgeClass}`}
                        >
                          {tone.label}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
              <p className="text-[15px] font-extrabold text-text-primary">
                No tasks for today
              </p>
              <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                Add today&apos;s tasks using the Add Task button.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {activeTab === "student-task" ? (
        <div className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[22px] font-extrabold text-text-primary">
                Student tasks
              </h2>
              <p className="mt-1 text-[13px] font-semibold text-text-secondary">
                Your attendance, coding, assignments, and test progress.
              </p>
            </div>

            <span className="rounded-full bg-surface-soft px-3 py-1 text-[11px] font-extrabold text-text-secondary">
              {checklist.length} items
            </span>
          </div>

          {checklist.length > 0 ? (
            <div className="mt-5 max-h-[390px] space-y-3 overflow-y-auto pr-1">
              {checklist.map((item) => {
                const Icon = item.complete ? CheckCircle2 : Circle;

                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl bg-surface-soft p-4"
                  >
                    <Icon
                      aria-hidden="true"
                      className={
                        item.complete
                          ? "mt-0.5 text-primary"
                          : "mt-0.5 text-text-muted"
                      }
                      size={20}
                      strokeWidth={2.5}
                    />

                    <div className="min-w-0">
                      <p className="text-[15px] font-extrabold text-text-primary">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-5 text-text-secondary">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-border bg-surface-soft p-5">
              <p className="text-[15px] font-extrabold text-text-primary">
                No student tasks available
              </p>
              <p className="mt-1 text-[13px] leading-5 text-text-secondary">
                Progress data is not available yet.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {taskDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <form
            className="w-full max-w-[420px] rounded-3xl border border-border bg-surface p-5 shadow-card"
            onSubmit={handleAddTask}
          >
            <div>
              <p className="text-[12px] font-extrabold uppercase text-text-muted">
                Today&apos;s plan
              </p>
              <h3 className="mt-1 text-[22px] font-extrabold text-text-primary">
                Add Task
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              <TaskField
                label="Task title"
                onChange={setTaskTitle}
                placeholder="Revise Java Streams"
                required
                type="text"
                value={taskTitle}
              />

              <label className="block">
                <span className="text-[13px] font-extrabold text-text-primary">
                  Description
                </span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-none rounded-2xl border border-border bg-surface-soft px-4 py-3 text-[14px] font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface"
                  onChange={(event) => setTaskDescription(event.target.value)}
                  placeholder="Add notes or a short task description"
                  value={taskDescription}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <TaskField
                  label="Date"
                  onChange={setTaskDate}
                  required
                  type="date"
                  value={taskDate}
                />

                <TaskField
                  label="Time"
                  onChange={setTaskTime}
                  required
                  type="time"
                  value={taskTime}
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                className="h-11 rounded-2xl border border-border bg-surface px-4 text-[14px] font-extrabold text-text-secondary transition hover:border-primary hover:text-text-primary"
                onClick={handleCancelTask}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </motion.section>
  );
}

function TaskField({
  label,
  onChange,
  placeholder,
  required = false,
  type,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-text-primary">
        {label}
      </span>

      <input
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[14px] font-semibold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}