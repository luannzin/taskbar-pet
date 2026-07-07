import { Assets, type Container, Sprite, type Texture } from "pixi.js";
import type { SceneManifest } from "./types";

export type SceneLayerSprite = { sprite: Sprite; parallax: number };

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
