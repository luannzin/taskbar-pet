import { AnimatedSprite, Assets, Container, Rectangle, Texture } from "pixi.js";
import type { PetAnimation, PetManifest } from "./types";

/** Slice a horizontal strip spritesheet into `count` frame textures. */
export function sliceSheet(
	texture: Texture,
	fw: number,
	fh: number,
	count: number,
): Texture[] {
	const frames: Texture[] = [];
	for (let i = 0; i < count; i++) {
		frames.push(
			new Texture({
				source: texture.source,
				frame: new Rectangle(i * fw, 0, fw, fh),
			}),
		);
	}
	return frames;
}

/** Colored placeholder used while real art is missing. */
function placeholder(fw: number, fh: number): AnimatedSprite {
	const sprite = new AnimatedSprite([Texture.WHITE]);
	sprite.width = fw;
	sprite.height = fh;
	sprite.tint = 0xff77aa;
	return sprite;
}

/**
 * Build an AnimatedSprite for one animation from the manifest.
 * Falls back to a placeholder sprite when the PNG can't be loaded.
 */
async function buildAnimation(
	anim: PetAnimation,
	fw: number,
	fh: number,
): Promise<AnimatedSprite> {
	try {
		const texture = await Assets.load<Texture>(anim.file);
		const frames = sliceSheet(texture, fw, fh, anim.frames);
		const sprite = new AnimatedSprite(frames);
		sprite.animationSpeed = anim.fps / 60;
		sprite.loop = anim.loop ?? true;
		sprite.play();
		return sprite;
	} catch {
		return placeholder(fw, fh);
	}
}

export type LoadedPet = {
	manifest: PetManifest;
	animations: Record<string, AnimatedSprite>;
	container: Container;
};

/** Load a pet manifest (JSON) and build all its animations. */
export async function loadPet(manifestUrl: string): Promise<LoadedPet> {
	const manifest = await Assets.load<PetManifest>(manifestUrl);
	const { frameWidth: fw, frameHeight: fh } = manifest.sprite;

	const animations: Record<string, AnimatedSprite> = {};
	for (const [name, anim] of Object.entries(manifest.animations)) {
		animations[name] = await buildAnimation(anim, fw, fh);
	}

	return { manifest, animations, container: new Container() };
}
