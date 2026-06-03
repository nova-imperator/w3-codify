import { prisma } from "@/lib/prisma";
import type { AiMessage } from "./providers";

// ─────────────────────────── Tutor thread persistence (§8.1) ───────────────────────────
export async function loadThread(threadId: string, userId: string) {
  return prisma.aiThread.findFirst({
    where: { id: threadId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createThread(userId: string, courseId: string | null, title: string) {
  return prisma.aiThread.create({
    data: { userId, courseId: courseId ?? null, title: title.slice(0, 80) },
  });
}

export async function appendMessage(threadId: string, role: "user" | "assistant", content: string) {
  return prisma.aiMessage.create({ data: { threadId, role, content } });
}

/** Recent history as uniform chat messages (capped to keep prompts lean). */
export function toChatMessages(history: { role: string; content: string }[], max = 12): AiMessage[] {
  return history
    .slice(-max)
    .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
}
