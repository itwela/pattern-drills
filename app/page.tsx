"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../convex/_generated/api";
import { PATTERNS, CATEGORIES, Pattern, Language } from "../lib/patterns";
import { QUESTIONS, QUESTION_CATEGORIES, Question } from "../lib/questions";
import DrillPad from "../components/DrillPad";
import InterviewPad from "../components/InterviewPad";

type AppMode = "drills" | "interview";

const DIFF_DOT: Record<string, string> = {
  easy: "#6fd44a",
  medium: "#e8aa40",
  hard: "#ff5a45",
};

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>("drills");
  const [selected, setSelected] = useState<Pattern>(PATTERNS[0]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question>(QUESTIONS[0]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeQCategory, setActiveQCategory] = useState<string>("All");
  const [language, setLanguage] = useState<Language>("javascript");

  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const currentUser = useQuery(api.drills.getCurrentUser);

  const starredIds = useQuery(api.drills.getStarred) ?? [];
  const toggleStarMutation = useMutation(api.drills.toggleStarred);
  const starred = new Set(starredIds);

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation({ patternId: id });
  };

  const base = activeCategory === "All"
    ? PATTERNS
    : PATTERNS.filter((p) => p.category === activeCategory);

  const filtered = [
    ...base.filter((p) => starred.has(p.id)),
    ...base.filter((p) => !starred.has(p.id)),
  ];

  const filteredQuestions = activeQCategory === "All"
    ? QUESTIONS
    : QUESTIONS.filter((q) => q.category === activeQCategory);

  const handleModeSwitch = (mode: AppMode) => {
    setAppMode(mode);
    setActiveCategory("All");
    setActiveQCategory("All");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "fixed", top: "-20vh", right: "-10vw", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(144,208,96,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-20vh", left: "-10vw", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(232,170,64,0.07) 0%, transparent 70%)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Header */}
      <header style={{ padding: "18px 32px", borderBottom: "1px solid rgba(144,208,96,0.15)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,15,10,0.95)", backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(232,170,64,0.2)", border: "1px solid rgba(232,170,64,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>
              ⌨
            </div>
            <div>
              <div style={{ fontSize: "15px", color: "#f0ead8", letterSpacing: "0.02em" }}>Pattern Drills</div>
              <div style={{ fontSize: "10px", color: "rgba(240,234,216,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>type it until you don't have to think</div>
            </div>
          </div>

          {/* Mode toggle */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(144,208,96,0.06)", border: "1px solid rgba(144,208,96,0.15)", borderRadius: "8px", padding: "4px" }}>
            {(["drills", "interview"] as AppMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                style={{
                  padding: "5px 16px",
                  borderRadius: "6px",
                  fontSize: "11px",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: "none",
                  background: appMode === m ? "rgba(232,170,64,0.22)" : "transparent",
                  color: appMode === m ? "#e8aa40" : "rgba(240,234,216,0.4)",
                  fontWeight: appMode === m ? 600 : 400,
                }}
              >
                {m === "drills" ? "Drills" : "Interview Prep"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Language toggle */}
          <div style={{ display: "flex", gap: "4px", background: "rgba(144,208,96,0.08)", border: "1px solid rgba(144,208,96,0.2)", borderRadius: "8px", padding: "4px" }}>
            {(["javascript", "python"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                style={{
                  padding: "5px 16px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  letterSpacing: "0.06em",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  border: "none",
                  background: language === lang ? "rgba(232,170,64,0.25)" : "transparent",
                  color: language === lang ? "#e8aa40" : "rgba(240,234,216,0.45)",
                  fontWeight: language === lang ? 600 : 400,
                }}
              >
                {lang === "javascript" ? "JS" : "PY"}
              </button>
            ))}
          </div>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {currentUser?.email && (
                <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.45)", letterSpacing: "0.03em" }}>
                  {currentUser.email}
                </span>
              )}
              <button
                onClick={() => signOut()}
                style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "11px", letterSpacing: "0.06em", fontFamily: "inherit", cursor: "pointer", border: "1px solid rgba(240,234,216,0.12)", background: "transparent", color: "rgba(240,234,216,0.4)" }}
              >
                sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/sign-in")}
              style={{ padding: "5px 14px", borderRadius: "6px", fontSize: "11px", letterSpacing: "0.06em", fontFamily: "inherit", cursor: "pointer", border: "1px solid rgba(144,208,96,0.3)", background: "rgba(144,208,96,0.08)", color: "rgba(240,234,216,0.6)" }}
            >
              sign in
            </button>
          )}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: "260px", borderRight: "1px solid rgba(144,208,96,0.12)", padding: "16px 0", display: "flex", flexDirection: "column", gap: "0", overflowY: "auto", flexShrink: 0, background: "rgba(10,15,10,0.7)" }}>

          {appMode === "drills" ? (
            <>
              {/* Category filters */}
              <div style={{ padding: "0 14px 12px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["All", ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: "4px 10px", borderRadius: "4px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer",
                      border: activeCategory === cat ? "1px solid rgba(232,170,64,0.55)" : "1px solid rgba(240,234,216,0.12)",
                      background: activeCategory === cat ? "rgba(232,170,64,0.15)" : "transparent",
                      color: activeCategory === cat ? "#e8aa40" : "rgba(240,234,216,0.45)",
                      transition: "all 0.15s",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ height: "1px", background: "rgba(144,208,96,0.1)", margin: "0 14px 12px" }} />

              {starred.size > 0 && (
                <div style={{ padding: "0 14px 8px", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8aa40" }}>
                  Practicing
                </div>
              )}

              {filtered.map((p, i) => {
                const isActive = selected.id === p.id;
                const isStarred = starred.has(p.id);
                const prevIsStarred = i > 0 && starred.has(filtered[i - 1].id);
                const showDivider = !isStarred && prevIsStarred && starred.size > 0;

                return (
                  <div key={p.id}>
                    {showDivider && <div style={{ height: "1px", background: "rgba(144,208,96,0.1)", margin: "8px 14px" }} />}
                    <button
                      onClick={() => setSelected(p)}
                      style={{
                        width: "100%", padding: "10px 14px", textAlign: "left",
                        background: isActive ? "rgba(144,208,96,0.1)" : "transparent",
                        borderTop: "none", borderRight: "none", borderBottom: "none",
                        borderLeft: isActive ? "2px solid #e8aa40" : "2px solid transparent",
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        display: "flex", alignItems: "center", gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", color: isActive ? "#f0ead8" : "rgba(240,234,216,0.65)", letterSpacing: "0.01em", marginBottom: "2px" }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "10px", color: "rgba(240,234,216,0.35)", letterSpacing: "0.03em" }}>
                          {p.description}
                        </div>
                      </div>
                      <span
                        onClick={(e) => toggleStar(p.id, e)}
                        style={{ fontSize: "14px", opacity: isStarred ? 1 : 0.2, color: isStarred ? "#e8aa40" : "#f0ead8", flexShrink: 0, transition: "opacity 0.15s", cursor: "pointer", lineHeight: 1 }}
                        onMouseEnter={(e) => { if (!isStarred) (e.currentTarget as HTMLElement).style.opacity = "0.55"; }}
                        onMouseLeave={(e) => { if (!isStarred) (e.currentTarget as HTMLElement).style.opacity = "0.2"; }}
                      >
                        ★
                      </span>
                    </button>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* Question category filters */}
              <div style={{ padding: "0 14px 12px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {["All", ...QUESTION_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveQCategory(cat)}
                    style={{
                      padding: "4px 10px", borderRadius: "4px", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "inherit", cursor: "pointer",
                      border: activeQCategory === cat ? "1px solid rgba(232,170,64,0.55)" : "1px solid rgba(240,234,216,0.12)",
                      background: activeQCategory === cat ? "rgba(232,170,64,0.15)" : "transparent",
                      color: activeQCategory === cat ? "#e8aa40" : "rgba(240,234,216,0.45)",
                      transition: "all 0.15s",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ height: "1px", background: "rgba(144,208,96,0.1)", margin: "0 14px 12px" }} />

              {filteredQuestions.map((q) => {
                const isActive = selectedQuestion.id === q.id;
                const isBlock = !!q.buildsToward;
                const leadsToName = isBlock
                  ? QUESTIONS.find((x) => x.id === q.buildsToward)?.title
                  : null;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q)}
                    style={{
                      width: "100%",
                      padding: isBlock ? "8px 14px 8px 22px" : "10px 14px",
                      textAlign: "left",
                      background: isActive ? "rgba(144,208,96,0.1)" : "transparent",
                      borderTop: "none", borderRight: "none", borderBottom: "none",
                      borderLeft: isActive ? "2px solid #e8aa40" : "2px solid transparent",
                      cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                      display: "flex", alignItems: "flex-start", gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "7px", height: "7px", borderRadius: "50%",
                        background: DIFF_DOT[q.difficulty],
                        marginTop: "5px", flexShrink: 0,
                        opacity: isBlock ? 0.7 : 1,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: isBlock ? "12px" : "13px", color: isActive ? "#f0ead8" : isBlock ? "rgba(240,234,216,0.5)" : "rgba(240,234,216,0.65)", letterSpacing: "0.01em", marginBottom: "2px" }}>
                        {q.title}
                      </div>
                      {leadsToName ? (
                        <div style={{ fontSize: "9px", color: "rgba(144,208,96,0.5)", letterSpacing: "0.04em" }}>
                          builds toward: {leadsToName}
                        </div>
                      ) : (
                        <div style={{ fontSize: "10px", color: "rgba(240,234,216,0.35)", letterSpacing: "0.03em" }}>
                          {q.category}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </aside>

        {/* ── Main ── */}
        <main style={{ flex: 1, padding: "48px 52px", overflowY: "auto" }}>
          {appMode === "drills" ? (
            <>
              <div style={{ marginBottom: "36px" }}>
                <div style={{ fontSize: "10px", color: "#e8aa40", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                  {selected.category} · {language === "javascript" ? "JavaScript" : "Python"}
                  {starred.has(selected.id) && <span style={{ color: "#e8aa40" }}>★ practicing</span>}
                </div>
                <h1 style={{ margin: 0, fontSize: "24px", color: "#f0ead8", fontWeight: 400, letterSpacing: "0.01em" }}>
                  {selected.name}
                </h1>
                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "rgba(240,234,216,0.5)", letterSpacing: "0.02em" }}>
                  {selected.description}
                </p>
              </div>
              <DrillPad pattern={selected} language={language} />
            </>
          ) : (
            <InterviewPad question={selectedQuestion} language={language} />
          )}
        </main>
      </div>
    </div>
  );
}
