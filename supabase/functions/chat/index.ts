import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('token_balance')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile || profile.token_balance < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient tokens' }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Jesteś asystentem prawnym. Pomagasz użytkownikom w analizie dokumentów prawnych i odpowiadasz na pytania prawne w języku polskim. Udzielaj konkretnych, pomocnych odpowiedzi."
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices[0].message.content;

    await supabaseClient
      .from('profiles')
      .update({ token_balance: profile.token_balance - 1 })
      .eq('id', user.id);

    const userMessage = messages[messages.length - 1].content;

    await supabaseClient.from('messages').insert([
      {
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: userMessage,
        tokens_used: 0
      },
      {
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: assistantMessage,
        tokens_used: 1
      }
    ]);

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        tokensRemaining: profile.token_balance - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
