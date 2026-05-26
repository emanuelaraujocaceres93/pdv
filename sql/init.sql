-- SQL inicial para criar esquema do PDV + Comandas
-- Execute no SQL Editor do Supabase (https://app.supabase.com/project/<seu-projeto>/sql)

-- Cria extensão necessária para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabelas principais
CREATE TABLE IF NOT EXISTS companies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commands (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  table_number text,
  status text NOT NULL DEFAULT 'open',
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS command_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  command_id uuid REFERENCES commands(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES products(id),
  change integer NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Função utilitária para decrementar estoque e registrar movimento
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id uuid, p_qty integer)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET stock = stock - p_qty WHERE id = p_product_id;
  INSERT INTO stock_movements(product_id, change, reason) VALUES (p_product_id, -p_qty, 'decrement_stock');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insere empresa padrão e retorna o id
INSERT INTO companies (name) VALUES ('Minha Empresa') RETURNING id;
