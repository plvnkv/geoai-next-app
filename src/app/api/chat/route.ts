import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { createUIMessageStreamResponse, UIMessage } from "ai";

import { model } from "@/agent";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Convert AI SDK UIMessages to LangChain messages
  const langchainMessages = await toBaseMessages(messages);

  // Stream the response from the model
  const stream = await model.stream(langchainMessages);

  // Convert the LangChain stream to UI message stream
  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}
