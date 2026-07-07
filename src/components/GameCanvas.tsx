import { getCurrentWindow } from "@tauri-apps/api/window";
import type { FederatedPointerEvent } from "pixi.js";
import { useEffect, useRef } from "react";
import { createEngine } from "../game/engine";
import { createPet } from "../game/pet";
import { loadScene } from "../game/scene";

const PET_MANIFEST = "/assets/pets/cat/pet.json";
const SCENE_MANIFEST = "/assets/scenes/room/scene.json";

/** Mounts the Pixi application that renders the companion scene. */
export function GameCanvas() {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let disposed = false;
		let destroy: (() => void) | undefined;

		(async () => {
			const engine = await createEngine();
			// A teardown may have run while we were awaiting init.
			if (disposed) {
				engine.app.destroy(true);
				return;
			}

			const host = hostRef.current;
			host?.appendChild(engine.app.canvas);

			await loadScene(engine.scene, SCENE_MANIFEST);
			const pet = await createPet(PET_MANIFEST);
			if (disposed) {
				engine.app.destroy(true);
				return;
			}
			pet.center(engine.app.screen.width, engine.app.screen.height);
			engine.entities.addChild(pet.container);

			// Drag the OS window when the user presses on the scene backdrop.
			engine.app.stage.eventMode = "static";
			engine.app.stage.hitArea = engine.app.screen;
			const onPointerDown = (e: FederatedPointerEvent) => {
				// Interactive actors (added later) stop propagation to opt out.
				if (e.target === engine.app.stage) {
					void getCurrentWindow().startDragging();
				}
			};
			engine.app.stage.on("pointerdown", onPointerDown);

			destroy = () => {
				engine.app.stage.off("pointerdown", onPointerDown);
				engine.app.destroy(true);
			};
		})();

		return () => {
			disposed = true;
			destroy?.();
		};
	}, []);

	return <div ref={hostRef} className="h-full w-full" />;
}
