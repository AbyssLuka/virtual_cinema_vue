varying vec2 vUv;
varying vec2 vUvI;
varying vec3 vPos;
uniform float iTime;
uniform sampler2D grassMap;
uniform sampler2D colorMap;
varying vec3 vColor;
uniform float iScalar;

varying vec3 vNormal;
varying vec3 vertexPosition;
varying vec3 vPointLightPosition;
uniform vec3 pointLightPosition;
uniform float pointLightDistance;
uniform float pointLightDecay;
varying vec3 vViewPosition;

float pow2(const in float x) {
    return x * x;
}
vec3 pow2(const in vec3 x) {
    return x * x;
}
float pow4(const in float x) {
    float x2 = x * x;
    return x2 * x2;
}

    // 距离衰减
float getDistanceAttenuation(const in float lightDistance, const in float cutoffDistance, const in float decayExponent) {

    float distanceFalloff = 1.0 / max(pow(lightDistance, decayExponent), 0.01);

    if(cutoffDistance > 0.0) {

        distanceFalloff *= pow2(clamp(1.0 - pow4(lightDistance / cutoffDistance), 0., 1.));

    }

    return distanceFalloff;

}

    // common.glsl.js
vec3 F_Schlick(const in vec3 f0, const in float f90, const in float dotVH) {

        // Original approximation by Christophe Schlick '94
        // float fresnel = pow( 1.0 - dotVH, 5.0 );

        // Optimized variant (presented by Epic at SIGGRAPH '13)
        // https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
    float fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

    return f0 * (1.0 - fresnel) + (f90 * fresnel);

}

float F_Schlick(const in float f0, const in float f90, const in float dotVH) {

        // Original approximation by Christophe Schlick '94
        // float fresnel = pow( 1.0 - dotVH, 5.0 );

        // Optimized variant (presented by Epic at SIGGRAPH '13)
        // https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
    float fresnel = exp2((-5.55473 * dotVH - 6.98316) * dotVH);

    return f0 * (1.0 - fresnel) + (f90 * fresnel);

}

    // bsdfs.glsl.js

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

        // geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
    return 0.25;

}

float D_BlinnPhong(const in float shininess, const in float dotNH) {

    return RECIPROCAL_PI * (shininess * 0.5 + 1.0) * pow(dotNH, shininess);

}

vec3 BRDF_BlinnPhong(const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess) {

    vec3 halfDir = normalize(lightDir + viewDir);

    float dotNH = clamp(dot(normal, halfDir), 0., 1.);
    float dotVH = clamp(dot(viewDir, halfDir), 0., 1.);

    vec3 F = F_Schlick(specularColor, 1.0, dotVH);

    float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

    float D = D_BlinnPhong(shininess, dotNH);

    return F * (G * D);

}

void main() {
    vec3 grassdata = texture2D(grassMap, vUvI * 2.).rgb;
    vec3 colorData = texture2D(colorMap, vUvI).rgb;

    vec3 color = vColor;
    // color = vec3(1,0,1);

    color = mix(colorData, grassdata, min(1., vUv.y * 3.));
    // color = mix(vec3(0), grassdata, min(1.2, vUv.y * 3.));
    // color = grassdata;

    gl_FragColor = vec4(color, 1.0);

    // #ifdef FLAT_SHADED

    // vec3 fdx = dFdx(vViewPosition);
    // vec3 fdy = dFdy(vViewPosition);
    // vec3 normal = normalize(cross(fdx, fdy));

    // #else

    vec3 normal = vNormal;
    normal = normalize(vNormal);

    // #endif

    vec3 geometryPosition = -vViewPosition;
    vec3 geometryNormal = normal;
    vec3 geometryViewDir = normalize(vViewPosition);

    vec3 lVector = vPointLightPosition - geometryPosition;

    vec3 lightDirection = normalize(lVector);

    vec3 phongColor = BRDF_BlinnPhong(lightDirection, geometryViewDir, geometryNormal, vec3(0.18, 0.2, 0.11), grassdata.r * 60.);

    // gl_FragColor = vec4(vec3(phongColor), 1.0);
    gl_FragColor.rgb += vec3(phongColor);

}