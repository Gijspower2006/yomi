import { BACKEND_URL } from './aiService';

export interface LeaderboardEntry {
  username: string;
  total_xp: number;
  weekly_xp: number;
  streak: number;
  rank: number;
}

export async function submitScore(params: {
  username: string;
  totalXp: number;
  weeklyXp: number;
  streak: number;
}): Promise<void> {
  if (!params.username.trim()) return;
  await fetch(`${BACKEND_URL}/leaderboard/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function fetchLeaderboard(type: 'weekly' | 'total'): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${BACKEND_URL}/leaderboard?type=${type}`);
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
}
