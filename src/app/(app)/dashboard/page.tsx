import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Calendar, CheckCircle2, ArrowRight, Building2, MapPin } from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import CreatePostBox from "@/components/CreatePostBox";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile: any = { name: "Member", role: "student" };
  let feedPosts: any[] = [];
  let suggested: any[] = [];
  let recentJobs: any[] = [];

  // Real Database Metrics
  let totalAlumniCount = 0;
  let totalConnectionsCount = 0;
  let pendingRequestsCount = 0;
  let activeOpportunitiesCount = 0;
  let profileCompletion = 40;

  if (user) {
    // 1. Fetch user profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profileData) {
      profile = profileData;

      // Calculate profile completion percentage
      const fields = [
        profile.name,
        profile.email,
        profile.role,
        profile.company,
        profile.bio,
        profile.avatar_url,
        profile.banner_url,
        profile.batch,
        profile.graduation_year,
        profile.degree_branch,
        profile.skills && profile.skills.length > 0 ? 'skills' : null,
        profile.linkedin_url || profile.github_url || profile.portfolio_url
      ];
      const filled = fields.filter(Boolean).length;
      profileCompletion = Math.min(100, Math.round((filled / fields.length) * 100));
    } else {
      profile = {
        id: user.id,
        name: user.user_metadata?.name || 'User',
        role: user.user_metadata?.role || 'student',
        email: user.email
      };
    }

    // 2. Fetch Feed Posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, profiles:author_id(name, role, company, avatar_url)')
      .order('created_at', { ascending: false });
    if (postsData) feedPosts = postsData;

    // 3. Fetch Suggested Network Users
    const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user.id).limit(4);
    if (profilesData) suggested = profilesData;

    // 4. Fetch Real Metrics
    const { count: alumniCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
    totalAlumniCount = alumniCount || 0;

    const { count: connCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);
    totalConnectionsCount = connCount || 0;

    const { count: pendingCount } = await supabase
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('status', 'pending');
    pendingRequestsCount = pendingCount || 0;

    const { count: oppCount, data: jobsData } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(3);

    activeOpportunitiesCount = oppCount || 0;
    if (jobsData) recentJobs = jobsData;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
      {/* Left Column - Profile Summary & Real Metrics */}
      <div className="md:col-span-1 lg:col-span-3 space-y-4">
        <Card className="overflow-hidden border-none shadow-sm pb-4 bg-white">
          <div
            className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-muted relative"
            style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover' } : {}}
          ></div>
          <div className="px-4 pb-0 pt-0 relative flex flex-col items-center">
            <Avatar className="h-16 w-16 -mt-8 border-2 border-white ring-2 ring-white bg-background shadow-md">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="text-center mt-2.5">
              <Link href="/profile" className="font-semibold text-lg hover:underline text-foreground">
                {profile.name}
              </Link>
              <div className="text-xs text-muted-foreground mt-0.5 capitalize font-medium">
                {profile.role || "member"} {profile.company ? `at ${profile.company}` : "at AlumniHub"}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Real Metrics Stats */}
          <div className="px-4 text-xs font-medium space-y-2">
            <Link href="/network" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition">
              <span className="text-muted-foreground">My Connections</span>
              <span className="text-primary font-bold">{totalConnectionsCount}</span>
            </Link>
            {pendingRequestsCount > 0 && (
              <Link href="/network" className="flex justify-between items-center bg-amber-50 text-amber-900 p-2 rounded border border-amber-200 transition">
                <span className="font-semibold">Pending Requests</span>
                <Badge className="bg-amber-600 text-white border-none font-bold text-[10px]">{pendingRequestsCount}</Badge>
              </Link>
            )}
            <Link href="/search?role=alumni" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition">
              <span className="text-muted-foreground">Total Alumni</span>
              <span className="text-foreground font-bold">{totalAlumniCount}</span>
            </Link>
            <Link href="/opportunities" className="flex justify-between items-center hover:bg-muted/50 p-2 rounded transition">
              <span className="text-muted-foreground">Active Opportunities</span>
              <span className="text-foreground font-bold">{activeOpportunitiesCount}</span>
            </Link>
          </div>

          <Separator className="my-4" />

          {/* Profile Completion Meter */}
          <div className="px-4 space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-foreground">Profile Strength</span>
              <span className="text-primary">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${profileCompletion}%` }}></div>
            </div>
            {profileCompletion < 100 && (
              <Link href="/profile" className="text-[11px] text-primary hover:underline block pt-1 font-semibold">
                + Complete your profile details
              </Link>
            )}
          </div>
        </Card>

        {/* User Skills Summary */}
        <Card className="border-none shadow-sm bg-white hidden lg:block">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Your Top Skills</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs bg-muted text-foreground font-medium">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No skills added yet.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Column - Feed (Post Box & Posts) */}
      <div className="md:col-span-3 lg:col-span-6 space-y-4">
        {/* Create Post Box */}
        <CreatePostBox profile={profile} />

        <Separator className="my-4 bg-border/40" />

        {/* Feed Posts */}
        {feedPosts.length === 0 ? (
          <Card className="border-none shadow-sm p-8 text-center bg-white">
            <p className="text-muted-foreground text-sm">No feed posts yet. Be the first to share an update with the alumni network!</p>
          </Card>
        ) : (
          feedPosts.map((post) => (
            <Card key={post.id} className="border-none shadow-sm bg-white">
              <CardHeader className="p-4 flex flex-row space-x-3 items-center">
                <Avatar className="h-11 w-11 cursor-pointer shadow-sm">
                  <AvatarImage src={post.profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {post.profiles?.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${post.author_id}`}>
                    <CardTitle className="text-sm font-bold text-foreground hover:text-primary cursor-pointer truncate">
                      {post.profiles?.name || "Anonymous User"}
                    </CardTitle>
                  </Link>
                  <div className="text-xs text-muted-foreground truncate capitalize">
                    {post.profiles?.role || "Member"} {post.profiles?.company && `at ${post.profiles.company}`}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {post.content}
                </p>
                {post.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden bg-muted flex justify-center border">
                    <img src={post.image_url} alt="Post media" className="max-w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}
              </CardContent>
              <Separator />
              <div className="px-4 py-2 flex justify-around text-xs">
                <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md font-semibold">Like</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md font-semibold">Comment</Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md font-semibold">Share</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Right Column - Recent Opportunities & Suggested Network */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        {/* Recent Opportunities Widget */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-primary" /> Career Opportunities
            </CardTitle>
            <Link href="/opportunities" className="text-xs text-primary font-semibold hover:underline flex items-center">
              View all <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            {recentJobs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No recent job posts.</p>
            ) : (
              recentJobs.map((job) => (
                <div key={job.id} className="p-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition">
                  <div className="font-bold text-xs text-foreground line-clamp-1 hover:text-primary cursor-pointer">
                    <Link href="/opportunities">{job.title}</Link>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5"><Building2 className="h-3 w-3" /> {job.company}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/20 text-primary">
                      {job.job_type}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Suggested Connections Widget */}
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> Recommended Network
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-4 mt-1">
              {suggested.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={s.avatar_url || ""} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                      {s.name ? s.name.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profile/${s.id}`}>
                      <p className="text-xs font-bold text-foreground truncate cursor-pointer hover:underline">
                        {s.name || "Anonymous"}
                      </p>
                    </Link>
                    <p className="text-[11px] text-muted-foreground truncate capitalize">
                      {s.role || "member"} {s.company && `at ${s.company}`}
                    </p>
                    <Link href={`/profile/${s.id}`}>
                      <Button variant="outline" size="sm" className="mt-1.5 h-6 rounded-full font-semibold px-3 text-[11px]">
                        Connect
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
