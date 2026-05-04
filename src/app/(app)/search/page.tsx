'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchName, setSearchName] = useState(q);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSkill, setFilterSkill] = useState('');

  useEffect(() => {
    async function fetchResults() {
      const supabase = createClient();
      let query = supabase.from('profiles').select('*');

      if (searchName) {
        query = query.ilike('name', `%${searchName}%`);
      }
      if (filterCompany) {
        query = query.ilike('company', `%${filterCompany}%`);
      }
      if (filterSkill) {
        query = query.contains('skills', [filterSkill]);
      }

      const { data } = await query;
      if (data) setProfiles(data);
    }
    
    // Add a slight debounce conceptually by letting React batch, or just fetch directly
    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchName, filterCompany, filterSkill]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
      {/* Filters Sidebar */}
      <div className="md:col-span-1 lg:col-span-3 space-y-4">
        <Card className="border-none shadow-sm pb-4">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold">Filter Search</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 space-y-4 text-sm mt-3">
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Name</label>
              <Input 
                 placeholder="Search by name" 
                 className="h-8" 
                 value={searchName}
                 onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Company</label>
              <Input 
                 placeholder="Filter by company" 
                 className="h-8" 
                 value={filterCompany}
                 onChange={(e) => setFilterCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground">Skills</label>
              <Input 
                 placeholder="Exact skill (e.g. React)" 
                 className="h-8" 
                 value={filterSkill}
                 onChange={(e) => setFilterSkill(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="secondary" className="font-normal text-xs px-2 cursor-pointer hover:bg-muted" onClick={() => setFilterSkill('React')}>React +</Badge>
                <Badge variant="secondary" className="font-normal text-xs px-2 cursor-pointer hover:bg-muted" onClick={() => setFilterSkill('Design')}>Design +</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Results */}
      <div className="md:col-span-3 lg:col-span-9 space-y-4">
        <Card className="border-none shadow-sm">
          <div className="p-4 bg-white rounded-t-lg">
            <h2 className="text-lg font-semibold text-foreground">Showing {profiles.length} results</h2>
          </div>
          <Separator />
          <div className="flex flex-col">
            {profiles.length === 0 && <div className="p-8 text-center text-muted-foreground">No profiles found matching your query.</div>}
            
            {profiles.map((user, idx) => (
              <div key={user.id || idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-muted/30 transition-colors border-b border-border last:border-b-0">
                <Link href={`/profile/${user.id}`}>
                  <Avatar className="h-16 w-16 border shadow-sm cursor-pointer hover:opacity-80">
                    <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <Link href={`/profile/${user.id}`}>
                    <h3 className="text-md font-bold text-foreground hover:text-primary hover:underline cursor-pointer">{user.name || 'Anonymous'} <span className="text-xs font-normal text-muted-foreground capitalize">({user.role})</span></h3>
                  </Link>
                  <p className="text-sm text-foreground mt-0.5">{user.company || 'Open to opportunities'}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.skills && user.skills.map((skill: string, sIdx: number) => (
                      <Badge key={sIdx} variant="secondary" className="px-2 font-semibold text-[10px] bg-secondary text-secondary-foreground">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                  <Link href={`/profile/${user.id}`}>
                    <Button className="w-full rounded-full font-semibold">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
