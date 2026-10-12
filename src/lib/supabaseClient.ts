import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 기본 환경변수 (신규 프로젝트: cpzyrpaenvzfshqqpmrf)
const defaultUrl = 'https://cpzyrpaenvzfshqqpmrf.supabase.co';
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_KEY_STORAGE = 'jeonjulee_supabase_key_cpzyrpaenvzfshqqpmrf';

export const extractSupabaseKey = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  // Check if .env format with PUBLISHABLE_KEY or ANON_KEY
  const match = trimmed.match(/(?:KEY|ANON_KEY|PUBLISHABLE_KEY)\s*=\s*([^\s\r\n]+)/i);
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '').trim();
  }
  return trimmed;
};

// 로컬 스토리지에 저장된 사용자 입력 키 지원 (브라우저에서 바로 연동 가능)
const getStoredAnonKey = () => {
  try {
    const raw = localStorage.getItem(SUPABASE_KEY_STORAGE) || '';
    return extractSupabaseKey(raw);
  } catch {
    return '';
  }
};

export const getSupabaseUrl = () => {
  if (envUrl && !envUrl.includes('bjofkwwzeapgjahsjdzb') && !envUrl.includes('opyqqllhhirdrcilqsev')) {
    return envUrl;
  }
  return defaultUrl;
};

export const getSupabaseAnonKey = () => {
  const stored = getStoredAnonKey();
  if (stored && stored.length > 20) return stored;
  if (envAnonKey && envAnonKey.length > 20 && envAnonKey !== 'your-supabase-anon-public-key-here') {
    return extractSupabaseKey(envAnonKey);
  }
  return '';
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 20 && !key.startsWith('http'));
};

// 안전한 더미 키 (클라이언트 인스턴스 생성 시 에러 방지)
const FALLBACK_DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_offline_safe_mode';

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const url = getSupabaseUrl();
  const rawKey = getSupabaseAnonKey();
  const key = (rawKey && !rawKey.startsWith('http')) ? rawKey : FALLBACK_DUMMY_KEY;

  if (!clientInstance) {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
};

export const resetSupabaseClient = (newAnonKey?: string) => {
  if (typeof window !== 'undefined' && newAnonKey !== undefined) {
    const extracted = extractSupabaseKey(newAnonKey);
    if (extracted && !extracted.startsWith('http')) {
      localStorage.setItem(SUPABASE_KEY_STORAGE, extracted);
    } else if (!extracted) {
      localStorage.removeItem(SUPABASE_KEY_STORAGE);
    }
  }
  clientInstance = null;
  return getSupabaseClient();
};

export const supabase = getSupabaseClient();

// 실제 DB 연결 상태 테스트 함수
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const key = getSupabaseAnonKey();
  if (!key) {
    return {
      success: false,
      message: 'Supabase Anon Key가 입력되지 않았습니다. (로컬 캐시 모드로 작동 중)',
    };
  }

  if (key.startsWith('http://') || key.startsWith('https://')) {
    return {
      success: false,
      message: '입력하신 값은 API 주소(URL)입니다! 주소가 아닌 anon public 키("eyJhbGci..."로 시작)를 입력해주세요.',
    };
  }

  try {
    const client = getSupabaseClient();
    // 1순위: members(회원가입) 테이블 조회
    const { error: membersErr } = await client.from('members').select('count', { count: 'exact', head: true });
    
    if (!membersErr) {
      return {
        success: true,
        message: 'Supabase(cpzyrpaenvzfshqqpmrf) 클라우드 DB 및 members(회원가입) 테이블에 정상 연결되었습니다! 🎉',
      };
    }

    // members 테이블이 아직 없는 경우
    if (
      membersErr.code === '42P01' || 
      membersErr.code === 'PGRST205' ||
      membersErr.message.includes('relation') || 
      membersErr.message.includes('does not exist') ||
      membersErr.message.includes('schema cache')
    ) {
      return {
        success: true,
        message: 'Supabase 서버(cpzyrpaenvzfshqqpmrf) 연결 성공! 이제 아래 [회원가입 테이블 SQL 복사하기] 버튼을 눌러 SQL Editor에서 [Run]을 실행해주세요.',
      };
    }

    if (
      membersErr.message.includes('JWT') || 
      membersErr.message.includes('Invalid API key') || 
      membersErr.message.includes('apiKey') || 
      membersErr.code === 'PGRST301'
    ) {
      return {
        success: false,
        message: `키 인증 오류: 올바른 anon public 키인지 확인해주세요 (${membersErr.message})`,
      };
    }

    return {
      success: false,
      message: `연결 오류: ${membersErr.message}`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `통신 실패: ${err?.message || '네트워크 오류'}`,
    };
  }
};
