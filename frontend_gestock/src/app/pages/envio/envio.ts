import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-envio',
  standalone: true,
  templateUrl: './envio.html',
  styleUrls: ['./envio.css']
})
export class EnviosComponent implements AfterViewInit, OnDestroy {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private vanGroup!: THREE.Group;
  private airplaneGroup!: THREE.Group;
  private cargoGroup!: THREE.Group;
  private cityGroup!: THREE.Group;

  private resizeListener!: () => void;
  private animationFrameId!: number;

  ngAfterViewInit(): void {
    this.initScene();
    this.createEnvironment();
    this.createCityBuildings();
    this.createDetailedVan();
    this.createCargoPlane();
    this.createCargo();
    this.setupScrollAnimations();
  }

  private initScene(): void {
    const container = document.getElementById('canvas-envios');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080a0f);
    this.scene.fog = new THREE.FogExp2(0x080a0f, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(7, 3, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // Iluminación
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffedd5, 3.0);
    mainLight.position.set(15, 25, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);

    // Animación continua del avión (flotación/balanceo sutil)
    let clock = new THREE.Clock();
    const renderLoop = () => {
      this.animationFrameId = requestAnimationFrame(renderLoop);
      const time = clock.getElapsedTime();

      if (this.airplaneGroup) {
        // Balanceo suave en vuelo y turbulencia sutil
        this.airplaneGroup.position.y += Math.sin(time * 2) * 0.005;
        this.airplaneGroup.rotation.z += Math.cos(time * 1.5) * 0.001;
      }

      this.renderer.render(this.scene, this.camera);
    };
    renderLoop();

    this.resizeListener = () => {
      if (!container) return;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private createEnvironment(): void {
    // Pista de Asfalto
    const roadGeo = new THREE.PlaneGeometry(35, 350);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.7,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -100;
    road.receiveShadow = true;
    this.scene.add(road);

    // Líneas divisoras
    for (let i = -220; i < 40; i += 10) {
      const lineGeo = new THREE.PlaneGeometry(0.5, 4);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, i);
      this.scene.add(line);
    }
  }

  // Creación de la ciudad (Edificios iluminados alrededor)
  private createCityBuildings(): void {
    this.cityGroup = new THREE.Group();

    const buildingColors = [0x1e293b, 0x0f172a, 0x334155];
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfbae17 }); // Ventanas iluminadas

    for (let i = 0; i < 45; i++) {
      const height = Math.random() * 25 + 10;
      const width = Math.random() * 8 + 6;
      const depth = Math.random() * 8 + 6;

      const buildGeo = new THREE.BoxGeometry(width, height, depth);
      const buildMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.5
      });

      const building = new THREE.Mesh(buildGeo, buildMat);

      // Ubicar a los lados de la pista
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (Math.random() * 30 + 35);
      const z = -Math.random() * 250 + 20;

      building.position.set(x, height / 2, z);
      this.cityGroup.add(building);

      // Ventanas aleatorias
      const windowGeo = new THREE.PlaneGeometry(0.6, 0.9);
      for (let w = 0; w < 6; w++) {
        if (Math.random() > 0.4) {
          const win = new THREE.Mesh(windowGeo, windowMat);
          win.position.set(
            x + (side * -width) / 2 - 0.05,
            Math.random() * (height - 4) + 2,
            z + (Math.random() - 0.5) * (depth - 2)
          );
          win.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
          this.cityGroup.add(win);
        }
      }
    }

    this.scene.add(this.cityGroup);
  }

  private createDetailedVan(): void {
    this.vanGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.2,
      metalness: 0.8
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true
    });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Cuerpo principal
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.5);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    this.vanGroup.add(body);

    // Cabina superior
    const cabinGeo = new THREE.BoxGeometry(2.35, 1.0, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.8, 0.8);
    this.vanGroup.add(cabin);

    // Faros
    const headlightGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    const headLeft = new THREE.Mesh(headlightGeo, lightMat);
    headLeft.position.set(-0.9, 1.1, 2.26);
    const headRight = new THREE.Mesh(headlightGeo, lightMat);
    headRight.position.set(0.9, 1.1, 2.26);
    this.vanGroup.add(headLeft, headRight);

    const tailLeft = new THREE.Mesh(headlightGeo, redLightMat);
    tailLeft.position.set(-0.9, 1.1, -2.26);
    const tailRight = new THREE.Mesh(headlightGeo, redLightMat);
    tailRight.position.set(0.9, 1.1, -2.26);
    this.vanGroup.add(tailLeft, tailRight);

    // Ruedas
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 24);
    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.36, 12);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

    const wheelPositions = [
      [-1.25, 0.45, 1.4],
      [1.25, 0.45, 1.4],
      [-1.25, 0.45, -1.4],
      [1.25, 0.45, -1.4]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, darkMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheel.rotation.z = Math.PI / 2;
      rim.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      rim.position.set(x, y, z);
      wheel.castShadow = true;
      this.vanGroup.add(wheel, rim);
    });

    this.vanGroup.position.set(-3, 0, 12);
    this.scene.add(this.vanGroup);
  }

  private createCargoPlane(): void {
  this.airplaneGroup = new THREE.Group();

  // Materiales detallados
  const fuselageMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.6
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.3
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.3
  });
  const glassCockpitMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    roughness: 0.1,
    metalness: 0.9,
    transmission: 0.7,
    transparent: true
  });
  const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const engineGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

  // 1. FUSELAJE PRINCIPAL (Cuerpo)
  const bodyGeo = new THREE.CylinderGeometry(1.5, 1.2, 13, 32);
  const body = new THREE.Mesh(bodyGeo, fuselageMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  this.airplaneGroup.add(body);

  // 2. NARIZ Y FRENTE DEL AVIÓN (Frente cónico aerodinámico)
  const noseGeo = new THREE.ConeGeometry(1.5, 3.2, 32);
  const nose = new THREE.Mesh(noseGeo, fuselageMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.set(0, 0, 8.1);
  this.airplaneGroup.add(nose);

  // 3. CABINA DE CRISTAL / VENTANAS DEL PILOTO (Frontal)
  const cockpitGeo = new THREE.SphereGeometry(1.51, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
  const cockpitWindow = new THREE.Mesh(cockpitGeo, glassCockpitMat);
  cockpitWindow.rotation.x = -Math.PI / 2.3;
  cockpitWindow.position.set(0, 0.2, 6.7);
  this.airplaneGroup.add(cockpitWindow);

  // Marcos de las ventanas frontales
  const frameGeo = new THREE.BoxGeometry(0.1, 0.7, 0.6);
  const frameCenter = new THREE.Mesh(frameGeo, darkMetalMat);
  frameCenter.position.set(0, 1.25, 7.1);
  this.airplaneGroup.add(frameCenter);

  // 4. FAROS DE ATERRIZAJE FRONTALES (Luces en el frente)
  const lightGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  const frontLightLeft = new THREE.Mesh(lightGeo, headlightMat);
  frontLightLeft.rotation.x = Math.PI / 2;
  frontLightLeft.position.set(-0.6, -0.4, 8.8);

  const frontLightRight = new THREE.Mesh(lightGeo, headlightMat);
  frontLightRight.rotation.x = Math.PI / 2;
  frontLightRight.position.set(0.6, -0.4, 8.8);

  this.airplaneGroup.add(frontLightLeft, frontLightRight);

  // 5. ALAS PRINCIPALES CON WINGLETS (Puntas elevadas)
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(10, -2);
  wingShape.lineTo(9.5, -4);
  wingShape.lineTo(0, -1.5);
  wingShape.closePath();

  const extrudeSettings = { depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);

  // Ala Izquierda
  const wingLeft = new THREE.Mesh(wingGeo, fuselageMat);
  wingLeft.rotation.x = Math.PI / 2;
  wingLeft.position.set(0, 0.2, 1);
  wingLeft.castShadow = true;

  // Ala Derecha
  const wingRight = new THREE.Mesh(wingGeo, fuselageMat);
  wingRight.rotation.x = Math.PI / 2;
  wingRight.rotation.y = Math.PI;
  wingRight.position.set(0, 0.2, -1);
  wingRight.castShadow = true;

  this.airplaneGroup.add(wingLeft, wingRight);

  // Winglets (Alerones verticales en las puntas de las alas)
  const wingletGeo = new THREE.BoxGeometry(0.15, 1.2, 1.5);
  const wingletLeft = new THREE.Mesh(wingletGeo, accentMat);
  wingletLeft.position.set(-9.8, 0.7, -2);

  const wingletRight = new THREE.Mesh(wingletGeo, accentMat);
  wingletRight.position.set(9.8, 0.7, -2);

  this.airplaneGroup.add(wingletLeft, wingletRight);

  // 6. MOTORES DETALLADOS CON TURBINAS Y RESPLANDOR
  const createEngine = (xPos: number) => {
    const engineGroup = new THREE.Group();

    // Cubierta exterior
    const outerGeo = new THREE.CylinderGeometry(0.65, 0.55, 2.8, 24);
    const outer = new THREE.Mesh(outerGeo, fuselageMat);
    outer.rotation.x = Math.PI / 2;

    // Interior / Núcleo
    const coreGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.85, 16);
    const core = new THREE.Mesh(coreGeo, darkMetalMat);
    core.rotation.x = Math.PI / 2;

    // Resplandor del escape trasero
    const glowGeo = new THREE.CircleGeometry(0.4, 16);
    const glow = new THREE.Mesh(glowGeo, engineGlowMat);
    glow.position.set(0, 0, -1.43);

    engineGroup.add(outer, core, glow);
    engineGroup.position.set(xPos, -0.7, 0.5);
    return engineGroup;
  };

  this.airplaneGroup.add(createEngine(-4.2));
  this.airplaneGroup.add(createEngine(4.2));

  // 7. COLA / ESTABILIZADOR TRASERO
  const tailVerticalGeo = new THREE.BoxGeometry(0.25, 3.8, 2.8);
  const tailVertical = new THREE.Mesh(tailVerticalGeo, accentMat);
  tailVertical.position.set(0, 2.5, -5.5);
  tailVertical.rotation.x = -0.3;

  const tailHorizontalGeo = new THREE.BoxGeometry(6.5, 0.15, 1.8);
  const tailHorizontal = new THREE.Mesh(tailHorizontalGeo, fuselageMat);
  tailHorizontal.position.set(0, 0.8, -6.0);

  this.airplaneGroup.add(tailVertical, tailHorizontal);

  // Posición inicial y orientación
  this.airplaneGroup.position.set(4, 1.6, -25);
  this.scene.add(this.airplaneGroup);
}

  private createCargo(): void {
    this.cargoGroup = new THREE.Group();

    const boxGeo = new THREE.BoxGeometry(1.0, 1.0, 1.0);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });

    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    this.cargoGroup.add(box);

    this.cargoGroup.position.set(-3, 1.0, 12);
    this.cargoGroup.visible = false;
    this.scene.add(this.cargoGroup);
  }

  private setupScrollAnimations(): void {
    const scrollContainer = document.querySelector('.scroll-container');
    if (!scrollContainer) return;

    const navSteps = document.querySelectorAll('.timeline-step');

    const setActiveNav = (index: number) => {
      navSteps.forEach((step, i) => {
        if (i === index) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: scrollContainer,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    // CAPÍTULO 1: Recolección
    tl.to(this.vanGroup.position, { z: 2, duration: 2.5 }, 0)
      .to(this.camera.position, { x: -5, y: 2.8, z: 8, duration: 2.5 }, 0)
      .call(() => setActiveNav(0), [], 0)

    // CAPÍTULO 2: Transferencia
      .set(this.cargoGroup, { visible: true }, 2.5)
      .to(this.cargoGroup.position, { x: 4, y: 1.8, z: -22, duration: 3, ease: 'power1.inOut' }, 2.5)
      .to(this.camera.position, { x: 1, y: 4.5, z: -10, duration: 3 }, 2.5)
      .call(() => setActiveNav(1), [], 2.8)

    // CAPÍTULO 3: Despegue
      .to(this.airplaneGroup.position, { z: -40, y: 1.6, duration: 2.5 }, 5.5)
      .to(this.camera.position, { x: 0, y: 3.5, z: -18, duration: 2.5 }, 5.5)
      .call(() => setActiveNav(2), [], 5.8)

    // CAPÍTULO 4: En tránsito (Aceleración, Elevación y Vuelo sobre la Ciudad)
      .to(this.airplaneGroup.position, { z: -140, y: 50, x: 15, duration: 3.5, ease: 'power2.in' }, 8)
      .to(this.airplaneGroup.rotation, { x: -0.35, z: -0.18, duration: 3 }, 8)
      .to(this.camera.position, { x: -6, y: 10, z: -25, duration: 3.5 }, 8)
      .call(() => setActiveNav(3), [], 8.2);
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    ScrollTrigger.getAll().forEach(t => t.kill());
  }
}