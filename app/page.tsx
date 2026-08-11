"use client";

import { useState } from "react";

type Detection = {
  verdict: "valid" | "gibberish";
  reason: string;
};

const KNOWN_TERMS = [
  "c",
  "r",
  "go",
  "c++",
  "c#",
  ".net",
  "dbt",
  "k8s",
  "ai",
  "ml",
  "nlp",
  "llm",
  "ui",
  "ux",
  "qa",
  "api",
  "rest",
  "sql",
  "nosql",
  "sap",
  "erp",
  "aws",
  "gcp",
  "azure",
  "java",
  "javascript",
  "typescript",
  "python",
  "kotlin",
  "swift",
  "rust",
  "ruby",
  "php",
  "scala",
  "golang",
  "react",
  "angular",
  "vue",
  "svelte",
  "node",
  "node.js",
  "spring",
  "django",
  "flask",
  "laravel",
  "kubernetes",
  "docker",
  "terraform",
  "ansible",
  "jenkins",
  "github",
  "gitlab",
  "postgresql",
  "mysql",
  "mongodb",
  "redis",
  "elasticsearch",
  "kafka",
  "graphql",
  "microservices",
  "devops",
  "security",
  "cybersecurity",
  "accounting",
  "marketing",
  "sales",
  "recruitment",
  "finance",
  "engineering",
  "developer",
  "designer",
  "manager",
  "consultant",
  "analyst",
  "architect",
  "administrator",
  "software engineer",
  "backend developer",
  "frontend developer",
  "full stack developer",
  "data scientist",
  "data engineer",
  "product manager",
  "project manager",
  "business analyst",
  "machine learning",
  "artificial intelligence",
  "cloud computing",
  "container orchestration",
];

const COMMON_WORDS = [
  // English
  "about", "animal", "answer", "apple", "application", "beautiful",
  "bicycle", "book", "bread", "business", "candidate", "change", "city",
  "coffee", "communication", "country", "customer", "development", "door",
  "education", "experience", "family", "flower", "food", "friend", "garden",
  "happy", "hello", "house", "information", "language", "leadership",
  "learning", "management", "morning", "mountain", "music", "network",
  "operations", "orange", "people", "platform", "product", "question",
  "research", "river", "school", "service", "solution", "strategy", "street",
  "support", "system", "table", "technology", "testing", "travel", "tree",
  "university", "water", "weather", "window", "world", "web",
  // Dutch
  "administratie", "advies", "bedrijf", "communicatie", "ervaring",
  "financieel", "informatie", "klant", "management", "netwerk",
  "onderzoek", "ontwikkeling", "opleiding", "project", "software",
  "techniek", "verkoop", "zorg",
  // French
  "administration", "analyse", "commerce", "communication", "conseil",
  "développement", "expérience", "formation", "gestion", "informatique",
  "ingénieur", "logiciel", "projet", "recherche", "réseau", "service",
  "système", "technologie", "vente",
  // German, Spanish, Italian and Portuguese samples
  "beratung", "entwicklung", "erfahrung", "geschäft", "informatik",
  "ingenieur", "projekt", "softwareentwicklung", "verwaltung",
  "desarrollo", "experiencia", "gestión", "ingeniería", "negocio",
  "proyecto", "servicio", "tecnología", "amministrazione", "esperienza",
  "gestione", "ingegneria", "progetto", "sviluppo", "experiência",
  "gestão", "negócio", "serviço",
];

const known = new Set([...KNOWN_TERMS, ...COMMON_WORDS].map(normalize));
const trainingTokens = [...KNOWN_TERMS, ...COMMON_WORDS]
  .flatMap((term) => normalize(term).split(/[^\p{L}\p{N}]+/u))
  .filter(Boolean)
  .map(latinFold);
const bigrams = buildNgrams(trainingTokens, 2);
const trigrams = buildNgrams(trainingTokens, 3);

function normalize(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().trim().replace(/\s+/g, " ");
}

function latinFold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function buildNgrams(words: string[], size: number) {
  const values = new Set<string>();
  for (const word of words) {
    const padded = `^${word}$`;
    for (let index = 0; index <= padded.length - size; index += 1) {
      values.add(padded.slice(index, index + size));
    }
  }
  return values;
}

function ngramRatio(token: string, size: number, model: Set<string>) {
  const padded = `^${latinFold(token)}$`;
  let seen = 0;
  let total = 0;
  for (let index = 0; index <= padded.length - size; index += 1) {
    total += 1;
    if (model.has(padded.slice(index, index + size))) seen += 1;
  }
  return total === 0 ? 0 : seen / total;
}

function plausibility(token: string) {
  return ngramRatio(token, 2, bigrams) * 0.45
    + ngramRatio(token, 3, trigrams) * 0.55;
}

function looksRepeated(value: string) {
  const compact = value.replace(/[^\p{L}\p{N}]/gu, "");
  return /(.)\1{3,}/u.test(compact)
    || /^(.{1,5})\1{2,}$/u.test(compact);
}

function looksLikeKeyboardNoise(value: string) {
  const compact = latinFold(value).replace(/[^a-z0-9]/g, "");
  return [
    "qwerty", "ytrewq", "asdf", "fdsa", "zxcv", "vcxz",
    "qazwsx", "poiuy", "lkjh", "mnbv", "123456", "abcdef",
  ].some((sequence) => compact.includes(sequence));
}

function longestConsonantRun(value: string) {
  const runs = latinFold(value).match(/[bcdfghjklmnpqrstvwxyz]+/g) ?? [];
  return Math.max(0, ...runs.map((run) => run.length));
}

export function detect(value: string): Detection {
  const normalized = normalize(value);
  if (!normalized || !/[\p{L}\p{N}]/u.test(normalized)) {
    return { verdict: "gibberish", reason: "It contains no letters or numbers." };
  }

  if (known.has(normalized)) {
    return { verdict: "valid", reason: "It is a recognised word or term." };
  }

  if (looksRepeated(normalized) || looksLikeKeyboardNoise(normalized)) {
    return { verdict: "gibberish", reason: "It looks like a repeated or keyboard pattern." };
  }

  const letters = [...normalized].filter((character) => /\p{L}/u.test(character));
  const latinLetters = letters.filter((character) => /\p{Script=Latin}/u.test(character));
  if (letters.length > 0 && latinLetters.length / letters.length < 0.7) {
    return {
      verdict: "valid",
      reason: "Non-Latin text is accepted conservatively to avoid language bias.",
    };
  }

  const tokens = normalized
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter(Boolean);
  const meaningfulTokens = tokens.filter((token) => /\p{L}/u.test(token));
  if (meaningfulTokens.length === 0) {
    return { verdict: "gibberish", reason: "It does not contain a meaningful word." };
  }

  const tokenScores = meaningfulTokens.map((token) => {
    if (known.has(token)) return 1;
    return plausibility(token);
  });
  const weightedScore = tokenScores.reduce((total, score, index) => (
    total + score * Math.max(1, meaningfulTokens[index].length)
  ), 0) / meaningfulTokens.reduce((total, token) => total + Math.max(1, token.length), 0);
  const longestToken = Math.max(...meaningfulTokens.map((token) => token.length));
  const suspiciousConsonants = longestConsonantRun(normalized) >= 7;
  const lowestSubstantialTokenScore = Math.min(
    ...meaningfulTokens
      .filter((token) => token.length >= 4)
      .map((token) => known.has(token) ? 1 : plausibility(token)),
    1,
  );

  if ((longestToken >= 4 && weightedScore < 0.2)
      || (longestToken >= 7 && weightedScore < 0.34)
      || (lowestSubstantialTokenScore < 0.16)
      || (suspiciousConsonants && weightedScore < 0.58)) {
    return {
      verdict: "gibberish",
      reason: "Its character combinations are very unlikely in supported Latin languages.",
    };
  }

  return {
    verdict: "valid",
    reason: known.has(normalized)
      ? "It is a recognised word or term."
      : "It looks like a plausible word or phrase.",
  };
}

const examples = ["Bicycle", "Bonjour", "こんにちは", "fskjhsfskjdfh"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Detection | null>(null);

  function tryExample(example: string) {
    setQuery(example);
    setResult(detect(example));
  }

  return (
    <main>
      <section className="detector" aria-labelledby="page-title">
        <h1 id="page-title">Gibberish Detector</h1>
        <p className="intro">Enter any word or phrase.</p>

        <div>
          <label htmlFor="query">Query</label>
          <input
            id="query"
            value={query}
            onChange={(event) => {
              const value = event.target.value;
              setQuery(value);
              setResult(value.trim() ? detect(value) : null);
            }}
            placeholder="Start typing..."
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="examples" aria-label="Example queries">
          {examples.map((example) => (
            <button key={example} type="button" onClick={() => tryExample(example)}>
              {example}
            </button>
          ))}
        </div>

        <div className={`result ${result ? result.verdict : "empty"}`} aria-live="polite">
          {result ? (
            <>
              <strong>{result.verdict === "valid" ? "Looks valid" : "Looks like gibberish"}</strong>
              <span>{result.reason}</span>
            </>
          ) : (
            <span>The result will appear here.</span>
          )}
        </div>

        <p className="note">
          Checks automatically with no LLM or network call. Non-Latin scripts are
          accepted conservatively and clearly labelled when this happens.
        </p>
      </section>
    </main>
  );
}
