import { _decorator, Component, Node, Label, ProgressBar, Button, EditBox } from 'cc';
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

        // 更新技能費用與等級
        for (let i = 0; i < 7; i++) {
            if (this.skillCostLabels[i]) {
                this.skillCostLabels[i].string = `$${gm.getSkillCost(i)}`;
            }
            if (this.skillLevelLabels[i]) {
                this.skillLevelLabels[i].string = `Lv.${gm.skillLevels[i]}`;
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

    public onSubmitScore() {
        const lb = this.getComponent(Leaderboard);
        if (!lb || !this.nameInput) return;
        const name = this.nameInput.string;
        lb.submitScore(name, GameManager.instance.score);
        this.refreshLeaderboard();
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

    public onUpgradeSkill(skillIndex: number) {
        GameManager.instance.upgradeSkill(skillIndex);
    }
}