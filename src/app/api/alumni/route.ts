import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const role = searchParams.get("role") || "";
    const company = searchParams.get("company") || "";
    const skill = searchParams.get("skill") || "";
    const batch = searchParams.get("batch") || "";
    const branch = searchParams.get("branch") || "";

    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });

    if (q) {
      query = query.ilike("name", `%${q}%`);
    }
    if (role) {
      query = query.eq("role", role.toLowerCase());
    }
    if (company) {
      query = query.ilike("company", `%${company}%`);
    }
    if (skill) {
      query = query.contains("skills", [skill]);
    }
    if (batch) {
      query = query.ilike("batch", `%${batch}%`);
    }
    if (branch) {
      query = query.ilike("degree_branch", `%${branch}%`);
    }

    const { data: profiles, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: profiles || [], count: profiles?.length || 0 }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
