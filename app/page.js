"use client";

import React, { useState, useCallback, useEffect } from "react";

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
  const state = Array.from({ length: 9 }, () => Array(9).fill("empty")); // "empty"|"fixed"|"correct"|"wrong"|"hint"
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

  // fixed cells
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++)
      if (fixed[i][j]) { state[i][j] = "fixed"; display[i][j] = solution[i][j]; }

  return { solution, board, fixed, state, display };
}

const FONT = "'DM Mono', 'Courier New', monospace";

const CELL_STYLES = {
  fixed:   { bg: "#f5f5f0", color: "#1a1a1a", fontWeight: "600" },
  empty:   { bg: "#ffffff", color: "#1a1a1a", fontWeight: "400" },
  correct: { bg: "#ffffff", color: "#1a1a1a", fontWeight: "500" },
  wrong:   { bg: "#fff0f0", color: "#c0392b", fontWeight: "500" },
  hint:    { bg: "#f0faf4", color: "#1e7a45", fontWeight: "500" },
};

export default function Sudoku() {
  const [game, setGame] = useState(() => generateGame());
  const [lives, setLives] = useState(3);
  const [hints, setHints] = useState(3);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("neutral"); // "neutral"|"error"|"success"
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [selected, setSelected] = useState(null);
  const [shake, setShake] = useState(null); // "r-c" key

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
  }, []);

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
      if (newLives <= 0) { setGameOver(true); }
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

  // focus selected cell
  useEffect(() => {
    if (selected) {
      const el = document.getElementById(`cell-${selected[0]}-${selected[1]}`);
      if (el) el.focus();
    }
  }, [selected]);

  const hearts = lives >= 3 ? "❤ ❤ ❤" : lives === 2 ? "❤ ❤ ♡" : lives === 1 ? "❤ ♡ ♡" : "♡ ♡ ♡";

  const msgColor = msgType === "error" ? "#c0392b" : msgType === "success" ? "#1e7a45" : "#888";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f9f9f7;
          font-family: ${FONT};
          min-height: 100vh;
        }

        .sudoku-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: #f9f9f7;
        }

        .sudoku-inner {
          width: 100%;
          max-width: min(96vw, 480px);
        }

        .sudoku-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .sudoku-title {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #aaa;
          font-family: ${FONT};
        }

        .lives {
          font-size: 13px;
          color: #c0392b;
          letter-spacing: 0.12em;
          font-family: ${FONT};
        }

        .hint-btn {
          background: #1a1a1a;
          color: #f9f9f7;
          border: none;
          padding: 7px 16px;
          font-family: ${FONT};
          font-size: 12px;
          letter-spacing: 0.08em;
          cursor: pointer;
          border-radius: 2px;
          transition: opacity 0.15s;
        }

        .hint-btn:disabled { opacity: 0.3; cursor: default; }
        .hint-btn:not(:disabled):hover { opacity: 0.75; }

        .board-wrap {
          border: 2px solid #1a1a1a;
          border-radius: 2px;
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
          font-family: ${FONT};
          font-size: clamp(14px, 4vw, 20px);
          cursor: pointer;
          transition: background 0.1s;
          border-right: 1px solid #ddd;
          border-bottom: 1px solid #ddd;
          -webkit-appearance: none;
          appearance: none;
          padding: 0;
          caret-color: transparent;
        }

        .cell:last-child { border-right: none; }

        .cell.b-right  { border-right: 2px solid #1a1a1a; }
        .cell.b-bottom { border-bottom: 2px solid #1a1a1a; }
        .cell.b-right-none  { border-right: none; }
        .cell.b-bottom-none { border-bottom: none; }

        .cell.selected { box-shadow: inset 0 0 0 2px #1a1a1a; z-index: 1; }
        .cell.peer     { background: #f0efe8 !important; }

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
          font-family: ${FONT};
        }

        .reset-btn {
          margin-top: 14px;
          width: 100%;
          background: transparent;
          border: 1.5px solid #1a1a1a;
          color: #1a1a1a;
          padding: 10px;
          font-family: ${FONT};
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.15s, color 0.15s;
        }
        .reset-btn:hover { background: #1a1a1a; color: #f9f9f7; }

        .numpad {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 6px;
          margin-top: 14px;
        }

        .numpad-btn {
          aspect-ratio: 1;
          background: #fff;
          border: 1.5px solid #ddd;
          border-radius: 2px;
          font-family: ${FONT};
          font-size: clamp(14px, 3.5vw, 18px);
          color: #1a1a1a;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .numpad-btn:hover { background: #f0efe8; border-color: #1a1a1a; }
        .numpad-btn:active { background: #1a1a1a; color: #f9f9f7; }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(249,249,247,0.97);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100;
          gap: 20px;
        }

        .overlay h1 {
          font-family: ${FONT};
          font-size: clamp(20px, 5vw, 28px);
          color: #1a1a1a;
          letter-spacing: 0.08em;
          font-weight: 400;
        }

        .overlay button {
          background: #1a1a1a;
          color: #f9f9f7;
          border: none;
          padding: 12px 32px;
          font-family: ${FONT};
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 2px;
        }

        .overlay .sub {
          font-size: 13px;
          color: #aaa;
          letter-spacing: 0.08em;
        }
      `}</style>

      <div className="sudoku-wrap">
        <div className="sudoku-inner">

          {/* HEADER */}
          <div className="sudoku-header">
            <div>
              <div className="sudoku-title">sudoku</div>
              <div className="lives">{hearts}</div>
            </div>
            <button
              className="hint-btn"
              onClick={useHint}
              disabled={hints <= 0 || gameOver || gameWon}
            >
              dica [{hints}]
            </button>
          </div>

          {/* BOARD */}
          <div className="board-wrap">
            <div className="board">
              {game.state.map((row, i) =>
                row.map((cellState, j) => {
                  const style = CELL_STYLES[cellState];
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
                        background: isSelected ? "#fffde8" : isPeer ? undefined : style.bg,
                        color: style.color,
                        fontWeight: style.fontWeight,
                      }}
                      onFocus={() => setSelected([i, j])}
                      onClick={() => setSelected([i, j])}
                      onKeyDown={(e) => handleKeyDown(i, j, e)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* NUMPAD — mobile friendly */}
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

          {/* MSG */}
          <div className="msg" style={{ color: msgColor }}>
            {msg}
          </div>

          {/* RESET */}
          <button className="reset-btn" onClick={reset}>
            reiniciar
          </button>

        </div>
      </div>

      {/* GAME OVER */}
      {gameOver && (
        <div className="overlay">
          <h1>game over</h1>
          <span className="sub">sem vidas restantes</span>
          <button onClick={reset}>recomeçar</button>
        </div>
      )}

      {/* WIN */}
      {gameWon && (
        <div className="overlay">
          <h1>você venceu</h1>
          <span className="sub">tabuleiro completo</span>
          <button onClick={reset}>jogar de novo</button>
        </div>
      )}
    </>
  );
}