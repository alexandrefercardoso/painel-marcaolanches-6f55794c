import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { taxProfileService, type TaxProfile } from '@/services/taxProfileService';

const taxRuleSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cst_icms_estadual: z.string().min(1, 'CST é obrigatório'),
  cfop_estadual: z.string().min(1, 'CFOP é obrigatório'),
  cfop_interestadual: z.string().optional(),
  orig_icms: z.coerce.number().min(0).max(8),
  aliq_icms: z.coerce.number().min(0),
  red_bc: z.coerce.number().min(0).max(100),
  cst_pis: z.string().min(1, 'CST PIS é obrigatório'),
  aliq_pis: z.coerce.number().min(0),
  cst_cofins: z.string().min(1, 'CST COFINS é obrigatório'),
  aliq_cofins: z.coerce.number().min(0),
  aliq_ibsuf: z.coerce.number().min(0),
  aliq_ibsmun: z.coerce.number().min(0),
  aliq_cbs: z.coerce.number().min(0),
  cst_ibscbs: z.string().optional(),
  active: z.boolean(),
});

type TaxRuleFormData = z.infer<typeof taxRuleSchema>;

const DEFAULTS: TaxRuleFormData = {
  nome: '',
  cst_icms_estadual: '',
  cfop_estadual: '',
  cfop_interestadual: '',
  orig_icms: 0,
  aliq_icms: 0,
  red_bc: 0,
  cst_pis: '49',
  aliq_pis: 0,
  cst_cofins: '49',
  aliq_cofins: 0,
  aliq_ibsuf: 0,
  aliq_ibsmun: 0,
  aliq_cbs: 0,
  cst_ibscbs: '000',
  active: true,
};

const TaxRulesManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ['tax-profiles'],
    queryFn: taxProfileService.getTaxProfiles,
  });

  const form = useForm<TaxRuleFormData>({
    resolver: zodResolver(taxRuleSchema),
    defaultValues: DEFAULTS,
  });

  const createMutation = useMutation({
    mutationFn: (data: TaxRuleFormData) => taxProfileService.createTaxProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profiles'] });
      toast.success('Perfil criado com sucesso!');
      handleClose();
    },
    onError: (error: any) => toast.error('Erro ao criar perfil: ' + (error?.message || error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaxRuleFormData }) =>
      taxProfileService.updateTaxProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profiles'] });
      toast.success('Perfil atualizado com sucesso!');
      handleClose();
    },
    onError: (error: any) => toast.error('Erro ao atualizar perfil: ' + (error?.message || error)),
  });

  const deleteMutation = useMutation({
    mutationFn: taxProfileService.deleteTaxProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-profiles'] });
      toast.success('Perfil excluído com sucesso!');
    },
    onError: (error: any) => toast.error('Erro ao excluir perfil: ' + (error?.message || error)),
  });

  const onSubmit = (data: TaxRuleFormData) => {
    if (editingId) updateMutation.mutate({ id: editingId, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (profile: TaxProfile) => {
    setEditingId(profile.id);
    form.reset({
      nome: profile.nome,
      cst_icms_estadual: profile.cst_icms_estadual || '',
      cfop_estadual: profile.cfop_estadual || '',
      cfop_interestadual: profile.cfop_interestadual || '',
      orig_icms: Number(profile.orig_icms ?? 0),
      aliq_icms: Number(profile.aliq_icms ?? 0),
      red_bc: Number(profile.red_bc ?? 0),
      cst_pis: profile.cst_pis || '49',
      aliq_pis: Number(profile.aliq_pis ?? 0),
      cst_cofins: profile.cst_cofins || '49',
      aliq_cofins: Number(profile.aliq_cofins ?? 0),
      aliq_ibsuf: Number(profile.aliq_ibsuf ?? 0),
      aliq_ibsmun: Number(profile.aliq_ibsmun ?? 0),
      aliq_cbs: Number(profile.aliq_cbs ?? 0),
      cst_ibscbs: profile.cst_ibscbs || '000',
      active: profile.active,
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    form.reset(DEFAULTS);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este perfil?')) deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="flex justify-center p-8">Carregando...</div>;

  const err = form.formState.errors;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Perfis Tributários</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                form.reset(DEFAULTS);
                setIsOpen(true);
              }}
            >
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Editar Perfil Tributário' : 'Novo Perfil Tributário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Perfil</label>
                <Input {...form.register('nome')} placeholder="Ex: Simples Nacional 102" />
                {err.nome && <p className="text-sm text-red-500">{err.nome.message}</p>}
              </div>

              {/* ICMS */}
              <fieldset className="border rounded-md p-3 space-y-3">
                <legend className="text-sm font-semibold px-1">ICMS</legend>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">CST / CSOSN</label>
                    <Input {...form.register('cst_icms_estadual')} placeholder="102" />
                    {err.cst_icms_estadual && <p className="text-xs text-red-500">{err.cst_icms_estadual.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">CFOP Estadual</label>
                    <Input {...form.register('cfop_estadual')} placeholder="5102" />
                    {err.cfop_estadual && <p className="text-xs text-red-500">{err.cfop_estadual.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">CFOP Interestadual</label>
                    <Input {...form.register('cfop_interestadual')} placeholder="6102" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium">Origem (0-8)</label>
                    <Input type="number" {...form.register('orig_icms')} placeholder="0" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alíquota ICMS (%)</label>
                    <Input type="number" step="0.01" {...form.register('aliq_icms')} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Red. Base Cálc. (%)</label>
                    <Input type="number" step="0.01" {...form.register('red_bc')} placeholder="0.00" />
                  </div>
                </div>
              </fieldset>

              {/* PIS */}
              <fieldset className="border rounded-md p-3 space-y-3">
                <legend className="text-sm font-semibold px-1">PIS</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">CST PIS</label>
                    <Input {...form.register('cst_pis')} placeholder="49" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alíquota PIS (%)</label>
                    <Input type="number" step="0.0001" {...form.register('aliq_pis')} placeholder="0.00" />
                  </div>
                </div>
              </fieldset>

              {/* COFINS */}
              <fieldset className="border rounded-md p-3 space-y-3">
                <legend className="text-sm font-semibold px-1">COFINS</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">CST COFINS</label>
                    <Input {...form.register('cst_cofins')} placeholder="49" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alíquota COFINS (%)</label>
                    <Input type="number" step="0.0001" {...form.register('aliq_cofins')} placeholder="0.00" />
                  </div>
                </div>
              </fieldset>

              {/* IBS / CBS (Reforma Tributária) */}
              <fieldset className="border rounded-md p-3 space-y-3">
                <legend className="text-sm font-semibold px-1">IBS / CBS (Reforma Tributária)</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">CST IBS/CBS</label>
                    <Input {...form.register('cst_ibscbs')} placeholder="000" />
                  </div>
                  <div />
                  <div>
                    <label className="text-sm font-medium">Alíq. IBS UF (%)</label>
                    <Input type="number" step="0.01" {...form.register('aliq_ibsuf')} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alíq. IBS Município (%)</label>
                    <Input type="number" step="0.01" {...form.register('aliq_ibsmun')} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Alíq. CBS (%)</label>
                    <Input type="number" step="0.01" {...form.register('aliq_cbs')} placeholder="0.00" />
                  </div>
                </div>
              </fieldset>

              <div className="flex items-center gap-2">
                <input type="checkbox" {...form.register('active')} />
                <label className="text-sm font-medium">Ativo</label>
              </div>

              <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CST</TableHead>
            <TableHead>CFOP</TableHead>
            <TableHead>ICMS %</TableHead>
            <TableHead>PIS %</TableHead>
            <TableHead>COFINS %</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles?.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.nome}</TableCell>
              <TableCell>{profile.cst_icms_estadual || '-'}</TableCell>
              <TableCell>{profile.cfop_estadual || '-'}</TableCell>
              <TableCell>{Number(profile.aliq_icms ?? 0)}%</TableCell>
              <TableCell>{Number(profile.aliq_pis ?? 0)}%</TableCell>
              <TableCell>{Number(profile.aliq_cofins ?? 0)}%</TableCell>
              <TableCell>
                <Badge variant={profile.active ? 'default' : 'secondary'}>
                  {profile.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(profile)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(profile.id)}>Excluir</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {profiles?.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                Nenhum perfil tributário cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaxRulesManager;
export { TaxRulesManager };
