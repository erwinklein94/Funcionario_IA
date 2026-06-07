/* =========================================================
   FUNCIONÁRIO ARTIFICIAL — Conexão com o Supabase
   ---------------------------------------------------------
   1) No painel do Supabase: Project Settings → API
   2) Copie "Project URL" e a chave "anon public"
   3) Cole abaixo. (A chave anon pode ficar pública — a
      segurança real está nas políticas RLS do banco.)
   ========================================================= */

const SUPABASE_URL      = 'COLE_SUA_PROJECT_URL_AQUI';   // ex.: https://abcdxyz.supabase.co
const SUPABASE_ANON_KEY = 'COLE_SUA_ANON_KEY_AQUI';

/* ---- não precisa mexer daqui pra baixo ---- */
let sb = null;
function supabaseReady(){
  return /^https:\/\/.+\.supabase\.co/.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 30;
}
if (window.supabase && supabaseReady()) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
