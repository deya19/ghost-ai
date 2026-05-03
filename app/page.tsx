import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <h1 className="text-2xl font-medium text-foreground">ghost AI</h1>
      <Link href="/editor" className="mt-4">
        <Button>Open Editor</Button>
      </Link>
    </div>
  )
}
