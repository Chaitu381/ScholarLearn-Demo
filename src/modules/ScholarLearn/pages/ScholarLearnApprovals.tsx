import { motion } from "framer-motion";
import { CheckCircle2, Clock3, Mail, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { FounderApprovalRequest } from "../../../lib/demoAuth";
import { getRecentScholarLearnApprovalNotifications } from "../services/scholarLearnApprovalApi";

export function ScholarLearnApprovals() {
  const [approvals, setApprovals] = useState<FounderApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    getRecentScholarLearnApprovalNotifications()
      .then((approvalRequests) => {
        if (active) {
          setApprovals(approvalRequests);
          setErrorMessage("");
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Unable to load approval requests.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Platform approvals
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary">Approvals</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          Review recent Institute Founder approval requests. The notification bell remains the fastest approval workflow.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={Clock3} label="Pending" value={String(approvals.length)} />
        <Metric icon={ShieldCheck} label="Scope" value="Founders" />
        <Metric icon={CheckCircle2} label="History" value="Tracked" />
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <h2 className="text-[20px] font-extrabold text-text-primary">Recent approval requests</h2>
        <p className="mt-1 text-[13px] font-semibold text-text-secondary">Only requests from the last 24 hours appear here.</p>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-orange-soft bg-orange-soft px-4 py-3 text-[13px] font-extrabold text-orange">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-5 space-y-3">
          {loading ? (
            <StatusCard message="Loading approval requests..." />
          ) : approvals.length ? (
            approvals.map((approval) => (
              <article key={approval.id} className="rounded-2xl border border-border bg-surface-soft p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-extrabold text-text-primary">
                      {approval.firstName} {approval.lastName}
                    </p>
                    <p className="mt-1 flex items-center gap-2 truncate text-[12px] font-semibold text-text-secondary">
                      <Mail aria-hidden="true" size={14} strokeWidth={2.4} />
                      {approval.email}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-yellow-soft px-3 py-1 text-[12px] font-extrabold text-orange">
                    {formatRole(approval.requestedRole)}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <StatusCard message="No recent approval requests." />
          )}
        </div>
      </section>
    </motion.section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-4 shadow-card">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <p className="mt-4 text-[24px] font-extrabold text-text-primary">{value}</p>
      <p className="mt-1 text-[13px] font-bold text-text-secondary">{label}</p>
    </article>
  );
}

function StatusCard({ message }: { message: string }) {
  return (
    <article className="rounded-2xl border border-border bg-surface-soft p-4 text-[13px] font-extrabold text-text-secondary">
      {message}
    </article>
  );
}

function formatRole(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
