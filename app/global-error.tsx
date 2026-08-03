// file: app/global-error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center px-4 bg-background text-foreground">
          <div className="flex max-w-100 flex-col items-center justify-center text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold tracking-tight">Critical Error</h1>
            <p className="text-muted-foreground">
              A fatal error prevented the application from loading.
            </p>
            <button 
              onClick={() => reset()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}