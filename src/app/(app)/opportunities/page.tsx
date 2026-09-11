'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Briefcase, MapPin, ExternalLink, Plus, Search, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [canPost, setCanPost] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("");

  // Create Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "Remote",
    job_type: "Full-time",
    description: "",
    application_link: "",
  });

  async function fetchOpportunities() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("opportunities")
      .select("*, profiles:author_id(name, email, avatar_url, role, company)")
      .order("created_at", { ascending: false });

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
    }
    if (selectedType !== "all") {
      query = query.eq("job_type", selectedType);
    }
    if (filterLocation) {
      query = query.ilike("location", `%${filterLocation}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setOpportunities(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    async function initUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        const active = profile || { id: user.id, role: user.user_metadata?.role || "student" };
        setUserProfile(active);
        const role = (active.role || "").toLowerCase();
        setCanPost(role === "alumni" || role === "admin");
      }
    }
    initUser();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchOpportunities, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, filterLocation]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("opportunities").insert({
      author_id: user.id,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location || "Remote",
      job_type: newJob.job_type,
      description: newJob.description,
      application_link: newJob.application_link || null,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Job opportunity posted successfully!");
      setNewJob({
        title: "",
        company: "",
        location: "Remote",
        job_type: "Full-time",
        description: "",
        application_link: "",
      });
      setShowCreateModal(false);
      fetchOpportunities();
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("opportunities").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Opportunity removed");
      fetchOpportunities();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl p-6 border border-border/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" /> Career Opportunities & Job Board
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Explore career openings shared directly by alumni and university partners.
          </p>
        </div>
        {canPost && (
          <Button
            onClick={() => setShowCreateModal(!showCreateModal)}
            className="rounded-full px-6 font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> {showCreateModal ? "Cancel Posting" : "Post Opportunity"}
          </Button>
        )}
      </div>

      {/* Post Opportunity Modal / Form */}
      {showCreateModal && canPost && (
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg font-bold">Post New Career Opportunity</CardTitle>
            <CardDescription>Share job openings or internships with students & fellow alumni.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Job Title *</label>
                  <Input
                    required
                    placeholder="e.g. Software Engineer, Frontend Intern"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Company Name *</label>
                  <Input
                    required
                    placeholder="e.g. Google, Microsoft, Startup Inc"
                    value={newJob.company}
                    onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Location</label>
                  <Input
                    placeholder="e.g. New Delhi, Bengaluru, Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Job Type</label>
                  <select
                    className="w-full h-10 px-3 border border-border rounded-md bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    value={newJob.job_type}
                    onChange={(e) => setNewJob({ ...newJob, job_type: e.target.value })}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Application Link / Email URL</label>
                <Input
                  type="url"
                  placeholder="https://company.com/careers/apply or mailto:hr@company.com"
                  value={newJob.application_link}
                  onChange={(e) => setNewJob({ ...newJob, application_link: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Description & Requirements *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full p-3 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  placeholder="Provide role overview, key responsibilities, required skills, and stipend/salary details..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="rounded-full px-8 font-semibold">
                  {submitting ? "Publishing..." : "Publish Opportunity"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Search by title, company, or keywords..."
            className="pl-9 bg-white border-none shadow-sm h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <Input
            placeholder="Filter location (e.g. Remote)"
            className="bg-white border-none shadow-sm h-10 text-sm"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
        </div>
        <div className="md:col-span-3">
          <select
            className="w-full h-10 px-3 bg-white border-none shadow-sm rounded-md text-sm text-foreground focus:outline-none"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Job Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <Card className="border-none shadow-sm py-16 text-center">
            <CardContent>
              <Briefcase className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-foreground">No opportunities found</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                No job openings matched your search criteria. Check back later or clear your search filters.
              </p>
            </CardContent>
          </Card>
        ) : (
          opportunities.map((opp) => {
            const isOwner = userProfile?.id === opp.author_id || userProfile?.role === "admin";
            return (
              <Card key={opp.id} className="border-none shadow-sm hover:shadow-md transition bg-white overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-start">
                      <Avatar className="h-12 w-12 border shadow-sm rounded-md mt-1">
                        <AvatarFallback className="rounded-md bg-primary/10 text-primary font-bold">
                          {opp.company ? opp.company.substring(0, 2).toUpperCase() : "CO"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-foreground hover:text-primary cursor-pointer">
                            {opp.title}
                          </h3>
                          <Badge variant="secondary" className="font-semibold text-xs bg-primary/10 text-primary border-none">
                            {opp.job_type}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {opp.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {opp.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {new Date(opp.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 text-xs font-semibold"
                          onClick={() => handleDelete(opp.id)}
                        >
                          Delete
                        </Button>
                      )}
                      {opp.application_link ? (
                        <a href={opp.application_link} target="_blank" rel="noopener noreferrer">
                          <Button className="rounded-full px-6 font-semibold text-sm flex items-center gap-1.5">
                            Apply Now <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      ) : (
                        <Button variant="secondary" disabled className="rounded-full px-6 font-semibold text-sm">
                          Direct Contact Only
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {opp.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Posted by <span className="font-semibold text-foreground">{opp.profiles?.name || "Alumni User"}</span> ({opp.profiles?.role || "alumni"})
                    </span>
                    <span>Reference ID: #{opp.id.substring(0, 8)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
