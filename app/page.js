"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

function generateSolution() {
  const base = [
    [1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],
    [2,3,1,5,6,4,8,9,7],[5,6,4,8,9,7,2,3,1],[8,9,7,2,3,1,5,6,4],
    [3,1,2,6,4,5,9,7,8],[6,4,5,9,7,8,3,1,2],[9,7,8,3,1,2,6,4,5],
  ];
  const nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
  const map = {};
  nums.forEach((n, i) => (map[i + 1] = n));
  return base.map((r) => r.map((v) => map[v]));
}

function generateGame() {
  const solution = generateSolution();
  const board = solution.map((r) => [...r]);
  const fixed = Array.from({ length: 9 }, () => Array(9).fill(true));
  const state = Array.from({ length: 9 }, () => Array(9).fill("empty"));
  const display = Array.from({ length: 9 }, () => Array(9).fill(0));

  const toRemove = new Set();
  while (toRemove.size < 45) toRemove.add(Math.floor(Math.random() * 81));
  toRemove.forEach((idx) => {
    const r = Math.floor(idx / 9), c = idx % 9;
    board[r][c] = 0;
    fixed[r][c] = false;
    state[r][c] = "empty";
    display[r][c] = 0;
  });

  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++)
      if (fixed[i][j]) { state[i][j] = "fixed"; display[i][j] = solution[i][j]; }

  return { solution, board, fixed, state, display };
}

const THEMES = {
  personal: {
    font: "'JetBrains Mono', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
    cell: {
      fixed:   { bg: "rgba(255,255,255,.04)", color: "#d4d4d8", fontWeight: "600" },
      empty:   { bg: "rgba(255,255,255,.02)", color: "#eaeaea", fontWeight: "400" },
      correct: { bg: "rgba(255,255,255,.02)", color: "#eaeaea", fontWeight: "500" },
      wrong:   { bg: "rgba(239,68,68,.12)", color: "#ef4444", fontWeight: "500" },
      hint:    { bg: "rgba(34,197,94,.1)", color: "#22c55e", fontWeight: "500" },
    },
    selectedBg: "rgba(139,92,246,.18)",
    msg: { error: "#ef4444", success: "#22c55e", neutral: "#7f849c" },
    css: `
      --page-bg: #060816;
      --text-muted: #7f849c;
      --lives: #ef4444;
      --board-border: rgba(139,92,246,.35);
      --cell-border: rgba(255,255,255,.06);
      --cell-border-thick: rgba(139,92,246,.45);
      --peer-bg: rgba(139,92,246,.06);
      --select-ring: #8b5cf6;
      --hint-bg: #8b5cf6;
      --hint-fg: #060816;
      --reset-border: #8b5cf6;
      --reset-fg: #8b5cf6;
      --reset-hover-bg: #8b5cf6;
      --reset-hover-fg: #060816;
      --numpad-bg: rgba(255,255,255,.02);
      --numpad-border: rgba(255,255,255,.08);
      --numpad-fg: #d4d4d8;
      --numpad-hover-bg: rgba(139,92,246,.1);
      --numpad-hover-border: #8b5cf6;
      --numpad-active-bg: #8b5cf6;
      --numpad-active-fg: #060816;
      --overlay-bg: rgba(6,8,22,.97);
      --overlay-title: #8b5cf6;
      --overlay-sub: #7f849c;
      --overlay-btn-bg: #8b5cf6;
      --overlay-btn-fg: #060816;
      --toggle-track: rgba(255,255,255,.04);
      --toggle-track-border: rgba(255,255,255,.08);
      --toggle-knob: #7f849c;
      --toggle-active-track: rgba(139,92,246,.2);
      --toggle-active-border: rgba(139,92,246,.35);
      --toggle-active-knob: #8b5cf6;
      --panel-bg: rgba(255,255,255,.02);
      --panel-border: rgba(255,255,255,.04);
      --panel-title: #5f647c;
      --panel-text: #d4d4d8;
      --panel-muted: #7f849c;
      --input-bg: rgba(255,255,255,.02);
      --input-border: rgba(255,255,255,.08);
      --input-fg: #eaeaea;
      --secondary-btn-border: rgba(255,255,255,.08);
      --secondary-btn-fg: #9ca3af;
      --timer-fg: #8b5cf6;
      --rank-accent: #22c55e;
    `,
  },
  light: {
    font: "'DM Mono', 'Courier New', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap",
    cell: {
      fixed:   { bg: "#f5f5f0", color: "#1a1a1a", fontWeight: "600" },
      empty:   { bg: "#ffffff", color: "#1a1a1a", fontWeight: "400" },
      correct: { bg: "#ffffff", color: "#1a1a1a", fontWeight: "500" },
      wrong:   { bg: "#fff0f0", color: "#c0392b", fontWeight: "500" },
      hint:    { bg: "#f0faf4", color: "#1e7a45", fontWeight: "500" },
    },
    selectedBg: "#fffde8",
    msg: { error: "#c0392b", success: "#1e7a45", neutral: "#888" },
    css: `
      --page-bg: #f9f9f7;
      --text-muted: #aaa;
      --lives: #c0392b;
      --board-border: #1a1a1a;
      --cell-border: #ddd;
      --cell-border-thick: #1a1a1a;
      --peer-bg: #f0efe8;
      --select-ring: #1a1a1a;
      --hint-bg: #1a1a1a;
      --hint-fg: #f9f9f7;
      --reset-border: #1a1a1a;
      --reset-fg: #1a1a1a;
      --reset-hover-bg: #1a1a1a;
      --reset-hover-fg: #f9f9f7;
      --numpad-bg: #fff;
      --numpad-border: #ddd;
      --numpad-fg: #1a1a1a;
      --numpad-hover-bg: #f0efe8;
      --numpad-hover-border: #1a1a1a;
      --numpad-active-bg: #1a1a1a;
      --numpad-active-fg: #f9f9f7;
      --overlay-bg: rgba(249,249,247,.97);
      --overlay-title: #1a1a1a;
      --overlay-sub: #aaa;
      --overlay-btn-bg: #1a1a1a;
      --overlay-btn-fg: #f9f9f7;
      --toggle-track: #eee;
      --toggle-track-border: #ddd;
      --toggle-knob: #aaa;
      --toggle-active-track: #1a1a1a;
      --toggle-active-border: #1a1a1a;
      --toggle-active-knob: #f9f9f7;
      --panel-bg: #fff;
      --panel-border: #ddd;
      --panel-title: #888;
      --panel-text: #1a1a1a;
      --panel-muted: #aaa;
      --input-bg: #fff;
      --input-border: #ddd;
      --input-fg: #1a1a1a;
      --secondary-btn-border: #ddd;
      --secondary-btn-fg: #666;
      --timer-fg: #1a1a1a;
      --rank-accent: #1e7a45;
    `,
  },
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Sudoku() {
  const [theme, setTheme] = useState("personal");
  const [game, setGame] = useState(() => generateGame());
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(3);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("neutral");
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [selected, setSelected] = useState(null);
  const [shake, setShake] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerStartedRef = useRef(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [winName, setWinName] = useState("");
  const [scoreSaving, setScoreSaving] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [scoreError, setScoreError] = useState("");

  const t = THEMES[theme];

  const resetTimer = useCallback(() => {
    setElapsed(0);
    setTimerRunning(false);
    timerStartedRef.current = false;
  }, []);

  const startTimer = useCallback(() => {
    if (timerStartedRef.current) return;
    timerStartedRef.current = true;
    setTimerRunning(true);
  }, []);

  const showMsg = (text, type = "neutral") => {
    setMsg(text);
    setMsgType(type);
  };

  const reset = useCallback(() => {
    setGame(generateGame());
    setLives(3);
    setHints(3);
    setMsg("");
    setMsgType("neutral");
    setGameOver(false);
    setGameWon(false);
    setSelected(null);
    setShake(null);
    setWinName("");
    setScoreSaved(false);
    setScoreError("");
    resetTimer();
  }, [resetTimer]);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      setLeaderboard(Array.isArray(data.scores) ? data.scores : []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  const openLeaderboard = () => {
    setShowLeaderboard(true);
    fetchLeaderboard();
  };

  const submitScore = async () => {
    const name = winName.trim();
    if (!name || scoreSaving || scoreSaved) return;
    setScoreSaving(true);
    setScoreError("");
    try {
      const res = await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, timeSeconds: elapsed }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScoreError(data.error || "Erro ao salvar.");
        return;
      }
      setScoreSaved(true);
    } catch {
      setScoreError("Erro ao salvar. Tenta de novo.");
    } finally {
      setScoreSaving(false);
    }
  };

  const handleCellActivate = (i, j) => {
    startTimer();
    setSelected([i, j]);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  useEffect(() => {
    if (gameWon) setTimerRunning(false);
  }, [gameWon]);

  useEffect(() => {
    if (gameOver) resetTimer();
  }, [gameOver, resetTimer]);

  const checkWin = (board, solution) => {
    for (let i = 0; i < 9; i++)
      for (let j = 0; j < 9; j++)
        if (board[i][j] === 0 || board[i][j] !== solution[i][j]) return false;
    return true;
  };

  const triggerShake = (key) => {
    setShake(key);
    setTimeout(() => setShake(null), 500);
  };

  const handleInput = (r, c, num) => {
    if (gameOver || gameWon || game.fixed[r][c]) return;
    if (game.state[r][c] === "correct" || game.state[r][c] === "hint") return;

    const newBoard = game.board.map((row) => [...row]);
    const newState = game.state.map((row) => [...row]);
    const newDisplay = game.display.map((row) => [...row]);

    if (!num) {
      newBoard[r][c] = 0;
      newState[r][c] = "empty";
      newDisplay[r][c] = 0;
      setGame({ ...game, board: newBoard, state: newState, display: newDisplay });
      showMsg("");
      return;
    }

    newDisplay[r][c] = num;

    if (num !== game.solution[r][c]) {
      newState[r][c] = "wrong";
      newBoard[r][c] = 0;
      const newLives = lives - 1;
      setLives(newLives);
      triggerShake(`${r}-${c}`);
      showMsg(`errado — ${newLives} ${newLives === 1 ? "vida" : "vidas"} restante${newLives === 1 ? "" : "s"}`, "error");
      setGame({ ...game, board: newBoard, state: newState, display: newDisplay });
      if (newLives <= 0) setGameOver(true);
    } else {
      newState[r][c] = "correct";
      newBoard[r][c] = num;
      showMsg("correto_", "success");
      setGame({ ...game, board: newBoard, state: newState, display: newDisplay });
      if (checkWin(newBoard, game.solution)) setGameWon(true);
    }
  };

  const handleKeyDown = (r, c, e) => {
    if (gameOver || gameWon) return;
    if (/^[1-9]$/.test(e.key)) { handleInput(r, c, parseInt(e.key)); }
    else if (e.key === "Backspace" || e.key === "Delete") { handleInput(r, c, 0); }
    else if (e.key === "ArrowRight") { setSelected([r, Math.min(c + 1, 8)]); e.preventDefault(); }
    else if (e.key === "ArrowLeft")  { setSelected([r, Math.max(c - 1, 0)]); e.preventDefault(); }
    else if (e.key === "ArrowDown")  { setSelected([Math.min(r + 1, 8), c]); e.preventDefault(); }
    else if (e.key === "ArrowUp")    { setSelected([Math.max(r - 1, 0), c]); e.preventDefault(); }
    e.preventDefault();
  };

  const useHint = () => {
    if (hints <= 0 || gameOver || gameWon) return;
    const empty = [];
    game.board.forEach((row, i) =>
      row.forEach((v, j) => { if (!game.fixed[i][j] && v === 0) empty.push([i, j]); })
    );
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = game.board.map((row) => [...row]);
    const newState = game.state.map((row) => [...row]);
    const newDisplay = game.display.map((row) => [...row]);
    newBoard[r][c] = game.solution[r][c];
    newState[r][c] = "hint";
    newDisplay[r][c] = game.solution[r][c];
    const newHints = hints - 1;
    setHints(newHints);
    setGame({ ...game, board: newBoard, state: newState, display: newDisplay });
    showMsg(`dica usada — ${newHints} restante${newHints === 1 ? "" : "s"}`, "neutral");
    if (checkWin(newBoard, game.solution)) setGameWon(true);
  };

  useEffect(() => {
    if (selected) {
      const el = document.getElementById(`cell-${selected[0]}-${selected[1]}`);
      if (el) el.focus();
    }
  }, [selected]);

  const hearts = lives >= 3 ? "❤ ❤ ❤" : lives === 2 ? "❤ ❤ ♡" : lives === 1 ? "❤ ♡ ♡" : "♡ ♡ ♡";
  const msgColor = t.msg[msgType] || t.msg.neutral;
  const timerLabel = formatTime(elapsed);

  return (
    <>
      <style>{`
        @import url('${t.fontImport}');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          ${t.css}
          background: var(--page-bg);
          font-family: ${t.font};
          min-height: 100vh;
        }

        .sudoku-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: var(--page-bg);
        }

        .sudoku-inner {
          width: 100%;
          max-width: min(96vw, 480px);
        }

        .sudoku-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 8px;
        }

        .sudoku-header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sudoku-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sudoku-title {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted);
          font-family: ${t.font};
        }

        .timer {
          font-size: 13px;
          letter-spacing: 0.1em;
          color: var(--timer-fg);
          font-family: ${t.font};
          font-variant-numeric: tabular-nums;
        }

        .lives {
          font-size: 13px;
          color: var(--lives);
          letter-spacing: 0.12em;
          font-family: ${t.font};
        }

        .sudoku-header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .header-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .header-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .theme-switch {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .theme-switch-label {
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--panel-title);
          font-family: ${t.font};
        }

        .theme-switch input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        .theme-switch-track {
          width: 42px;
          height: 24px;
          background: var(--toggle-track);
          border: 1px solid var(--toggle-track-border);
          border-radius: 999px;
          position: relative;
          transition: background 0.25s, border-color 0.25s;
          flex-shrink: 0;
        }

        .theme-switch-track::after {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          left: 2px;
          top: 2px;
          background: var(--toggle-knob);
          border-radius: 50%;
          transition: transform 0.25s, background 0.25s;
        }

        .theme-switch input:checked + .theme-switch-track {
          background: var(--toggle-active-track);
          border-color: var(--toggle-active-border);
        }

        .theme-switch input:checked + .theme-switch-track::after {
          transform: translateX(18px);
          background: var(--toggle-active-knob);
        }

        .leaderboard-btn,
        .hint-btn {
          font-family: ${t.font};
          font-size: 12px;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 10px;
          transition: opacity 0.15s;
        }

        .leaderboard-btn {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          color: var(--panel-text);
          padding: 7px 14px;
        }

        .leaderboard-btn:hover { opacity: 0.85; }

        .hint-btn {
          background: var(--hint-bg);
          color: var(--hint-fg);
          border: none;
          padding: 7px 16px;
        }

        .hint-btn:disabled { opacity: 0.3; cursor: default; }
        .hint-btn:not(:disabled):hover { opacity: 0.85; }

        .modal-panel {
          width: min(92vw, 360px);
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 14px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          backdrop-filter: blur(10px);
        }

        .modal-panel h2 {
          font-family: ${t.font};
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--panel-title);
          font-weight: 400;
        }

        .leaderboard-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }

        .leaderboard-item {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,.015);
          border: 1px solid var(--panel-border);
          font-family: ${t.font};
          font-size: 12px;
        }

        .leaderboard-rank {
          color: var(--rank-accent);
          font-weight: 700;
        }

        .leaderboard-name {
          color: var(--panel-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .leaderboard-time {
          color: var(--panel-muted);
          font-variant-numeric: tabular-nums;
        }

        .leaderboard-empty {
          font-family: ${t.font};
          font-size: 12px;
          color: var(--panel-muted);
          text-align: center;
          padding: 12px 0;
        }

        .win-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          width: min(92vw, 360px);
        }

        .win-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 10px;
          padding: 12px 14px;
          font-family: ${t.font};
          font-size: 14px;
          color: var(--input-fg);
          letter-spacing: 0.06em;
          text-align: center;
          outline: none;
        }

        .win-input:focus {
          border-color: var(--select-ring);
        }

        .win-input::placeholder {
          color: var(--panel-muted);
        }

        .win-error {
          font-family: ${t.font};
          font-size: 11px;
          color: var(--lives);
          letter-spacing: 0.06em;
        }

        .win-success {
          font-family: ${t.font};
          font-size: 12px;
          color: var(--rank-accent);
          letter-spacing: 0.06em;
        }

        .overlay-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          max-width: 280px;
        }

        .overlay-btn-secondary {
          background: transparent;
          border: 1px solid var(--secondary-btn-border);
          color: var(--secondary-btn-fg);
        }

        .modal-close {
          align-self: flex-end;
          background: transparent;
          border: 1px solid var(--secondary-btn-border);
          color: var(--secondary-btn-fg);
          padding: 8px 16px;
          font-family: ${t.font};
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 10px;
        }

        .board-wrap {
          border: 2px solid var(--board-border);
          border-radius: 14px;
          overflow: hidden;
        }

        .board {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 0;
          width: 100%;
        }

        .cell {
          aspect-ratio: 1;
          width: 100%;
          text-align: center;
          border: none;
          outline: none;
          font-family: ${t.font};
          font-size: clamp(14px, 4vw, 20px);
          cursor: pointer;
          transition: background 0.1s;
          border-right: 1px solid var(--cell-border);
          border-bottom: 1px solid var(--cell-border);
          -webkit-appearance: none;
          appearance: none;
          padding: 0;
          caret-color: transparent;
        }

        .cell.b-right  { border-right: 2px solid var(--cell-border-thick); }
        .cell.b-bottom { border-bottom: 2px solid var(--cell-border-thick); }
        .cell.b-right-none  { border-right: none; }
        .cell.b-bottom-none { border-bottom: none; }

        .cell.selected { box-shadow: inset 0 0 0 2px var(--select-ring); z-index: 1; }
        .cell.peer { background: var(--peer-bg) !important; }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-4px); }
          40%     { transform: translateX(4px); }
          60%     { transform: translateX(-3px); }
          80%     { transform: translateX(3px); }
        }
        .shaking { animation: shake 0.4s ease; }

        .msg {
          font-size: 12px;
          letter-spacing: 0.1em;
          margin-top: 12px;
          height: 18px;
          text-align: center;
          font-family: ${t.font};
        }

        .reset-btn {
          margin-top: 14px;
          width: 100%;
          background: transparent;
          border: 1.5px solid var(--reset-border);
          color: var(--reset-fg);
          padding: 10px;
          font-family: ${t.font};
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 10px;
          transition: background 0.15s, color 0.15s;
        }
        .reset-btn:hover {
          background: var(--reset-hover-bg);
          color: var(--reset-hover-fg);
        }

        .numpad {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 6px;
          margin-top: 14px;
        }

        .numpad-btn {
          aspect-ratio: 1;
          background: var(--numpad-bg);
          border: 1.5px solid var(--numpad-border);
          border-radius: 10px;
          font-family: ${t.font};
          font-size: clamp(14px, 3.5vw, 18px);
          color: var(--numpad-fg);
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, color 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .numpad-btn:hover {
          background: var(--numpad-hover-bg);
          border-color: var(--numpad-hover-border);
        }
        .numpad-btn:active {
          background: var(--numpad-active-bg);
          color: var(--numpad-active-fg);
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: var(--overlay-bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          gap: 20px;
        }

        .overlay h1 {
          font-family: ${t.font};
          font-size: clamp(20px, 5vw, 28px);
          color: var(--overlay-title);
          letter-spacing: 0.08em;
          font-weight: 400;
        }

        .overlay button {
          background: var(--overlay-btn-bg);
          color: var(--overlay-btn-fg);
          border: none;
          padding: 12px 32px;
          font-family: ${t.font};
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 10px;
        }

        .overlay .sub {
          font-size: 13px;
          color: var(--overlay-sub);
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="sudoku-wrap" data-theme={theme}>
        <div className="sudoku-inner">

          <div className="sudoku-header">
            <div className="sudoku-header-left">
              <div className="sudoku-title-row">
                <div className="sudoku-title">sudoku</div>
                <div className="timer">{timerLabel}</div>
              </div>
              <div className="lives">{hearts}</div>
            </div>
            <div className="header-actions">
              <div className="header-actions-row">
                <label className="theme-switch">
                  <span className="theme-switch-label">light</span>
                  <input
                    type="checkbox"
                    checked={theme === "light"}
                    onChange={(e) => setTheme(e.target.checked ? "light" : "personal")}
                    aria-label="Light mode"
                  />
                  <span className="theme-switch-track" aria-hidden="true" />
                </label>
                <button type="button" className="leaderboard-btn" onClick={openLeaderboard}>
                  leaderboard
                </button>
              </div>
              <button
                className="hint-btn"
                onClick={useHint}
                disabled={hints <= 0 || gameOver || gameWon}
              >
                dica [{hints}]
              </button>
            </div>
          </div>

          <div className="board-wrap">
            <div className="board">
              {game.state.map((row, i) =>
                row.map((cellState, j) => {
                  const style = t.cell[cellState];
                  const isSelected = selected && selected[0] === i && selected[1] === j;
                  const isPeer = selected && !isSelected && (
                    selected[0] === i || selected[1] === j ||
                    (Math.floor(selected[0]/3) === Math.floor(i/3) && Math.floor(selected[1]/3) === Math.floor(j/3))
                  );
                  const isShaking = shake === `${i}-${j}`;
                  const isBRight = j === 2 || j === 5;
                  const isBBottom = i === 2 || i === 5;
                  const isLastCol = j === 8;
                  const isLastRow = i === 8;

                  let cls = "cell";
                  if (isBRight && !isLastCol) cls += " b-right";
                  if (isBBottom && !isLastRow) cls += " b-bottom";
                  if (isLastCol) cls += " b-right-none";
                  if (isLastRow) cls += " b-bottom-none";
                  if (isSelected) cls += " selected";
                  if (isPeer && !isSelected) cls += " peer";
                  if (isShaking) cls += " shaking";

                  return (
                    <input
                      key={`${i}-${j}`}
                      id={`cell-${i}-${j}`}
                      type="text"
                      inputMode="none"
                      readOnly
                      className={cls}
                      value={game.display[i][j] !== 0 ? String(game.display[i][j]) : ""}
                      style={{
                        background: isSelected ? t.selectedBg : isPeer ? undefined : style.bg,
                        color: style.color,
                        fontWeight: style.fontWeight,
                      }}
                      onFocus={() => handleCellActivate(i, j)}
                      onClick={() => handleCellActivate(i, j)}
                      onKeyDown={(e) => handleKeyDown(i, j, e)}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="numpad">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button
                key={n}
                className="numpad-btn"
                onClick={() => {
                  if (selected) handleInput(selected[0], selected[1], n);
                }}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="msg" style={{ color: msgColor }}>
            {msg}
          </div>

          <button className="reset-btn" onClick={reset}>
            reiniciar
          </button>

        </div>

        {gameOver && (
          <div className="overlay">
            <h1>game over</h1>
            <span className="sub">sem vidas restantes</span>
            <button onClick={reset}>recomeçar</button>
          </div>
        )}

        {gameWon && (
          <div className="overlay">
            <h1>você venceu</h1>
            <span className="sub">tempo — {formatTime(elapsed)}</span>
            <div className="win-form">
              {!scoreSaved ? (
                <>
                  <input
                    type="text"
                    className="win-input"
                    placeholder="teu nome"
                    maxLength={20}
                    value={winName}
                    onChange={(e) => setWinName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitScore()}
                    autoFocus
                  />
                  {scoreError && <span className="win-error">{scoreError}</span>}
                  <div className="overlay-actions">
                    <button
                      type="button"
                      onClick={submitScore}
                      disabled={!winName.trim() || scoreSaving}
                    >
                      {scoreSaving ? "salvando…" : "salvar no leaderboard"}
                    </button>
                    <button type="button" className="overlay-btn-secondary" onClick={reset}>
                      jogar sem salvar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="win-success">salvo no leaderboard</span>
                  <button type="button" onClick={reset}>jogar de novo</button>
                </>
              )}
            </div>
          </div>
        )}

        {showLeaderboard && (
          <div className="overlay" onClick={() => setShowLeaderboard(false)}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <h2>leaderboard</h2>
              {leaderboardLoading ? (
                <p className="leaderboard-empty">carregando…</p>
              ) : leaderboard.length === 0 ? (
                <p className="leaderboard-empty">ainda sem pontuações</p>
              ) : (
                <ol className="leaderboard-list">
                  {leaderboard.map((entry, index) => (
                    <li key={entry.id} className="leaderboard-item">
                      <span className="leaderboard-rank">{index + 1}</span>
                      <span className="leaderboard-name">{entry.name}</span>
                      <span className="leaderboard-time">{formatTime(entry.timeSeconds)}</span>
                    </li>
                  ))}
                </ol>
              )}
              <button type="button" className="modal-close" onClick={() => setShowLeaderboard(false)}>
                fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
