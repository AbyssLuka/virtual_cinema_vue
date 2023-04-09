export class CompositionShader{
    static  fragment = `
    uniform sampler2D baseTexture;
    uniform sampler2D bloomTexture;
    uniform sampler2D overlayTexture;
    varying vec2 vUv;
    void main(){
        // Baselayer + bloomlayer + 0.2 * (overlay);
        gl_FragColor = (texture2D(baseTexture,vUv)) + vec4(1.0)*texture2D(bloomTexture,vUv) + vec4(0.25) * texture2D(overlayTexture,vUv);
    }
    `;

    static  vertex = `
    varying vec2 vUv;
    void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
    `;
}