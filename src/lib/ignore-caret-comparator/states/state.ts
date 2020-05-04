export default abstract class State {
    constructor(
        private _ctx: any
    ) {}

    switchState(state) {
        this._ctx.switchState(state);
    }

    get pixelRatio() {
        return this._ctx.pixelRatio;
    }

    get caretTopLeft() {
        return this._ctx.caretTopLeft;
    }

    set caretTopLeft(point) {
        this._ctx.caretTopLeft = point;
    }

    get caretBottomRight() {
        return this._ctx.caretBottomRight;
    }

    set caretBottomRight(point) {
        this._ctx.caretBottomRight = point;
    }

    abstract validate(point: any, imgs?: any): boolean;
}
