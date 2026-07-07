import type { SubjectNote, SubjectProgress, SubjectTopicFlowItem } from "../types/student.types";

type UnknownRecord = Record<string, unknown>;

export async function getSubjectNotes(subject: SubjectProgress): Promise<SubjectNote[]> {
  const record = asRecord(subject);
  const notes = normalizeSubjectNotes(record.notes ?? record.materials ?? record.studyMaterials ?? record.resources);

  if (notes.length) {
    return notes;
  }

  // TODO: Connect this to the backend subject notes/materials endpoint when a subject-scoped API is available.
  return [];
}

export async function getSubjectTopicFlow(subject: SubjectProgress): Promise<SubjectTopicFlowItem[]> {
  const record = asRecord(subject);
  const topics = normalizeSubjectTopics(record.topics ?? record.modules ?? record.topicFlow ?? record.learningPath);

  if (topics.length) {
    return topics;
  }

  // TODO: Connect this to the backend subject topics/modules endpoint when a subject-scoped API is available.
  return [];
}

function normalizeSubjectNotes(value: unknown): SubjectNote[] {
  const records = readArrayRecords(value);

  return records.flatMap((record, index) => {
    const title = readString(record, ["title", "noteTitle", "name", "fileName"]);
    if (!title) {
      return [];
    }

    return [{
      description: readString(record, ["description", "summary", "details"]) || undefined,
      fileType: readString(record, ["fileType", "type", "mimeType", "extension"]) || undefined,
      fileUrl: readString(record, ["fileUrl", "downloadUrl", "url", "resourceUrl", "attachmentUrl"]) || undefined,
      id: readString(record, ["id", "noteId", "materialId", "_id"]) || `note-${index + 1}`,
      title,
      uploadedBy: readString(record, ["uploadedBy", "createdBy", "lecturerName", "staffName"]) || undefined,
      uploadedDate: readString(record, ["uploadedDate", "createdAt", "updatedAt", "date"]) || undefined,
    }];
  });
}

function normalizeSubjectTopics(value: unknown): SubjectTopicFlowItem[] {
  const records = readArrayRecords(value);

  return records
    .flatMap((record, index) => {
      const name = readString(record, ["name", "title", "topicName", "moduleName"]);
      if (!name) {
        return [];
      }

      return [{
        description: readString(record, ["description", "summary"]) || undefined,
        id: readString(record, ["id", "topicId", "moduleId", "_id"]) || `topic-${index + 1}`,
        name,
        order: readNumber(record, ["order", "sequence", "position"], index + 1),
        prerequisiteIds: readStringArray(record.prerequisiteIds ?? record.prerequisites),
        progress: readOptionalNumber(record, ["progress", "progressPercentage", "completionPercentage"]),
        status: normalizeTopicStatus(readString(record, ["status", "state"])),
      }];
    })
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
}

function normalizeTopicStatus(value: string): SubjectTopicFlowItem["status"] | undefined {
  const normalized = value.trim().toUpperCase().replace(/[_\s]+/g, "-");
  if (normalized === "COMPLETED" || normalized === "COMPLETE" || normalized === "DONE") return "completed";
  if (normalized === "CURRENT" || normalized === "IN-PROGRESS" || normalized === "ACTIVE") return "current";
  if (normalized === "LOCKED") return "locked";
  if (normalized === "NOT-STARTED" || normalized === "PENDING") return "not-started";
  return undefined;
}

function readArrayRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord);
}

function readString(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  return "";
}

function readStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value.split(/[,;\n]/).map((item) => item.trim()).filter(Boolean);
  }

  return undefined;
}

function readNumber(record: UnknownRecord, keys: string[], fallback: number) {
  for (const key of keys) {
    const numberValue = Number(record[key]);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return fallback;
}

function readOptionalNumber(record: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const numberValue = Number(record[key]);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return undefined;
}

function asRecord(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
