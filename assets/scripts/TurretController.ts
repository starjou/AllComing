import { _decorator, Component, Node, Vec3, instantiate, Prefab } from 'cc';
import { GameManager } from './GameManager';
import { BulletController } from './BulletController';
const { ccclass, property } = _decorator;

@ccclass('TurretController')
export class TurretController extends Component {

    @property(Node)
    public gunPoint: Node = null;

    @property(Prefab)
    public bulletPrefab: Prefab = null;

    private fireTimer: number = 0;
    private target: Node = null;

    update(deltaTime: number) {
        if (GameManager.instance.isGameOver) return;

        this.findNearestEnemy();

        if (this.target) {
            this.rotateTurret();
            this.fireTimer += deltaTime;
            const fireRate = GameManager.instance.getFireRate();
            if (this.fireTimer >= 1 / fireRate) {
                this.fireTimer = 0;
                this.shoot();
            }
        }
    }

    private findNearestEnemy() {
        const enemies = this.node.scene.getComponentsInChildren('EnemyController');
        if (enemies.length === 0) {
            this.target = null;
            return;
        }

        let nearest = null;
        let minDist = Infinity;
        const myPos = this.node.worldPosition;

        for (const enemy of enemies) {
            const dist = Vec3.distance(myPos, enemy.node.worldPosition);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy.node;
            }
        }
        this.target = nearest;
    }

    private rotateTurret() {
        const myPos = this.node.worldPosition;
        const targetPos = this.target.worldPosition;
        const dir = new Vec3();
        Vec3.subtract(dir, targetPos, myPos);
        const angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
        this.node.setWorldRotationFromEuler(0, angle, 0);
    }

    private shoot() {
        if (!this.bulletPrefab) return;

        const gm = GameManager.instance;

        const isCrit = Math.random() < gm.getCritRate();
        const damage = isCrit
            ? gm.getDamage() * gm.getCritMulti()
            : gm.getDamage();

        const myPos = this.node.worldPosition;
        const targetPos = this.target.worldPosition;

        const dir = new Vec3(
            targetPos.x - myPos.x,
            0,
            targetPos.z - myPos.z
        );

        const bullet = instantiate(this.bulletPrefab);
        this.node.scene.addChild(bullet);
        bullet.setWorldPosition(myPos.x, 0, myPos.z);
        // console.log('bullet world pos after set:', bullet.worldPosition);

        const ctrl = bullet.getComponent(BulletController);
        if (ctrl) {
            ctrl.init(dir, gm.getBulletSpeed(), damage, isCrit);
        }
    }
}