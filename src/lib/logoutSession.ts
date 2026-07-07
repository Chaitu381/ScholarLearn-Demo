import { logout } from "./authSession";

const scholarLearnLogoutStorageKeys = [
  "activeTestAttempt",
  "activeTestId",
  "attemptId",
  "test answers",
  "testAnswers",
  "coding answers",
  "codingAnswers",
];

const scholarLearnLogoutStoragePrefixes = [
  "scholarlearn-student-test-attempt",
];

export function logoutScholarLearnSession() {
  clearScholarLearnTestStorage();
  logout();
}

function clearScholarLearnTestStorage() {
  if (typeof window === "undefined") {
    return;
  }

  removeStorageItems(window.localStorage);
  removeStorageItems(window.sessionStorage);
}

function removeStorageItems(storage: Storage) {
  scholarLearnLogoutStorageKeys.forEach((key) => storage.removeItem(key));

  Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => Boolean(key))
    .filter((key) => scholarLearnLogoutStoragePrefixes.some((prefix) => key.startsWith(prefix)))
    .forEach((key) => storage.removeItem(key));
}
