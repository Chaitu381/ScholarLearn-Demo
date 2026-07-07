import { ClipboardList } from "lucide-react";
import { lecturerTests } from "../data/lecturerDemoData";
import { LecturerBackButton, LecturerBadge, LecturerCard, LecturerPage, LecturerPageTitle } from "../components/LecturerPrimitives";

export function LecturerTestDetail({ testId }: { testId?: string }) {
  const test = lecturerTests.find((item) => item.testId === testId) ?? lecturerTests[0];

  return (
    <LecturerPage>
      <LecturerBackButton />
      <LecturerPageTitle title={test.title} description="Read-only test detail summary for the selected lecturer assessment." />
      <LecturerCard title="Test Summary" description={`${test.category} · ${test.date}`} icon={ClipboardList}>
        <div className="flex flex-wrap gap-3">
          <LecturerBadge label={test.status} tone={test.status === "Published" ? "primary" : "yellow"} />
          <LecturerBadge label={`Batch ${test.batchId}`} tone="blue" />
          <LecturerBadge label="Section details preview" tone="orange" />
        </div>
      </LecturerCard>
    </LecturerPage>
  );
}
