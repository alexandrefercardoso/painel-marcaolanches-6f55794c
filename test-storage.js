
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://tmheapviezuqezfpqctp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-WdtX7wqu7Aqf4Zb5Y2hzA_tpXJ4Cxf";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testUpload(bucket) {
  console.log(`--- Testing bucket: ${bucket} ---`);
  const content = Buffer.from('test content ' + Date.now());
  
  const fileName = `teste-${Date.now()}.png`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, content, {
      contentType: 'image/png',
      upsert: true
    });
    
  if (error) {
    console.log(`RESULT [${bucket}]: FAILED`);
    console.log(JSON.stringify(error, null, 2));
  } else {
    console.log(`RESULT [${bucket}]: SUCCESS`);
    console.log(JSON.stringify(data, null, 2));
  }
}

async function run() {
  await testUpload('products');
  await testUpload('campaigns');
}

run();
