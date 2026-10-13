"use client";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";

// Logical states. Real clips in robot.glb: Idle, Running, Jump, Wave, Yes, ThumbsUp (plus Dance, No, Walking, etc.).
// States without a clip of their own reuse Idle and are expressed procedurally (head, torso, face morph, squash).
export type Pose = "idle" | "curious" | "thinking" | "anticipate" | "happy" | "greeting" | "celebrate" | "run" | "jump" | "wave" | "talk";

const MODEL = "/models/robot.glb";
const CLIP: Record<Pose, string> = { idle: "Idle", curious: "Idle", thinking: "Idle", anticipate: "Idle", happy: "Jump", greeting: "Wave", celebrate: "ThumbsUp", run: "Running", jump: "Jump", wave: "Wave", talk: "Yes" };
const ONCE = new Set<Pose>(["happy", "greeting", "celebrate", "jump", "wave"]);
const FADE: Partial<Record<Pose, number>> = { run: 0.2, happy: 0.1, jump: 0.1 };

type Weights = { curious: number; thinking: number; talk: number; hover: number; anticipate: number };
const KEYS = ["curious", "thinking", "talk", "hover", "anticipate"] as const;

// Plain function: switches clips with a cross-fade and never restarts a clip that is already playing.
function playClip(a: THREE.AnimationAction, once: boolean, fade: number, prev?: THREE.AnimationAction | null) {
  a.reset();
  a.setEffectiveTimeScale(1);
  a.setEffectiveWeight(1);
  a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, once ? 1 : Infinity);
  a.clampWhenFinished = true;
  a.fadeIn(fade).play();
  if (prev && prev !== a) prev.fadeOut(fade);
}

function Shadow({ light }: { light: boolean }) {
  // Soft contact shadow: a radial gradient disc, far cheaper than a shadow pass.
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d")!;
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 32);
    r.addColorStop(0, "rgba(0,0,0,0.55)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh position={[0, -1.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.5, 0.9, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent opacity={light ? 0.55 : 0.8} depthWrite={false} />
    </mesh>
  );
}

function Robot({ pose, facing, hover, light }: { pose: Pose; facing: -1 | 0 | 1; hover: boolean; light: boolean }) {
  const outer = useRef<THREE.Group>(null);
  const squash = useRef<THREE.Group>(null);
  const { scene: source, animations } = useGLTF(MODEL);
  // Each canvas gets its own skinned clone. The cached source is shared, so fitting or posing it in place
  // would break the next canvas (dock, floating, chat avatar) that mounts.
  const scene = useMemo(() => cloneSkinned(source), [source]);
  const { actions } = useAnimations(animations, outer);
  const invalidate = useThree((s) => s.invalidate);
  const current = useRef<THREE.AnimationAction | null>(null);
  const w = useRef<Weights>({ curious: 0, thinking: 0, talk: 0, hover: 0, anticipate: 0 });
  const rig = useRef<{ neck?: THREE.Object3D; abdomen?: THREE.Object3D; face?: THREE.Mesh; surprised?: number }>({});
  const tmp = useRef({ q: new THREE.Quaternion(), e: new THREE.Euler() });
  // The offset applied to each bone last frame, so it can be removed before the mixer runs.
  const applied = useRef({ neck: new THREE.Quaternion(), abdomen: new THREE.Quaternion() });

  // Fit to a 2-unit box with the feet at the origin of the squash group, apply the palette, and find the rig.
  useLayoutEffect(() => {
    scene.updateMatrixWorld(true); // a fresh skinned clone has no world matrices yet; measuring before this gives garbage
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const k = 2 / size.y;
    scene.scale.setScalar(k);
    scene.position.set(-center.x * k, -box.min.y * k, -center.z * k);
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) {
        if (o.name === "Neck") rig.current.neck = o;
        if (o.name === "Abdomen") rig.current.abdomen = o;
      }
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (mesh.morphTargetDictionary && "Surprised" in mesh.morphTargetDictionary) {
        rig.current.face = mesh;
        rig.current.surprised = mesh.morphTargetDictionary.Surprised;
      }
      const mat = mesh.material as THREE.MeshStandardMaterial;
      // Off-white ceramic, graphite trim, glossy dark faceplate. Slightly deeper body on light pages for separation.
      if (mat.name === "Main") {
        mat.color.set(light ? "#dedcd5" : "#e6e4de");
        mat.roughness = 0.55;
        mat.metalness = 0.02;
      }
      if (mat.name === "Grey") {
        mat.color.set("#383d40");
        mat.roughness = 0.5;
      }
      if (mat.name === "Black") {
        mat.roughness = 0.18;
        mat.metalness = 0.1;
      }
      mat.envMapIntensity = 0.75;
    });
  }, [scene, light]);

  useEffect(() => {
    const action = actions[CLIP[pose]];
    if (!action) return;
    const once = ONCE.has(pose);
    if (current.current === action && !once) return; // same looping clip: keep it running
    playClip(action, once, FADE[pose] ?? 0.3, current.current);
    current.current = action;
    invalidate();
  }, [pose, actions, invalidate]);

  // Runs BEFORE the mixer (negative priority): strips last frame's offset. Bones the current clip does not
  // write would otherwise keep it and compound every frame.
  useFrame(() => {
    const { neck, abdomen } = rig.current;
    const { q } = tmp.current;
    if (neck) neck.quaternion.multiply(q.copy(applied.current.neck).invert());
    if (abdomen) abdomen.quaternion.multiply(q.copy(applied.current.abdomen).invert());
    applied.current.neck.identity();
    applied.current.abdomen.identity();
  }, -1);

  // Runs after the mixer update, so offsets layer on top of whichever clip is playing.
  useFrame((state, dt) => {
    const o = outer.current;
    const s = squash.current;
    if (!o || !s) return;
    const t = state.clock.elapsedTime;
    o.rotation.y = THREE.MathUtils.damp(o.rotation.y, (facing * Math.PI) / 2.2, 8, dt);

    const goal: Weights = { curious: +(pose === "curious"), thinking: +(pose === "thinking"), talk: +(pose === "talk"), hover: +hover, anticipate: +(pose === "anticipate") };
    for (const k of KEYS) w.current[k] = THREE.MathUtils.damp(w.current[k], goal[k], k === "anticipate" ? 14 : 6, dt);
    const W = w.current;

    const grow = 1 + 0.05 * W.hover;
    const breathe = 1 + Math.sin(t * 2.1) * 0.006;
    s.scale.set((1 + 0.06 * W.anticipate) * grow, (1 - 0.09 * W.anticipate) * breathe * grow, (1 + 0.06 * W.anticipate) * grow);

    const { e } = tmp.current;
    const { neck, abdomen, face, surprised } = rig.current;
    if (neck) {
      const glance = Math.sin(t * 0.55) * 0.07; // slow idle glance
      e.set(-0.2 * W.thinking + Math.sin(t * 10) * 0.035 * W.talk, 0.42 * W.curious + glance, 0.3 * W.curious + 0.12 * W.hover + 0.16 * W.thinking);
      applied.current.neck.setFromEuler(e);
      neck.quaternion.multiply(applied.current.neck);
    }
    if (abdomen) {
      e.set(0, 0, Math.sin(t * 1.4) * 0.035 * W.thinking + Math.sin(t * 0.7) * 0.012);
      applied.current.abdomen.setFromEuler(e);
      abdomen.quaternion.multiply(applied.current.abdomen);
    }
    if (face?.morphTargetInfluences && surprised !== undefined) face.morphTargetInfluences[surprised] = 0.7 * W.curious;
  });

  return (
    <group ref={outer}>
      <group ref={squash} position={[0, -1, 0]}>
        <primitive object={scene} />
      </group>
      <Shadow light={light} />
    </group>
  );
}

export default function RobotCanvas({ pose, facing, hover, active, bust }: { pose: Pose; facing: -1 | 0 | 1; hover: boolean; active: boolean; bust?: boolean }) {
  const light = useMemo(() => window.matchMedia("(prefers-color-scheme: light)").matches, []);
  return (
    <Canvas
      // Continuous only while visible and motion is allowed; otherwise draw on demand.
      frameloop={active ? "always" : "demand"}
      dpr={[1, 2]}
      // Small views (header dock, chat avatar) zoom the same full-figure camera so the head keeps headroom.
      camera={bust ? { position: [0, 0.1, 6.6], fov: 26, zoom: 1.3 } : { position: [0, 0.25, 6.6], fov: 26 }}
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.92;
      }}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.5, 4, 5]} intensity={1.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#f2703d" />
      <Suspense fallback={null}>
        {/* Procedural studio lights: no external HDR download */}
        <Environment resolution={32} frames={1}>
          <Lightformer form="rect" intensity={2.4} position={[1.5, 3, 4]} scale={[5, 2.5, 1]} />
          <Lightformer form="rect" intensity={0.9} position={[-4, 1, 2]} scale={[2, 4, 1]} />
          <Lightformer form="rect" intensity={0.6} position={[0, -2, 3]} scale={[6, 1, 1]} />
        </Environment>
        <Robot pose={pose} facing={facing} hover={hover} light={light} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL);
