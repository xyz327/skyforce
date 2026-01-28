
import { createClient } from '@supabase/supabase-js';

// 这些应该放在环境变量中，但为了方便演示，如果环境变量不存在，我们提供占位符
// 用户需要在 Supabase 控制台创建一个项目，并替换以下值
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface LeaderboardEntry {
  id?: number;
  username: string;
  score: number; // 这里的 score 实际上存储的是距离
  created_at?: string;
}

// 获取排行榜前 10 名
export const fetchLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    // 检查是否有配置
    if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
      console.warn('Supabase not configured. Using mock data.');
      return getMockLeaderboard();
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return getMockLeaderboard();
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    return getMockLeaderboard();
  }
};

// 上传分数
export const submitScore = async (username: string, score: number): Promise<void> => {
  try {
    if (supabaseUrl.includes('your-project') || supabaseKey.includes('your-anon-key')) {
      console.log('Supabase not configured. Mock submit:', { username, score });
      saveMockScore(username, score);
      return;
    }

    // 检查该用户是否已有记录
    const { data: existingUser } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .single();

    if (existingUser) {
      // 如果新分数更高，则更新
      if (score > existingUser.score) {
        await supabase
          .from('leaderboard')
          .update({ score })
          .eq('username', username);
      }
    } else {
      // 否则插入新记录
      await supabase
        .from('leaderboard')
        .insert([{ username, score }]);
    }
  } catch (err) {
    console.error('Error submitting score:', err);
  }
};

// Mock Data Helpers
const MOCK_STORAGE_KEY = 'skyforce_mock_leaderboard';

const getMockLeaderboard = (): LeaderboardEntry[] => {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score).slice(0, 10);
  }
  return [
    { username: 'ACE_PILOT', score: 5000 },
    { username: 'SKY_WALKER', score: 4200 },
    { username: 'MAVERICK', score: 3800 },
    { username: 'GOOSE', score: 3100 },
    { username: 'ROOKIE', score: 1500 },
  ];
};

const saveMockScore = (username: string, score: number) => {
  const current = getMockLeaderboard();
  const existingIndex = current.findIndex(e => e.username === username);
  
  if (existingIndex >= 0) {
    if (score > current[existingIndex].score) {
      current[existingIndex].score = score;
    }
  } else {
    current.push({ username, score });
  }
  
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(current));
};
