import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

import { graph } from "@/agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Convert AI SDK UIMessages to LangChain messages
  const langchainMessages = await toBaseMessages(messages);

  // Stream from the graph using LangGraph's streaming format
  const stream = await graph.stream(
    { messages: langchainMessages },
    { streamMode: ["values", "messages"] },
  );

  // Convert the LangGraph stream to UI message stream
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
