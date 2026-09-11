'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Home, Users, Briefcase, CalendarDays, MessageSquare, ShieldCheck, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
        } else {
          setProfile({ email: user.email, name: user.user_metadata?.name || 'User', role: user.user_metadata?.role || 'student' });
        }
      }
    }
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "My Network", href: "/network", icon: Users },
    { name: "Directory", href: "/search", icon: Search },
    { name: "Jobs", href: "/opportunities", icon: Briefcase },
    { name: "Events", href: "/events", icon: CalendarDays },
    { name: "Messaging", href: "/messages", icon: MessageSquare },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ name: "Admin", href: "/admin", icon: ShieldCheck });
  }

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center text-2xl font-bold tracking-tight text-primary">
              AlumniHub
            </Link>
            <div className="hidden md:flex ml-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pt-px pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <form action="/search" method="GET">
                <Input
                  type="search"
                  name="q"
                  placeholder="Search alumni, skills..."
                  className="pl-10 w-64 bg-[#edf3f8] border-none focus-visible:ring-1 focus-visible:ring-primary shadow-none h-9 text-sm"
                />
              </form>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden md:flex space-x-4 lg:space-x-6">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center min-w-[48px] px-1 border-b-2 transition-colors ${
                      isActive ? "border-primary text-primary font-semibold" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-[11px] hidden lg:block">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center border-l pl-4 md:pl-6 space-x-4 border-border">
              <DropdownMenu>
                <DropdownMenuTrigger className="relative h-10 w-10 rounded-full border-none focus-visible:outline-none hover:bg-muted/50 transition-colors flex items-center justify-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || ""} alt="User" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {profile?.name ? profile.name.substring(0, 2).toUpperCase() : "ME"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.name || 'Loading...'}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {profile?.email || '...'}
                        </p>
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider mt-1">
                          Role: {profile?.role || 'student'}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" /> View Profile
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin')} className="cursor-pointer font-semibold text-primary">
                      <ShieldCheck className="h-4 w-4 mr-2" /> Admin Console
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive cursor-pointer flex items-center" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
