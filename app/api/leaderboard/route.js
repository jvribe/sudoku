import { NextResponse } from "next/server";
import { addScore, getLeaderboard } from "@/lib/leaderboard";

const NAME_RE = /^[\p{L}\p{N}\s._-]{1,20}$/u;

export async function GET() {
  try {
    const scores = await getLeaderboard();
    return NextResponse.json({ scores });
  } catch {
    return NextResponse.json({ scores: [] });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const timeSeconds = Number(body.timeSeconds);

    if (!NAME_RE.test(name)) {
      return NextResponse.json(
        { error: "Nome inválido (1–20 caracteres)." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(timeSeconds) || timeSeconds < 1 || timeSeconds > 86400) {
      return NextResponse.json(
        { error: "Tempo inválido." },
        { status: 400 }
      );
    }

    const entry = await addScore({ name, timeSeconds });
    return NextResponse.json({ entry });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar a pontuação." },
      { status: 500 }
    );
  }
}
