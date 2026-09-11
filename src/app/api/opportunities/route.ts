import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q") || "";
    const jobType = searchParams.get("job_type") || "";
    const location = searchParams.get("location") || "";

    let query = supabase
      .from("opportunities")
      .select("*, profiles:author_id(name, email, avatar_url, role, company)")
      .order("created_at", { ascending: false });

    if (q) {
      query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (jobType && jobType !== "all") {
      query = query.eq("job_type", jobType);
    }
    if (location) {
      query = query.ilike("location", `%${location}%`);
    }

    const { data: opportunities, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: opportunities || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const userRole = (profile?.role || user.user_metadata?.role || "").toLowerCase();
    if (userRole !== "alumni" && userRole !== "admin") {
      return NextResponse.json({ error: "Forbidden: Only alumni and admins can post opportunities." }, { status: 403 });
    }

    const body = await request.json();
    const { title, company, location, job_type, description, application_link } = body;

    if (!title || !company || !location || !job_type || !description) {
      return NextResponse.json({ error: "Missing required fields: title, company, location, job_type, description" }, { status: 400 });
    }

    const validJobTypes = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
    if (!validJobTypes.includes(job_type)) {
      return NextResponse.json({ error: `Invalid job_type. Allowed: ${validJobTypes.join(", ")}` }, { status: 400 });
    }

    const { data: newOpp, error } = await supabase
      .from("opportunities")
      .insert({
        author_id: user.id,
        title,
        company,
        location,
        job_type,
        description,
        application_link: application_link || null
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Opportunity created successfully", data: newOpp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const isAdmin = profile?.role === "admin";

    let deleteQuery = supabase.from("opportunities").delete().eq("id", id);
    if (!isAdmin) {
      deleteQuery = deleteQuery.eq("author_id", user.id);
    }

    const { error } = await deleteQuery;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Opportunity deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
