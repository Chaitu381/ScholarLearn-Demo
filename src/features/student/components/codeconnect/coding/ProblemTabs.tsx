import { ChevronDown, MessageCircle, Radio, Send, UserPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  CodingProblem,
  CodingSubmission,
} from "../../../types/codeconnect.types";
import { ProblemStatement } from "./ProblemStatement";

type ProblemTabsProps = {
  problem: CodingProblem;
};

type ProblemTab =
  | "statement"
  | "submissions"
  | "solution"
  | "invite-friends"
  | "chats";

type Friend = {
  name: string;
  status: "online" | "offline";
};

type ChatMessage = {
  author: string;
  message: string;
  time: string;
};
const dummyChatMessages: ChatMessage[] = [
  {
    author: "Ayush",
    message: "Can you check the edge case for empty string?",
    time: "9:16 AM",
  },
  {
    author: "Ayush",
    message: "I think the sliding window condition is breaking.",
    time: "9:17 AM",
  },
  {
    author: "Aniket",
    message: "Try using a HashMap to store the latest index.",
    time: "9:18 AM",
  },
  {
    author: "You",
    message: "Yes, I am updating the left pointer now.",
    time: "Now",
  },
];

const tabs: Array<{ id: ProblemTab; label: string }> = [
  { id: "statement", label: "Statement" },
  { id: "submissions", label: "Submissions" },
  { id: "solution", label: "Solution" },
  { id: "invite-friends", label: "Invite Friends" },
  { id: "chats", label: "Chats" },
];

const friends: Friend[] = [
  { name: "Ayush", status: "online" },
  { name: "Aniket", status: "online" },
  { name: "Durshant", status: "offline" },
];

function getChatStorageKey(problemId: string) {
  return `codeconnect-chat:${problemId}`;
}

function readStoredChatMessages(problemId: string): ChatMessage[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const savedMessages = window.localStorage.getItem(
      getChatStorageKey(problemId),
    );

    if (!savedMessages) {
      return [];
    }

    const parsedMessages = JSON.parse(savedMessages);

    if (!Array.isArray(parsedMessages)) {
      return [];
    }

    return parsedMessages.filter(
      (message): message is ChatMessage =>
        typeof message?.author === "string" &&
        typeof message?.message === "string" &&
        typeof message?.time === "string",
    );
  } catch {
    return [];
  }
}

function writeStoredChatMessages(problemId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    getChatStorageKey(problemId),
    JSON.stringify(messages),
  );
}

function removeStoredChatMessages(problemId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getChatStorageKey(problemId));
}

export function ProblemTabs({ problem }: ProblemTabsProps) {
  const [activeTab, setActiveTab] = useState<ProblemTab>("statement");
  const [connectedFriends, setConnectedFriends] = useState<string[]>(["Ayush","Aniket",]);
  const [hasSyncedCode, setHasSyncedCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const storedMessages = readStoredChatMessages(problem.id);
    return storedMessages.length > 0 ? storedMessages : dummyChatMessages;
  });
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    const storedMessages = readStoredChatMessages(problem.id);
    setChatMessages(storedMessages.length > 0 ? storedMessages : dummyChatMessages);
    setDraftMessage("");
  }, [problem.id]);

  useEffect(() => {
    if (connectedFriends.length === 0) {
      removeStoredChatMessages(problem.id);

      setChatMessages((currentMessages) =>
        currentMessages.length > 0 ? [] : currentMessages,
      );

      return;
    }

    writeStoredChatMessages(problem.id, chatMessages);
  }, [chatMessages, connectedFriends.length, problem.id]);

  const handleConnect = (friend: string) => {
    setConnectedFriends((currentFriends) => {
      if (currentFriends.includes(friend)) {
        return currentFriends.filter(
          (currentFriend) => currentFriend !== friend,
        );
      }

      return Array.from(new Set([...currentFriends, friend]));
    });

    setIsSyncing(true);
    setHasSyncedCode(false);

    window.setTimeout(() => {
      setIsSyncing(false);
      setHasSyncedCode(true);
    }, 900);
  };

  const handleSendMessage = () => {
    const message = draftMessage.trim();

    if (!message) {
      return;
    }

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        author: "You",
        message,
        time: "Now",
      },
    ]);

    setDraftMessage("");
  };

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
      <div className="shrink-0 bg-surface px-4 pt-4">
        <div className="scrollbar-none flex max-w-full items-center overflow-x-auto rounded-2xl bg-surface-soft p-1">
          <div className="flex shrink-0 items-center gap-2">
            {tabs
              .filter((tab) =>
                ["statement", "submissions", "solution"].includes(tab.id),
              )
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab === tab.id
                      ? "h-9 shrink-0 rounded-xl bg-surface px-4 text-[13px] font-extrabold text-text-primary shadow-card"
                      : "h-9 shrink-0 rounded-xl px-4 text-[13px] font-extrabold text-text-secondary transition hover:text-text-primary"
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {tabs
              .filter((tab) => ["invite-friends", "chats"].includes(tab.id))
              .map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={
                    activeTab === tab.id
                      ? "h-9 shrink-0 rounded-xl bg-surface px-4 text-[13px] font-extrabold text-text-primary shadow-card"
                      : "h-9 shrink-0 rounded-xl px-4 text-[13px] font-extrabold text-text-secondary transition hover:text-text-primary"
                  }
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-6 pl-8 sm:px-5 sm:pb-6 sm:pt-6 sm:pl-10">
        {activeTab === "statement" ? (
          <ProblemStatement problem={problem} />
        ) : null}

        {activeTab === "submissions" ? (
          <SubmissionsTab problem={problem} />
        ) : null}

        {activeTab === "solution" ? <SolutionTab problem={problem} /> : null}

        {activeTab === "invite-friends" ? (
          <InviteFriendsTab
            problem={problem}
            connectedFriends={connectedFriends}
            hasSyncedCode={hasSyncedCode}
            isSyncing={isSyncing}
            onConnect={handleConnect}
          />
        ) : null}

        {activeTab === "chats" ? (
          <ChatsTab
            chatMessages={chatMessages}
            connectedFriends={connectedFriends}
            draftMessage={draftMessage}
            setDraftMessage={setDraftMessage}
            onSendMessage={handleSendMessage}
          />
        ) : null}
      </div>
    </section>
  );
}

function SubmissionsTab({ problem }: { problem: CodingProblem }) {
  const submissions = problem.submissions?.length
    ? problem.submissions
    : getFallbackSubmissions(problem);

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <article
          key={submission.id}
          className="rounded-2xl border border-border bg-surface-soft p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[15px] font-extrabold text-text-primary">
                {submission.status}
              </p>

              <p className="mt-1 text-[13px] font-bold text-text-secondary">
                {languageLabel(submission.language)} - {submission.submittedAt}
              </p>
            </div>

            <span
              className={
                submission.status === "Accepted"
                  ? "rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark"
                  : "rounded-full bg-orange-soft px-3 py-1 text-[12px] font-extrabold text-orange"
              }
            >
              {submission.runtime} / {submission.memory}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function SolutionTab({ problem }: { problem: CodingProblem }) {
  const hints = problem.hints?.length
    ? problem.hints
    : [
        "Identify the core data structure.",
        "Start with a simple brute-force idea.",
        "Optimize by removing repeated work.",
      ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <h3 className="text-[16px] font-extrabold text-text-primary">
          Approach
        </h3>

        <p className="mt-2 text-[14px] leading-7 text-text-secondary">
          {problem.solutionApproach ??
            "Break the problem into smaller states, choose the right data structure, and keep the implementation direct."}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <h3 className="text-[16px] font-extrabold text-text-primary">
          Complexity
        </h3>

        <p className="mt-2 text-[14px] leading-7 text-text-secondary">
          {problem.complexity ??
            "Analyze the final approach after implementation."}
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <h3 className="text-[16px] font-extrabold text-text-primary">Hints</h3>

        <div className="mt-3 space-y-2">
          {hints.map((hint) => (
            <p
              key={hint}
              className="rounded-xl bg-surface px-3 py-2 text-[13px] font-bold leading-6 text-text-secondary"
            >
              {hint}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}

function InviteFriendsTab({
  problem,
  connectedFriends,
  hasSyncedCode,
  isSyncing,
  onConnect,
}: {
  problem: CodingProblem;
  connectedFriends: string[];
  hasSyncedCode: boolean;
  isSyncing: boolean;
  onConnect: (friend: string) => void;
}) {
  const [friendSearch, setFriendSearch] = useState("");
  const isConnected = connectedFriends.length > 0;
  const connectedFriendsLabel = Array.from(new Set(connectedFriends)).join(", ");

  const searchedFriends = friends.filter((friend) => {
    const query = friendSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      friend.name.toLowerCase().includes(query) ||
      getFriendId(friend.name).toLowerCase().includes(query) ||
      getFriendEmail(friend.name).toLowerCase().includes(query)
    );
  });

  const onlineSearchedFriends = searchedFriends.filter(
    (friend) => friend.status === "online",
  );

  const handleInviteFriend = () => {
    const firstAvailableOnlineFriend = onlineSearchedFriends.find(
      (friend) => !connectedFriends.includes(friend.name),
    );

    if (!firstAvailableOnlineFriend) {
      return;
    }

    onConnect(firstAvailableOnlineFriend.name);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <input
                className="h-11 w-full rounded-2xl border border-border bg-surface px-4 pr-11 text-[14px] font-bold text-text-primary outline-none transition placeholder:text-text-muted focus:border-primary"
                value={friendSearch}
                onChange={(event) => setFriendSearch(event.target.value)}
                placeholder="Search friend by ID, name, or email"
              />

              <UserPlus
                aria-hidden="true"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                size={17}
                strokeWidth={2.5}
              />
            </div>

            <button
              type="button"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-[14px] font-extrabold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-text-muted"
              onClick={handleInviteFriend}
              disabled={
                !onlineSearchedFriends.some(
                  (friend) => !connectedFriends.includes(friend.name),
                )
              }
            >
              <UserPlus aria-hidden="true" size={16} strokeWidth={2.5} />
              Invite
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-extrabold uppercase text-text-muted">
            Friend list
          </p>

          <div className="flex items-center gap-2">
            {friendSearch.trim() ? (
              <span className="rounded-full bg-surface px-3 py-1 text-[12px] font-extrabold text-text-secondary">
                {searchedFriends.length} found
              </span>
            ) : null}

            <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
              {friends.filter((friend) => friend.status === "online").length}{" "}
              online
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {searchedFriends.map((friend) => {
            const isFriendConnected = connectedFriends.includes(friend.name);

            return (
              <div
                key={friend.name}
                className="flex items-center justify-between gap-3 rounded-2xl bg-surface p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-[12px] font-extrabold text-primary-dark">
                    {friend.name.slice(0, 1)}
                  </span>

                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-extrabold text-text-primary">
                      {friend.name}
                    </span>

                    <span className="block truncate text-[11px] font-bold text-text-muted">
                      {getFriendId(friend.name)} • {getFriendEmail(friend.name)}
                    </span>

                    <span className="mt-1 flex items-center gap-2 text-[12px] font-bold text-text-secondary">
                      <span
                        className={
                          friend.status === "online"
                            ? "h-2.5 w-2.5 rounded-full bg-primary"
                            : "h-2.5 w-2.5 rounded-full bg-border"
                        }
                      />
                      {friend.status === "online" ? "Online" : "Offline"}
                    </span>
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    friend.status === "offline"
                      ? "h-9 rounded-xl bg-surface-soft px-3 text-[12px] font-extrabold text-text-muted"
                      : isFriendConnected
                        ? "h-9 rounded-xl bg-primary-soft px-3 text-[12px] font-extrabold text-primary-dark transition hover:bg-surface-soft"
                        : "h-9 rounded-xl bg-primary px-3 text-[12px] font-extrabold text-white transition hover:bg-primary-dark"
                  }
                  onClick={() => onConnect(friend.name)}
                  disabled={friend.status === "offline"}
                >
                  {isFriendConnected ? "Connected" : "Connect"}
                </button>
              </div>
            );
          })}

          {searchedFriends.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-4 text-center">
              <p className="text-[13px] font-extrabold text-text-primary">
                No friends found
              </p>

              <p className="mt-1 text-[12px] font-bold text-text-secondary">
                Try searching by another ID, name, or email.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface-soft p-4">
        <div className="flex items-start gap-3">
          <span
            className={
              isConnected
                ? "mt-1 h-3 w-3 shrink-0 rounded-full bg-primary"
                : "mt-1 h-3 w-3 shrink-0 rounded-full bg-border"
            }
          />

          <div>
            <p className="text-[14px] font-extrabold text-text-primary">
              {isConnected
                ? `Live collaboration active with ${connectedFriendsLabel}`
                : "Shared session waiting"}
            </p>

            <p className="mt-1 text-[13px] leading-5 text-text-secondary">
              {isConnected
                ? `Shared problem: ${problem.title}`
                : "Connect with one or more friends to start a shared session."}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark">
            <Radio aria-hidden="true" size={14} strokeWidth={2.5} />
            {isSyncing
              ? "Syncing code..."
              : hasSyncedCode
                ? `Code synced with ${connectedFriendsLabel}`
                : `Waiting to sync with ${connectedFriendsLabel}`}
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ChatsTab({
  chatMessages,
  connectedFriends,
  draftMessage,
  setDraftMessage,
  onSendMessage,
}: {
  chatMessages: ChatMessage[];
  connectedFriends: string[];
  draftMessage: string;
  setDraftMessage: (message: string) => void;
  onSendMessage: () => void;
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement | null>(null);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);

  const hasConnectedFriends = connectedFriends.length > 0;
  const connectedLabel = hasConnectedFriends
    ? `${connectedFriends.length} connected`
    : "No active session";

  const scrollToLatest = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setShowJumpToLatest(false);
  };

  const handleScroll = () => {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setShowJumpToLatest(distanceFromBottom > 90);
  };

  useEffect(() => {
    const container = messagesScrollRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    if (distanceFromBottom <= 120) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      setShowJumpToLatest(false);
    } else {
      setShowJumpToLatest(true);
    }
  }, [chatMessages]);

  const handleSendAndScroll = () => {
    if (!draftMessage.trim()) {
      return;
    }

    onSendMessage();

    window.setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
      setShowJumpToLatest(false);
    }, 0);
  };

  return (
    <div className="flex min-h-full flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <div className="shrink-0 border-b border-border bg-surface px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                <MessageCircle aria-hidden="true" size={21} strokeWidth={2.5} />

                <span
                  className={
                    hasConnectedFriends
                      ? "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-primary"
                      : "absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-surface bg-border"
                  }
                />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-[17px] font-extrabold text-text-primary">
                  Problem Chat
                </h3>

                <p className="truncate text-[12px] font-bold text-text-secondary">
                  {hasConnectedFriends
                    ? `Live with ${connectedFriends.join(", ")}`
                    : "Connect friends to start chatting"}
                </p>
              </div>
            </div>

            <span
              className={
                hasConnectedFriends
                  ? "shrink-0 rounded-full bg-primary-soft px-3 py-1 text-[12px] font-extrabold text-primary-dark"
                  : "shrink-0 rounded-full bg-surface-soft px-3 py-1 text-[12px] font-extrabold text-text-muted"
              }
            >
              {connectedLabel}
            </span>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 bg-gradient-to-b from-primary-soft/60 to-surface-soft">
          <div
            ref={messagesScrollRef}
            onScroll={handleScroll}
            className="absolute inset-0 space-y-1 overflow-y-auto px-4 py-4"
          >
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center">
                <div className="max-w-[280px] rounded-3xl border border-border bg-surface/95 px-5 py-6 shadow-card">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary-dark">
                    <MessageCircle
                      aria-hidden="true"
                      size={22}
                      strokeWidth={2.5}
                    />
                  </span>

                  <p className="mt-3 text-[15px] font-extrabold text-text-primary">
                    No messages yet
                  </p>

                  <p className="mt-1 text-[12px] font-bold leading-5 text-text-secondary">
                    Send the first message to start the conversation.
                  </p>
                </div>
              </div>
            ) : null}

            {chatMessages.map((message, index) => {
              const isMine = message.author === "You";
              const previousMessage = chatMessages[index - 1];
              const nextMessage = chatMessages[index + 1];

              const isSameAuthorAsPrevious =
                previousMessage?.author === message.author;

              const isSameAuthorAsNext =
                nextMessage?.author === message.author;

              const showAuthor = !isMine && !isSameAuthorAsPrevious;
              const showTime = !isSameAuthorAsNext;

              return (
                <article
                  key={`${message.author}-${message.time}-${index}`}
                  className={
                    isMine
                      ? "ml-auto flex max-w-[82%] flex-col items-end"
                      : "mr-auto flex max-w-[82%] flex-col items-start"
                  }
                >
                  <div
                    className={
                      isMine
                        ? isSameAuthorAsPrevious
                          ? "rounded-2xl bg-primary px-4 py-2.5 text-white shadow-card"
                          : "rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-white shadow-card"
                        : isSameAuthorAsPrevious
                          ? "rounded-2xl border border-border bg-surface px-4 py-2.5 shadow-card"
                          : "rounded-2xl rounded-bl-md border border-border bg-surface px-4 py-2.5 shadow-card"
                    }
                  >
                    {showAuthor ? (
                      <p className="mb-1 text-[11px] font-extrabold uppercase tracking-wide text-primary-dark">
                        {message.author}
                      </p>
                    ) : null}

                    <p
                      className={
                        isMine
                          ? "whitespace-pre-wrap break-words text-[13px] font-bold leading-6 text-white"
                          : "whitespace-pre-wrap break-words text-[13px] font-bold leading-6 text-text-primary"
                      }
                    >
                      {message.message}
                    </p>
                  </div>

                  {showTime ? (
                    <span
                      className={
                        isMine
                          ? "mb-2 mt-1 pr-1 text-[10px] font-bold text-text-muted"
                          : "mb-2 mt-1 pl-1 text-[10px] font-bold text-text-muted"
                      }
                    >
                      {message.time}
                    </span>
                  ) : (
                    <span className="h-1" />
                  )}
                </article>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {showJumpToLatest ? (
            <button
              type="button"
              className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-primary text-white shadow-card transition hover:bg-primary-dark"
              onClick={scrollToLatest}
              aria-label="Jump to latest message"
            >
              <ChevronDown aria-hidden="true" size={20} strokeWidth={2.5} />
            </button>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-border bg-surface px-3 py-3">
          <div className="flex items-center gap-2 rounded-3xl border border-border bg-surface-soft p-2 shadow-card">
            <input
              className="h-12 min-w-0 flex-1 rounded-2xl border-0 bg-transparent px-4 text-[14px] font-bold text-text-primary outline-none placeholder:text-text-muted"
              value={draftMessage}
              onChange={(event) => setDraftMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleSendAndScroll();
                }
              }}
              placeholder="Type a message"
            />

            <button
              type="button"
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary text-white shadow-card transition hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:bg-surface disabled:text-text-muted disabled:shadow-none"
              onClick={handleSendAndScroll}
              disabled={!draftMessage.trim()}
              aria-label="Send message"
            >
              <Send aria-hidden="true" size={19} strokeWidth={2.6} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function getFriendId(name: string) {
  const ids: Record<string, string> = {
    Ayush: "SL-A001",
    Aniket: "SL-A002",
    Durshant: "SL-A003",
  };

  return ids[name] ?? name;
}

function getFriendEmail(name: string) {
  const emails: Record<string, string> = {
    Ayush: "ayush@scholarlearn.com",
    Aniket: "aniket@scholarlearn.com",
    Durshant: "durshant@scholarlearn.com",
  };

  return emails[name] ?? `${name.toLowerCase()}@scholarlearn.com`;
}

function getFallbackSubmissions(problem: CodingProblem): CodingSubmission[] {
  return [
    {
      id: `${problem.id}-submission-1`,
      status: "Accepted",
      language: "java",
      runtime: "72ms",
      memory: "42MB",
      submittedAt: "Today, 9:20 AM",
    },
    {
      id: `${problem.id}-submission-2`,
      status: "Wrong Answer",
      language: "python",
      runtime: "0ms",
      memory: "0MB",
      submittedAt: "Yesterday, 6:10 PM",
    },
  ];
}

function languageLabel(language: CodingSubmission["language"]) {
  const labels: Record<CodingSubmission["language"], string> = {
    java: "Java",
    python: "Python",
    javascript: "JavaScript",
    cpp: "C++",
  };

  return labels[language];
}