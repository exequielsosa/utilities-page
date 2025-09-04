/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

// Fuerzo runtime Node en Next Pages (evita Edge runtimes que pueden
// bloquear fetch cross-origin en local)
export const config = { runtime: "nodejs"};

type Point = { date: string; value: number };
type Out = {
  slug: string;
  frequency: "daily";
  points: Point[];
  lastUpdated: string | null;
  source: string;
};

const CACHE: Record<string, { ts: number; data: Out }> = {};
const TTL_MS = 6 * 60 * 60 * 1000; // 6 h
const SOURCE = "https://apis.datos.gob.ar/series/api";

// ✅ IDs fijos (estables) para no depender de búsquedas
const FIXED_IDS: Record<"uva" | "cer", string> = {
  uva: "94.2_UVAD_D_0_0_10",
  cer: "94.2_CD_D_0_0_10",
};

// --- utils ---
function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function safeFetchJson(url: string) {
  const r = await fetch(url, {
    headers: {
      "User-Agent": "utilities-page/1.0 (+localdev)",
      Accept: "application/json",
    },
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(
      `HTTP ${r.status} ${r.statusText} for ${url} — body: ${text.slice(
        0,
        200
      )}`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `JSON parse error for ${url} — body: ${text.slice(0, 200)}`
    );
  }
}

// Descarga y normaliza puntos (hoy la API entrega top-level "data")
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function fetchSeriesPoints(id: string, _startISO: string): Promise<Point[]> {
  // convierte número o string con coma a number
  const toNum = (v: any): number => {
    if (v == null) return NaN;
    if (typeof v === "number") return v;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  };

  // Pedimos últimos N puntos en formato estable "values"
  const url = `${SOURCE}/series?ids=${encodeURIComponent(
    id
  )}&format=json&representation=values&last=1200`;
  const j = await safeFetchJson(url);

  let points: Point[] = [];

  // ✅ Caso actual: top-level data: [ [date, value], ... ]
  if (Array.isArray(j?.data)) {
    points = j.data
      .filter((row: any) => Array.isArray(row) && row.length >= 2)
      .map((row: any[]) => ({ date: String(row[0]), value: toNum(row[1]) }))
      .filter((p: { value: unknown; }) => Number.isFinite(p.value));
  }

  // Fallbacks por si algún día vuelven a "series[...]"
  if (!points.length && Array.isArray(j?.series)) {
    const s = j.series[0];
    if (Array.isArray(s?.index) && Array.isArray(s?.values)) {
      points = s.index
        .map((d: any, i: number) => ({
          date: String(d),
          value: toNum(s.values[i]),
        }))
        .filter((p: { value: unknown; }) => Number.isFinite(p.value));
    } else if (Array.isArray(s?.data)) {
      points = s.data
        .filter((row: any) => Array.isArray(row) && row.length >= 2)
        .map((row: any[]) => ({ date: String(row[0]), value: toNum(row[1]) }))
        .filter((p: { value: unknown; }) => Number.isFinite(p.value));
    } else if (Array.isArray(s?.index) && Array.isArray(s?.serie)) {
      points = s.index
        .map((d: any, i: number) => ({
          date: String(d),
          value: toNum(s.serie[i]),
        }))
        .filter((p: { value: unknown; }) => Number.isFinite(p.value));
    }
  }

  return points;
}

async function searchCandidates(term: string) {
  const url = `${SOURCE}/search?q=${encodeURIComponent(term)}&limit=100`;
  const j = await safeFetchJson(url);
  return Array.isArray(j?.results) ? j.results : [];
}

async function resolveSeriesId(
  slug: "uva" | "cer",
  explicitId?: string
): Promise<{ id: string | null; candidates?: any[] }> {
  // 1) Permitir override manual por query (?id=...)
  if (explicitId) return { id: explicitId };

  // 2) Usar IDs fijos (recomendado)
  if (FIXED_IDS[slug]) return { id: FIXED_IDS[slug] };

  // 3) .env como alternativa
  const envId =
    slug === "uva" ? process.env.SERIES_ID_UVA : process.env.SERIES_ID_CER;
  if (envId) return { id: envId };

  // 4) Búsqueda amplia (backup)
  const term = slug.toUpperCase();
  const results = await searchCandidates(term);

  const matches = results.filter((s: any) => {
    const title = `${s?.title || ""} ${s?.field_name || ""} ${s?.description || ""}`;
    return new RegExp(term, "i").test(title);
  });

  const isDaily = (p?: string) =>
    typeof p === "string" && /diari|daily|día/i.test(p);
  const daily = matches.find(
    (m: any) => isDaily(m?.periodicity || m?.frequency)
  );

  if (daily?.id) return { id: daily.id };
  if (matches[0]?.id) return { id: matches[0].id };

  return {
    id: null,
    candidates: results.slice(0, 15).map((it: any) => ({
      id: it?.id,
      title: it?.title,
      dataset: it?.dataset_title,
      periodicity: it?.periodicity || it?.frequency,
    })),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const slug = String(req.query.slug || "").toLowerCase();
  if (!["uva", "cer"].includes(slug)) {
    res.status(400).json({ error: "slug must be 'uva' or 'cer'" });
    return;
  }

  // cache server-side
  const hit = CACHE[slug];
  if (hit && Date.now() - hit.ts < TTL_MS) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400"
    );
    res.status(200).json(hit.data);
    return;
  }

  try {
    const explicitId =
      typeof req.query.id === "string" ? req.query.id : undefined;
    const { id, candidates } = await resolveSeriesId(
      slug as "uva" | "cer",
      explicitId
    );

    if (!id) {
      res.status(502).json({
        error: `No se encontró un ID para ${slug.toUpperCase()}. Probá con uno de estos en ?id=...`,
        candidates,
      });
      return;
    }

    const start = daysAgoISO(400); // hoy no se usa, pero lo dejamos para futuras mejoras
    const points = await fetchSeriesPoints(id, start);

    const out: Out = {
      slug,
      frequency: "daily",
      points: points.sort((a, b) => a.date.localeCompare(b.date)),
      lastUpdated: points.length ? points[points.length - 1].date : null,
      source: SOURCE + ` (id=${id})`,
    };

    CACHE[slug] = { ts: Date.now(), data: out };
    res.setHeader(
      "Cache-Control",
      "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400"
    );
    res.status(200).json(out);
  } catch (e: any) {
    console.error("[/api/series]", e);
    res.status(500).json({ error: e?.message || "unknown" });
  }
}
