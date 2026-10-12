-- ====================================================================
-- 전주이씨 (JEONJU LEE) 회원가입 (members) 마스터 테이블 생성 및 보안 설정 SQL
-- Supabase 대시보드 (SQL Editor)에 붙여넣고 [Run]을 실행하세요.
-- 대상 프로젝트: https://cpzyrpaenvzfshqqpmrf.supabase.co
-- ====================================================================

-- 1. 암호화 확장 모듈 활성화 (PostgreSQL pgcrypto: bcrypt 해시 지원)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 회원가입 테이블 (public.members) 생성 (이메일 & 비밀번호 실제 저장)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL DEFAULT '회원',
    phone TEXT DEFAULT '',
    postal_code TEXT DEFAULT '',
    address TEXT DEFAULT '',
    detail_address TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 5000,
    membership_grade TEXT NOT NULL DEFAULT '전주이씨 가문회원',
    role TEXT NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 기존 테이블이 이미 존재하는 경우를 대비한 컬럼 및 제약조건 정리
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password TEXT DEFAULT '';
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS check_member_password_min_length;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS check_member_phone_format;
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS check_member_email_format;

-- 3. 기본 데이터 무결성 제약조건
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_points_non_negative') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_points_non_negative 
        CHECK (points >= 0);
    END IF;
END $$;

-- 4. 성능 및 검색 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_email_lower ON public.members (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members (role);

-- 5. 비밀번호 저장 및 bcrypt 해시 자동 생성 트리거
-- 사용자가 입력한 이메일(email)과 비밀번호(password)를 그대로 저장하면서,
-- 동시에 보안용 bcrypt 해시(password_hash)도 자동으로 함께 생성합니다.
CREATE OR REPLACE FUNCTION public.handle_member_security_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (NEW.password IS DISTINCT FROM OLD.password)) THEN
        IF NEW.password IS NOT NULL AND NEW.password <> '' THEN
            NEW.password_hash := crypt(NEW.password, gen_salt('bf', 10));
        END IF;
    END IF;

    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_members_security ON public.members;
CREATE TRIGGER trg_members_security
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.handle_member_security_trigger();

-- 6. Row Level Security (RLS) 보안 정책 및 권한 부여
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_insert_policy" ON public.members;
CREATE POLICY "members_insert_policy"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "members_select_policy" ON public.members;
CREATE POLICY "members_select_policy"
ON public.members
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "members_update_policy" ON public.members;
CREATE POLICY "members_update_policy"
ON public.members
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "members_delete_policy" ON public.members;
CREATE POLICY "members_delete_policy"
ON public.members
FOR DELETE
TO anon, authenticated, service_role
USING (true);

GRANT ALL ON public.members TO anon, authenticated, service_role;

-- 7. 안전한 로그인 인증 RPC 함수 (Security Definer)
-- 비밀번호를 프론트엔드로 노출시키지 않고, DB 서버 내부에서 안전하게 검증하여 일치할 때만 회원 프로필을 반환합니다.
CREATE OR REPLACE FUNCTION public.authenticate_member(
    p_email TEXT,
    p_password TEXT
)
RETURNS TABLE (
    id TEXT,
    email TEXT,
    name TEXT,
    phone TEXT,
    postal_code TEXT,
    address TEXT,
    detail_address TEXT,
    points INTEGER,
    membership_grade TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.email,
        m.name,
        m.phone,
        m.postal_code,
        m.address,
        m.detail_address,
        m.points,
        m.membership_grade,
        m.role,
        m.created_at,
        m.updated_at
    FROM public.members m
    WHERE lower(trim(m.email)) = lower(trim(p_email))
      AND (
          m.password = p_password 
          OR (m.password_hash IS NOT NULL AND m.password_hash = crypt(p_password, m.password_hash))
      )
    LIMIT 1;
END;
$$;

-- 익명(anon) 및 로그인 사용자에게 안전한 로그인 RPC 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.authenticate_member(TEXT, TEXT) TO anon, authenticated;

-- 8. 비밀번호가 완전히 가려진 안전한 공개 뷰 (Public Safe View)
CREATE OR REPLACE VIEW public.members_safe_view AS
SELECT 
    id,
    email,
    name,
    phone,
    postal_code,
    address,
    detail_address,
    points,
    membership_grade,
    role,
    created_at,
    updated_at
FROM public.members;

-- 9. 기본 관리자 및 테스트 회원 데이터 등록/갱신
INSERT INTO public.members (id, email, password, name, phone, postal_code, address, detail_address, points, membership_grade, role)
VALUES 
    ('usr-admin-01', 'admin@jeonjulee.kr', 'admin1234', '이도윤 대표', '010-2026-0101', '04383', '서울특별시 용산구 이태원로 240', '전주이씨 헤리티지 하우스 4F', 25000, '헤리티지 프레스티지', 'admin'),
    ('usr-customer-01', 'customer@jeonjulee.kr', 'customer1234', '김서연', '010-9876-5432', '06000', '서울특별시 강남구 압구정로 10', '101동 502호', 5000, '전주이씨 가문회원', 'customer')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    points = EXCLUDED.points,
    role = EXCLUDED.role,
    updated_at = now();
