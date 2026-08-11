uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;


// ============================================================
// HASH
// ============================================================

float hash(vec2 p){

  return fract(
    sin(
      dot(
        p,
        vec2(
          127.1,
          311.7
        )
      )
    ) *
    43758.5453123
  );
}


// ============================================================
// VALUE NOISE
// ============================================================

float noise(vec2 p){

  vec2 i =
    floor(p);

  vec2 f =
    fract(p);

  f =
    f *
    f *
    (
      3.0 -
      2.0 * f
    );


  float a =
    hash(i);

  float b =
    hash(
      i +
      vec2(1.0,0.0)
    );

  float c =
    hash(
      i +
      vec2(0.0,1.0)
    );

  float d =
    hash(
      i +
      vec2(1.0,1.0)
    );


  return mix(
    mix(
      a,
      b,
      f.x
    ),

    mix(
      c,
      d,
      f.x
    ),

    f.y
  );
}


// ============================================================
// FRACTAL NOISE
// ============================================================

float fbm(vec2 p){

  float value =
    0.0;

  float amplitude =
    0.5;


  for(
    int i = 0;
    i < 4;
    i++
  ){

    value +=
      noise(p) *
      amplitude;

    p =
      p * 2.03 +
      vec2(
        17.1,
        9.2
      );

    amplitude *=
      0.5;
  }


  return value;
}


// ============================================================
// MAIN
// ============================================================

void main(){

  vec2 uv =
    vUv;


  vec2 centered =
    uv -
    0.5;


  // ==========================================================
  // VERY SLOW DISTORTION
  // ==========================================================

  float distortionA =
    sin(
      uv.y * 5.0 +
      uTime * 0.10
    );

  float distortionB =
    cos(
      uv.x * 4.0 -
      uTime * 0.075
    );


  uv +=
    vec2(
      distortionA,
      distortionB
    ) *
    0.006;


  // ==========================================================
  // LARGE ORGANIC FIELD
  // ==========================================================

  float fieldA =
    fbm(
      uv * 2.0 +
      vec2(
        uTime * 0.018,
        -uTime * 0.012
      )
    );


  float fieldB =
    fbm(
      uv * 3.2 +
      vec2(
        -uTime * 0.010,
        uTime * 0.015
      )
    );


  float field =
    fieldA * 0.68 +
    fieldB * 0.32;


  // ==========================================================
  // BASE GRAPHITE
  // ==========================================================

  vec3 graphite =
    vec3(
      0.025,
      0.030,
      0.038
    );


  vec3 deepGraphite =
    vec3(
      0.010,
      0.013,
      0.018
    );


  vec3 color =
    mix(
      deepGraphite,
      graphite,
      field
    );


  // ==========================================================
  // SILVER LIGHT FIELD
  // ==========================================================

  vec3 silver =
    vec3(
      0.16,
      0.19,
      0.22
    );


  float silverField =
    smoothstep(
      0.42,
      0.82,
      field
    );


  color +=
    silver *
    silverField *
    0.16;


  // ==========================================================
  // LARGE CHAMPAGNE GLOW
  // ==========================================================

  vec2 warmPosition =
    vec2(
      0.48,
      0.67
    );


  float warmDistance =
    distance(
      uv,
      warmPosition
    );


  float warmGlow =
    1.0 -
    smoothstep(
      0.05,
      0.68,
      warmDistance
    );


  warmGlow =
    pow(
      warmGlow,
      2.2
    );


  vec3 champagne =
    vec3(
      0.52,
      0.38,
      0.25
    );


  color +=
    champagne *
    warmGlow *
    0.11;


  // ==========================================================
  // COOL STEEL LIGHT
  // ==========================================================

  vec2 coolPosition =
    vec2(
      0.82 +
      sin(uTime * 0.035) * 0.04,

      0.20 +
      cos(uTime * 0.027) * 0.03
    );


  float coolDistance =
    distance(
      uv,
      coolPosition
    );


  float coolGlow =
    1.0 -
    smoothstep(
      0.0,
      0.72,
      coolDistance
    );


  coolGlow =
    pow(
      coolGlow,
      2.4
    );


  vec3 steel =
    vec3(
      0.18,
      0.29,
      0.36
    );


  color +=
    steel *
    coolGlow *
    0.10;


  // ==========================================================
  // VERY SUBTLE IRIDESCENT BAND
  // ==========================================================

  float band =
    sin(
      uv.x * 3.2 +
      uv.y * 2.4 +
      field * 2.0 +
      uTime * 0.055
    );


  band =
    band * 0.5 +
    0.5;


  vec3 warmIridescence =
    vec3(
      0.26,
      0.16,
      0.10
    );


  vec3 coolIridescence =
    vec3(
      0.08,
      0.16,
      0.22
    );


  vec3 iridescence =
    mix(
      coolIridescence,
      warmIridescence,
      band
    );


  color +=
    iridescence *
    0.045;


  // ==========================================================
  // CENTRAL BREATH
  // ==========================================================

  float breath =
    0.5 +
    0.5 *
    sin(
      uTime * 0.32
    );


  float centerGlow =
    1.0 -
    smoothstep(
      0.05,
      0.72,
      length(centered)
    );


  color +=
    vec3(
      0.11,
      0.13,
      0.15
    ) *
    centerGlow *
    (
      0.025 +
      breath * 0.018
    );


  // ==========================================================
  // VIGNETTE
  // ==========================================================

  float vignette =
    smoothstep(
      0.82,
      0.24,
      dot(
        centered,
        centered
      )
    );


  color *=
    mix(
      0.68,
      1.0,
      vignette
    );


  // ==========================================================
  // FINAL INTENSITY
  //
  // Allows main.js to fade the shader in during the transition.
  // ==========================================================

  color *=
    uIntensity;


  gl_FragColor =
    vec4(
      color,
      1.0
    );
}