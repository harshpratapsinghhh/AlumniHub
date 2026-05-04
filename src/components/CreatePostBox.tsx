'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function CreatePostBox({ profile }: { profile: any }) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const router = useRouter();

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('posts').insert({
        author_id: user.id,
        content: content,
        image_url: imageUrl || null
      });
      setContent('');
      setImageUrl('');
      router.refresh();
    }
    setIsPosting(false);
  };

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 border">
            <AvatarFallback>{profile?.name ? profile.name.substring(0, 2).toUpperCase() : 'ME'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Start a post or share an event..."
               className="w-full text-foreground resize-none border-none bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary rounded-xl p-3 min-h-[80px]"
            />
            <Input 
               value={imageUrl}
               onChange={(e) => setImageUrl(e.target.value)}
               placeholder="Optional: Paste a photo URL..."
               className="h-8 text-xs bg-muted/20"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-border">
          <Button 
            disabled={!content.trim() || isPosting} 
            onClick={handlePost} 
            className="rounded-full font-semibold px-6"
          >
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
