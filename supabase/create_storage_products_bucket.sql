-- ====================================================================
-- 전주이씨 (JEONJU LEE) Supabase Storage 'products' 버킷 생성 및 업로드 권한 SQL
-- 대상 프로젝트: https://cpzyrpaenvzfshqqpmrf.supabase.co
-- Supabase 대시보드 -> SQL Editor에 붙여넣고 [Run]을 클릭하세요.
-- ====================================================================

-- 1. 'products' 및 'product-images' 공개(Public) 스토리지 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. storage.objects 테이블에 대한 조회(SELECT) / 업로드(INSERT) / 수정(UPDATE) / 삭제(DELETE) RLS 정책 설정
DROP POLICY IF EXISTS "storage_products_select_policy" ON storage.objects;
CREATE POLICY "storage_products_select_policy"
ON storage.objects FOR SELECT
TO public, anon, authenticated
USING (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "storage_products_insert_policy" ON storage.objects;
CREATE POLICY "storage_products_insert_policy"
ON storage.objects FOR INSERT
TO public, anon, authenticated
WITH CHECK (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "storage_products_update_policy" ON storage.objects;
CREATE POLICY "storage_products_update_policy"
ON storage.objects FOR UPDATE
TO public, anon, authenticated
USING (bucket_id IN ('products', 'product-images'))
WITH CHECK (bucket_id IN ('products', 'product-images'));

DROP POLICY IF EXISTS "storage_products_delete_policy" ON storage.objects;
CREATE POLICY "storage_products_delete_policy"
ON storage.objects FOR DELETE
TO public, anon, authenticated
USING (bucket_id IN ('products', 'product-images'));
