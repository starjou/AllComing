import { _decorator, Component, Node, Vec3, Collider, ICollisionEvent } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('EnemyController')
export class EnemyController extends Component {

    public maxHP: number = 20;
    public currentHP: number = 20;
    public speed: number = 3;
    public scoreValue: number = 10;
    public moneyValue: number = 5;
    public damage: number = 10;

    private target: Node = null;

    start() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    onDestroy() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.off('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const other = event.otherCollider.node;
        if (other.name === 'Turret') {
            GameManager.instance.takeDamage(this.damage);
            this.node.destroy();
        }
    }

    public init(hp: number, speed: number, target: Node) {
        this.maxHP = hp;
        this.currentHP = hp;
        this.speed = speed;
        this.target = target;
    }

    update(deltaTime: number) {
        if (!this.target) return;

        const targetPos = this.target.worldPosition;
        const myPos = this.node.worldPosition;
        const dir = new Vec3();
        Vec3.subtract(dir, targetPos, myPos);

        // 距離夠近就造成傷害
        const dist = Vec3.distance(myPos, targetPos);
        if (dist < 1.2) {
            GameManager.instance.takeDamage(this.damage);
            this.node.destroy();
            return;
        }

        dir.normalize();
        const move = new Vec3();
        Vec3.multiplyScalar(move, dir, this.speed * deltaTime);
        this.node.setWorldPosition(
            myPos.x + move.x,
            myPos.y,
            myPos.z + move.z
        );

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