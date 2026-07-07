import { motion } from "framer-motion";
import { Building2, CalendarDays, IndianRupee, ShieldCheck, type LucideIcon } from "lucide-react";
import { useMemo } from "react";
import { useScholarLearnInstitutes } from "../hooks/useScholarLearnInstitutes";

export function ScholarLearnRevenuePlans() {
  const { institutes, loading, subscriptionPlans } = useScholarLearnInstitutes();
  const planSummary = useMemo(() => {
    return subscriptionPlans.map((plan) => ({
      plan,
      count: institutes.filter((institute) => institute.plan === plan).length,
    }));
  }, [institutes, subscriptionPlans]);

  const activeInstitutes = institutes.filter((institute) => !institute.disabled).length;
  const expiringSoon = institutes.filter((institute) => institute.activeRemainingDays <= 45 && !institute.disabled).length;

  if (loading) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6 text-[14px] font-extrabold text-text-secondary shadow-card">
        Loading revenue and plan data...
      </section>
    );
  }

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <header className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold uppercase text-primary-dark">
          Revenue / Plans
        </span>
        <h1 className="mt-4 text-[30px] font-extrabold text-text-primary">Revenue & Subscription Plans</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
          Track institute plans, active access, upcoming expiries, and subscription health.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={Building2} label="Institutes" value={String(institutes.length)} />
        <Metric icon={ShieldCheck} label="Active access" value={String(activeInstitutes)} />
        <Metric icon={CalendarDays} label="Expiring soon" value={String(expiringSoon)} />
      </section>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
        <h2 className="text-[20px] font-extrabold text-text-primary">Plan distribution</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {planSummary.map((item) => (
            <article key={item.plan} className="rounded-2xl border border-border bg-surface-soft p-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                <IndianRupee aria-hidden="true" size={18} strokeWidth={2.5} />
              </span>
              <p className="mt-4 text-[22px] font-extrabold text-text-primary">{item.count}</p>
              <p className="mt-1 text-[13px] font-bold text-text-secondary">{item.plan}</p>
            </article>
          ))}
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
