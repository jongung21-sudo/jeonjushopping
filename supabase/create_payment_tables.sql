CREATE TABLE IF NOT EXISTS public.payment_transactions (
  payment_key TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT '신용/체크카드',
  pg_provider TEXT NOT NULL DEFAULT 'tosspayments',
  status TEXT NOT NULL DEFAULT 'DONE',
  customer_name TEXT DEFAULT '',
  receipt_url TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_tx_open" ON public.payment_transactions;
CREATE POLICY "payment_tx_open" ON public.payment_transactions FOR ALL USING (true) WITH CHECK (true);
GRANT ALL ON public.payment_transactions TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
