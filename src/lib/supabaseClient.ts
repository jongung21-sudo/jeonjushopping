import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 기본 환경변수
const defaultUrl = 'https://bjofkwwzeapgjahsjdzb.supabase.co';
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 로컬 스토리지에 저장된 사용자 입력 키 지원 (브라우저에서 바로 연동 가능)
const getStoredAnonKey = () => {
  try {
    return localStorage.getItem('jeonjulee_supabase_anon_key') || '';
  } catch {
    return '';
  }
};

export const getSupabaseUrl = () => envUrl || defaultUrl;

export const getSupabaseAnonKey = () => {
  const stored = getStoredAnonKey();
  if (stored && stored.length > 20) return stored;
  if (envAnonKey && envAnonKey.length > 20 && envAnonKey !== 'your-supabase-anon-public-key-here') {
    return envAnonKey;
  }
  return '';
};

export const isSupabaseConfigured = (): boolean => {
  const key = getSupabaseAnonKey();
  return Boolean(key && key.length > 20);
};

// 안전한 더미 키 (클라이언트 인스턴스 생성 시 에러 방지)
const FALLBACK_DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_offline_safe_mode';

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey() || FALLBACK_DUMMY_KEY;

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
    if (newAnonKey.trim()) {
      localStorage.setItem('jeonjulee_supabase_anon_key', newAnonKey.trim());
    } else {
      localStorage.removeItem('jeonjulee_supabase_anon_key');
    }
  }
  clientInstance = null;
  return getSupabaseClient();
};

export const supabase = getSupabaseClient();

// 실제 DB 연결 상태 테스트 함수
export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase Anon Key가 입력되지 않았습니다. (로컬 캐시 모드로 작동 중)',
    };
  }

  try {
    const client = getSupabaseClient();
    // 가벼운 조회 시도
    const { error } = await client.from('products').select('count', { count: 'exact', head: true });
    
    if (error) {
      // 테이블이 아직 없거나 권한 제한인 경우에도 서버 통신 자체는 성공
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Supabase 서버 연결 성공! (단, schema.sql 테이블 생성이 필요합니다)',
        };
      }
      return {
        success: false,
        message: `연결 오류: ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Supabase 실시간 클라우드 데이터베이스에 정상 연결되었습니다.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `통신 실패: ${err?.message || '네트워크 오류'}`,
    };
  }
};
