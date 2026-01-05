import{r as d,j as L}from"./StaggeredMenu-DvFna6NG.js";import{R as M,T as z,P as F,M as T}from"./Triangle-GlFcswsc.js";const y={black:"#000000",white:"#ffffff",red:"#ff0000",green:"#00ff00",blue:"#0000ff",fuchsia:"#ff00ff",cyan:"#00ffff",yellow:"#ffff00",orange:"#ff8000"};function x(e){e.length===4&&(e=e[0]+e[1]+e[1]+e[2]+e[2]+e[3]+e[3]);const t=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);return t||console.warn(`Unable to convert hex string ${e} to rgb values`),[parseInt(t[1],16)/255,parseInt(t[2],16)/255,parseInt(t[3],16)/255]}function D(e){return e=parseInt(e),[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]}function P(e){return e===void 0?[0,0,0]:arguments.length===3?arguments:isNaN(e)?e[0]==="#"?x(e):y[e.toLowerCase()]?x(y[e.toLowerCase()]):(console.warn("Color format not recognised"),[0,0,0]):D(e)}class w extends Array{constructor(t){return Array.isArray(t)?super(...t):super(...P(...arguments))}get r(){return this[0]}get g(){return this[1]}get b(){return this[2]}set r(t){this[0]=t}set g(t){this[1]=t}set b(t){this[2]=t}set(t){return Array.isArray(t)?this.copy(t):this.copy(P(...arguments))}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this}}const I=`
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`,N=`
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
  vec2 Pi = floor(P);
  vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
  vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
  Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
  Pt += vec2(26.0, 161.0).xyxy;
  Pt *= Pt;
  Pt = Pt.xzxz * Pt.yyww;
  vec4 hash_x = fract(Pt * (1.0 / 951.135664));
  vec4 hash_y = fract(Pt * (1.0 / 642.949883));
  vec4 grad_x = hash_x - 0.49999;
  vec4 grad_y = hash_y - 0.49999;
  vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
    * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
  grad_results *= 1.4142135623730950;
  vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
             * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
  vec4 blend2 = vec4(blend, vec2(1.0 - blend));
  return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
  return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(
  vec2 st,
  float width,
  float perc,
  float offset,
  vec2 mouse,
  float time,
  float amplitude,
  float distance
) {
  float split_offset = (perc * 0.4);
  float split_point = 0.1 + split_offset;

  float amplitude_normal = smoothstep(split_point, 0.7, st.x);
  float amplitude_strength = 0.5;
  float finalAmplitude = amplitude_normal * amplitude_strength
                       * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

  float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
  float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

  float xnoise = mix(
    Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
    Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
    st.x * 0.3
  );

  float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

  float line_start = smoothstep(
    y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    y,
    st.y
  );

  float line_end = smoothstep(
    y,
    y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
    st.y
  );

  return clamp(
    (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
    0.0,
    1.0
  );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;

  float line_strength = 1.0;
  for (int i = 0; i < u_line_count; i++) {
    float p = float(i) / float(u_line_count);
    line_strength *= (1.0 - lineFn(
      uv,
      u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
      p,
      (PI * 1.0) * p,
      uMouse,
      iTime,
      uAmplitude,
      uDistance
    ));
  }

  float colorVal = 1.0 - line_strength;
  fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}
`,U=({color:e=[1,1,1],amplitude:t=1,distance:_=0,enableMouseInteraction:l=!1,...b})=>{const c=d.useRef(null),u=d.useRef();return d.useEffect(()=>{if(!c.current)return;const o=c.current,m=new M({alpha:!0}),n=m.gl;n.clearColor(0,0,0,0),n.enable(n.BLEND),n.blendFunc(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA),n.canvas.style.width="100%",n.canvas.style.height="100%",n.canvas.style.display="block",o.appendChild(n.canvas);const C=new z(n),r=new F(n,{vertex:I,fragment:N,uniforms:{iTime:{value:0},iResolution:{value:new w(n.canvas.width,n.canvas.height,n.canvas.width/n.canvas.height)},uColor:{value:new w(...e)},uAmplitude:{value:t},uDistance:{value:_},uMouse:{value:new Float32Array([.5,.5])}}}),R=new T(n,{geometry:C,program:r}),v=()=>{const{clientWidth:i,clientHeight:s}=o;m.setSize(i,s),r.uniforms.iResolution.value.r=i,r.uniforms.iResolution.value.g=s,r.uniforms.iResolution.value.b=i/s};window.addEventListener("resize",v),v();let a=[.5,.5],f=[.5,.5];const g=i=>{const s=o.getBoundingClientRect(),A=(i.clientX-s.left)/s.width,E=1-(i.clientY-s.top)/s.height;f=[A,E]},p=()=>{f=[.5,.5]};l&&(o.addEventListener("mousemove",g),o.addEventListener("mouseleave",p));const h=i=>{l?(a[0]+=.05*(f[0]-a[0]),a[1]+=.05*(f[1]-a[1]),r.uniforms.uMouse.value[0]=a[0],r.uniforms.uMouse.value[1]=a[1]):(r.uniforms.uMouse.value[0]=.5,r.uniforms.uMouse.value[1]=.5),r.uniforms.iTime.value=i*.001,m.render({scene:R}),u.current=requestAnimationFrame(h)};return u.current=requestAnimationFrame(h),()=>{var i;u.current&&cancelAnimationFrame(u.current),window.removeEventListener("resize",v),l&&(o.removeEventListener("mousemove",g),o.removeEventListener("mouseleave",p)),o.contains(n.canvas)&&o.removeChild(n.canvas),(i=n.getExtension("WEBGL_lose_context"))==null||i.loseContext()}},[e,t,_,l]),L.jsx("div",{ref:c,className:"threads-container",...b})};export{U as T};
