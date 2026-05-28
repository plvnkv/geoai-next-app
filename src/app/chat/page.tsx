"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { DefaultChatTransport } from "ai";

import { Thread } from "@/components/assistant-ui/thread";

export default function Chat() {
  const runtime = useChatRuntime({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-screen">
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}
