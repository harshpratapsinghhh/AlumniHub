'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function ConnectionRequests({ requests }: { requests: any[] }) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const router = useRouter();

  if (requests.length === 0) return null;

  const handleUpdate = async (id: string, status: 'accepted' | 'declined') => {
    setLoadingIds(prev => [...prev, id]);
    const supabase = createClient();
    await supabase.from('connections').update({ status }).eq('id', id);
    router.refresh();
  };

  return (
    <Card className="border-none shadow-sm mb-6 bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h2 className="text-lg font-bold text-foreground">Invitations</h2>
      </div>
      <div className="divide-y divide-border">
        {requests.map(req => {
          const u = req.profiles;
          const isLoading = loadingIds.includes(req.id);
          return (
            <div key={req.id} className="p-4 flex items-center gap-4 hover:bg-muted/10 transition">
              <Avatar className="h-16 w-16 border shadow-sm">
                <AvatarImage src={u.avatar_url || ""} />
                <AvatarFallback>{u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground hover:underline cursor-pointer">{u.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">{u.role} {u.company && `at ${u.company}`}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                   variant="ghost" 
                   disabled={isLoading}
                   onClick={() => handleUpdate(req.id, 'declined')}
                   className="rounded-full font-semibold px-4 hover:bg-muted/50"
                >
                  Ignore
                </Button>
                <Button 
                   disabled={isLoading}
                   onClick={() => handleUpdate(req.id, 'accepted')}
                   className="rounded-full font-semibold px-6 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary"
                >
                  Accept
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
