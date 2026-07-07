import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Code2,
  Copy,
  Eye,
  FileQuestion,
  FileText,
  Layers3,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { navigateToLecturerPath } from "../components/LecturerShell";
import type { CodingQuestionDifficulty, CodingQuestionDraft } from "../types/lecturer.types";
import {
  detectImportFileType,
  parseQuestionImport,
  type ImportedFileType,
  type ParsedQuestionImport,
} from "../utils/questionImportParser";
import {
  createLecturerTest,
  getLecturerSubmissionErrorMessage,
  type LecturerCreateTestPayload,
} from "../services/lecturerApi";
import { LecturerBackButton } from "../components/LecturerPrimitives";

type TestType = "Weekly Test" | "Monthly Test" | "Final Test";
type TestSectionType = "MCQ" | "Question & Answer" | "Coding";

type TestSectionDraft = {
  id: string;
  marks: number;
  questionCount: number;
  type: TestSectionType;
};

type MCQQuestionDraft = {
  correctOptionIndex: number;
  explanation: string;
  id: string;
  marks: number;
  options: string[];
  question: string;
};

type QAQuestionDraft = {
  difficulty: CodingQuestionDifficulty;
  expectedAnswer: string;
  explanation: string;
  id: string;
  keywords: string;
  marks: number;
  question: string;
};

type UploadedQuestionFile = {
  errors: string[];
  fileName: string;
  fileType: ImportedFileType;
  id: string;
  importedCoding: number;
  importedMcq: number;
  importedQa: number;
  message: string;
  skippedCount: number;
  size: number;
  status: "Failed" | "Imported";
};

type TestValidationResult = {
  errors: string[];
  isValid: boolean;
  warnings: string[];
};

const difficultyOptions: CodingQuestionDifficulty[] = ["Easy", "Medium", "Hard"];
const languageOptions = ["Java", "Python", "JavaScript", "TypeScript", "C++", "SQL"];
const batchOptions = ["JFS-2026-A", "JFS-2026-B", "PY-2026-A", "MERN-2026-A"];
const subjectOptions = ["Spring Boot", "React", "Python APIs", "Node.js", "MySQL"];
const testTypeOptions: TestType[] = ["Weekly Test", "Monthly Test", "Final Test"];
const sectionOptions: Array<{ description: string; icon: LucideIcon; type: TestSectionType }> = [
  { description: "Objective questions with options.", icon: FileQuestion, type: "MCQ" },
  { description: "Written answers for concept checks.", icon: FileText, type: "Question & Answer" },
  { description: "Programming problems with hidden cases.", icon: Code2, type: "Coding" },
];

const glassCard =
  "rounded-[28px] border border-white/10 bg-white/[0.065] shadow-[0_18px_50px_rgba(2,6,23,0.35)] backdrop-blur-xl";

function createMcqQuestion(index: number): MCQQuestionDraft {
  return {
    correctOptionIndex: 0,
    explanation: "",
    id: `mcq-question-${Date.now()}-${index}`,
    marks: 2,
    options: ["", "", "", ""],
    question: "",
  };
}

function createInitialMcqQuestions(): MCQQuestionDraft[] {
  return [
    {
      ...createMcqQuestion(1),
      id: "mcq-question-1",
      options: ["Class", "Interface", "Package", "Annotation"],
      question: "Which Java keyword is used to define a blueprint for objects?",
    },
    {
      ...createMcqQuestion(2),
      correctOptionIndex: 1,
      id: "mcq-question-2",
      options: ["@Controller", "@Service", "@Entity", "@Autowired"],
      question: "Which Spring annotation is commonly used for business logic classes?",
    },
  ];
}

function createQaQuestion(index: number): QAQuestionDraft {
  return {
    difficulty: "Easy",
    expectedAnswer: "",
    explanation: "",
    id: `qa-question-${Date.now()}-${index}`,
    keywords: "",
    marks: 5,
    question: "",
  };
}

function createInitialQaQuestions(): QAQuestionDraft[] {
  return [
    {
      ...createQaQuestion(1),
      expectedAnswer: "Dependency injection lets Spring provide required objects instead of creating them manually.",
      id: "qa-question-1",
      keywords: "dependency injection, bean, inversion of control",
      question: "Explain dependency injection in Spring Boot.",
    },
  ];
}

function createCodingQuestion(index: number): CodingQuestionDraft {
  return {
    allowedLanguages: ["Java"],
    constraints: "1 <= n <= 10^5",
    difficulty: "Easy",
    explanation: "",
    hiddenTestCasesCount: 8,
    id: `coding-question-${Date.now()}-${index}`,
    inputFormat: "First line contains the input size. Next line contains values.",
    marks: 10,
    outputFormat: "Print the required result.",
    problemStatement: "Write a program to solve the described problem. Add edge case handling and efficient logic.",
    sampleInput: "5\n1 2 3 4 5",
    sampleOutput: "15",
    starterCode: "",
    title: `Coding Problem ${index}`,
  };
}

export function LecturerTestCreate() {
  const [testTitle, setTestTitle] = useState("Spring Boot Weekly Test");
  const [description, setDescription] = useState("Assess Spring Boot fundamentals, REST APIs, and coding readiness.");
  const [assignedBatch, setAssignedBatch] = useState(batchOptions[0]);
  const [subject, setSubject] = useState(subjectOptions[0]);
  const [testType, setTestType] = useState<TestType>("Weekly Test");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [totalMarks, setTotalMarks] = useState(100);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [sections, setSections] = useState<TestSectionDraft[]>([
    { id: "section-mcq", marks: 40, questionCount: 20, type: "MCQ" },
    { id: "section-coding", marks: 30, questionCount: 1, type: "Coding" },
  ]);
  const [activeSectionId, setActiveSectionId] = useState(sections[0].id);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestionDraft[]>(createInitialMcqQuestions);
  const [qaQuestions, setQaQuestions] = useState<QAQuestionDraft[]>(createInitialQaQuestions);
  const [codingQuestions, setCodingQuestions] = useState<CodingQuestionDraft[]>([createCodingQuestion(1)]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedQuestionFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submitState, setSubmitState] = useState({ loading: false, message: "", status: "idle" as "error" | "idle" | "success" });
  const [selectedQuestionId, setSelectedQuestionId] = useState(codingQuestions[0].id);
  const selectedQuestion = codingQuestions.find((question) => question.id === selectedQuestionId) ?? codingQuestions[0];
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];

  useEffect(() => {
    if (window.location.hash !== "#upload-questions") return;

    const timer = window.setTimeout(() => {
      const uploadSection = document.getElementById("upload-questions");
      uploadSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      uploadSection?.focus({ preventScroll: true });
    }, 80);

    return () => window.clearTimeout(timer);
  }, []);

  const sectionSummary = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        marks: getSectionMarks(section, codingQuestions, mcqQuestions, qaQuestions),
        questionCount: getSectionQuestionCount(section, codingQuestions, mcqQuestions, qaQuestions),
      })),
    [codingQuestions, mcqQuestions, qaQuestions, sections],
  );

  const validationResult = useMemo(
    () =>
      validateTestBuilder({
        assignedBatch,
        codingQuestions,
        durationMinutes,
        mcqQuestions,
        qaQuestions,
        sections,
        subject,
        testTitle,
      }),
    [assignedBatch, codingQuestions, durationMinutes, mcqQuestions, qaQuestions, sections, subject, testTitle],
  );

  const updateQuestion = <Key extends keyof CodingQuestionDraft>(field: Key, value: CodingQuestionDraft[Key]) => {
    setCodingQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === selectedQuestion.id ? { ...question, [field]: value } : question,
      ),
    );
  };

  const addSection = (type: TestSectionType) => {
    if (sections.some((section) => section.type === type)) {
      const existingSection = sections.find((section) => section.type === type);
      if (existingSection) {
        setActiveSectionId(existingSection.id);
      }
      return;
    }

    const section: TestSectionDraft = {
      id: `section-${type.toLowerCase().replace(/\W+/g, "-")}-${Date.now()}`,
      marks:
        type === "Coding"
          ? getCodingMarks(codingQuestions)
          : type === "MCQ"
            ? getMcqMarks(mcqQuestions)
            : getQaMarks(qaQuestions),
      questionCount:
        type === "Coding"
          ? codingQuestions.length
          : type === "MCQ"
            ? mcqQuestions.length
            : qaQuestions.length,
      type,
    };
    setSections((currentSections) => [...currentSections, section]);
    setActiveSectionId(section.id);
  };

  const deleteSection = (sectionId: string) => {
    setSections((currentSections) => {
      const remainingSections = currentSections.filter((section) => section.id !== sectionId);
      if (activeSectionId === sectionId) {
        setActiveSectionId(remainingSections[0]?.id ?? "");
      }
      return remainingSections;
    });
  };

  const updateSection = (sectionId: string, field: "marks" | "questionCount", value: number) => {
    setSections((currentSections) =>
      currentSections.map((section) => (section.id === sectionId ? { ...section, [field]: value } : section)),
    );
  };

  const addMcqQuestion = () => {
    setMcqQuestions((currentQuestions) => [...currentQuestions, createMcqQuestion(currentQuestions.length + 1)]);
  };

  const deleteMcqQuestion = (questionId: string) => {
    setMcqQuestions((currentQuestions) => {
      if (currentQuestions.length === 1) {
        return currentQuestions;
      }

      return currentQuestions.filter((question) => question.id !== questionId);
    });
  };

  const updateMcqQuestion = <Key extends keyof MCQQuestionDraft>(
    questionId: string,
    field: Key,
    value: MCQQuestionDraft[Key],
  ) => {
    setMcqQuestions((currentQuestions) =>
      currentQuestions.map((question) => (question.id === questionId ? { ...question, [field]: value } : question)),
    );
  };

  const updateMcqOption = (questionId: string, optionIndex: number, value: string) => {
    setMcqQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) => (index === optionIndex ? value : option)),
            }
          : question,
      ),
    );
  };

  const addQaQuestion = () => {
    setQaQuestions((currentQuestions) => [...currentQuestions, createQaQuestion(currentQuestions.length + 1)]);
  };

  const deleteQaQuestion = (questionId: string) => {
    setQaQuestions((currentQuestions) => {
      if (currentQuestions.length === 1) {
        return currentQuestions;
      }

      return currentQuestions.filter((question) => question.id !== questionId);
    });
  };

  const updateQaQuestion = <Key extends keyof QAQuestionDraft>(
    questionId: string,
    field: Key,
    value: QAQuestionDraft[Key],
  ) => {
    setQaQuestions((currentQuestions) =>
      currentQuestions.map((question) => (question.id === questionId ? { ...question, [field]: value } : question)),
    );
  };

  const addCodingQuestion = () => {
    const nextQuestion = createCodingQuestion(codingQuestions.length + 1);
    setCodingQuestions((currentQuestions) => [...currentQuestions, nextQuestion]);
    setSelectedQuestionId(nextQuestion.id);
  };

  const deleteCodingQuestion = (questionId: string) => {
    setCodingQuestions((currentQuestions) => {
      if (currentQuestions.length === 1) {
        return currentQuestions;
      }

      const remainingQuestions = currentQuestions.filter((question) => question.id !== questionId);
      if (selectedQuestionId === questionId) {
        setSelectedQuestionId(remainingQuestions[0].id);
      }
      return remainingQuestions;
    });
  };

  const duplicateCodingQuestion = (question: CodingQuestionDraft) => {
    const duplicateQuestion = {
      ...question,
      id: `coding-question-${Date.now()}-duplicate`,
      title: `${question.title} Copy`,
    };
    setCodingQuestions((currentQuestions) => [...currentQuestions, duplicateQuestion]);
    setSelectedQuestionId(duplicateQuestion.id);
  };

  const applyParsedImport = (parsedImport: ParsedQuestionImport) => {
    if (parsedImport.testTitle) {
      setTestTitle(parsedImport.testTitle);
    }

    if (parsedImport.testType) {
      setTestType(parsedImport.testType);
    }

    if (parsedImport.durationMinutes) {
      setDurationMinutes(parsedImport.durationMinutes);
    }

    if (parsedImport.mcqQuestions.length) {
      setMcqQuestions((currentQuestions) => [
        ...currentQuestions,
        ...parsedImport.mcqQuestions.map((question, index) => ({
          ...question,
          id: `imported-mcq-${Date.now()}-${index}`,
        })),
      ]);
    }

    if (parsedImport.qaQuestions.length) {
      setQaQuestions((currentQuestions) => [
        ...currentQuestions,
        ...parsedImport.qaQuestions.map((question, index) => ({
          ...question,
          id: `imported-qa-${Date.now()}-${index}`,
        })),
      ]);
    }

    if (parsedImport.codingQuestions.length) {
      const importedCodingQuestions = parsedImport.codingQuestions.map((question, index) => ({
        ...question,
        id: `imported-coding-${Date.now()}-${index}`,
      }));
      setCodingQuestions((currentQuestions) => [...currentQuestions, ...importedCodingQuestions]);
      setSelectedQuestionId((currentQuestionId) => currentQuestionId || importedCodingQuestions[0]?.id || "");
    }

    setSections((currentSections) => {
      const nextSections = [...currentSections];
      if (parsedImport.mcqQuestions.length && !nextSections.some((section) => section.type === "MCQ")) {
        nextSections.push({ id: `section-mcq-${Date.now()}`, marks: 0, questionCount: 0, type: "MCQ" });
      }
      if (parsedImport.qaQuestions.length && !nextSections.some((section) => section.type === "Question & Answer")) {
        nextSections.push({ id: `section-qa-${Date.now()}`, marks: 0, questionCount: 0, type: "Question & Answer" });
      }
      if (parsedImport.codingQuestions.length && !nextSections.some((section) => section.type === "Coding")) {
        nextSections.push({ id: `section-coding-${Date.now()}`, marks: 0, questionCount: 0, type: "Coding" });
      }
      return nextSections;
    });
  };

  const handleQuestionFiles = async (files: File[]) => {
    if (!files.length) {
      return;
    }

    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const fileType = detectImportFileType(file.name);

        try {
          const content = await file.text();
          const parsedImport = parseQuestionImport(file.name, content);
          applyParsedImport(parsedImport);

          const warnings = parsedImport.warnings.length ? ` ${parsedImport.warnings.join(" ")}` : "";

          return {
            errors: parsedImport.warnings,
            fileName: file.name,
            fileType: parsedImport.fileType,
            id: `upload-${Date.now()}-${file.name}`,
            importedCoding: parsedImport.codingQuestions.length,
            importedMcq: parsedImport.mcqQuestions.length,
            importedQa: parsedImport.qaQuestions.length,
            message: `Imported ${parsedImport.mcqQuestions.length} MCQ, ${parsedImport.qaQuestions.length} Q&A, ${parsedImport.codingQuestions.length} coding question(s).${warnings}`,
            skippedCount: parsedImport.warnings.length,
            size: file.size,
            status: "Imported" as const,
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to import this file.";

          return {
            errors: [message],
            fileName: file.name,
            fileType,
            id: `upload-${Date.now()}-${file.name}`,
            importedCoding: 0,
            importedMcq: 0,
            importedQa: 0,
            message,
            skippedCount: 0,
            size: file.size,
            status: "Failed" as const,
          };
        }
      }),
    );

    setUploadedFiles((currentFiles) => [...uploadResults, ...currentFiles]);
  };

  const handleCreateTest = async () => {
    if (!validationResult.isValid || submitState.loading) {
      return;
    }

    setSubmitState({ loading: true, message: "Creating and publishing test...", status: "idle" });

    try {
      await createLecturerTest(
        buildCreateTestPayload({
          assignedBatch,
          codingQuestions,
          description,
          durationMinutes,
          endDateTime,
          mcqQuestions,
          qaQuestions,
          sections,
          startDateTime,
          subject,
          testTitle,
          testType,
          totalMarks,
        }),
      );
      setSubmitState({ loading: false, message: "Test created and published successfully.", status: "success" });
      window.setTimeout(() => {
        navigateToLecturerPath("/lecturer/tests");
      }, 650);
    } catch (error) {
      setSubmitState({ loading: false, message: getLecturerSubmissionErrorMessage(error), status: "error" });
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(
      "scholarlearn:lecturer-test-draft",
      JSON.stringify({
        assignedBatch,
        codingQuestions,
        description,
        durationMinutes,
        endDateTime,
        mcqQuestions,
        qaQuestions,
        sections,
        startDateTime,
        subject,
        testTitle,
        testType,
        totalMarks,
        updatedAt: new Date().toISOString(),
      }),
    );
    setSubmitState({ loading: false, message: "Draft saved locally.", status: "success" });
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-[36px] bg-[#070B19] p-4 text-slate-100 sm:p-5 lg:p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(168,85,247,0.20),transparent_28%),linear-gradient(135deg,rgba(59,130,246,0.08),rgba(15,23,42,0))]" />

      <div className="relative space-y-6">
        <LecturerBackButton variant="dark" />
        <BuilderHeader onFilesSelected={handleQuestionFiles} />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,66fr)_minmax(340px,34fr)]">
          <div className="space-y-6">
            <TestSettingsCard
              assignedBatch={assignedBatch}
              description={description}
              durationMinutes={durationMinutes}
              endDateTime={endDateTime}
              onAssignedBatchChange={setAssignedBatch}
              onDescriptionChange={setDescription}
              onDurationMinutesChange={setDurationMinutes}
              onEndDateTimeChange={setEndDateTime}
              onStartDateTimeChange={setStartDateTime}
              onSubjectChange={setSubject}
              onTestTitleChange={setTestTitle}
              onTestTypeChange={setTestType}
              onTotalMarksChange={setTotalMarks}
              startDateTime={startDateTime}
              subject={subject}
              testTitle={testTitle}
              testType={testType}
              totalMarks={totalMarks}
            />

            <QuestionImportPanel onFilesSelected={handleQuestionFiles} uploadedFiles={uploadedFiles} />

            <SectionSelector sections={sections} onAddSection={addSection} />

            <SelectedSections
              activeSectionId={activeSectionId}
              codingQuestions={codingQuestions}
              mcqQuestions={mcqQuestions}
              onDeleteSection={deleteSection}
              onEditSection={setActiveSectionId}
              qaQuestions={qaQuestions}
              sections={sections}
            />

            {activeSection ? (
              <SectionEditor
                activeSection={activeSection}
                codingQuestions={codingQuestions}
                mcqQuestions={mcqQuestions}
                onAddMcqQuestion={addMcqQuestion}
                onAddQaQuestion={addQaQuestion}
                onAddQuestion={addCodingQuestion}
                onDeleteMcqQuestion={deleteMcqQuestion}
                onDeleteQaQuestion={deleteQaQuestion}
                onDeleteQuestion={deleteCodingQuestion}
                onDuplicateQuestion={duplicateCodingQuestion}
                onSelectQuestion={setSelectedQuestionId}
                onUpdateMcqOption={updateMcqOption}
                onUpdateMcqQuestion={updateMcqQuestion}
                onUpdateQaQuestion={updateQaQuestion}
                onUpdateQuestion={updateQuestion}
                onUpdateSection={updateSection}
                qaQuestions={qaQuestions}
                selectedQuestion={selectedQuestion}
              />
            ) : null}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-[132px] xl:self-start">
            <HeaderPreviewCard
              assignedBatch={assignedBatch}
              durationMinutes={durationMinutes}
              sectionSummary={sectionSummary}
              subject={subject}
              testTitle={testTitle}
              testType={testType}
              totalMarks={totalMarks}
              validationResult={validationResult}
            />
          </aside>
        </div>

        <BottomActions
          canCreate={validationResult.isValid && !submitState.loading}
          message={submitState.message}
          onCreate={handleCreateTest}
          onPreview={() => setPreviewOpen(true)}
          onSaveDraft={handleSaveDraft}
          status={submitState.status}
        />
      </div>

      {previewOpen ? (
        <TestPreviewModal
          assignedBatch={assignedBatch}
          codingQuestions={codingQuestions}
          durationMinutes={durationMinutes}
          mcqQuestions={mcqQuestions}
          onClose={() => setPreviewOpen(false)}
          qaQuestions={qaQuestions}
          sectionSummary={sectionSummary}
          sections={sections}
          subject={subject}
          testTitle={testTitle}
          testType={testType}
          totalMarks={totalMarks}
          validationResult={validationResult}
        />
      ) : null}
    </motion.div>
  );
}

function BuilderHeader({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  return (
    <section className={`${glassCard} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[12px] font-extrabold uppercase text-cyan-200">
            Lecturer Test Builder
          </span>
          <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-white sm:text-[40px]">Create Test</h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-300">
            Configure test settings, choose sections, import questions, and publish assessments for assigned batches.
          </p>
        </div>
        <UploadQuestionsButton label="Upload Questions" onFilesSelected={onFilesSelected} primary />
      </div>
    </section>
  );
}

function QuestionImportPanel({
  onFilesSelected,
  uploadedFiles,
}: {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: UploadedQuestionFile[];
}) {
  return (
    <section id="upload-questions" tabIndex={-1} className="scroll-mt-28 outline-none">
      <LecturerBackButton className="mb-4" variant="dark" />
      <GlassPanel
        title="Import Questions"
        subtitle="Upload .json, .txt, or .csv files and add parsed questions to the current test."
        icon={UploadCloud}
        action={<UploadQuestionsButton label="Choose Files" onFilesSelected={onFilesSelected} />}
      >
        <div className="rounded-3xl border border-dashed border-cyan-300/20 bg-white/[0.055] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[15px] font-extrabold text-white">Frontend-only question import</p>
              <p className="mt-1 text-[13px] leading-6 text-slate-400">
                Supported formats: .json, .txt, .csv. Valid questions are imported into MCQ, Q&A, and Coding sections.
              </p>
            </div>
            <UploadQuestionsButton label="Upload Questions" onFilesSelected={onFilesSelected} primary />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {uploadedFiles.length ? (
            uploadedFiles.map((file) => <UploadedFileCard key={file.id} file={file} />)
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <p className="text-[14px] font-extrabold text-white">No files uploaded yet</p>
              <p className="mt-1 text-[13px] text-slate-400">
                Upload files here or from the page header to import questions without a backend.
              </p>
            </div>
          )}
        </div>
      </GlassPanel>
    </section>
  );
}

function UploadQuestionsButton({
  label,
  onFilesSelected,
  primary = false,
}: {
  label: string;
  onFilesSelected: (files: File[]) => void;
  primary?: boolean;
}) {
  return (
    <label
      className={cn(
        "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 text-[13px] font-extrabold transition",
        primary
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.18)] hover:from-cyan-300 hover:to-purple-400"
          : "border border-white/10 bg-white/[0.075] text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100",
      )}
    >
      <UploadCloud aria-hidden="true" size={16} strokeWidth={2.5} />
      {label}
      <input
        accept=".txt,.json,.csv"
        className="sr-only"
        multiple
        onChange={(event) => {
          onFilesSelected(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
        type="file"
      />
    </label>
  );
}

function UploadedFileCard({ file }: { file: UploadedQuestionFile }) {
  const successful = file.status === "Imported";

  return (
    <article
      className={cn(
        "rounded-2xl border p-4",
        successful ? "border-emerald-300/20 bg-emerald-300/10" : "border-rose-300/20 bg-rose-300/10",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-all text-[15px] font-extrabold text-white">{file.fileName}</p>
            <span
              className={cn(
                "inline-flex h-7 items-center rounded-full px-3 text-[11px] font-extrabold",
                successful ? "bg-emerald-400/15 text-emerald-100" : "bg-rose-400/15 text-rose-100",
              )}
            >
              {file.status}
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-6 text-slate-300">{file.message}</p>
        </div>
        <div className="grid min-w-[220px] grid-cols-2 gap-2">
          <MiniValue label="Size" value={formatFileSize(file.size)} />
          <MiniValue label="Type" value={file.fileType} />
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        <MiniValue label="Imported" value={file.importedMcq + file.importedQa + file.importedCoding} />
        <MiniValue label="Skipped" value={file.skippedCount} />
        <MiniValue label="MCQ" value={file.importedMcq} />
        <MiniValue label="Q&A" value={file.importedQa} />
        <MiniValue label="Coding" value={file.importedCoding} />
      </div>

      {file.errors.length ? (
        <div
          className={cn(
            "mt-3 rounded-2xl border p-3",
            successful ? "border-amber-300/20 bg-amber-300/10" : "border-rose-300/20 bg-rose-300/10",
          )}
        >
          <p className={cn("text-[12px] font-extrabold uppercase", successful ? "text-amber-100" : "text-rose-100")}>
            {successful ? "Import warnings" : "Import errors"}
          </p>
          <ul className="mt-2 space-y-1">
            {file.errors.map((error, index) => (
              <li key={`${file.id}-error-${index}`} className="text-[12px] font-semibold leading-5 text-slate-200">
                {error}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function TestSettingsCard({
  assignedBatch,
  description,
  durationMinutes,
  endDateTime,
  onAssignedBatchChange,
  onDescriptionChange,
  onDurationMinutesChange,
  onEndDateTimeChange,
  onStartDateTimeChange,
  onSubjectChange,
  onTestTitleChange,
  onTestTypeChange,
  onTotalMarksChange,
  startDateTime,
  subject,
  testTitle,
  testType,
  totalMarks,
}: {
  assignedBatch: string;
  description: string;
  durationMinutes: number;
  endDateTime: string;
  onAssignedBatchChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDurationMinutesChange: (value: number) => void;
  onEndDateTimeChange: (value: string) => void;
  onStartDateTimeChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onTestTitleChange: (value: string) => void;
  onTestTypeChange: (value: TestType) => void;
  onTotalMarksChange: (value: number) => void;
  startDateTime: string;
  subject: string;
  testTitle: string;
  testType: TestType;
  totalMarks: number;
}) {
  return (
    <GlassPanel title="Test Settings" subtitle="Basic test information and timing." icon={ClipboardList}>
      <div className="grid gap-4">
        <DarkInput label="Test title" onChange={onTestTitleChange} placeholder="Enter test title" value={testTitle} />
        <DarkTextarea label="Description" onChange={onDescriptionChange} value={description} />
        <div className="grid gap-4 md:grid-cols-2">
          <DarkSelect label="Batch" onChange={onAssignedBatchChange} options={batchOptions} value={assignedBatch} />
          <DarkSelect label="Subject" onChange={onSubjectChange} options={subjectOptions} value={subject} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <DarkSelect<TestType> label="Test type" onChange={onTestTypeChange} options={testTypeOptions} value={testType} />
          <DarkNumberInput label="Duration in minutes" min={1} onChange={onDurationMinutesChange} value={durationMinutes} />
          <DarkNumberInput label="Total marks" min={1} onChange={onTotalMarksChange} value={totalMarks} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <DarkInput label="Start date/time" onChange={onStartDateTimeChange} type="datetime-local" value={startDateTime} />
          <DarkInput label="End date/time" onChange={onEndDateTimeChange} type="datetime-local" value={endDateTime} />
        </div>
      </div>
    </GlassPanel>
  );
}

function SectionSelector({
  onAddSection,
  sections,
}: {
  onAddSection: (type: TestSectionType) => void;
  sections: TestSectionDraft[];
}) {
  return (
    <GlassPanel title="Section Selector" subtitle="Add the question sections needed for this test." icon={Layers3}>
      <div className="grid gap-3 md:grid-cols-3">
        {sectionOptions.map((sectionOption) => {
          const Icon = sectionOption.icon;
          const added = sections.some((section) => section.type === sectionOption.type);

          return (
            <button
              key={sectionOption.type}
              type="button"
              className={cn(
                "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
                added
                  ? "border-cyan-300/40 bg-cyan-300/10"
                  : "border-white/10 bg-white/[0.055] hover:border-purple-300/40 hover:bg-purple-300/10",
              )}
              onClick={() => onAddSection(sectionOption.type)}
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                <Icon aria-hidden="true" size={19} strokeWidth={2.5} />
              </span>
              <p className="mt-4 text-[15px] font-extrabold text-white">{sectionOption.type}</p>
              <p className="mt-1 text-[12px] font-semibold leading-5 text-slate-400">{sectionOption.description}</p>
              <p className="mt-3 text-[11px] font-extrabold uppercase text-cyan-200">{added ? "Added" : "Add section"}</p>
            </button>
          );
        })}
      </div>
    </GlassPanel>
  );
}

function SelectedSections({
  activeSectionId,
  codingQuestions,
  mcqQuestions,
  onDeleteSection,
  onEditSection,
  qaQuestions,
  sections,
}: {
  activeSectionId: string;
  codingQuestions: CodingQuestionDraft[];
  mcqQuestions: MCQQuestionDraft[];
  onDeleteSection: (sectionId: string) => void;
  onEditSection: (sectionId: string) => void;
  qaQuestions: QAQuestionDraft[];
  sections: TestSectionDraft[];
}) {
  return (
    <GlassPanel title="Selected Sections" subtitle="Review section counts and marks before creating the test." icon={CheckCircle2}>
      <div className="grid gap-3 md:grid-cols-2">
        {sections.map((section) => {
          const active = activeSectionId === section.id;
          const questionCount = getSectionQuestionCount(section, codingQuestions, mcqQuestions, qaQuestions);
          const marks = getSectionMarks(section, codingQuestions, mcqQuestions, qaQuestions);

          return (
            <article
              key={section.id}
              className={cn(
                "rounded-2xl border p-4",
                active ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/[0.055]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] font-extrabold uppercase text-slate-500">Section</p>
                  <h3 className="mt-1 text-[18px] font-extrabold text-white">{section.type}</h3>
                </div>
                <SectionPill label={active ? "Editing" : "Ready"} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniValue label="Questions" value={questionCount} />
                <MiniValue label="Marks" value={marks} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <DarkButton icon={Eye} label="Edit section" onClick={() => onEditSection(section.id)} />
                <DarkButton icon={Trash2} label="Delete" tone="danger" onClick={() => onDeleteSection(section.id)} />
              </div>
            </article>
          );
        })}
      </div>

      {sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.045] p-5 text-center">
          <p className="text-[15px] font-extrabold text-white">No sections selected</p>
          <p className="mt-1 text-[13px] text-slate-400">Add MCQ, Question & Answer, or Coding to begin.</p>
        </div>
      ) : null}
    </GlassPanel>
  );
}

function SectionEditor({
  activeSection,
  codingQuestions,
  mcqQuestions,
  onAddMcqQuestion,
  onAddQaQuestion,
  onAddQuestion,
  onDeleteMcqQuestion,
  onDeleteQaQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onSelectQuestion,
  onUpdateMcqOption,
  onUpdateMcqQuestion,
  onUpdateQaQuestion,
  onUpdateQuestion,
  onUpdateSection,
  qaQuestions,
  selectedQuestion,
}: {
  activeSection: TestSectionDraft;
  codingQuestions: CodingQuestionDraft[];
  mcqQuestions: MCQQuestionDraft[];
  onAddMcqQuestion: () => void;
  onAddQaQuestion: () => void;
  onAddQuestion: () => void;
  onDeleteMcqQuestion: (questionId: string) => void;
  onDeleteQaQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (question: CodingQuestionDraft) => void;
  onSelectQuestion: (questionId: string) => void;
  onUpdateMcqOption: (questionId: string, optionIndex: number, value: string) => void;
  onUpdateMcqQuestion: <Key extends keyof MCQQuestionDraft>(
    questionId: string,
    field: Key,
    value: MCQQuestionDraft[Key],
  ) => void;
  onUpdateQaQuestion: <Key extends keyof QAQuestionDraft>(
    questionId: string,
    field: Key,
    value: QAQuestionDraft[Key],
  ) => void;
  onUpdateQuestion: <Key extends keyof CodingQuestionDraft>(field: Key, value: CodingQuestionDraft[Key]) => void;
  onUpdateSection: (sectionId: string, field: "marks" | "questionCount", value: number) => void;
  qaQuestions: QAQuestionDraft[];
  selectedQuestion: CodingQuestionDraft;
}) {
  if (activeSection.type === "MCQ") {
    return (
      <McqSectionBuilder
        mcqQuestions={mcqQuestions}
        onAddQuestion={onAddMcqQuestion}
        onDeleteQuestion={onDeleteMcqQuestion}
        onUpdateOption={onUpdateMcqOption}
        onUpdateQuestion={onUpdateMcqQuestion}
      />
    );
  }

  if (activeSection.type === "Coding") {
    return (
      <CodingSectionBuilder
        codingQuestions={codingQuestions}
        onAddQuestion={onAddQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onDuplicateQuestion={onDuplicateQuestion}
        onSelectQuestion={onSelectQuestion}
        onUpdateQuestion={onUpdateQuestion}
        selectedQuestion={selectedQuestion}
      />
    );
  }

  if (activeSection.type === "Question & Answer") {
    return (
      <QaSectionBuilder
        onAddQuestion={onAddQaQuestion}
        onDeleteQuestion={onDeleteQaQuestion}
        onUpdateQuestion={onUpdateQaQuestion}
        qaQuestions={qaQuestions}
      />
    );
  }

  return (
    <GlassPanel title={`${activeSection.type} Section`} subtitle="Base section controls only. Question forms can be added later." icon={FileQuestion}>
      <div className="grid gap-4 md:grid-cols-2">
        <DarkNumberInput
          label="Number of questions"
          min={0}
          onChange={(value) => onUpdateSection(activeSection.id, "questionCount", value)}
          value={activeSection.questionCount}
        />
        <DarkNumberInput
          label="Marks"
          min={0}
          onChange={(value) => onUpdateSection(activeSection.id, "marks", value)}
          value={activeSection.marks}
        />
      </div>
      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.045] p-5">
        <SectionPill label="Question builder not connected" />
        <p className="mt-3 text-[14px] leading-6 text-slate-400">
          This keeps MCQ and Q&A sections safe while the base test builder is prepared.
        </p>
      </div>
    </GlassPanel>
  );
}

function McqSectionBuilder({
  mcqQuestions,
  onAddQuestion,
  onDeleteQuestion,
  onUpdateOption,
  onUpdateQuestion,
}: {
  mcqQuestions: MCQQuestionDraft[];
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onUpdateOption: (questionId: string, optionIndex: number, value: string) => void;
  onUpdateQuestion: <Key extends keyof MCQQuestionDraft>(
    questionId: string,
    field: Key,
    value: MCQQuestionDraft[Key],
  ) => void;
}) {
  const incompleteQuestions = getIncompleteMcqQuestions(mcqQuestions);
  const totalMarks = getMcqMarks(mcqQuestions);

  return (
    <GlassPanel
      title="MCQ Section Builder"
      subtitle="Create objective questions with editable options and a selected correct answer."
      icon={FileQuestion}
      action={<DarkButton icon={Plus} label="Add Question" onClick={onAddQuestion} primary />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          {mcqQuestions.map((question, questionIndex) => (
            <article key={question.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-[13px] font-black text-cyan-100">
                    Q{questionIndex + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-extrabold text-white">MCQ Question {questionIndex + 1}</p>
                    <p className="text-[12px] font-semibold text-slate-400">Question text, options, marks, and explanation</p>
                  </div>
                </div>
                <DarkButton
                  disabled={mcqQuestions.length === 1}
                  icon={Trash2}
                  label="Delete Question"
                  onClick={() => onDeleteQuestion(question.id)}
                  tone="danger"
                />
              </div>

              <label className="block">
                <span className="text-[13px] font-extrabold text-slate-200">Question</span>
                <textarea
                  className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-[#11182B] px-4 py-3 text-[15px] font-semibold leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                  onChange={(event) => onUpdateQuestion(question.id, "question", event.target.value)}
                  placeholder="Enter the MCQ question"
                  value={question.question}
                />
              </label>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const selected = question.correctOptionIndex === optionIndex;

                  return (
                    <div
                      key={`${question.id}-option-${optionIndex}`}
                      className={cn(
                        "rounded-2xl border p-3 transition",
                        selected
                          ? "border-emerald-300/45 bg-emerald-300/10 shadow-[0_10px_26px_rgba(16,185,129,0.10)]"
                          : "border-white/10 bg-[#11182B] hover:border-cyan-300/35",
                      )}
                      onClick={() => onUpdateQuestion(question.id, "correctOptionIndex", optionIndex)}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-black",
                            selected ? "bg-emerald-400 text-slate-950" : "bg-white/[0.07] text-slate-300",
                          )}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </span>
                        <input
                          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-[14px] font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
                          onChange={(event) => onUpdateOption(question.id, optionIndex, event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onFocus={() => onUpdateQuestion(question.id, "correctOptionIndex", optionIndex)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          value={option}
                        />
                      </div>
                      {selected ? (
                        <p className="mt-2 text-[11px] font-extrabold uppercase text-emerald-200">Correct answer</p>
                      ) : (
                        <button
                          type="button"
                          className="mt-2 text-[11px] font-extrabold uppercase text-slate-500 transition hover:text-cyan-200"
                          onClick={(event) => {
                            event.stopPropagation();
                            onUpdateQuestion(question.id, "correctOptionIndex", optionIndex);
                          }}
                        >
                          Mark as correct
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                <DarkNumberInput
                  label="Marks per question"
                  min={1}
                  onChange={(value) => onUpdateQuestion(question.id, "marks", value)}
                  value={question.marks}
                />
                <BuilderTextarea
                  label="Explanation optional"
                  onChange={(value) => onUpdateQuestion(question.id, "explanation", value)}
                  placeholder="Optional explanation for review or answer key."
                  rows={3}
                  value={question.explanation}
                />
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-[132px] xl:self-start">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-[12px] font-extrabold uppercase text-cyan-100">Live MCQ Preview</p>
            <div className="mt-4 grid gap-3">
              <MiniValue label="Questions" value={mcqQuestions.length} />
              <MiniValue label="Total marks" value={totalMarks} />
            </div>
          </div>

          <div
            className={cn(
              "rounded-3xl border p-4",
              incompleteQuestions.length
                ? "border-amber-300/25 bg-amber-300/10"
                : "border-emerald-300/25 bg-emerald-300/10",
            )}
          >
            <p className="text-[13px] font-extrabold text-white">
              {incompleteQuestions.length ? "Incomplete questions warning" : "All MCQ questions complete"}
            </p>
            <p className={cn("mt-2 text-[13px] leading-6", incompleteQuestions.length ? "text-amber-100" : "text-emerald-100")}>
              {incompleteQuestions.length
                ? `Check Q${incompleteQuestions.join(", Q")} before creating the test.`
                : "Every question has text, four options, a correct answer, and marks."}
            </p>
          </div>
        </aside>
      </div>
    </GlassPanel>
  );
}

function QaSectionBuilder({
  onAddQuestion,
  onDeleteQuestion,
  onUpdateQuestion,
  qaQuestions,
}: {
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onUpdateQuestion: <Key extends keyof QAQuestionDraft>(
    questionId: string,
    field: Key,
    value: QAQuestionDraft[Key],
  ) => void;
  qaQuestions: QAQuestionDraft[];
}) {
  const incompleteQuestions = getIncompleteQaQuestions(qaQuestions);
  const totalMarks = getQaMarks(qaQuestions);

  return (
    <GlassPanel
      title="Question & Answer Builder"
      subtitle="Create written-response questions with answer keys, marks, difficulty, and optional rubric details."
      icon={FileText}
      action={<DarkButton icon={Plus} label="Add Question" onClick={onAddQuestion} primary />}
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          {qaQuestions.map((question, questionIndex) => (
            <article key={question.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-[13px] font-black text-cyan-100">
                    Q{questionIndex + 1}
                  </span>
                  <div>
                    <p className="text-[15px] font-extrabold text-white">Q&A Question {questionIndex + 1}</p>
                    <p className="text-[12px] font-semibold text-slate-400">Written answer, marks, difficulty, and rubric</p>
                  </div>
                </div>
                <DarkButton
                  disabled={qaQuestions.length === 1}
                  icon={Trash2}
                  label="Delete Question"
                  onClick={() => onDeleteQuestion(question.id)}
                  tone="danger"
                />
              </div>

              <div className="grid gap-4">
                <BuilderTextarea
                  label="Question"
                  onChange={(value) => onUpdateQuestion(question.id, "question", value)}
                  placeholder="Enter the written-response question"
                  rows={3}
                  value={question.question}
                />
                <BuilderTextarea
                  label="Expected answer"
                  onChange={(value) => onUpdateQuestion(question.id, "expectedAnswer", value)}
                  placeholder="Write the answer key or ideal response."
                  rows={5}
                  value={question.expectedAnswer}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <DarkNumberInput
                    label="Marks"
                    min={1}
                    onChange={(value) => onUpdateQuestion(question.id, "marks", value)}
                    value={question.marks}
                  />
                  <DarkSelect<CodingQuestionDifficulty>
                    label="Difficulty"
                    onChange={(value) => onUpdateQuestion(question.id, "difficulty", value)}
                    options={difficultyOptions}
                    value={question.difficulty}
                  />
                </div>
                <BuilderInput
                  label="Optional keywords for evaluation"
                  onChange={(value) => onUpdateQuestion(question.id, "keywords", value)}
                  placeholder="Example: dependency injection, bean, IoC"
                  value={question.keywords}
                />
                <BuilderTextarea
                  label="Optional explanation/rubric"
                  onChange={(value) => onUpdateQuestion(question.id, "explanation", value)}
                  placeholder="Add marking guidance, partial-credit notes, or explanation."
                  rows={4}
                  value={question.explanation}
                />
              </div>
            </article>
          ))}
        </div>

        <aside className="space-y-3 xl:sticky xl:top-[132px] xl:self-start">
          <div className="rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4">
            <p className="text-[12px] font-extrabold uppercase text-cyan-100">Live Q&A Preview</p>
            <div className="mt-4 grid gap-3">
              <MiniValue label="Questions" value={qaQuestions.length} />
              <MiniValue label="Total marks" value={totalMarks} />
            </div>
          </div>

          <div
            className={cn(
              "rounded-3xl border p-4",
              incompleteQuestions.length
                ? "border-amber-300/25 bg-amber-300/10"
                : "border-emerald-300/25 bg-emerald-300/10",
            )}
          >
            <p className="text-[13px] font-extrabold text-white">
              {incompleteQuestions.length ? "Incomplete questions warning" : "All Q&A questions complete"}
            </p>
            <p className={cn("mt-2 text-[13px] leading-6", incompleteQuestions.length ? "text-amber-100" : "text-emerald-100")}>
              {incompleteQuestions.length
                ? `Check Q${incompleteQuestions.join(", Q")} before creating the test.`
                : "Every question has text, an expected answer, marks, and difficulty."}
            </p>
          </div>
        </aside>
      </div>
    </GlassPanel>
  );
}

function CodingSectionBuilder({
  codingQuestions,
  onAddQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onSelectQuestion,
  onUpdateQuestion,
  selectedQuestion,
}: {
  codingQuestions: CodingQuestionDraft[];
  onAddQuestion: () => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (question: CodingQuestionDraft) => void;
  onSelectQuestion: (questionId: string) => void;
  onUpdateQuestion: <Key extends keyof CodingQuestionDraft>(field: Key, value: CodingQuestionDraft[Key]) => void;
  selectedQuestion: CodingQuestionDraft;
}) {
  return (
    <GlassPanel
      title="Coding Section Builder"
      subtitle="Editable coding questions are stored in local React state only."
      icon={Code2}
      action={<DarkButton icon={Plus} label="Add Coding Question" onClick={onAddQuestion} primary />}
    >
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {codingQuestions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              className={cn(
                "w-full rounded-2xl border p-3 text-left transition hover:border-cyan-300/40",
                question.id === selectedQuestion.id ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 bg-white/[0.055]",
              )}
              onClick={() => onSelectQuestion(question.id)}
            >
              <p className="text-[11px] font-extrabold uppercase text-slate-500">Coding {index + 1}</p>
              <p className="mt-1 truncate text-[14px] font-extrabold text-white">{question.title}</p>
              <div className="mt-2 flex gap-2">
                <SectionPill label={question.difficulty} />
                <SectionPill label={`${question.marks}m`} />
              </div>
            </button>
          ))}
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] font-extrabold uppercase text-slate-500">Editing selected coding question</p>
              <h3 className="mt-1 text-[20px] font-extrabold text-white">{selectedQuestion.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <DarkButton icon={Copy} label="Duplicate" onClick={() => onDuplicateQuestion(selectedQuestion)} />
              <DarkButton
                disabled={codingQuestions.length === 1}
                icon={Trash2}
                label="Delete"
                onClick={() => onDeleteQuestion(selectedQuestion.id)}
                tone="danger"
              />
            </div>
          </div>

          <div className="grid gap-4">
            <BuilderInput
              label="Problem title"
              onChange={(value) => onUpdateQuestion("title", value)}
              placeholder="Two Sum"
              value={selectedQuestion.title}
            />
            <BuilderTextarea
              label="Problem statement"
              onChange={(value) => onUpdateQuestion("problemStatement", value)}
              placeholder="Describe the coding problem clearly."
              value={selectedQuestion.problemStatement}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <BuilderTextarea label="Input format" onChange={(value) => onUpdateQuestion("inputFormat", value)} value={selectedQuestion.inputFormat} />
              <BuilderTextarea label="Output format" onChange={(value) => onUpdateQuestion("outputFormat", value)} value={selectedQuestion.outputFormat} />
            </div>
            <BuilderTextarea label="Constraints" onChange={(value) => onUpdateQuestion("constraints", value)} value={selectedQuestion.constraints} />
            <div className="grid gap-4 md:grid-cols-2">
              <BuilderTextarea label="Sample input" onChange={(value) => onUpdateQuestion("sampleInput", value)} value={selectedQuestion.sampleInput} />
              <BuilderTextarea label="Sample output" onChange={(value) => onUpdateQuestion("sampleOutput", value)} value={selectedQuestion.sampleOutput} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <NumberInput label="Hidden test cases count" min={0} onChange={(value) => onUpdateQuestion("hiddenTestCasesCount", value)} value={selectedQuestion.hiddenTestCasesCount} />
              <NumberInput label="Marks" min={1} onChange={(value) => onUpdateQuestion("marks", value)} value={selectedQuestion.marks} />
              <DifficultySelect onChange={(value) => onUpdateQuestion("difficulty", value)} value={selectedQuestion.difficulty} />
            </div>
            <AllowedLanguages selectedLanguages={selectedQuestion.allowedLanguages} onChange={(value) => onUpdateQuestion("allowedLanguages", value)} />
            <BuilderTextarea label="Starter code optional" onChange={(value) => onUpdateQuestion("starterCode", value)} placeholder="Optional starter code for students." rows={7} value={selectedQuestion.starterCode} />
            <BuilderTextarea label="Explanation optional" onChange={(value) => onUpdateQuestion("explanation", value)} placeholder="Optional explanation visible to lecturers." value={selectedQuestion.explanation} />
          </div>
        </section>
      </div>
    </GlassPanel>
  );
}

function HeaderPreviewCard({
  assignedBatch,
  durationMinutes,
  sectionSummary,
  subject,
  testTitle,
  testType,
  totalMarks,
  validationResult,
}: {
  assignedBatch: string;
  durationMinutes: number;
  sectionSummary: Array<TestSectionDraft>;
  subject: string;
  testTitle: string;
  testType: TestType;
  totalMarks: number;
  validationResult: TestValidationResult;
}) {
  const totalQuestionCount = sectionSummary.reduce((total, section) => total + section.questionCount, 0);
  const validationItems = [...validationResult.errors, ...validationResult.warnings];

  return (
    <section className={`${glassCard} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-extrabold uppercase text-slate-500">Header Preview</p>
          <h2 className="mt-2 text-[24px] font-extrabold leading-tight text-white">{testTitle || "Untitled Test"}</h2>
          <p className="mt-2 text-[14px] font-semibold text-cyan-100">{testType}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <CalendarClock aria-hidden="true" size={21} strokeWidth={2.5} />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <PreviewRow label="Duration" value={`${durationMinutes || 0} minutes`} />
        <PreviewRow label="Total marks" value={totalMarks || 0} />
        <PreviewRow label="Assigned batch" value={assignedBatch} />
        <PreviewRow label="Subject" value={subject} />
        <PreviewRow label="Question count" value={totalQuestionCount} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
        <p className="text-[12px] font-extrabold uppercase text-slate-500">Selected sections</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sectionSummary.length ? (
            sectionSummary.map((section) => (
              <SectionPill
                key={section.id}
                label={`${section.type} - ${section.questionCount}Q - ${section.marks}M`}
              />
            ))
          ) : (
            <span className="text-[13px] font-semibold text-slate-400">No sections selected</span>
          )}
        </div>
      </div>

      <div
        className={cn(
          "mt-5 rounded-2xl border p-4",
          validationResult.isValid
            ? "border-emerald-300/25 bg-emerald-300/10"
            : "border-amber-300/25 bg-amber-300/10",
        )}
      >
        <p className="text-[13px] font-extrabold text-white">
          {validationResult.isValid ? "Ready to create" : "Needs review before create"}
        </p>
        <p className={cn("mt-2 text-[13px] leading-6", validationResult.isValid ? "text-emerald-100" : "text-amber-100")}>
          {validationResult.isValid
            ? "All required settings and selected section questions are valid."
            : `${validationResult.errors.length + validationResult.warnings.length} item(s) need attention.`}
        </p>
        {!validationResult.isValid && validationItems.length ? (
          <ul className="mt-3 space-y-1">
            {validationItems.slice(0, 4).map((item, index) => (
              <li key={`${item}-${index}`} className="text-[12px] font-semibold leading-5 text-amber-100/90">
                {item}
              </li>
            ))}
            {validationItems.length > 4 ? (
              <li className="text-[12px] font-extrabold text-amber-100">
                +{validationItems.length - 4} more warning(s)
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function BottomActions({
  canCreate,
  message,
  onCreate,
  onPreview,
  onSaveDraft,
  status,
}: {
  canCreate: boolean;
  message: string;
  onCreate: () => void;
  onPreview: () => void;
  onSaveDraft: () => void;
  status: "error" | "idle" | "success";
}) {
  return (
    <section className={`${glassCard} p-4`}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <DarkButton icon={X} label="Cancel" onClick={() => navigateToLecturerPath("/lecturer/tests")} />
        <DarkButton icon={Save} label="Save Draft" onClick={onSaveDraft} />
        <DarkButton icon={Eye} label="Preview Test" onClick={onPreview} />
        <DarkButton disabled={!canCreate} icon={CheckCircle2} label="Create Test" onClick={onCreate} primary />
      </div>
      {!canCreate ? (
        <p className="mt-3 text-right text-[12px] font-semibold text-amber-100">
          Create Test unlocks after validation passes.
        </p>
      ) : null}
      {message ? (
        <p
          className={cn(
            "mt-3 text-right text-[12px] font-semibold",
            status === "success" ? "text-emerald-100" : status === "error" ? "text-rose-100" : "text-slate-300",
          )}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}

function TestPreviewModal({
  assignedBatch,
  codingQuestions,
  durationMinutes,
  mcqQuestions,
  onClose,
  qaQuestions,
  sectionSummary,
  sections,
  subject,
  testTitle,
  testType,
  totalMarks,
  validationResult,
}: {
  assignedBatch: string;
  codingQuestions: CodingQuestionDraft[];
  durationMinutes: number;
  mcqQuestions: MCQQuestionDraft[];
  onClose: () => void;
  qaQuestions: QAQuestionDraft[];
  sectionSummary: TestSectionDraft[];
  sections: TestSectionDraft[];
  subject: string;
  testTitle: string;
  testType: TestType;
  totalMarks: number;
  validationResult: TestValidationResult;
}) {
  const selectedSectionTypes = new Set(sections.map((section) => section.type));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <motion.section
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-[#080D1C] shadow-[0_28px_80px_rgba(2,6,23,0.65)]"
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="text-[12px] font-extrabold uppercase text-cyan-200">Full Test Preview</p>
            <h2 className="mt-2 text-[26px] font-extrabold text-white">{testTitle || "Untitled Test"}</h2>
            <p className="mt-1 text-[14px] font-semibold text-slate-400">Review settings, answers, and incomplete-question warnings before creating.</p>
          </div>
          <button
            type="button"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.075] text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X aria-hidden="true" size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-98px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PreviewRow label="Batch" value={assignedBatch || "Not selected"} />
            <PreviewRow label="Subject" value={subject || "Not selected"} />
            <PreviewRow label="Test type" value={testType} />
            <PreviewRow label="Duration" value={`${durationMinutes || 0} minutes`} />
            <PreviewRow label="Total marks" value={totalMarks || 0} />
            <PreviewRow label="Sections" value={sectionSummary.length} />
          </div>

          <ValidationBlock validationResult={validationResult} />

          <div className="mt-6 space-y-5">
            {sectionSummary.map((section) => (
              <div key={section.id} className="rounded-3xl border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[20px] font-extrabold text-white">{section.type}</h3>
                  <div className="flex flex-wrap gap-2">
                    <SectionPill label={`${section.questionCount} questions`} />
                    <SectionPill label={`${section.marks} marks`} />
                  </div>
                </div>

                {section.type === "MCQ" && selectedSectionTypes.has("MCQ") ? (
                  <div className="mt-4 space-y-3">
                    {mcqQuestions.map((question, index) => (
                      <PreviewQuestionCard
                        key={question.id}
                        issues={getMcqQuestionIssues(question)}
                        label={`Q${index + 1}`}
                        marks={question.marks}
                        title={question.question || "Untitled MCQ question"}
                      >
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <div
                              key={`${question.id}-preview-${optionIndex}`}
                              className={cn(
                                "rounded-2xl border px-3 py-2 text-[13px] font-semibold",
                                question.correctOptionIndex === optionIndex
                                  ? "border-emerald-300/35 bg-emerald-300/10 text-emerald-100"
                                  : "border-white/10 bg-white/[0.045] text-slate-300",
                              )}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option || "Missing option"}
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-[13px] font-bold text-emerald-100">
                          Answer: {String.fromCharCode(65 + question.correctOptionIndex)}
                        </p>
                        {question.explanation ? <PreviewText label="Explanation" value={question.explanation} /> : null}
                      </PreviewQuestionCard>
                    ))}
                  </div>
                ) : null}

                {section.type === "Question & Answer" && selectedSectionTypes.has("Question & Answer") ? (
                  <div className="mt-4 space-y-3">
                    {qaQuestions.map((question, index) => (
                      <PreviewQuestionCard
                        key={question.id}
                        issues={getQaQuestionIssues(question)}
                        label={`Q${index + 1}`}
                        marks={question.marks}
                        title={question.question || "Untitled Q&A question"}
                      >
                        <PreviewText label="Expected answer" value={question.expectedAnswer || "Missing expected answer"} />
                        <div className="mt-3 flex flex-wrap gap-2">
                          <SectionPill label={question.difficulty} />
                          {question.keywords ? <SectionPill label={`Keywords: ${question.keywords}`} /> : null}
                        </div>
                        {question.explanation ? <PreviewText label="Rubric" value={question.explanation} /> : null}
                      </PreviewQuestionCard>
                    ))}
                  </div>
                ) : null}

                {section.type === "Coding" && selectedSectionTypes.has("Coding") ? (
                  <div className="mt-4 space-y-3">
                    {codingQuestions.map((question, index) => (
                      <PreviewQuestionCard
                        key={question.id}
                        issues={getCodingQuestionIssues(question)}
                        label={`Problem ${index + 1}`}
                        marks={question.marks}
                        title={question.title || "Untitled coding problem"}
                      >
                        <PreviewText label="Statement" value={question.problemStatement || "Missing statement"} />
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          <PreviewText label="Sample input" value={question.sampleInput || "Missing sample input"} />
                          <PreviewText label="Sample output" value={question.sampleOutput || "Missing sample output"} />
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <SectionPill label={question.difficulty} />
                          <SectionPill label={`${question.hiddenTestCasesCount} hidden cases`} />
                        </div>
                      </PreviewQuestionCard>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}

function ValidationBlock({ validationResult }: { validationResult: TestValidationResult }) {
  const items = [...validationResult.errors, ...validationResult.warnings];

  return (
    <div
      className={cn(
        "mt-5 rounded-3xl border p-4",
        validationResult.isValid ? "border-emerald-300/25 bg-emerald-300/10" : "border-amber-300/25 bg-amber-300/10",
      )}
    >
      <p className="text-[15px] font-extrabold text-white">
        {validationResult.isValid ? "Validation passed" : "Validation warnings"}
      </p>
      {items.length ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="text-[13px] font-semibold leading-6 text-amber-100">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[13px] font-semibold text-emerald-100">This test is ready to create.</p>
      )}
    </div>
  );
}

function PreviewQuestionCard({
  children,
  issues,
  label,
  marks,
  title,
}: {
  children: ReactNode;
  issues: string[];
  label: string;
  marks: number;
  title: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#11182B] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase text-cyan-200">{label}</p>
          <h4 className="mt-1 text-[15px] font-extrabold leading-6 text-white">{title}</h4>
        </div>
        <SectionPill label={`${marks || 0} marks`} />
      </div>
      {issues.length ? (
        <div className="mt-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-2">
          <p className="text-[12px] font-extrabold text-amber-100">{issues.join(", ")}</p>
        </div>
      ) : null}
      {children}
    </article>
  );
}

function PreviewText({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <p className="text-[11px] font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-[13px] font-semibold leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function GlassPanel({
  action,
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  icon: LucideIcon;
  subtitle: string;
  title: string;
}) {
  return (
    <motion.section className={`${glassCard} p-5 sm:p-6`} whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: "easeOut" }}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <Icon aria-hidden="true" size={21} strokeWidth={2.5} />
          </span>
          <div>
            <h2 className="text-[21px] font-extrabold text-white">{title}</h2>
            <p className="mt-1 text-[14px] leading-6 text-slate-400">{subtitle}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </motion.section>
  );
}

function DarkInput({
  label,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#11182B] px-4 text-[14px] font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function DarkTextarea({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
      <textarea
        className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-white/10 bg-[#11182B] px-4 py-3 text-[14px] font-semibold leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function DarkSelect<Option extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: Option) => void;
  options: Option[];
  value: Option;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
      <select
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#11182B] px-4 text-[14px] font-extrabold text-white outline-none transition focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value as Option)}
        value={value}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DarkNumberInput({
  label,
  min,
  onChange,
  value,
}: {
  label: string;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-[#11182B] px-4 text-[14px] font-semibold text-white outline-none transition focus:border-cyan-300/50"
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="number"
        value={value}
      />
    </label>
  );
}

function BuilderInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <DarkInput label={label} onChange={onChange} placeholder={placeholder} value={value} />
  );
}

function BuilderTextarea({
  label,
  onChange,
  placeholder,
  rows = 4,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-extrabold text-slate-200">{label}</span>
      <textarea
        className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-[#11182B] px-4 py-3 text-[14px] font-semibold leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function NumberInput({
  label,
  min,
  onChange,
  value,
}: {
  label: string;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return <DarkNumberInput label={label} min={min} onChange={onChange} value={value} />;
}

function DifficultySelect({
  onChange,
  value,
}: {
  onChange: (value: CodingQuestionDifficulty) => void;
  value: CodingQuestionDifficulty;
}) {
  return (
    <DarkSelect<CodingQuestionDifficulty>
      label="Difficulty"
      onChange={onChange}
      options={difficultyOptions}
      value={value}
    />
  );
}

function AllowedLanguages({
  onChange,
  selectedLanguages,
}: {
  onChange: (value: string[]) => void;
  selectedLanguages: string[];
}) {
  const toggleLanguage = (language: string) => {
    if (selectedLanguages.includes(language)) {
      const remainingLanguages = selectedLanguages.filter((item) => item !== language);
      onChange(remainingLanguages.length ? remainingLanguages : [language]);
      return;
    }

    onChange([...selectedLanguages, language]);
  };

  return (
    <div>
      <p className="text-[13px] font-extrabold text-slate-200">Allowed languages</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {languageOptions.map((language) => (
          <button
            key={language}
            type="button"
            className={cn(
              "h-9 rounded-xl px-3 text-[13px] font-extrabold transition",
              selectedLanguages.includes(language)
                ? "bg-cyan-300/10 text-cyan-100"
                : "border border-white/10 bg-white/[0.055] text-slate-300 hover:border-cyan-300/40 hover:text-cyan-100",
            )}
            onClick={() => toggleLanguage(language)}
          >
            {language}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
      <span className="text-[13px] font-bold text-slate-400">{label}</span>
      <span className="text-right text-[14px] font-extrabold text-white">{value}</span>
    </div>
  );
}

function MiniValue({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
      <p className="text-[11px] font-extrabold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-[20px] font-extrabold text-white">{value}</p>
    </div>
  );
}

function SectionPill({ label }: { label: string }) {
  return (
    <span className="inline-flex h-7 items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 text-[11px] font-extrabold text-cyan-100">
      {label}
    </span>
  );
}

function DarkButton({
  disabled = false,
  icon: Icon,
  label,
  onClick,
  primary = false,
  tone = "default",
}: {
  disabled?: boolean;
  icon?: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
  tone?: "danger" | "default";
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-[13px] font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50",
        primary
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_14px_30px_rgba(34,211,238,0.18)] hover:from-cyan-300 hover:to-purple-400"
          : tone === "danger"
            ? "border border-rose-300/20 bg-rose-300/10 text-rose-100 hover:border-rose-300/40"
            : "border border-white/10 bg-white/[0.075] text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100",
      )}
      onClick={onClick}
    >
      {Icon ? <Icon aria-hidden="true" size={16} strokeWidth={2.5} /> : null}
      {label}
    </button>
  );
}

function validateTestBuilder({
  assignedBatch,
  codingQuestions,
  durationMinutes,
  mcqQuestions,
  qaQuestions,
  sections,
  subject,
  testTitle,
}: {
  assignedBatch: string;
  codingQuestions: CodingQuestionDraft[];
  durationMinutes: number;
  mcqQuestions: MCQQuestionDraft[];
  qaQuestions: QAQuestionDraft[];
  sections: TestSectionDraft[];
  subject: string;
  testTitle: string;
}): TestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!testTitle.trim()) {
    errors.push("Test title is required.");
  }

  if (!assignedBatch.trim()) {
    errors.push("Batch is required.");
  }

  if (!subject.trim()) {
    errors.push("Subject is required.");
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    errors.push("Duration is required and must be greater than 0.");
  }

  if (!sections.length) {
    errors.push("At least one section is required.");
  }

  sections.forEach((section) => {
    if (section.type === "MCQ") {
      addSectionValidation({
        errors,
        label: "MCQ",
        questions: mcqQuestions,
        warnings,
        getIssues: getMcqQuestionIssues,
      });
    }

    if (section.type === "Question & Answer") {
      addSectionValidation({
        errors,
        label: "Q&A",
        questions: qaQuestions,
        warnings,
        getIssues: getQaQuestionIssues,
      });
    }

    if (section.type === "Coding") {
      addSectionValidation({
        errors,
        label: "Coding",
        questions: codingQuestions,
        warnings,
        getIssues: getCodingQuestionIssues,
      });
    }
  });

  return {
    errors,
    isValid: errors.length === 0 && warnings.length === 0,
    warnings,
  };
}

function buildCreateTestPayload({
  assignedBatch,
  codingQuestions,
  description,
  durationMinutes,
  endDateTime,
  mcqQuestions,
  qaQuestions,
  sections,
  startDateTime,
  subject,
  testTitle,
  testType,
  totalMarks,
}: {
  assignedBatch: string;
  codingQuestions: CodingQuestionDraft[];
  description: string;
  durationMinutes: number;
  endDateTime: string;
  mcqQuestions: MCQQuestionDraft[];
  qaQuestions: QAQuestionDraft[];
  sections: TestSectionDraft[];
  startDateTime: string;
  subject: string;
  testTitle: string;
  testType: TestType;
  totalMarks: number;
}): LecturerCreateTestPayload {
  return {
    batchId: toBackendId(assignedBatch),
    description,
    durationMinutes,
    endTime: endDateTime,
    sections: sections.map((section) => mapSectionPayload(section, { codingQuestions, mcqQuestions, qaQuestions })),
    startTime: startDateTime,
    subjectId: toBackendId(subject),
    testType: mapTestType(testType),
    title: testTitle,
    totalMarks,
  };
}

function mapSectionPayload(
  section: TestSectionDraft,
  questionState: {
    codingQuestions: CodingQuestionDraft[];
    mcqQuestions: MCQQuestionDraft[];
    qaQuestions: QAQuestionDraft[];
  },
): LecturerCreateTestPayload["sections"][number] {
  if (section.type === "MCQ") {
    return {
      marks: getMcqMarks(questionState.mcqQuestions),
      questions: questionState.mcqQuestions.map((question) => ({
        explanation: question.explanation,
        marks: question.marks,
        options: question.options.map((option, index) => ({
          isCorrect: question.correctOptionIndex === index,
          optionText: option,
        })),
        questionText: question.question,
      })),
      sectionType: "MCQ",
    };
  }

  if (section.type === "Question & Answer") {
    return {
      marks: getQaMarks(questionState.qaQuestions),
      questions: questionState.qaQuestions.map((question) => ({
        difficulty: mapDifficulty(question.difficulty),
        expectedAnswer: question.expectedAnswer,
        keywords: splitKeywords(question.keywords),
        marks: question.marks,
        questionText: question.question,
      })),
      sectionType: "QA",
    };
  }

  return {
    marks: getCodingMarks(questionState.codingQuestions),
    questions: questionState.codingQuestions.map((question) => ({
      allowedLanguages: question.allowedLanguages,
      constraints: question.constraints,
      difficulty: mapDifficulty(question.difficulty),
      hiddenTestCases: question.hiddenTestCasesCount,
      inputFormat: question.inputFormat,
      marks: question.marks,
      outputFormat: question.outputFormat,
      problemStatement: question.problemStatement,
      sampleInput: question.sampleInput,
      sampleOutput: question.sampleOutput,
      starterCode: question.starterCode,
      title: question.title,
    })),
    sectionType: "CODING",
  };
}

function mapTestType(testType: TestType): LecturerCreateTestPayload["testType"] {
  if (testType === "Monthly Test") {
    return "MONTHLY";
  }

  if (testType === "Final Test") {
    return "FINAL";
  }

  return "WEEKLY";
}

function mapDifficulty(difficulty: CodingQuestionDifficulty) {
  return difficulty.toUpperCase() as "EASY" | "HARD" | "MEDIUM";
}

function splitKeywords(keywords: string) {
  return keywords
    .split(/[\n,]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function toBackendId(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function addSectionValidation<Question>({
  errors,
  getIssues,
  label,
  questions,
  warnings,
}: {
  errors: string[];
  getIssues: (question: Question) => string[];
  label: string;
  questions: Question[];
  warnings: string[];
}) {
  if (!questions.length) {
    errors.push(`${label} section must have at least one valid question.`);
    return;
  }

  const validQuestionCount = questions.filter((question) => getIssues(question).length === 0).length;
  if (validQuestionCount === 0) {
    errors.push(`${label} section must have at least one valid question.`);
  }

  questions.forEach((question, index) => {
    const issues = getIssues(question);
    if (issues.length) {
      warnings.push(`${label} Q${index + 1}: ${issues.join(", ")}.`);
    }
  });
}

function getMcqQuestionIssues(question: MCQQuestionDraft) {
  const issues: string[] = [];

  if (!question.question.trim()) {
    issues.push("question required");
  }

  if (question.options.length !== 4 || question.options.some((option) => !option.trim())) {
    issues.push("4 options required");
  }

  if (
    !Number.isInteger(question.correctOptionIndex) ||
    question.correctOptionIndex < 0 ||
    question.correctOptionIndex >= question.options.length
  ) {
    issues.push("correct answer required");
  }

  if (!Number.isFinite(question.marks) || question.marks <= 0) {
    issues.push("marks required");
  }

  return issues;
}

function getQaQuestionIssues(question: QAQuestionDraft) {
  const issues: string[] = [];

  if (!question.question.trim()) {
    issues.push("question required");
  }

  if (!question.expectedAnswer.trim()) {
    issues.push("expected answer required");
  }

  if (!Number.isFinite(question.marks) || question.marks <= 0) {
    issues.push("marks required");
  }

  return issues;
}

function getCodingQuestionIssues(question: CodingQuestionDraft) {
  const issues: string[] = [];

  if (!question.title.trim()) {
    issues.push("title required");
  }

  if (!question.problemStatement.trim()) {
    issues.push("statement required");
  }

  if (!question.sampleInput.trim()) {
    issues.push("sample input required");
  }

  if (!question.sampleOutput.trim()) {
    issues.push("sample output required");
  }

  if (!Number.isFinite(question.marks) || question.marks <= 0) {
    issues.push("marks required");
  }

  return issues;
}

function getCodingMarks(codingQuestions: CodingQuestionDraft[]) {
  return codingQuestions.reduce((total, question) => total + Number(question.marks || 0), 0);
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getMcqMarks(mcqQuestions: MCQQuestionDraft[]) {
  return mcqQuestions.reduce((total, question) => total + Number(question.marks || 0), 0);
}

function getQaMarks(qaQuestions: QAQuestionDraft[]) {
  return qaQuestions.reduce((total, question) => total + Number(question.marks || 0), 0);
}

function getIncompleteMcqQuestions(mcqQuestions: MCQQuestionDraft[]) {
  return mcqQuestions.reduce<number[]>((incompleteQuestionNumbers, question, index) => {
    const hasQuestionText = question.question.trim().length > 0;
    const hasFourOptions = question.options.length === 4 && question.options.every((option) => option.trim().length > 0);
    const hasValidAnswer = question.correctOptionIndex >= 0 && question.correctOptionIndex < question.options.length;
    const hasMarks = Number(question.marks) > 0;

    if (!hasQuestionText || !hasFourOptions || !hasValidAnswer || !hasMarks) {
      incompleteQuestionNumbers.push(index + 1);
    }

    return incompleteQuestionNumbers;
  }, []);
}

function getIncompleteQaQuestions(qaQuestions: QAQuestionDraft[]) {
  return qaQuestions.reduce<number[]>((incompleteQuestionNumbers, question, index) => {
    const hasQuestionText = question.question.trim().length > 0;
    const hasExpectedAnswer = question.expectedAnswer.trim().length > 0;
    const hasMarks = Number(question.marks) > 0;

    if (!hasQuestionText || !hasExpectedAnswer || !hasMarks) {
      incompleteQuestionNumbers.push(index + 1);
    }

    return incompleteQuestionNumbers;
  }, []);
}

function getSectionQuestionCount(
  section: TestSectionDraft,
  codingQuestions: CodingQuestionDraft[],
  mcqQuestions: MCQQuestionDraft[],
  qaQuestions: QAQuestionDraft[],
) {
  if (section.type === "Coding") {
    return codingQuestions.length;
  }

  if (section.type === "MCQ") {
    return mcqQuestions.length;
  }

  if (section.type === "Question & Answer") {
    return qaQuestions.length;
  }

  return section.questionCount;
}

function getSectionMarks(
  section: TestSectionDraft,
  codingQuestions: CodingQuestionDraft[],
  mcqQuestions: MCQQuestionDraft[],
  qaQuestions: QAQuestionDraft[],
) {
  if (section.type === "Coding") {
    return getCodingMarks(codingQuestions);
  }

  if (section.type === "MCQ") {
    return getMcqMarks(mcqQuestions);
  }

  if (section.type === "Question & Answer") {
    return getQaMarks(qaQuestions);
  }

  return section.marks;
}
