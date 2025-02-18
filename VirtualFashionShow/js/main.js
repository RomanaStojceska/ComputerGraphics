import * as THREE from 'three';
import { loadStage } from './stage.js';
import { loadTextures } from './textures.js';
import { initializeLighting } from './lighting.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 50, 100);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadows in the renderer
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Load textures
const textures = loadTextures();

// Create Room Function
function createRoom(textures) {
    const roomSize = 400;
    const geometry = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
    const materialArray = [
        new THREE.MeshStandardMaterial({ map: textures.wallRoomTexture, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ map: textures.wallRoomTexture, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ map: textures.ceilingRoomTexture, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ map: textures.floorRoomTexture, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ map: textures.wallRoomTexture, side: THREE.BackSide }),
        new THREE.MeshStandardMaterial({ map: textures.wallRoomTexture, side: THREE.BackSide })
    ];
    const room = new THREE.Mesh(geometry, materialArray);
    room.position.set(0, roomSize / 2 - 10, 0);
    room.receiveShadow = true; // Enable the floor to receive shadows
    scene.add(room);
}

// Create Smoke Effect Function
function createSmoke(scene, xPosition, zPosition) {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const textureLoader = new THREE.TextureLoader();
    const smokeTexture = textureLoader.load('textures/smoke.png'); // Ensure the path is correct

    const material = new THREE.PointsMaterial({
        size: 10,
        map: smokeTexture,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.2,
    });

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            Math.random() * 100 + xPosition, // X position (centered around xPosition)
            Math.random() * 10 - 5,          // Y position (close to ground)
            Math.random() * 100 + zPosition  // Z position (centered around zPosition)
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    function animateSmoke() {
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.random() * 0.1; // Move upward (Y-axis)
            if (positions[i + 1] > 10) positions[i + 1] = Math.random() * 5 - 5; // Reset position near ground
        }
        geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateSmoke);
    }

    animateSmoke();
}

// Initialize the Scene
function init() {
    // Create Room and Smoke
    createRoom(textures);
    createSmoke(scene, 30, 20);  // Positive x-axis, slightly towards +z
    createSmoke(scene, -130, 20); // Negative x-axis, slightly towards +z

    // Load Stage, Lighting, and Controls
    loadStage(scene, textures, renderer, camera);
    initializeLighting(scene);
    initializeControls(camera, renderer);

    // Animation Loop
    animate();
}

// Initialize OrbitControls
function initializeControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Start the Application
init();
