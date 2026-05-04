'use client';

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Video, Edit, Search } from "lucide-react";

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) Object.assign(user, profile); // Decorate user with active profile data for UI matching

        const { data: others } = await supabase.from('profiles').select('*').neq('id', user.id);
        if (others && others.length > 0) {
          setUsers(others);
          setSelectedUser(others[0]);
        }
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedUser || !currentUser) return;
    const supabase = createClient();

    async function fetchHistory() {
      const { data } = await supabase.from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    }
    fetchHistory();

    const channel = supabase.channel(`chat_${selectedUser.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new;
        if (
          (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) || 
          (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
        ) {
          setMessages(prev => [...prev, msg]);
        }
      }).subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedUser || !currentUser) return;
    const supabase = createClient();
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content: text
    });
    setText("");
  };

  return (
    <Card className="border-none shadow-sm flex h-[80vh] min-h-[600px] overflow-hidden bg-white">
      {/* Left Pane - Conversation List */}
      <div className="w-1/3 border-r border-border flex flex-col min-w-[300px]">
        <div className="p-4 border-b border-border flex justify-between items-center bg-white px-4">
          <h2 className="text-md font-semibold">Messaging</h2>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground"><Edit className="h-5 w-5" /></Button>
          </div>
        </div>
        
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input className="pl-9 h-9 bg-[#edf3f8] border-none" placeholder="Search messages" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {users.map((u, i) => (
            <div 
              key={u.id} 
              onClick={() => setSelectedUser(u)}
              className={`flex gap-3 p-3 cursor-pointer transition-colors ${selectedUser?.id === u.id ? 'bg-muted/50 border-l-2 border-primary' : 'hover:bg-muted/30 border-l-2 border-transparent'}`}
            >
              <Avatar className="h-12 w-12 border shadow-sm mt-0.5">
                <AvatarFallback>{u.name ? u.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className={`text-md truncate font-semibold text-foreground`}>{u.name || 'Anonymous'}</span>
                </div>
                <p className={`text-sm truncate text-muted-foreground capitalize`}>{u.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane - Chat Window */}
      <div className="w-2/3 flex flex-col bg-white">
        <div className="px-6 py-3 border-b border-border flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-md font-bold text-foreground hover:underline cursor-pointer hover:text-primary">
              {selectedUser?.name || 'Select a user'}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">{selectedUser?.role || ''}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="font-semibold text-primary rounded-full hover:bg-primary/10">Back to profile</Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground"><MoreHorizontal className="h-5 w-5" /></Button>
          </div>
        </div>
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {selectedUser && (
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto border shadow-sm">
                <AvatarFallback>{selectedUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mt-2">{selectedUser.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{selectedUser.role}</p>
            </div>
          )}
          <Separator className="my-6" />
          
          {messages.map((m, i) => {
            const isMe = m.sender_id === currentUser?.id;
            return (
              <div key={m.id || i} className={`flex items-start gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                <Avatar className="h-10 w-10 border mt-0.5">
                  <AvatarFallback>{isMe ? currentUser?.name?.substring(0, 2).toUpperCase() || 'ME' : selectedUser?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className={`flex flex-col ${isMe ? 'items-end' : ''}`}>
                  <div className="flex items-baseline mb-1">
                    {!isMe && <span className="font-semibold text-sm mr-2 hover:underline cursor-pointer">{selectedUser?.name}</span>}
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    {isMe && <span className="font-semibold text-sm ml-2 hover:underline cursor-pointer">You</span>}
                  </div>
                  <p className={`text-sm p-3 rounded-lg border ${
                    isMe 
                      ? 'bg-[#0a66c2]/10 text-[#0a66c2] border-[#0a66c2]/20 rounded-tr-none' 
                      : 'bg-muted/40 rounded-tl-none border-border'
                  }`}>
                    {m.content}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Block */}
        <div className="p-4 border-t border-border bg-white mt-auto">
          <div className="relative flex items-center min-h-[100px] border border-[#dfdedb] rounded-md focus-within:border-black/60 focus-within:ring-1 focus-within:ring-black/60 bg-[#f9fafb] overflow-hidden p-2 pb-12">
             <textarea 
               className="w-full h-full resize-none bg-transparent border-none focus:outline-none focus:ring-0 text-sm p-1"
               placeholder="Write a message..."
               value={text}
               onChange={e => setText(e.target.value)}
               onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
             />
             <div className="absolute bottom-2 right-2 flex space-x-2">
                <Button size="sm" className="rounded-full h-8 px-4 font-semibold" onClick={handleSend} disabled={!text.trim() || !selectedUser}>Send</Button>
             </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
