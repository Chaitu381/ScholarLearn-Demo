import type { CodingProblem, CodingTestCase } from "../../../types/codeconnect.types";

type TestCasesProps = {
  problem: CodingProblem;
};

export function TestCases({ problem }: TestCasesProps) {
  const testCases = getTestCases(problem);

  return (
    <div className="space-y-2">
      {testCases.map((testCase, index) => (
        <article key={testCase.id} className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[14px] font-extrabold text-text-primary">Test Case {index + 1}</p>
              <p className="mt-1 text-[12px] font-bold text-text-secondary">{testCase.description}</p>
            </div>
            <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
              Expected: {testCase.expectedOutput}
            </span>
          </div>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-soft p-3 text-[12px] leading-5 text-text-primary">
            {testCase.input}
          </pre>
        </article>
      ))}
    </div>
  );
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
