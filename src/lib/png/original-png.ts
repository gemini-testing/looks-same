import PNGImage from "./png";

export default class OriginalPNGImage extends PNGImage {
    getActualCoord(x: number, y: number): { x: number; y: number } {
        return { x, y };
    }

    get width(): number {
        return this._png.width;
    }

    get height(): number {
        return this._png.height;
    }
}
