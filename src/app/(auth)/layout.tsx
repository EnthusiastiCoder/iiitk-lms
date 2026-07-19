import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(224,71%,4%)] via-[hsl(222,47%,8%)] to-[hsl(224,71%,4%)] p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/iiitk-logo.png"
            alt="IIIT Kalyani Logo"
            width={72}
            height={72}
            priority
            className="rounded-xl"
          />
          <h1 className="text-2xl font-bold tracking-tight text-white">
            IIIT Kalyani LMS
          </h1>
          <p className="text-sm text-zinc-400">
            Learning Management System
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
