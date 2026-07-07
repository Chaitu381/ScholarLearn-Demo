import type { CodeConnectFriendRequest } from "../types/codeconnect.types";

export const codeconnectFriendRequestStorageKey = "codeconnect_friend_requests";

export const codeconnectDummyFriendRequests: CodeConnectFriendRequest[] = [
  {
    id: "friend-request-ayush",
    senderId: "student-ayush",
    senderName: "Ayush Sharma",
    message: "Ayush wants to connect for mock test practice and shared coding sessions.",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "friend-request-meera",
    senderId: "student-meera",
    senderName: "Meera Iyer",
    message: "Meera sent you a CodeConnect friend request.",
    createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "friend-request-kabir",
    senderId: "student-kabir",
    senderName: "Kabir Khan",
    message: "Kabir wants to compare reasoning test progress with you.",
    createdAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "friend-request-nisha",
    senderId: "student-nisha",
    senderName: "Nisha Rao",
    message: "Nisha's earlier CodeConnect request was accepted.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: "accepted",
  },
  {
    id: "friend-request-rohan",
    senderId: "student-rohan",
    senderName: "Rohan Das",
    message: "Rohan's earlier CodeConnect request was declined.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: "declined",
  },
];

export function readCodeConnectFriendRequests() {
  if (typeof window === "undefined") {
    return codeconnectDummyFriendRequests;
  }

  try {
    const storedValue = window.localStorage.getItem(
      codeconnectFriendRequestStorageKey,
    );

    if (!storedValue) {
      writeCodeConnectFriendRequests(codeconnectDummyFriendRequests);
      return codeconnectDummyFriendRequests;
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? mergeWithDummyRequests(parsedValue.filter(isCodeConnectFriendRequest))
      : codeconnectDummyFriendRequests;
  } catch {
    return codeconnectDummyFriendRequests;
  }
}

export function writeCodeConnectFriendRequests(
  requests: CodeConnectFriendRequest[],
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      codeconnectFriendRequestStorageKey,
      JSON.stringify(requests),
    );
  } catch {
    // Local dummy persistence should never break the notification UI.
  }
}

function mergeWithDummyRequests(storedRequests: CodeConnectFriendRequest[]) {
  const storedById = new Map(
    storedRequests.map((request) => [request.id, request]),
  );
  const mergedDummyRequests = codeconnectDummyFriendRequests.map(
    (request) => storedById.get(request.id) ?? request,
  );
  const customRequests = storedRequests.filter(
    (request) =>
      !codeconnectDummyFriendRequests.some(
        (dummyRequest) => dummyRequest.id === request.id,
      ),
  );

  return [...mergedDummyRequests, ...customRequests];
}

function isCodeConnectFriendRequest(
  value: unknown,
): value is CodeConnectFriendRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request = value as Partial<CodeConnectFriendRequest>;

  return (
    typeof request.id === "string" &&
    typeof request.senderId === "string" &&
    typeof request.senderName === "string" &&
    typeof request.message === "string" &&
    typeof request.createdAt === "string" &&
    (request.status === "pending" ||
      request.status === "accepted" ||
      request.status === "declined")
  );
}
