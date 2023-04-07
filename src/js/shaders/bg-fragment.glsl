precision highp float;
#define PI (3.1415926535897932384626433832795)

varying vec2 v_uv;
uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_mask;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
  );
}

//	Classic Perlin 2D Noise
//	by Stefan Gustavson
//
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

void main() {

  // display texture as background cover
  vec2 uv = v_uv;
  vec2 mid = vec2(0.5, 0.5);
  vec4 tex = texture2D(u_texture, uv);

  // get mask
  vec4 mask = texture2D(u_mask, uv);

  // apply ray animation to the masked area of tex
  if (mask.r == 0.0) {
    //     float y = uv.y - sin(u_time * PI  )  * 0.01;

    // get average color
    vec4 color = vec4(0.0);
    for (float i = 0.0; i < 10.0; i++) {
      color += texture2D(u_texture, vec2(uv.x, uv.y + i * 0.01));
    }
    color /= 10.0;


    //    float y = uv.y - sin(u_time * PI  )  * 0.01;

    // get x as radial distance from center
    //    float x = length(uv - mid) * 2.0;


    // get ray of light
    float ray = cnoise(vec2(uv.x * 0.01, uv.y * 1.0 - u_time * 0.1)) * 0.5 + 0.5;

    float x =  uv.x * ray;

    // get new color
    color = mix(color, vec4(1.0), ray);


    // get new uv
    vec2 newUv = vec2(x, uv.y * 1.1 + 0.02);


    // get new tex
    tex = texture2D(u_texture, newUv);
  } else {
    // move right left
    float x = uv.x + sin(u_time * PI * 0.1) * 0.03;
    tex = texture2D(u_texture, vec2(x, uv.y));
  }




  gl_FragColor = vec4(tex);
}
