import { formatImages } from "../src/lib/utils";
import * as validators from "../src/lib/validators";

describe("lib/utils", () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
        sandbox.stub(validators, "validateImages");
    });

    afterEach(() => sandbox.restore());

    describe("formatImages", () => {
        it("should validate images", () => {
            formatImages("img1", "img2");

            assert.calledOnceWith(validators.validateImages, "img1", "img2");
        });

        it("should not format images passed as object", () => {
            const [img1, img2] = [{ source: "img-path-1" }, { source: "img-path-1" }];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, img1);
            assert.deepEqual(formattedImg2, img2);
        });

        it("should format images passed as buffers", () => {
            const [img1, img2] = [Buffer.from("img-1"), Buffer.from("img-2")];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, { source: img1, boundingBox: null });
            assert.deepEqual(formattedImg2, { source: img2, boundingBox: null });
        });

        it("should format images passed as strings", () => {
            const [img1, img2] = ["img-path-1", "img-path-2"];
            const [formattedImg1, formattedImg2] = formatImages(img1, img2);

            assert.deepEqual(formattedImg1, { source: img1, boundingBox: null });
            assert.deepEqual(formattedImg2, { source: img2, boundingBox: null });
        });
    });
});
