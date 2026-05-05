import { _decorator, Component, Node, Vec3 } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('EnemyController')
export class EnemyController extends Component {

    public maxHP: number = 20;
    public currentHP: number = 20;
    public speed: number = 3;
    public scoreValue: number = 10;
    public moneyValue: number = 5;

    private target: Node = null;

    start() {

    }

    public init(hp: number, speed: number, target: Node) {
        this.maxHP = hp;
        this.currentHP = hp;
        this.speed = speed;
        this.target = target;
    }

    update(deltaTime: number) {
        if (!this.target) return;

        // 朝目標移動
        const targetPos = this.target.worldPosition;
        const myPos = this.node.worldPosition;
        const dir = new Vec3();
        Vec3.subtract(dir, targetPos, myPos);
        dir.normalize();
        const move = new Vec3();
        Vec3.multiplyScalar(move, dir, this.speed * deltaTime);
        this.node.setWorldPosition(
            myPos.x + move.x,
            myPos.y,
            myPos.z + move.z
        );

        // 面向目標
        const angle = Math.atan2(dir.x, dir.z) * (180 / Math.PI);
        this.node.setWorldRotationFromEuler(0, angle, 0);
    }

    public takeDamage(damage: number): boolean {
        this.currentHP -= damage;
        if (this.currentHP <= 0) {
            this.die();
            return true;
        }
        return false;
    }

    private die() {
        GameManager.instance.onEnemyKilled(this.scoreValue, this.moneyValue);
        this.node.destroy();
    }
}