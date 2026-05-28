import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Link href="/chat">
        <Button variant="link" className="cursor-pointer">
          Chat 💬
        </Button>
      </Link>
      <Link href="/langgraph">
        <Button variant="link" className="cursor-pointer">
          Agent 🤖
        </Button>
      </Link>
    </div>
  );
}
