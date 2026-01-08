import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://tqdosxaesqbwbhngvndj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxZG9zeGFlc3Fid2Jobmd2bmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODAxMzIsImV4cCI6MjA3ODg1NjEzMn0.YArQlOsSoHZZRO0Gwm4zyzvDGIRl1GimlosqSPUshz8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface VisitData {
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  path?: string;
  screen_width?: number;
  screen_height?: number;
  language?: string;
  timezone?: string;
  region?: string;
  app_type?: string;
}

/**
 * 记录访问信息到 Supabase
 */
export async function recordVisit(data: VisitData): Promise<void> {
  try {
    const { error } = await supabase
      .from('visits')
      .insert([data]);

    if (error) {
      console.error('Error recording visit:', error);
    }
  } catch (error) {
    console.error('Failed to record visit:', error);
  }
}

/**
 * 获取IP地址和地理位置信息
 */
async function getIpAndRegion(): Promise<{ ip?: string; region?: string }> {
  try {
    // 使用 ipapi.co 免费API获取IP和地理位置信息（支持HTTPS）
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.ip) {
      // 组合区域信息：国家 - 省份/州 - 城市
      const regionParts = [data.country_name, data.region, data.city].filter(Boolean);
      const region = regionParts.length > 0 ? regionParts.join(' - ') : undefined;
      
      return {
        ip: data.ip,
        region: region,
      };
    }
  } catch (error) {
    console.error('Failed to fetch IP and region:', error);
    // 如果 ipapi.co 失败，尝试使用 ip-api.com 作为备选
    try {
      const fallbackResponse = await fetch('https://ip-api.com/json/?fields=status,message,query,country,regionName,city');
      const fallbackData = await fallbackResponse.json();
      
      if (fallbackData.status === 'success') {
        const regionParts = [fallbackData.country, fallbackData.regionName, fallbackData.city].filter(Boolean);
        const region = regionParts.length > 0 ? regionParts.join(' - ') : undefined;
        
        return {
          ip: fallbackData.query,
          region: region,
        };
      }
    } catch (fallbackError) {
      console.error('Fallback IP service also failed:', fallbackError);
    }
  }
  
  return { ip: undefined, region: undefined };
}

/**
 * 收集访问者信息（异步，包含IP和区域）
 */
export async function collectVisitInfo(path: string = window.location.pathname): Promise<VisitData> {
  const { ip, region } = await getIpAndRegion();
  
  return {
    ip_address: ip,
    user_agent: navigator.userAgent,
    referrer: document.referrer || undefined,
    path: path,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    region: region,
    app_type: 'snowfall', // 应用类型
  };
}
