import type { AnimatedSprite, Container } from "pixi.js";
import { type LoadedPet, loadPet } from "./loadPet";

export type PetState = "idle" | "main";

/**
 * A pet actor wrapping its loaded animations. Only one animation is shown at a
 * time; `setAnimation` swaps the visible sprite. For now it rests in "idle".
 */
export class Pet {
	readonly container: Container;
	private readonly animations: Record<string, AnimatedSprite>;
	private current?: AnimatedSprite;
	state: PetState = "idle";

	constructor(loaded: LoadedPet) {
		this.container = loaded.container;
		this.animations = loaded.animations;

		for (const sprite of Object.values(this.animations)) {
			sprite.anchor.set(0.5, 1); // feet on the floor line
			sprite.visible = false;
			this.container.addChild(sprite);
		}

		this.setAnimation(this.animations.idle ? "idle" : "main");
	}

	/** Stand the pet on the floor, horizontally centered in the given viewport. */
	center(width: number, height: number): void {
		this.container.x = width / 2;
		this.container.y = height - 8;
	}

	setAnimation(name: string): void {
		const next = this.animations[name] ?? this.animations.main;
		if (!next || next === this.current) return;
		if (this.current) this.current.visible = false;
		next.visible = true;
		this.current = next;
		this.state = name as PetState;
	}
}

/** Load the cat manifest and return a ready Pet actor. */
export async function createPet(manifestUrl: string): Promise<Pet> {
	const loaded = await loadPet(manifestUrl);
	return new Pet(loaded);
}
