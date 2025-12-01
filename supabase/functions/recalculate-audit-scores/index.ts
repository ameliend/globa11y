import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Native App allowed criteria (41 total)
const nativeAppCriteria = new Set([
  '1.1.1', '1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5',
  '3.14', '3.15', '3.16', '3.17',
  '1.3.1', '1.3.2', '1.3.3', '1.3.4', '1.3.5',
  '1.4.1', '1.4.2', '1.4.3', '1.4.4', '1.4.5', '1.4.10', '1.4.11', '1.4.12', '1.4.13',
  '2.1.1', '2.1.2', '2.1.4', '2.2.1', '2.2.2', '2.3.1', '2.4.3', '2.4.4', '2.4.6', '2.4.7',
  '2.5.1', '2.5.2', '2.5.3', '2.5.4',
  '3.1.1', '3.2.1', '3.2.2', '3.3.1', '3.3.2', '3.3.3', '3.3.4',
  '4.1.1', '4.1.2', '4.1.3'
]);

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
      .select('id, audit_type, audit_pages(id, criteria_results(code, status))');

    if (reportsError) throw reportsError;

    const updates = [];
    
    for (const report of reports || []) {
      const isNative = report.audit_type === 'native-app';
      const totalCriteria = isNative ? 41 : 55;
      
      // Track criteria status across all pages (pessimistic aggregation)
      const perCodeStatus = new Map<string, { hasCompliant: boolean; hasNonCompliant: boolean }>();
      
      if (report.audit_pages && Array.isArray(report.audit_pages)) {
        for (const page of report.audit_pages) {
          if (page.criteria_results && Array.isArray(page.criteria_results)) {
            for (const criterion of page.criteria_results) {
              // Filter to only allowed criteria for native-app
              if (isNative && !nativeAppCriteria.has(criterion.code)) continue;
              
              const entry = perCodeStatus.get(criterion.code) || { hasCompliant: false, hasNonCompliant: false };
              if (criterion.status === 'compliant') entry.hasCompliant = true;
              if (criterion.status === 'non-compliant') entry.hasNonCompliant = true;
              perCodeStatus.set(criterion.code, entry);
            }
          }
        }
      }
      
      // Count compliant and not-applicable criteria
      const compliantCodes = new Set<string>();
      const notApplicableCodes = new Set<string>();
      
      perCodeStatus.forEach((status, code) => {
        // Pessimistic aggregation: if non-compliant on at least one page, it's non-compliant overall
        if (status.hasNonCompliant) {
          // Not compliant overall
        } else if (status.hasCompliant) {
          compliantCodes.add(code);
        } else {
          // Never compliant, never non-compliant = not-applicable
          notApplicableCodes.add(code);
        }
      });
      
      // Calculate new score: unique compliant / (compliant + nonCompliant) * 100
      // We use only applicable criteria (compliant + nonCompliant) as denominator
      const nonCompliantCount = perCodeStatus.size - compliantCodes.size - notApplicableCodes.size;
      const denominator = compliantCodes.size + nonCompliantCount;
      const newScore = denominator > 0 ? Math.round((compliantCodes.size / denominator) * 100) : 0;
      
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
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
