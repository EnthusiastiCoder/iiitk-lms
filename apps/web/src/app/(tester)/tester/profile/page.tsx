import type { Metadata } from "next";
import { serverFetch } from "@/lib/server-api";
import { User, Mail, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/motion/fade-in";
import type { Profile } from "@lms/shared";

export const metadata: Metadata = {
  title: "Profile | IIIT Kalyani LMS",
};

export default async function TesterProfilePage() {
  const data = await serverFetch<{
    profile: Profile;
    stats: unknown;
  }>("/profile");

  const profile = data?.profile ?? null;
  const userName = profile?.full_name ?? "Tester";

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <FadeIn>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Profile</h1>

          <Card>
            <CardContent className="flex flex-col items-center gap-4 pt-4 pb-6">
              <Avatar className="h-20 w-20">
                {profile?.avatar_url && (
                  <AvatarImage src={profile.avatar_url} />
                )}
                <AvatarFallback
                  className="text-2xl font-bold"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#F59E0B",
                  }}
                >
                  {userName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-xl font-bold mb-1">{userName}</h2>
                <Badge
                  variant="outline"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#F59E0B",
                    borderColor: "transparent",
                  }}
                >
                  {profile?.role ?? "tester"}
                </Badge>
              </div>

              <div className="w-full space-y-3 mt-2">
                {profile?.email && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{ backgroundColor: "rgba(128,128,128,0.06)" }}
                  >
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{profile.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: "rgba(128,128,128,0.06)" }}
                >
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{userName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ backgroundColor: "rgba(128,128,128,0.06)" }}
                >
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p className="text-sm font-medium capitalize">
                      {profile?.role ?? "tester"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
}
