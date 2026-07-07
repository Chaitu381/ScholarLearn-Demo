import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookOpenCheck, ChevronLeft, ChevronRight, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { authenticateDemoUser, savePendingApprovalUser, type PendingApprovalRole } from "../../../lib/demoAuth";
import { getAuthApprovalStatus, resolvePostLoginRedirect, saveAuthSession } from "../../../lib/authSession";

type AuthMode = "login" | "register";

const sliderItems = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "Structured learning",
    title: "Track progress with clarity",
    description: "A calm learning space for tests, coding practice, attendance, assignments, and academic growth.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "Practice ready",
    title: "Prepare with guided momentum",
    description: "Build consistent habits through analytics, streaks, goals, and focused recommendations.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
    eyebrow: "Student success",
    title: "One dashboard for every milestone",
    description: "Connect classroom work, coding practice, performance insights, and mentor guidance in one place.",
  },
];

const roleOptions: { label: string; value: PendingApprovalRole }[] = [
  { label: "STUDENT", value: "STUDENT" },
  { label: "LECTURER", value: "LECTURER" },
  { label: "JUNIOR_LECTURER", value: "JUNIOR_LECTURER" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "ATTENDANCE_MARKER", value: "ATTENDANCE_MARKER" },
  { label: "JOB_MANAGER", value: "JOB_MANAGER" },
  { label: "Founder", value: "INSTITUTE_FOUNDER" },
];

export function ScholarLearnAuthPage() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlide = sliderItems[activeSlideIndex];

  useEffect(() => {
    const sliderTimer = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => (currentIndex + 1) % sliderItems.length);
    }, 3500);

    return () => window.clearInterval(sliderTimer);
  }, []);

  const slideBackground = useMemo(
    () => ({
      backgroundImage: `linear-gradient(180deg, rgba(16, 24, 32, 0.08), rgba(16, 24, 32, 0.62)), url("${activeSlide.imageUrl}")`,
    }),
    [activeSlide.imageUrl],
  );

  const handlePreviousSlide = () => {
    setActiveSlideIndex((currentIndex) => (currentIndex === 0 ? sliderItems.length - 1 : currentIndex - 1));
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((currentIndex) => (currentIndex + 1) % sliderItems.length);
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background p-3 text-text-primary sm:p-4">
      <section className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-border bg-surface shadow-card sm:min-h-[calc(100dvh-2rem)] lg:grid-cols-[55fr_45fr]">
        <section className="relative min-h-[340px] bg-surface-soft">
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={slideBackground}
            aria-hidden="true"
          />

          <div className="relative z-10 flex min-h-[340px] flex-col justify-between p-5 text-white sm:p-7 lg:min-h-full lg:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/95 text-primary">
                  <GraduationCap aria-hidden="true" size={23} strokeWidth={2.5} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-extrabold">ScholarLearn</p>
                  <p className="text-[12px] font-bold text-white/80">Student tracking system</p>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <span className="inline-flex h-8 items-center rounded-full bg-white/90 px-3 text-[12px] font-extrabold text-text-primary">
                {activeSlide.eyebrow}
              </span>
              <h1 className="mt-4 max-w-xl text-[34px] font-extrabold leading-tight sm:text-[44px] lg:text-[50px]">
                {activeSlide.title}
              </h1>
              <p className="mt-4 max-w-xl text-[15px] font-semibold leading-7 text-white/88 sm:text-[16px]">
                {activeSlide.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <SliderMetric icon={BookOpenCheck} label="Courses" value="6 active" />
                <SliderMetric icon={ShieldCheck} label="Attendance" value="92%" />
                <SliderMetric icon={Sparkles} label="Streak" value="12 days" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                {sliderItems.map((item, index) => (
                  <button
                    key={item.title}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    className={index === activeSlideIndex ? "h-2.5 w-8 rounded-full bg-white" : "h-2.5 w-2.5 rounded-full bg-white/50"}
                    onClick={() => setActiveSlideIndex(index)}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous slide"
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-text-primary transition hover:bg-white"
                  onClick={handlePreviousSlide}
                >
                  <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  className="grid h-10 w-10 place-items-center rounded-2xl bg-white/90 text-text-primary transition hover:bg-white"
                  onClick={handleNextSlide}
                >
                  <ChevronRight aria-hidden="true" size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent_32%)] p-5 sm:p-7 lg:p-8">
          <div className="w-full max-w-[500px] rounded-[28px] border border-border bg-surface/95 p-5 shadow-card sm:p-6">
            <div>
              <p className="text-[12px] font-extrabold uppercase text-text-muted">Welcome to ScholarLearn</p>
              <h2 className="mt-2 text-[30px] font-extrabold leading-tight text-text-primary">
                {authMode === "login" ? "Sign in to continue" : "Create your account"}
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">
                {authMode === "login"
                  ? "Access your dashboard, practice hub, analytics, and academic progress."
                  : "Set up a clean student account for progress tracking and guided practice."}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface-soft p-1">
              <AuthTabButton active={authMode === "login"} label="Login" onClick={() => setAuthMode("login")} />
              <AuthTabButton active={authMode === "register"} label="Register" onClick={() => setAuthMode("register")} />
            </div>

            <div className="mt-5">
              {authMode === "login" ? <LoginForm /> : <RegisterForm />}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function AuthTabButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={
        active
          ? "h-11 rounded-xl bg-surface text-[14px] font-extrabold text-text-primary shadow-card"
          : "h-11 rounded-xl text-[14px] font-extrabold text-text-secondary transition hover:text-text-primary"
      }
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<"error" | "success" | null>(null);
  const [loginMessage, setLoginMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoginStatus(null);
    setLoginMessage("");
    setIsSubmitting(true);

    const session = authenticateDemoUser(email, password);

    if (!session) {
      setIsSubmitting(false);
      setLoginStatus("error");
      setLoginMessage("Invalid demo credentials. Try one of the approved local demo accounts.");
      return;
    }

    const savedSession = saveAuthSession({
      role: session.role,
      user: {
        approvalStatus: session.approvalStatus,
        displayName: session.displayName,
        email: session.email,
      },
    });
    const approvalStatus = getAuthApprovalStatus(savedSession);
    const redirectPath =
      approvalStatus === "PENDING_APPROVAL"
        ? "/approval-pending"
        : approvalStatus === "DENIED"
          ? "/access-denied"
          : session.role === "INSTITUTE_FOUNDER" || session.role === "SCHOLARLEARN"
            ? session.redirect
            : resolvePostLoginRedirect(savedSession.role);

    setLoginStatus("success");
    setLoginMessage(`Demo login successful. Redirecting to ${redirectPath}...`);

    window.setTimeout(() => {
      window.history.replaceState({}, "", redirectPath);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 350);
  };

  return (
    <form className="space-y-3.5" onSubmit={handleLogin}>
      <FormField
        autoComplete="email"
        label="Email"
        onChange={setEmail}
        placeholder="student@fengari.me"
        type="email"
        value={email}
      />
      <FormField
        autoComplete="current-password"
        label="Password"
        onChange={setPassword}
        placeholder="Enter demo password"
        type="password"
        value={password}
      />
      <button
        type="submit"
        className="h-11 w-full rounded-2xl bg-primary px-5 text-[15px] font-extrabold text-white shadow-[0_10px_20px_rgba(88,204,2,0.20)] transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Checking..." : "Login"}
      </button>

      {loginMessage ? (
        <p
          className={
            loginStatus === "success"
              ? "rounded-2xl border border-primary-soft bg-primary-soft px-4 py-3 text-[12px] font-extrabold text-primary-dark"
              : "rounded-2xl border border-red-soft bg-red-soft px-4 py-3 text-[12px] font-extrabold text-red"
          }
        >
          {loginMessage}
        </p>
      ) : null}

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[12px] font-extrabold text-text-muted">OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-border bg-surface px-5 text-[15px] font-extrabold text-text-primary transition hover:border-primary hover:text-primary-dark"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-soft text-[13px] font-extrabold text-blue">G</span>
        Continue with Google
      </button>
    </form>
  );
}

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requestedRole, setRequestedRole] = useState<PendingApprovalRole>("STUDENT");
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [subjectOrDepartment, setSubjectOrDepartment] = useState("");

  const isStudentRole = requestedRole === "STUDENT";
  const isLecturerRole = requestedRole === "LECTURER" || requestedRole === "JUNIOR_LECTURER";

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    savePendingApprovalUser({
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber.trim(),
      requestedRole,
      ...(isStudentRole
        ? {
            batch: batch.trim(),
            course: course.trim(),
          }
        : {}),
      ...(isLecturerRole
        ? {
            subjectOrDepartment: subjectOrDepartment.trim(),
          }
        : {}),
    });

    window.location.assign("/approval-pending");
  };

  return (
    <form className="space-y-3.5" onSubmit={handleRegister}>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          autoComplete="given-name"
          label="First Name"
          onChange={setFirstName}
          placeholder="Chaitanya"
          required
          type="text"
          value={firstName}
        />
        <FormField
          autoComplete="family-name"
          label="Last Name"
          onChange={setLastName}
          placeholder="Kumar"
          required
          type="text"
          value={lastName}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          autoComplete="email"
          label="Email"
          onChange={setEmail}
          placeholder="student@scholarlearn.com"
          required
          type="email"
          value={email}
        />
        <FormField
          autoComplete="tel"
          label="Phone Number"
          onChange={setPhoneNumber}
          placeholder="+91 98765 43210"
          required
          type="tel"
          value={phoneNumber}
        />
      </div>
      <RoleSelect onChange={setRequestedRole} value={requestedRole} />
      {isStudentRole ? (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-soft p-3 sm:grid-cols-2">
          <FormField
            autoComplete="organization-title"
            label="Course"
            onChange={setCourse}
            placeholder="Java Full Stack"
            type="text"
            value={course}
          />
          <FormField
            autoComplete="off"
            label="Batch"
            onChange={setBatch}
            placeholder="JFS-2026-A"
            type="text"
            value={batch}
          />
        </div>
      ) : null}
      {isLecturerRole ? (
        <div className="rounded-2xl border border-border bg-surface-soft p-3">
          <FormField
            autoComplete="organization-title"
            label="Subject / Department"
            onChange={setSubjectOrDepartment}
            placeholder="Java / Computer Science"
            type="text"
            value={subjectOrDepartment}
          />
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField autoComplete="new-password" label="Password" placeholder="Create password" type="password" />
        <FormField autoComplete="new-password" label="Confirm" placeholder="Confirm password" type="password" />
      </div>
      <button
        type="submit"
        className="h-11 w-full rounded-2xl bg-primary px-5 text-[15px] font-extrabold text-white shadow-[0_10px_20px_rgba(88,204,2,0.20)] transition hover:bg-primary-dark"
      >
      Register
      </button>
      <p className="text-center text-[12px] font-semibold leading-5 text-text-secondary">
        Founder registrations wait for ScholarLearn approval. Institute users wait for their Institute Founder.
      </p>
    </form>
  );
}

function RoleSelect({ onChange, value }: { onChange: (value: PendingApprovalRole) => void; value: PendingApprovalRole }) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-text-primary">Requested Role</span>
      <select
        className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[13px] font-extrabold text-text-primary outline-none transition focus:border-primary focus:bg-surface"
        onChange={(event) => onChange(event.target.value as PendingApprovalRole)}
        value={value}
      >
        {roleOptions.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FormField({
  autoComplete,
  label,
  onChange,
  placeholder,
  required = false,
  type,
  value,
}: {
  autoComplete: string;
  label: string;
  onChange?: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type: string;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-text-primary">{label}</span>
      <input
        autoComplete={autoComplete}
        className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-surface-soft px-4 text-[14px] font-bold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary focus:bg-surface"
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function SliderMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpenCheck;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl bg-white/92 p-4 text-text-primary">
      <Icon aria-hidden="true" className="text-primary-dark" size={19} strokeWidth={2.5} />
      <p className="mt-3 text-[11px] font-extrabold uppercase text-text-muted">{label}</p>
      <p className="mt-1 text-[15px] font-extrabold">{value}</p>
    </article>
  );
}
