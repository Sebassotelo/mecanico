"use client";
import React, { useEffect, useState, useRef } from "react";
import { chatWithGemini } from "@/lib/ai";
import { BASE_SYSTEM, CONTEXT_BLOCKS } from "@/lib/kb";
import {
  FaInstagram,
  FaTiktok,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";

/* ============ REDES (editá acá y listo) ============ */
const SOCIAL_LINKS = [
  {
    id: "site",
    label: "Sitio",
    href: "https://www.sebassotelo.com.ar/",
    display: "sebassotelo.com.ar",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/sebassotelo/",
    display: "in/sebassotelo",
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/_sebasdev/",
    display: "@_sebasdev",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@sebassdev",
    display: "@sebassdev",
  },
  // { id: "github",    label: "GitHub",    href: "https://github.com/tu-usuario",        display: "github.com/tu-usuario" },
  // { id: "email",     label: "Email",     href: "mailto:hola@sebassotelo.com.ar",       display: "hola@sebassotelo.com.ar" },
];

/* Mapeo de iconos por red */
const SOCIAL_ICONS = {
  site: FaGlobe,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  github: FaGithub,
  email: FaEnvelope,
};

/* ---- Contexto adicional (servicios por categorías) ---- */
const INLINE_CONTEXT = `
# Sobre Sebas (resumen útil)
- Rol: Desarrollador Full Stack.
- Tech: Next.js, React, Tailwind CSS, Firebase (Auth, Firestore, Storage, Functions) y Vercel.
- IA: Chatbots y asistentes (Gemini/GPT), RAG sencillo y automatizaciones con n8n.
- Servicios:
  · Sitios y apps web con Next.js (UI moderna, responsive, performance).
  · Chatbots / asistentes y flujos de IA (onboarding, soporte, automatización).
  · Integraciones con Firebase y despliegues en Vercel.
  · Consultoría técnica, MVPs y optimizaciones (performance/SEO).
- Ubicación actual: CABA, Argentina.
- Origen: Corrientes, Argentina.
- Idiomas: Español (nativo), Inglés (B2).
- Educación: Tecnicatura en Desarrollo de Software (CABA, 2023–presente).
`.trim();

/* ===== Utilidades ===== */
function normalize(s = "") {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
function isGreetingOrPolite(text) {
  const t = normalize(text);
  const greetings = [
    "hola",
    "buenas",
    "buen dia",
    "buenas tardes",
    "buenas noches",
    "que tal",
    "hey",
  ];
  const polite = ["gracias", "por favor", "disculpa", "perdon", "un gusto"];
  return (
    greetings.some((g) => t.includes(g)) || polite.some((p) => t.includes(p))
  );
}
function extractUserFacts(text) {
  const facts = {};
  const t = text.trim();
  const mName = t.match(
    /(?:mi nombre es|me llamo|soy)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñüïö\s\-]{1,40})/i
  );
  if (mName) facts.name = mName[1].trim().replace(/[.,;!?]$/, "");
  const mEmail = t.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  if (mEmail) facts.email = mEmail[0];
  return facts;
}
function friendlyPrefix(name, wasFriendly) {
  if (!wasFriendly) return "";
  return name ? `¡Hola, ${name}! ` : "¡Hola! ";
}

/* ===== Componente ===== */
export default function Home() {
  const [msgs, setMsgs] = useState([]); // [{role, text}]
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // UI: "Copiado"
  const [memory, setMemory] = useState({
    summary: "",
    history: [],
    userProfile: {},
  });

  // 👇 Mensajito de bienvenida junto a la burbuja
  const [showBubbleHint, setShowBubbleHint] = useState(false);

  // autoscroll
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, loading, openChat]);

  // 🔹 ref para enfocar/seleccionar el input del chat
  const inputRef = useRef(null);

  // inicial
  useEffect(() => {
    setMsgs([]);
    setMemory({ summary: "", history: [], userProfile: {} });

    // Mostrar hint “Hola, ¿cómo estás?” al cargar
    setShowBubbleHint(true);
    const t = setTimeout(() => setShowBubbleHint(false), 4500);
    return () => clearTimeout(t);
  }, []);

  // 🔹 focus al abrir el chat + ocultar hint
  useEffect(() => {
    if (openChat) {
      setShowBubbleHint(false); // ocultar mensaje al abrir chat
      const t = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 60);
      return () => clearTimeout(t);
    }
  }, [openChat]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setMsgs((p) => [...p, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const wasFriendly = isGreetingOrPolite(text);

      // aprender datos del usuario
      const facts = extractUserFacts(text);
      const nextUserProfile = { ...memory.userProfile, ...facts };

      // turno user → memoria
      const userTurn = { role: "user", text, ts: Date.now() };
      const nextHistory = [...memory.history, userTurn].slice(-20);

      // mini resumen cada 6 turnos
      let nextSummary = memory.summary;
      if (nextHistory.length % 6 === 0) {
        const linear = nextHistory
          .map((m) => `${m.role}: ${m.text}`)
          .join("\n")
          .slice(-1200);
        nextSummary = linear;
      }

      // redes al contexto (para que el bot pueda responderlas)
      const LINKS_TEXT =
        "# Redes oficiales\n" +
        SOCIAL_LINKS.map((l) => `- ${l.label}: ${l.href}`).join("\n");

      // bloques base
      const blocks = CONTEXT_BLOCKS.map((b) => `# ${b.title}\n${b.text}`).join(
        "\n\n"
      );
      const userProfileTxt = Object.keys(nextUserProfile).length
        ? `\n\n# Datos del usuario (recordados)\n${Object.entries(
            nextUserProfile
          )
            .map(([k, v]) => `- ${k}: ${v}`)
            .join("\n")}`
        : "";

      // system final
      const system = [
        BASE_SYSTEM,
        "Responde SOLO sobre Sebas Sotelo (perfil, servicios, tecnologías, políticas, contacto y REDES).",
        "No uses placeholders ni texto entre corchetes.",
        blocks && `Contexto:\n${blocks}`,
        INLINE_CONTEXT,
        LINKS_TEXT,
        nextSummary && `Memoria de la conversación:\n${nextSummary}`,
        userProfileTxt,
        `\n\n# Estilo
- Tono humano, cálido y directo; si saludan, saludá.
- 2–5 oraciones y una repregunta útil.
- Si piden redes, contesta con los enlaces exactos (del bloque "Redes oficiales").`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const shortHistory = nextHistory
        .slice(-6)
        .map(({ role, text }) => ({ role, text }));
      const prompt = friendlyPrefix(nextUserProfile.name, wasFriendly) + text;

      const reply = await chatWithGemini({
        system,
        history: shortHistory,
        user: prompt,
        generationConfig: { temperature: 0.2, maxOutputTokens: 900 },
      });

      const safe =
        typeof reply === "string" && reply.trim()
          ? reply.replace(/\[.*?\]/g, "")
          : friendlyPrefix(nextUserProfile.name, wasFriendly) +
            "Soy el asistente de Sebas. ¿Querés ver sus redes, sus servicios o cómo contactarlo?";

      const asstTurn = { role: "assistant", text: safe, ts: Date.now() };
      setMsgs((p) => [...p, { role: "assistant", text: safe }]);
      setMemory({
        summary: nextSummary,
        history: [...nextHistory, asstTurn],
        userProfile: nextUserProfile,
      });
    } catch (e) {
      console.error("send() error:", e);
      setMsgs((p) => [
        ...p,
        { role: "assistant", text: "Hubo un problema. ¿Probamos de nuevo?" },
      ]);
    } finally {
      setLoading(false);
      // 🔹 re-enfocar y seleccionar el input tras enviar
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 40);
    }
  }

  function resetChat() {
    setMsgs([]);
    setInput("");
    setMemory({ summary: "", history: [], userProfile: {} });
    // si el chat está abierto, enfocar el input al resetear
    if (openChat) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 40);
    }
  }

  // copiar al portapapeles
  async function copyLink(id, text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1200);
    } catch (e) {
      console.error("copy error", e);
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-200/60">
      {/* HERO */}
      <header className="px-4 pt-16 pb-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Logo redondo */}
          <img
            src="https://i.imgur.com/r3XyYLS.jpeg"
            alt="Logo Sebas Sotelo"
            className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-[0_10px_30px_rgba(16,185,129,.25)]"
          />
          <h1 className="text-4xl font-extrabold tracking-tight">
            Sebas Sotelo
          </h1>
          <p className="mt-2 text-slate-600">
            Desarrollador Full Stack — Next.js, Tailwind, Firebase & IA
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => setOpenChat(true)}
              className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,.25)] hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
            >
              Abrir asistente
            </button>
            <button
              onClick={resetChat}
              className="rounded-full border border-emerald-600/30 bg-white px-5 py-2.5 font-semibold text-emerald-700 hover:bg-emerald-50 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
            >
              Reiniciar chat
            </button>
          </div>
        </div>
      </header>

      {/* LINKTREE */}
      <section className="mx-auto max-w-md px-4 pb-10">
        <h2 className="mb-4 text-center text-lg font-bold">Mis redes</h2>
        <ul className="space-y-3">
          {SOCIAL_LINKS.map((l) => {
            const Icon = SOCIAL_ICONS[l.id] ?? FaGlobe;
            return (
              <li key={l.id}>
                <div className="group flex items-center justify-between gap-3 rounded-2xl border border-emerald-600/25 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md transition hover:bg-emerald-50">
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center gap-3"
                    aria-label={`Abrir ${l.label}`}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Icon />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold leading-tight">
                        {l.label}
                      </span>
                      <span className="text-sm text-emerald-700/90 leading-tight">
                        {l.display}
                      </span>
                    </div>
                  </a>
                  <button
                    onClick={() => copyLink(l.id, l.href)}
                    className="rounded-full border border-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    aria-label={`Copiar ${l.label}`}
                  >
                    {copiedId === l.id ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* FAB (redondo con logo) */}
      <button
        onClick={() => setOpenChat((v) => !v)}
        aria-label={openChat ? "Cerrar chat" : "Abrir chat"}
        className="fixed bottom-5 right-5 z-50 grid h-16 w-16 place-items-center rounded-full border border-emerald-600/20 bg-white shadow-[0_10px_30px_rgba(0,0,0,.15)] hover:scale-105 transition focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <img
          src="https://i.imgur.com/r3XyYLS.jpeg"
          alt="Abrir chat"
          className="h-12 w-12 rounded-full object-cover"
        />
      </button>

      {/* Mensajito al cargar (pegado a la burbuja) */}
      {!openChat && showBubbleHint && (
        <div className="fixed bottom-24 right-5 z-50">
          <div className="animate-fade-in rounded-2xl border border-emerald-600/20 bg-white px-3 py-2 text-sm text-slate-900 shadow-lg">
            Hola, ¿cómo estás?
          </div>
        </div>
      )}

      {/* CHAT */}
      {openChat && (
        <div
          role="dialog"
          aria-label="Asistente de Sebas"
          className="fixed bottom-24 right-5 z-50 flex h-[30rem] w-[23rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-emerald-600/20 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-emerald-600/20 bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-white">
            <div className="flex items-center gap-2">
              <img
                src="https://i.imgur.com/r3XyYLS.jpeg"
                alt="Logo"
                className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
              />
              <div>
                <div className="text-sm font-bold leading-tight">Asistente</div>
                <div className="text-[11px] opacity-90 leading-tight">
                  Sebas Sotelo
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpenChat(false)}
              className="rounded-full px-2 py-1 text-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 space-y-2 overflow-auto px-3 py-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "text-right" : "text-left"}
              >
                <div
                  className={[
                    "inline-block max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-100 text-slate-900",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-left">
                <div className="inline-block rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-900">
                  Escribiendo…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-emerald-600/20 p-2">
            <input
              ref={inputRef} // 🔹 referencia para focus/selección
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => (e.key === "Enter" ? send() : null)}
              placeholder="Preguntame algo sobre Sebas… (p. ej., ¿cuál es su Instagram?)"
              disabled={loading}
              className="flex-1 rounded-full border border-emerald-600/30 bg-white px-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={send}
              disabled={loading}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {loading ? "Enviando…" : "Enviar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
