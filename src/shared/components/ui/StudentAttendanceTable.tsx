import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { motion } from "framer-motion";

export type AttendanceMarkStatus = "Absent" | "Late" | "Present";

export type StudentAttendanceTableStudent = {
  attendancePercentage: number;
  avatarInitials?: string;
  avatarUrl?: string;
  email?: string;
  name: string;
  profileImageUrl?: string;
  profilePicture?: string;
  rollNumber: string;
  status?: string;
  studentId: string;
};

type StudentAttendanceTableProps<TStudent extends StudentAttendanceTableStudent> = {
  attendanceRecords: Record<string, AttendanceMarkStatus>;
  emptyDescription?: string;
  onAttendanceChange: (studentId: string, status: AttendanceMarkStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  onOpenStudent: (student: TStudent) => void;
  students: TStudent[];
};

const studentAttendanceGridStyle: CSSProperties = {
  gridTemplateColumns: "90px 1.5fr 1fr 1fr 1fr 260px",
};

export function StudentAttendanceTable<TStudent extends StudentAttendanceTableStudent>({
  attendanceRecords,
  emptyDescription = "Try changing the filters or search term.",
  onAttendanceChange,
  onOpenStudent,
  students,
}: StudentAttendanceTableProps<TStudent>) {
  if (!students.length) {
    return (
      <section className="rounded-3xl border border-border bg-surface p-6 text-center shadow-card">
        <p className="text-[18px] font-extrabold text-text-primary">No students found</p>
        <p className="mt-2 text-[14px] text-text-secondary">{emptyDescription}</p>
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-3xl border border-border bg-surface shadow-card">
      <div className="min-w-[980px]">
        <div
          className="grid items-center gap-4 border-b border-border bg-surface-soft px-5 py-3 text-[12px] font-extrabold uppercase text-text-muted"
          style={studentAttendanceGridStyle}
        >
          <span className="text-center">Profile</span>
          <span>Full Name</span>
          <span>Roll No</span>
          <span>Attendance</span>
          <span>Risk</span>
          <span className="text-right">Attendance Marking</span>
        </div>

        <div className="divide-y divide-border">
          {students.map((student) => (
            <StudentAttendanceRow
              key={student.studentId}
              attendanceStatus={attendanceRecords[student.studentId] ?? "Present"}
              onAttendanceChange={onAttendanceChange}
              onOpenStudent={onOpenStudent}
              student={student}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StudentAttendanceRow<TStudent extends StudentAttendanceTableStudent>({
  attendanceStatus,
  onAttendanceChange,
  onOpenStudent,
  student,
}: {
  attendanceStatus: AttendanceMarkStatus;
  onAttendanceChange: (studentId: string, status: AttendanceMarkStatus, event?: MouseEvent<HTMLButtonElement>) => void;
  onOpenStudent: (student: TStudent) => void;
  student: TStudent;
}) {
  const risk = getStudentRisk(student);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenStudent(student);
    }
  };

  const handleAttendanceChange = (status: AttendanceMarkStatus, event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAttendanceChange(student.studentId, status, event);
  };

  return (
    <motion.article
      className="grid min-h-[76px] cursor-pointer items-center gap-4 px-5 py-4 transition hover:bg-surface-soft"
      role="button"
      tabIndex={0}
      style={studentAttendanceGridStyle}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.14, ease: "easeOut" }}
      onClick={() => onOpenStudent(student)}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-center">
        <StudentAvatar student={student} />
      </div>

      <div className="min-w-0">
        <h2 className="truncate text-[15px] font-extrabold text-text-primary">{formatFullName(student.name)}</h2>
      </div>

      <p className="truncate text-[13px] font-extrabold text-text-secondary">{student.rollNumber}</p>

      <p className="truncate text-[13px] font-extrabold text-text-primary">{student.attendancePercentage}% attendance</p>

      <RiskBadge risk={risk} />

      <div className="flex justify-end">
        <AttendanceMarkingButtons selectedStatus={attendanceStatus} onChange={handleAttendanceChange} />
      </div>
    </motion.article>
  );
}

function StudentAvatar({ student }: { student: StudentAttendanceTableStudent }) {
  const imageUrl = student.profilePicture ?? student.profileImageUrl ?? student.avatarUrl;

  if (imageUrl) {
    return (
      <img
        alt={`${student.name} profile`}
        className="h-11 w-11 rounded-2xl object-cover ring-2 ring-primary-soft"
        src={imageUrl}
      />
    );
  }

  return (
    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-[13px] font-extrabold text-primary-dark">
      {student.avatarInitials || getInitials(student.name)}
    </span>
  );
}

function AttendanceMarkingButtons({
  onChange,
  selectedStatus,
}: {
  onChange: (status: AttendanceMarkStatus, event: MouseEvent<HTMLButtonElement>) => void;
  selectedStatus: AttendanceMarkStatus;
}) {
  return (
    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
      {(["Present", "Absent", "Late"] as AttendanceMarkStatus[]).map((status) => (
        <button
          key={status}
          type="button"
          className={`h-9 rounded-2xl px-3 text-[12px] font-extrabold transition ${attendanceButtonClass(status, selectedStatus === status)}`}
          onClick={(event) => onChange(status, event)}
        >
          {status}
        </button>
      ))}
    </div>
  );
}

function RiskBadge({ risk }: { risk: "High Risk" | "Low Risk" | "Medium Risk" }) {
  return (
    <span className={`inline-flex h-8 w-fit items-center rounded-full px-3 text-[12px] font-extrabold ${riskBadgeClass(risk)}`}>
      {risk}
    </span>
  );
}

function getStudentRisk(student: StudentAttendanceTableStudent): "High Risk" | "Low Risk" | "Medium Risk" {
  if (student.status === "Good" || student.status === "Low Risk") return "Low Risk";
  if (student.status === "Average" || student.status === "Medium Risk") return "Medium Risk";
  if (student.status === "At Risk" || student.status === "High Risk") return "High Risk";

  if (student.attendancePercentage >= 85) return "Low Risk";
  if (student.attendancePercentage >= 70) return "Medium Risk";
  return "High Risk";
}

function riskBadgeClass(risk: "High Risk" | "Low Risk" | "Medium Risk") {
  if (risk === "Low Risk") return "bg-primary-soft text-primary-dark";
  if (risk === "Medium Risk") return "bg-orange-soft text-orange";
  return "bg-red-soft text-red";
}

function attendanceButtonClass(status: AttendanceMarkStatus, selected: boolean) {
  if (status === "Present") {
    return selected
      ? "bg-primary text-white"
      : "border border-border bg-surface text-text-secondary hover:border-primary hover:bg-primary-soft hover:text-primary-dark";
  }

  if (status === "Absent") {
    return selected
      ? "bg-red text-white"
      : "border border-border bg-red-soft text-red hover:border-red hover:bg-red-soft";
  }

  return selected
    ? "bg-orange text-white"
    : "border border-border bg-orange-soft text-orange hover:border-orange hover:bg-orange-soft";
}

function formatFullName(name: string) {
  const trimmedName = name.trim();
  if (trimmedName.split(/\s+/).length > 1) return trimmedName;

  const familyNames: Record<string, string> = {
    Aniket: "Patil",
    Ayush: "Sharma",
    Chaitanya: "Pilla",
    Durshant: "Kumar",
  };

  return familyNames[trimmedName] ? `${trimmedName} ${familyNames[trimmedName]}` : trimmedName;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
