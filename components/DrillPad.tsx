"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Pattern, Language } from "../lib/patterns";

type Mode = "guided" | "perfect";

type CharState = "pending" | "correct" | "wrong";

function useSound() {
  const playWrong = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }, []);

  const playSuccess = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const notes = [523, 659, 784];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        osc.start(ctx.currentTime + i * 0.1);
        osc.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch {}
  }, []);

  return { playWrong, playSuccess };
}

function Row({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.4)", letterSpacing: "0.04em" }}>{label}</span>
      <span style={{ fontSize: "12px", color: color ?? "rgba(240,234,216,0.8)", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export default function DrillPad({ pattern, language }: { pattern: Pattern; language: Language }) {
  const [mode, setMode] = useState<Mode>("guided");
  const [hidden, setHidden] = useState(false);
  const [typed, setTyped] = useState("");
  const [shaking, setShaking] = useState(false);
  const [done, setDone] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { playWrong, playSuccess } = useSound();
  const logSession = useMutation(api.drills.logSession);
  const stats = useQuery(api.drills.getStats, { patternId: pattern.id });

  const target = pattern.code[language];

  // Timer
  useEffect(() => {
    if (!startTime || done) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(id);
  }, [startTime, done]);

  // Reset on pattern or language change
  useEffect(() => {
    setTyped("");
    setDone(false);
    setAttempts(0);
    setMistakes(0);
    setStartTime(null);
    setElapsed(0);
    setHidden(false);
    if (inputRef.current) inputRef.current.value = "";
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [pattern.id, language]);

  const charStates: CharState[] = target.split("").map((_, i) => {
    if (i >= typed.length) return "pending";
    return typed[i] === target[i] ? "correct" : "wrong";
  });

  const progress = (() => {
    let correct = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++;
      else break;
    }
    return correct / target.length;
  })();

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (done) return;
    const val = e.target.value;

    if (!startTime && val.length > 0) setStartTime(Date.now());

    const newLen = val.length;
    const prevLen = typed.length;

    // Check if new char is wrong
    if (newLen > prevLen) {
      const idx = newLen - 1;
      const isWrong = val[idx] !== target[idx];

      if (isWrong) {
        playWrong();
        setMistakes((m) => m + 1);
        if (mode === "perfect") {
          setShaking(true);
          setAttempts((a) => a + 1);
          setTimeout(() => {
            setShaking(false);
            setTyped("");
            setStartTime(null);
            setElapsed(0);
            if (inputRef.current) inputRef.current.value = "";
          }, 400);
          return;
        } else {
          setShaking(true);
          setTimeout(() => setShaking(false), 200);
        }
      }
    }

    setTyped(val);

    // Check completion — must match fully
    if (val === target) {
      setDone(true);
      playSuccess();
      const duration = startTime ? Date.now() - startTime : 0;
      logSession({
        patternId: pattern.id,
        mode,
        success: true,
        durationMs: duration,
        attempts: attempts + 1,
        mistakes,
      });
    }
  };

  const reset = () => {
    setTyped("");
    setDone(false);
    setAttempts(0);
    setMistakes(0);
    setStartTime(null);
    setElapsed(0);
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.focus();
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const cursorPos = typed.length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">

      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        {(["guided", "perfect"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              fontSize: "12px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "inherit",
              cursor: "pointer",
              transition: "all 0.15s",
              border: mode === m
                ? "1px solid rgba(232,170,64,0.7)"
                : "1px solid rgba(144,208,96,0.2)",
              background: mode === m
                ? "rgba(232,170,64,0.18)"
                : "rgba(144,208,96,0.05)",
              color: mode === m
                ? "#e8aa40"
                : "rgba(240,234,216,0.5)",
            }}
          >
            {m === "guided" ? "Guided" : "Perfect Run"}
          </button>
        ))}
        <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.5)", marginLeft: "8px" }}>
          {mode === "guided"
            ? "wrong keys are shown — keep going"
            : "one wrong key resets everything"}
        </span>
      </div>

      {/* Stats panel */}
      {stats && stats.totalSessions > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {/* Guided */}
          <div style={{ background: "#111811", border: "1px solid rgba(144,208,96,0.15)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#90d060", marginBottom: "10px" }}>Guided</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Row label="sessions" value={stats.guided.total} />
              <Row label="completed" value={stats.guided.wins} />
              <Row label="mistakes made" value={stats.guided.totalMistakes} color="rgba(255,90,69,0.8)" />
              {stats.guided.bestTimeMs && <Row label="best time" value={formatTime(stats.guided.bestTimeMs)} />}
            </div>
          </div>
          {/* Perfect Run */}
          <div style={{ background: "#111811", border: "1px solid rgba(144,208,96,0.15)", borderRadius: "8px", padding: "14px 16px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8aa40", marginBottom: "10px" }}>Perfect Run</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Row label="attempts" value={stats.perfect.total} />
              <Row label="completed" value={stats.perfect.wins} />
              <Row label="clean (0 resets)" value={stats.perfect.cleanRuns} color="#6fd44a" />
              <Row label="total resets" value={stats.perfect.totalResets} color="rgba(255,90,69,0.8)" />
              {stats.perfect.bestTimeMs && <Row label="best time" value={formatTime(stats.perfect.bestTimeMs)} />}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div style={{ height: "3px", background: "rgba(144,208,96,0.12)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            borderRadius: "2px",
            background: done
              ? "#6fd44a"
              : "linear-gradient(90deg, #e8aa40, #90d060)",
            transition: "width 0.1s ease",
          }}
        />
      </div>

      {/* Code display */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: "#111811",
          border: "1px solid rgba(144,208,96,0.2)",
          borderRadius: "10px",
          padding: "24px 28px",
          position: "relative",
          cursor: "text",
          animation: shaking ? "shake 0.3s ease" : undefined,
        }}
      >
        {/* Invisible textarea overlaid on the whole box */}
        <textarea
          ref={inputRef}
          onChange={handleInput}
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            cursor: "text",
            resize: "none",
            zIndex: 2,
            background: "transparent",
            border: "none",
            outline: "none",
            width: "100%",
            height: "100%",
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {/* Dot row + hide toggle */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            {["#ff5a45", "#e8aa40", "#6fd44a"].map((c, i) => (
              <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c, opacity: 0.7 }} />
            ))}
          </div>
          <button
            onClick={() => setHidden((h) => !h)}
            style={{
              background: "none",
              border: "none",
              color: hidden ? "rgba(240,234,216,0.6)" : "rgba(240,234,216,0.25)",
              fontFamily: "inherit",
              fontSize: "11px",
              letterSpacing: "0.06em",
              cursor: "pointer",
              padding: "2px 0",
              zIndex: 3,
              position: "relative",
            }}
          >
            {hidden ? "show" : "hide"}
          </button>
        </div>

        {/* Characters */}
        <pre style={{ margin: 0, fontSize: "17px", lineHeight: "1.8", whiteSpace: "pre", fontFamily: "inherit", filter: hidden ? "blur(8px)" : "none", transition: "filter 0.2s ease", userSelect: "none" }}>
          {target.split("").map((char, i) => {
            const state = charStates[i];
            const isCursor = i === cursorPos && !done;
            return (
              <span
                key={i}
                style={{
                  color:
                    state === "correct" ? "var(--correct)"
                    : state === "wrong" ? "var(--wrong)"
                    : "var(--pending)",
                  borderBottom: isCursor ? "2px solid var(--cursor)" : undefined,
                  animation: isCursor ? "blink 1s step-end infinite" : undefined,
                  background: state === "wrong" ? "rgba(224,90,74,0.1)" : undefined,
                }}
              >
                {char === "\n" ? (
                  <>
                    {isCursor && <span style={{ display: "inline-block", width: "2px", height: "1em", background: "var(--cursor)", verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />}
                    {"\n"}
                  </>
                ) : char}
              </span>
            );
          })}
          {cursorPos >= target.length && !done && (
            <span style={{ display: "inline-block", width: "2px", height: "1em", background: "var(--cursor)", verticalAlign: "text-bottom", animation: "blink 1s step-end infinite" }} />
          )}
        </pre>

        {/* Done overlay */}
        {done && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: "10px", zIndex: 3,
            background: "rgba(10,15,10,0.92)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "12px",
            backdropFilter: "blur(4px)",
          }}>
            <div style={{ fontSize: "32px" }}>✓</div>
            <div style={{ color: "#6fd44a", fontSize: "14px", letterSpacing: "0.08em" }}>
              {formatTime(elapsed)} · {mode === "perfect" ? `${attempts} reset${attempts !== 1 ? "s" : ""}` : `${mistakes} mistake${mistakes !== 1 ? "s" : ""}`}
            </div>
            <button
              onClick={reset}
              style={{
                marginTop: "8px",
                padding: "8px 24px",
                borderRadius: "6px",
                border: "1px solid rgba(232,170,64,0.6)",
                background: "rgba(232,170,64,0.15)",
                color: "#e8aa40",
                fontFamily: "inherit",
                fontSize: "12px",
                letterSpacing: "0.08em",
                cursor: "pointer",
              }}
            >
              again
            </button>
          </div>
        )}
      </div>


      {/* Reset */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "none",
            border: "none",
            color: "rgba(240,234,216,0.45)",
            fontFamily: "inherit",
            fontSize: "11px",
            cursor: "pointer",
            letterSpacing: "0.06em",
            padding: 0,
          }}
        >
          reset
        </button>
        {startTime && !done && (
          <span style={{ fontSize: "11px", color: "rgba(240,234,216,0.45)" }}>
            {formatTime(elapsed)}
          </span>
        )}
        {attempts > 0 && (
          <span style={{ fontSize: "11px", color: "rgba(255,90,69,0.7)" }}>
            {attempts} reset{attempts !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
