import { _decorator, Component, Vec3, Collider, ICollisionEvent, AudioSource, AudioClip } from 'cc';
import { EnemyController } from './EnemyController';
const { ccclass, property } = _decorator;

@ccclass('BulletController')
export class BulletController extends Component {

    @property(AudioClip)
    public hitSound: AudioClip = null;

    public speed: number = 10;
    public damage: number = 10;
    public isCrit: boolean = false;

    private direction: Vec3 = new Vec3();
    private lifeTimer: number = 0;
    private maxLife: number = 5;

    public init(direction: Vec3, speed: number, damage: number, isCrit: boolean) {
        this.direction = direction.clone();
        this.direction.normalize();
        this.speed = speed;
        this.damage = damage;
        this.isCrit = isCrit;
    }

    start() {
        const collider = this.getComponent(Collider);
        if (collider) {
            collider.on('onCollisionEnter', this.onCollisionEnter, this);
        }
    }

    update(deltaTime: number) {
        const pos = this.node.worldPosition;
        this.node.setWorldPosition(
            pos.x + this.direction.x * this.speed * deltaTime,
            0,
            pos.z + this.direction.z * this.speed * deltaTime
        );

        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.maxLife) {
            this.node.destroy();
        }
    }

    private onCollisionEnter(event: ICollisionEvent) {
        const other = event.otherCollider.node;
        const enemy = other.getComponent(EnemyController);
        if (enemy) {
            enemy.takeDamage(this.damage);
            // 播放擊中音效
            const audioSource = this.getComponent(AudioSource);
            if (audioSource && this.hitSound) {
                audioSource.playOneShot(this.hitSound);
            }
            this.node.destroy();
        }
    }
}