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
    public maxHP: number = 100;
    public currentHP: number = 100;
    public regenPerSecond: number = 0;
    private regenTimer: number = 0;

    // 技能等級
    public skillLevels: number[] = [0, 0, 0, 0, 0, 0, 0];
    // 0:發射頻率 1:子彈速度 2:子彈傷害 3:爆擊率 4:爆擊倍率 5:最大血量 6:回血

    // 初始參數
    public baseFireRate: number = 1;
    public baseBulletSpeed: number = 10;
    public baseDamage: number = 10;
    public baseCritRate: number = 0.05;
    public baseCritMulti: number = 1.05;

    // 技能基礎費用
    public skillBaseCost: number[] = [50, 50, 50, 50, 50, 50, 150];

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
        const level = this.skillLevels[skillIndex] + 1;
        return this.skillBaseCost[skillIndex] * level * level;
    }

    // 升級技能
    public upgradeSkill(skillIndex: number): boolean {
        const cost = this.getSkillCost(skillIndex);
        if (this.money < cost) return false;

        this.money -= cost;
        this.skillLevels[skillIndex]++;
        this.applySkill(skillIndex);
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