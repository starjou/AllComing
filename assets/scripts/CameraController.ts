import { _decorator, Component, Node, input, Input, EventMouse, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {

    @property(Node)
    public target: Node = null;

    // 拖曳旋轉靈敏度，值越大轉越快
    public rotateSpeed: number = 0.3;
    // 垂直角度（仰角）限制，單位為度
    public minPitch: number = -30;
    public maxPitch: number = 45;

    private isDragging: boolean = false;
    private yaw: number = 180;
    private pitch: number = 15;
    // 鏡頭與目標的初始距離，滾輪可縮放（範圍 5~50）
    private distance: number = 18;

    start() {
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
        this.updateCameraPosition();
    }

    onDestroy() {
        input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseWheel, this);
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

    private onMouseWheel(event: EventMouse) {
        this.distance -= event.getScrollY() * 0.005;
        this.distance = Math.max(5, Math.min(50, this.distance));
        this.updateCameraPosition();
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
}