export type ParsedLine = {
  kind: "diesel" | "casualLabor" | "pieceWork" | "chemicals";
  amount: number;
  raw: string;
};

export type ParsedCosts = {
  diesel: number;
  casualLabor: number;
  pieceWork: number;
  chemicals: number;
  lines: ParsedLine[];
};

export const DIESEL_RATE_PER_L = 197;

const empty = (): ParsedCosts => ({
  diesel: 0,
  casualLabor: 0,
  pieceWork: 0,
  chemicals: 0,
  lines: [],
});

/**
 * Parse a free-text requirement block into cost categories.
 *
 * Recognises (case-insensitive, en/em-dashes are normalised):
 *   • Diesel       — "Diesel - 5 litres @197/="
 *   • Casual labor — "Labor - 4 casuals @400/-"
 *   • Piece work   — "Piece Work 52 drip beds @ 100/-"
 *   • Chemicals    — "Agrichemicals @ 2000/-"
 *
 * Lines that don't match are ignored (free text remarks).
 */
export function parseRequirements(text: string): ParsedCosts {
  const out = empty();
  if (!text) return out;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/[‐-―]/g, "-").trim();
    if (!line) continue;

    // Piece work — must run before generic patterns since it has a qty + rate.
    let m = line.match(/piece\s*work\b[^@]*?(\d+(?:\.\d+)?)\s*[a-z][^@]*?@\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const amount = parseFloat(m[1]) * parseFloat(m[2]);
      out.pieceWork += amount;
      out.lines.push({ kind: "pieceWork", amount, raw: rawLine });
      continue;
    }

    // Diesel — "Diesel ... 5 litres @ 197/="
    m = line.match(/diesel[^@]*?(\d+(?:\.\d+)?)\s*l(?:itres?|tr|s)?\b[^@]*?@\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const amount = parseFloat(m[1]) * parseFloat(m[2]);
      out.diesel += amount;
      out.lines.push({ kind: "diesel", amount, raw: rawLine });
      continue;
    }

    // Casual labor — "... 4 casuals @ 400/-"
    m = line.match(/(\d+)\s*casuals?\b[^@]*?@\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const amount = parseFloat(m[1]) * parseFloat(m[2]);
      out.casualLabor += amount;
      out.lines.push({ kind: "casualLabor", amount, raw: rawLine });
      continue;
    }

    // Chemicals — "Agrichemicals @ 2000/-" (also matches "Chemicals @ ...")
    m = line.match(/(?:agri-?)?chemicals?\b[^@]*?@\s*(\d+(?:\.\d+)?)/i);
    if (m) {
      const amount = parseFloat(m[1]);
      out.chemicals += amount;
      out.lines.push({ kind: "chemicals", amount, raw: rawLine });
      continue;
    }
  }

  return out;
}

export function sumPlanCosts(
  parsed: ParsedCosts[],
  transportSupervision: number
): {
  diesel: number;
  casualLabor: number;
  pieceWork: number;
  chemicals: number;
  transport: number;
  total: number;
} {
  const diesel = parsed.reduce((a, p) => a + p.diesel, 0);
  const casualLabor = parsed.reduce((a, p) => a + p.casualLabor, 0);
  const pieceWork = parsed.reduce((a, p) => a + p.pieceWork, 0);
  const chemicals = parsed.reduce((a, p) => a + p.chemicals, 0);
  const transport = transportSupervision || 0;
  return {
    diesel,
    casualLabor,
    pieceWork,
    chemicals,
    transport,
    total: diesel + casualLabor + pieceWork + chemicals + transport,
  };
}
