const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let proto = Object.getPrototypeOf(supabase.auth);
while (proto) {
  console.log('Class name:', proto.constructor.name);
  console.log('Methods:', Object.getOwnPropertyNames(proto));
  proto = Object.getPrototypeOf(proto);
}
