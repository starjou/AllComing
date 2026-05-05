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

    // 初始參數
    public baseSpawnInterval: number = 3;
    public baseEnemyHP: number = 20;
    public baseEnemySpeed: number = 3;
    public spawnRadius: number = 20;

    private spawnTimer: number = 0;
    private currentInterval: number = 3;
    private currentHP: number = 20;
    private currentSpeed: number = 3;

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
        const level = Math.floor(score / 100);
        this.currentInterval = Math.max(0.5, this.baseSpawnInterval * Math.pow(0.9, level));
        this.currentHP = this.baseEnemyHP + level * 5;
        this.currentSpeed = this.baseEnemySpeed + level * 0.2;
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