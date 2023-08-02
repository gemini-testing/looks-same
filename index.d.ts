// Type definitions for looks-same 5.0
// Project: https://github.com/gemini-testing/looks-same/releases
// Definitions by: xcatliu <https://github.com/xcatliu>

/// <reference types="node"/>

// https://stackoverflow.com/questions/44058101/typescript-declare-third-party-modules
declare module looksSame {
    /**
     * coordinate bounds
     */
    export interface CoordBounds {
        /**
         * X-coordinate of upper left corner
         */
        left: number;
        /**
         * Y-coordinate of upper left corner
         */
        top: number;
        /**
         * X-coordinate of bottom right corner
         */
        right: number;
        /**
         * Y-coordinate of bottom right corner
         */
        bottom: number;
    }

    /**
     * bounded image
     */
    export interface BoundedImage {
        /**
         * image path or buffer
         */
        source: string | Buffer;
        /**
         * bounding coordinates
         */
        boundingBox: CoordBounds;
    }

    export interface DiffImage {
        /**
         * Width of the diff image
         */
        width: number;
        /**
         * Height of the diff image
         */
        height: number;
        /**
         * Save the diff image
         * Path should be specified with image extension
         */
        save: (path: string) => Promise<void>;
        /**
         * Create buffer of the diff image
         * If you need to save the image, consider using `save` method
         * Shoud not be mixed with `save` method
         */
        createBuffer: (extension: "png" | "raw") => Promise<Buffer>;
    }

    interface LooksSameBaseResult {
        /**
         * true if images are equal, false - otherwise
         */
        equal: boolean;
        /**
         * diff bounds for not equal images
         */
        diffBounds: CoordBounds;
        /**
         * diff clusters for not equal images
         */
        diffClusters: CoordBounds[];
    }

    interface LooksSameWithNoDiffResult extends LooksSameBaseResult {
        equal: true;
        diffImage: null;
    }

    interface LooksSameWithExistingDiffResult extends LooksSameBaseResult {
        equal: false;
        diffImage: DiffImage;
    }
    /**
     * The result obtained from the function.
    */
    export type LooksSameResult<T = false> = T extends true ? (LooksSameWithNoDiffResult | LooksSameWithExistingDiffResult) : LooksSameBaseResult;

    /**
     * The options passed to looksSame function
     */
    export interface LooksSameOptions {
        /**
         * By default, it will detect only noticeable differences. If you wish to detect any difference, use strict options.
         */
        strict?: boolean;
        /**
         * You can also adjust the ΔE value that will be treated as error in non-strict mode.
         */
        tolerance?: number;
        /**
         * Some devices can have different proportion between physical and logical screen resolutions also known as pixel ratio.
         * Default value for this proportion is 1.
         * This param also affects the comparison result, so it can be set manually with pixelRatio option.
         */
        pixelRatio?: number;
        /**
         * Text caret in text input elements it is a pain for visual regression tasks, because it is always blinks.
         * These diffs will be ignored by default. You can use `ignoreCaret` option with `false` value to disable ignoring such diffs.
         * In that way text caret will be marked as diffs.
         */
        ignoreCaret?: boolean;
        /**
         * Some images has difference while comparing because of antialiasing.
         * These diffs will be ignored by default. You can use ignoreAntialiasing option with false value to disable ignoring such diffs.
         * In that way antialiased pixels will be marked as diffs.
         */
        ignoreAntialiasing?: boolean;
        /**
         * Sometimes the antialiasing algorithm can work incorrectly due to some features of the browser rendering engine.
         * Use the option antialiasingTolerance to make the algorithm less strict.
         * With this option you can specify the minimum difference in brightness (zero by default)
         * between the darkest/lightest pixel (which is adjacent to the antialiasing pixel) and theirs adjacent pixels.
         *
         * We recommend that you don't increase this value above 10. If you need to increase more than 10 then this is definitely not antialiasing.
         */
        antialiasingTolerance?: number;
        /**
         * Responsible for diff area which will be returned when comparing images.
         * Diff bounds will contain the whole diff if stopOnFirstFail is false and only first diff pixel - otherwise.
         */
        stopOnFirstFail?: boolean;
        /**
         * Responsible for diff bounds clustering
         */
        shouldCluster?: boolean;
        /**
         * Radius for every diff cluster
         */
        clustersSize?: number;
        /**
         * If you need both to compare images and create diff image
         */
        createDiffImage?: boolean
    }

    export interface GetDiffAreaOptions {
        /**
         * Strict comparsion
         */
         strict?: boolean;
         /**
          * ΔE value that will be treated as error in non-strict mode
          */
         tolerance?: number;
         /**
          * Some devices can have different proportion between physical and logical screen resolutions also known as pixel ratio.
          */
         pixelRatio?: number;
         /**
          * Ability to ignore text caret
          */
         ignoreCaret?: boolean;
         /**
          * Ability to ignore antialiasing
          */
         ignoreAntialiasing?: boolean;
         /**
          * Makes the search algorithm of the antialiasing less strict
          */
         antialiasingTolerance?: number;
         /**
          * Responsible for diff area which will be returned when comparing images.
          */
         stopOnFirstFail?: boolean;
         /**
          * Responsible for diff bounds clustering
          */
         shouldCluster?: boolean;
         /**
          * Radius for every diff cluster
          */
         clustersSize?: number;
    }

    /**
     * The options passed to looksSame.createDiff function without diff
     */
    export interface CreateDiffAsBufferOptions {
        /**
         * The baseline image
         */
        reference: string | Buffer | BoundedImage;
        /**
         * The current image
         */
        current: string | Buffer | BoundedImage;
        /**
         * Color to highlight the differences
         * e.g. '#ff00ff'
         */
        highlightColor: string;
        /**
         * Strict comparsion
         */
        strict?: boolean;
        /**
         * ΔE value that will be treated as error in non-strict mode
         */
        tolerance?: number;
        /**
         * Makes the search algorithm of the antialiasing less strict
         */
        antialiasingTolerance?: number;
        /**
         * Ability to ignore antialiasing
         */
        ignoreAntialiasing?: boolean;
        /**
         * Ability to ignore text caret
         */
        ignoreCaret?: boolean;
    }

    /**
     * The options passed to looksSame.createDiff function
     */
    export interface CreateDiffOptions extends CreateDiffAsBufferOptions {
        /**
         * The diff image path to store
         */
        diff: string;
    }

    /**
     * Pass to looksSame.colors function
     */
    export interface Color {
        /**
         * Red
         */
        R: number;
        /**
         * Green
         */
        G: number;
        /**
         * Blue
         */
        B: number;
    }

    export async function getDiffArea(
        image1: string | Buffer | BoundedImage,
        image2: string | Buffer | BoundedImage
    ): Promise<CoordBounds | null>;
    export async function getDiffArea(
        image1: string | Buffer | BoundedImage,
        image2: string | Buffer | BoundedImage,
        opts: GetDiffAreaOptions
    ): Promise<CoordBounds | null>;

    export async function createDiff(options: CreateDiffOptions): Promise<null>;
    export async function createDiff(options: CreateDiffAsBufferOptions): Promise<Buffer>;

    /**
     * Compare two colors
     * @param color1 The first color
     * @param color2 The second color
     * @param options The options passed to looksSame.colors function
     */
    export function colors(color1: Color, color2: Color): boolean;
    export function colors(color1: Color, color2: Color, options: { tolerance: number }): boolean;
}

/**
 * Compare two images with options
 * @param image1 The first image
 * @param image2 The second image
 * @param options The options passed to looksSame function
 */
async function looksSame(
    image1: string | Buffer | looksSame.BoundedImage,
    image2: string | Buffer | looksSame.BoundedImage,
    options?: looksSame.LooksSameOptions & { createDiffImage?: false },
): Promise<looksSame.LooksSameResult<false>>;

async function looksSame(
    image1: string | Buffer | looksSame.BoundedImage,
    image2: string | Buffer | looksSame.BoundedImage,
    options: looksSame.LooksSameOptions & { createDiffImage: true },
): Promise<looksSame.LooksSameResult<true>>;

/**
 * Node.js library for comparing PNG-images, taking into account human color perception.
 * It is created specially for the needs of visual regression testing for gemini utility, but can be used for other purposes.
 */
export = looksSame;
