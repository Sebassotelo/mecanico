import { embedText, cosine } from "./ai";

export function chunkText(text, size = 1200, overlap = 120) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    const end = Math.min(i + size, text.length);
    chunks.push(text.slice(i, end));
    i = end - overlap;
    if (i < 0) i = 0;
  }
  return chunks;
}

// Cache en memoria de la pestaña (rápido y simple)
const memoryCache = {
  embeddings: null, // [{parentId,title,index,content,embedding}]
  version: null,
};

function checksum(str) {
  let h = 0,
    i,
    c;
  for (i = 0; i < str.length; i++) {
    c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return String(h);
}

export async function ensureLocalKbEmbedded(KB_SECTIONS) {
  const version = checksum(
    KB_SECTIONS.map((s) => s.id + ":" + s.text).join("|")
  );
  if (memoryCache.embeddings && memoryCache.version === version)
    return memoryCache.embeddings;

  const res = [];
  for (const sec of KB_SECTIONS) {
    const pieces = chunkText(sec.text);
    for (let idx = 0; idx < pieces.length; idx++) {
      const content = pieces[idx];
      const embedding = await embedText(content);
      res.push({
        parentId: sec.id,
        title: sec.title,
        index: idx,
        content,
        embedding,
      });
    }
  }
  memoryCache.embeddings = res;
  memoryCache.version = version;
  return res;
}

export async function localRagSearch(
  query,
  { KB_SECTIONS, k = 5, threshold = 0.72 } = {}
) {
  const kb = await ensureLocalKbEmbedded(KB_SECTIONS);
  const qEmb = await embedText(query);
  const scored = kb
    .map((ch) => ({ ...ch, score: cosine(qEmb, ch.embedding) }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score >= threshold)
    .slice(0, k);
  return scored;
}
