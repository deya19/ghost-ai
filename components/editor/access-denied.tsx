import Link from "next/link"
import { LockKeyhole } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export function AccessDenied() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center px-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <h1 className="mt-5 text-lg font-semibold text-foreground">
          Workspace unavailable
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This project does not exist, or you do not have access to it.
        </p>
        <Link className={buttonVariants({ className: "mt-6" })} href="/editor">
          Back to editor
        </Link>
      </div>
    </div>
  )
}
