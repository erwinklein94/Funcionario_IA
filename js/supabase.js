/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Conexão com o Supabase
   ---------------------------------------------------------
   As chaves anon/publishable PODEM ser públicas (a segurança
   real está no RLS do banco). NUNCA coloque aqui a service_role key.
   ========================================================= */

const SUPABASE_URL      = 'https://lslgnbknrgwuxgcvfdml.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzbGduYmtucmd3dXhnY3ZmZG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NjAxODYsImV4cCI6MjA5NjQzNjE4Nn0._pdyGzewXgosfud5o_KXB2LRftn8xlXFr57G5fXSkzo';

/* ---- não precisa mexer daqui pra baixo ---- */
let sb = null;
function supabaseReady(){
  return /^https:\/\/.+\.supabase\.co\/?$/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 30;
}
if (window.supabase && supabaseReady()) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
