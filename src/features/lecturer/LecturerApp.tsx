import { LecturerShell } from "./components/LecturerShell";
import { LecturerAssignmentCreate } from "./pages/LecturerAssignmentCreate";
import { LecturerAssignments } from "./pages/LecturerAssignments";
import { LecturerBatchDetail } from "./pages/LecturerBatchDetail";
import { LecturerBatches } from "./pages/LecturerBatches";
import { LecturerDashboard } from "./pages/LecturerDashboard";
import { LecturerProfile } from "./pages/LecturerProfile";
import { LecturerSettings } from "./pages/LecturerSettings";
import { LecturerStudentProfile } from "./pages/LecturerStudentProfile";
import { LecturerTestCreate } from "./pages/LecturerTestCreate";
import { LecturerTestDetail } from "./pages/LecturerTestDetail";
import { LecturerTests } from "./pages/LecturerTests";
import { resolveLecturerRoute } from "./routes/lecturerRoutes";
import { getLecturerRouteFeature, useInstituteFeatureAccess } from "../../shared/feature-flags/InstituteFeatureAccess";
import { LockedFeatureMessage } from "../../shared/feature-flags/LockedFeatureMessage";

type LecturerAppProps = {
  pathname: string;
};

export function LecturerApp({ pathname }: LecturerAppProps) {
  const route = resolveLecturerRoute(pathname);
  const { isFeatureEnabled } = useInstituteFeatureAccess();
  const routeFeature = getLecturerRouteFeature(route.key);
  const routeEnabled = !routeFeature || isFeatureEnabled(routeFeature);

  return (
    <LecturerShell activeRouteKey={route.key}>
      {!routeEnabled && routeFeature ? (
        <LockedFeatureMessage featureName={routeFeature} roleLabel="this institute" />
      ) : (
        <>
          {route.key === "dashboard" ? <LecturerDashboard /> : null}
          {route.key === "profile" ? <LecturerProfile /> : null}
          {route.key === "settings" ? <LecturerSettings /> : null}
          {route.key === "batches" ? <LecturerBatches /> : null}
          {route.key === "batch-detail" ? <LecturerBatchDetail batchId={route.params.batchId} /> : null}
          {route.key === "student-profile" ? (
            <LecturerStudentProfile batchId={route.params.batchId} studentId={route.params.studentId} />
          ) : null}
          {route.key === "tests" ? <LecturerTests /> : null}
          {route.key === "create-test" ? <LecturerTestCreate /> : null}
          {route.key === "test-detail" ? <LecturerTestDetail testId={route.params.testId} /> : null}
          {route.key === "assignments" ? <LecturerAssignments /> : null}
          {route.key === "create-assignment" ? <LecturerAssignmentCreate /> : null}
        </>
      )}
    </LecturerShell>
  );
}
