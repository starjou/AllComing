import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

export let gameManagerInstance: GameManager = null;

@ccclass('GameManager')
export class GameManager extends Component {

    public static get instance(): GameManager {
        return gameManagerInstance;
    }

    // 遊戲狀態
    public score: number = 0;
    public money: number = 0;
    public isGameOver: boolean = false;

    // 血量
    // maxHP：玩家初始最大血量。升級技能 5 後改由 applySkill 覆蓋（100 + level * 20），此值僅作開局基準。
    public maxHP: number = 100;
    public currentHP: number = 0;
    // regenPerSecond：每秒回血量，初始為 0（不回血）。升級技能 6 後每級 +1 點/秒。
    public regenPerSecond: number = 0;
    private regenTimer: number = 0;

    // 技能等級，索引對應如下，初始全為 0：
    // 0:發射頻率 1:子彈速度 2:子彈傷害 3:爆擊率 4:爆擊倍率 5:最大血量 6:回血
    public skillLevels: number[] = [0, 0, 0, 0, 0, 0, 0];

    // 技能費用成長率，數值越高升級費用增加越快（建議範圍 1.2~2.0）
    public skillCostGrowthRate: number = 1.2;

    // 初始參數（技能升級後的實際數值由各 get* 方法計算，不需手動改 current）
    // baseFireRate：初始發射頻率（次/秒）。每升一級 +0.3。
    public baseFireRate: number = 1;
    // baseBulletSpeed：初始子彈速度（世界單位/秒）。每升一級 +2。
    public baseBulletSpeed: number = 10;
    // baseDamage：初始子彈傷害。每升一級 +5。
    public baseDamage: number = 10;
    // baseCritRate：初始爆擊率（0~1）。每升一級 +0.05（即 +5%）。
    public baseCritRate: number = 0.05;
    // baseCritMulti：初始爆擊倍率。每升一級 +0.05（即 +5%）。
    public baseCritMulti: number = 1.05;

    // 各技能的基礎升級費用，對應 skillLevels 索引。
    // 實際費用公式：baseCost * (當前等級 + 1)²，等級越高費用急劇上升。
    // 技能 6（回血）初始費用設 150，比其他技能貴。
    public skillBaseCost: number[] = [1, 1, 1, 1, 1, 1, 1];

    start() {
        gameManagerInstance = this;
        this.currentHP = this.maxHP;
    }

    update(deltaTime: number) {
        if (this.isGameOver) return;

        // 回血
        if (this.regenPerSecond > 0) {
            this.regenTimer += deltaTime;
            if (this.regenTimer >= 1) {
                this.regenTimer = 0;
                this.heal(this.regenPerSecond);
            }
        }
    }

    // 取得技能升級費用
    public getSkillCost(skillIndex: number): number {
        const idx = Number(skillIndex);
        const level = this.skillLevels[idx] + 1;
        return Math.floor(this.skillBaseCost[idx] * Math.pow(this.skillCostGrowthRate, level));
    }

    // 升級技能
    public upgradeSkill(skillIndex: number): boolean {
        const idx = Number(skillIndex);
        const cost = this.getSkillCost(idx);
        if (this.money < cost) return false;

        this.money -= cost;
        this.skillLevels[idx]++;
        this.applySkill(idx);
        return true;
    }

    // 套用技能效果
    private applySkill(skillIndex: number) {
        const level = this.skillLevels[skillIndex];
        switch (skillIndex) {
            case 5: // 最大血量
                this.maxHP = 100 + level * 20;
                this.currentHP = Math.min(this.currentHP + 20, this.maxHP);
                break;
            case 6: // 回血
                this.regenPerSecond = level;
                break;
        }
    }

    // 取得當前技能數值
    public getFireRate(): number { return this.baseFireRate + this.skillLevels[0] * 0.3; }
    public getBulletSpeed(): number { return this.baseBulletSpeed + this.skillLevels[1] * 2; }
    public getDamage(): number { return this.baseDamage + this.skillLevels[2] * 5; }
    public getCritRate(): number { return this.baseCritRate + this.skillLevels[3] * 0.05; }
    public getCritMulti(): number { return this.baseCritMulti + this.skillLevels[4] * 0.05; }

    // 受傷
    public takeDamage(amount: number) {
        if (this.isGameOver) return;
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) this.gameOver();
    }

    // 回血
    public heal(amount: number) {
        if (this.isGameOver) return;
        this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
    }

    // 擊殺敵人
    public onEnemyKilled(scoreValue: number, moneyValue: number) {
        this.score += scoreValue;
        this.money += moneyValue;
    }

    // 遊戲結束
    private gameOver() {
        this.isGameOver = true;
        // UIManager 會監聽這個
    }
}