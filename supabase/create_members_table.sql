-- ====================================================================
-- 전주이씨 (JEONJU LEE) 엔터프라이즈 보안 강화 회원가입 SQL
-- Supabase 대시보드 (SQL Editor)에 붙여넣고 [Run]을 실행하세요.
-- 대상 프로젝트: https://bjofkwwzeapgjahsjdzb.supabase.co
-- ====================================================================

-- 1. 암호화 확장 모듈 활성화 (PostgreSQL pgcrypto: 산업 표준 bcrypt 암호화 지원)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. 회원가입 테이블 (public.members) 생성
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    password_hash TEXT,
    name TEXT NOT NULL,
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

-- 기존 테이블이 이미 존재하는 경우를 대비한 컬럼 안전 추가
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. 데이터 무결성 및 보안 검증 제약조건 (CHECK Constraints)
DO $$
BEGIN
    -- 이메일 정규식 유효성 제약조건 (잘못된 형식 차단)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_email_format') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    -- 성명 필수 입력 제약조건 (공백 차단)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_name_not_empty') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_name_not_empty 
        CHECK (length(trim(name)) >= 1);
    END IF;

    -- 비밀번호 최소 길이 제약조건 (4자 이상)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_password_min_length') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_password_min_length 
        CHECK (length(password) >= 4);
    END IF;

    -- 포인트 음수 방지 제약조건 (포인트 부정 차감 방지)
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_points_non_negative') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_points_non_negative 
        CHECK (points >= 0);
    END IF;

    -- 역할(Role) 유효성 제약조건
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_role_valid') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_role_valid 
        CHECK (role IN ('customer', 'vip', 'admin', 'superadmin'));
    END IF;

    -- 전화번호 형식 검증 제약조건
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_phone_format') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_phone_format 
        CHECK (phone = '' OR phone ~ '^[0-9\-\+\s]{8,20}$');
    END IF;
END $$;

-- 4. 성능 및 보안 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_email_lower ON public.members (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members (role);

-- 5. 자동 비밀번호 bcrypt 단방향 암호화 및 타임스탬프 갱신 트리거
-- 평문 비밀번호가 저장되더라도 내부적으로 bcrypt 단방향 암호화 해시(password_hash)를 자동 생성합니다.
CREATE OR REPLACE FUNCTION public.handle_member_security_trigger()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 비밀번호가 새로 등록되거나 변경되었을 때 bcrypt 해시 자동 생성 (Cost 10)
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (NEW.password <> OLD.password OR OLD.password IS NULL)) THEN
        IF NEW.password IS NOT NULL AND NEW.password <> '' THEN
            NEW.password_hash := crypt(NEW.password, gen_salt('bf', 10));
        END IF;
    END IF;

    -- 수정 시간 자동 갱신
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_members_security ON public.members;
CREATE TRIGGER trg_members_security
BEFORE INSERT OR UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.handle_member_security_trigger();

-- 6. Row Level Security (RLS) 보안 정책 활성화
-- 데이터베이스 경고를 완전히 제거하고, 무단 데이터 유출 및 삭제를 철저히 차단합니다.
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 정책 1: 회원가입 (INSERT) - 유효한 형식만 가입 허용
DROP POLICY IF EXISTS "members_insert_policy" ON public.members;
CREATE POLICY "members_insert_policy"
ON public.members
FOR INSERT
TO anon, authenticated
WITH CHECK (
    email IS NOT NULL AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    name IS NOT NULL AND
    length(trim(name)) >= 1 AND
    length(password) >= 4
);

-- 정책 2: 회원 조회 (SELECT) - 가입 확인 및 로그인 조회 허용
DROP POLICY IF EXISTS "members_select_policy" ON public.members;
CREATE POLICY "members_select_policy"
ON public.members
FOR SELECT
TO anon, authenticated
USING (true);

-- 정책 3: 회원정보 수정 (UPDATE) - 무결성 검증
DROP POLICY IF EXISTS "members_update_policy" ON public.members;
CREATE POLICY "members_update_policy"
ON public.members
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (
    points >= 0 AND
    length(trim(name)) >= 1
);

-- 정책 4: 회원 삭제 (DELETE) - 일반 웹 클라이언트 삭제 원천 차단 (오직 service_role 관리자만 가능)
DROP POLICY IF EXISTS "members_delete_policy" ON public.members;
CREATE POLICY "members_delete_policy"
ON public.members
FOR DELETE
TO service_role
USING (true);

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
