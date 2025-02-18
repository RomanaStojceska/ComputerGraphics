import * as THREE from 'three';

export function initializeLighting(scene) {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Directional Light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(0, 200, 200);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 500;
  directionalLight.shadow.camera.left = -100;
  directionalLight.shadow.camera.right = 100;
  directionalLight.shadow.camera.top = 100;
  directionalLight.shadow.camera.bottom = -100;
  scene.add(directionalLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5, 0xffffff);
  scene.add(directionalLightHelper);

  // Spotlight
  const spotlight = new THREE.SpotLight(0xffee88, 3, 0, Math.PI / 4, 0, 0);
  spotlight.castShadow = true;
  spotlight.position.set(0, 100, 100);
  scene.add(spotlight);



  // Spotlight helper (for debugging)
  const spotlightHelper = new THREE.SpotLightHelper(spotlight);
  scene.add(spotlightHelper);

  // Return spotlight so it can be used in other files
  return spotlight;
}
