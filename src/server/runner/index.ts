/**
 * Sandboxed code-execution abstraction (BUILD_SPEC §6.8.2).
 *
 * SECURITY: untrusted student code is NEVER executed in the app process or on
 * the app host. It always runs on an external, isolated sandbox:
 *   - wandbox  — public isolated sandbox, no key (default; great for launch/dev)
 *   - judge0   — Judge0 CE via RapidAPI (set JUDGE0_RAPIDAPI_KEY) — production
 *   - piston   — self-hosted Piston instance (set PISTON_URL) — production
 * Choose with RUNNER_PROVIDER. All providers enforce CPU/time limits and we cap
 * output size here as a second line of defense.
 */

export type Language = "python" | "javascript";

type LangCfg = {
  label: string;
  monaco: string;
  wandbox: string;
  judge0: number;
  piston: { lang: string; version: string };
};

/** Config-driven language map (§6.8.2 — add more here). */
export const LANGUAGES: Record<Language, LangCfg> = {
  python: {
    label: "Python",
    monaco: "python",
    wandbox: "cpython-3.12.7",
    judge0: 71,
    piston: { lang: "python", version: "3.10.0" },
  },
  javascript: {
    label: "JavaScript",
    monaco: "javascript",
    wandbox: "nodejs-20.17.0",
    judge0: 63,
    piston: { lang: "javascript", version: "18.15.0" },
  },
};

export function isLanguage(x: unknown): x is Language {
  return x === "python" || x === "javascript";
}

export type RunResult = {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  timeMs: number | null;
  provider: string;
};

const MAX_OUTPUT = 12_000; // hard output cap (chars) — defense in depth
const RUN_TIMEOUT_MS = 10_000;
const MAX_SOURCE = 50_000;

function cap(s: string): string {
  if (!s) return "";
  return s.length > MAX_OUTPUT ? s.slice(0, MAX_OUTPUT) + "\n…(output truncated)" : s;
}

function resolveProvider(): "wandbox" | "judge0" | "piston" {
  const p = (process.env.RUNNER_PROVIDER ?? "").toLowerCase();
  if (p === "judge0" && process.env.JUDGE0_RAPIDAPI_KEY) return "judge0";
  if (p === "piston" && process.env.PISTON_URL) return "piston";
  if (p === "wandbox") return "wandbox";
  // Auto: prefer a configured production runner, else the no-key default.
  if (process.env.JUDGE0_RAPIDAPI_KEY) return "judge0";
  if (process.env.PISTON_URL) return "piston";
  return "wandbox";
}

/** Run a single program with optional stdin on the configured sandbox. */
export async function runCode(opts: {
  language: Language;
  source: string;
  stdin?: string;
  timeoutMs?: number;
}): Promise<RunResult> {
  const source = (opts.source ?? "").slice(0, MAX_SOURCE);
  const stdin = opts.stdin ?? "";
  const provider = resolveProvider();
  const started = Date.now();
  const call = () =>
    provider === "judge0"
      ? runJudge0(opts.language, source, stdin)
      : provider === "piston"
        ? runPiston(opts.language, source, stdin)
        : runWandbox(opts.language, source, stdin);

  // Retry transient runner errors (429 / 5xx / network) with backoff — public
  // sandboxes throttle under bursts (e.g. grading many tests in a row).
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await sleep(400 * attempt);
    try {
      const r = await call();
      return {
        stdout: cap(r.stdout),
        stderr: cap(r.stderr),
        exitCode: r.exitCode,
        timeMs: r.timeMs ?? Date.now() - started,
        provider,
      };
    } catch (err) {
      lastErr = err;
    }
  }
  return {
    stdout: "",
    stderr: `Runner error: ${String(lastErr).slice(0, 300)}`,
    exitCode: null,
    timeMs: Date.now() - started,
    provider,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ───────────────────────────── Wandbox ─────────────────────────────
async function runWandbox(language: Language, code: string, stdin: string) {
  const res = await fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(RUN_TIMEOUT_MS + 5_000),
    body: JSON.stringify({ code, compiler: LANGUAGES[language].wandbox, stdin }),
  });
  if (!res.ok) throw new Error(`wandbox ${res.status}`);
  const j = (await res.json()) as {
    program_output?: string;
    program_error?: string;
    compiler_error?: string;
    status?: string;
  };
  const stderr = [j.compiler_error, j.program_error].filter(Boolean).join("\n");
  return {
    stdout: j.program_output ?? "",
    stderr: stderr,
    exitCode: j.status != null ? Number(j.status) : null,
    timeMs: null,
  };
}

// ───────────────────────────── Judge0 (RapidAPI) ─────────────────────────────
async function runJudge0(language: Language, code: string, stdin: string) {
  const host = process.env.JUDGE0_RAPIDAPI_HOST ?? "judge0-ce.p.rapidapi.com";
  const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
  const unb64 = (s?: string | null) => (s ? Buffer.from(s, "base64").toString("utf8") : "");
  const res = await fetch(`https://${host}/submissions?base64_encoded=true&wait=true`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.JUDGE0_RAPIDAPI_KEY ?? "",
      "X-RapidAPI-Host": host,
    },
    signal: AbortSignal.timeout(RUN_TIMEOUT_MS + 10_000),
    body: JSON.stringify({
      language_id: LANGUAGES[language].judge0,
      source_code: b64(code),
      stdin: b64(stdin),
      cpu_time_limit: 8,
      memory_limit: 128_000,
    }),
  });
  if (!res.ok) throw new Error(`judge0 ${res.status}`);
  const j = (await res.json()) as {
    stdout?: string;
    stderr?: string;
    compile_output?: string;
    time?: string;
    exit_code?: number;
  };
  const stderr = [unb64(j.compile_output), unb64(j.stderr)].filter(Boolean).join("\n");
  return {
    stdout: unb64(j.stdout),
    stderr,
    exitCode: j.exit_code ?? null,
    timeMs: j.time ? Math.round(Number(j.time) * 1000) : null,
  };
}

// ───────────────────────────── Piston (self-hosted) ─────────────────────────────
let pistonVersions: Record<string, string> | null = null;
async function pistonVersion(lang: string, base: string): Promise<string> {
  if (!pistonVersions) {
    const res = await fetch(`${base}/api/v2/runtimes`, { signal: AbortSignal.timeout(8_000) });
    const runtimes = (await res.json()) as { language: string; aliases: string[]; version: string }[];
    pistonVersions = {};
    for (const rt of runtimes) {
      pistonVersions[rt.language] = rt.version;
      for (const a of rt.aliases ?? []) pistonVersions[a] = rt.version;
    }
  }
  return pistonVersions[lang] ?? "*";
}

async function runPiston(language: Language, code: string, stdin: string) {
  const base = (process.env.PISTON_URL ?? "").replace(/\/$/, "");
  const cfg = LANGUAGES[language].piston;
  const version = await pistonVersion(cfg.lang, base);
  const res = await fetch(`${base}/api/v2/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(RUN_TIMEOUT_MS + 5_000),
    body: JSON.stringify({
      language: cfg.lang,
      version,
      files: [{ content: code }],
      stdin,
      run_timeout: 8_000,
      compile_timeout: 8_000,
    }),
  });
  if (!res.ok) throw new Error(`piston ${res.status}`);
  const j = (await res.json()) as {
    run?: { stdout?: string; stderr?: string; code?: number | null; signal?: string };
  };
  return {
    stdout: j.run?.stdout ?? "",
    stderr: j.run?.stderr ?? "",
    exitCode: j.run?.code ?? null,
    timeMs: null,
  };
}

// ───────────────────────────── Grading ─────────────────────────────
export type TestCase = { name?: string; input?: string; expected: string; hidden?: boolean };
export type CaseResult = { name: string; passed: boolean; hidden: boolean };
export type GradeResult = {
  results: CaseResult[];
  passedCount: number;
  totalCount: number;
  passed: boolean;
  lastRun: RunResult; // the run for the first failing (or last) case — for the console
};

function norm(s: string): string {
  return (s ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim();
}

/** Run the program against each test case (stdin → expected stdout). */
export async function gradeExercise(opts: {
  language: Language;
  source: string;
  tests: TestCase[];
}): Promise<GradeResult> {
  const tests = opts.tests.slice(0, 12); // concurrency/abuse cap
  const results: CaseResult[] = [];
  let passedCount = 0;
  let lastRun: RunResult | null = null;
  let firstFailRun: RunResult | null = null;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    if (i > 0) await sleep(250); // be gentle on rate-limited public sandboxes
    const run = await runCode({ language: opts.language, source: opts.source, stdin: t.input ?? "" });
    lastRun = run;
    const ok = run.exitCode === 0 && norm(run.stdout) === norm(t.expected);
    if (ok) passedCount++;
    else if (!firstFailRun) firstFailRun = run;
    results.push({ name: t.name ?? `Test ${i + 1}`, passed: ok, hidden: !!t.hidden });
  }

  return {
    results,
    passedCount,
    totalCount: tests.length,
    passed: tests.length > 0 && passedCount === tests.length,
    lastRun: firstFailRun ?? lastRun ?? { stdout: "", stderr: "", exitCode: null, timeMs: null, provider: resolveProvider() },
  };
}
