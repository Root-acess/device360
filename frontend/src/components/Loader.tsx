import { useEffect, useRef, useState } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

export const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const animRef = useRef<number>(0);

  const labels = ['Diagnosing...', 'Screen Check...', 'Battery Test...', 'Ready!'];

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const W = wrap.offsetWidth;
    const H = wrap.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    // Dynamically load Three.js from CDN then init the scene
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = () => initScene(W, H);
    document.head.appendChild(script);

    return () => {
      cancelAnimationFrame(animRef.current);
      document.head.removeChild(script);
    };
  }, []);

  const initScene = (W: number, H: number) => {
    const THREE = (window as any).THREE;
    const canvas = canvasRef.current;
    if (!canvas || !THREE) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    scene.add(new THREE.AmbientLight(0xffffff, 0.08));
    const rimLight = new THREE.DirectionalLight(0x00cfff, 3.5);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const rimLight2 = new THREE.DirectionalLight(0x0055ff, 1.5);
    rimLight2.position.set(3, -1, -3);
    scene.add(rimLight2);

    const frontLight = new THREE.PointLight(0xffffff, 0.6, 20);
    frontLight.position.set(0, 2, 4);
    scene.add(frontLight);

    const fillLight = new THREE.PointLight(0x00aaff, 0.4, 15);
    fillLight.position.set(2, 0, 3);
    scene.add(fillLight);

    const phoneGroup = new THREE.Group();
    scene.add(phoneGroup);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.92,
      roughness: 0.08,
    });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.12), bodyMat);
    phoneGroup.add(body);

    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x050510,
      metalness: 0.1,
      roughness: 0.05,
      emissive: 0x001833,
      emissiveIntensity: 0.6,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(0.96, 1.96, 0.005), screenMat);
    screen.position.set(0, 0, 0.065);
    phoneGroup.add(screen);

    const notchMat = new THREE.MeshStandardMaterial({
      color: 0x050510,
      metalness: 0.1,
      roughness: 0.1,
    });
    const notch = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16), notchMat);
    notch.rotation.x = Math.PI / 2;
    notch.position.set(0, 0.9, 0.068);
    phoneGroup.add(notch);

    const camDotMat = new THREE.MeshStandardMaterial({
      color: 0x222222,
      metalness: 0.8,
      roughness: 0.2,
    });
    const camDot = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.015, 12), camDotMat);
    camDot.rotation.x = Math.PI / 2;
    camDot.position.set(0, 0.9, 0.075);
    phoneGroup.add(camDot);

    const btnMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.95,
      roughness: 0.05,
    });
    const btnGeo = new THREE.BoxGeometry(0.02, 0.18, 0.04);
    const btnR1 = new THREE.Mesh(btnGeo, btnMat);
    btnR1.position.set(0.57, 0.4, 0);
    phoneGroup.add(btnR1);

    const btnR2 = new THREE.Mesh(btnGeo, btnMat);
    btnR2.position.set(0.57, 0.1, 0);
    phoneGroup.add(btnR2);

    const btnL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.28, 0.04), btnMat);
    btnL.position.set(-0.57, 0.2, 0);
    phoneGroup.add(btnL);

    const homeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1,
    });
    const homeBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 20), homeMat);
    homeBtn.rotation.x = Math.PI / 2;
    homeBtn.position.set(0, -0.95, 0.065);
    phoneGroup.add(homeBtn);

    const camBlockMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      metalness: 0.95,
      roughness: 0.05,
    });
    const camBlock = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.025), camBlockMat);
    camBlock.position.set(-0.28, -0.45, -0.07);
    phoneGroup.add(camBlock);

    [[-0.34, -0.38], [-0.22, -0.38], [-0.34, -0.52], [-0.22, -0.52]].forEach(([x, y]) => {
      const lensMat = new THREE.MeshStandardMaterial({
        color: 0x050508,
        metalness: 0.2,
        roughness: 0.0,
        emissive: 0x000511,
        emissiveIntensity: 0.5,
      });
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.015, 20), lensMat);
      lens.rotation.x = Math.PI / 2;
      lens.position.set(x, y, -0.075);
      phoneGroup.add(lens);
    });

    const flashMat = new THREE.MeshStandardMaterial({
      color: 0xffe0a0,
      metalness: 0.3,
      roughness: 0.4,
      emissive: 0x332200,
      emissiveIntensity: 0.8,
    });
    const flash = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.012, 12), flashMat);
    flash.rotation.x = Math.PI / 2;
    flash.position.set(-0.16, -0.45, -0.075);
    phoneGroup.add(flash);

    phoneGroup.rotation.x = 0.12;
    phoneGroup.rotation.y = 0.3;

    const pCount = 60;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 6;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
    }

    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.018,
      transparent: true,
      opacity: 0.35,
    });
    const pMesh = new THREE.Points(particles, pMat);
    scene.add(pMesh);

    let prog = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      animRef.current = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      phoneGroup.rotation.y = 0.3 + Math.sin(t * 0.4) * 0.55;
      phoneGroup.rotation.x = 0.12 + Math.sin(t * 0.25) * 0.08;
      phoneGroup.position.y = Math.sin(t * 0.6) * 0.07;
      rimLight.intensity = 3.2 + Math.sin(t * 1.2) * 0.5;
      screenMat.emissiveIntensity = 0.5 + Math.sin(t * 0.8) * 0.2;
      pMesh.rotation.y = t * 0.04;
      pMesh.rotation.x = t * 0.02;

      if (prog < 100) {
        prog += 1.2; // faster loading
        const p = Math.min(Math.round(prog), 100);
        setProgress(p);

        if (p >= 20 && p < 40) setLabel(labels[0]);
        else if (p >= 40 && p < 60) setLabel(labels[1]);
        else if (p >= 60 && p < 85) setLabel(labels[2]);
        else if (p >= 85) setLabel(labels[3]);
      } else {
        cancelAnimationFrame(animRef.current);
        setFadeOut(true);
        setTimeout(() => onComplete(), 300);
      }

      renderer.render(scene, camera);
    };

    tick();
  };

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.35s ease',
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      {/* Background REPAIR text */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontSize: 'clamp(60px,14vw,130px)',
            fontWeight: 900,
            color: 'rgba(255,255,255,0.04)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          DEVICE360
        </span>
      </div>

      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 2 }} />

      {/* Floating tags */}
      {[
        { text: 'Screen Repair', x: '18%', y: '28%' },
        { text: 'Battery Replace', x: '62%', y: '20%' },
        { text: 'Water Damage', x: '70%', y: '65%' },
        { text: 'Fast & Reliable', x: '12%', y: '68%' },
      ].map((tag) => (
        <div
          key={tag.text}
          style={{
            position: 'absolute',
            left: tag.x,
            top: tag.y,
            fontFamily: 'Arial, sans-serif',
            fontSize: 11,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {tag.text}
        </div>
      ))}

      {/* Bottom bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: 36,
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <span
            style={{
              fontFamily: "'Arial Black', Arial, sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Device360
          </span>
          <span
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
            }}
          >
            Mobile Repair Experts
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 200 }}>
          <div
            style={{
              width: '100%',
              height: 2,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg,#00d4ff,#0099cc)',
                borderRadius: 2,
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.2em',
            }}
          >
            {label || `${progress}%`}
          </span>
        </div>
      </div>
    </div>
  );
};