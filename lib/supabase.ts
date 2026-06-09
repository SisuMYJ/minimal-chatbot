import { createClient } from "@supabase/supabase-js";

// 后端专用客户端：用 service_role 万能钥匙，绕过权限限制。
// 这个文件只应被服务端代码（app/api/.../route.ts）引用，绝不在前端组件里 import。
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
