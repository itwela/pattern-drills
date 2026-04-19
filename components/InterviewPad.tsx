"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Language } from "../lib/patterns";
import { Question, TestCase } from "../lib/questions";

// ─── helpers ────────────────────────────────────────────────────────────────

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

type RunResult = {
  passed: boolean;
  result: unknown;
  expected: unknown;
  error?: boolean;
  label?: string;
};

function runJS(
  userCode: string,
  functionName: string,
  testCases: TestCase[]
): RunResult[] {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(userCode + `\nreturn ${functionName};`)() as (
      ...args: unknown[]
    ) => unknown;
    return testCases.map((tc) => {
      try {
        const raw = fn(...tc.args);
        const result = tc.normalize ? tc.normalize(raw) : raw;
        const expected = tc.normalize ? tc.normalize(tc.expected) : tc.expected;
        return { passed: deepEqual(result, expected), result: raw, expected: tc.expected, label: tc.label };
      } catch (e) {
        return { passed: false, result: String(e), expected: tc.expected, error: true, label: tc.label };
      }
    });
  } catch (e) {
    return [{ passed: false, result: String(e), expected: null, error: true }];
  }
}

async function runPython(
  userCode: string,
  functionName: string,
  testCases: TestCase[]
): Promise<RunResult[]> {
  const casesJson = JSON.stringify(
    testCases.map((tc) => ({ args: tc.args, expected: tc.expected }))
  );

  const runner = `
import json, sys

${userCode}

test_cases = ${casesJson}
results = []
for tc in test_cases:
    try:
        result = ${functionName}(*tc["args"])
        results.append({"result": result, "expected": tc["expected"]})
    except Exception as e:
        results.append({"error": str(e), "expected": tc["expected"]})

print(json.dumps(results))
`.trim();

  try {
    const resp = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "python",
        version: "3.10.0",
        files: [{ content: runner }],
      }),
    });
    const data = await resp.json();
    const stdout: string = data?.run?.stdout ?? "";
    const stderr: string = data?.run?.stderr ?? "";

    if (!stdout.trim()) {
      return [{ passed: false, result: stderr || "No output", expected: null, error: true }];
    }

    const rawResults: { result?: unknown; error?: string; expected: unknown }[] =
      JSON.parse(stdout.trim());

    return rawResults.map((r, i) => {
      const tc = testCases[i];
      if (r.error !== undefined) {
        return { passed: false, result: r.error, expected: tc.expected, error: true, label: tc.label };
      }
      const raw = r.result;
      const result = tc.normalize ? tc.normalize(raw) : raw;
      const expected = tc.normalize ? tc.normalize(tc.expected) : tc.expected;
      return { passed: deepEqual(result, expected), result: raw, expected: tc.expected, label: tc.label };
    });
  } catch (e) {
    return [{ passed: false, result: String(e), expected: null, error: true }];
  }
}

// ─── sub-components ─────────────────────────────────────────────────────────

const DIFF_COLORS = {
  easy: { bg: "rgba(111,212,74,0.15)", border: "rgba(111,212,74,0.4)", text: "#6fd44a" },
  medium: { bg: "rgba(232,170,64,0.15)", border: "rgba(232,170,64,0.4)", text: "#e8aa40" },
  hard: { bg: "rgba(255,90,69,0.15)", border: "rgba(255,90,69,0.4)", text: "#ff5a45" },
};

function DifficultyBadge({ level }: { level: "easy" | "medium" | "hard" }) {
  const c = DIFF_COLORS[level];
  return (
    <span
      style={{
        fontSize: "10px",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "3px 10px",
        borderRadius: "4px",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontWeight: 600,
      }}
    >
      {level}
    </span>
  );
}

function TestResultRow({ r, i }: { r: RunResult; i: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderRadius: "6px",
        border: `1px solid ${r.passed ? "rgba(111,212,74,0.25)" : "rgba(255,90,69,0.25)"}`,
        background: r.passed ? "rgba(111,212,74,0.05)" : "rgba(255,90,69,0.05)",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "14px" }}>{r.passed ? "✓" : "✗"}</span>
        <span style={{ fontSize: "12px", color: r.passed ? "#6fd44a" : "#ff5a45", flex: 1 }}>
          Test {i + 1}{r.label ? ` — ${r.label}` : ""}
        </span>
        <span style={{ fontSize: "10px", color: "rgba(240,234,216,0.35)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <div
          style={{
            padding: "0 14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        >
          <div style={{ color: "rgba(240,234,216,0.5)" }}>
            <span style={{ color: "rgba(240,234,216,0.35)" }}>expected: </span>
            {JSON.stringify(r.expected)}
          </div>
          <div style={{ color: r.passed ? "#6fd44a" : "#ff5a45" }}>
            <span style={{ color: "rgba(240,234,216,0.35)" }}>got: </span>
            {JSON.stringify(r.result)}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function InterviewPad({
  question,
  language,
}: {
  question: Question;
  language: Language;
}) {
  const [code, setCode] = useState(question.starterCode[language]);
  const [results, setResults] = useState<RunResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset when question or language changes
  useEffect(() => {
    setCode(question.starterCode[language]);
    setResults(null);
    setRunning(false);
    setStartTime(null);
    setElapsed(0);
    setDone(false);
  }, [question.id, language]);

  // Timer
  useEffect(() => {
    if (!startTime || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 500);
    return () => clearInterval(id);
  }, [startTime, done]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime) setStartTime(Date.now());
    setCode(e.target.value);
  };

  // Tab key inserts spaces instead of moving focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const spaces = language === "python" ? "    " : "  ";
      const next = code.substring(0, start) + spaces + code.substring(end);
      setCode(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + spaces.length;
      });
    }
  };

  const runCode = useCallback(async () => {
    setRunning(true);
    setResults(null);

    let res: RunResult[];
    if (language === "javascript") {
      res = runJS(code, question.functionName, question.testCases);
    } else {
      res = await runPython(code, question.functionName, question.testCases);
    }

    setResults(res);
    setRunning(false);

    if (res.every((r) => r.passed)) {
      setDone(true);
    }
  }, [code, language, question]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const passCount = results?.filter((r) => r.passed).length ?? 0;
  const totalCount = question.testCases.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "800px" }}>

      {/* Question header */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
          <DifficultyBadge level={question.difficulty} />
          <span style={{ fontSize: "10px", color: "rgba(240,234,216,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {question.category}
          </span>
        </div>
        <h1 style={{ margin: "0 0 12px", fontSize: "22px", fontWeight: 400, color: "#f0ead8", letterSpacing: "0.01em" }}>
          {question.title}
        </h1>

        {/* Scenario */}
        <div
          style={{
            background: "#111811",
            border: "1px solid rgba(144,208,96,0.15)",
            borderRadius: "10px",
            padding: "18px 22px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#90d060", marginBottom: "10px" }}>
            Scenario
          </div>
          <p style={{ margin: 0, fontSize: "14px", color: "rgba(240,234,216,0.75)", lineHeight: "1.7" }}>
            {question.scenario}
          </p>
        </div>

        {/* Prompt */}
        <p style={{ margin: "0 0 20px", fontSize: "15px", color: "#f0ead8", lineHeight: "1.6", fontWeight: 500 }}>
          {question.prompt}
        </p>

        {/* Examples */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {question.examples.map((ex, i) => (
            <div
              key={i}
              style={{
                background: "#0d130d",
                border: "1px solid rgba(144,208,96,0.1)",
                borderRadius: "8px",
                padding: "14px 18px",
              }}
            >
              <div style={{ fontFamily: "monospace", fontSize: "13px", marginBottom: ex.explanation ? "8px" : 0 }}>
                <span style={{ color: "rgba(240,234,216,0.4)", marginRight: "8px" }}>Input:</span>
                <span style={{ color: "#e8aa40" }}>{ex.input}</span>
                <span style={{ color: "rgba(240,234,216,0.4)", margin: "0 8px" }}>→</span>
                <span style={{ color: "#6fd44a" }}>{ex.output}</span>
              </div>
              {ex.explanation && (
                <div style={{ fontSize: "12px", color: "rgba(240,234,216,0.45)", lineHeight: "1.5" }}>
                  {ex.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div>
        <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,234,216,0.4)", marginBottom: "10px" }}>
          Your solution · {language === "javascript" ? "JavaScript" : "Python"}
        </div>
        <div
          style={{
            background: "#111811",
            border: `1px solid ${done ? "rgba(111,212,74,0.4)" : "rgba(144,208,96,0.2)"}`,
            borderRadius: "10px",
            overflow: "hidden",
            transition: "border-color 0.3s",
          }}
        >
          {/* Editor chrome */}
          <div style={{ display: "flex", gap: "6px", padding: "12px 16px 10px", borderBottom: "1px solid rgba(144,208,96,0.08)" }}>
            {["#ff5a45", "#e8aa40", "#6fd44a"].map((c, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            style={{
              width: "100%",
              minHeight: "220px",
              padding: "20px 24px",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: "15px",
              lineHeight: "1.7",
              color: "#f0ead8",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={runCode}
          disabled={running}
          style={{
            padding: "10px 28px",
            borderRadius: "7px",
            border: "1px solid rgba(111,212,74,0.6)",
            background: running ? "rgba(111,212,74,0.05)" : "rgba(111,212,74,0.15)",
            color: running ? "rgba(111,212,74,0.4)" : "#6fd44a",
            fontFamily: "inherit",
            fontSize: "13px",
            letterSpacing: "0.06em",
            cursor: running ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {running ? (language === "python" ? "running..." : "running...") : "▶ Run"}
        </button>

        {startTime && !done && (
          <span style={{ fontSize: "12px", color: "rgba(240,234,216,0.4)" }}>
            {formatTime(elapsed)}
          </span>
        )}

        {done && (
          <span style={{ fontSize: "12px", color: "#6fd44a", letterSpacing: "0.06em" }}>
            ✓ all tests passed · {formatTime(elapsed)}
          </span>
        )}

        {language === "python" && (
          <span style={{ fontSize: "10px", color: "rgba(240,234,216,0.3)", marginLeft: "auto" }}>
            runs via Piston API
          </span>
        )}
      </div>

      {/* Test results */}
      {results && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(240,234,216,0.4)" }}>
              Test Results
            </div>
            <span
              style={{
                fontSize: "12px",
                color: passCount === totalCount ? "#6fd44a" : "rgba(255,90,69,0.8)",
                fontWeight: 600,
              }}
            >
              {passCount}/{totalCount}
            </span>
          </div>
          {results.map((r, i) => (
            <TestResultRow key={i} r={r} i={i} />
          ))}
        </div>
      )}
    </div>
  );
}
