import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { cartoonifyFaceAI } from './aiCartoonify.service';
import { cartoonifyJpeg } from './cartoonFilter.service';

// Persists the cropped selfie the player positions in FaceCropModal as their Minni's
// face. Saved under the app's document directory (survives app restarts and OS cache
// clears, unlike the picker's own temp URI), so it "stays forever until changed
// again". Each save gets a fresh timestamped filename rather than overwriting a fixed
// one — a stable filename risks an <Image> that already has the old bytes cached in
// memory continuing to show them after a retake; a new filename guarantees a cache
// miss on every platform without relying on any query-string cache-busting trick.
//
// Uses expo-file-system's SDK 54 File/Directory API (synchronous, class-based) rather
// than the old documentDirectory/*Async free-function API it replaced.
const facesDir = new Directory(Paths.document, 'minni_faces');
const OUTPUT_SIZE = 480;

function ensureDir(): void {
    if (!facesDir.exists) facesDir.create({ intermediates: true, idempotent: true });
}

function deletePriorPhotos(uid: string): void {
    if (!facesDir.exists) return;
    for (const entry of facesDir.list()) {
        if (entry instanceof File && entry.name.startsWith(`${uid}_`)) {
            try {
                entry.delete();
            } catch (err) {
                console.warn('Could not delete a prior face photo', err);
            }
        }
    }
}

export interface CropRect {
    originX: number;
    originY: number;
    width: number;
    height: number;
}

// Upscales the AI cartoonizer's fixed 256x256 output back to OUTPUT_SIZE via a temp
// file, since expo-image-manipulator only operates on file URIs, not raw bytes.
async function upscaleToOutputSize(jpegBytes: Uint8Array): Promise<Uint8Array> {
    const scratch = new File(Paths.cache, `ai_cartoon_${Date.now()}.jpg`);
    scratch.write(jpegBytes);
    try {
        const resized = await ImageManipulator.manipulateAsync(scratch.uri, [{ resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } }], {
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG,
        });
        return new File(resized.uri).bytesSync();
    } finally {
        try {
            scratch.delete();
        } catch {
            // best-effort cleanup only
        }
    }
}

// Crops `sourceUri` to `crop` (in the source image's own pixel space — see
// FaceCropModal for how that's computed from the pinch/pan gesture), resizes to a
// fixed square, and copies the result into permanent storage for `uid`. Returns the
// new stable URI to store on the Minni's appearance. With `cartoon: true`, this runs
// the on-device photo2cartoon AI model (aiCartoonify.service) on the cropped face —
// entirely on-device, no network call — falling back to the simpler posterize/edge
// filter in cartoonFilter.service if the model is unavailable on this build/device.
export async function saveFacePhoto(uid: string, sourceUri: string, crop: CropRect, options?: { cartoon?: boolean }): Promise<string> {
    ensureDir();
    const manipulated = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ crop }, { resize: { width: OUTPUT_SIZE, height: OUTPUT_SIZE } }],
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
    );

    deletePriorPhotos(uid);
    const dest = new File(facesDir, `${uid}_${Date.now()}.jpg`);
    if (options?.cartoon) {
        const aiCartoon = await cartoonifyFaceAI(manipulated.uri);
        dest.write(aiCartoon ? await upscaleToOutputSize(aiCartoon) : cartoonifyJpeg(new File(manipulated.uri).bytesSync()));
    } else {
        new File(manipulated.uri).copy(dest);
    }
    return dest.uri;
}

export async function deleteFacePhoto(uid: string): Promise<void> {
    deletePriorPhotos(uid);
}
