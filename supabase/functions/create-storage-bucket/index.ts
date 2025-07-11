
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Create storage bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabaseClient.storage.getBucket('match-evidence');
    
    if (bucketError && bucketError.message.includes('The resource was not found')) {
      console.log('Creating match-evidence bucket');
      
      const { data, error } = await supabaseClient.storage.createBucket('match-evidence', {
        public: true, // Allow public access to files
        fileSizeLimit: 5242880, // 5MB file size limit
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Bucket created successfully', data);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Storage bucket created successfully',
          bucket: 'match-evidence'
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
          status: 200,
        },
      );
    } else if (bucketError) {
      throw bucketError;
    }
    
    console.log('Bucket already exists');
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Storage bucket already exists',
        bucket: 'match-evidence'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    );
  } catch (error) {
    console.error('Error creating storage bucket:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    );
  }
});
