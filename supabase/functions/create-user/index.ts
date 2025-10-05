import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, entityIds = [] } = await req.json();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate a secure random password (16 characters with mixed case, numbers, and symbols)
    const generateSecurePassword = () => {
      const length = 16;
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      const array = new Uint8Array(length);
      crypto.getRandomValues(array);
      return Array.from(array, byte => charset[byte % charset.length]).join('');
    };

    const temporaryPassword = generateSecurePassword();

    // Create user with temporary random password
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
    });

    if (createError) throw createError;

    // Assign role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userData.user.id, role });

    if (roleError) throw roleError;

    // Assign entity permissions
    if (entityIds.length > 0) {
      const permissions = entityIds.map((entityId: string) => ({
        user_id: userData.user.id,
        entity_id: entityId,
      }));

      const { error: permError } = await supabaseAdmin
        .from('user_entity_permissions')
        .insert(permissions);

    if (permError) throw permError;
    }

    // Send password reset email to allow user to set their own password
    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${req.headers.get('origin')}/auth`,
    });

    if (resetError) {
      console.error('Password reset email error:', resetError);
      // Don't fail the user creation, just log the error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: userData.user.id,
        message: 'User created successfully. Password reset email sent.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
