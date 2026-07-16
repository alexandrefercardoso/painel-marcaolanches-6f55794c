import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogIn, ArrowLeft, Loader2, Lock } from "lucide-react";
import { SystemVersion } from "@/components/system/SystemVersion";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== 'undefined') {
      const session = localStorage.getItem('admin_session');
      if (session) {
        try {
          const user = JSON.parse(session);
          if (user.is_kds_only) {
            throw redirect({ to: "/admin", search: { tab: "kds" } });
          } else {
            throw redirect({ to: "/admin" });
          }
        } catch (e) {
          localStorage.removeItem('admin_session');
        }
      }
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const FIXED_DOMAIN = "@meupedix.com.br";


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      let loginValue = email.trim();
      const passValue = password.trim();
      
      // Se o usuário digitou apenas o nome, tentamos com o novo domínio
      // Mas guardamos o valor original para tentar sem o domínio (retrocompatibilidade)
      const originalLoginValue = loginValue;
      const loginWithDomain = loginValue.includes("@") ? loginValue : `${loginValue}${FIXED_DOMAIN}`;
      
      console.log("Iniciando processo de autenticação para:", loginWithDomain);

      // 1. Tenta autenticação oficial via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginWithDomain,
        password: passValue,
      });

      if (!authError && authData.user) {
        console.log("Sucesso no Supabase Auth");
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email, full_name, role, is_kds_only, can_delete, allowed_modules, visible_fields, active')
          .eq('id', authData.user.id)
          .single();

        if (profile && profile.active === false) {
          await supabase.auth.signOut();
          toast.error("Este usuário está desativado. Contate o administrador.");
          setLoading(false);
          return;
        }

        if (profile) {
          localStorage.setItem('admin_session', JSON.stringify({
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
            is_kds_only: profile.is_kds_only,
            can_delete: profile.can_delete,
            allowed_modules: (profile as any).allowed_modules || [],
            visible_fields: (profile as any).visible_fields || []
          }));
          toast.success(`Bem-vindo, ${profile.full_name || 'Administrador'}!`);
          
          if (profile.is_kds_only) {
            window.location.replace("/admin?tab=kds");
          } else {
            window.location.replace("/admin");
          }
          return;
        }
      }

      // 2. Se falhar ou não encontrar perfil, tenta o fallback manual pela tabela profiles
      console.log("Tentando fallback manual pela tabela profiles");
      const { data: profiles, error: dbError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, is_kds_only, can_delete, allowed_modules, visible_fields, password, active')
        .in('email', Array.from(new Set([loginWithDomain, originalLoginValue])));

      if (dbError) throw dbError;

      const profile = profiles?.find(p => p.password === passValue);

      if (profile) {
        if (profile.active === false) {
          toast.error("Este usuário está desativado. Contate o administrador.");
          setLoading(false);
          return;
        }
        // Encontrou no fallback, agora tenta criar a sessão no Auth para garantir o Storage
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password: passValue
        }).catch(err => console.warn("Erro ao sincronizar sessão Auth:", err));

        localStorage.setItem('admin_session', JSON.stringify({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          is_kds_only: profile.is_kds_only,
          can_delete: profile.can_delete,
          allowed_modules: (profile as any).allowed_modules || [],
          visible_fields: (profile as any).visible_fields || []
        }));

        toast.success(`Bem-vindo, ${profile.full_name || 'Administrador'}!`);
        
        if (profile.is_kds_only) {
          window.location.replace("/admin?tab=kds");
        } else {
          window.location.replace("/admin");
        }
        return;
      }

      // 3. Tenta fallback na tabela waiters
      console.log("Tentando fallback manual pela tabela waiters");
      const { data: waiters } = await supabase
        .from('waiters')
        .select('id, login, name, password, active')
        .or(`login.eq."${loginWithDomain}",login.eq."${originalLoginValue}"`);

      const waiter = waiters?.find(w => w.password === passValue);
      if (waiter) {
        if (waiter.active === false) {
          toast.error("Este garçom está desativado. Contate o administrador.");
          setLoading(false);
          return;
        }
        localStorage.setItem('admin_session', JSON.stringify({
          id: waiter.id,
          email: waiter.login,
          full_name: waiter.name,
          role: 'waiter'
        }));
        toast.success(`Bem-vindo, ${waiter.name}!`);
        window.location.replace("/admin");
        return;
      }

      // 4. Tenta fallback na tabela drivers
      console.log("Tentando fallback manual pela tabela drivers");
      const { data: drivers } = await supabase
        .from('drivers')
        .select('id, login, name, password, active')
        .or(`login.eq."${loginWithDomain}",login.eq."${originalLoginValue}"`);

      const driver = drivers?.find(d => d.password === passValue);
      if (driver) {
        if (driver.active === false) {
          toast.error("Este entregador está desativado. Contate o administrador.");
          setLoading(false);
          return;
        }
        localStorage.setItem('admin_session', JSON.stringify({
          id: driver.id,
          email: driver.login,
          full_name: driver.name,
          role: 'driver'
        }));
        toast.success(`Bem-vindo, ${driver.name}!`);
        window.location.replace("/admin");
        return;
      }

      toast.error("Usuário ou senha incorretos.");
      
    } catch (err: any) {
      console.error("Erro crítico no login:", err);
      toast.error("Erro ao processar o login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">

      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none relative z-10 bg-card/80 backdrop-blur-xl">
        <CardHeader className="space-y-2 text-center pt-5">
          <div className="mx-auto flex flex-col items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-28 h-auto mb-2 animate-in fade-in zoom-in duration-700"
            />
            <div className="space-y-0.5">
              <CardTitle className="text-2xl font-black tracking-tight">
                Painel do <span className="text-primary italic">Admin</span>
              </CardTitle>
              <CardDescription className="text-sm font-medium opacity-70">
                Gestão Inteligente de Delivery
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-5 pt-2 px-6">
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Credencial de Acesso</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Usuário"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-muted/50 border-transparent focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl pr-40"
                />
                {!email.includes("@") && email.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground/50 pointer-events-none">
                    {FIXED_DOMAIN}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Código de Segurança</label>
              <Input
                type="password"
                placeholder="Sua senha secreta"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-muted/50 border-transparent focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-black rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span>Acessar Painel</span>
                  <LogIn className="h-5 w-5" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <div className="text-center pb-4 text-xs font-medium text-muted-foreground/40">
          © {new Date().getFullYear()} Sistema de Gestão Delivery
        </div>
        <div className="pb-3 px-6">
          <SystemVersion />
        </div>
      </Card>
    </div>
  );
}
