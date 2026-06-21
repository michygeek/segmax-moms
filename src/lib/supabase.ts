import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Server-only client using the service role key — never import this from client components. */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

export const COA_BUCKET = process.env.SUPABASE_COA_BUCKET || "coa-documents";

export async function uploadFile(params: {
  bucket: string;
  path: string;
  file: File;
}): Promise<string> {
  const { bucket, path, file } = params;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
