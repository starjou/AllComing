import { _decorator, Component, Node, input, Input, EventMouse, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    @property(Node)
    public target: Node = null;

    public rotateSpeed: number = 0.3;
    public minPitch: number = 20;
    public maxPitch: number = 80;

    private isDragging: boolean = false;
    private yaw: number = 0;
    private pitch: number = 45;
    private distance: number = 18;

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        this.updateCameraPosition();
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private onMouseDown(event: EventMouse) {
        if (event.getButton() === 0) {
            this.isDragging = true;
        }
    }

    private onMouseMove(event: EventMouse) {
        if (!this.isDragging) return;
        this.yaw += event.getDeltaX() * this.rotateSpeed;
        this.pitch -= event.getDeltaY() * this.rotateSpeed;
        this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        this.updateCameraPosition();
    }

    private onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.isDragging = false;
        }
    }

    private updateCameraPosition() {
        if (!this.target) return;

        const pitchRad = this.pitch * (Math.PI / 180);
        const yawRad = this.yaw * (Math.PI / 180);

        const x = this.distance * Math.cos(pitchRad) * Math.sin(yawRad);
        const y = this.distance * Math.sin(pitchRad);
        const z = this.distance * Math.cos(pitchRad) * Math.cos(yawRad);

        const targetPos = this.target.worldPosition;
        this.node.setWorldPosition(
            targetPos.x + x,
            targetPos.y + y,
            targetPos.z + z
        );
        this.node.lookAt(targetPos);
    }

    update(deltaTime: number) {

    }
}