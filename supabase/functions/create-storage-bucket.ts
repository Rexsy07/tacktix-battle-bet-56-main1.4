
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if the bucket already exists
    const { data: buckets, error: getBucketsError } = await supabase.storage.listBuckets();
    
    if (getBucketsError) {
      throw getBucketsError;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === "match-evidence");
    
    if (!bucketExists) {
      // Create the bucket
      const { error: createBucketError } = await supabase.storage.createBucket("match-evidence", {
        public: true, // Make the bucket public
        fileSizeLimit: 5242880, // 5MB limit
      });
      
      if (createBucketError) {
        throw createBucketError;
      }
      
      // Create a policy to allow authenticated users to upload
      const { error: policyError } = await supabase.rpc("create_storage_policy", {
        bucket_name: "match-evidence",
        policy_name: "authenticated users can upload",
        definition: "auth.role() = 'authenticated'",
        operation: "INSERT"
      });
      
      if (policyError) {
        console.error("Error creating policy:", policyError);
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Storage bucket setup complete" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
