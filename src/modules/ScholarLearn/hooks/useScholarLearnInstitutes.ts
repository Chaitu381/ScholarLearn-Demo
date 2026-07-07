import { useEffect, useState } from "react";
import {
  getScholarLearnInstitutes,
  getScholarLearnSubscriptionPlans,
  updateScholarLearnInstituteAccess,
  updateScholarLearnInstitutePlan,
  updateScholarLearnInstituteSubscription,
} from "../services/scholarLearnApi";
import type {
  ScholarLearnInstitute,
  ScholarLearnInstituteSubscriptionUpdate,
  ScholarLearnSubscriptionPlan,
} from "../types/scholarLearn.types";

export function useScholarLearnInstitutes() {
  const [error, setError] = useState("");
  const [institutes, setInstitutes] = useState<ScholarLearnInstitute[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState<ScholarLearnSubscriptionPlan[]>([]);

  useEffect(() => {
    let active = true;

    Promise.all([getScholarLearnInstitutes(), getScholarLearnSubscriptionPlans()])
      .then(([instituteData, planData]) => {
        if (active) {
          setInstitutes(instituteData);
          setSubscriptionPlans(planData);
          setError("");
        }
      })
      .catch((instituteError) => {
        if (active) {
          setError(instituteError instanceof Error ? instituteError.message : "Unable to load institutes.");
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

  const updateAccess = async (instituteId: string, disabled: boolean) => {
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) =>
        institute.id === instituteId
          ? {
              ...institute,
              disabled,
              status: disabled ? "Disabled" : institute.activeRemainingDays <= 0 ? "Expired" : "Active",
            }
          : institute,
      ),
    );

    const updatedInstitute = await updateScholarLearnInstituteAccess(instituteId, disabled);
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) => (institute.id === instituteId ? updatedInstitute : institute)),
    );
  };

  const updatePlan = async (instituteId: string, plan: ScholarLearnInstitute["plan"]) => {
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) => (institute.id === instituteId ? { ...institute, plan } : institute)),
    );

    const updatedInstitute = await updateScholarLearnInstitutePlan(instituteId, plan);
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) => (institute.id === instituteId ? updatedInstitute : institute)),
    );
  };

  const updateSubscription = async (instituteId: string, payload: ScholarLearnInstituteSubscriptionUpdate) => {
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) =>
        institute.id === instituteId
          ? {
              ...institute,
              ...payload,
              activeRemainingDays: calculateRemainingDays(payload.expiryDate),
              status: payload.disabled
                ? "Disabled"
                : calculateRemainingDays(payload.expiryDate) <= 0
                  ? "Expired"
                  : payload.plan === "Trial"
                    ? "Trial"
                    : "Active",
            }
          : institute,
      ),
    );

    const updatedInstitute = await updateScholarLearnInstituteSubscription(instituteId, payload);
    setInstitutes((currentInstitutes) =>
      currentInstitutes.map((institute) => (institute.id === instituteId ? updatedInstitute : institute)),
    );
  };

  return { error, institutes, loading, subscriptionPlans, updateAccess, updatePlan, updateSubscription };
}

function calculateRemainingDays(expiryDate: string) {
  const expiryTime = new Date(`${expiryDate}T23:59:59`).getTime();
  if (Number.isNaN(expiryTime)) {
    return 0;
  }

  return Math.max(0, Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24)));
}
