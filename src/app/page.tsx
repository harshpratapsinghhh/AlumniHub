import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-border shadow-sm">
        <div className="text-2xl font-bold text-primary tracking-tight">AlumniHub</div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button>Join now</Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center bg-[#f3f2ef] px-6 py-12 pb-24 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-[#8f5849] mb-4">
          Welcome to your professional community
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl">
          Connect with your alumni, uncover new opportunities, and stay updated with campus events.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/search">
            <Button size="lg" className="text-lg py-6 px-10">Find Alumni</Button>
          </Link>
          <Link href="/events">
            <Button variant="outline" size="lg" className="text-lg py-6 px-10 bg-white">View Upcoming Events</Button>
          </Link>
        </div>
      </main>

      <footer className="bg-white border-t border-border py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AlumniHub. All rights reserved.
      </footer>
    </div>
  );
}
