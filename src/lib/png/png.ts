import fs from "fs";
import concat from "concat-stream";

type Constructor<T> = new (...args: any[]) => T;

export default abstract class PNGImage {
    public static create<T extends PNGImage>(this: Constructor<T>, ...args): T {
        return new this(...args);
    }

    constructor(protected _png: any) {}

    getPixel(x, y) {
        const idx = this._getIdx(x, y);
        return {
            R: this._png.data[idx],
            G: this._png.data[idx + 1],
            B: this._png.data[idx + 2],
        };
    }

    setPixel(x, y, color) {
        const idx = this._getIdx(x, y);
        this._png.data[idx] = color.R;
        this._png.data[idx + 1] = color.G;
        this._png.data[idx + 2] = color.B;
        this._png.data[idx + 3] = 255;
    }

    _getIdx(x, y) {
        return (this._png.width * y + x) * 4;
    }

    save(path, callback) {
        const writeStream = fs.createWriteStream(path);
        this._png.pack().pipe(writeStream);

        writeStream.on("error", error => callback(error));
        writeStream.on("finish", () => callback(null));
    }

    createBuffer(callback) {
        this._png.pack().pipe(concat(gotDiff));
        this._png.on("error", error => callback(error, null));

        function gotDiff(data) {
            callback(null, data);
        }
    }

    abstract getActualCoord(x: number, y: number): { x: number; y: number };
    abstract get width(): number;
    abstract get height(): number;
}
