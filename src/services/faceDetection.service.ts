import FaceDetection from '@react-native-ml-kit/face-detection';
import type { CropRect } from './facePhoto.service';

// Finds the biggest face in a photo and returns a square crop rect (in the source
// image's own pixel space, same convention as FaceCropModal's manual crop math) that
// spans the face from hairline to chin and ear to ear.
//
// ML Kit's `contours.face` is a polygon that already traces that exact outline — the
// jaw and the brow/hairline edge — so we bound that polygon rather than the coarser
// `frame` box (which crops tighter around eyes/nose/mouth and clips ears/forehead on a
// typical selfie). A little extra padding is added on top of the padded box because the
// contour's top edge sits at the brow, not the hairline.
export async function detectFaceCropRect(uri: string, naturalWidth: number, naturalHeight: number): Promise<CropRect | null> {
    try {
        const faces = await FaceDetection.detect(uri, {
            performanceMode: 'accurate',
            contourMode: 'all',
            landmarkMode: 'all',
        });
        if (!faces.length) {
            console.warn('Face detection found no faces, falling back to manual crop');
            return null;
        }

        // If more than one face is in frame (a sibling photobombing, say), use the
        // largest — almost always the one the player meant to crop.
        const face = faces.reduce((a, b) => (a.frame.width * a.frame.height >= b.frame.width * b.frame.height ? a : b));

        const points = face.contours?.face?.points;
        let minX: number;
        let maxX: number;
        let minY: number;
        let maxY: number;
        if (points && points.length > 0) {
            minX = Math.min(...points.map((p) => p.x));
            maxX = Math.max(...points.map((p) => p.x));
            minY = Math.min(...points.map((p) => p.y));
            maxY = Math.max(...points.map((p) => p.y));
        } else {
            minX = face.frame.left;
            maxX = face.frame.left + face.frame.width;
            minY = face.frame.top;
            maxY = face.frame.top + face.frame.height;
        }

        const boxW = maxX - minX;
        const boxH = maxY - minY;
        const padX = boxW * 0.22; // room for ears past the contour's cheek edge
        const padTop = boxH * 0.32; // contour top is the brow, not the hairline
        const padBottom = boxH * 0.12;

        const left = minX - padX;
        const right = maxX + padX;
        const top = minY - padTop;
        const bottom = maxY + padBottom;

        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const size = Math.min(Math.max(right - left, bottom - top), naturalWidth, naturalHeight);
        const half = size / 2;

        const originX = Math.max(0, Math.min(naturalWidth - size, centerX - half));
        const originY = Math.max(0, Math.min(naturalHeight - size, centerY - half));

        return { originX, originY, width: size, height: size };
    } catch (err) {
        // Missing on this device (e.g. iOS Simulator has no ML Kit face model) or no
        // face found — the crop modal just falls back to its default centered view.
        console.warn('Face detection unavailable, falling back to manual crop', err);
        return null;
    }
}
