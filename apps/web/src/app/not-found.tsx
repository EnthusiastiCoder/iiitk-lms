import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <p className="text-7xl font-extrabold text-brand">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/student">
          <Button className="bg-brand hover:bg-brand-dark text-white gap-2">
            <Home className="h-4 w-4" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
