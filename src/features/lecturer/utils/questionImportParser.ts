import type { CodingQuestionDifficulty } from "../types/lecturer.types";

export type ImportedFileType = "CSV" | "JSON" | "TXT" | "Unknown";
export type ImportedTestType = "Final Test" | "Monthly Test" | "Weekly Test";

export type ImportedMcqQuestion = {
  correctOptionIndex: number;
  explanation: string;
  marks: number;
  options: string[];
  question: string;
};

export type ImportedQaQuestion = {
  difficulty: CodingQuestionDifficulty;
  expectedAnswer: string;
  explanation: string;
  keywords: string;
  marks: number;
  question: string;
};

export type ImportedCodingQuestion = {
  allowedLanguages: string[];
  constraints: string;
  difficulty: CodingQuestionDifficulty;
  explanation: string;
  hiddenTestCasesCount: number;
  inputFormat: string;
  marks: number;
  outputFormat: string;
  problemStatement: string;
  sampleInput: string;
  sampleOutput: string;
  starterCode: string;
  title: string;
};

export type ParsedQuestionImport = {
  codingQuestions: ImportedCodingQuestion[];
  durationMinutes?: number;
  fileType: ImportedFileType;
  mcqQuestions: ImportedMcqQuestion[];
  qaQuestions: ImportedQaQuestion[];
  testTitle?: string;
  testType?: ImportedTestType;
  warnings: string[];
};

type UnknownRecord = Record<string, unknown>;

const difficultyValues: CodingQuestionDifficulty[] = ["Easy", "Medium", "Hard"];

export function detectImportFileType(fileName: string): ImportedFileType {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (extension === "json") {
    return "JSON";
  }

  if (extension === "txt") {
    return "TXT";
  }

  if (extension === "csv") {
    return "CSV";
  }

  return "Unknown";
}

export function parseQuestionImport(fileName: string, content: string): ParsedQuestionImport {
  const fileType = detectImportFileType(fileName);

  if (fileType === "JSON") {
    return parseJsonImport(content);
  }

  if (fileType === "TXT") {
    return parseTextImport(content);
  }

  if (fileType === "CSV") {
    return parseCsvImport(content);
  }

  throw new Error("Unsupported file type. Please upload .txt, .json, or .csv files.");
}

function createEmptyImport(fileType: ImportedFileType): ParsedQuestionImport {
  return {
    codingQuestions: [],
    fileType,
    mcqQuestions: [],
    qaQuestions: [],
    warnings: [],
  };
}

function parseJsonImport(content: string): ParsedQuestionImport {
  let payload: unknown;

  try {
    payload = JSON.parse(content);
  } catch {
    throw new Error("Invalid JSON file. Please check commas, quotes, and brackets.");
  }

  if (!isRecord(payload)) {
    throw new Error("Invalid JSON format. Root value must be an object.");
  }

  const result = createEmptyImport("JSON");
  result.testTitle = asString(payload.testTitle);
  result.testType = normalizeTestType(asString(payload.testType));
  result.durationMinutes = asPositiveNumber(payload.durationMinutes);

  const sections = Array.isArray(payload.sections) ? payload.sections : [];
  if (!sections.length) {
    throw new Error("JSON import must include a sections array.");
  }

  sections.forEach((section, sectionIndex) => {
    if (!isRecord(section)) {
      result.warnings.push(`Section ${sectionIndex + 1} was skipped because it is not an object.`);
      return;
    }

    const type = normalizeSectionType(asString(section.type));
    const questions = Array.isArray(section.questions) ? section.questions : [];

    if (!type) {
      result.warnings.push(`Section ${sectionIndex + 1} has an unsupported type.`);
      return;
    }

    questions.forEach((question, questionIndex) => {
      if (!isRecord(question)) {
        result.warnings.push(`${type} question ${questionIndex + 1} was skipped because it is not an object.`);
        return;
      }

      try {
        if (type === "MCQ") {
          result.mcqQuestions.push(normalizeMcqQuestion(question));
        } else if (type === "QA") {
          result.qaQuestions.push(normalizeQaQuestion(question));
        } else {
          result.codingQuestions.push(normalizeCodingQuestion(question));
        }
      } catch (error) {
        result.warnings.push(`${type} question ${questionIndex + 1} skipped: ${getErrorMessage(error)}`);
      }
    });
  });

  ensureQuestionsImported(result);
  return result;
}

function parseTextImport(content: string): ParsedQuestionImport {
  const result = createEmptyImport("TXT");
  const blocks = content
    .split(/(?=^#\s*(?:MCQ|QA|CODING)\s*$)/gim)
    .map((block) => block.trim())
    .filter(Boolean);

  blocks.forEach((block, index) => {
    const heading = block.match(/^#\s*(MCQ|QA|CODING)\s*$/im)?.[1]?.toUpperCase();
    const fields = parseLabeledFields(block);

    try {
      if (heading === "MCQ") {
        result.mcqQuestions.push(normalizeMcqQuestion(fields));
      } else if (heading === "QA") {
        result.qaQuestions.push(normalizeQaQuestion(fields));
      } else if (heading === "CODING") {
        result.codingQuestions.push(normalizeCodingQuestion(fields));
      } else {
        result.warnings.push(`Text block ${index + 1} was skipped because it has no # MCQ, # QA, or # CODING heading.`);
      }
    } catch (error) {
      result.warnings.push(`${heading ?? "Text"} block ${index + 1} skipped: ${getErrorMessage(error)}`);
    }
  });

  ensureQuestionsImported(result);
  return result;
}

function parseCsvImport(content: string): ParsedQuestionImport {
  const result = createEmptyImport("CSV");
  const rows = parseCsvRows(content);

  if (rows.length < 2) {
    throw new Error("CSV import must include a header row and at least one question row.");
  }

  const headers = rows[0].map(normalizeHeader);

  rows.slice(1).forEach((row, rowIndex) => {
    const record = headers.reduce<UnknownRecord>((currentRecord, header, columnIndex) => {
      currentRecord[header] = row[columnIndex] ?? "";
      return currentRecord;
    }, {});
    const type = normalizeSectionType(asString(record.type));

    try {
      if (type === "MCQ") {
        result.mcqQuestions.push(normalizeMcqQuestion(record));
      } else if (type === "QA") {
        result.qaQuestions.push(normalizeQaQuestion(record));
      } else if (type === "CODING") {
        result.codingQuestions.push(normalizeCodingQuestion(record));
      } else {
        result.warnings.push(`CSV row ${rowIndex + 2} skipped: unsupported or missing type.`);
      }
    } catch (error) {
      result.warnings.push(`CSV row ${rowIndex + 2} skipped: ${getErrorMessage(error)}`);
    }
  });

  ensureQuestionsImported(result);
  return result;
}

function normalizeMcqQuestion(question: UnknownRecord): ImportedMcqQuestion {
  const options = getOptions(question);
  const correctOptionIndex = getCorrectOptionIndex(question);
  const questionText = getRequiredString(question, ["question"]);

  if (options.length !== 4 || options.some((option) => !option.trim())) {
    throw new Error("MCQ must include four non-empty options.");
  }

  if (correctOptionIndex < 0 || correctOptionIndex > 3) {
    throw new Error("MCQ correctOptionIndex must be between 0 and 3.");
  }

  return {
    correctOptionIndex,
    explanation: getOptionalString(question, ["explanation", "rubric"]),
    marks: getPositiveNumber(question, ["marks"], 2),
    options,
    question: questionText,
  };
}

function normalizeQaQuestion(question: UnknownRecord): ImportedQaQuestion {
  const keywordsValue = question.keywords;

  return {
    difficulty: normalizeDifficulty(getOptionalString(question, ["difficulty"])),
    expectedAnswer: getRequiredString(question, ["expectedAnswer", "expected answer", "answer"]),
    explanation: getOptionalString(question, ["explanation", "rubric"]),
    keywords: Array.isArray(keywordsValue) ? keywordsValue.map(String).join(", ") : getOptionalString(question, ["keywords"]),
    marks: getPositiveNumber(question, ["marks"], 5),
    question: getRequiredString(question, ["question"]),
  };
}

function normalizeCodingQuestion(question: UnknownRecord): ImportedCodingQuestion {
  return {
    allowedLanguages: getAllowedLanguages(question),
    constraints: getOptionalString(question, ["constraints"]),
    difficulty: normalizeDifficulty(getOptionalString(question, ["difficulty"])),
    explanation: getOptionalString(question, ["explanation"]),
    hiddenTestCasesCount: getPositiveNumber(question, ["hiddenTestCases", "hiddenTestCasesCount", "hidden test cases"], 0),
    inputFormat: getOptionalString(question, ["inputFormat", "input format"]),
    marks: getPositiveNumber(question, ["marks"], 10),
    outputFormat: getOptionalString(question, ["outputFormat", "output format"]),
    problemStatement: getRequiredString(question, ["statement", "problemStatement", "problem statement"]),
    sampleInput: getOptionalString(question, ["sampleInput", "sample input"]),
    sampleOutput: getOptionalString(question, ["sampleOutput", "sample output"]),
    starterCode: getOptionalString(question, ["starterCode", "starter code"]),
    title: getRequiredString(question, ["title", "problemTitle", "problem title"]),
  };
}

function parseLabeledFields(block: string): UnknownRecord {
  const lines = block
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => !line.trim().startsWith("#"));
  const fields: UnknownRecord = {};
  let currentKey = "";

  lines.forEach((line) => {
    const labelMatch =
      line.match(/^([A-D]\))\s*:?\s*(.*)$/) ??
      line.match(/^([A-Za-z][A-Za-z\s]*)\s*:\s*(.*)$/);

    if (labelMatch) {
      currentKey = normalizeHeader(labelMatch[1]);
      fields[currentKey] = labelMatch[2] ?? "";
      return;
    }

    if (currentKey && line.trim()) {
      fields[currentKey] = `${asString(fields[currentKey])}\n${line}`.trim();
    }
  });

  return fields;
}

function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      currentCell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(Boolean)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += character;
    }
  }

  currentRow.push(currentCell.trim());
  if (currentRow.some(Boolean)) {
    rows.push(currentRow);
  }

  return rows;
}

function getOptions(question: UnknownRecord): string[] {
  if (Array.isArray(question.options)) {
    return question.options.map(String);
  }

  return [
    ["a)", "optionA"],
    ["b)", "optionB"],
    ["c)", "optionC"],
    ["d)", "optionD"],
  ].map(([shortKey, longKey]) => asString(question[normalizeHeader(shortKey)] ?? question[normalizeHeader(longKey)]));
}

function getCorrectOptionIndex(question: UnknownRecord): number {
  const rawValue = question.correctOptionIndex ?? question.correctoptionindex ?? question.answer ?? question.correctanswer;
  const value = asString(rawValue).trim();

  if (!value) {
    return -1;
  }

  if (/^[A-D]$/i.test(value)) {
    return value.toUpperCase().charCodeAt(0) - 65;
  }

  return Number(value);
}

function getAllowedLanguages(question: UnknownRecord) {
  const value = question.allowedLanguages ?? question.allowedlanguages ?? question.languages;

  if (Array.isArray(value)) {
    const languages = value.map(String).map((language) => language.trim()).filter(Boolean);
    return languages.length ? languages : ["Java"];
  }

  const languages = asString(value)
    .split(/[,;\n]/)
    .map((language) => language.trim())
    .filter(Boolean);

  return languages.length ? languages : ["Java"];
}

function getRequiredString(record: UnknownRecord, keys: string[]) {
  const value = getOptionalString(record, keys);
  if (!value.trim()) {
    throw new Error(`${keys[0]} is required.`);
  }
  return value;
}

function getOptionalString(record: UnknownRecord, keys: string[]) {
  const value = keys.map((key) => record[normalizeHeader(key)] ?? record[key]).find((candidate) => candidate !== undefined);
  return asString(value).trim();
}

function getPositiveNumber(record: UnknownRecord, keys: string[], fallback: number) {
  const value = keys.map((key) => record[normalizeHeader(key)] ?? record[key]).find((candidate) => candidate !== undefined);
  const numberValue = Number(value);

  if (Number.isFinite(numberValue) && numberValue > 0) {
    return numberValue;
  }

  return fallback;
}

function asPositiveNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

function normalizeDifficulty(value: string): CodingQuestionDifficulty {
  const difficulty = difficultyValues.find((item) => item.toLowerCase() === value.toLowerCase());
  return difficulty ?? "Easy";
}

function normalizeTestType(value: string): ImportedTestType | undefined {
  const normalized = value.trim().toUpperCase();

  if (normalized === "WEEKLY" || normalized === "WEEKLY TEST") {
    return "Weekly Test";
  }

  if (normalized === "MONTHLY" || normalized === "MONTHLY TEST") {
    return "Monthly Test";
  }

  if (normalized === "FINAL" || normalized === "FINAL TEST") {
    return "Final Test";
  }

  return undefined;
}

function normalizeSectionType(value: string) {
  const normalized = value.trim().toUpperCase();

  if (normalized === "MCQ") {
    return "MCQ";
  }

  if (normalized === "QA" || normalized === "Q&A" || normalized === "QUESTION & ANSWER") {
    return "QA";
  }

  if (normalized === "CODING" || normalized === "CODE") {
    return "CODING";
  }

  return "";
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function ensureQuestionsImported(result: ParsedQuestionImport) {
  const importedCount = result.mcqQuestions.length + result.qaQuestions.length + result.codingQuestions.length;
  if (importedCount === 0) {
    throw new Error(result.warnings[0] ?? "No valid questions were found in this file.");
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown parse error.";
}
