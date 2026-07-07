export type AssignmentSubmissionPayload = {
  assignmentId: string;
  file: File;
};

export type AssignmentSubmissionResult = {
  assignmentId: string;
  fileName: string;
  status: "submitted";
  submittedAt: string;
  submissionId: string;
};

export async function submitAssignmentFile({
  assignmentId,
  file,
}: AssignmentSubmissionPayload): Promise<AssignmentSubmissionResult> {
  // TODO: Replace this placeholder with the backend assignment submission API once the endpoint contract is available.
  return Promise.resolve({
    assignmentId,
    fileName: file.name,
    status: "submitted",
    submittedAt: new Date().toISOString(),
    submissionId: `local-${assignmentId}-${Date.now()}`,
  });
}
