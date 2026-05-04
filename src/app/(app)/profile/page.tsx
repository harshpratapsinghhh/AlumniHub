'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ bio: '', company: '', avatar_url: '', banner_url: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setEditForm({ bio: data.bio || '', company: data.company || '', avatar_url: data.avatar_url || '', banner_url: data.banner_url || '' });
        } else {
          setProfile({ email: user.email, name: user.user_metadata?.name || 'User', role: user.user_metadata?.role || 'Alumni' });
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
      await supabase.from('profiles').update({
        bio: editForm.bio,
        company: editForm.company,
        avatar_url: editForm.avatar_url,
        banner_url: editForm.banner_url
      }).eq('id', user.id);
      
      setProfile({ ...profile, bio: editForm.bio, company: editForm.company, avatar_url: editForm.avatar_url, banner_url: editForm.banner_url });
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Profile Card */}
      <Card className="border-none shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div 
          className="h-48 bg-muted relative" 
          style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          {isEditing && (
            <input 
              value={editForm.banner_url}
              onChange={e => setEditForm({...editForm, banner_url: e.target.value})}
              placeholder="Paste Background Banner Image URL..."
              className="absolute top-4 left-4 right-20 text-sm border-none shadow-sm rounded-md p-2 bg-white/90 focus:outline-none"
            />
          )}
        </div>
        
        {/* Profile Content */}
        <CardContent className="px-6 pb-6 relative">
          {/* Avatar over cover border */}
          <div className="flex justify-between items-start">
            <Avatar className="h-32 w-32 -mt-16 border-4 border-white ring-4 ring-white bg-background z-10">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="text-4xl">{profile?.name ? profile.name.substring(0, 1).toUpperCase() : "..."}</AvatarFallback>
            </Avatar>
            <div className="mt-4 flex gap-2">
              <Button className="rounded-full px-6 font-semibold">Open to</Button>
              <Button variant="outline" className="rounded-full px-6 font-semibold border-primary text-primary">Add profile section</Button>
              <Button 
                variant="secondary" 
                className="rounded-full px-6 font-semibold bg-muted"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel Edit' : 'Edit profile'}
              </Button>
            </div>
          </div>
          
          {/* Info */}
          <div className="mt-4 max-w-2xl">
            <h1 className="text-xl font-bold">{profile?.name || "Loading..."}</h1>
            
            {isEditing ? (
               <div className="mt-2 space-y-2">
                 <input 
                   value={editForm.company}
                   onChange={(e) => setEditForm({...editForm, company: e.target.value})}
                   placeholder="Where do you work?"
                   className="text-md w-full border border-border p-2 rounded-md"
                 />
                 <input 
                   value={editForm.avatar_url}
                   onChange={(e) => setEditForm({...editForm, avatar_url: e.target.value})}
                   placeholder="Paste Avatar Image URL..."
                   className="text-sm w-full border border-border p-2 rounded-md"
                 />
               </div>
            ) : (
               <p className="text-md mt-1 text-foreground font-medium capitalize">
                 {profile?.role || "Member"} {profile?.company ? `at ${profile.company}` : 'at AlumniHub'}
               </p>
            )}

            <p className="text-sm text-muted-foreground mt-2">New Delhi, India • <span className="text-primary font-semibold hover:underline cursor-pointer">Contact info</span></p>
            <p className="text-sm font-semibold text-primary mt-2 hover:underline cursor-pointer">500+ connections</p>
          </div>
          
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-[#edf3f8] text-foreground font-semibold px-3 py-1 rounded-sm border-none">
              #OpenToWork
            </Badge>
            <Badge variant="outline" className="bg-[#edf3f8] text-foreground font-semibold px-3 py-1 rounded-sm border-none">
              #Hiring
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* About Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">About</h2>
            {isEditing && (
               <Button size="sm" onClick={handleSave} disabled={isSaving}>
                 {isSaving ? "Saving..." : "Save Changes"}
               </Button>
            )}
          </div>
          
          {isEditing ? (
             <textarea 
               value={editForm.bio}
               onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
               className="w-full min-h-[120px] p-3 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
               placeholder="Write a little about yourself..."
             />
          ) : (
             <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
               {profile?.bio || `Experienced ${profile?.role || 'professional'} with a demonstrated history of working seamlessly within the AlumniHub network. Looking forward to making new connections!`}
             </p>
          )}
        </CardContent>
      </Card>
      
      {/* Skills Section */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Skills</h2>
            <Button variant="ghost" size="sm" className="rounded-full px-4 text-primary font-semibold hover:bg-primary/10">
              Add skill
            </Button>
          </div>
          <div className="space-y-4">
            {[
              { name: "React Navigation", endorsements: 12 },
              { name: "Next.js App Router", endorsements: 8 },
              { name: "Supabase Auth", endorsements: 5 }
            ].map((skill, index) => (
              <div key={index}>
                <div className="py-2">
                  <h3 className="font-semibold text-sm">{skill.name}</h3>
                  <div className="flex items-center gap-2 mt-1 -ml-1">
                    <div className="flex -space-x-2">
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-[10px]">A</AvatarFallback></Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-[10px]">B</AvatarFallback></Avatar>
                      <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback className="text-[10px]">C</AvatarFallback></Avatar>
                    </div>
                    <span className="text-xs text-muted-foreground">{skill.endorsements} endorsements</span>
                  </div>
                </div>
                {index !== 2 && <Separator className="mt-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
