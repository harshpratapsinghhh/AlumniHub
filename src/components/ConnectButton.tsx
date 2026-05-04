'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ConnectButton({ profileId, initialStatus }: { profileId: string, initialStatus: string | null }) {
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConnect = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('connections').insert({
        requester_id: user.id,
        recipient_id: profileId,
        status: 'pending'
      });
      setStatus('pending');
      router.refresh();
    }
    setLoading(false);
  };

  if (status === 'accepted') {
    return <Button variant="secondary" disabled className="rounded-full px-6 font-semibold bg-muted">Connected</Button>;
  }
  if (status === 'pending') {
    return <Button variant="secondary" disabled className="rounded-full px-6 font-semibold bg-muted">Pending</Button>;
  }

  return (
    <Button 
      onClick={handleConnect} 
      disabled={loading}
      className="rounded-full px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {loading ? 'Connecting...' : 'Connect'}
    </Button>
  );
}
