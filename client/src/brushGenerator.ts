import Pixi from 'pixi.js';

const fragment = `
uniform float size;
uniform vec3 color;
uniform float smoothing;

void main(){
	vec2 uv = vec2(gl_FragCoord.xy) / size;
	float dst = distance(uv, vec2(0.5, 0.5)) * 2.;
	float alpha = max(0., 1. - dst);
	alpha = pow(alpha, smoothing);
	gl_FragColor = vec4(alpha);
`;


export class BrushGenerator {
  filter: Pixi.Filter;
  renderer: Pixi.Renderer;

  constructor(renderer: Pixi.Renderer) {
    this.renderer = renderer;

    // WARN: API changed in pixi 8, check if this works
    // If no lines/drawings appear, this is probably the fault
    this.filter = new Pixi.Filter({
      glProgram: Pixi.GlProgram.from({
        fragment: fragment,
        vertex: ""
      }),
      resources: {
        color: [0, 0, 0],
        erase: 0,
        size: 16,
        smoothing: 0.01
      }
    });
  }

  get(size: number, color: number[], smoothing: number): Pixi.RenderTexture {
    this.filter.resources.uniforms.size = size;
    this.filter.resources.uniforms.color = color;
    this.filter.resources.uniforms.smoothing = smoothing;

    const texture = Pixi.RenderTexture.create({
      height: size,
      width: size
    });

    // Also deprecated. Probably not needed, no idea why I had this in here
    // texture.baseTexture.premultipliedAlpha = true;

    const sprite = new Pixi.Sprite();
    sprite.width = size;
    sprite.height = size;

    sprite.filters = [this.filter];

    // Also not sure about this one
    this.renderer.render({
      container: sprite,
      target: texture,
    });

    return texture;
  }

  hexToArray(color: number): number[] {
    const r = (color >> 16) & 0xFF;
    const g = (color >> 8) & 0xFF;
    const b = color & 0xFF;

    return [r / 255, g / 255, b / 255];
  }
}