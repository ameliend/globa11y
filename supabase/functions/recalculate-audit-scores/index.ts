import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all reports with their pages and criteria results
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, audit_pages(id, criteria_results(code, status))');

    if (reportsError) throw reportsError;

    const updates = [];
    
    for (const report of reports || []) {
      // Count unique compliant and not-applicable criteria codes across all pages
      const compliantCodes = new Set<string>();
      const notApplicableCodes = new Set<string>();
      
      if (report.audit_pages && Array.isArray(report.audit_pages)) {
        for (const page of report.audit_pages) {
          if (page.criteria_results && Array.isArray(page.criteria_results)) {
            for (const criterion of page.criteria_results) {
              if (criterion.status === 'compliant') {
                compliantCodes.add(criterion.code);
              }
              if (criterion.status === 'not-applicable') {
                notApplicableCodes.add(criterion.code);
              }
            }
          }
        }
      }
      
      // Calculate new score: (unique compliant + unique not-applicable) / 55 * 100
      const newScore = Math.round(((compliantCodes.size + notApplicableCodes.size) / 55) * 100);
      
      // Update the report score
      const { error: updateError } = await supabase
        .from('reports')
        .update({ score: newScore })
        .eq('id', report.id);
      
      if (updateError) {
        console.error(`Error updating report ${report.id}:`, updateError);
      } else {
        updates.push({
          reportId: report.id,
          oldScore: null,
          newScore,
          compliant: compliantCodes.size,
          notApplicable: notApplicableCodes.size,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Recalculated scores for ${updates.length} reports`,
        updates,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
