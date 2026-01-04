
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GoogleGenAI, Type } from "@google/genai";

// --- CONFIG & CONSTANTS ---
const WORLD_SIZE = 400;
const ROAD_WIDTH = 12;
const BLOCK_SIZE = 30;
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

// --- OFFLINE FALLBACK PUZZLES ---
const OFFLINE_PUZZLES = {
    [CryptoTopic.BASICS]: {
        title: "The Founding Principle",
        tutorial: "Cryptography is the art of secret writing. It transforms readable data (plaintext) into scrambled data (ciphertext) using an algorithm and a key.",
        task: "What is the common term for scrambled, unreadable data?",
        correctAnswer: "ciphertext",
        explanation: "Ciphertext is the encrypted version of plaintext that requires a key to be read again."
    },
    [CryptoTopic.SYMMETRIC]: {
        title: "Symmetric Secret",
        tutorial: "Symmetric encryption uses the exact same key for both locking (encrypting) and unlocking (decrypting) the data. It's fast but requires safe key sharing.",
        task: "In this method, how many distinct keys are used for encryption and decryption?",
        correctAnswer: "one",
        explanation: "Symmetric systems use a single shared key for both operations."
    },
    [CryptoTopic.ASYMMETRIC]: {
        title: "The Public Lock",
        tutorial: "Asymmetric encryption uses a pair of keys: a Public Key to encrypt and a Private Key to decrypt. You can give your Public Key to anyone!",
        task: "Which key is kept secret and never shared?",
        correctAnswer: "private",
        explanation: "The Private key must remain secret to ensure only the owner can decrypt the messages."
    },
    [CryptoTopic.HASHING]: {
        title: "Digital Fingerprints",
        tutorial: "Hashing creates a unique, fixed-length string from any input. It's one-way; you can't reverse a hash back to its original data.",
        task: "Is a cryptographic hash reversible?",
        correctAnswer: "no",
        explanation: "Hashing is a one-way function designed to verify integrity, not to hide data for later retrieval."
    },
    [CryptoTopic.SIGNATURES]: {
        title: "Digital Proof",
        tutorial: "Digital signatures use your private key to prove that a message really came from you and hasn't been altered.",
        task: "Digital signatures provide 'Non-____', meaning you can't deny sending the message.",
        correctAnswer: "repudiation",
        explanation: "Non-repudiation ensures that a sender cannot validly deny having sent a message."
    },
    [CryptoTopic.SALTS]: {
        title: "Grain of Salt",
        tutorial: "Salting adds random data to a password before hashing it. This makes it much harder for hackers to use 'Rainbow Tables' to crack common passwords.",
        task: "Does salting happen before or after hashing?",
        correctAnswer: "before",
        explanation: "Salting must happen before hashing so the random data is incorporated into the final digest."
    }
};

// --- STATE ---
const state = {
    score: 0,
    level: 1,
    gemsFound: 0,
    lastInteractTime: 0,
    moveState: { forward: false, backward: false, left: false, right: false }
};

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020617);
scene.fog = new THREE.FogExp2(0x020617, 0.008);

const fovCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1500);
fovCamera.position.set(0, 1.6, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new PointerLockControls(fovCamera, document.body);

// --- LIGHTS ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const sun = new THREE.DirectionalLight(0x818cf8, 1.8);
sun.position.set(100, 200, 100);
sun.castShadow = true;
sun.shadow.camera.left = -250;
sun.shadow.camera.right = 250;
sun.shadow.camera.top = 250;
sun.shadow.camera.bottom = -250;
sun.shadow.mapSize.width = 4096;
sun.shadow.mapSize.height = 4096;
scene.add(sun);

// --- ASSETS ---
const skinTones = ['#ffdbac', '#f1c27d', '#e0ac69', '#8d5524', '#c68642'];
const clothesColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff', '#1e293b'];

class NPC {
    constructor(pos) {
        this.group = new THREE.Group();
        this.group.position.copy(pos);
        this.radius = 0.5;
        
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const skin = skinTones[Math.floor(Math.random() * skinTones.length)];
        const shirt = clothesColors[Math.floor(Math.random() * clothesColors.length)];

        const bodySize = gender === 'male' ? [0.6, 0.7, 0.3] : [0.5, 0.65, 0.28];
        const body = new THREE.Mesh(new THREE.BoxGeometry(...bodySize), new THREE.MeshStandardMaterial({ color: shirt }));
        body.position.y = 1.1;
        body.castShadow = true;
        this.group.add(body);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), new THREE.MeshStandardMaterial({ color: skin }));
        head.position.y = 1.65;
        this.group.add(head);

        this.limbs = {
            lArm: this.createLimb(0.12, 0.5, shirt, [-0.35, 1.25, 0]),
            rArm: this.createLimb(0.12, 0.5, shirt, [0.35, 1.25, 0]),
            lLeg: this.createLimb(0.18, 0.7, 0x111827, [-0.15, 0.4, 0]),
            rLeg: this.createLimb(0.18, 0.7, 0x111827, [0.15, 0.4, 0])
        };
        
        this.targetPos = new THREE.Vector3(pos.x + (Math.random()-0.5)*80, 0, pos.z + (Math.random()-0.5)*80);
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
        if (distToPlayer < 7) {
            const targetRotation = Math.atan2(playerPos.x - this.group.position.x, playerPos.z - this.group.position.z);
            this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotation, 0.1);
            Object.values(this.limbs).forEach(l => l.rotation.x = THREE.MathUtils.lerp(l.rotation.x, 0, 0.1));
        } else {
            const dir = new THREE.Vector3().subVectors(this.targetPos, this.group.position).normalize();
            if (this.group.position.distanceTo(this.targetPos) > 1) {
                this.group.position.add(dir.multiplyScalar(delta * 2.5));
                const targetRotation = Math.atan2(dir.x, dir.z);
                this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotation, 0.1);
                
                const t = Date.now() * 0.008;
                this.limbs.lLeg.rotation.x = Math.sin(t) * 0.5;
                this.limbs.rLeg.rotation.x = Math.sin(t + Math.PI) * 0.5;
                this.limbs.lArm.rotation.x = Math.sin(t + Math.PI) * 0.3;
                this.limbs.rArm.rotation.x = Math.sin(t) * 0.3;
            } else {
                this.targetPos.set((Math.random()-0.5)*WORLD_SIZE, 0, (Math.random()-0.5)*WORLD_SIZE);
            }
        }
    }
}

class Building {
    constructor(pos, size, color) {
        const group = new THREE.Group();
        group.position.copy(pos);
        const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.4 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat);
        box.position.y = size.y / 2;
        box.castShadow = true;
        box.receiveShadow = true;
        group.add(box);

        const winColor = new THREE.Color(0x38bdf8).multiplyScalar(1.5);
        const rows = Math.floor(size.y / 4);
        const cols = Math.floor(size.x / 3);
        
        for (let r = 1; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.5), new THREE.MeshStandardMaterial({ color: winColor, emissive: winColor, emissiveIntensity: Math.random() > 0.4 ? 0.6 : 0 }));
                win.position.set((c - (cols-1)/2)*3, r*4, size.z/2 + 0.05);
                group.add(win);
                const winBack = win.clone();
                winBack.position.z = -size.z/2 - 0.05;
                winBack.rotation.y = Math.PI;
                group.add(winBack);
            }
        }
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
        const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 2 }));
        this.group.add(mesh);
        scene.add(this.group);
        this.mesh = mesh;
    }
    update() {
        if (this.collected) return;
        this.mesh.rotation.y += 0.02;
        this.group.position.y = 1.0 + Math.sin(Date.now()*0.003)*0.2;
    }
    collect() {
        this.collected = true;
        scene.remove(this.group);
    }
}

// --- WORLD INITIALIZATION ---
const ground = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE * 2, WORLD_SIZE * 2), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

for (let i = -10; i <= 10; i++) {
    const rx = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_SIZE * 2, ROAD_WIDTH), new THREE.MeshStandardMaterial({ color: 0x020617 }));
    rx.rotation.x = -Math.PI / 2;
    rx.position.set(0, 0.01, i * GRID_INTERVAL);
    scene.add(rx);
    const rz = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, WORLD_SIZE * 2), new THREE.MeshStandardMaterial({ color: 0x020617 }));
    rz.rotation.x = -Math.PI / 2;
    rz.position.set(i * GRID_INTERVAL, 0.01, 0);
    scene.add(rz);
}

const buildings = [];
const npcs = [];
const gems = [];

for (let i = -6; i <= 6; i++) {
    for (let j = -6; j <= 6; j++) {
        if (Math.abs(i) < 1 && Math.abs(j) < 1) continue; 
        const size = new THREE.Vector3(12+Math.random()*8, 20+Math.random()*60, 12+Math.random()*8);
        const pos = new THREE.Vector3(i * GRID_INTERVAL, 0, j * GRID_INTERVAL);
        buildings.push(new Building(pos, size, `hsl(220, 30%, ${15 + Math.random()*10}%)`));
    }
}

for (let i = 0; i < NPC_COUNT; i++) {
    npcs.push(new NPC(new THREE.Vector3((Math.random()-0.5)*WORLD_SIZE, 0, (Math.random()-0.5)*WORLD_SIZE)));
}

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
    
    let puzzle = null;
    const apiKey = process.env.API_KEY;

    if (apiKey && apiKey.length > 5) {
        try {
            const aiInstance = new GoogleGenAI({ apiKey });
            const result = await aiInstance.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: `Create a beginner cryptography challenge about "${topic}". Title, Tutorial (3 lines), Task (one question), single-word Correct Answer, short Explanation. Format as JSON.`,
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
            puzzle = JSON.parse(result.text);
        } catch (e) {
            console.warn("Gemini API error, falling back to local database:", e);
        }
    }

    // Fallback if API fails or is missing
    if (!puzzle) {
        puzzle = OFFLINE_PUZZLES[topic] || OFFLINE_PUZZLES[CryptoTopic.BASICS];
    }

    showPuzzleModal(puzzle, topic);
}

function showPuzzleModal(puzzle, topic) {
    const modal = document.getElementById('puzzle-modal');
    const content = document.getElementById('puzzle-content');
    document.getElementById('loading-screen').style.display = 'none';
    modal.style.display = 'flex';
    
    content.innerHTML = `
        <div class="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
            <div>
                <span class="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">${topic}</span>
                <h2 class="text-2xl font-black text-white uppercase">${puzzle.title}</h2>
            </div>
            <button id="close-puzzle" class="text-slate-500 hover:text-white text-3xl">&times;</button>
        </div>
        <div class="p-8 space-y-6">
            <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p class="text-slate-300 text-lg leading-relaxed italic">${puzzle.tutorial}</p>
            </div>
            <div class="space-y-4">
                <p class="text-white font-medium text-xl">${puzzle.task}</p>
                <div class="flex gap-4 pt-2">
                    <input id="puzzle-answer" class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="DECRYPT HERE...">
                    <button id="puzzle-submit" class="bg-indigo-600 hover:bg-indigo-500 px-8 rounded-xl font-bold text-white transition-all shadow-lg shadow-indigo-900/40">VERIFY</button>
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
                    <h2 class="text-4xl font-black text-white uppercase tracking-tighter">Cipher Cracked</h2>
                    <p class="text-slate-300 max-w-sm mx-auto">${puzzle.explanation}</p>
                    <button id="modal-ok" class="px-12 py-4 bg-indigo-600 text-white font-bold rounded-2xl mt-4">RESUME PATROL</button>
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
    const delta = Math.min(clock.getDelta(), 0.1);

    if (controls.isLocked) {
        const moveSpeed = 20;
        const moveVector = new THREE.Vector3();
        if (state.moveState.forward) moveVector.z -= 1;
        if (state.moveState.backward) moveVector.z += 1;
        if (state.moveState.left) moveVector.x -= 1;
        if (state.moveState.right) moveVector.x += 1;
        
        moveVector.normalize().multiplyScalar(moveSpeed * delta);
        controls.moveRight(moveVector.x);
        controls.moveForward(-moveVector.z);

        const pPos = fovCamera.position;
        
        // Building Collisions
        buildings.forEach(b => {
            if (b.box.containsPoint(pPos)) {
                const push = new THREE.Vector3().subVectors(pPos, b.box.getCenter(new THREE.Vector3())).normalize();
                pPos.add(push.multiplyScalar(0.8));
            }
        });

        // NPC Awareness & Physical Presence
        npcs.forEach(npc => {
            npc.update(delta, pPos);
            if (pPos.distanceTo(npc.group.position) < 1.2) {
                const push = new THREE.Vector3().subVectors(pPos, npc.group.position).normalize();
                pPos.add(push.multiplyScalar(0.1));
            }
        });

        // Gem Interaction
        gems.forEach(g => {
            g.update();
            if (!g.collected && pPos.distanceTo(g.group.position) < 3.0) {
                const now = Date.now();
                if (now - state.lastInteractTime > 1500) {
                    state.lastInteractTime = now;
                    g.collect();
                    controls.unlock();
                    generatePuzzle(g.topic);
                }
            }
        });
        
        pPos.y = 1.6; 
    }

    renderer.render(scene, fovCamera);
};

animate();

window.onresize = () => {
    fovCamera.aspect = window.innerWidth / window.innerHeight;
    fovCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};
