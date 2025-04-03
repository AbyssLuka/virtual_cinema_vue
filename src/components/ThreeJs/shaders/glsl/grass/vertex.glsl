varying vec2 vUv;
varying vec2 vUvI;
varying vec3 vColor;
varying vec3 vNormal;
attribute vec2 uvI;
uniform float iTime;
uniform float iScalar;
uniform sampler2D grassMap;

varying vec3 vertexPosition;
uniform vec3 pointLightPosition;
varying vec3 vPointLightPosition;
varying vec3 vViewPosition;

mat4 zeroRotation(mat4 matrix) {
    // 创建一个新的矩阵
    mat4 result = matrix;

    // 保持缩放因子（对角线）
    result[0][0] = length(vec3(matrix[0][0], matrix[1][0], matrix[2][0]));
    result[1][1] = length(vec3(matrix[0][1], matrix[1][1], matrix[2][1]));
    result[2][2] = length(vec3(matrix[0][2], matrix[1][2], matrix[2][2]));

    // 归零旋转部分
    result[0][1] = result[0][2] = 0.0;
    result[1][0] = result[1][2] = 0.0;
    result[2][0] = result[2][1] = 0.0;

    // 平移部分保持不变（matrix[0][3], matrix[1][3], matrix[2][3]）
    // 齐次坐标保持为1.0
    // result[0][3] = 0.0;
    // result[1][3] = 0.0;
    // result[2][3] = 0.0;
    // result[3][3] = 1.0;

    return result;
}

uint murmurHash12(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uint h = 1190494759u;
    src *= M;
    src ^= src >> 24u;
    src *= M;
    h *= M;
    h ^= src.x;
    h *= M;
    h ^= src.y;
    h ^= h >> 13u;
    h *= M;
    h ^= h >> 15u;
    return h;
}

float hash12(vec2 src) {
    uint h = murmurHash12(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

float noise12(vec2 p) {
    vec2 i = floor(p);

    vec2 f = fract(p);
    vec2 u = smoothstep(vec2(0.0), vec2(1.0), f);

    float val = mix(mix(hash12(i + vec2(0.0, 0.0)), hash12(i + vec2(1.0, 0.0)), u.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
    return val * 2.0 - 1.0;
}

mat3 rotateAxis(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat3(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c);
}

void main() {
    vUv = uv;
    vUvI = uvI;

    vec3 transformed = position;

    float tipDistance = .5;
    float centerDistance = .1;

    vec3 grassdata = texture2D(grassMap, vUvI).rgb;

    // float diff = sin((iTime / 1.) + (uvI.x * uv.y)) * tipDistance * (uv.y);
    // float diff = sin((iScalar / 1.) + (uvI.x * uv.y)) * tipDistance * (uv.y);

    float windDir = noise12(uvI.xy * 2. + 0.5 * iTime);
    // float windDir = noise12(uvI.xy );
    // float windDir = 1.;

    // float diff = (uv.y) / iScalar;
    // float diff = windDir * uv.y / 2.6;
    float diff = windDir * uv.y / 2.6;

    vec3 windAxis = vec3(cos(windDir), 0.0, sin(windDir));
    // vec3 windAxis = vec3(1., 0.0, 1.0);

    mat3 grassMat = rotateAxis(windAxis, diff);

    // 提取旋转矩阵
    mat3 rotation = mat3(instanceMatrix);

    // 去掉缩放影响
    rotation[0] = normalize(rotation[0]);
    rotation[1] = normalize(rotation[1]);
    rotation[2] = normalize(rotation[2]);

    // 乘以原本的旋转系数 避免朝各自旋转方向移动
    grassMat *= rotation;

    vec4 mvPosition = vec4(grassMat * transformed, 1.0);

    mat4 result = zeroRotation(instanceMatrix);

    mvPosition = modelViewMatrix * result * mvPosition;

    gl_Position = projectionMatrix * mvPosition;

    // 法线
    vNormal = normalize(normalMatrix * normal);
    // 点光位置
    vPointLightPosition = (viewMatrix * vec4(pointLightPosition, 1.0)).xyz;
    // 顶点位置
    vViewPosition = -mvPosition.xyz;

}