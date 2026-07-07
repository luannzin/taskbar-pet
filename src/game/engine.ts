import { Application, Container, TextureSource } from "pixi.js";

export type Engine = {
	app: Application;
	/** Behind everything: parallax scene layers. */
	scene: Container;
	/** In front of the scene: pet and other actors. */
	entities: Container;
};

/**
 * Create and initialize the Pixi v8 Application with a transparent backdrop
 * and nearest-neighbor scaling for crisp pixel art.
 */
export async function createEngine(): Promise<Engine> {
	// Must be set before any texture is loaded so every source inherits it.
	TextureSource.defaultOptions.scaleMode = "nearest";

	const app = new Application();
	await app.init({
		resizeTo: window,
		backgroundAlpha: 0,
		antialias: false,
		autoDensity: true,
		resolution: window.devicePixelRatio || 1,
	});

	const scene = new Container();
	const entities = new Container();
	app.stage.addChild(scene, entities);

	return { app, scene, entities };
}
