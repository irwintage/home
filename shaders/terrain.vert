varying vec3 vTerrainWorld;
varying vec3 vTerrainNormal;

uniform float uTime;
uniform float uOpening;


// ============================================================
// TERRAIN VERTEX DATA
// ============================================================

void terrainVertexData(
  vec3 positionLocal,
  vec3 normalLocal
){

  vec3 displacedPosition =
    positionLocal;


  // ==========================================================
  // 1. SUBTLE PERMANENT BREATHING
  //
  // Very small motion so the terrain feels alive
  // without looking like water.
  // ==========================================================

  float breathA =
    sin(
      positionLocal.x * 0.055 +
      uTime * 0.28
    );

  float breathB =
    cos(
      positionLocal.y * 0.038 -
      uTime * 0.19
    );

  float breathing =
    breathA *
    breathB;


  displacedPosition.z +=
    breathing *
    0.045;


  // ==========================================================
  // 2. ORB OPENING RIPPLE
  //
  // Disturbance emitted from the orb region
  // when uOpening rises.
  // ==========================================================

  float distanceFromOrb =
    distance(
      positionLocal.xy,
      vec2(
        0.0,
        20.0
      )
    );


  float ripple =
    sin(
      distanceFromOrb * 0.72 -
      uTime * 3.8
    );


  // Fade ripple with distance

  float rippleFalloff =
    exp(
      -distanceFromOrb * 0.085
    );


  // Slightly soften the very center

  float centerMask =
    smoothstep(
      1.5,
      6.0,
      distanceFromOrb
    );


  float openingRipple =
    ripple *
    rippleFalloff *
    centerMask *
    uOpening;


  displacedPosition.z +=
    openingRipple *
    0.22;


  // ==========================================================
  // WORLD POSITION
  // ==========================================================

  vec4 worldPosition =
    modelMatrix *
    vec4(
      displacedPosition,
      1.0
    );


  vTerrainWorld =
    worldPosition.xyz;


  // ==========================================================
  // NORMAL
  //
  // We keep the original normal for now.
  // This is intentional to avoid unstable shading.
  // ==========================================================

  vTerrainNormal =
    normalize(
      mat3(modelMatrix) *
      normalLocal
    );
}