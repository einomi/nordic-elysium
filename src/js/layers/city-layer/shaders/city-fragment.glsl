precision highp float;

varying vec2 v_uv;

uniform sampler2D u_texture;
uniform sampler2D u_river_mask;
uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_water_displacement;

//	Classic Perlin 2D Noise
//	by Stefan Gustavson
vec4 permute(vec4 x) {
  return mod((x * 34.0 + 1.0) * x, 289.0);
}

vec2 fade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm =
    1.79284291400159 -
    0.85373472095314 *
      vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float cnoise1d(float x) {
  return cnoise(vec2(x, 0.0));
}

void main() {
  vec2 uv = v_uv;

  float scaleAspect = u_resolution.x < u_resolution.y ? 1.5 : 1.0;

  vec4 river_mask = texture2D(u_river_mask, uv);
  float river_mask_value = river_mask.r;

  vec4 color = texture2D(u_texture, uv);

  if (river_mask_value < 0.2) {
    // Add some noise to the fragment coordinates
    //    vec2 noise = vec2(0.1, 0.1) * vec2(sin(u_time), cos(u_time)) * 0.1;

    // use cnoise instead of noise
    vec2 noise =
      vec2(0.1, 0.1) *
      vec2(cnoise(uv * 0.1 + u_time * 0.1), cnoise(uv * 0.1 + u_time * 0.1)) *
      10.01;

    vec2 coord = uv;

    float waveFactor = 0.01;

    // Create a wave pattern using sine waves
    float wave1 = cnoise1d(coord.x * 50.0 + u_time * 1.0) * waveFactor;
    float wave2 = cnoise1d(coord.y * 30.0 + u_time * 0.5) * waveFactor;
    float wave3 =
      cnoise1d((coord.x + coord.y * 10.0) * 1.0 + u_time * 0.3) * waveFactor;
    float waves = wave1 + wave2 + wave3;

    uv.x += waves * 0.5 + texture2D(u_water_displacement, uv).r * 0.05;
    uv.y += waves * 0.1 + texture2D(u_water_displacement, uv).r * 0.01;

    // Get the color from the texture
    color = texture2D(u_texture, uv);

  }

  gl_FragColor = vec4(color);
}
