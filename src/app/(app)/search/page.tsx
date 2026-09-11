'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, GraduationCap, Building2, MapPin, Filter, RotateCcw } from "lucide-react";
import Link from 'next/link';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialRole = searchParams.get('role') || 'all';
  
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchName, setSearchName] = useState(initialQ);
  const [filterRole, setFilterRole] = useState(initialRole);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

    if (searchName) {
      query = query.ilike('name', `%${searchName}%`);
    }
    if (filterRole && filterRole !== 'all') {
      query = query.eq('role', filterRole.toLowerCase());
    }
    if (filterCompany) {
      query = query.ilike('company', `%${filterCompany}%`);
    }
    if (filterSkill) {
      query = query.contains('skills', [filterSkill]);
    }
    if (filterBatch) {
      query = query.or(`batch.ilike.%${filterBatch}%,graduation_year.ilike.%${filterBatch}%`);
    }
    if (filterBranch) {
      query = query.ilike('degree_branch', `%${filterBranch}%`);
    }

    const { data } = await query;
    if (data) setProfiles(data);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [searchName, filterRole, filterCompany, filterSkill, filterBatch, filterBranch]);

  const handleResetFilters = () => {
    setSearchName('');
    setFilterRole('all');
    setFilterCompany('');
    setFilterSkill('');
    setFilterBatch('');
    setFilterBranch('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6">
      {/* Filters Sidebar */}
      <div className="md:col-span-1 lg:col-span-3 space-y-4">
        <Card className="border-none shadow-sm bg-white pb-4">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-primary" /> Directory Filters
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground px-2"
              onClick={handleResetFilters}
            >
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
          </CardHeader>

          <CardContent className="px-4 pt-3 space-y-4 text-xs">
            {/* Search by Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Name</label>
              <Input 
                placeholder="Search by name..." 
                className="h-9 text-xs bg-muted/20" 
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>

            {/* Filter by Role */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Role</label>
              <select
                className="w-full h-9 px-3 border border-border rounded-md bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles (Alumni & Students)</option>
                <option value="alumni">Alumni Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>

            {/* Filter by Company */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Company / Organization</label>
              <Input 
                placeholder="Filter by company (e.g. Google)..." 
                className="h-9 text-xs bg-muted/20" 
                value={filterCompany}
                onChange={(e) => setFilterCompany(e.target.value)}
              />
            </div>

            {/* Filter by Skills */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Skills</label>
              <Input 
                placeholder="Exact skill (e.g. React)..." 
                className="h-9 text-xs bg-muted/20" 
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['React', 'Next.js', 'Python', 'Node.js', 'Java'].map(s => (
                  <Badge 
                    key={s} 
                    variant="secondary" 
                    className="font-normal text-[10px] px-2 py-0.5 cursor-pointer hover:bg-primary/20"
                    onClick={() => setFilterSkill(s)}
                  >
                    + {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Filter by Batch / Year */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Graduation Year / Batch</label>
              <Input 
                placeholder="e.g. 2024, 2023" 
                className="h-9 text-xs bg-muted/20" 
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
              />
            </div>

            {/* Filter by Degree / Branch */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Degree / Branch</label>
              <Input 
                placeholder="e.g. Computer Science" 
                className="h-9 text-xs bg-muted/20" 
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Results */}
      <div className="md:col-span-3 lg:col-span-9 space-y-4">
        <Card className="border-none shadow-sm bg-white overflow-hidden">
          <div className="p-4 bg-white flex justify-between items-center border-b">
            <h2 className="text-base font-bold text-foreground">
              Directory Results <span className="text-xs font-normal text-muted-foreground">({profiles.length} profiles found)</span>
            </h2>
          </div>
          
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground text-sm">Searching directory...</div>
            ) : profiles.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No profiles matched your filter criteria. Try adjusting your search keywords or resetting filters.
              </div>
            ) : (
              profiles.map((user) => (
                <div key={user.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-muted/20 transition-colors">
                  <Link href={`/profile/${user.id}`}>
                    <Avatar className="h-16 w-16 border shadow-sm cursor-pointer hover:opacity-80">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/profile/${user.id}`}>
                        <h3 className="text-md font-bold text-foreground hover:text-primary cursor-pointer truncate">
                          {user.name || 'Anonymous User'}
                        </h3>
                      </Link>
                      <Badge variant="outline" className="capitalize text-[10px] font-bold bg-primary/10 text-primary border-none">
                        {user.role || 'member'}
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground font-semibold mt-0.5">
                      {user.company ? `${user.role} at ${user.company}` : 'Open to opportunities'}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                      {user.degree_branch && (
                        <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {user.degree_branch} ({user.graduation_year || user.batch || 'Batch'})</span>
                      )}
                      {user.location && (
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {user.location}</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.skills && user.skills.map((skill: string, sIdx: number) => (
                        <Badge key={sIdx} variant="secondary" className="px-2 font-medium text-[10px] bg-muted text-foreground">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <Link href={`/profile/${user.id}`}>
                      <Button size="sm" className="w-full rounded-full font-semibold px-6 text-xs">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-muted-foreground text-sm">Loading Search Directory...</div>}>
      <SearchContent />
    </Suspense>
  );
}
