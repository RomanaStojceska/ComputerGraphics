import * as THREE from 'three';

export function loadTextures() {
  const textureLoader = new THREE.TextureLoader();
 
  const audienceTexture = textureLoader.load('textures/audience.jpg');
  console.log('Audience texture loaded successfully!');
  
  // Load additional textures for room walls and floor
  const wallRoomTexture = textureLoader.load('textures/wallRoom.jpg');  // Add your file path here
  console.log('Wall room texture loaded successfully!');

  const floorRoomTexture = textureLoader.load('textures/roomFloor.jpg');  // Add your file path here
  console.log('Floor room texture loaded successfully!');

  const ceilingRoomTexture = textureLoader.load('textures/roomCeiling.jpg');  // Add your file path here
  console.log('Floor room texture loaded successfully!');

  return {  audienceTexture, wallRoomTexture, floorRoomTexture, ceilingRoomTexture };
}
