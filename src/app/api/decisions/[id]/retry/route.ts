import { NextResponse, after } from "next/server";
import { getLocale } from "next-intl/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { Llm } from "@/services/llm.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const locale = await getLocale();
  const { error } = await supabase
    .from("decisions")
    .update({ status: "processing", error_message: null, language: locale })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  after(() => Llm.runAnalysis(id));

  return NextResponse.json({ ok: true }, { status: 202 });
}
