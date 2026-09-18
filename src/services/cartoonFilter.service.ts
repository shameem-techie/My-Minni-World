import { Buffer } from 'buffer';
import jpeg from 'jpeg-js';

// jpeg-js's encoder always ends up on its `Buffer.from(byteout)` branch when bundled
// through Metro (its `typeof module === 'undefined'` escape hatch is for browser
// <script> tags, not CommonJS bundlers) — Hermes has no global Buffer, so without this
// polyfill every encode() call throws "Buffer is not defined".
if (typeof (global as any).Buffer === 'undefined') {
    (global as any).Buffer = Buffer;
}

const POSTERIZE_LEVELS = 5;
const SATURATION_BOOST = 1.35;
const EDGE_THRESHOLD = 60;
const JPEG_QUALITY = 88;

function clamp255(v: number): number {
    return v < 0 ? 0 : v > 255 ? 255 : v;
}

function posterizeChannel(value: number): number {
    const step = 255 / (POSTERIZE_LEVELS - 1);
    return Math.round(Math.round(value / step) * step);
}

function sampleLuma(luma: Float32Array, width: number, height: number, x: number, y: number): number {
    const cx = x < 0 ? 0 : x >= width ? width - 1 : x;
    const cy = y < 0 ? 0 : y >= height ? height - 1 : y;
    return luma[cy * width + cx];
}

// Free, on-device "cartoon-ish" look for a cropped selfie: flattens color into a
// handful of posterized bands, boosts saturation, and darkens strong edges (Sobel on
// luminance) into an outline. This is a photo filter, not AI-drawn cartoon art — chosen
// over a paid image-generation API so it stays instant, offline, and free for a kids'
// app (see plan discussion in CharacterCreatorScreen's face-photo feature).
export function cartoonifyJpeg(jpegBytes: Uint8Array): Uint8Array {
    const decoded = jpeg.decode(jpegBytes, { useTArray: true, formatAsRGBA: true });
    const { width, height, data } = decoded;

    // Luminance is computed once, before any color grading, so the edge map reflects
    // the original photo rather than the posterized/saturated output.
    const luma = new Float32Array(width * height);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        luma[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

    const out = new Uint8Array(data.length);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;

            const gx =
                -sampleLuma(luma, width, height, x - 1, y - 1) + sampleLuma(luma, width, height, x + 1, y - 1) +
                -2 * sampleLuma(luma, width, height, x - 1, y) + 2 * sampleLuma(luma, width, height, x + 1, y) +
                -sampleLuma(luma, width, height, x - 1, y + 1) + sampleLuma(luma, width, height, x + 1, y + 1);
            const gy =
                -sampleLuma(luma, width, height, x - 1, y - 1) - 2 * sampleLuma(luma, width, height, x, y - 1) - sampleLuma(luma, width, height, x + 1, y - 1) +
                sampleLuma(luma, width, height, x - 1, y + 1) + 2 * sampleLuma(luma, width, height, x, y + 1) + sampleLuma(luma, width, height, x + 1, y + 1);
            const edge = Math.sqrt(gx * gx + gy * gy);

            if (edge > EDGE_THRESHOLD) {
                out[i] = 25;
                out[i + 1] = 25;
                out[i + 2] = 25;
                out[i + 3] = 255;
                continue;
            }

            const l = luma[y * width + x];
            out[i] = posterizeChannel(clamp255(l + (data[i] - l) * SATURATION_BOOST));
            out[i + 1] = posterizeChannel(clamp255(l + (data[i + 1] - l) * SATURATION_BOOST));
            out[i + 2] = posterizeChannel(clamp255(l + (data[i + 2] - l) * SATURATION_BOOST));
            out[i + 3] = 255;
        }
    }

    const encoded = jpeg.encode({ data: out, width, height }, JPEG_QUALITY);
    return new Uint8Array(encoded.data);
}
