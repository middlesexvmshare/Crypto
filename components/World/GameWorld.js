import React, { useMemo } from 'react';
import htm from 'htm';
import Gem from './Gem.js';
import NPC from './NPC.js';
import Player from './Player.js';
import Clouds from './Clouds.js';
import Building from './Building.js';
import Monolith from './Monolith.js';
import { WORLD_SIZE, BUILDINGS, NPCS, GRID_INTERVAL, BLOCK_SIZE, ROAD_WIDTH } from '../../constants.js';

const html = htm.bind(React.createElement);

const GameWorld = ({ gems, monoliths, onInteract, onMonolithInteract, isPaused, nudgeTarget, nudgeTrigger }) => {
  const roadElements = useMemo(() => {
    const items = [];
    const count = Math.floor(WORLD_SIZE / GRID_INTERVAL);
    const halfBlock = BLOCK_SIZE / 2;
    const halfRoad = ROAD_WIDTH / 2;
    for (let i = -count; i <= count; i++) {
      const roadCoord = i * GRID_INTERVAL + halfBlock + halfRoad;
      items.push(html`
        <mesh key=${`hr-${i}`} rotation=${[-Math.PI / 2, 0, 0]} position=${[0, 0.02, roadCoord]} receiveShadow>
          <planeGeometry args=${[WORLD_SIZE, ROAD_WIDTH]} />
          <meshStandardMaterial color="#111" roughness=${0.9} />
        </mesh>
      `);
      items.push(html`
        <mesh key=${`vr-${i}`} rotation=${[-Math.PI / 2, 0, 0]} position=${[roadCoord, 0.02, 0]} receiveShadow>
          <planeGeometry args=${[ROAD_WIDTH, WORLD_SIZE]} />
          <meshStandardMaterial color="#111" roughness=${0.9} />
        </mesh>
      `);
    }
    return items;
  }, []);

  return html`
    <>
      <mesh rotation=${[-Math.PI / 2, 0, 0]} receiveShadow position=${[0, -0.01, 0]}>
        <planeGeometry args=${[WORLD_SIZE * 2, WORLD_SIZE * 2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      ${roadElements}
      <${Clouds} />
      ${BUILDINGS.map(b => html`<${Building} key=${b.id} data=${b} />`)}
      ${NPCS.map(npc => html`<${NPC} key=${npc.id} data=${npc} />`)}
      ${gems.map(g => html`<${Gem} key=${g.id} data=${g} />`)}
      ${monoliths.map(m => html`<${Monolith} key=${m.id} data=${m} onInteract=${() => onMonolithInteract(m)} />`)}
      <${Player} 
        isPaused=${isPaused} 
        gems=${gems} 
        monoliths=${monoliths}
        onApproach=${onInteract} 
        onMonolithApproach=${onMonolithInteract}
        nudgeTarget=${nudgeTarget}
        nudgeTrigger=${nudgeTrigger}
      />
    </>
  `;
};

export default GameWorld;