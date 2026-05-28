import { ChatOpenAI } from "@langchain/openai";

export const runtime = "edge";

export async function GET() {
  const llm = new ChatOpenAI({
    model: process.env.LLM_MODEL,
    apiKey: "local",
    configuration: { baseURL: process.env.LLM_URL },
  });

  return Response.json(await llm.invoke("who are u?"))
}
