uniform sampler2D baseTexture;
uniform sampler2D bloomTexture;
uniform sampler2D overlayTexture;

varying vec2 vUv;

void main() {
    gl_FragColor = ( texture2D( baseTexture, vUv ) + vec4( 1.0 ) * texture2D( bloomTexture, vUv ) + vec4(0.25) * texture2D(overlayTexture, vUv) );
}