
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIG & CONSTANTS ---
const WORLD_SIZE = 300;
const ROAD_WIDTH = 12;
const BLOCK_SIZE = 28;
const GRID_INTERVAL = ROAD_WIDTH + BLOCK_SIZE;
const NPC_COUNT = 150;
const GEM_COUNT = 50;

const CryptoTopic = {
    BASICS: 'Basics of Encryption',
    SYMMETRIC: 'Symmetric Ciphers',
    ASYMMETRIC: 'Public Key Cryptography',
    HASHING: 'Data Integrity & Hashing',
    SIGNATURES: 'Digital Signatures',
    SALTS: 'Password Salting'
};

// --- STATE ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const state = {
    score: 0,
    level: 1,
    gemsFound: 0,
    inventory: [],
    lastInteractTime: 0,
    moveState: { forward: false, backward: false, left: false, right: false }
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);
scene.fog = new THREE.FogExp2(0x020617, 0.01);

const camera = new THREE.Camera();
const fovCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
fovCamera.position.set(0, 1.6, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(fovCamera, document.body);

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0x818cf8, 1.5);
sun.position.set(50, 100, 50);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
scene.add(sun);

// --- ASSET GENERATION ---
const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642'];
const clothesColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

class NPC {
    constructor(pos) {
        this.group = new THREE.Group();
        this.group.position.copy(pos);
        
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const skin = skinTones[Math.floor(Math.random() * skinTones.length)];
        const shirt = clothesColors[Math.floor(Math.random() * clothesColors.length)];
        const hasHat = Math.random() > 0.7;

        // Torso
        const bodySize = gender === 'male' ? [0.6, 0.7, 0.3] : [0.5, 0.65, 0.28];
        const body = new THREE.Mesh(new THREE.BoxGeometry(...bodySize), new THREE.MeshStandardMaterial({ color: shirt }));
        body.position.y = 1.1;
        body.castShadow = true;
        this.group.add(body);

        // Head
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: skin }));
        head.position.y = 1.65;
        this.group.add(head);

        // Eyes
        const eyeGeo = new THREE.BoxGeometry(0.06, 0.06, 0.02);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.08, 1.72, 0.18);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.08, 1.72, 0.18);
        this.group.add(leftEye, rightEye);

        // Mouth
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.02), new THREE.MeshBasicMaterial({ color: 0x880000 }));
        mouth.position.set(0, 1.58, 0.18);
        this.group.add(mouth);

        if (hasHat) {
            const hatBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0x111827 }));
            hatBase.position.y = 1.83;
            const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.15, 16), new THREE.MeshStandardMaterial({ color: 0x111827 }));
            hatTop.position.y = 1.9;
            this.group.add(hatBase, hatTop);
        }

        // Limbs
        this.limbs = {
            lArm: this.createLimb(0.12, 0.5, shirt, [-0.35, 1.25, 0]),
            rArm: this.createLimb(0.12, 0.5, shirt, [0.35, 1.25, 0]),
            lLeg: this.createLimb(0.18, 0.7, 0x111827, [-0.15, 0.4, 0]),
            rLeg: this.createLimb(0.18, 0.7, 0x111827, [0.15, 0.4, 0])
        };
        
        this.targetPos = new THREE.Vector3(pos.x + (Math.random()-0.5)*40, 0, pos.z + (Math.random()-0.5)*40);
        this.isGreeting = false;
        scene.add(this.group);
    }

    createLimb(w, h, color, pos) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), new THREE.MeshStandardMaterial({ color }));
        mesh.position.set(...pos);
        mesh.castShadow = true;
        this.group.add(mesh);
        return mesh;
    }

    update(delta, playerPos) {
        const distToPlayer = this.group.position.distanceTo(playerPos);
        if (distToPlayer < 6) {
            this.isGreeting = true;
            this.group.lookAt(playerPos.x, 0, playerPos.z);
            // Reset limbs to neutral
            Object.values(this.limbs).forEach(l => l.rotation.x = 0);
        } else {
            this.isGreeting = false;
            const dir = new THREE.Vector3().subVectors(this.targetPos, this.group.position).normalize();
            if (this.group.position.distanceTo(this.targetPos) > 1) {
                this.group.position.add(dir.multiplyScalar(delta * 2));
                this.group.lookAt(this.targetPos.x, 0, this.targetPos.z);
                // Walking animation
                const t = Date.now() * 0.01;
                this.limbs.lLeg.rotation.x = Math.sin(t) * 0.5;
                this.limbs.rLeg.rotation.x = Math.sin(t + Math.PI) * 0.5;
                this.limbs.lArm.rotation.x = Math.sin(t + Math.PI) * 0.3;
                this.limbs.rArm.rotation.x = Math.sin(t) * 0.3;
            } else {
                this.targetPos.set(
                    this.group.position.x + (Math.random()-0.5)*50,
                    0,
                    this.group.position.z + (Math.random()-0.5)*50
                );
            }
        }
    }
}

class Building {
    constructor(pos, size, color) {
        const group = new THREE.Group();
        group.position.copy(pos);
        
        const style = ['skyscraper', 'classic', 'modern'][Math.floor(Math.random()*3)];
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.2 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat);
        box.position.y = size.y / 2;
        box.castShadow = true;
        box.receiveShadow = true;
        group.add(box);

        // Windows
        const winColor = new THREE.Color(0xfbbf24).multiplyScalar(1.5);
        const rows = Math.floor(size.y / 3);
        const cols = Math.floor(size.x / 2.5);
        
        for (let r = 1; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() < 0.2) continue;
                const win = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.2), new THREE.MeshStandardMaterial({ color: winColor, emissive: winColor, emissiveIntensity: 0.5 }));
                win.position.set((c - (cols-1)/2)*2.5, r*3, size.z/2 + 0.01);
                group.add(win);
                
                const winBack = win.clone();
                winBack.position.z = -size.z/2 - 0.01;
                winBack.rotation.y = Math.PI;
                group.add(winBack);
            }
        }

        // Door
        const door = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.5), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        door.position.set(0, 1.25, size.z/2 + 0.02);
        group.add(door);

        scene.add(group);
        this.box = new THREE.Box3().setFromObject(group);
    }
}

class Gem {
    constructor(pos, topic) {
        this.topic = topic;
        this.collected = false;
        this.group = new THREE.Group();
        this.group.position.copy(pos);
        
        const mesh = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1, transparent: true, opacity: 0.8 })
        );
        this.group.add(mesh);
        
        const light = new THREE.PointLight(0x22d3ee, 2, 5);
        this.group.add(light);
        
        scene.add(this.group);
        this.mesh = mesh;
    }

    update() {
        if (this.collected) return;
        this.mesh.rotation.y += 0.02;
        this.group.position.y = 1.0 + Math.sin(Date.now()*0.002)*0.2;
    }

    collect() {
        this.collected = true;
        scene.remove(this.group);
    }
}

// --- WORLD INITIALIZATION ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2), new THREE.MeshStandardMaterial({ color: 0x111827 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Grid & Infrastructure
for (let i = -10; i <= 10; i++) {
    const roadX = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE * 2, ROAD_WIDTH), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    roadX.rotation.x = -Math.PI / 2;
    roadX.position.set(0, 0.01, i * GRID_INTERVAL);
    scene.add(roadX);

    const roadZ = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, WORLD_SIZE * 2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
    roadZ.rotation.x = -Math.PI / 2;
    roadZ.position.set(i * GRID_INTERVAL, 0.01, 0);
    scene.add(roadZ);
}

const buildings = [];
const npcs = [];
const gems = [];

// Populate Blocks
for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
        if (i === 0 && j === 0) continue; // Spawn point
        const bx = i * GRID_INTERVAL - (BLOCK_SIZE / 2);
        const bz = j * GRID_INTERVAL - (BLOCK_SIZE / 2);
        
        // Block Base
        const block = new THREE.Mesh(new THREE.PlaneGeometry(BLOCK_SIZE, BLOCK_SIZE), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        block.rotation.x = -Math.PI / 2;
        block.position.set(i * GRID_INTERVAL, 0.02, j * GRID_INTERVAL);
        scene.add(block);

        // Random Buildings in Block
        const bCount = Math.floor(Math.random()*3) + 1;
        for (let k = 0; k < bCount; k++) {
            const size = new THREE.Vector3(8+Math.random()*6, 15+Math.random()*40, 8+Math.random()*6);
            const pos = new THREE.Vector3(
                i * GRID_INTERVAL + (Math.random()-0.5)*(BLOCK_SIZE-size.x-2),
                0,
                j * GRID_INTERVAL + (Math.random()-0.5)*(BLOCK_SIZE-size.z-2)
            );
            buildings.push(new Building(pos, size, `hsl(${220 + Math.random()*20}, 30%, ${20 + Math.random()*10}%)`));
        }
    }
}

// Populate NPCs
for (let i = 0; i < NPC_COUNT; i++) {
    npcs.push(new NPC(new THREE.Vector3((Math.random()-0.5)*WORLD_SIZE, 0, (Math.random()-0.5)*WORLD_SIZE)));
}

// Populate Gems
const topics = Object.values(CryptoTopic);
for (let i = 0; i < GEM_COUNT; i++) {
    const pos = new THREE.Vector3((Math.random()-0.5)*WORLD_SIZE, 1, (Math.random()-0.5)*WORLD_SIZE);
    gems.push(new Gem(pos, topics[i % topics.length]));
}

// --- GAME LOGIC ---
const updateHUD = () => {
    document.getElementById('player-level').innerText = state.level;
    document.getElementById('player-score').innerText = `${state.score} XP`;
    const counter = document.getElementById('gem-counter');
    counter.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const dot = document.createElement('div');
        dot.className = `w-6 h-6 rotate-45 border ${i < state.gemsFound ? 'bg-cyan-400 border-cyan-300' : 'bg-slate-800 border-slate-700'}`;
        counter.appendChild(dot);
    }
};

async function generatePuzzle(topic) {
    document.getElementById('loading-screen').style.display = 'flex';
    try {
        const prompt = `Create a short beginner cryptography tutorial about "${topic}". Include a Title, Tutorial text (3 sentences), a simple Question/Task, and a single-word Correct Answer. Format as JSON.`;
        const result = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        tutorial: { type: Type.STRING },
                        task: { type: Type.STRING },
                        correctAnswer: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["title", "tutorial", "task", "correctAnswer", "explanation"]
                }
            }
        });
        
        const puzzle = JSON.parse(result.text);
        showPuzzleModal(puzzle, topic);
    } catch (e) {
        console.error("Gemini Error:", e);
        document.getElementById('loading-screen').style.display = 'none';
        controls.lock();
    }
}

function showPuzzleModal(puzzle, topic) {
    const modal = document.getElementById('puzzle-modal');
    const content = document.getElementById('puzzle-content');
    document.getElementById('loading-screen').style.display = 'none';
    modal.style.display = 'flex';
    
    content.innerHTML = `
        <div class="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <h2 class="text-2xl font-black text-cyan-400 uppercase">${puzzle.title}</h2>
            <button id="close-puzzle" class="text-slate-500 hover:text-white">&times;</button>
        </div>
        <div class="p-8 space-y-6">
            <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p class="text-slate-300 text-lg leading-relaxed">${puzzle.tutorial}</p>
            </div>
            <div class="space-y-4">
                <p class="text-white font-bold">${puzzle.task}</p>
                <div class="flex gap-4">
                    <input id="puzzle-answer" class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Enter answer...">
                    <button id="puzzle-submit" class="bg-indigo-600 hover:bg-indigo-500 px-8 rounded-xl font-bold text-white transition-all">DECRYPT</button>
                </div>
            </div>
        </div>
    `;

    const closeBtn = document.getElementById('close-puzzle');
    const submitBtn = document.getElementById('puzzle-submit');
    const input = document.getElementById('puzzle-answer');

    closeBtn.onclick = () => { modal.style.display = 'none'; controls.lock(); };
    submitBtn.onclick = () => {
        if (input.value.trim().toLowerCase() === puzzle.correctAnswer.toLowerCase()) {
            state.score += 250;
            state.gemsFound++;
            state.level = Math.floor(state.score / 1000) + 1;
            updateHUD();
            
            content.innerHTML = `
                <div class="p-12 text-center space-y-6 bg-slate-900">
                    <div class="w-20 h-20 bg-green-500/20 border-4 border-green-500 rounded-full flex items-center justify-center mx-auto text-green-500 text-4xl">✓</div>
                    <h2 class="text-3xl font-black text-white uppercase">Fragment Recovered</h2>
                    <p class="text-slate-400">${puzzle.explanation}</p>
                    <button id="modal-ok" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl mt-4">RESUME PATROL</button>
                </div>
            `;
            document.getElementById('modal-ok').onclick = () => {
                modal.style.display = 'none';
                controls.lock();
            };
        } else {
            input.classList.add('border-red-500', 'animate-shake');
            setTimeout(() => input.classList.remove('animate-shake'), 500);
        }
    };
}

// --- INPUT HANDLING ---
document.getElementById('btn-start').onclick = () => {
    controls.lock();
    document.getElementById('start-screen').style.display = 'none';
    updateHUD();
};

const onKeyDown = (e) => {
    switch(e.code) {
        case 'KeyW': state.moveState.forward = true; break;
        case 'KeyS': state.moveState.backward = true; break;
        case 'KeyA': state.moveState.left = true; break;
        case 'KeyD': state.moveState.right = true; break;
    }
};
const onKeyUp = (e) => {
    switch(e.code) {
        case 'KeyW': state.moveState.forward = false; break;
        case 'KeyS': state.moveState.backward = false; break;
        case 'KeyA': state.moveState.left = false; break;
        case 'KeyD': state.moveState.right = false; break;
    }
};
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();
const animate = () => {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    if (controls.isLocked) {
        // Player Movement
        const moveSpeed = 15;
        const moveVector = new THREE.Vector3();
        if (state.moveState.forward) moveVector.z -= 1;
        if (state.moveState.backward) moveVector.z += 1;
        if (state.moveState.left) moveVector.x -= 1;
        if (state.moveState.right) moveVector.x += 1;
        
        moveVector.normalize().multiplyScalar(moveSpeed * delta);
        controls.moveRight(moveVector.x);
        controls.moveForward(-moveVector.z);

        // Simple Building Collision
        const pPos = fovCamera.position;
        buildings.forEach(b => {
            if (b.box.containsPoint(pPos)) {
                fovCamera.position.y = 1.6; // Keep eyes at standard height
                // Basic push back logic
                const push = new THREE.Vector3().subVectors(pPos, b.box.getCenter(new THREE.Vector3())).normalize();
                pPos.add(push.multiplyScalar(0.5));
            }
        });

        // Gem Interaction
        gems.forEach(g => {
            g.update();
            if (!g.collected && pPos.distanceTo(g.group.position) < 2.5) {
                const now = Date.now();
                if (now - state.lastInteractTime > 1000) {
                    state.lastInteractTime = now;
                    g.collect();
                    controls.unlock();
                    generatePuzzle(g.topic);
                }
            }
        });

        // NPC Awareness
        npcs.forEach(npc => npc.update(delta, pPos));
    }

    renderer.render(scene, fovCamera);
};

animate();

// Resize handling
window.onresize = () => {
    fovCamera.aspect = window.innerWidth / window.innerHeight;
    fovCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
