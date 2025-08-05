// lib/memoryClient.js
import { db } from "./firebaseClient";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function getMemory(sessionId) {
  const snap = await getDoc(doc(db, "chatMemory", sessionId));
  return snap.exists()
    ? snap.data()
    : { summary: "", userProfile: {}, lastStep: "", history: [] };
}

export async function updateMemory(
  sessionId,
  { appendUser, appendAssistant, userProfilePatch, lastStep } = {}
) {
  const ref = doc(db, "chatMemory", sessionId);
  const prevSnap = await getDoc(ref);
  const prev = prevSnap.exists() ? prevSnap.data() : null;

  // construir next
  const history = [...(prev?.history || [])];
  if (appendUser)
    history.push({ role: "user", text: appendUser, ts: Date.now() });
  if (appendAssistant)
    history.push({ role: "assistant", text: appendAssistant, ts: Date.now() });

  const next = {
    ...(prev || {}),
    history: history.slice(-20),
    userProfile: userProfilePatch
      ? { ...(prev?.userProfile || {}), ...userProfilePatch }
      : prev?.userProfile || {},
    lastStep: lastStep ?? (prev?.lastStep || ""),
    updatedAt: Date.now(),
  };

  // 👇 si es la primera vez, guardamos ownerUid
  if (!prev) {
    const uid = getAuth()?.currentUser?.uid;
    next.ownerUid = uid || "unknown"; // las reglas exigen que sea el uid real
  }

  if ((next.history?.length || 0) % 6 === 0) {
    const last = next.history
      .map((m) => `${m.role}: ${m.text}`)
      .join("\n")
      .slice(-1200);
    next.summary = last;
  }

  await setDoc(ref, next, { merge: true });
  return next;
}
