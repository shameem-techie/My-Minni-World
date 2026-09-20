import { Buffer } from 'buffer';
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

// See cartoonFilter.service.ts for why jpeg-js needs this under Hermes.
if (typeof (global as any).Buffer === 'undefined') {
    (global as any).Buffer = Buffer;
}

// photo2cartoon (minivision-ai, MIT license — see assets/models/THIRD_PARTY_LICENSES.md)
// is a U-GAT-IT face-cartoonization GAN. It expects a 256x256 aligned face, composited
// onto a plain white background where the original photo's background used to be (the
// upstream project does this with a separate face-segmentation model; FaceCropModal's
// circular guide already tells the player exactly which pixels are "face" vs
// "background", so that same circle is reused here as the mask instead of running a
// second model). Output is the same shape, Tanh-activated so values are in [-1, 1].
const MODEL_SIZE = 256;
const JPEG_QUALITY = 90;

let sessionPromise: Promise<InferenceSession> | null = null;

function getSession(): Promise<InferenceSession> {
    if (!sessionPromise) {
        sessionPromise = (async () => {
            const asset = Asset.fromModule(require('../../assets/models/photo2cartoon.onnx'));
            await asset.downloadAsync();
            if (!asset.localUri) throw new Error('photo2cartoon.onnx asset has no localUri after downloadAsync()');
            return InferenceSession.create(asset.localUri);
        })();
    }
    return sessionPromise;
}

// 1 inside the inscribed circle (the "face" FaceCropModal's guide shows the player),
// 0 outside it — same hard-edge circle for both pre- and post-processing, matching the
// upstream model's own mask-then-normalize / mask-then-denormalize order.
function buildCircleMask(size: number): Float32Array {
    const mask = new Float32Array(size * size);
    const r = size / 2;
    const cx = r;
    const cy = r;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x + 0.5 - cx;
            const dy = y + 0.5 - cy;
            mask[y * size + x] = dx * dx + dy * dy <= r * r ? 1 : 0;
        }
    }
    return mask;
}

let circleMask: Float32Array | null = null;
function getCircleMask(): Float32Array {
    if (!circleMask) circleMask = buildCircleMask(MODEL_SIZE);
    return circleMask;
}

// Runs the on-device photo2cartoon model on an already-square face crop. `croppedUri`
// can be any size/format expo-image-manipulator can read; this resizes it to the
// model's fixed 256x256 input itself. Returns cartoonized 256x256 JPEG bytes, or null
// if the model/native module isn't available (e.g. a build that predates this
// dependency) or inference otherwise fails — callers should fall back to
// cartoonFilter.service's offline filter in that case.
export async function cartoonifyFaceAI(croppedUri: string): Promise<Uint8Array | null> {
    try {
        const session = await getSession();

        const resized = await ImageManipulator.manipulateAsync(croppedUri, [{ resize: { width: MODEL_SIZE, height: MODEL_SIZE } }], {
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG,
        });
        const decoded = jpeg.decode(new File(resized.uri).bytesSync(), { useTArray: true, formatAsRGBA: true });
        const { width, height, data } = decoded;
        if (width !== MODEL_SIZE || height !== MODEL_SIZE) {
            throw new Error(`Unexpected resize output ${width}x${height}, expected ${MODEL_SIZE}x${MODEL_SIZE}`);
        }

        const mask = getCircleMask();
        const chwSize = MODEL_SIZE * MODEL_SIZE;
        const input = new Float32Array(3 * chwSize);
        for (let p = 0; p < chwSize; p++) {
            const i = p * 4;
            const m = mask[p];
            input[p] = ((data[i] * m + (1 - m) * 255) / 127.5) - 1;
            input[chwSize + p] = ((data[i + 1] * m + (1 - m) * 255) / 127.5) - 1;
            input[2 * chwSize + p] = ((data[i + 2] * m + (1 - m) * 255) / 127.5) - 1;
        }

        const inputTensor = new Tensor('float32', input, [1, 3, MODEL_SIZE, MODEL_SIZE]);
        const results = await session.run({ input: inputTensor });
        const output = results.output;
        if (!output) throw new Error('photo2cartoon model produced no "output" tensor');
        const out = output.data as Float32Array;

        const rgba = new Uint8Array(chwSize * 4);
        for (let p = 0; p < chwSize; p++) {
            const m = mask[p];
            const r = clamp255((out[p] + 1) * 127.5);
            const g = clamp255((out[chwSize + p] + 1) * 127.5);
            const b = clamp255((out[2 * chwSize + p] + 1) * 127.5);
            const i = p * 4;
            rgba[i] = Math.round(r * m + 255 * (1 - m));
            rgba[i + 1] = Math.round(g * m + 255 * (1 - m));
            rgba[i + 2] = Math.round(b * m + 255 * (1 - m));
            rgba[i + 3] = 255;
        }

        const encoded = jpeg.encode({ data: rgba, width: MODEL_SIZE, height: MODEL_SIZE }, JPEG_QUALITY);
        return new Uint8Array(encoded.data);
    } catch (err) {
        console.warn('AI cartoonize unavailable, falling back to offline filter', err);
        return null;
    }
}

function clamp255(v: number): number {
    return v < 0 ? 0 : v > 255 ? 255 : v;
}
