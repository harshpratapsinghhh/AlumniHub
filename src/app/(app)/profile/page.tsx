'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapPin, GraduationCap, Building2, Globe, Code2, Edit2, Plus, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newSkillInput, setNewSkillInput] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  const [editForm, setEditForm] = useState({
    name: '',
    company: '',
    location: '',
    graduation_year: '',
    degree_branch: '',
    batch: '',
    bio: '',
    avatar_url: '',
    banner_url: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setEditForm({
            name: data.name || '',
            company: data.company || '',
            location: data.location || '',
            graduation_year: data.graduation_year || '',
            degree_branch: data.degree_branch || '',
            batch: data.batch || '',
            bio: data.bio || '',
            avatar_url: data.avatar_url || '',
            banner_url: data.banner_url || '',
            linkedin_url: data.linkedin_url || '',
            github_url: data.github_url || '',
            portfolio_url: data.portfolio_url || ''
          });
        } else {
          setProfile({ email: user.email, name: user.user_metadata?.name || 'User', role: user.user_metadata?.role || 'student' });
        }
      }
    }
    fetchUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updates = {
        name: editForm.name,
        company: editForm.company,
        location: editForm.location,
        graduation_year: editForm.graduation_year,
        degree_branch: editForm.degree_branch,
        batch: editForm.batch,
        bio: editForm.bio,
        avatar_url: editForm.avatar_url,
        banner_url: editForm.banner_url,
        linkedin_url: editForm.linkedin_url,
        github_url: editForm.github_url,
        portfolio_url: editForm.portfolio_url
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Profile updated successfully!");
        setProfile({ ...profile, ...updates });
        setIsEditing(false);
      }
    }
    setIsSaving(false);
  };

  const handleAddSkill = async () => {
    if (!newSkillInput.trim() || !profile) return;
    const currentSkills = profile.skills || [];
    if (currentSkills.includes(newSkillInput.trim())) {
      toast.error("Skill already added");
      return;
    }
    const updatedSkills = [...currentSkills, newSkillInput.trim()];

    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ skills: updatedSkills }).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, skills: updatedSkills });
      setNewSkillInput("");
      setShowSkillInput(false);
      toast.success("Skill added!");
    }
  };

  const handleRemoveSkill = async (skillToRemove: string) => {
    if (!profile) return;
    const updatedSkills = (profile.skills || []).filter((s: string) => s !== skillToRemove);
    const supabase = createClient();
    const { error } = await supabase.from('profiles').update({ skills: updatedSkills }).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, skills: updatedSkills });
      toast.success("Skill removed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Cover Banner & Profile Card */}
      <Card className="border-none shadow-sm overflow-hidden bg-white">
        <div 
          className="h-48 bg-gradient-to-r from-primary/30 to-muted relative" 
          style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {isEditing && (
            <input 
              value={editForm.banner_url}
              onChange={e => setEditForm({...editForm, banner_url: e.target.value})}
              placeholder="Paste Cover Banner Image URL..."
              className="absolute top-4 left-4 right-4 text-xs border-none shadow-sm rounded-md p-2 bg-white/90 focus:outline-none"
            />
          )}
        </div>
        
        <CardContent className="px-6 pb-6 relative">
          <div className="flex justify-between items-start">
            <Avatar className="h-32 w-32 -mt-16 border-4 border-white ring-4 ring-white bg-background shadow-md">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                {profile?.name ? profile.name.substring(0, 1).toUpperCase() : "ME"}
              </AvatarFallback>
            </Avatar>
            <div className="mt-4 flex gap-2">
              <Button 
                variant={isEditing ? "secondary" : "default"} 
                className="rounded-full px-6 font-semibold flex items-center gap-1.5"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4" /> {isEditing ? 'Cancel Edit' : 'Edit profile'}
              </Button>
              {isEditing && (
                <Button className="rounded-full px-6 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4 max-w-3xl">
            {isEditing ? (
              <div className="space-y-3 mt-2 bg-muted/20 p-4 rounded-xl border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Full Name</label>
                    <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Company / Current Role</label>
                    <Input value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} placeholder="e.g. Amazon, Student" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold">Location</label>
                    <Input value={editForm.location} onChange={e => setEditForm({...editForm, location: e.target.value})} placeholder="e.g. New Delhi, India" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Degree / Branch</label>
                    <Input value={editForm.degree_branch} onChange={e => setEditForm({...editForm, degree_branch: e.target.value})} placeholder="e.g. B.Tech Computer Science" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Graduation Year / Batch</label>
                    <Input value={editForm.graduation_year} onChange={e => setEditForm({...editForm, graduation_year: e.target.value})} placeholder="e.g. 2024" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold">Avatar Image URL</label>
                  <Input value={editForm.avatar_url} onChange={e => setEditForm({...editForm, avatar_url: e.target.value})} placeholder="https://..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold">LinkedIn Profile URL</label>
                    <Input value={editForm.linkedin_url} onChange={e => setEditForm({...editForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">GitHub Profile URL</label>
                    <Input value={editForm.github_url} onChange={e => setEditForm({...editForm, github_url: e.target.value})} placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold">Portfolio Website URL</label>
                    <Input value={editForm.portfolio_url} onChange={e => setEditForm({...editForm, portfolio_url: e.target.value})} placeholder="https://..." />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {profile?.name || "Loading..."}
                  <Badge variant="outline" className="capitalize text-xs font-semibold bg-primary/10 text-primary border-none">
                    {profile?.role || "student"}
                  </Badge>
                </h1>
                
                <p className="text-md mt-1 text-foreground font-semibold">
                  {profile?.company ? `${profile.role} at ${profile.company}` : `AlumniHub ${profile?.role || 'Member'}`}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                  {profile?.location && (
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {profile.location}</span>
                  )}
                  {profile?.degree_branch && (
                    <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.degree_branch} ({profile.graduation_year || profile.batch || 'Batch'})</span>
                  )}
                  <span className="text-primary font-bold">500+ Connections</span>
                </div>

                {/* Social Buttons */}
                <div className="flex gap-2 mt-4">
                  {profile?.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50">
                        <Globe className="h-3.5 w-3.5" /> LinkedIn
                      </Button>
                    </a>
                  )}
                  {profile?.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-stone-300 text-stone-800 hover:bg-stone-100">
                        <Code2 className="h-3.5 w-3.5" /> GitHub
                      </Button>
                    </a>
                  )}
                  {profile?.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full text-xs font-semibold flex items-center gap-1.5 border-emerald-200 text-emerald-600 hover:bg-emerald-50">
                        <Globe className="h-3.5 w-3.5" /> Portfolio
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* About Section */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <h2 className="text-lg font-bold mb-3 text-foreground">About</h2>
          {isEditing ? (
            <textarea 
              value={editForm.bio}
              onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
              className="w-full min-h-[120px] p-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              placeholder="Write a brief professional summary about yourself..."
            />
          ) : (
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {profile?.bio || `Experienced ${profile?.role || 'professional'} active in the AlumniHub network. Connect to discuss industry opportunities, career guidance, and campus updates.`}
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Skills Section */}
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-foreground">Skills & Expertise</h2>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs font-semibold flex items-center gap-1"
              onClick={() => setShowSkillInput(!showSkillInput)}
            >
              <Plus className="h-3.5 w-3.5" /> Add Skill
            </Button>
          </div>

          {showSkillInput && (
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="e.g. React, Next.js, System Design"
                className="text-xs h-9"
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
              />
              <Button size="sm" onClick={handleAddSkill} className="h-9 px-4 font-semibold text-xs">
                Add
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-xs font-medium bg-muted text-foreground flex items-center gap-1.5"
                >
                  {skill}
                  <span
                    className="cursor-pointer text-muted-foreground hover:text-destructive font-bold ml-1"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ×
                  </span>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No skills added yet. Click "Add Skill" above to list your core competencies.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
