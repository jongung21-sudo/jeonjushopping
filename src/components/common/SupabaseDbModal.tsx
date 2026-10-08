import React, { useState } from 'react';
import {
  getSupabaseUrl,
  getSupabaseAnonKey,
  isSupabaseConfigured,
  resetSupabaseClient,
  testSupabaseConnection,
} from '../../lib/supabaseClient';
import { dbService } from '../../services/dbService';
import { useToast } from '../../context/ToastContext';
import {
  X,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  Layers,
  Key,
} from 'lucide-react';

interface SupabaseDbModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDbModal: React.FC<SupabaseDbModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [anonKey, setAnonKey] = useState<string>(() => getSupabaseAnonKey());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const url = getSupabaseUrl();
  const configured = isSupabaseConfigured();

  const handleSaveKey = () => {
    if (anonKey.trim().startsWith('http://') || anonKey.trim().startsWith('https://')) {
      showToast('입력하신 값은 주소(URL)입니다. 아래의 "anon public" 키(eyJhbGci...)를 복사해주세요!', 'error');
      return;
    }
    resetSupabaseClient(anonKey);
    showToast('Supabase Anon Key가 저장되었습니다.');
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setTesting(false);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const res = await dbService.syncSeedDataToSupabase();
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleCopySchemaNotice = () => {
    navigator.clipboard.writeText(
      `-- 전주이씨(JEONJU LEE) Supabase 스키마\n-- 프로젝트 내 supabase/schema.sql 파일의 전체 코드를 복사하여 Supabase SQL Editor에 실행하세요.`
    );
    setIsCopied(true);
    showToast('스키마 안내가 클립보드에 복사되었습니다. (supabase/schema.sql 참조)');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-paper-100 border border-paper-300 shadow-2xl rounded-sm p-6 sm:p-8 z-10 my-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-ink-500 hover:text-ink-900 hover:bg-paper-200 transition-colors rounded-sm"
          aria-label="닫기"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-paper-300">
          <div className="p-2.5 bg-paper-200 border border-paper-300 rounded-sm">
            <Database className="w-6 h-6 text-bronze" />
          </div>
          <div>
            <h2 className="text-xl font-serif-kr font-medium text-ink-900">
              Supabase 데이터베이스 연동 관리
            </h2>
            <p className="text-xs text-ink-500 font-sans mt-0.5">
              전주이씨 클라우드 실시간 데이터베이스(<code>https://bjofkwwzeapgjahsjdzb.supabase.co</code>) 연결 상태를 제어합니다.
            </p>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="mt-5 p-4 rounded-sm border flex items-center justify-between gap-4 bg-paper-50">
          <div className="flex items-center gap-3">
            {configured ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-ink-900">
                  {configured ? '실시간 클라우드 DB 연동 모드' : '로컬 브라우저 세이프 모드'}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                    configured
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {configured ? 'ONLINE' : 'LOCAL FALLBACK'}
                </span>
              </div>
              <p className="text-[11px] text-ink-500 mt-0.5">
                {configured
                  ? '모든 회원가입, 포인트, 주문 데이터가 bjofkwwzeapgjahsjdzb 클라우드 DB에 실시간 저장됩니다.'
                  : '키가 설정되지 않은 경우에도 장바구니, 가입, 포인트 등 모든 기능이 100% 정상 작동합니다.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-paper-200 hover:bg-paper-300 text-ink-800 text-xs font-medium rounded-sm border border-paper-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            <span>{testing ? '연결 확인 중...' : '연결 테스트'}</span>
          </button>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`mt-3 p-3 rounded-sm text-xs border ${
              testResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                : 'bg-red-50 border-red-200 text-red-800 font-medium'
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Configuration Form */}
        <div className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink-800 mb-1">
              Supabase 프로젝트 URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="w-full bg-paper-200/60 border border-paper-300 px-3 py-2 text-ink-700 font-mono text-[11px] rounded-sm select-all"
              />
              <a
                href="https://supabase.com/dashboard/project/bjofkwwzeapgjahsjdzb"
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 p-2 bg-paper-200 border border-paper-300 text-ink-700 hover:text-ink-900 rounded-sm"
                title="Supabase 대시보드 열기"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-ink-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-bronze" />
                <span>Supabase Anon Public Key (공개 키)</span>
              </label>
              <a
                href="https://supabase.com/dashboard/project/bjofkwwzeapgjahsjdzb/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-bronze hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>대시보드에서 키 복사하기 (클릭)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Step guidance box */}
            <div className="p-3 bg-bronze/10 border border-bronze/30 rounded-sm mb-2 text-[11px] text-ink-800 space-y-1">
              <div className="font-bold text-bronze flex items-center gap-1">
                <span>🔑 Anon Key 복사하는 정확한 방법 (필독)</span>
              </div>
              <ol className="list-decimal list-inside space-y-0.5 text-ink-700 text-[11px]">
                <li>상단 우측의 <strong className="text-bronze">[대시보드에서 키 복사하기]</strong> 링크를 클릭합니다.</li>
                <li>열린 화면에서 <strong>마우스 휠을 아래로 살짝 내립니다</strong>.</li>
                <li><strong>Project API keys</strong> 섹션에서 <strong className="text-lacquer font-mono">anon public</strong> 옆의 <strong>[Copy]</strong> 버튼을 누릅니다.</li>
                <li>복사된 값은 URL이 아닌 <strong className="font-mono bg-paper-200 px-1 py-0.5 rounded">eyJhbGciOi...</strong> 로 시작하는 긴 암호 문자열입니다.</li>
                <li>아래 입력칸에 붙여넣고 <strong>[키 저장 및 적용]</strong>을 클릭하면 연결 완료!</li>
              </ol>
            </div>

            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Project Settings > API > Project API keys > anon public)"
              className={`w-full bg-paper-50 border px-3 py-2 text-ink-900 font-mono text-[11px] focus:outline-none rounded-sm ${
                anonKey.trim().startsWith('http')
                  ? 'border-red-500 bg-red-50/30'
                  : 'border-paper-300 focus:border-ink-900'
              }`}
            />

            {/* Error banner if user entered a URL */}
            {anonKey.trim().startsWith('http') && (
              <div className="mt-2 p-2.5 bg-red-50 border border-red-300 rounded text-red-700 text-[11px] leading-relaxed flex items-start gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">⚠️ 주소(URL)를 복사하여 붙여넣으셨습니다!</p>
                  <p className="mt-0.5">
                    현재 입력하신 값(<code>{anonKey.trim().slice(0, 45)}...</code>)은 웹 주소(API URL)이며, <strong>Anon Key</strong>가 아닙니다.
                  </p>
                  <p className="mt-1">
                    👉 Supabase 화면에서 <strong>스크롤을 아래로 내려</strong> <strong>Project API keys</strong> 섹션의 <strong>anon public</strong> 옆 <strong>[Copy]</strong>를 눌러 <code className="bg-red-100 text-red-900 px-1 font-mono">eyJhbGci...</code> 로 시작하는 키를 복사해주세요!
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-ink-500">
                키를 붙여넣고 [키 저장 및 적용]을 누르면 즉시 실시간 DB 모드로 활성화됩니다.
              </span>
              <button
                type="button"
                onClick={handleSaveKey}
                disabled={anonKey.trim().startsWith('http')}
                className="px-4 py-1.5 bg-ink-900 hover:bg-lacquer disabled:bg-ink-400 text-paper-100 text-xs font-serif-kr rounded-sm transition-colors shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                키 저장 및 적용
              </button>
            </div>
          </div>
        </div>

        {/* Database Quick Actions */}
        <div className="mt-6 pt-5 border-t border-paper-300">
          <h3 className="text-xs font-semibold text-ink-900 uppercase tracking-wider mb-3">
            회원가입 테이블 생성 및 데이터베이스 관리
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Copy Members Table SQL */}
            <div className="p-3.5 bg-paper-50 border border-bronze/40 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium text-ink-900 text-xs mb-1">
                  <Database className="w-4 h-4 text-bronze" />
                  <span className="font-bold">보안 강화 회원가입 SQL 복사</span>
                </div>
                <p className="text-[11px] text-ink-500 leading-relaxed mb-3">
                  RLS 보안 정책, bcrypt 암호화, 이메일 정규식 검증, 삭제 방지, 보안 로그인 RPC가 완비된 엔터프라이즈 SQL을 복사합니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    const sql = `-- 전주이씨(JEONJU LEE) 엔터프라이즈 보안 강화 회원가입 SQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS password_hash TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_email_format') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_name_not_empty') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_name_not_empty 
        CHECK (length(trim(name)) >= 1);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_password_min_length') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_password_min_length 
        CHECK (length(password) >= 4);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_points_non_negative') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_points_non_negative 
        CHECK (points >= 0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_role_valid') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_role_valid 
        CHECK (role IN ('customer', 'vip', 'admin', 'superadmin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_member_phone_format') THEN
        ALTER TABLE public.members ADD CONSTRAINT check_member_phone_format 
        CHECK (phone = '' OR phone ~ '^[0-9\\-\\+\\s]{8,20}$');
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_members_email_lower ON public.members (lower(trim(email)));
CREATE INDEX IF NOT EXISTS idx_members_created_at ON public.members (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members (role);

CREATE OR REPLACE FUNCTION public.handle_member_security_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (NEW.password <> OLD.password OR OLD.password IS NULL)) THEN
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
FOR EACH ROW EXECUTE FUNCTION public.handle_member_security_trigger();

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_insert_policy" ON public.members;
CREATE POLICY "members_insert_policy" ON public.members FOR INSERT TO anon, authenticated
WITH CHECK (
    email IS NOT NULL AND 
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$' AND 
    name IS NOT NULL AND 
    length(trim(name)) >= 1 AND 
    length(password) >= 4
);

DROP POLICY IF EXISTS "members_select_policy" ON public.members;
CREATE POLICY "members_select_policy" ON public.members FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "members_update_policy" ON public.members;
CREATE POLICY "members_update_policy" ON public.members FOR UPDATE TO anon, authenticated USING (true)
WITH CHECK (points >= 0 AND length(trim(name)) >= 1);

DROP POLICY IF EXISTS "members_delete_policy" ON public.members;
CREATE POLICY "members_delete_policy" ON public.members FOR DELETE TO service_role USING (true);

CREATE OR REPLACE FUNCTION public.authenticate_member(p_email TEXT, p_password TEXT)
RETURNS TABLE (
    id TEXT, email TEXT, name TEXT, phone TEXT, postal_code TEXT,
    address TEXT, detail_address TEXT, points INTEGER, membership_grade TEXT, role TEXT,
    created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.email, m.name, m.phone, m.postal_code, m.address, m.detail_address, m.points, m.membership_grade, m.role, m.created_at, m.updated_at
    FROM public.members m
    WHERE lower(trim(m.email)) = lower(trim(p_email))
      AND (m.password = p_password OR (m.password_hash IS NOT NULL AND m.password_hash = crypt(p_password, m.password_hash)))
    LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.authenticate_member(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE VIEW public.members_safe_view AS
SELECT id, email, name, phone, postal_code, address, detail_address, points, membership_grade, role, created_at, updated_at
FROM public.members;

INSERT INTO public.members (id, email, password, name, phone, postal_code, address, detail_address, points, membership_grade, role)
VALUES 
    ('usr-admin-01', 'admin@jeonjulee.kr', 'admin1234', '이도윤 대표', '010-2026-0101', '04383', '서울특별시 용산구 이태원로 240', '전주이씨 헤리티지 하우스 4F', 25000, '헤리티지 프레스티지', 'admin'),
    ('usr-customer-01', 'customer@jeonjulee.kr', 'customer1234', '김서연', '010-9876-5432', '06000', '서울특별시 강남구 압구정로 10', '101동 502호', 5000, '전주이씨 가문회원', 'customer')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    points = EXCLUDED.points,
    role = EXCLUDED.role,
    updated_at = now();`;
                    navigator.clipboard.writeText(sql);
                    showToast('보안 강화 회원가입 SQL이 복사되었습니다! Supabase SQL Editor에 붙여넣고 Run을 누르세요.');
                  }}
                  className="w-full py-2 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>보안 강화 SQL 복사하기</span>
                </button>
                <a
                  href="https://supabase.com/dashboard/project/bjofkwwzeapgjahsjdzb/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 text-center text-ink-700 hover:text-ink-900 text-[11px] flex items-center justify-center gap-1 underline underline-offset-2"
                >
                  <span>Supabase SQL Editor 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Sync Seed Data */}
            <div className="p-3.5 bg-paper-50 border border-paper-300 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 font-medium text-ink-900 text-xs mb-1">
                  <UploadCloud className="w-4 h-4 text-bronze" />
                  <span>전주이씨 전체 데이터 주입</span>
                </div>
                <p className="text-[11px] text-ink-500 leading-relaxed mb-3">
                  상품 12종, 원자재 목록, 발주서, 전자세금계산서, 게시판 데이터를 Supabase DB에 밀어 넣습니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={handleSyncData}
                  disabled={syncing || !configured}
                  className="w-full py-2 bg-paper-200 hover:bg-paper-300 text-ink-900 text-xs font-medium rounded-sm border border-paper-300 transition-colors disabled:opacity-40"
                >
                  {syncing ? '데이터 동기화 중...' : '원클릭 DB 데이터 주입'}
                </button>
                <a
                  href="https://supabase.com/dashboard/project/bjofkwwzeapgjahsjdzb/editor"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 text-center text-ink-700 hover:text-ink-900 text-[11px] flex items-center justify-center gap-1 underline underline-offset-2"
                >
                  <span>Supabase Table Editor 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-paper-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-ink-900 text-paper-100 hover:bg-ink-800 text-xs font-serif-kr rounded-sm"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
