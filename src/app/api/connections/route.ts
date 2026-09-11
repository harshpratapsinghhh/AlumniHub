import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: connections, error } = await supabase
      .from("connections")
      .select("*, requester:requester_id(*), recipient:recipient_id(*)")
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const pendingRequests = connections?.filter(c => c.recipient_id === user.id && c.status === "pending") || [];
    const activeConnections = connections?.filter(c => c.status === "accepted") || [];

    return NextResponse.json({
      all: connections || [],
      pendingRequests,
      activeConnections,
      count: activeConnections.length
    }, { status: 200 });
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

    const body = await request.json();
    const { recipient_id } = body;

    if (!recipient_id) {
      return NextResponse.json({ error: "Recipient ID is required" }, { status: 400 });
    }

    if (recipient_id === user.id) {
      return NextResponse.json({ error: "You cannot connect with yourself" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("connections")
      .select("*")
      .or(`and(requester_id.eq.${user.id},recipient_id.eq.${recipient_id}),and(requester_id.eq.${recipient_id},recipient_id.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: `Connection request already exists with status: ${existing.status}` }, { status: 400 });
    }

    const { data: connection, error } = await supabase
      .from("connections")
      .insert({
        requester_id: user.id,
        recipient_id,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Connection request sent", data: connection }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !["accepted", "declined"].includes(status)) {
      return NextResponse.json({ error: "Valid connection ID and status ('accepted' or 'declined') required" }, { status: 400 });
    }

    const { data: connection, error } = await supabase
      .from("connections")
      .update({ status })
      .eq("id", id)
      .or(`recipient_id.eq.${user.id},requester_id.eq.${user.id}`)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: `Connection ${status}`, data: connection }, { status: 200 });
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
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", id)
      .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Connection removed successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
