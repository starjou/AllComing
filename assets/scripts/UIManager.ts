import { _decorator, Component, Node, Label, ProgressBar, EditBox, Button, director } from 'cc';
import { GameManager } from './GameManager';
import { Leaderboard } from './Leaderboard';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {

    @property(Label)
    public scoreLabel: Label = null;

    @property(Label)
    public moneyLabel: Label = null;

    @property(ProgressBar)
    public hpBar: ProgressBar = null;

    @property(Label)
    public hpLabel: Label = null;

    @property(Node)
    public gameOverPanel: Node = null;

    @property(Label)
    public finalScoreLabel: Label = null;

    @property(EditBox)
    public nameInput: EditBox = null;

    @property(Label)
    public leaderboardLabel: Label = null;

    // 七個技能的費用 Label
    @property([Label])
    public skillCostLabels: Label[] = [];

    // 七個技能的等級 Label
    @property([Label])
    public skillLevelLabels: Label[] = [];

    private isGameOverShown: boolean = false;

    start() {
        if (this.gameOverPanel) {
            this.gameOverPanel.active = false;
        }
    }

    update(deltaTime: number) {
        const gm = GameManager.instance;
        if (!gm) return;

        // 更新分數金錢
        if (this.scoreLabel) this.scoreLabel.string = `分數 ${gm.score}`;
        if (this.moneyLabel) this.moneyLabel.string = `金錢 ${gm.money}`;

        // 更新血量條
        if (this.hpBar) this.hpBar.progress = gm.currentHP / gm.maxHP;
        if (this.hpLabel) this.hpLabel.string = `${Math.ceil(gm.currentHP)} / ${gm.maxHP}`;

        // 更新技能費用與等級
        for (let i = 0; i < 7; i++) {
            if (this.skillCostLabels[i]) {
                this.skillCostLabels[i].string = `$${gm.getSkillCost(i)}`;
            }
            if (this.skillLevelLabels[i]) {
                const skillValues = [
                    `${gm.getFireRate().toFixed(1)}/s`,      // 發射頻率
                    `${gm.getBulletSpeed().toFixed(0)}`,      // 子彈速度
                    `${gm.getDamage().toFixed(0)}`,           // 子彈傷害
                    `${(gm.getCritRate() * 100).toFixed(0)}%`,  // 爆擊率
                    `${(gm.getCritMulti() * 100).toFixed(0)}%`, // 爆擊倍率
                    `${gm.maxHP}HP`,                          // 最大血量
                    `${gm.regenPerSecond}/s`,                 // 回血
                ];
                this.skillLevelLabels[i].string = skillValues[i];
                // this.skillLevelLabels[i].string = `Lv.${gm.skillLevels[i]}`;
            }
        }

        // 遊戲結束
        if (gm.isGameOver && !this.isGameOverShown) {
            this.isGameOverShown = true;
            this.showGameOver();
        }
    }

    private showGameOver() {
        if (this.gameOverPanel) this.gameOverPanel.active = true;
        if (this.finalScoreLabel) {
            this.finalScoreLabel.string = `最終分數：${GameManager.instance.score}`;
        }
        this.refreshLeaderboard();
    }

    public onSubmitScore(event: any) {
        const lb = this.getComponent(Leaderboard);
        if (!lb || !this.nameInput) return;
        const name = this.nameInput.string;
        lb.submitScore(name, GameManager.instance.score);
        this.refreshLeaderboard();

        // 防止重複送出，disable input 和 button
        this.nameInput.enabled = false;
        const btn = event.target;
        btn.getComponent(Button).interactable = false;
    }

    private refreshLeaderboard() {
        const lb = this.getComponent(Leaderboard);
        if (!lb || !this.leaderboardLabel) return;
        const entries = lb.getEntries();
        let text = '排行榜\n';
        entries.forEach((e, i) => {
            text += `${i + 1}. ${e.name}  ${e.score}\n`;
        });
        this.leaderboardLabel.string = text;
    }

    public onUpgradeSkill(event: any, skillIndex: number) {
        GameManager.instance.upgradeSkill(Number(skillIndex));
    }

    public onRestart(event: any) {
        director.loadScene('main');
    }

    public onGitHub(event: any) {
        window.open('https://github.com/starjou/AllComing', '_blank');
    }
}