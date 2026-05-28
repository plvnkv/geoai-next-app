import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createUIMessageStreamResponse, UIMessage } from "ai";

export const maxDuration = 30;

const model = new ChatOpenAI({
  model: process.env.LLM_MODEL,
  apiKey: "local",
  configuration: { baseURL: process.env.LLM_URL },
});

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
