'use client';

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, MapPin, Users, Share2 } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isAlumni, setIsAlumni] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', desc: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  async function fetchEvents() {
    const supabase = createClient();
    const { data } = await supabase.from('events').select(`*, profiles:created_by (name)`).order('created_at', { ascending: false });
    if (data) setEvents(data);
  }

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) Object.assign(user, data);
        setUserProfile(data || user);
        setIsAlumni(data?.role?.toLowerCase() === 'alumni' || user?.user_metadata?.role?.toLowerCase() === 'alumni');
      }
    }
    checkUser();
    fetchEvents();
  }, []);

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.desc || !newEvent.date) return;
    setSubmitting(true);
    const supabase = createClient();
    await supabase.from('events').insert({
      title: newEvent.title,
      description: newEvent.desc,
      date: newEvent.date,
      created_by: userProfile.id
    });
    setNewEvent({ title: '', desc: '', date: '' });
    setShowCreate(false);
    setSubmitting(false);
    fetchEvents(); // Refresh
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Filter & Create */}
      <div className="lg:col-span-3 space-y-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
            <h2 className="font-semibold text-lg">Your Events</h2>
            <p className="text-sm text-muted-foreground">Discover events tailored to your network.</p>
            {isAlumni && (
              <Button 
                onClick={() => setShowCreate(!showCreate)} 
                variant={showCreate ? 'secondary' : 'default'}
                className="w-full rounded-full font-semibold h-10 mt-2"
              >
                {showCreate ? 'Cancel Creation' : 'Create an event'}
              </Button>
            )}
          </CardContent>
        </Card>

        {showCreate && isAlumni && (
          <Card className="border-none shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm">Post New Event</h3>
            <div className="space-y-2 text-sm text-muted-foreground flex flex-col">
              <input type="text" placeholder="Event Title" className="border rounded p-2 focus:outline-none" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
              <input type="datetime-local" className="border rounded p-2 focus:outline-none" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
              <textarea placeholder="Description..." className="border rounded p-2 min-h-[80px] focus:outline-none" value={newEvent.desc} onChange={e => setNewEvent({...newEvent, desc: e.target.value})} />
              <Button onClick={handleCreateEvent} disabled={submitting}>{submitting ? 'Posting...' : 'Publish to Feed'}</Button>
            </div>
          </Card>
        )}

        <Card className="border-none shadow-sm hidden lg:block">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 space-y-2 mt-2">
            <div className="text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition p-2 hover:bg-muted rounded-md -mx-2">All Events</div>
            <div className="text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition p-2 hover:bg-muted rounded-md -mx-2 bg-muted/50 text-foreground border-l-4 border-primary pl-1">Networking</div>
            <div className="text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition p-2 hover:bg-muted rounded-md -mx-2">Webinars</div>
            <div className="text-sm font-semibold text-muted-foreground hover:text-foreground cursor-pointer transition p-2 hover:bg-muted rounded-md -mx-2">Hiring</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-9 space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Upcoming Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 && <p className="text-muted-foreground mt-4 text-sm col-span-2">No upcoming events posted yet.</p>}
          
          {events.map((event, i) => (
            <Card key={i} className="border border-border/50 shadow-sm flex flex-col hover:shadow-md transition">
              <div className="h-32 bg-stone-200 border-b border-border/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
              </div>
              <CardContent className="flex-1 p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-xl hover:text-primary cursor-pointer leading-tight mb-1">{event.title}</h3>
                  <div className="text-sm font-semibold text-primary">{new Date(event.date).toLocaleString()}</div>
                </div>
                
                <div className="space-y-1.5 text-sm text-muted-foreground border-l-2 pl-3 border-muted">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Global Virtual</div>
                </div>

                <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-muted/80">{event.profiles?.name?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                  <span className="text-xs text-muted-foreground">Hosted by <span className="font-semibold text-foreground">{event.profiles?.name || 'Anonymous'}</span></span>
                </div>
              </CardContent>
              <Separator />
              <div className="px-5 py-3 flex gap-3">
                <Button className="flex-1 rounded-full font-semibold shadow-sm">Attend</Button>
                <Button variant="outline" size="icon" className="rounded-full shadow-sm"><Share2 className="h-4 w-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
