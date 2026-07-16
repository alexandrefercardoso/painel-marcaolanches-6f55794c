-- Limpar Plano de Contas existente para evitar duplicidade ou códigos órfãos
DELETE FROM public.chart_of_accounts;

-- NÍVEL 1: RECEITAS (1)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('10000000-0000-0000-0000-000000000001', '1', 'RECEITAS', 'revenue', 1);

-- Nível 2: Receitas Operacionais (1.1)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('10000000-0000-0000-0000-000000000101', '1.1', 'Receitas Operacionais', '10000000-0000-0000-0000-000000000001', 'revenue', 2);

-- Nível 3: Subcategorias de Receitas Operacionais
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('1.1.01', 'Vendas de Balcão (Presencial)', '10000000-0000-0000-0000-000000000101', 'revenue', 3),
('1.1.02', 'Vendas de Delivery (App/Site)', '10000000-0000-0000-0000-000000000101', 'revenue', 3),
('1.1.03', 'Vendas iFood / Marketplace', '10000000-0000-0000-0000-000000000101', 'revenue', 3),
('1.1.04', 'Taxas de Entrega Recebidas', '10000000-0000-0000-0000-000000000101', 'revenue', 3);

-- Nível 2: Receitas Não Operacionais (1.2)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('10000000-0000-0000-0000-000000000102', '1.2', 'Receitas Não Operacionais', '10000000-0000-0000-0000-000000000001', 'revenue', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('1.2.01', 'Rendimentos Financeiros', '10000000-0000-0000-0000-000000000102', 'revenue', 3),
('1.2.02', 'Outras Receitas', '10000000-0000-0000-0000-000000000102', 'revenue', 3);


-- NÍVEL 1: CUSTOS (2)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('20000000-0000-0000-0000-000000000001', '2', 'CUSTOS', 'cost', 1);

-- Nível 2: Custos de Mercadoria (2.1)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('20000000-0000-0000-0000-000000000201', '2.1', 'CMV (Custo de Mercadoria Vendida)', '20000000-0000-0000-0000-000000000001', 'cost', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('2.1.01', 'Compra de Insumos / Matéria Prima', '20000000-0000-0000-0000-000000000201', 'cost', 3),
('2.1.02', 'Compra de Bebidas / Revenda', '20000000-0000-0000-0000-000000000201', 'cost', 3),
('2.1.03', 'Embalagens e Descartáveis', '20000000-0000-0000-0000-000000000201', 'cost', 3);

-- Nível 2: Custos de Produção (2.2)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('20000000-0000-0000-0000-000000000202', '2.2', 'Custos Diretos de Produção', '20000000-0000-0000-0000-000000000001', 'cost', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('2.2.01', 'Gás de Cozinha', '20000000-0000-0000-0000-000000000202', 'cost', 3),
('2.2.02', 'Manutenção de Equipamentos', '20000000-0000-0000-0000-000000000202', 'cost', 3);


-- NÍVEL 1: DESPESAS (3)
INSERT INTO public.chart_of_accounts (id, code, name, type, level) 
VALUES ('30000000-0000-0000-0000-000000000001', '3', 'DESPESAS', 'expense', 1);

-- Nível 2: Despesas Operacionais (3.1)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000301', '3.1', 'Despesas Operacionais', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('3.1.01', 'Aluguel do Ponto', '30000000-0000-0000-0000-000000000301', 'expense', 3),
('3.1.02', 'Energia Elétrica', '30000000-0000-0000-0000-000000000301', 'expense', 3),
('3.1.03', 'Água / Saneamento', '30000000-0000-0000-0000-000000000301', 'expense', 3),
('3.1.04', 'Internet e Telefone', '30000000-0000-0000-0000-000000000301', 'expense', 3),
('3.1.05', 'Taxas de Entrega (Motoqueiros)', '30000000-0000-0000-0000-000000000301', 'expense', 3);

-- Nível 2: Despesas com Pessoal (3.2)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000302', '3.2', 'Despesas com Pessoal', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('3.2.01', 'Salários e Ordenados', '30000000-0000-0000-0000-000000000302', 'expense', 3),
('3.2.02', 'Encargos e Impostos (FGTS/INSS)', '30000000-0000-0000-0000-000000000302', 'expense', 3),
('3.2.03', 'Pró-Labore (Sócios)', '30000000-0000-0000-0000-000000000302', 'expense', 3),
('3.2.04', 'Benefícios (VT/VR)', '30000000-0000-0000-0000-000000000302', 'expense', 3);

-- Nível 2: Despesas Administrativas (3.3)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000303', '3.3', 'Despesas Administrativas', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('3.3.01', 'Sistemas e Softwares (SaaS)', '30000000-0000-0000-0000-000000000303', 'expense', 3),
('3.3.02', 'Marketing e Publicidade', '30000000-0000-0000-0000-000000000303', 'expense', 3),
('3.3.03', 'Contabilidade e Consultoria', '30000000-0000-0000-0000-000000000303', 'expense', 3);

-- Nível 2: Despesas Financeiras (3.4)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000304', '3.4', 'Despesas Financeiras / Taxas', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('3.4.01', 'Taxas de Cartão de Crédito/Débito', '30000000-0000-0000-0000-000000000304', 'expense', 3),
('3.4.02', 'Tarifas Bancárias', '30000000-0000-0000-0000-000000000304', 'expense', 3),
('3.4.03', 'Juros e Multas Pagos', '30000000-0000-0000-0000-000000000304', 'expense', 3);

-- Nível 2: Impostos e Contribuições (3.5)
INSERT INTO public.chart_of_accounts (id, code, name, parent_id, type, level) 
VALUES ('30000000-0000-0000-0000-000000000305', '3.5', 'Impostos e Taxas Federais/Estaduais', '30000000-0000-0000-0000-000000000001', 'expense', 2);
INSERT INTO public.chart_of_accounts (code, name, parent_id, type, level) VALUES 
('3.5.01', 'DAS (Simples Nacional)', '30000000-0000-0000-0000-000000000305', 'expense', 3),
('3.5.02', 'Alvarás e Taxas Municipais', '30000000-0000-0000-0000-000000000305', 'expense', 3);
