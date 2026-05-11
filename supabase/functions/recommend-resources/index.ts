import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      currentScore,
      targetScore,
      sectionObstacle,
      weeklyHours,
      testTimeline,
      budget,
      learningFormat,
      experience,
    } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: resources, error: dbError } = await supabase
      .from("lsat_resources")
      .select("*");

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    const resourceList = resources
      .map(
        (r: Record<string, string>) =>
          `- ${r.resource_name} | Category: ${r.category} | Format: ${r.format} | Section: ${r.section_focus} | Cost: ${r.cost_type} (${r.price_range}) | Score Range: ${r.best_score_range} | Timeline: ${r.best_for_timeline} | Hours/wk: ${r.weekly_hours} | Level: ${r.experience_level} | Tags: ${r.tags} | URL: ${r.url} | Description: ${r.description}`
      )
      .join("\n");

    const scoreGap =
      currentScore === "no_score"
        ? "No practice test taken yet (complete beginner)"
        : `Current score: ${currentScore}, Target score: ${targetScore} (gap of ${Number(targetScore) - Number(currentScore)} points)`;

    const studentProfile = `
STUDENT PROFILE:
- ${scoreGap}
- Biggest section obstacle: ${sectionObstacle}
- Weekly study hours available: ${weeklyHours}
- Test timeline: ${testTimeline}
- Budget for study materials: ${budget}
- Preferred learning format: ${learningFormat}
- LSAT experience: ${experience}
`;

    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: `You are an expert LSAT prep advisor. Your job is to analyze a student's profile and recommend exactly 5 LSAT resources from the provided list that best match their needs.

REASONING PROCESS — apply in this order:
1. HARD FILTER: Eliminate any resource whose cost exceeds the student's budget
2. SECTION MATCH: Prioritize resources targeting the student's obstacle section (or "All")
3. SCORE MATCH: Prefer resources appropriate for the student's current score range and gap size
4. TIMELINE MATCH: Prefer resources suited to the student's test timeline
5. FORMAT MATCH: Strongly prefer resources that match the student's preferred learning format
6. EXPERIENCE MATCH: If retaker, prefer resources focused on diagnosis and targeted improvement
7. HOURS MATCH: Prefer resources appropriate for the student's weekly study time

Return ONLY a valid JSON array. No explanation text outside the JSON. Format:
[
  {
    "rank": 1,
    "resource_name": "exact name from list",
    "category": "category from list",
    "url": "url from list",
    "price_range": "price from list",
    "section_focus": "section from list",
    "why_this_fits_you": "2-3 sentence personalized explanation written directly to the student explaining exactly why this resource matches their specific situation"
  },
  ...
]`,
        messages: [
          {
            role: "user",
            content: `${studentProfile}\n\nAVAILABLE RESOURCES:\n${resourceList}\n\nReturn your top 5 recommendations as a JSON array.`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      throw new Error(`Claude API error: ${claudeResponse.status}`);
    }

    const claudeData = await claudeResponse.json();
    const rawContent = claudeData.content[0].text.trim();

    let recommendations;
    try {
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      recommendations = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      throw new Error("Failed to parse Claude response as JSON");
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Something went wrong. Please try again.",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});