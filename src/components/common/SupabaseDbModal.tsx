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
    resetSupabaseClient(anonKey);
    showToast('Supabase Anon Key가 브라우저에 저장되었습니다.');
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
              클라우드 실시간 데이터베이스(`https://opyqqllhhirdrcilqsev.supabase.co`) 연결 상태를 제어합니다.
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
                  ? '모든 회원가입, 포인트, 주문, 리뷰 데이터가 클라우드 DB에 실시간 저장됩니다.'
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
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
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
                href="https://supabase.com/dashboard/project/opyqqllhhirdrcilqsev"
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
                <span>대시보드에서 키 복사하기</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Supabase Project Settings > API > anon public 키)"
              className="w-full bg-paper-50 border border-paper-300 px-3 py-2 text-ink-900 font-mono text-[11px] focus:outline-none focus:border-ink-900 rounded-sm"
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-ink-500">
                키를 붙여넣고 [키 저장 및 적용]을 누르면 즉시 실시간 DB 모드로 활성화됩니다.
              </span>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-1.5 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-serif-kr rounded-sm transition-colors shadow-sm"
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
                  <span className="font-bold">회원가입(members) SQL 복사</span>
                </div>
                <p className="text-[11px] text-ink-500 leading-relaxed mb-3">
                  이메일, 비밀번호, 성명, 휴대폰, 주소, 포인트 컬럼이 포함된 테이블 생성 SQL을 즉시 복사합니다.
                </p>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    const sql = `-- 전주이씨(JEONJU LEE) 회원가입 테이블 생성 SQL
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

ALTER TABLE public.members DISABLE ROW LEVEL SECURITY;`;
                    navigator.clipboard.writeText(sql);
                    showToast('회원가입(members) SQL이 복사되었습니다! Supabase SQL Editor에 붙여넣고 Run을 누르세요.');
                  }}
                  className="w-full py-2 bg-ink-900 hover:bg-lacquer text-paper-100 text-xs font-medium rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>회원가입 SQL 복사하기</span>
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
