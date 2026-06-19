"use client";

import type { Scene } from "@/types/simulation";

interface SceneSelectorProps {
  scenes: Scene[];
  selectedSceneId?: string;
  onSelect: (sceneId: string) => void;
}

export function SceneSelector({ scenes, selectedSceneId, onSelect }: SceneSelectorProps) {
  return (
    <div className="grid gap-3">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          type="button"
          onClick={() => onSelect(scene.id)}
          className={`pixel-select-card text-left ${selectedSceneId === scene.id ? "is-selected" : ""}`}
        >
          <span className="block font-bold text-pixel-yellow">{scene.name}</span>
          <span className="mt-2 block text-sm text-pixel-muted">{scene.description}</span>
        </button>
      ))}
    </div>
  );
}
