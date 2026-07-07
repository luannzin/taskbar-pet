import { Assets, type Container, Graphics, Sprite, type Texture } from "pixi.js";
import type { SceneManifest } from "./types";

export type SceneLayerSprite = { sprite: Sprite; parallax: number };

/**
 * Opaque rounded "tiny world" panel drawn behind the pet when no scene art
 * exists yet. Being opaque under the animated pet also avoids the transparent
 * webkit2gtk trails bug; the rounded corners stay see-through for a floating
 * look. Added at the back of the scene container.
 */
export function drawDefaultBackdrop(
	container: Container,
	width: number,
	height: number,
): Graphics {
	const radius = 16;
	const floorH = Math.round(height * 0.28);
	const g = new Graphics();
	g.roundRect(0, 0, width, height, radius).fill(0x1b1830); // sky / wall
	g.roundRect(0, height - floorH, width, floorH, radius).fill(0x2a2547); // floor
	container.addChildAt(g, 0);
	return g;
}

/**
 * Load an optional scene manifest and add its layers (back-to-front) into the
 * given container. Parallax factors are stored for later camera work. Missing
 * manifests/art degrade gracefully, leaving the window transparent.
 */
export async function loadScene(
	container: Container,
	manifestUrl: string,
): Promise<SceneLayerSprite[]> {
	let manifest: SceneManifest;
	try {
		manifest = await Assets.load<SceneManifest>(manifestUrl);
	} catch {
		return []; // no scene yet — transparent backdrop
	}

	const layers: SceneLayerSprite[] = [];
	for (const layer of manifest.layers) {
		try {
			const texture = await Assets.load<Texture>(layer.file);
			const sprite = new Sprite(texture);
			container.addChild(sprite);
			layers.push({ sprite, parallax: layer.parallax ?? 1 });
		} catch {
			// skip a missing layer, keep the rest
		}
	}
	return layers;
}
