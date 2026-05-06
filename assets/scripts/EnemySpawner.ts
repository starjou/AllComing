import { _decorator, Component, Node, Vec3, instantiate, Prefab } from 'cc';
import { GameManager } from './GameManager';
import { EnemyController } from './EnemyController';
const { ccclass, property } = _decorator;

@ccclass('EnemySpawner')
export class EnemySpawner extends Component {

    @property(Prefab)
    public enemyPrefab: Prefab = null;

    @property(Node)
    public turret: Node = null;

    // 初始出怪間隔（秒）。每累積 100 分提升一個難度等級，間隔乘以 0.9，最低壓縮至 0.5 秒。
    // 例如：設 3 → 第 1 級變 2.7 秒、第 2 級變 2.43 秒，以此類推。
    public baseSpawnInterval: number = 3;

    // 初始敵人血量。每個難度等級增加 5 點（level * 5）。
    // 例如：設 20 → 第 1 級 25、第 2 級 30。
    public baseEnemyHP: number = 20;

    // 初始敵人移動速度。每個難度等級增加 0.2（level * 0.2）。
    // 例如：設 3 → 第 1 級 3.2、第 2 級 3.4。
    public baseEnemySpeed: number = 3;

    // 敵人生成的圓周半徑（世界單位）。敵人會隨機落在以場景原點為圓心、此半徑的圓上。
    // 調大可讓玩家有更多反應時間，調小則更緊迫。
    public spawnRadius: number = 20;

    // 難度調整參數
    public scorePerLevel: number = 50;        // 每幾分升一級
    public spawnRateDecay: number = 0.8;       // 生成間隔衰減率（越小越快）
    public minSpawnInterval: number = 0.1;     // 最小生成間隔（秒）
    public hpGrowthPerLevel: number = 5;       // 每級敵人血量增加
    public speedGrowthPerLevel: number = 0.2;  // 每級敵人速度增加

    private spawnTimer: number = 0;
    private currentInterval: number = 0;
    private currentHP: number = 0;
    private currentSpeed: number = 0;

    start() {
        this.currentInterval = this.baseSpawnInterval;
        this.currentHP = this.baseEnemyHP;
        this.currentSpeed = this.baseEnemySpeed;
    }

    update(deltaTime: number) {
        if (GameManager.instance.isGameOver) return;

        // 根據分數調整難度
        this.updateDifficulty(GameManager.instance.score);

        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.currentInterval) {
            this.spawnTimer = 0;
            this.spawnEnemy();
        }
    }

    private updateDifficulty(score: number) {
        const level = Math.floor(score / this.scorePerLevel);
        this.currentInterval = Math.max(this.minSpawnInterval, this.baseSpawnInterval * Math.pow(this.spawnRateDecay, level));
        this.currentHP = this.baseEnemyHP + level * this.hpGrowthPerLevel;
        this.currentSpeed = this.baseEnemySpeed + level * this.speedGrowthPerLevel;
    }

    private spawnEnemy() {
        if (!this.enemyPrefab || !this.turret) return;

        // 隨機角度生成在圓周上
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * this.spawnRadius;
        const z = Math.sin(angle) * this.spawnRadius;

        const enemy = instantiate(this.enemyPrefab);
        this.node.scene.addChild(enemy);
        enemy.setWorldPosition(x, 0, z);

        const ctrl = enemy.getComponent(EnemyController);
        if (ctrl) {
            ctrl.init(this.currentHP, this.currentSpeed, this.turret);
        }
    }
}