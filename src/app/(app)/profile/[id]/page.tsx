import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OtherUserProfile({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await params; // Next.js 15 requires awaiting params
  
  // Get viewer
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
  
  if (!profile) return notFound();

  // Check connection status
  let connectionStatus = null;
  if (user && user.id !== profile.id) {
    const { data: conn } = await supabase
      .from('connections')
      .select('*')
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${profile.id}),and(requester_id.eq.${profile.id},recipient_id.eq.${user.id})`)
      .single();
    if (conn) connectionStatus = conn.status; // 'pending' or 'accepted'
  }

  const isMe = user?.id === profile.id;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm overflow-hidden">
        <div 
          className="h-48 bg-muted relative"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        <CardContent className="px-6 pb-6 relative">
          <div className="flex justify-between items-start">
            <Avatar className="h-32 w-32 -mt-16 border-4 border-white ring-4 ring-white bg-background z-10">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-4xl">{profile.name ? profile.name.substring(0, 1).toUpperCase() : "..."}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex gap-2">
              {isMe ? (
                <Link href="/profile">
                   <div className="rounded-full px-6 font-semibold bg-muted py-2 text-sm hover:bg-muted/80 inline-block">Edit profile</div>
                </Link>
              ) : (
                <ConnectButton profileId={profile.id} initialStatus={connectionStatus} />
              )}
            </div>
          </div>
          
          <div className="mt-4 max-w-2xl">
            <h1 className="text-xl font-bold">{profile.name || "Anonymous User"}</h1>
            <p className="text-md mt-1 text-foreground font-medium capitalize">
              {profile.role || "Member"} {profile.company ? `at ${profile.company}` : ''}
            </p>
            <p className="text-sm text-muted-foreground mt-2">New Delhi, India • <span className="text-primary font-semibold hover:underline cursor-pointer">Contact info</span></p>
            <p className="text-sm font-semibold text-primary mt-2 hover:underline cursor-pointer">500+ connections</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">About</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {profile.bio || `No bio added yet.`}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
             {profile.skills && profile.skills.map((s: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 font-semibold">{s}</Badge>
             ))}
             {(!profile.skills || profile.skills.length === 0) && <p className="text-muted-foreground text-sm">No skills added.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
