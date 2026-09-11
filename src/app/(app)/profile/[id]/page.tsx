import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ConnectButton from "@/components/ConnectButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, GraduationCap, Globe, Code2 } from "lucide-react";

export default async function OtherUserProfile({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
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
    if (conn) connectionStatus = conn.status;
  }

  const isMe = user?.id === profile.id;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div 
          className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-muted relative"
          style={profile.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        ></div>
        <CardContent className="px-6 pb-6 relative">
          <div className="flex justify-between items-start">
            <Avatar className="h-32 w-32 -mt-16 border-4 border-white ring-4 ring-white bg-background shadow-md">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {profile.name ? profile.name.substring(0, 1).toUpperCase() : "U"}
              </AvatarFallback>
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {profile.name || "Anonymous User"}
              <Badge variant="outline" className="capitalize text-xs font-semibold bg-primary/10 text-primary border-none">
                {profile.role || "student"}
              </Badge>
            </h1>
            <p className="text-md mt-1 text-foreground font-semibold capitalize">
              {profile.company ? `${profile.role} at ${profile.company}` : `AlumniHub ${profile.role || 'Member'}`}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
              )}
              {profile.degree_branch && (
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.degree_branch} ({profile.graduation_year || profile.batch || 'Batch'})</span>
              )}
              <span className="text-primary font-bold">500+ connections</span>
            </div>

            {/* Social Links */}
            <div className="flex gap-2 mt-4">
              {profile.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Globe className="h-3.5 w-3.5" /> LinkedIn
                  </Button>
                </a>
              )}
              {profile.github_url && (
                <a href={profile.github_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-stone-300 text-stone-800 hover:bg-stone-100">
                    <Code2 className="h-3.5 w-3.5" /> GitHub
                  </Button>
                </a>
              )}
              {profile.portfolio_url && (
                <a href={profile.portfolio_url} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                    <Globe className="h-3.5 w-3.5" /> Portfolio
                  </Button>
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-3">About</h2>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
            {profile.bio || `No bio added yet.`}
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-3">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
             {profile.skills && profile.skills.map((s: string, i: number) => (
                <Badge key={i} variant="secondary" className="px-3 py-1 font-medium text-xs bg-muted text-foreground">{s}</Badge>
             ))}
             {(!profile.skills || profile.skills.length === 0) && <p className="text-muted-foreground text-xs">No skills listed.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
