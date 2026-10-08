-- ====================================================================
-- 전주이씨 (JEONJU LEE) 회원가입 테이블 생성 SQL
-- Supabase 대시보드 (SQL Editor)에 복사하여 실행(Run)하세요.
-- 대상 프로젝트: https://bjofkwwzeapgjahsjdzb.supabase.co
-- ====================================================================

-- 1. 회원가입 테이블 (members) 생성 (이메일 & 비밀번호 저장)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
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

-- 2. profiles 테이블에도 동일하게 저장되도록 호환 테이블 생성
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    password TEXT,
    name TEXT NOT NULL DEFAULT '고객',
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

-- 3. 익명(anon) 키로 회원가입 및 조회가 원활히 가능하도록 RLS 비활성화
ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 4. 테스트 관리자 및 기본 회원 데이터 등록 (선택)
INSERT INTO public.members (id, email, password, name, phone, postal_code, address, detail_address, points, membership_grade, role)
VALUES 
    ('usr-admin-01', 'admin@jeonjulee.kr', 'admin1234', '이도윤 대표', '010-2026-0101', '04383', '서울특별시 용산구 이태원로 240', '전주이씨 헤리티지 하우스 4F', 25000, '헤리티지 프레스티지', 'admin'),
    ('usr-customer-01', 'customer@jeonjulee.kr', 'customer1234', '김서연', '010-9876-5432', '06000', '서울특별시 강남구 압구정로 10', '101동 502호', 5000, '전주이씨 가문회원', 'customer')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    name = EXCLUDED.name,
    points = EXCLUDED.points;
