import { AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import {
  ConditionalEdgeRouter,
  END,
  GraphNode,
  MessagesAnnotation,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

export const model = new ChatOpenAI({
  model: process.env.LLM_MODEL,
  apiKey: "local",
  configuration: { baseURL: process.env.LLM_URL },
});

// Tools
export const addTool = tool(({ a, b }) => a + b, {
  name: "add",
  description: "Add two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

export const subtractTool = tool(({ a, b }) => a - b, {
  name: "subtract",
  description: "Subtract two numbers",
  schema: z.object({
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
});

export const toolsMap = {
  [addTool.name]: addTool,
  [subtractTool.name]: subtractTool,
};

// Graph nodes
export const llmNode: GraphNode<typeof MessagesAnnotation.State> = async (state) => {
  const response = await model
    .bindTools(Object.values(toolsMap))
    .invoke([
      new SystemMessage(
        "You are a helpful assistant tasked with performing arithmetic on a set of inputs.",
      ),
      ...state.messages,
    ]);

  return {
    messages: [response],
  };
};

export const toolNode: GraphNode<typeof MessagesAnnotation.State> = async (state) => {
  const lastMessage = state.messages.at(-1);

  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const result: ToolMessage[] = [];
  for (const toolCall of lastMessage.tool_calls ?? []) {
    const tool = toolsMap[toolCall.name];
    const observation = await tool.invoke(toolCall);
    result.push(observation);
  }

  return { messages: result };
};

export const shouldContinue: ConditionalEdgeRouter<
  typeof MessagesAnnotation.State,
  {},
  "toolNode"
> = (state) => {
  const lastMessage = state.messages.at(-1);

  // Check if it's an AIMessage before accessing tool_calls
  if (!lastMessage || !AIMessage.isInstance(lastMessage)) {
    return END;
  }

  // If the LLM makes a tool call, then perform an action
  if (lastMessage.tool_calls?.length) {
    return "toolNode";
  }

  // Otherwise, we stop (reply to the user)
  return END;
};

export const graph = new StateGraph(MessagesAnnotation)
  .addNode("llmNode", llmNode)
  .addNode("toolNode", toolNode)
  .addEdge(START, "llmNode")
  .addConditionalEdges("llmNode", shouldContinue, ["toolNode", END])
  .addEdge("toolNode", "llmNode")
  .compile();
