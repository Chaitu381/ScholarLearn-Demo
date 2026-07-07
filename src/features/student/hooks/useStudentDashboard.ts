import { useEffect, useState } from "react";
import { studentMockData } from "../data/studentMockData";
import { getStudentDashboardData } from "../services/studentApi";

export function useStudentDashboard() {
  const [dashboardData, setDashboardData] = useState(studentMockData);

  useEffect(() => {
    let active = true;

    getStudentDashboardData()
      .then((data) => {
        if (active) {
          setDashboardData(data);
        }
      })
      .catch(() => {
        if (active) {
          setDashboardData(studentMockData);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return dashboardData;
}
