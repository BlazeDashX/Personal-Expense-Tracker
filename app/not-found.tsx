// file: app/not-found.tsx
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-100 flex-col items-center justify-center text-center space-y-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/dashboard" passHref>
          <Button className="mt-4">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}