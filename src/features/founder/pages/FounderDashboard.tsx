import { motion } from "framer-motion";
import { BookOpenCheck, GraduationCap, TrendingUp, UsersRound } from "lucide-react";
import { FounderBatchCard } from "../components/FounderBatchCard";
import { FounderPerformanceGraphs } from "../components/FounderPerformanceGraphs";
import { FounderStatsCards } from "../components/FounderStatsCards";
import type { FounderBatch, FounderStat } from "../types/founder.types";

const founderBatches: FounderBatch[] = [
  { attendance: 92, batchId: "jfs-2026-a", course: "Java Full Stack", name: "JFS-2026-A", nextClass: "Today, 2:00 PM", score: 84, status: "Active", students: 42, subject: "Spring Boot" },
  { attendance: 86, batchId: "jfs-2026-b", course: "Java Full Stack", name: "JFS-2026-B", nextClass: "Tomorrow, 10:30 AM", score: 78, status: "Needs Attention", students: 38, subject: "React" },
  { attendance: 90, batchId: "py-2026-a", course: "Python Full Stack", name: "PY-2026-A", nextClass: "Wed, 11:00 AM", score: 81, status: "Active", students: 36, subject: "Python APIs" },
  { attendance: 82, batchId: "mern-2026-a", course: "MERN Stack", name: "MERN-2026-A", nextClass: "Fri, 3:30 PM", score: 74, status: "Needs Attention", students: 34, subject: "Node.js" },
  { attendance: 95, batchId: "java-core-2025-c", course: "Core Java", name: "JAVA-CORE-2025-C", nextClass: "Completed", score: 88, status: "Completed", students: 29, subject: "Collections" },
];

const totalStudents = founderBatches.reduce((total, batch) => total + batch.students, 0);
const averageAttendance = Math.round(founderBatches.reduce((total, batch) => total + batch.attendance, 0) / founderBatches.length);
const averagePerformance = Math.round(founderBatches.reduce((total, batch) => total + batch.score, 0) / founderBatches.length);

const founderStats: FounderStat[] = [
  { description: "Active and completed cohorts", icon: GraduationCap, label: "Total Batches", tone: "blue", value: String(founderBatches.length) },
  { description: "Students across all batches", icon: UsersRound, label: "Total Students", tone: "primary", value: String(totalStudents) },
  { description: "Institute-wide average", icon: BookOpenCheck, label: "Average Attendance", tone: "orange", value: `${averageAttendance}%` },
  { description: "Average test performance", icon: TrendingUp, label: "Average Performance", tone: "primary", value: `${averagePerformance}%` },
];

export function FounderDashboard() {
  const openBatch = (batchId: string) => {
    window.history.pushState({}, "", `/founder/batches/${encodeURIComponent(batchId)}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
            <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,65fr)_minmax(280px,35fr)] lg:items-center">
                <div>
                  <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
                    Founder
                  </span>
                  <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-text-primary sm:text-[40px]">
                    Institute Command Center
                  </h1>
                  <p className="mt-3 max-w-3xl text-[15px] leading-7 text-text-secondary">
                    Track institute performance, batch health, attendance, tests, and batch comparisons from one clean Founder workspace.
                  </p>
                </div>
                <div className="rounded-3xl border border-border bg-surface-soft p-5">
                  <p className="text-[12px] font-extrabold uppercase text-text-muted">Today's Focus</p>
                  <p className="mt-3 text-[24px] font-extrabold text-text-primary">{founderBatches.length} batches</p>
                  <p className="mt-2 text-[13px] leading-5 text-text-secondary">
                    Review low-attendance batches and compare test performance before the weekly report.
                  </p>
                </div>
              </div>
            </section>

            <FounderStatsCards stats={founderStats} />
            <FounderPerformanceGraphs batches={founderBatches} />

            <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[21px] font-extrabold text-text-primary">Batches Preview</h2>
                  <p className="mt-1 text-[14px] text-text-secondary">
                    Click any batch to open its Founder batch details page.
                  </p>
                </div>
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
                  {founderBatches.length} total batches
                </span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {founderBatches.map((batch) => (
                  <FounderBatchCard key={batch.batchId} batch={batch} onOpen={openBatch} />
                ))}
              </div>
            </section>
    </motion.div>
  );
}
