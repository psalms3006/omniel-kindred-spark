import { useEffect, useRef } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * Electric impact waves, adapted from the 21st.dev component.
 *
 * Changes from the original:
 *  - the shader is tinted to the OMNIEL blue/cyan signal instead of raw RGB;
 *  - loop bounds are constant for wider WebGL compatibility;
 *  - rendering pauses when the stage is offscreen;
 *  - resize is observed on the container, not the window;
 *  - React 19-safe refs and full disposal on unmount.
 *
 * It is lazy-loaded and client-only by `NovaStage`; visitors who never reach
 * the NOVA section do not download Three.js.
 */
interface ElectricWavesShaderProps {
  waveCount?: number;
  amplitude?: number;
  frequency?: number;
  brightness?: number;
  colorSeparation?: number;
  className?: string;
}

type WaveUniforms = {
  u_time: { value: number };
  u_resolution: { value: THREE.Vector2 };
  u_waveCount: { value: number };
  u_amplitude: { value: number };
  u_frequency: { value: number };
  u_brightness: { value: number };
  u_colorSeparation: { value: number };
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_waveCount;
  uniform float u_amplitude;
  uniform float u_frequency;
  uniform float u_brightness;
  uniform float u_colorSeparation;

  const float MAX_WAVES = 12.0;

  float pattern(vec2 uv) {
    float intensity = 0.0;
    for (float i = 0.0; i < MAX_WAVES; i++) {
      if (i >= u_waveCount) break;
      uv.x += sin(u_time * (1.0 + i) + uv.y * u_frequency) * u_amplitude;
      intensity += u_brightness / max(abs(uv.x), 0.02);
    }
    return intensity;
  }

  vec3 scene(vec2 uv) {
    vec3 color = vec3(0.0);
    vec2 ruv = vec2(uv.y, uv.x);
    for (float i = 0.0; i < MAX_WAVES; i++) {
      if (i >= u_waveCount) break;
      int channel = int(mod(i, 3.0));
      vec2 cuv = ruv + vec2(0.0, i * u_colorSeparation);
      color[channel] += pattern(cuv);
    }
    return color;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution)
              / min(u_resolution.x, u_resolution.y);
    vec3 col = scene(uv);
    float energy = clamp(col.r * 0.9 + col.g * 0.7 + col.b * 0.5, 0.0, 1.0);

    vec3 deep = vec3(0.01, 0.03, 0.09);
    vec3 electric = vec3(0.08, 0.32, 1.0);
    vec3 ice = vec3(0.32, 0.82, 1.0);
    vec3 tinted = mix(deep, electric, smoothstep(0.0, 0.55, energy));
    tinted = mix(tinted, ice, smoothstep(0.55, 1.0, energy));

    gl_FragColor = vec4(tinted, 1.0);
  }
`;

export default function ElectricWavesShader({
  waveCount = 6,
  amplitude = 0.12,
  frequency = 2.4,
  brightness = 0.006,
  colorSeparation = 0.12,
  className,
}: ElectricWavesShaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const uniformsRef = useRef<WaveUniforms | null>(null);

  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    uniforms.u_waveCount.value = waveCount;
    uniforms.u_amplitude.value = amplitude;
    uniforms.u_frequency.value = frequency;
    uniforms.u_brightness.value = brightness;
    uniforms.u_colorSeparation.value = colorSeparation;
  }, [waveCount, amplitude, frequency, brightness, colorSeparation]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (error) {
      console.error("WebGL not supported", error);
      container.style.background = "radial-gradient(circle at 50% 50%, #123a8f 0%, #05070d 62%)";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const uniforms: WaveUniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(1, 1) },
      u_waveCount: { value: waveCount },
      u_amplitude: { value: amplitude },
      u_frequency: { value: frequency },
      u_brightness: { value: brightness },
      u_colorSeparation: { value: colorSeparation },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      uniforms.u_resolution.value.set(width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    const loop = () => {
      uniforms.u_time.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    const start = () => renderer.setAnimationLoop(loop);
    const stop = () => renderer.setAnimationLoop(null);

    start();

    const intersection = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
          else stop();
        }
      },
      { threshold: 0.05 },
    );
    intersection.observe(container);

    return () => {
      intersection.disconnect();
      observer.disconnect();
      renderer.setAnimationLoop(null);
      renderer.domElement.remove();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      uniformsRef.current = null;
    };
    // Shader props are synced by the effect above; the scene is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 overflow-hidden bg-black", className)}
      aria-hidden="true"
    />
  );
}
