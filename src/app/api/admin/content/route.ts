import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const contentType = searchParams.get("type"); // 'post' | 'event' | 'opportunity'
    const contentId = searchParams.get("id");

    if (!contentType || !contentId) {
      return NextResponse.json({ error: "contentType and contentId query parameters are required" }, { status: 400 });
    }

    let tableName = "";
    if (contentType === "post") tableName = "posts";
    else if (contentType === "event") tableName = "events";
    else if (contentType === "opportunity") tableName = "opportunities";
    else {
      return NextResponse.json({ error: "Invalid contentType. Allowed: 'post', 'event', 'opportunity'" }, { status: 400 });
    }

    const { error } = await supabase.from(tableName).delete().eq("id", contentId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: `${contentType} content deleted successfully` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
