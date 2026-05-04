import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import ConnectionRequests from "@/components/ConnectionRequests";

export default async function NetworkPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch everyone EXCEPT the active user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', user?.id || '');

  // Fetch incoming connection requests
  const { data: pendingRequests } = await supabase
    .from('connections')
    .select('*, profiles!requester_id(*)')
    .eq('recipient_id', user?.id)
    .eq('status', 'pending');

  // Group into standard network categories
  const alumni = profiles?.filter(p => (p.role || '').toLowerCase() === 'alumni') || [];
  const students = profiles?.filter(p => (p.role || '').toLowerCase() === 'student') || [];
  
  // Anything else becomes general staff or other categories, let's group dynamically too
  const otherRoles = profiles?.filter(p => !['alumni', 'student'].includes((p.role || '').toLowerCase())) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {pendingRequests && pendingRequests.length > 0 && (
         <div className="mt-6">
            <ConnectionRequests requests={pendingRequests} />
         </div>
      )}

      <div className="bg-white rounded-t-lg p-6 border-b border-border shadow-sm mt-4">
        <h1 className="text-2xl font-bold text-foreground">My Network</h1>
        <p className="text-sm text-muted-foreground mt-1">Discover other users on the server categorized by their roles.</p>
      </div>

      {alumni.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground px-2">Alumni ({alumni.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {alumni.map((user) => (
              <NetworkCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}

      {students.length > 0 && (
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-foreground px-2">Students ({students.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {students.map((user) => (
              <NetworkCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}

      {otherRoles.length > 0 && (
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-bold text-foreground px-2">Staff & Others ({otherRoles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {otherRoles.map((user) => (
              <NetworkCard key={user.id} user={user} />
            ))}
          </div>
        </section>
      )}

      {(!profiles || profiles.length === 0) && (
        <div className="text-center py-24 text-muted-foreground">
          No other users found on this server yet.
        </div>
      )}
    </div>
  );
}

function NetworkCard({ user }: { user: any }) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full flex flex-col items-center p-4">
      <Link href={`/profile/${user.id}`}>
        <Avatar className="h-20 w-20 cursor-pointer border shadow-sm">
          <AvatarImage src={user.avatar_url || ""} />
          <AvatarFallback className="text-xl">{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="mt-4 text-center flex-1">
        <Link href={`/profile/${user.id}`}>
          <h3 className="text-md font-bold text-foreground hover:text-primary hover:underline cursor-pointer line-clamp-1">{user.name || 'Anonymous'}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1 capitalize line-clamp-1">{user.role}</p>
        <p className="text-xs text-foreground mt-1 line-clamp-1">{user.company || 'Open to opportunities'}</p>
      </div>
      <div className="mt-4 w-full">
        <Link href={`/profile/${user.id}`}>
          <Button variant="outline" className="w-full rounded-full font-semibold border-primary text-primary hover:bg-primary/5">
            Connect
          </Button>
        </Link>
      </div>
    </Card>
  );
}
