/* ============================================================
   CHRYSASYNTH — LIMINAL TERRAIN
   Fragment Shader

   Dark mineral surface
   Graphite / silver / champagne
   Fresnel response
   Procedural roughness fields
   Orb opening energy
   ============================================================ */


/* ============================================================
   INPUTS
   ============================================================ */

varying vec3 vTerrainWorld;
varying vec3 vTerrainNormal;

uniform float uTime;
uniform float uOpening;


/* ============================================================
   UTILITIES
   ============================================================ */

float remap01(float value)
{
    return value * 0.5 + 0.5;
}


/* ============================================================
   PROCEDURAL MINERAL FIELD
   ============================================================ */

float mineralField(vec3 worldPos)
{
    float fieldA =
        sin(
            worldPos.x * 0.055 +
            worldPos.y * 0.032 +
            uTime * 0.055
        );

    float fieldB =
        sin(
            worldPos.x * -0.028 +
            worldPos.y * 0.047 -
            uTime * 0.035
        );

    float fieldC =
        sin(
            length(worldPos.xy * 0.045) -
            uTime * 0.040
        );

    float fieldD =
        sin(
            worldPos.x * 0.12 +
            worldPos.y * -0.075 +
            uTime * 0.025
        );

    float field =
          fieldA * 0.38
        + fieldB * 0.27
        + fieldC * 0.22
        + fieldD * 0.13;

    return remap01(field);
}


/* ============================================================
   TERRAIN COLOR
   ============================================================ */

vec3 getTerrainColor(
    vec3 worldPos,
    vec3 normal
)
{
    float mineral =
        mineralField(worldPos);


    /* --------------------------------------------------------
       BASE PALETTE
       -------------------------------------------------------- */

    vec3 graphite =
        vec3(
            0.035,
            0.038,
            0.043
        );

    vec3 mineralSilver =
        vec3(
            0.145,
            0.165,
            0.180
        );

    vec3 coldReflection =
        vec3(
            0.095,
            0.145,
            0.180
        );

    vec3 champagne =
        vec3(
            0.42,
            0.315,
            0.215
        );


    /* --------------------------------------------------------
       GRAPHITE → SILVER STRUCTURE
       -------------------------------------------------------- */

    float silverMask =
        smoothstep(
            0.25,
            0.82,
            mineral
        );

    vec3 color =
        mix(
            graphite,
            mineralSilver,
            silverMask * 0.48
        );


    /* --------------------------------------------------------
       CAMERA FRESNEL
       -------------------------------------------------------- */

    vec3 viewDirection =
        normalize(
            cameraPosition -
            worldPos
        );

    float NdotV =
        max(
            dot(
                normalize(normal),
                viewDirection
            ),
            0.0
        );

    float fresnel =
        pow(
            1.0 - NdotV,
            2.8
        );


    /* --------------------------------------------------------
       IRIDESCENT EDGE
       -------------------------------------------------------- */

    float iridescentMovement =
        remap01(
            sin(
                worldPos.x * 0.052 +
                worldPos.y * 0.036 +
                uTime * 0.11
            )
        );

    vec3 edgeColor =
        mix(
            coldReflection,
            champagne,
            iridescentMovement
        );

    color =
        mix(
            color,
            edgeColor,
            fresnel * 0.32
        );


    /* --------------------------------------------------------
       MINERAL CHAMPAGNE VEINS
       -------------------------------------------------------- */

    float warmMask =
        smoothstep(
            0.68,
            0.94,
            mineral
        );

    color =
        mix(
            color,
            champagne,
            warmMask * 0.14
        );


    /* --------------------------------------------------------
       ORB OPENING RESPONSE
       -------------------------------------------------------- */

    float distanceFromOrb =
        distance(
            worldPos.xy,
            vec2(
                0.0,
                20.0
            )
        );


    float orbInfluence =
        1.0 -
        smoothstep(
            2.0,
            34.0,
            distanceFromOrb
        );


    /*
       Slight irregularity prevents the response
       from looking like a perfect radial gradient.
    */

    orbInfluence *=
        mix(
            0.72,
            1.0,
            mineral
        );


    float openingEnergy =
        orbInfluence *
        uOpening;


    vec3 openingColor =
        vec3(
            0.72,
            0.48,
            0.27
        );


    color =
        mix(
            color,
            openingColor,
            openingEnergy * 0.38
        );


    /* --------------------------------------------------------
       HOT CORE NEAR ORB
       -------------------------------------------------------- */

    float hotCore =
        1.0 -
        smoothstep(
            0.0,
            11.0,
            distanceFromOrb
        );

    hotCore *=
        uOpening;


    color +=
        vec3(
            0.28,
            0.17,
            0.085
        )
        * hotCore
        * 0.42;


    return color;
}


/* ============================================================
   ROUGHNESS FIELD
   ============================================================ */

float getTerrainRoughness(
    vec3 worldPos
)
{
    float field =
        remap01(
            sin(
                worldPos.x * 0.085 +
                worldPos.y * 0.052 +
                uTime * 0.045
            )
        );


    float detail =
        remap01(
            sin(
                worldPos.x * -0.17 +
                worldPos.y * 0.13 -
                uTime * 0.025
            )
        );


    field =
        field * 0.72 +
        detail * 0.28;


    return mix(
        0.24,
        0.68,
        field
    );
}


/* ============================================================
   METALNESS FIELD
   ============================================================ */

float getTerrainMetalness(
    vec3 worldPos
)
{
    float field =
        mineralField(
            worldPos
        );


    return mix(
        0.10,
        0.48,
        smoothstep(
            0.30,
            0.88,
            field
        )
    );
}