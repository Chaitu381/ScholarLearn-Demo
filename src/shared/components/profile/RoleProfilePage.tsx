import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import { Camera, Check, Mail, Phone, ShieldCheck, UserRound, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  updateProfilePicture,
  type CurrentUserProfile,
  type RoleProfileKind,
} from "../../services/profileService";

type RoleProfilePageProps = {
  extraContent?: ReactNode;
  roleKind: RoleProfileKind;
  roleLabel: string;
};

type ProfileDraft = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type ProfileErrors = Partial<Record<keyof ProfileDraft, string>>;

export function RoleProfilePage({ extraContent, roleKind, roleLabel }: RoleProfilePageProps) {
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(() => createEmptyDraft());
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCurrentUserProfile(roleKind).then((currentProfile) => {
      if (!isMounted) return;
      setProfile(currentProfile);
      setDraft(createDraft(currentProfile));
      setPicturePreview(currentProfile.profilePicture ?? "");
    });

    return () => {
      isMounted = false;
    };
  }, [roleKind]);

  const initials = useMemo(() => getInitials(profile?.fullName ?? roleLabel), [profile?.fullName, roleLabel]);

  const startEditing = () => {
    if (!profile) return;
    setDraft(createDraft(profile));
    setPictureFile(null);
    setPicturePreview(profile.profilePicture ?? "");
    setErrors({});
    setStatusMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!profile) return;
    setDraft(createDraft(profile));
    setPictureFile(null);
    setPicturePreview(profile.profilePicture ?? "");
    setErrors({});
    setStatusMessage("");
    setIsEditing(false);
  };

  const updateDraft = (field: keyof ProfileDraft, value: string) => {
    setDraft((currentDraft) => ({ ...currentDraft, [field]: value }));
  };

  const handlePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPictureFile(file);

    if (!file) {
      setPicturePreview(profile?.profilePicture ?? "");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPicturePreview(previewUrl);
  };

  const saveProfile = async () => {
    const validationErrors = validateProfileDraft(draft);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    setStatusMessage("");

    try {
      const profilePicture = pictureFile ? await updateProfilePicture(pictureFile) : profile?.profilePicture;
      const updatedProfile = await updateCurrentUserProfile({
        ...draft,
        profilePicture,
      });

      setProfile({ ...updatedProfile, profilePicture: profilePicture ?? updatedProfile.profilePicture });
      setPicturePreview(profilePicture ?? updatedProfile.profilePicture ?? "");
      setPictureFile(null);
      setIsEditing(false);
      setStatusMessage("Profile updated.");
    } catch {
      setStatusMessage("Unable to save profile right now. Your current values were kept on this device.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!profile) {
    return (
      <motion.section
        className="rounded-3xl border border-border bg-surface p-6 text-[14px] font-extrabold text-text-secondary shadow-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        Loading profile...
      </motion.section>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-text-muted">{roleLabel} Workspace</p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight text-text-primary sm:text-[34px]">Profile</h1>
          <p className="mt-2 max-w-3xl text-[15px] leading-6 text-text-secondary">
            Manage your identity, contact details, profile picture, and account status.
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="h-11 rounded-2xl border border-border bg-surface px-5 text-[14px] font-extrabold text-text-primary transition hover:border-primary hover:bg-primary-soft hover:text-primary-dark"
                onClick={cancelEditing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:opacity-60"
                disabled={isSaving}
                onClick={saveProfile}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="h-11 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white shadow-card transition hover:bg-primary-dark"
              onClick={startEditing}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
          <div className="relative mx-auto h-28 w-28">
            {picturePreview ? (
              <img
                alt={`${profile.fullName} profile`}
                className="h-28 w-28 rounded-3xl object-cover ring-4 ring-primary-soft"
                src={picturePreview}
              />
            ) : (
              <span className="grid h-28 w-28 place-items-center rounded-3xl bg-primary-soft text-[34px] font-extrabold text-primary-dark">
                {initials}
              </span>
            )}
            {isEditing ? (
              <label className="absolute -bottom-2 -right-2 grid h-10 w-10 cursor-pointer place-items-center rounded-2xl bg-primary text-white shadow-card transition hover:bg-primary-dark">
                <Camera aria-hidden="true" size={18} strokeWidth={2.5} />
                <input className="sr-only" type="file" accept="image/*" onChange={handlePictureChange} />
              </label>
            ) : null}
          </div>
          <h2 className="mt-5 text-[26px] font-extrabold text-text-primary">{profile.fullName}</h2>
          <p className="mt-1 text-[14px] font-bold text-text-secondary">{profile.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <ProfilePill label={profile.roleLabel || roleLabel} tone="primary" />
            {profile.approvalStatus ? <ProfilePill label={profile.approvalStatus.replace("_", " ")} tone="blue" /> : null}
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
              <UserRound aria-hidden="true" size={22} strokeWidth={2.5} />
            </span>
            <div>
              <h2 className="text-[21px] font-extrabold text-text-primary">Account Details</h2>
              <p className="mt-1 text-[14px] leading-6 text-text-secondary">
                These details are used across your ScholarLearn workspace.
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileInput
                error={errors.firstName}
                label="First name"
                value={draft.firstName}
                onChange={(value) => updateDraft("firstName", value)}
              />
              <ProfileInput
                error={errors.lastName}
                label="Last name"
                value={draft.lastName}
                onChange={(value) => updateDraft("lastName", value)}
              />
              <ProfileInput
                error={errors.email}
                label="Email"
                type="email"
                value={draft.email}
                onChange={(value) => updateDraft("email", value)}
              />
              <ProfileInput
                error={errors.phone}
                label="Phone number"
                value={draft.phone}
                onChange={(value) => updateDraft("phone", value)}
              />
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileInfoCard icon={UserRound} label="Full name" value={profile.fullName} />
              <ProfileInfoCard icon={ShieldCheck} label="Role" value={profile.roleLabel || roleLabel} />
              <ProfileInfoCard icon={Mail} label="Email" value={profile.email} />
              <ProfileInfoCard icon={Phone} label="Phone number" value={profile.phone || "Not added"} />
              <ProfileInfoCard icon={ShieldCheck} label="Institute" value={profile.instituteName || "Not available"} />
              <ProfileInfoCard icon={Check} label="Joined" value={formatDate(profile.joinedDate)} />
            </div>
          )}

          {statusMessage ? (
            <p className="mt-4 rounded-2xl bg-primary-soft px-4 py-3 text-[13px] font-bold text-primary-dark">
              {statusMessage}
            </p>
          ) : null}
        </section>
      </div>

      {extraContent}
    </motion.div>
  );
}

function ProfileInfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-soft p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-surface text-primary-dark">
        <Icon aria-hidden="true" size={18} strokeWidth={2.5} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-extrabold uppercase text-text-muted">{label}</p>
        <p className="mt-1 truncate text-[14px] font-extrabold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function ProfileInput({
  error,
  label,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="block rounded-2xl bg-surface-soft p-4">
      <span className="text-[12px] font-extrabold uppercase text-text-muted">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-[14px] font-extrabold text-text-primary outline-none transition focus:border-primary"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="mt-2 block text-[12px] font-bold text-red">{error}</span> : null}
    </label>
  );
}

function ProfilePill({ label, tone }: { label: string; tone: "blue" | "primary" }) {
  return (
    <span
      className={
        tone === "primary"
          ? "inline-flex h-7 items-center rounded-full bg-primary-soft px-3 text-[12px] font-extrabold text-primary-dark"
          : "inline-flex h-7 items-center rounded-full bg-blue-soft px-3 text-[12px] font-extrabold text-blue"
      }
    >
      {label}
    </span>
  );
}

function createEmptyDraft(): ProfileDraft {
  return {
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  };
}

function createDraft(profile: CurrentUserProfile): ProfileDraft {
  return {
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone ?? "",
  };
}

function validateProfileDraft(draft: ProfileDraft): ProfileErrors {
  const errors: ProfileErrors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9+\-\s()]{7,20}$/;

  if (!draft.firstName.trim()) errors.firstName = "First name is required.";
  if (!draft.lastName.trim()) errors.lastName = "Last name is required.";
  if (!emailPattern.test(draft.email.trim())) errors.email = "Enter a valid email address.";
  if (!phonePattern.test(draft.phone.trim())) errors.phone = "Enter a valid phone number.";

  return errors;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date?: string) {
  if (!date) return "Not available";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(parsedDate);
}
