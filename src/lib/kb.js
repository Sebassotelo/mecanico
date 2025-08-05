export const BASE_SYSTEM = `
Eres el asistente personal de Sebas Sotelo.
Responde con tono cercano, claro y conversacional (2–5 oraciones y, si ayuda, una repregunta breve).
No menciones fuentes, ni expliques de dónde sale la información.

## Alcance (OBLIGATORIO)
- Solo puedes responder sobre Sebas Sotelo: su perfil, servicios, experiencia, tecnologías, políticas, ubicación y contacto/redes.
- Si preguntan algo fuera de ese alcance, responde amablemente:
  "Estoy capacitado solo para responder preguntas sobre Sebas Sotelo y su trabajo."
- No inventes datos. Si algo no está en el contexto, dilo y ofrece información relacionada de Sebas.
`.trim();

export const CONTEXT_BLOCKS = [
  {
    id: "policy",
    title: "Políticas",
    text: `
- Soporte: Lun–Vie 9–18 (hora AR).
- Reembolsos: 7 días si no se usó el servicio.
- Privacidad: no compartimos datos con terceros, salvo para procesamiento técnico.
    `.trim(),
  },
  {
    id: "faq",
    title: "FAQ",
    text: `
Q: ¿Cuánto tarda la activación?  A: 24–48 h hábiles.
Q: ¿Puedo cambiar de plan?       A: Sí, se prorratea.
    `.trim(),
  },
];

export const KB_SECTIONS = [
  {
    id: "perfil",
    title: "Perfil de Sebas Sotelo",
    text: `
Sebas Sotelo es Full Stack Web Developer con base en CABA, Argentina.
Tiene ~2 años de experiencia freelance. Se enfoca en construir apps web escalables, rápidas y orientadas a resultados,
con énfasis en productividad y reducción de costos. Le interesa aprender continuamente y aportar valor real.
    `.trim(),
  },
  {
    id: "habilidades",
    title: "Habilidades y stack",
    text: `
Frontend: React.js, Next.js, Tailwind CSS, Sass, Framer Motion.
Backend: TypeScript, Node.js, Express, Firebase (Auth, Firestore, Storage, Functions), REST APIs, SQL.
Herramientas: Git, GitHub, GitLab, Postman.
Despliegue: Vercel.
IA/Automatización: Integración de modelos (Gemini, GPT), flujos con n8n, RAG sencillo.
Soft skills: Proactividad, comunicación efectiva, aprendizaje continuo.
    `.trim(),
  },
  {
    id: "servicios",
    title: "Servicios (categorías)",
    text: `
1) Sitios y apps web con Next.js (UI moderna, responsive, performance).
2) Chatbots/Asistentes e integraciones de IA (onboarding, soporte, automatización).
3) Integraciones con Firebase (Auth/Firestore/Storage/Functions) y despliegue en Vercel.
4) Consultoría técnica, MVPs y optimización (rendimiento/SEO).
    `.trim(),
  },
  {
    id: "experiencia",
    title: "Experiencia y proyectos (resumen)",
    text: `
• App para Restaurante (www.gogo.com.ar): Next.js + Firebase + Sass, deploy en Vercel.
  - Pedidos en tiempo real, gestión de usuarios/clientes, historial de caja y centralización de datos.
  - Impacto: menos errores humanos y mejor eficiencia operativa en pymes.

• Plataforma de Cursos: Next.js + Firebase + Tailwind, deploy en Vercel.
  - Acceso multi-rol (3 niveles), gestión en tiempo real de cursos y usuarios, filtros/agrupamientos.
  - Reestructuración de base con +50.000 estudiantes para reducir costos y carga:
    * solicitudes a Firebase: de ~50 millones/día a ~100.000/día,
    * uso de memoria: de ~12 GB a ~500 MB cargando todos los datos,
    * mejoras notables de rendimiento general.
    `.trim(),
  },
  {
    id: "educacion",
    title: "Educación e idiomas",
    text: `
- Tecnicatura Superior en Desarrollo de Software (CABA) — 2023–presente.
- Idiomas: Español (nativo) · Inglés (B2).
    `.trim(),
  },
  {
    id: "ubicacion",
    title: "Ubicación de Sebas",
    text: `
Reside en CABA, Argentina. Trabaja de forma remota o presencial según el proyecto.
    `.trim(),
  },
  {
    id: "contacto_redes",
    title: "Contacto y redes",
    text: `
Sitio: https://www.sebassotelo.com.ar/
Instagram: https://www.instagram.com/_sebasdev/
TikTok: https://www.tiktok.com/@sebassdev
LinkedIn: https://www.linkedin.com/in/sebassotelo/
Email: sotelosebasn@gmail.com
Teléfono/WhatsApp: +54 9 379 425-8393
Portafolio: https://www.sebassotelo.com.ar/portafolio
    `.trim(),
  },
];
