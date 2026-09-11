import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { data: users, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { count: postCount } = await supabase.from("posts").select("*", { count: "exact", head: true });
    const { count: oppCount } = await supabase.from("opportunities").select("*", { count: "exact", head: true });
    const { count: eventCount } = await supabase.from("events").select("*", { count: "exact", head: true });

    const totalUsers = users?.length || 0;
    const alumniCount = users?.filter(u => u.role === "alumni").length || 0;
    const studentCount = users?.filter(u => u.role === "student").length || 0;
    const adminCount = users?.filter(u => u.role === "admin").length || 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        alumniCount,
        studentCount,
        adminCount,
        postCount: postCount || 0,
        oppCount: oppCount || 0,
        eventCount: eventCount || 0
      },
      users: users || []
    }, { status: 200 });
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

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
