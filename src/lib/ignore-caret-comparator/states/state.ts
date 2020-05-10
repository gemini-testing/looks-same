export default abstract class State {
    private _ctx: any;

    constructor(comporator) {
        this._ctx = comporator;
    }

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
