import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { format } from "date-fns";
import { ArrowUp, MessageSquare, Plus, Trash2 } from "lucide-react";
import { Nav } from "@/components/Nav";
import { useSupabaseClient } from "@/lib/supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ChatSession = {
  id: string;
  clerk_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  id: string;
  session_id: string;
  clerk_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Suggestion chips shown in the empty state
// ─────────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "How do I get better at Logic Games?",
  "What's the difference between strengthen and sufficient assumption?",
  "Help me make a study plan",
];

// ─────────────────────────────────────────────────────────────────────────────
// Dot-dot-dot typing animation
// ─────────────────────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "14px 16px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#0D9488",
            display: "inline-block",
            animation: "bri-bounce 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Chat page
// ─────────────────────────────────────────────────────────────────────────────

const Chat = () => {
  const { user, isSignedIn } = useUser();
  const supabase = useSupabaseClient();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredSessionId, setHoveredSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  useEffect(() => { activeSessionIdRef.current = activeSessionId; }, [activeSessionId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── Load sessions ──────────────────────────────────────────────────────────

  const loadSessions = useCallback(async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("chat_sessions")
      .select("*")
      .eq("clerk_id", user.id)
      .order("updated_at", { ascending: false });
    if (data) setSessions(data as ChatSession[]);
  }, [supabase, user]);

  useEffect(() => {
    if (isSignedIn && user) loadSessions();
  }, [isSignedIn, user, loadSessions]);

  // ── Load messages for active session ──────────────────────────────────────

  useEffect(() => {
    if (!activeSessionId) return;
    (supabase as any)
      .from("chat_messages")
      .select("*")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: ChatMessage[] | null }) => {
        if (data) setMessages(data);
      });
  }, [activeSessionId, supabase]);

  // ── Scroll to bottom ───────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Auto-resize textarea ───────────────────────────────────────────────────

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 112) + "px"; // max 4 rows ≈ 28px×4
  };

  useEffect(() => { resizeTextarea(); }, [inputText]);

  // ── Session management ─────────────────────────────────────────────────────

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setIsEditingTitle(false);
  };

  const selectSession = (session: ChatSession) => {
    if (session.id === activeSessionId) return;
    setActiveSessionId(session.id);
    setMessages([]);
    setIsEditingTitle(false);
  };

  const deleteSession = async (id: string) => {
    await (supabase as any).from("chat_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setMessages([]);
    }
    setDeletingId(null);
  };

  // ── Title editing ──────────────────────────────────────────────────────────

  const saveTitle = async () => {
    if (!activeSessionId || !editTitleValue.trim()) {
      setIsEditingTitle(false);
      return;
    }
    const title = editTitleValue.trim();
    await (supabase as any).from("chat_sessions").update({ title }).eq("id", activeSessionId);
    setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, title } : s)));
    setIsEditingTitle(false);
  };

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || !user) return;
    const text = inputText.trim();
    setInputText("");
    setIsLoading(true);

    // Build API payload before any state changes
    const priorMessages = messagesRef.current.map((m) => ({ role: m.role, content: m.content }));
    const apiMessages = [...priorMessages, { role: "user" as const, content: text }];

    let sessionId = activeSessionIdRef.current;

    // Create session if this is the first message
    if (!sessionId) {
      const title = text.slice(0, 40);
      const { data: newSession, error } = await (supabase as any)
        .from("chat_sessions")
        .insert({ clerk_id: user.id, title })
        .select()
        .single();
      if (error || !newSession) { setIsLoading(false); return; }
      sessionId = newSession.id;
      setActiveSessionId(sessionId);
      activeSessionIdRef.current = sessionId;
      setSessions((prev) => [newSession as ChatSession, ...prev]);
    }

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      clerk_id: user.id,
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Persist user message
    await (supabase as any).from("chat_messages").insert({
      session_id: sessionId,
      clerk_id: user.id,
      role: "user",
      content: text,
    });

    // Call the edge function
    const { data: fnData, error: fnError } = await (supabase as any).functions.invoke("lsat-chat", {
      body: { messages: apiMessages },
    });

    const assistantContent =
      !fnError && fnData?.content
        ? fnData.content
        : "I'm sorry, something went wrong. Please try again!";

    // Add assistant response to UI
    const tempAssistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: sessionId,
      clerk_id: user.id,
      role: "assistant",
      content: assistantContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempAssistantMsg]);

    // Persist assistant message
    await (supabase as any).from("chat_messages").insert({
      session_id: sessionId,
      clerk_id: user.id,
      role: "assistant",
      content: assistantContent,
    });

    // Auto-title: set title from first user message if still "New Chat"
    const now = new Date().toISOString();
    const currentSession = sessions.find((s) => s.id === sessionId) ??
      { title: text.slice(0, 40), id: sessionId };
    const isAutoTitle = currentSession.title === "New Chat" || priorMessages.length === 0;
    const finalTitle = isAutoTitle ? text.slice(0, 40) : currentSession.title;

    await (supabase as any)
      .from("chat_sessions")
      .update({ updated_at: now, ...(isAutoTitle ? { title: finalTitle } : {}) })
      .eq("id", sessionId);

    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, updated_at: now, ...(isAutoTitle ? { title: finalTitle } : {}) }
          : s
      ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Active session info ────────────────────────────────────────────────────

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", display: "flex", flexDirection: "column" }}>
      <Nav />

      <style>{`
        @keyframes bri-bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .chat-session-row:hover { background: #F9FAFB; }
      `}</style>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", height: "calc(100vh - 73px)" }}>

        {/* ── SIDEBAR ───────────────────────────────────────────────────────── */}
        <aside
          style={{
            width: 260,
            flexShrink: 0,
            background: "white",
            borderRight: "1px solid #E5E7EB",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "14px 14px 10px",
              borderBottom: "1px solid #F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#9CA3AF",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Study Sessions
            </span>
            <button
              onClick={startNewChat}
              title="New Chat"
              style={{
                background: "#0D9488",
                border: "none",
                borderRadius: 6,
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Plus size={13} />
              New
            </button>
          </div>

          {/* Session list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
            {sessions.length === 0 ? (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  color: "#9CA3AF",
                  fontFamily: "Inter, sans-serif",
                  margin: "32px 16px",
                  lineHeight: 1.5,
                }}
              >
                No sessions yet. Start a conversation!
              </p>
            ) : (
              sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isConfirmingDelete = deletingId === session.id;
                return (
                  <div
                    key={session.id}
                    className="chat-session-row"
                    onMouseEnter={() => setHoveredSessionId(session.id)}
                    onMouseLeave={() => setHoveredSessionId(null)}
                    onClick={() => !isConfirmingDelete && selectSession(session)}
                    style={{
                      position: "relative",
                      padding: "9px 14px",
                      cursor: "pointer",
                      background: isActive ? "#F0FDFA" : "transparent",
                      borderLeft: isActive ? "3px solid #0D9488" : "3px solid transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    {isConfirmingDelete ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.75rem", color: "#EF4444", fontFamily: "Inter, sans-serif", flex: 1 }}>
                          Delete?
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                          style={{ background: "#EF4444", color: "white", border: "none", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                          style={{ background: "none", color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 4, padding: "2px 8px", fontSize: "0.7rem", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.875rem",
                            color: isActive ? "#0D9488" : "#1A1A2E",
                            fontWeight: isActive ? 600 : 400,
                            fontFamily: "Inter, sans-serif",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingRight: 22,
                          }}
                        >
                          {session.title}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontSize: "0.7rem",
                            color: "#9CA3AF",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {format(new Date(session.updated_at), "MMM d")}
                        </p>
                        {hoveredSessionId === session.id && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeletingId(session.id); }}
                            title="Delete session"
                            style={{
                              position: "absolute",
                              right: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#D1D5DB",
                              display: "flex",
                              padding: 2,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── MAIN CHAT PANEL ───────────────────────────────────────────────── */}
        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "#FAF7F2",
          }}
        >
          {/* Top bar: session title */}
          <div
            style={{
              padding: "12px 24px",
              borderBottom: "1px solid #E5E7EB",
              background: "white",
              display: "flex",
              alignItems: "center",
              gap: 8,
              minHeight: 52,
            }}
          >
            <MessageSquare size={16} color="#0D9488" />
            {isEditingTitle && activeSession ? (
              <input
                autoFocus
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                onBlur={saveTitle}
                style={{
                  border: "none",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#1A1A2E",
                  background: "transparent",
                  flex: 1,
                  padding: 0,
                }}
              />
            ) : (
              <span
                onClick={() => {
                  if (!activeSession) return;
                  setEditTitleValue(activeSession.title);
                  setIsEditingTitle(true);
                }}
                title={activeSession ? "Click to rename" : undefined}
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: activeSession ? "#1A1A2E" : "#9CA3AF",
                  cursor: activeSession ? "text" : "default",
                  flex: 1,
                }}
              >
                {activeSession?.title ?? "New Chat"}
              </span>
            )}
          </div>

          {/* Message area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 24px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Empty state */}
            {messages.length === 0 && !isLoading && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: "40px 24px",
                  gap: 16,
                }}
              >
                {/* Bri avatar */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#0D9488",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  B
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.6rem",
                    color: "#1A1A2E",
                    fontWeight: 700,
                  }}
                >
                  Hi, I'm Bri!
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#6B7280",
                    fontFamily: "Inter, sans-serif",
                    maxWidth: 400,
                    lineHeight: 1.6,
                  }}
                >
                  Your LSAT study coach. Ask me anything about Logical Reasoning, Logic Games,
                  Reading Comprehension, or study strategies.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInputText(s)}
                      style={{
                        background: "white",
                        border: "1.5px solid #0D9488",
                        borderRadius: 20,
                        padding: "7px 14px",
                        fontSize: "0.82rem",
                        color: "#0D9488",
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#F0FDFA";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "white";
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 4,
                }}
              >
                {msg.role === "assistant" && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#0D9488",
                      fontFamily: "Inter, sans-serif",
                      marginLeft: 4,
                    }}
                  >
                    Bri
                  </span>
                )}
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius:
                      msg.role === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    background: msg.role === "user" ? "#0D9488" : "white",
                    color: msg.role === "user" ? "white" : "#1A1A2E",
                    border: msg.role === "user" ? "none" : "1px solid #E5E7EB",
                    fontSize: "0.9rem",
                    fontFamily: "Inter, sans-serif",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#0D9488", fontFamily: "Inter, sans-serif", marginLeft: 4 }}>
                  Bri
                </span>
                <div
                  style={{
                    background: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px 12px 12px 2px",
                    display: "inline-block",
                  }}
                >
                  <TypingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "12px 24px 16px",
              background: "white",
              borderTop: "1px solid #E5E7EB",
            }}
          >
            {inputText.length >= 800 && (
              <p style={{ margin: "0 0 6px", fontSize: "0.75rem", color: "#D97706", fontFamily: "Inter, sans-serif" }}>
                Keep questions focused for best results
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                background: "#F9FAFB",
                border: "1.5px solid #E5E7EB",
                borderRadius: 12,
                padding: "8px 8px 8px 14px",
                transition: "border-color 0.15s",
              }}
              onFocus={() => {}}
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ask Bri anything about the LSAT..."
                rows={1}
                style={{
                  flex: 1,
                  resize: "none",
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.9rem",
                  color: "#1A1A2E",
                  lineHeight: 1.6,
                  maxHeight: 112,
                  overflowY: "auto",
                  padding: 0,
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background:
                    isLoading || !inputText.trim() ? "#D1FAF4" : "#0D9488",
                  border: "none",
                  cursor: isLoading || !inputText.trim() ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.1s",
                }}
              >
                <ArrowUp size={18} color="white" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Chat;
