import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { createClient } from "@/lib/supabase/server";
import CreatePostBox from "@/components/CreatePostBox";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile: any = { name: "Loading...", role: "Member" };
  let feedPosts: any[] = [];
  let suggested: any[] = [];

  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      profile = data;
    } else {
      profile = { name: user.user_metadata?.name || 'User', role: user.user_metadata?.role || 'Alumni' };
    }

    const { data: postsData } = await supabase.from('posts').select('*, profiles:author_id(name, role, company)').order('created_at', { ascending: false });
    if (postsData) feedPosts = postsData;

    const { data: profilesData } = await supabase.from('profiles').select('*').neq('id', user.id).limit(4);
    if (profilesData) suggested = profilesData;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
      {/* Left Column - Profile Summary */}
      <div className="md:col-span-1 lg:col-span-3 space-y-4">
        <Card className="overflow-hidden border-none shadow-sm pb-4">
          <div className="h-16 bg-muted"></div>
          <div className="px-4 pb-0 pt-0 relative flex flex-col items-center">
            <Avatar className="h-16 w-16 -mt-8 border-2 border-white ring-2 ring-white bg-background">
              <AvatarImage src="" />
              <AvatarFallback>{profile.name ? profile.name.substring(0, 2).toUpperCase() : "ME"}</AvatarFallback>
            </Avatar>
            <div className="text-center mt-2.5">
              <div className="font-semibold text-lg hover:underline cursor-pointer">{profile.name}</div>
              <div className="text-sm text-muted-foreground mt-0.5 capitalize">{profile.role} at AlumniHub</div>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="px-4 text-sm font-medium text-muted-foreground">
            <div className="flex justify-between hover:bg-muted/50 p-1 cursor-pointer rounded">
              <span>Profile viewers</span>
              <span className="text-primary font-semibold">12</span>
            </div>
            <div className="flex justify-between hover:bg-muted/50 p-1 cursor-pointer rounded mt-1">
              <span>Post impressions</span>
              <span className="text-primary font-semibold">145</span>
            </div>
          </div>
        </Card>

        {/* Suggestion Card */}
        <Card className="border-none shadow-sm hidden lg:block">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Your Skills</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm">
            <div className="flex flex-wrap gap-2">
              <span className="bg-secondary text-secondary-foreground px-2 py-1 flex items-center rounded-md text-xs font-semibold">React</span>
              <span className="bg-secondary text-secondary-foreground px-2 py-1 flex items-center rounded-md text-xs font-semibold">Next.js</span>
              <span className="bg-secondary text-secondary-foreground px-2 py-1 flex items-center rounded-md text-xs font-semibold">Supabase</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center Column - Feed (Events & Posts) */}
      <div className="md:col-span-3 lg:col-span-6 space-y-4">
        
        {/* Post Creation Box */}
        <CreatePostBox profile={profile} />

        <Separator className="my-4 bg-border/40" />

        {/* Feed Posts */}
        {feedPosts.length === 0 && <p className="text-center text-muted-foreground mt-8">No posts yet. Be the first to share something!</p>}
        {feedPosts.map((post) => (
          <Card key={post.id} className="border-none shadow-sm">
            <CardHeader className="p-4 flex flex-row space-x-3 items-center">
              <Avatar className="h-12 w-12 cursor-pointer shadow-sm">
                <AvatarFallback>{post.profiles?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold hover:text-primary cursor-pointer">{post.profiles?.name || 'Anonymous User'}</CardTitle>
                <div className="text-xs text-muted-foreground line-clamp-1">{post.profiles?.role || 'Member'} {post.profiles?.company && `at ${post.profiles.company}`}</div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
              {post.image_url && (
                <div className="mt-3 rounded-md overflow-hidden bg-muted flex justify-center">
                  <img src={post.image_url} alt="Post attachment" className="max-w-full h-auto max-h-[400px] object-cover" />
                </div>
              )}
            </CardContent>
            <Separator />
            <div className="px-4 py-2 flex justify-around">
              <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md hover:bg-muted/60">Like</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md hover:bg-muted/60">Comment</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground w-full rounded-md hover:bg-muted/60">Share</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Right Column - Top News / Suggestions */}
      <div className="hidden lg:block lg:col-span-3 space-y-4">
        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Alumni News</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <ul className="space-y-3 mt-2">
              <li className="text-sm">
                <div className="font-semibold text-foreground/90 cursor-pointer hover:text-primary leading-tight hover:underline">Batch 2020 Virtual Reunion Dates Announced</div>
                <div className="text-xs text-muted-foreground mt-0.5">Top news • 3,241 readers</div>
              </li>
              <li className="text-sm">
                <div className="font-semibold text-foreground/90 cursor-pointer hover:text-primary leading-tight hover:underline">New Tech Center at University</div>
                <div className="text-xs text-muted-foreground mt-0.5">Campus update • 1d ago</div>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Suggested Connections</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4 mt-3">
              {suggested.map((s) => (
                <div key={s.id} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarFallback>{s.name ? s.name.substring(0,2).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline">{s.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.role || 'Member'}</p>
                    <Button variant="outline" size="sm" className="mt-2 h-7 rounded-full font-semibold px-4 text-xs">
                      Connect
                    </Button>
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
