import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RectAreaLightUniformsLib }
from 'three/addons/lights/RectAreaLightUniformsLib.js';

import { RoomEnvironment }
from 'three/addons/environments/RoomEnvironment.js';


// ============================================================
// DOM
// ============================================================

const canvas =
  document.querySelector('#webgl');

const experience =
  document.querySelector('#experience');

const heroCopy =
  document.querySelector('#heroCopy');

const scrollHint =
  document.querySelector('#scrollHint');

const finalUi =
  document.querySelector('#finalUi');

const finalHeading =
  document.querySelector('.final-heading');

const cards =
  [...document.querySelectorAll('.portal-card')];

const veil =
  document.querySelector('#veil');


// ============================================================
// SCENE
// ============================================================

const scene =
  new THREE.Scene();

const bgStart =
  new THREE.Color(0x05060a);

const bgEnd =
  new THREE.Color(0x11151b);

const fogStart =
  new THREE.Color(0x0b0d14);

const fogEnd =
  new THREE.Color(0x171b20);

scene.background =
  bgStart.clone();

scene.fog =
  new THREE.FogExp2(
    fogStart,
    0.00072
  );


// ============================================================
// CAMERA
// ============================================================

const fallbackCamera =
  new THREE.PerspectiveCamera(
    40,
    innerWidth / innerHeight,
    0.1,
    500
  );

fallbackCamera.position.set(
  0,
  -12,
  3
);

fallbackCamera.lookAt(
  0,
  18,
  4
);

let activeCamera =
  fallbackCamera;


// ============================================================
// RENDERER
// ============================================================

const renderer =
  new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.setPixelRatio(
  Math.min(
    devicePixelRatio,
    2
  )
);

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

renderer.toneMapping =
  THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
  1.16;


// ============================================================
// ENVIRONMENT
// ============================================================

const pmrem =
  new THREE.PMREMGenerator(renderer);

const roomEnvironment =
  new RoomEnvironment();

const envTexture =
  pmrem
    .fromScene(
      roomEnvironment,
      0.04
    )
    .texture;

scene.environment =
  envTexture;

pmrem.dispose();


// ============================================================
// AREA LIGHT SUPPORT
// ============================================================

RectAreaLightUniformsLib.init();


// ============================================================
// LIGHTS
// ============================================================

const ORB_TARGET =
  new THREE.Vector3(
    0,
    20,
    4.2
  );


// ------------------------------------------------------------
// COLD KEY
// ------------------------------------------------------------

const keyLight =
  new THREE.RectAreaLight(
    0xd8e1ea,
    8.5,
    7.5,
    7.5
  );

keyLight.position.set(
  7.5,
  7,
  11.5
);

keyLight.lookAt(
  ORB_TARGET
);

scene.add(
  keyLight
);


// ------------------------------------------------------------
// COOL RIM
// ------------------------------------------------------------

const rimLight =
  new THREE.RectAreaLight(
    0x8795a7,
    5.0,
    6,
    6
  );

rimLight.position.set(
  -8.5,
  17,
  7
);

rimLight.lookAt(
  ORB_TARGET
);

scene.add(
  rimLight
);


// ------------------------------------------------------------
// BOTTOM REFLECTION
// ------------------------------------------------------------

const bottomLight =
  new THREE.RectAreaLight(
    0x93a7b7,
    4.4,
    7,
    7
  );

bottomLight.position.set(
  2,
  20,
  -4
);

bottomLight.lookAt(
  ORB_TARGET
);

scene.add(
  bottomLight
);


// ------------------------------------------------------------
// BACK LIGHT
// ------------------------------------------------------------

const backLight =
  new THREE.RectAreaLight(
    0x7c8793,
    3.8,
    9,
    9
  );

backLight.position.set(
  0,
  37,
  10
);

backLight.lookAt(
  ORB_TARGET
);

scene.add(
  backLight
);


// ------------------------------------------------------------
// WARM ACCENT
//
// Rare. This is the precious color.
// ------------------------------------------------------------

const warmLight =
  new THREE.RectAreaLight(
    0xd4bfa6,
    0.0,
    11,
    4
  );

warmLight.position.set(
  8,
  18,
  5
);

warmLight.lookAt(
  ORB_TARGET
);

scene.add(
  warmLight
);


// ------------------------------------------------------------
// HORIZON WARM POINT
// ------------------------------------------------------------

const warmHorizon =
  new THREE.PointLight(
    0xd1b090,
    0,
    48,
    1.7
  );

warmHorizon.position.set(
  0,
  30,
  5
);

scene.add(
  warmHorizon
);
// ------------------------------------------------------------
// ORB INNER LIGHT
// Light physically coming from the opening
// ------------------------------------------------------------

const openingGlow =
  new THREE.PointLight(
    0xe2cbb0,
    0,
    30,
    1.8
  );

openingGlow.position.copy(
  ORB_TARGET
);

scene.add(
  openingGlow
);

// ------------------------------------------------------------
// LANDSCAPE FILL
// ------------------------------------------------------------

const landscapeLight =
  new THREE.RectAreaLight(
    0x738796,
    3.8,
    18,
    4
  );

landscapeLight.position.set(
  -10,
  8,
  3
);

landscapeLight.lookAt(
  new THREE.Vector3(
    0,
    28,
    0
  )
);

scene.add(
  landscapeLight
);


// ------------------------------------------------------------
// AMBIENT
// ------------------------------------------------------------

const hemisphere =
  new THREE.HemisphereLight(
    0x667480,
    0x111318,
    0.46
  );

scene.add(
  hemisphere
);

const ambient =
  new THREE.AmbientLight(
    0x9da9b4,
    0.075
  );

scene.add(
  ambient
);


// ============================================================
// POST
// ============================================================

const renderPass =
  new RenderPass(
    scene,
    activeCamera
  );

const composer =
  new EffectComposer(renderer);

composer.addPass(
  renderPass
);


const bloom =
  new UnrealBloomPass(
    new THREE.Vector2(
      innerWidth,
      innerHeight
    ),
    0.12,
    0.22,
    0.30
  );

composer.addPass(
  bloom
);


// ============================================================
// GRAIN + VIGNETTE
// ============================================================

const FilmicShader = {

  uniforms: {
    tDiffuse: {
      value: null
    },

    uTime: {
      value: 0
    },

    uGrain: {
      value: 0.018
    },

    uVignette: {
      value: 0.34
    }
  },

  vertexShader: `
    varying vec2 vUv;

    void main(){
      vUv = uv;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position,1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrain;
    uniform float uVignette;

    varying vec2 vUv;


    float hash(vec2 p){

      return fract(
        sin(
          dot(
            p,
            vec2(127.1,311.7)
          )
        ) *
        43758.5453123
      );
    }


    void main(){

      vec4 color =
        texture2D(
          tDiffuse,
          vUv
        );


      float grain =
        hash(
          vUv *
          vec2(1920.0,1080.0) +
          uTime * 37.0
        ) - 0.5;


      color.rgb +=
        grain *
        uGrain;


      vec2 centered =
        vUv - 0.5;


      float vignette =
        smoothstep(
          0.78,
          0.25,
          dot(
            centered,
            centered
          )
        );


      color.rgb *=
        mix(
          1.0 - uVignette,
          1.0,
          vignette
        );


      gl_FragColor =
        color;
    }
  `
};


const filmicPass =
  new ShaderPass(
    FilmicShader
  );

composer.addPass(
  filmicPass
);


// ============================================================
// STATE
// ============================================================

let model = null;
let mixer = null;

let masterDuration = 0;

const actions = [];

let targetProgress = 0;
let progress = 0;

const clock =
  new THREE.Clock();


// ============================================================
// HELPERS
// ============================================================

function clamp01(v){

  return THREE.MathUtils.clamp(
    v,
    0,
    1
  );

}


function range(
  v,
  a,
  b
){

  return clamp01(
    (v-a) /
    (b-a)
  );

}


function smooth(t){

  t =
    clamp01(t);

  return (
    t*t*
    (3-2*t)
  );

}


function easeOutBack(t){

  const c1 = 1.70158;
  const c3 = c1 + 1;

  return (
    1 +
    c3 *
    Math.pow(
      t - 1,
      3
    ) +
    c1 *
    Math.pow(
      t - 1,
      2
    )
  );

}


// ============================================================
// GLB
// ============================================================

const loader =
  new GLTFLoader();


loader.load(

  './assets/sphere3state.glb',

  (gltf)=>{

    model =
      gltf.scene;

    scene.add(
      model
    );


    // ========================================================
    // CAMERA
    // ========================================================

    const blenderCamera =
      model.getObjectByName(
        'CINEMATIC_CAMERA'
      );


    if(
      blenderCamera &&
      blenderCamera.isCamera
    ){

      activeCamera =
        blenderCamera;


      activeCamera.aspect =
        innerWidth /
        innerHeight;


      activeCamera
        .updateProjectionMatrix();


      renderPass.camera =
        activeCamera;
    }


    // ========================================================
    // REMOVE MONOLITH
    // ========================================================

    const monolith =
      model.getObjectByName(
        'DISTANT_MONOLITH'
      );


    if(monolith){

      monolith.visible =
        false;
    }


    // ========================================================
    // MATERIALS
    // ========================================================

    model.traverse(
      (obj)=>{

        if(
          !obj.isMesh ||
          !obj.material
        ){
          return;
        }


        const materials =
          Array.isArray(
            obj.material
          )
            ? obj.material
            : [obj.material];


        materials.forEach(
          (mat)=>{

            if(!mat) return;


            // ----------------------------------------------
            // CHROME
            // ----------------------------------------------

            if(
              mat.name.includes(
                'MAT_ORB_DARK_CHROME'
              )
            ){

              mat.color.set(
                0x20242a
              );

              mat.metalness =
                1.0;

              mat.roughness =
                0.11;

              mat.envMapIntensity =
                1.85;
            }


            // ----------------------------------------------
            // INNER GRAPHITE
            // ----------------------------------------------

            if(
              mat.name.includes(
                'MAT_ORB_INNER_GRAPHITE'
              )
            ){

              mat.color.set(
                0x161a20
              );

              mat.metalness =
                0.82;

              mat.roughness =
                0.20;

              mat.envMapIntensity =
                1.35;
            }


            // ----------------------------------------------
            // WATER
            // ----------------------------------------------

            if(
              mat.name.includes(
                'MAT_BLACK_LIQUID'
              )
            ){

              mat.color.set(
                0x090b0f
              );

              mat.metalness =
                0.94;

              mat.roughness =
                0.08;

              mat.envMapIntensity =
                1.45;
            }


            // ----------------------------------------------
// TERRAIN — WARM GRAPHITE
// ----------------------------------------------

if(
  mat.name.includes(
    'MAT_LIMINAL_TERRAIN'
  )
){

  mat.color.set(
    0x171514
  );

  mat.metalness =
    0.06;

  mat.roughness =
    0.56;

  mat.envMapIntensity =
    0.52;
}

            mat.needsUpdate =
              true;
          }
        );
      }
    );


    // ========================================================
    // EXPORTED OPENING LIGHT
    // ========================================================

    model.traverse(
      (obj)=>{

        if(
          obj.isLight &&
          obj.name.includes(
            'OPENING_LIGHT'
          )
        ){

          obj.intensity *=
            0.60;
        }
      }
    );


    // ========================================================
    // ANIMATION
    // ========================================================

    if(
      gltf.animations &&
      gltf.animations.length > 0
    ){

      mixer =
        new THREE.AnimationMixer(
          model
        );


      gltf.animations.forEach(
        (clip)=>{

          const action =
            mixer.clipAction(
              clip
            );


          action.enabled =
            true;


          action.setEffectiveWeight(
            1
          );


          action.setEffectiveTimeScale(
            0
          );


          action.play();


          actions.push({
            action,
            clip
          });


          masterDuration =
            Math.max(
              masterDuration,
              clip.duration
            );
        }
      );


      evaluateAnimation(
        0
      );
    }
  },

  undefined,

  (error)=>{

    console.error(
      'sphere3state.glb error:',
      error
    );
  }
);


// ============================================================
// ABSOLUTE SCRUB
// ============================================================

function evaluateAnimation(
  normalizedProgress
){

  if(
    !mixer ||
    !model ||
    masterDuration <= 0
  ){
    return;
  }


  const p =
    clamp01(
      normalizedProgress
    );


  const globalTime =
    Math.min(
      p *
      masterDuration,
      masterDuration -
      0.0001
    );


  actions.forEach(
    ({action,clip})=>{

      action.time =
        Math.min(
          globalTime,
          Math.max(
            clip.duration -
            0.0001,
            0
          )
        );


      action.enabled =
        true;
    }
  );


  mixer.update(0);

  model.updateMatrixWorld(
    true
  );
}


// ============================================================
// SCROLL
// ============================================================

function readScroll(){

  const rect =
    experience
      .getBoundingClientRect();


  const distance =
    experience.offsetHeight -
    innerHeight;


  targetProgress =
    distance > 0
      ? clamp01(
          -rect.top /
          distance
        )
      : 0;
}


window.addEventListener(
  'scroll',
  readScroll,
  {
    passive:true
  }
);


readScroll();


// ============================================================
// UI
// ============================================================

function updateUI(t){


  // ========================================================
  // HERO
  // ========================================================

  const heroFade =
    smooth(
      range(
        t,
        0.03,
        0.17
      )
    );


  if(heroCopy){

    heroCopy.style.opacity =
      1 -
      heroFade;


    heroCopy.style.transform =
      `translate(
        -50%,
        calc(
          -50% -
          ${heroFade*18}px
        )
      )`;
  }


  if(scrollHint){

    scrollHint.style.opacity =
      1 -
      smooth(
        range(
          t,
          0.02,
          0.14
        )
      );
  }


  // ========================================================
  // OPENING PULSE
  //
  // Warm accent appears ONLY here.
  // ========================================================

  const pulseIn =
    smooth(
      range(
        t,
        0.48,
        0.57
      )
    );


  const pulseOut =
    1 -
    smooth(
      range(
        t,
        0.60,
        0.69
      )
    );


  const openingPulse =
    pulseIn *
    pulseOut;
openingGlow.intensity =
  28 *
  openingPulse;

  warmLight.intensity =
    10.0 *
    openingPulse;


  warmHorizon.intensity =
    23 *
    openingPulse;


  bloom.strength =
    THREE.MathUtils.lerp(
      0.08,
      0.55,
      openingPulse
    );


  bloom.threshold =
    THREE.MathUtils.lerp(
      0.34,
      0.08,
      openingPulse
    );


  bloom.radius =
    THREE.MathUtils.lerp(
      0.18,
      0.38,
      openingPulse
    );


  renderer.toneMappingExposure =
    THREE.MathUtils.lerp(
      1.14,
      1.30,
      openingPulse
    );


  // ========================================================
  // FINAL TRANSITION
  // ========================================================

 const abstract =
  smooth(
    range(
      t,
      0.54,
      0.76
    )
  );


  scene.background
    .copy(bgStart)
    .lerp(
      bgEnd,
      abstract
    );


  scene.fog.color
    .copy(fogStart)
    .lerp(
      fogEnd,
      abstract
    );


if(veil){

  veil.style.opacity =
    abstract * 0.96;
}


  // ========================================================
  // EXIT 3D
  // ========================================================

  const sceneExit =
    smooth(
      range(
        t,
        0.60,
        0.80
      )
    );


  canvas.style.opacity =
    1 -
    sceneExit;


  // ========================================================
  // CARDS
  // ========================================================

  const reveal =
    smooth(
      range(
        t,
        0.60,
        0.79
      )
    );


  if(finalUi){

    finalUi.style.opacity =
      reveal;


    finalUi.style.pointerEvents =
      reveal > 0.78
        ? 'auto'
        : 'none';
  }


  if(finalHeading){

    const headingReveal =
      easeOutBack(
        smooth(
          range(
            reveal,
            0.02,
            0.42
          )
        )
      );


    finalHeading.style.opacity =
      clamp01(
        headingReveal
      );


    finalHeading.style.transform =
      `translateY(
        ${
          (1-headingReveal)*
          14
        }px
      )`;
  }


  cards.forEach(
    (card,index)=>{

      const raw =
        smooth(
          range(
            reveal,
            0.08 +
            index*0.055,
            0.55 +
            index*0.05
          )
        );


      const eased =
        easeOutBack(raw);


      card.style.opacity =
        clamp01(raw);


      card.style.transform =
        `translateY(
          ${
            (1-eased)*
            22
          }px
        )
        scale(
          ${
            0.975 +
            eased*0.025
          }
        )`;
    }
  );
}


// ============================================================
// LOOP
// ============================================================

function animate(){

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      clock.getDelta(),
      0.05
    );


  progress =
    THREE.MathUtils.damp(
      progress,
      targetProgress,
      6.5,
      delta
    );


  evaluateAnimation(
    progress
  );


  updateUI(
    progress
  );


  filmicPass.uniforms.uTime.value +=
    delta;


  composer.render();
}


animate();


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
  'resize',
  ()=>{

    if(
      activeCamera &&
      activeCamera.isPerspectiveCamera
    ){

      activeCamera.aspect =
        innerWidth /
        innerHeight;


      activeCamera
        .updateProjectionMatrix();
    }


    fallbackCamera.aspect =
      innerWidth /
      innerHeight;


    fallbackCamera
      .updateProjectionMatrix();


    renderer.setSize(
      innerWidth,
      innerHeight
    );


    renderer.setPixelRatio(
      Math.min(
        devicePixelRatio,
        2
      )
    );


    composer.setSize(
      innerWidth,
      innerHeight
    );
  }
);