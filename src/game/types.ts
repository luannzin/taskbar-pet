export type PetAnimation = {
	file: string;
	frames: number;
	fps: number;
	loop?: boolean;
};

export type PetManifest = {
	name: string;
	sprite: { frameWidth: number; frameHeight: number };
	animations: Record<string, PetAnimation>; // e.g. "idle", "main"
};

export type SceneLayer = { file: string; parallax?: number };

export type SceneManifest = { layers: SceneLayer[] };

export const VIEW = { width: 320, height: 180 } as const;
