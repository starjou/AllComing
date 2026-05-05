import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

export interface LeaderboardEntry {
    name: string;
    score: number;
}

@ccclass('Leaderboard')
export class Leaderboard extends Component {

    private static STORAGE_KEY = 'allcoming_leaderboard';
    private static MAX_ENTRIES = 10;

    public getEntries(): LeaderboardEntry[] {
        const raw = localStorage.getItem(Leaderboard.STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) as LeaderboardEntry[];
        } catch {
            return [];
        }
    }

    public isHighScore(score: number): boolean {
        const entries = this.getEntries();
        if (entries.length < Leaderboard.MAX_ENTRIES) return true;
        return score > entries[entries.length - 1].score;
    }

    public submitScore(name: string, score: number): boolean {
        if (!this.isHighScore(score)) return false;

        // 名字只取前三個大寫英文字母
        const cleanName = name
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .substring(0, 3)
            .padEnd(3, 'A');

        const entries = this.getEntries();
        entries.push({ name: cleanName, score });
        entries.sort((a, b) => b.score - a.score);

        if (entries.length > Leaderboard.MAX_ENTRIES) {
            entries.splice(Leaderboard.MAX_ENTRIES);
        }

        localStorage.setItem(Leaderboard.STORAGE_KEY, JSON.stringify(entries));
        return true;
    }

    public clearLeaderboard() {
        localStorage.removeItem(Leaderboard.STORAGE_KEY);
    }
}