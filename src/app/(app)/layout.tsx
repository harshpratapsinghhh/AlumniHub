import Navbar from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f2ef] flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto md:px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
