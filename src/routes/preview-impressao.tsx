import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { gerarHtmlImpressao, PrintTemplateContent } from "@/lib/print-template";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/preview-impressao")({
  component: PreviewImpressao,
});

type Cenario = "delivery_novo" | "mesa" | "delivery_finalizado";

const baseItems = [
  { name: "X-Tudo", quantity: 2, price: 29.9, notes: "Sem cebola", complements: [{ name: "Bacon extra" }, { name: "Cheddar" }] },
  { name: "Coca-Cola 2L", quantity: 1, price: 14.0 },
  { name: "Batata Frita G", quantity: 1, price: 22.0, complements: [{ name: "Cheddar" }] },
];

const cenarios: Record<Cenario, { titulo: string; content: PrintTemplateContent; rodape?: string }> = {
  delivery_novo: {
    titulo: "PEDIDO DELIVERY",
    rodape: "*** NOVO PEDIDO - DELIVERY ***",
    content: {
      order_number: "D-1024",
      company_name: "Meu Pedix Lanches",
      customer_name: "João da Silva",
      customer_phone: "(11) 98888-7777",
      customer_address: "Rua das Flores, 123 - Centro",
      sector_name: "DELIVERY",
      notes: "Tocar a campainha 2x",
      total: 95.8,
      delivery_fee: 8.0,
      created_at: new Date().toISOString(),
      items: baseItems,
    },
  },
  mesa: {
    titulo: "PEDIDO MESA",
    rodape: "*** COZINHA ***",
    content: {
      order_number: "M-07",
      company_name: "Meu Pedix Lanches",
      customer_name: "Mesa 07",
      waiter_name: "Garçom: Carlos",
      sector_name: "COZINHA",
      notes: "Cliente alérgico a camarão",
      total: 73.8,
      created_at: new Date().toISOString(),
      items: baseItems,
    },
  },
  delivery_finalizado: {
    titulo: "CUPOM DO ENTREGADOR",
    rodape: "*** ENTREGA FINALIZADA ***",
    content: {
      order_number: "D-1024",
      company_name: "Meu Pedix Lanches",
      customer_name: "João da Silva",
      customer_phone: "(11) 98888-7777",
      customer_address: "Rua das Flores, 123 - Centro - Apto 42",
      sector_name: "ENTREGA",
      waiter_name: "Entregador: Pedro Motoboy",
      notes: "Tocar a campainha 2x",
      delivery_fee: 8.0,
      total: 95.8,
      created_at: new Date().toISOString(),
      items: baseItems,
    },
  },
};

function PreviewImpressao() {
  const [cenario, setCenario] = useState<Cenario>("delivery_novo");
  const [formato, setFormato] = useState<"thermal_80mm" | "a4">("thermal_80mm");

  const html = useMemo(() => {
    const c = cenarios[cenario];
    return gerarHtmlImpressao({
      titulo: c.titulo,
      content: c.content,
      formato,
      rodapePersonalizado: c.rodape,
    }).replace("window.onload = () => window.print();", "");
  }, [cenario, formato]);

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
          <div>
            <h1 className="text-xl font-bold">Preview de Impressão</h1>
            <p className="text-sm text-muted-foreground">Visualize como ficam os cupons reais.</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Select value={cenario} onValueChange={(v) => setCenario(v as Cenario)}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="delivery_novo">Delivery — Novo Pedido</SelectItem>
                <SelectItem value="mesa">Mesa — Pedido na Cozinha</SelectItem>
                <SelectItem value="delivery_finalizado">Delivery — Finalizado (Entregador)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formato} onValueChange={(v) => setFormato(v as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="thermal_80mm">Térmica 80mm</SelectItem>
                <SelectItem value="a4">A4</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const w = window.open("", "_blank", "width=900,height=900");
                if (!w) return;
                const c = cenarios[cenario];
                w.document.write(
                  gerarHtmlImpressao({ titulo: c.titulo, content: c.content, formato, rodapePersonalizado: c.rodape })
                );
                w.document.close();
              }}
            >
              Imprimir
            </Button>
          </div>
        </div>

        <div className="flex justify-center rounded-lg border bg-white p-4">
          <iframe
            title="preview"
            srcDoc={html}
            style={{
              width: formato === "thermal_80mm" ? "320px" : "100%",
              height: "80vh",
              border: "1px solid #e5e5e5",
              background: "white",
            }}
          />
        </div>
      </div>
    </div>
  );
}
