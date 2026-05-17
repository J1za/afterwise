import { NextResponse, after } from "next/server";
import { getLocale } from "next-intl/server";
import { getServerSupabase } from "@/lib/supabaseServer";
import { Llm } from "@/services/llm.service";
import { createDecisionInputSchema } from "@/validations";

export async function POST(request: Request) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createDecisionInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const locale = await getLocale();
  const { data, error } = await supabase
    .from("decisions")
    .insert({
      user_id: user.id,
      situation: parsed.data.situation,
      decision: parsed.data.decision,
      reasoning: parsed.data.reasoning ?? null,
      status: "processing",
      language: locale,
    })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "insert_failed" },
      { status: 500 },
    );
  }

  after(() => Llm.runAnalysis(data.id));

  return NextResponse.json(data, { status: 201 });
}
