import { TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

export interface OrderProductsGridCtx {
  products: any[];
  orderProductSearch: string;
  orderProductCategory: string;
  newDeliveryOrder: any;
  setNewDeliveryOrder: (v: any) => void;
  complementGroups: any[];
  productComplementGroups: any[];
  categoryComplementGroups: any[];
  setIsOrderComplementDialogOpen: (v: boolean) => void;
  isBeverageProduct: (p: any) => boolean;
  setSuggestionDialog: (v: { open: boolean; products: any[] }) => void;
}

export function OrderProductsGrid({ ctx }: { ctx: OrderProductsGridCtx }) {
  const {
    products,
    orderProductSearch,
    orderProductCategory,
    newDeliveryOrder,
    setNewDeliveryOrder,
    complementGroups,
    productComplementGroups,
    categoryComplementGroups,
    setIsOrderComplementDialogOpen,
    isBeverageProduct,
    setSuggestionDialog,
  } = ctx;

  return (
                          <TabsContent value="products" className="space-y-4 mt-0">


                             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar p-1">
                                {products
                                .filter(p => p.active !== false)
                                .filter(p => {
                                  if (orderProductSearch) {
                                    return p.name.toLowerCase().includes(orderProductSearch.toLowerCase());
                                  }
                                  return orderProductCategory === "all" || p.category_id === orderProductCategory;
                                })
                                .map(p => (
                                <div 
                                  key={p.id} 
                                  className="border rounded-lg p-3 cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-95 shadow-sm bg-card flex flex-col gap-1"
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    const productId = p.id;

                                     // 1. Buscar sugestões (suggested_products) sem abrir diálogo ainda
                                     let suggestedProds: any[] = [];
                                     try {
                                       const { data: prodData } = await supabase
                                         .from('products')
                                         .select('suggested_products')
                                         .eq('id', productId)
                                         .single();
                                       const suggestions = prodData?.suggested_products || [];
                                       if (suggestions.length > 0) {
                                         const { data: sp } = await supabase
                                           .from('products')
                                           .select('*')
                                           .in('id', suggestions)
                                           .eq('active', true);
                                         suggestedProds = (sp || []).filter((s: any) => !newDeliveryOrder.items.some((it: any) => it.product_id === s.id));
                                       }
                                     } catch (err) {
                                       console.error("Erro ao buscar sugestões:", err);
                                     }

                                     // 2. Fluxo normal do pedido — UNIFICA complemento + sugestão num só diálogo
                                     const relevantComplements = complementGroups.filter(group => {
                                       const productGroupIds = productComplementGroups
                                         .filter(pg => pg.group_id && pg.product_id === p.id)
                                         .map(pg => pg.group_id);
                                       const categoryGroupIds = p.category_id
                                         ? categoryComplementGroups
                                             .filter(cg => cg.group_id && cg.category_id === p.category_id)
                                             .map(cg => cg.group_id)
                                         : [];
                                       const relevantGroupIds = [...new Set([...productGroupIds, ...categoryGroupIds])];
                                       if (relevantGroupIds.includes(group.id)) return true;
                                       const hasAnyManualLink =
                                         productComplementGroups.some(pg => pg.group_id === group.id) ||
                                         categoryComplementGroups.some(cg => cg.group_id === group.id);
                                       if (hasAnyManualLink) return false;
                                       return true;
                                     });

                                     if (relevantComplements.length > 0) {
                                       // Abre apenas o diálogo de complemento, com sugestões embutidas
                                       setNewDeliveryOrder({
                                         ...newDeliveryOrder,
                                         activeItem: {
                                           product: p,
                                           size: "Preço de Venda",
                                           selectedComplements: [],
                                           suggestions: suggestedProds,
                                           selectedSuggestions: [],
                                         }
                                       } as any);
                                       setIsOrderComplementDialogOpen(true);
                                     } else {
                                       const isDrink = isBeverageProduct(p);

                                       if (!isDrink) {
                                         const existingIdx = newDeliveryOrder.items.findIndex((item: any) => item.product_id === p.id && !item.is_pizza);
                                         if (existingIdx !== -1) {
                                           const newItems = [...newDeliveryOrder.items];
                                           newItems[existingIdx] = {
                                             ...newItems[existingIdx],
                                             quantity: newItems[existingIdx].quantity + 1
                                           };
                                           setNewDeliveryOrder({ ...newDeliveryOrder, items: newItems });
                                           if (suggestedProds.length > 0) setSuggestionDialog({ open: true, products: suggestedProds });
                                           return;
                                         }
                                       }

                                       setNewDeliveryOrder((current: any) => ({
                                         ...current,
                                         items: [...current.items, {
                                           product_id: p.id,
                                           product_name: p.name,
                                           quantity: 1,
                                           unit_price: Number(p.price)
                                         }]
                                       } as any));

                                       // Sem complementos: mostra sugestões em diálogo próprio (somente se existirem)
                                       if (suggestedProds.length > 0) setSuggestionDialog({ open: true, products: suggestedProds });
                                     }
                                  }}
                                >
                                  <span className="text-xs font-bold text-left leading-tight break-words w-full">{p.name}</span>
                                  <span className="text-[10px] text-orange-600 font-semibold">R$ {p.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
  );
}
