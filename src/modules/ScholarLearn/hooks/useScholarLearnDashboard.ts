import { useEffect, useState } from "react";
import { getScholarLearnDashboardData } from "../services/scholarLearnApi";
import type { ScholarLearnDashboardData } from "../types/scholarLearn.types";

export function useScholarLearnDashboard() {
  const [data, setData] = useState<ScholarLearnDashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getScholarLearnDashboardData()
      .then((dashboardData) => {
        if (active) {
          setData(dashboardData);
          setError("");
        }
      })
      .catch((dashboardError) => {
        if (active) {
          setError(dashboardError instanceof Error ? dashboardError.message : "Unable to load ScholarLearn dashboard.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, error, loading };
}
