'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"student" | "alumni">("student");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role }
      }
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    // Note: The profile row is now created automatically by a Supabase Postgres Trigger 
    // when the user is inserted into the auth.users table.

    toast.success("Account created successfully!");
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold tracking-tight text-primary">
            AlumniHub
          </Link>
        </div>
        <Card className="border-none shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Join AlumniHub</CardTitle>
            <CardDescription>
              Make the most of your professional life
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  placeholder="John Doe" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <div className="flex gap-4">
                  <div 
                    className={`flex-1 p-3 border rounded-md text-center cursor-pointer transition ${role === 'student' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-muted'}`}
                    onClick={() => setRole('student')}
                  >
                    Student
                  </div>
                  <div 
                    className={`flex-1 p-3 border rounded-md text-center cursor-pointer transition ${role === 'alumni' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'border-border text-muted-foreground hover:bg-muted'}`}
                    onClick={() => setRole('alumni')}
                  >
                    Alumni
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password (6+ characters)</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full rounded-full h-12 text-md font-semibold mt-4" disabled={loading}>
                {loading ? "Creating account..." : "Agree & Join"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col text-sm text-center">
            <div className="text-muted-foreground text-xs mb-4">
              By clicking Agree & Join, you agree to the AlumniHub User Agreement, Privacy Policy, and Cookie Policy.
            </div>
            <div>
              Already on AlumniHub?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
