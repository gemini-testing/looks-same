import PNGImage from "./png";

export default class BoundedPNGImage extends PNGImage {
    private _boundingBox: any;

    constructor(png, boundingBox) {
        super(png);

        this._boundingBox = boundingBox;
    }

    getPixel(x, y) {
        const { x: actX, y: actY } = this.getActualCoord(x, y);

        return super.getPixel(actX, actY);
    }

    setPixel(x, y, color) {
        const { x: actX, y: actY } = this.getActualCoord(x, y);

        super.setPixel(actX, actY, color);
    }

    getActualCoord(x: number, y: number): { x: number; y: number } {
        return { x: x + this._boundingBox.left, y: y + this._boundingBox.top };
    }

    get width(): number {
        return this._boundingBox.right - this._boundingBox.left + 1;
    }

    get height(): number {
        return this._boundingBox.bottom - this._boundingBox.top + 1;
    }
}
