'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Users, GraduationCap, Briefcase, Calendar, MessageSquare, Trash2, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    alumniCount: 0,
    studentCount: 0,
    postCount: 0,
    oppCount: 0,
    eventCount: 0
  });

  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState("");

  async function loadAdminData() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    setIsAdmin(true);

    // Fetch users
    const { data: allUsers } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (allUsers) setUsers(allUsers);

    // Fetch posts
    const { data: allPosts } = await supabase.from("posts").select("*, profiles:author_id(name, email)").order("created_at", { ascending: false });
    if (allPosts) setPosts(allPosts);

    // Fetch events
    const { data: allEvents } = await supabase.from("events").select("*, profiles:created_by(name, email)").order("created_at", { ascending: false });
    if (allEvents) setEvents(allEvents);

    // Fetch opportunities
    const { data: allOpps } = await supabase.from("opportunities").select("*, profiles:author_id(name, email)").order("created_at", { ascending: false });
    if (allOpps) setOpportunities(allOpps);

    // Calculate stats
    const total = allUsers?.length || 0;
    const alumni = allUsers?.filter(u => u.role === "alumni").length || 0;
    const student = allUsers?.filter(u => u.role === "student").length || 0;

    setStats({
      totalUsers: total,
      alumniCount: alumni,
      studentCount: student,
      postCount: allPosts?.length || 0,
      oppCount: allOpps?.length || 0,
      eventCount: allEvents?.length || 0
    });

    setLoading(false);
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`User "${name}" removed successfully.`);
      loadAdminData();
    }
  };

  const handleDeleteContent = async (type: "posts" | "events" | "opportunities", id: string) => {
    if (!confirm(`Delete this ${type.slice(0, -1)}?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from(type).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Content removed successfully.");
      loadAdminData();
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-muted-foreground">Verifying admin credentials...</div>;
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-xl mx-auto border-none shadow-md mt-12 py-8">
        <CardContent className="text-center space-y-4">
          <AlertCircle className="h-14 w-14 text-destructive mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground">
            You do not have Administrator permissions to access the platform management controls.
          </p>
          <Link href="/dashboard">
            <Button className="rounded-full px-6 font-semibold mt-2">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchUserQuery.toLowerCase()) ||
    (u.company || "").toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-border/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> Admin Platform Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            System administration dashboard for user management, platform analytics, and content moderation.
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-xs">
          System Admin Active
        </Badge>
      </div>

      {/* Analytics Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Users</div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg text-blue-600"><GraduationCap className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.alumniCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Alumni</div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-600"><Users className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.studentCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Students</div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-lg text-purple-600"><Briefcase className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.oppCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Jobs Posted</div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-lg text-amber-600"><Calendar className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.eventCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Events</div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-sm bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-lg text-rose-600"><MessageSquare className="h-5 w-5" /></div>
            <div>
              <div className="text-2xl font-bold">{stats.postCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Feed Posts</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-white p-1 rounded-lg border border-border/60 mb-4">
          <TabsTrigger value="users" className="font-semibold text-xs px-6">User Management ({users.length})</TabsTrigger>
          <TabsTrigger value="jobs" className="font-semibold text-xs px-6">Manage Jobs ({opportunities.length})</TabsTrigger>
          <TabsTrigger value="events" className="font-semibold text-xs px-6">Manage Events ({events.length})</TabsTrigger>
          <TabsTrigger value="posts" className="font-semibold text-xs px-6">Manage Posts ({posts.length})</TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="p-4 pb-3 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-md font-bold">Registered Users Directory</CardTitle>
                <CardDescription className="text-xs">Manage all student, alumni, and staff profiles.</CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Filter users..."
                  className="pl-9 h-9 bg-muted/30 border-none text-xs"
                  value={searchUserQuery}
                  onChange={e => setSearchUserQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 text-muted-foreground text-xs uppercase border-b">
                  <tr>
                    <th className="p-3 pl-6">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Company / Organization</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3 pl-6 flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={u.avatar_url || ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                            {u.name ? u.name.substring(0, 2).toUpperCase() : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-foreground">{u.name || "Unnamed"}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={`font-semibold capitalize text-[10px] ${
                          u.role === 'admin' ? 'bg-rose-100 text-rose-700 border-none' :
                          u.role === 'alumni' ? 'bg-blue-100 text-blue-700 border-none' : 'bg-emerald-100 text-emerald-700 border-none'
                        }`}>
                          {u.role || 'member'}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-foreground/80">{u.company || "Not specified"}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-right pr-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
                          onClick={() => handleDeleteUser(u.id, u.name || u.email)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="space-y-3">
              {opportunities.map(opp => (
                <div key={opp.id} className="p-4 border rounded-lg flex justify-between items-center bg-muted/10">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{opp.title} at {opp.company}</h4>
                    <p className="text-xs text-muted-foreground">Posted by {opp.profiles?.name || 'Alumni'} • {new Date(opp.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                    onClick={() => handleDeleteContent("opportunities", opp.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="space-y-3">
              {events.map(ev => (
                <div key={ev.id} className="p-4 border rounded-lg flex justify-between items-center bg-muted/10">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{ev.title}</h4>
                    <p className="text-xs text-muted-foreground">Date: {new Date(ev.date).toLocaleString()} • Host: {ev.profiles?.name || 'Alumni'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                    onClick={() => handleDeleteContent("events", ev.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <Card className="border-none shadow-sm bg-white p-4">
            <div className="space-y-3">
              {posts.map(p => (
                <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center bg-muted/10">
                  <div className="max-w-xl">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">Author: {p.profiles?.name || 'User'}</p>
                    <p className="text-sm text-foreground line-clamp-2">{p.content}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                    onClick={() => handleDeleteContent("posts", p.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
