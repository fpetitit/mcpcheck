import { ensureSchema, getSql } from "./db";
import type { ScanResult } from "../mcp/types";

export interface ScanHistoryEntry {
  scannedAt: string;
  score: number;
  grade: ScanResult["grade"];
  result: ScanResult;
}

export async function getPreviousScan(target: string): Promise<ScanHistoryEntry | null> {
  const sql = getSql();
  if (!sql) return null;

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT scanned_at, score, grade, result
      FROM scans
      WHERE target = ${target}
      ORDER BY scanned_at DESC
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return {
      scannedAt: new Date(row.scanned_at as string).toISOString(),
      score: row.score as number,
      grade: row.grade as ScanResult["grade"],
      result: row.result as ScanResult,
    };
  } catch {
    // History is a nice-to-have layered on top of the core scan; a DB hiccup
    // should degrade to "no history available", not fail the whole scan.
    return null;
  }
}

export async function saveScan(result: ScanResult): Promise<void> {
  const sql = getSql();
  if (!sql) return;

  try {
    await ensureSchema();
    await sql`
      INSERT INTO scans (target, scanned_at, score, grade, result)
      VALUES (${result.target}, ${result.finishedAt}, ${result.score}, ${result.grade}, ${JSON.stringify(result)})
    `;
  } catch {
    // Best-effort: a failed write shouldn't surface as a scan failure.
  }
}

export interface RecentScanEntry {
  target: string;
  scannedAt: string;
  score: number;
  grade: ScanResult["grade"];
}

export async function getRecentScans(limit = 50): Promise<RecentScanEntry[]> {
  const sql = getSql();
  if (!sql) return [];

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT target, scanned_at, score, grade
      FROM scans
      ORDER BY scanned_at DESC
      LIMIT ${limit}
    `;
    return rows.map((row) => ({
      target: row.target as string,
      scannedAt: new Date(row.scanned_at as string).toISOString(),
      score: row.score as number,
      grade: row.grade as ScanResult["grade"],
    }));
  } catch {
    return [];
  }
}

export async function getScanHistory(target: string, limit = 20): Promise<ScanHistoryEntry[]> {
  const sql = getSql();
  if (!sql) return [];

  try {
    await ensureSchema();
    const rows = await sql`
      SELECT scanned_at, score, grade, result
      FROM scans
      WHERE target = ${target}
      ORDER BY scanned_at DESC
      LIMIT ${limit}
    `;
    return rows.map((row) => ({
      scannedAt: new Date(row.scanned_at as string).toISOString(),
      score: row.score as number,
      grade: row.grade as ScanResult["grade"],
      result: row.result as ScanResult,
    }));
  } catch {
    return [];
  }
}
