
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UserPlus, Phone, Lock, Hash, Percent, User, LogIn } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

 export function WaiterManagement() {
  const FIXED_DOMAIN = "@meupedix.com.br";
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    login: "",
    password: "",
    phone: "",
    active: true,
    has_commission: true,
    commission_percent: "10"
  });

  const fetchWaiters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from("waiters").select("id, code, name, login, phone, active, has_commission, commission_percent, created_at, updated_at").order("name");
      if (error) throw error;
      setWaiters(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar garçons: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalCode = formData.code;
      
      // Auto-generate code if empty
      if (!finalCode) {
        const nextNum = waiters.length > 0 
          ? Math.max(...waiters.map(w => parseInt(w.code) || 0)) + 1 
          : 1;
        finalCode = nextNum.toString().padStart(3, '0');
      }
 
      let loginToSave = formData.login.trim();
      if (loginToSave && !loginToSave.includes("@")) {
        loginToSave = `${loginToSave}${FIXED_DOMAIN}`;
      }

      const payload: any = {
        ...formData,
        login: loginToSave,
        code: finalCode,
        commission_percent: parseFloat(formData.commission_percent) || 0
      };
      // On edit, only send password if user typed a new one
      if (editingWaiter && !formData.password) delete payload.password;

      let error;
      if (editingWaiter) {
        const { error: updateError } = await supabase.from("waiters").update(payload).eq("id", editingWaiter.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("waiters").insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      
      toast.success(editingWaiter ? "Garçom atualizado!" : "Garçom cadastrado!");
      setIsDialogOpen(false);
      resetForm();
      fetchWaiters();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      login: "",
      password: "",
      phone: "",
      active: true,
      has_commission: true,
      commission_percent: "10"
    });
    setEditingWaiter(null);
  };

  const handleEdit = (waiter: any) => {
    setEditingWaiter(waiter);
    setFormData({
      code: waiter.code || "",
      name: waiter.name,
      login: waiter.login,
      password: "",
      phone: waiter.phone || "",
      active: waiter.active,
      has_commission: waiter.has_commission,
      commission_percent: waiter.commission_percent.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Check for deletion permission
    const sessionStr = localStorage.getItem('admin_session');
    const user = sessionStr ? JSON.parse(sessionStr) : null;
    
    if (user && !user.can_delete) {
      toast.error("Você não tem permissão para excluir garçons.");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este garçom?")) return;
    try {
      const { error } = await supabase.from("waiters").delete().eq("id", id);
      if (error) throw error;
      toast.success("Garçom excluído!");
      fetchWaiters();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase text-foreground">Garçons</h2>
          <p className="text-muted-foreground text-sm">Gerencie os profissionais de atendimento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2 font-bold uppercase text-xs rounded-full px-6">
              <UserPlus className="h-4 w-4" />
              Novo Garçom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-black uppercase">{editingWaiter ? "Editar Garçom" : "Novo Garçom"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-orange-500" /> Nome do Profissional
                  </Label>
                  <Input 
                    id="name" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    placeholder="Ex: João Silva"
                    className="h-12 border-muted-foreground/20 focus:border-orange-500 rounded-xl"
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <LogIn className="h-3.5 w-3.5 text-orange-500" /> Acesso / Usuário
                    </Label>
                    <div className="relative group">
                      <Input 
                        id="login" 
                        required 
                        value={formData.login.split("@")[0]} 
                        onChange={(e) => setFormData({...formData, login: e.target.value.split("@")[0]})} 
                        className="h-12 border-muted-foreground/20 focus:border-orange-500 rounded-xl pr-44 font-bold text-orange-600 w-full"
                        placeholder="usuario"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-100 rounded-lg text-[11px] font-black text-orange-500 border border-orange-200 group-focus-within:border-orange-400 transition-colors shadow-sm">
                        {FIXED_DOMAIN}
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1 italic">Este será o nome usado para entrar no sistema</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-orange-500" /> Senha de Acesso
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type="password" 
                        required={!editingWaiter} 
                        placeholder={editingWaiter ? "Manter senha atual" : "Digite uma senha segura"} 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        className="h-12 border-muted-foreground/20 focus:border-orange-500 rounded-xl font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-orange-500" /> Telefone para Contato
                  </Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    className="h-12 border-muted-foreground/20 focus:border-orange-500 rounded-xl" 
                    placeholder="(00) 00000-0000" 
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-orange-900">Comissão de Vendas</Label>
                    <p className="text-[10px] text-orange-700/70 italic">Calculada no fechamento da mesa</p>
                  </div>
                  <Switch checked={formData.has_commission} onCheckedChange={(val) => setFormData({...formData, has_commission: val})} />
                </div>

                {formData.has_commission && (
                  <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="relative flex-1">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-orange-400" />
                      <Input 
                        id="commission" 
                        type="number" 
                        step="0.1" 
                        value={formData.commission_percent} 
                        onChange={(e) => setFormData({...formData, commission_percent: e.target.value})} 
                        className="pl-10 h-10 border-orange-200 focus:border-orange-500 rounded-lg font-bold"
                      />
                    </div>
                    <span className="text-xs font-black text-orange-700">% de comissão</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Switch id="active" checked={formData.active} onCheckedChange={(val) => setFormData({...formData, active: val})} />
                <Label htmlFor="active" className="text-xs font-bold uppercase">Garçom Ativo</Label>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="uppercase text-[10px] font-black">Cancelar</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 uppercase text-[10px] font-black px-8">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-[10px] font-black uppercase">Código</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Nome</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Login</TableHead>
              <TableHead className="text-[10px] font-black uppercase">Comissão</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-center">Status</TableHead>
              <TableHead className="text-[10px] font-black uppercase text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell>
              </TableRow>
            ) : waiters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum garçom cadastrado.</TableCell>
              </TableRow>
            ) : (
              waiters.map((waiter) => (
                <TableRow key={waiter.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-orange-600">#{waiter.code || '---'}</TableCell>
                  <TableCell className="font-bold">{waiter.name}</TableCell>
                  <TableCell className="text-xs">{waiter.login}</TableCell>
                  <TableCell>
                    {waiter.has_commission ? (
                      <Badge variant="outline" className="text-[10px] font-black text-blue-600 border-blue-200 bg-blue-50">
                        {waiter.commission_percent}%
                      </Badge>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Nenhuma</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {waiter.active ? (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px] font-black uppercase">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-500 text-[10px] font-black uppercase">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(waiter)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(waiter.id)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
