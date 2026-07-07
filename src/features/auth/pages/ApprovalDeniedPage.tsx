import { GraduationCap, ShieldX } from "lucide-react";
import { clearAuthSession, redirectToLogin, type AuthSession } from "../../../lib/authSession";

export function ApprovalDeniedPage({ session = null }: { session?: AuthSession | null }) {
  const email = session?.user.email || "This account";

  const handleBackToLogin = () => {
    clearAuthSession();
    redirectToLogin();
  };

  return (
    <main className="min-h-screen bg-background p-4 text-text-primary sm:p-6 lg:p-8">
      <section className="mx-auto max-w-[760px] rounded-3xl border border-border bg-surface p-6 text-center shadow-card sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-soft text-red">
          <ShieldX aria-hidden="true" size={30} strokeWidth={2.5} />
        </div>
        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
            <GraduationCap aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
          <div className="text-left">
            <p className="text-[18px] font-extrabold text-text-primary">ScholarLearn</p>
            <p className="text-[12px] font-bold text-text-secondary">Access review</p>
          </div>
        </div>
        <h1 className="mt-6 text-[32px] font-extrabold leading-tight text-text-primary">Access rejected</h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] font-semibold leading-7 text-text-secondary">
          {email} was denied approval. Please contact the Founder or institute administrator if you believe this
          decision needs to be reviewed.
        </p>
        <button
          type="button"
          className="mt-7 h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark"
          onClick={handleBackToLogin}
        >
          Back to login
        </button>
      </section>
    </main>
  );
}
