import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

export const Chat = () => {
  useEffect(() => {
    createChat({
      webhookUrl: `${process.env.NEXT_PUBLIC_KEYIA}`,
      webhookConfig: {
        method: "POST",
        headers: {},
      },
      target: "#n8n-chat",
      mode: "window",
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      loadPreviousSession: true,
      metadata: {},
      showWelcomeScreen: false,
      defaultLanguage: "en",
      initialMessages: [
        "Hola! 👋",
        "Soy el asistente de Further, Te voy a hacer unas Preguntas",
      ],
      i18n: {
        en: {
          title: "Asistente Virtual",
          subtitle: "Te voy a hacer unas preguntas.",
          footer: "",
          getStarted: "Nueva Conversación",
          inputPlaceholder: "Escribe tu pregunta...",
        },
      },
      enableStreaming: false,
    });
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          /* --- ZONA DE PERSONALIZACIÓN DE COLORES --- */
          --chat--color-primary: #000000;
          --chat--color-secondary: #000000;
          --chat--message--bot--background: #f3f4f6;
          --chat--message--bot--color: #111827;
          --chat--message--user--color: #ffffff;
          --chat--color-dark: #111827;
          --chat--color-white: #ffffff;
          --chat--color-light: #f9fafb;
          --chat--color-medium: #e5e7eb;

          /* --- AJUSTES DE DISEÑO MINIMALISTA --- */
          --chat--spacing: 16px;
          --chat--border-radius: 12px;
          --chat--window--width: 360px;
          --chat--window--height: 90vh;
          --chat--window--max-height: 640px;
          --chat--toggle--size: 50px;
          --chat--toggle--background: var(--chat--color-primary);
          --chat--toggle--color: var(--chat--color-white);
          --chat--header--background: var(--chat--color-white);
          --chat--header--color: var(--chat--color-dark);
          --chat--header--padding: 12px 16px;
          --chat--header--border-bottom: 1px solid var(--chat--color-medium);
          --chat--heading--font-size: 1rem;
          --chat--subtitle--font-size: 0.8rem;
          --chat--message--padding: 10px 14px;
          --chat--message--font-size: 0.9rem;
          --chat--message--border-radius: 18px;
          --chat--message--user--border: none;
          --chat--message--bot--border: none;
        }

        /* --- **NUEVO** - Estructura del Input y Botón de Enviar --- */
        .n8n-chat-input-container {
          display: flex;
          align-items: center;
          gap: 8px; /* Espacio entre el campo de texto y el botón */
        }

        #n8n-chat-input {
          flex-grow: 1; /* El campo de texto ocupa el espacio disponible */
        }

        #n8n-chat-send-button {
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%; /* Botón circular */
          background-color: var(--chat--color-primary);
          color: var(--chat--color-white);
          flex-shrink: 0; /* Evita que el botón se encoja */
          transition: opacity 0.2s, background-color 0.2s;

          /* El botón siempre es visible, pero cambia su opacidad */
          opacity: 1;
        }

        /* Cuando el botón NO está deshabilitado (hay texto), se vuelve opaco y usable */
        #n8n-chat-send-button:not([disabled]) {
          opacity: 1;
          cursor: pointer;
        }

        /* --- Ajustes de Posicionamiento --- */
        #n8n-chat-launcher {
          bottom: 20px !important;
          right: 20px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        #n8n-chat-window {
          right: 20px !important;
          bottom: 80px !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1) !important;
        }
        .n8n-chat-message-bot {
          border-bottom-left-radius: 4px !important;
        }
        .n8n-chat-message-user {
          border-bottom-right-radius: 4px !important;
        }

        /* --- **CORRECCIÓN MEJORADA PARA MÓVILES** --- */
        @media (max-width: 600px) {
          #n8n-chat-window {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            border-radius: 0 !important;
            border: none !important;
          }

          .n8n-chat-container {
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
          }

          .n8n-chat-messages {
            flex: 1 !important;
            overflow-y: auto !important;
          }

          .n8n-chat-input-container {
            flex-shrink: 0;
            padding: 8px !important; /* Un poco menos de padding en móvil */
          }

          #n8n-chat-launcher {
            bottom: 15px !important;
            right: 15px !important;
          }
        }
      `}</style>
      <div id="n8n-chat"></div>
    </>
  );
};
