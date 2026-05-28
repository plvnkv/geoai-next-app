import { toBaseMessages, toUIMessageStream } from "@ai-sdk/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";

export const maxDuration = 30;

const model = new ChatOpenAI({
  model: process.env.LLM_MODEL,
  apiKey: "local",
  configuration: { baseURL: process.env.LLM_URL },
});

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Create the LangGraph agent
  const graph = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addEdge("agent", "__end__")
    .compile();

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
