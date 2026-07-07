import type { ReactNode } from "react";
import type { CodingExample, CodingProblem, CodingTestCase, Difficulty } from "../../../types/codeconnect.types";

type ProblemStatementProps = {
  problem: CodingProblem;
};

export function ProblemStatement({ problem }: ProblemStatementProps) {
  const examples = getExamples(problem);
  const testCases = getTestCases(problem);

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[12px] font-extrabold uppercase text-text-muted">{problem.topic}</p>
        <h2 className="mt-1 text-[24px] font-extrabold leading-8 text-text-primary">{problem.title}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-soft px-3 py-1 text-[12px] font-extrabold text-blue">
            Problem #{problem.problemNumber ?? problem.id}
          </span>
          <span className={`rounded-full px-3 py-1 text-[12px] font-extrabold ${difficultyClasses[problem.difficulty]}`}>
            {formatDifficulty(problem.difficulty)}
          </span>
          <span className="rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-secondary">
            Acceptance {problem.accuracy}%
          </span>
        </div>
        <p className="mt-4 text-[14px] font-bold leading-7 text-text-secondary">{problem.description}</p>
        {problem.statement ? <p className="mt-3 text-[14px] leading-7 text-text-secondary">{problem.statement}</p> : null}
      </section>

      <InfoBlock title="Input Format">
        <p>{problem.inputFormat ?? problem.sampleInput}</p>
      </InfoBlock>

      <InfoBlock title="Output Format">
        <p>{problem.outputFormat ?? problem.sampleOutput}</p>
      </InfoBlock>

      <InfoBlock title="Constraints">
        <ul className="space-y-2">
          {problem.constraints.map((constraint) => (
            <li key={constraint} className="rounded-xl bg-surface px-3 py-2 font-mono text-[12px] text-text-primary">
              {constraint}
            </li>
          ))}
        </ul>
      </InfoBlock>

      <InfoBlock title="Examples">
        <div className="space-y-3">
          {examples.map((example, index) => (
            <article key={`${example.input}-${index}`} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[12px] font-extrabold uppercase text-text-muted">Example {index + 1}</p>
              <div className="mt-3 space-y-2 font-mono text-[12px] leading-6 text-text-primary">
                <p>
                  <span className="font-sans font-extrabold text-text-secondary">Input: </span>
                  {example.input}
                </p>
                <p>
                  <span className="font-sans font-extrabold text-text-secondary">Output: </span>
                  {example.output}
                </p>
              </div>
              {example.explanation ? (
                <p className="mt-3 text-[13px] leading-6 text-text-secondary">{example.explanation}</p>
              ) : null}
            </article>
          ))}
        </div>
      </InfoBlock>

      <InfoBlock title="Test Cases">
        <div className="space-y-3">
          {testCases.map((testCase, index) => (
            <article key={testCase.id} className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-[12px] font-extrabold uppercase text-text-muted">Case {index + 1}</p>
              <p className="mt-2 text-[13px] font-extrabold text-text-primary">{testCase.description}</p>
              <div className="mt-3 space-y-2 font-mono text-[12px] leading-6 text-text-primary">
                <p>
                  <span className="font-sans font-extrabold text-text-secondary">Input: </span>
                  {testCase.input}
                </p>
                <p>
                  <span className="font-sans font-extrabold text-text-secondary">Expected Output: </span>
                  {testCase.expectedOutput}
                </p>
              </div>
            </article>
          ))}
        </div>
      </InfoBlock>
    </div>
  );
}

const difficultyClasses: Record<Difficulty, string> = {
  easy: "bg-primary-soft text-primary-dark",
  medium: "bg-orange-soft text-orange",
  hard: "bg-red-soft text-red",
};

function InfoBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-2xl border border-border bg-surface-soft p-4">
      <h3 className="text-[15px] font-extrabold text-text-primary">{title}</h3>
      <div className="mt-3 text-[13px] leading-6 text-text-secondary">{children}</div>
    </section>
  );
}

function getExamples(problem: CodingProblem): CodingExample[] {
  if (problem.examples?.length) {
    return problem.examples;
  }

  return [
    {
      input: problem.sampleInput,
      output: problem.sampleOutput,
    },
  ];
}

function getTestCases(problem: CodingProblem): CodingTestCase[] {
  if (problem.testCases?.length) {
    return problem.testCases;
  }

  return [
    {
      id: `${problem.id}-sample`,
      description: "Sample case",
      input: problem.sampleInput,
      expectedOutput: problem.sampleOutput,
    },
  ];
}

function formatDifficulty(difficulty: Difficulty) {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
}
