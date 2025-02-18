import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer, Clock } from 'three';

// Utility function to apply shadows to mesh nodes
function applyShadows(node) {
  if (node.isMesh) {
    node.castShadow = true;  
    node.receiveShadow = true;  
  }
}

// Utility function to load a 3D model and apply shadows
function loadModel(loader, path, position, scale, _rotation, scene, _key, isVisible = false) {
  return new Promise((resolve, reject) => {
    loader.load(path, (gltf) => {
      const model = gltf.scene;
      model.position.set(...position); 
      model.scale.set(...scale);  
      model.rotation.y -= Math.PI / 2; 
      model.visible = isVisible; 

      model.traverse(applyShadows);  
      scene.add(model);  

      resolve({ model, animationClips: gltf.animations });  
    }, undefined, reject);  
  });
}

// Function to load and add audience models with textures
function loadAudienceModel(loader, path, position, rotation, texture, scene) {
  loader.load(path, (gltf) => {
    const audience = gltf.scene;
    audience.scale.set(7, 7, 7);  
    audience.position.set(...position);  
    audience.rotation.y = rotation;  

    // Apply texture to all mesh nodes in the audience model
    audience.traverse((node) => {
      if (node.isMesh) {
        node.material = new THREE.MeshStandardMaterial({
          map: texture,  
          roughness: 0.8,  
          metalness: 0.2,  
        });
        applyShadows(node);  
      }
    });

    scene.add(audience);  
  });
}

// Function to initialize models with animations (returns models and animation mixers)
async function loadModelsWithAnimations(loader, modelDataArray, scene) {
  const models = {};  // Object to store models by their keys
  const mixers = [];  // Array to store animation mixers for each model

  // Iterate through each model data and load the model
  for (const { path, position, scale, rotation, key } of modelDataArray) {
    const { model, animationClips } = await loadModel(loader, path, position, scale, rotation, scene, key);
    const mixer = new AnimationMixer(model);  // Create an animation mixer for the model
    models[key] = { model, mixer, animationClips };  // Store model, mixer, and animations
    mixers.push(mixer);  // Add the mixer to the array
  }

  return { models, mixers };
}

// Function to play animations for a model and manage the animation sequence
function playModelAnimation(modelKey, models, mixers, animationQueue, sound) {
  const { model, mixer, animationClips } = models[modelKey];

  model.visible = true;  // Make the model visible when the animation starts

  // Play each animation clip for the model
  animationClips.forEach((clip) => {
    const action = mixer.clipAction(clip);  // Create an animation action for each clip
    action.reset();  // Reset the animation action
    action.play();  // Play the animation
    action.loop = THREE.LoopOnce;  // Set the animation to play once
    action.clampWhenFinished = true;  // Clamp the animation to its final frame
  });

  // Play the sound when the animation starts
  sound.play(); // Play the audio when the model starts walking

  // Event listener to handle when the animation finishes
  mixer.addEventListener('finished', () => {
    model.visible = false;  // Hide the model after the animation finishes
    // If there are more animations in the queue, start the next one
    if (animationQueue.length > 0) {
      const nextModelData = animationQueue.shift();  // Get the next model data
      playModelAnimation(nextModelData.key, models, mixers, animationQueue, sound);  // Play the next animation
    }
  });
}

// Handle keydown events to trigger animations based on the key pressed
function handleKeydownEvent(event, originalAnimationQueue, models, mixers, sound) {
  // Define the key map to shuffle animation order based on the pressed key
  const keyMap = {
    '1': [originalAnimationQueue[0], originalAnimationQueue[1], originalAnimationQueue[2], originalAnimationQueue[3]],
    '2': [originalAnimationQueue[1], originalAnimationQueue[0], originalAnimationQueue[2], originalAnimationQueue[3]],
    '3': [originalAnimationQueue[2], originalAnimationQueue[0], originalAnimationQueue[1], originalAnimationQueue[3]],
    '4': [originalAnimationQueue[3], originalAnimationQueue[0], originalAnimationQueue[1], originalAnimationQueue[2]],
  };

  // Check if the pressed key is in the keyMap
  if (keyMap[event.key]) {
    const animationQueue = [...keyMap[event.key]];  // Copy the animation sequence for the key
    mixers.forEach(mixer => mixer.stopAllAction());  // Stop all current animations

    // Start the first animation in the sequence
    const firstModelData = animationQueue.shift();  // Get the first model data
    models[firstModelData.key].model.visible = true;  // Ensure the first model is visible
    playModelAnimation(firstModelData.key, models, mixers, animationQueue, sound);  // Play the first animation
  }
}

// Main function to load the stage and models, and handle animations
export function loadStage(scene, textures, renderer, camera) {
  const loader = new GLTFLoader();  // Create a new GLTFLoader instance
  const clock = new Clock();  // Create a clock to manage animation timing
  const animationQueue = [
    { path: 'VirtualFashionShow/3D models/model1.glb', position: [40, 10, -50], scale: [28, 28, 28], rotation: 0, key: 'model1' },
    { path: 'VirtualFashionShow/3Dmodels/model2.glb', position: [50, 10, -50], scale: [30, 30, 30], rotation: 0, key: 'model2' },
    { path: 'VirtualFashionShow/3Dmodels/model3.glb', position: [55, 10, -50], scale: [15, 15, 15], rotation: 0, key: 'model3' },
    { path: 'VirtualFashionShow/3Dmodels/model4.glb', position: [40, 10, -50], scale: [32, 32, 32], rotation: 0, key: 'model4' },
  ];

  // Load the audio file
  const audioListener = new THREE.AudioListener();
  camera.add(audioListener);
  const audioLoader = new THREE.AudioLoader();
  const sound = new THREE.Audio(audioListener); // Initialize the sound object

  audioLoader.load('VirtualFashionShow/audio/applause-sound-effect-240470.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false);
    sound.setVolume(0.5); // Set the audio volume
  });

  // Load and set up the stage model
  loader.load('3Dmodels/stage1.glb', (gltf) => {
    const stage = gltf.scene;
    stage.scale.set(25, 25, 25);  
    stage.position.set(0, -10, 0);  
    stage.rotation.y -= Math.PI / 2;  
    scene.add(stage); 
    stage.traverse(applyShadows);  
  });

  // Load and add audience models to the scene
  loadAudienceModel(loader, 'VirtualFashionShow/3Dmodels/audience.glb', [-55, -9, 110], Math.PI / 2, textures.audienceTexture, scene);
  loadAudienceModel(loader, 'VirtualFashionShow/3Dmodels/audience.glb', [55, -9, 30], -Math.PI / 2, textures.audienceTexture, scene);

  // Load all models and initialize animations
  loadModelsWithAnimations(loader, animationQueue, scene).then(({ models, mixers }) => {
    // Add keydown event listener to trigger animations and play audio
    window.addEventListener('keydown', (event) => handleKeydownEvent(event, animationQueue, models, mixers, sound));

    // Animation loop to update animations and render the scene
    function animate() {
      requestAnimationFrame(animate);  // Call the animate function recursively
      const delta = clock.getDelta();  // Get the time delta for animation updates

      mixers.forEach(mixer => mixer.update(delta));  // Update animations for all mixers

      renderer.render(scene, camera);  // Render the scene with the camera
    }

    animate();  // Start the animation loop
  });
}
