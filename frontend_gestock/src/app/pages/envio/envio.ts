import { Component, AfterViewInit, OnDestroy, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { gsap } from 'gsap';

gsap.registerPlugin();

@Component({
  selector: 'app-envio',
  standalone: true,
  templateUrl: './envio.html',
  styleUrls: ['./envio.css']
})
export class EnviosComponent implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private vanGroup!: THREE.Group;
  private airplaneGroup!: THREE.Group;
  private cargoGroup!: THREE.Group;
  private cityGroup!: THREE.Group;
  private streetLightsGroup!: THREE.Group;
  private airplaneLightsGroup!: THREE.Group;
  private truckGroup!: THREE.Group;
  private cloudsGroup!: THREE.Group;
  private engineParticles: THREE.Points[] = [];
  private truckWheels: THREE.Mesh[] = [];

  private resizeListener!: () => void;
  private animationFrameId!: number;
  private clock = new THREE.Clock();
  private airplanePhase: 'ground' | 'takeoff' | 'flight' = 'ground';
  private currentSection: number = 0;
  private truckMoving: boolean = false;
  private bgColor = { r: 0.031, g: 0.039, b: 0.059 };

  // Cache de materiales para evitar recreación
  private strobeOnMat!: THREE.MeshBasicMaterial;
  private strobeOffMat!: THREE.MeshBasicMaterial;
  private engineGlowMat!: THREE.MeshBasicMaterial;
  private heatRingMat!: THREE.MeshBasicMaterial;
  private windowMats: THREE.MeshBasicMaterial[] = [];

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.initMaterials();
    this.initScene();
    this.createEnvironment();
    this.createCityBuildings();
    this.createStreetLights();
    this.createDetailedVan();
    this.createDetailedCargoPlane();
    this.createCargo();
    this.createEngineParticles();
    this.createDeliveryTruck();
    this.createClouds();
    this.setupScrollObserver();
    this.setScene(0);
  }

  private initMaterials(): void {
    this.strobeOnMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.strobeOffMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
    this.engineGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    this.heatRingMat = new THREE.MeshBasicMaterial({ color: 0xff6600 });
  }

  // ─── NAVEGACIÓN ───
  navigateToSection(index: number): void {
    if (index === this.currentSection) return;
    const section = document.getElementById(`section-${index}`);
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.setActiveNav(index);
    this.setScene(index);
    this.currentSection = index;
  }

  private setActiveNav(index: number): void {
    document.querySelectorAll('.timeline-step').forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
  }

  private setupScrollObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.id.replace('section-', ''), 10);
            if (!isNaN(idx) && idx !== this.currentSection) {
              this.setActiveNav(idx);
            }
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll('.section-chapter').forEach((s) => observer.observe(s));
  }

  // ─── ESCENAS ───
  private setScene(index: number): void {
    gsap.globalTimeline.clear();

    const duration = 2.0;
    const ease = 'power3.inOut';

    switch (index) {
      case 0:
        this.airplanePhase = 'ground';
        this.truckMoving = false;
        this.animateBackground(0.031, 0.039, 0.059, 0.012);

        this.vanGroup.visible = true;
        this.airplaneGroup.visible = true;
        this.truckGroup.visible = false;
        this.cargoGroup.visible = false;
        this.cloudsGroup.visible = false;

        gsap.to(this.vanGroup.position, { x: -3, y: 0, z: 2, duration, ease });
        gsap.to(this.airplaneGroup.position, { x: 4, y: 1.6, z: -25, duration, ease });
        gsap.to(this.airplaneGroup.rotation, { x: 0, y: 0, z: 0, duration, ease });
        gsap.to(this.camera.position, { x: -5, y: 2.8, z: 8, duration, ease });
        break;

      case 1:
        this.airplanePhase = 'flight';
        this.truckMoving = false;
        this.animateBackground(0.08, 0.14, 0.28, 0.002);

        this.vanGroup.visible = false;
        this.airplaneGroup.visible = true;
        this.truckGroup.visible = false;
        this.cargoGroup.visible = false;
        this.cloudsGroup.visible = true;

        // Avión a altura media entre capas de nubes
        gsap.to(this.airplaneGroup.position, {
          x: 0, y: 32, z: 0,
          duration: 2.5,
          ease: 'power2.out',
          onUpdate: () => this.camera.lookAt(this.airplaneGroup.position)
        });
        gsap.to(this.airplaneGroup.rotation, { x: -0.06, y: 0, z: 0.03, duration: 2.2, ease });
        // Cámara desde atrás-ligeramente-abajo para ver avión completo entre nubes
        gsap.to(this.camera.position, {
          x: 6,
          y: 22,
          z: 45,
          duration: 2.5,
          ease,
          onUpdate: () => this.camera.lookAt(this.airplaneGroup.position)
        });
        break;

      case 2:
        this.airplanePhase = 'takeoff';
        this.truckMoving = false;
        this.animateBackground(0.025, 0.035, 0.07, 0.008);

        this.vanGroup.visible = false;
        this.airplaneGroup.visible = true;
        this.truckGroup.visible = false;
        this.cargoGroup.visible = false;
        this.cloudsGroup.visible = false;

        gsap.fromTo(this.airplaneGroup.position,
          { x: -5, y: 45, z: -80 },
          { x: 4, y: 1.6, z: -25, duration: 3.2, ease: 'power2.inOut' }
        );
        gsap.fromTo(this.airplaneGroup.rotation,
          { x: -0.25, y: 0, z: 0.1 },
          { x: 0, y: 0, z: 0, duration: 3.2, ease: 'power2.inOut' }
        );
        gsap.to(this.camera.position, { x: 2, y: 6, z: -12, duration: 2.8, ease });
        gsap.delayedCall(3.2, () => { this.airplanePhase = 'ground'; });
        break;

      case 3:
        this.airplanePhase = 'ground';
        this.truckMoving = true;
        this.animateBackground(0.031, 0.039, 0.059, 0.012);

        this.vanGroup.visible = false;
        this.airplaneGroup.visible = false;
        this.truckGroup.visible = true;
        this.cargoGroup.visible = false;
        this.cloudsGroup.visible = false;

        gsap.to(this.camera.position, { x: -6, y: 3.5, z: 12, duration, ease });

        this.truckGroup.position.set(-4, 0, 20);
        gsap.to(this.truckGroup.position, {
          z: -35, duration: 7, repeat: -1, ease: 'none',
          onRepeat: () => { this.truckGroup.position.z = 20; }
        });
        break;
    }
  }

  private animateBackground(r: number, g: number, b: number, fogDensity: number): void {
    const target = { r, g, b };
    gsap.to(this.bgColor, {
      ...target,
      duration: 2,
      onUpdate: () => {
        if (this.scene.background) {
          (this.scene.background as THREE.Color).setRGB(this.bgColor.r, this.bgColor.g, this.bgColor.b);
        }
        if (this.scene.fog) {
          (this.scene.fog as THREE.FogExp2).color.setRGB(this.bgColor.r, this.bgColor.g, this.bgColor.b);
          (this.scene.fog as THREE.FogExp2).density = fogDensity;
        }
      }
    });
  }

  // ─── SCENE INIT ───
  private initScene(): void {
    const container = document.getElementById('canvas-envios');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080a0f);
    this.scene.fog = new THREE.FogExp2(0x080a0f, 0.012);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.5,
      800
    );
    this.camera.position.set(7, 3, 10);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(this.renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x1a2035, 0.5);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0x1e3a5f, 0x0a0f1a, 0.3);
    this.scene.add(hemiLight);

    const mainLight = new THREE.DirectionalLight(0xc8d8f0, 2.0);
    mainLight.position.set(15, 25, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 1;
    mainLight.shadow.camera.far = 300;
    mainLight.shadow.camera.left = -60;
    mainLight.shadow.camera.right = 60;
    mainLight.shadow.camera.top = 60;
    mainLight.shadow.camera.bottom = -60;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-15, 10, -10);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xf97316, 0.3);
    fillLight.position.set(0, 5, 30);
    this.scene.add(fillLight);

    const renderLoop = () => {
      this.animationFrameId = requestAnimationFrame(renderLoop);
      const time = this.clock.getElapsedTime();

      this.animateAirplane(time);
      this.animateTruck(time);
      this.animateEngineParticles(time);
      this.animateClouds(time);

      this.renderer.render(this.scene, this.camera);
    };
    renderLoop();

    this.resizeListener = () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', this.resizeListener);
  }

  private animateClouds(time: number): void {
    if (!this.cloudsGroup || !this.cloudsGroup.visible) return;
    // Movimiento lento de nubes
    this.cloudsGroup.children.forEach((cluster, i) => {
      cluster.position.x += Math.sin(time * 0.1 + i) * 0.008;
      cluster.position.z += Math.cos(time * 0.08 + i) * 0.006;
      cluster.rotation.y += 0.0003;
    });
  }

  // ─── ANIMACIONES ───
  private animateAirplane(time: number): void {
    if (!this.airplaneGroup || !this.airplaneGroup.visible) return;

    if (this.airplanePhase === 'ground') {
      this.airplaneGroup.position.y = 1.6 + Math.sin(time * 15) * 0.008;
      this.airplaneGroup.rotation.z = Math.sin(time * 2) * 0.003;
    } else if (this.airplanePhase === 'takeoff') {
      this.airplaneGroup.position.y += Math.sin(time * 20) * 0.012;
      this.airplaneGroup.rotation.z = Math.cos(time * 3) * 0.008;
    } else if (this.airplanePhase === 'flight') {
      const t1 = time * 2;
      const t2 = time * 0.8;
      this.airplaneGroup.position.y += Math.sin(t1) * 0.008;
      this.airplaneGroup.rotation.z = Math.cos(t1) * 0.08 + Math.sin(t1 * 2.1) * 0.03;
      this.airplaneGroup.rotation.y = Math.sin(t2) * 0.05;
    }

    // Strobes: cambiar material solo cuando cambia el estado, no cada frame
    if (this.airplaneLightsGroup) {
      const strobeState = Math.sin(time * 12) > 0.7;
      const targetMat = strobeState ? this.strobeOnMat : this.strobeOffMat;
      this.airplaneLightsGroup.children.forEach((light) => {
        const mesh = light as THREE.Mesh;
        if (mesh.material !== targetMat) {
          mesh.material = targetMat;
        }
      });
    }
  }

  private animateTruck(time: number): void {
    if (!this.truckGroup || !this.truckGroup.visible || !this.truckMoving) return;
    this.truckGroup.position.y = Math.sin(time * 18) * 0.01;
    for (let i = 0; i < this.truckWheels.length; i++) {
      this.truckWheels[i].rotation.x -= 0.15;
    }
  }

  private animateEngineParticles(time: number): void {
    if (this.airplanePhase !== 'flight' && this.airplanePhase !== 'takeoff') return;
    if (!this.engineParticles.length) return;

    for (let p = 0; p < this.engineParticles.length; p++) {
      const particles = this.engineParticles[p];
      const posAttr = particles.geometry.attributes['position'];
      const positions = posAttr.array as Float32Array;
      const count = positions.length / 3;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        positions[idx + 2] -= 0.35;
        if (positions[idx + 2] < -8) {
          positions[idx] = (Math.random() - 0.5) * 0.3;
          positions[idx + 1] = (Math.random() - 0.5) * 0.3;
          positions[idx + 2] = -1.5;
        }
      }
      posAttr.needsUpdate = true;
    }
  }

  // ─── ENVIRONMENT ───
  private createEnvironment(): void {
    const roadGeo = new THREE.PlaneGeometry(40, 400);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8, metalness: 0.1 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -150;
    road.receiveShadow = true;
    this.scene.add(road);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const lineGeo = new THREE.PlaneGeometry(0.5, 6);
    for (let i = -250; i < 40; i += 12) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(0, 0.02, i);
      this.scene.add(line);
    }

    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const edgeGeo = new THREE.PlaneGeometry(0.3, 3);
    for (let i = -250; i < 40; i += 6) {
      const le = new THREE.Mesh(edgeGeo, edgeMat);
      le.rotation.x = -Math.PI / 2;
      le.position.set(-18, 0.02, i);
      this.scene.add(le);

      const re = new THREE.Mesh(edgeGeo, edgeMat);
      re.rotation.x = -Math.PI / 2;
      re.position.set(18, 0.02, i);
      this.scene.add(re);
    }

    const greenMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const redMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const lightGeo = new THREE.SphereGeometry(0.15, 6, 6);
    for (let i = -240; i < 30; i += 30) {
      const gl = new THREE.Mesh(lightGeo, greenMat);
      gl.position.set(-17, 0.1, i);
      this.scene.add(gl);

      const rl = new THREE.Mesh(lightGeo, redMat);
      rl.position.set(17, 0.1, i);
      this.scene.add(rl);
    }

    const grassMat = new THREE.MeshStandardMaterial({ color: 0x0a1a0a, roughness: 0.9 });
    const grassGeo = new THREE.PlaneGeometry(200, 400);
    const grassLeft = new THREE.Mesh(grassGeo, grassMat);
    grassLeft.rotation.x = -Math.PI / 2;
    grassLeft.position.set(-110, -0.01, -150);
    this.scene.add(grassLeft);

    const grassRight = new THREE.Mesh(grassGeo, grassMat);
    grassRight.rotation.x = -Math.PI / 2;
    grassRight.position.set(110, -0.01, -150);
    this.scene.add(grassRight);
  }

  private createStreetLights(): void {
    this.streetLightsGroup = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 6, 6);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffeebb });
    const bulbGeo = new THREE.SphereGeometry(0.25, 6, 6);

    for (let i = -200; i < 30; i += 40) {
      const poleLeft = new THREE.Mesh(poleGeo, poleMat);
      poleLeft.position.set(-22, 3, i);
      this.streetLightsGroup.add(poleLeft);

      const bulbLeft = new THREE.Mesh(bulbGeo, bulbMat);
      bulbLeft.position.set(-22, 6.1, i);
      this.streetLightsGroup.add(bulbLeft);

      const poleRight = new THREE.Mesh(poleGeo, poleMat);
      poleRight.position.set(22, 3, i);
      this.streetLightsGroup.add(poleRight);

      const bulbRight = new THREE.Mesh(bulbGeo, bulbMat);
      bulbRight.position.set(22, 6.1, i);
      this.streetLightsGroup.add(bulbRight);
    }

    this.scene.add(this.streetLightsGroup);
  }

  // ─── CITY (OPTIMIZADA) ───
  private createCityBuildings(): void {
    this.cityGroup = new THREE.Group();

    const buildingColors = [0x1e293b, 0x0f172a, 0x334155, 0x1a1a2e, 0x16213e];
    const windowColors = [0xfbae17, 0xffd700, 0xffaa00, 0xffeebb];

    // Reutilizar geometrías
    const winGeo = new THREE.PlaneGeometry(0.5, 0.7);

    for (let i = 0; i < 35; i++) {
      const height = Math.random() * 35 + 10;
      const width = Math.random() * 8 + 5;
      const depth = Math.random() * 8 + 5;

      const buildGeo = new THREE.BoxGeometry(width, height, depth);
      const buildMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.6,
        metalness: 0.2
      });

      const building = new THREE.Mesh(buildGeo, buildMat);
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (Math.random() * 45 + 30);
      const z = -Math.random() * 250 + 20;

      building.position.set(x, height / 2, z);
      building.castShadow = true;
      building.receiveShadow = true;
      this.cityGroup.add(building);

      // Ventanas solo en la cara lateral principal (menos draw calls)
      const floors = Math.floor(height / 3.5);
      const windowsPerFloor = Math.floor(width / 2);
      const winColor = windowColors[Math.floor(Math.random() * windowColors.length)];
      const winMat = new THREE.MeshBasicMaterial({ color: winColor });

      for (let f = 1; f < floors; f++) {
        for (let w = 0; w < windowsPerFloor; w++) {
          if (Math.random() > 0.45) {
            const win = new THREE.Mesh(winGeo, winMat);
            win.position.set(
              x + (side * -width) / 2 - 0.05,
              f * 3.5,
              z + (w - windowsPerFloor / 2) * 1.5
            );
            win.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
            this.cityGroup.add(win);
          }
        }
      }

      // Antenas en edificios altos
      if (height > 25 && Math.random() > 0.6) {
        const antH = Math.random() * 4 + 2;
        const antGeo = new THREE.CylinderGeometry(0.05, 0.08, antH, 5);
        const antMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8 });
        const antenna = new THREE.Mesh(antGeo, antMat);
        antenna.position.set(x, height + antH / 2, z);
        this.cityGroup.add(antenna);
      }
    }

    // Torres cilíndricas (menos cantidad)
    for (let i = 0; i < 8; i++) {
      const height = Math.random() * 30 + 12;
      const radius = Math.random() * 3 + 3;
      const towerGeo = new THREE.CylinderGeometry(radius, radius + 1, height, 12);
      const towerMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.floor(Math.random() * buildingColors.length)],
        roughness: 0.5,
        metalness: 0.3
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      const side = Math.random() > 0.5 ? 1 : -1;
      tower.position.set(side * (Math.random() * 40 + 35), height / 2, -Math.random() * 200 + 10);
      tower.castShadow = true;
      this.cityGroup.add(tower);
    }

    // Rascacielos emblemáticos
    for (let i = 0; i < 3; i++) {
      const height = Math.random() * 25 + 45;
      const w = Math.random() * 5 + 7;
      const skyGeo = new THREE.BoxGeometry(w, height, w);
      const skyMat = new THREE.MeshStandardMaterial({ color: 0x0a1628, roughness: 0.3, metalness: 0.7 });
      const skyscraper = new THREE.Mesh(skyGeo, skyMat);
      const side = Math.random() > 0.5 ? 1 : -1;
      skyscraper.position.set(side * (Math.random() * 35 + 40), height / 2, -Math.random() * 200 + 10);
      skyscraper.castShadow = true;
      this.cityGroup.add(skyscraper);

      const spireGeo = new THREE.ConeGeometry(0.8, 6, 6);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(skyscraper.position.x, height + 3, skyscraper.position.z);
      this.cityGroup.add(spire);
    }

    this.scene.add(this.cityGroup);
  }

  // ─── VAN ───
  private createDetailedVan(): void {
    this.vanGroup = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.8 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.1, transmission: 0.6, transparent: true });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const redLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    const bodyGeo = new THREE.BoxGeometry(2.4, 1.4, 4.5);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.1;
    body.castShadow = true;
    this.vanGroup.add(body);

    const cabinGeo = new THREE.BoxGeometry(2.35, 1.0, 2.0);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.8, 0.8);
    this.vanGroup.add(cabin);

    const headlightGeo = new THREE.BoxGeometry(0.4, 0.2, 0.1);
    this.vanGroup.add(this.makeMesh(headlightGeo, lightMat, -0.9, 1.1, 2.26));
    this.vanGroup.add(this.makeMesh(headlightGeo, lightMat, 0.9, 1.1, 2.26));
    this.vanGroup.add(this.makeMesh(headlightGeo, redLightMat, -0.9, 1.1, -2.26));
    this.vanGroup.add(this.makeMesh(headlightGeo, redLightMat, 0.9, 1.1, -2.26));

    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.35, 16);
    const rimGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.36, 10);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });

    const wheelPositions = [
      [-1.25, 0.45, 1.4], [1.25, 0.45, 1.4],
      [-1.25, 0.45, -1.4], [1.25, 0.45, -1.4]
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

  private makeMesh(geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number): THREE.Mesh {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  }

  // ─── AIRPLANE (OPTIMIZADO) ───
  private createDetailedCargoPlane(): void {
    this.airplaneGroup = new THREE.Group();
    this.airplaneLightsGroup = new THREE.Group();

    const fuselageMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.6 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3, metalness: 0.4 });
    const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const glassCockpitMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a, roughness: 0.05, metalness: 0.95, transmission: 0.8, transparent: true
    });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.5 });

    // Fuselaje
    const bodyGeo = new THREE.CylinderGeometry(1.6, 1.3, 14, 20);
    const body = new THREE.Mesh(bodyGeo, fuselageMat);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    this.airplaneGroup.add(body);

    const stripeGeo = new THREE.TorusGeometry(1.61, 0.04, 6, 32);
    const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe1.rotation.x = Math.PI / 2;
    stripe1.position.z = 2;
    this.airplaneGroup.add(stripe1);

    const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
    stripe2.rotation.x = Math.PI / 2;
    stripe2.position.z = -2;
    this.airplaneGroup.add(stripe2);

    // Nariz
    const noseGeo = new THREE.ConeGeometry(1.5, 3.5, 20);
    const nose = new THREE.Mesh(noseGeo, fuselageMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.set(0, 0, 8.75);
    this.airplaneGroup.add(nose);

    const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), darkMetalMat);
    noseTip.position.set(0, 0, 10.5);
    this.airplaneGroup.add(noseTip);

    // Cabina
    const cockpitGeo = new THREE.SphereGeometry(1.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const cockpitWindow = new THREE.Mesh(cockpitGeo, glassCockpitMat);
    cockpitWindow.rotation.x = -Math.PI / 2.2;
    cockpitWindow.position.set(0, 0.15, 7.0);
    this.airplaneGroup.add(cockpitWindow);

    const frameGeo = new THREE.BoxGeometry(0.08, 0.8, 0.7);
    this.airplaneGroup.add(this.makeMesh(frameGeo, darkMetalMat, 0, 1.3, 7.3));
    this.airplaneGroup.add(this.makeMesh(frameGeo, darkMetalMat, -0.7, 1.2, 7.2).rotateZ(0.15));
    this.airplaneGroup.add(this.makeMesh(frameGeo, darkMetalMat, 0.7, 1.2, 7.2).rotateZ(-0.15));

    // Faros
    const lightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12);
    this.airplaneGroup.add(this.makeMesh(lightGeo, headlightMat, -0.6, -0.5, 9.2).rotateX(Math.PI / 2));
    this.airplaneGroup.add(this.makeMesh(lightGeo, headlightMat, 0.6, -0.5, 9.2).rotateX(Math.PI / 2));

    // Conos de luz (simplificados)
    const coneGeo = new THREE.ConeGeometry(0.5, 3, 8, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    this.airplaneGroup.add(this.makeMesh(coneGeo, coneMat, -0.6, -0.5, 10.8).rotateX(-Math.PI / 2));
    this.airplaneGroup.add(this.makeMesh(coneGeo, coneMat, 0.6, -0.5, 10.8).rotateX(-Math.PI / 2));

    // Alas simplificadas
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(10, -2.5);
    wingShape.lineTo(9.5, -4.5);
    wingShape.lineTo(0, -1.8);
    wingShape.closePath();

    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.25, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.05, bevelThickness: 0.05
    });

    const wingLeft = new THREE.Mesh(wingGeo, fuselageMat);
    wingLeft.rotation.x = Math.PI / 2;
    wingLeft.position.set(0, 0.2, 1);
    wingLeft.castShadow = true;

    const wingRight = new THREE.Mesh(wingGeo, fuselageMat);
    wingRight.rotation.x = Math.PI / 2;
    wingRight.rotation.y = Math.PI;
    wingRight.position.set(0, 0.2, -1);
    wingRight.castShadow = true;

    this.airplaneGroup.add(wingLeft, wingRight);

    const wingletGeo = new THREE.BoxGeometry(0.15, 1.5, 1.8);
    this.airplaneGroup.add(this.makeMesh(wingletGeo, accentMat, -9.8, 0.9, -2.2).rotateZ(-0.15));
    this.airplaneGroup.add(this.makeMesh(wingletGeo, accentMat, 9.8, 0.9, -2.2).rotateZ(0.15));

    // Luces de navegación
    const navLightGeo = new THREE.SphereGeometry(0.12, 6, 6);
    this.airplaneGroup.add(this.makeMesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }), -9.8, 0.5, -2.5));
    this.airplaneGroup.add(this.makeMesh(navLightGeo, new THREE.MeshBasicMaterial({ color: 0x00ff00 }), 9.8, 0.5, -2.5));

    // Motores
    const createEngine = (xPos: number) => {
      const engineGroup = new THREE.Group();
      const outerGeo = new THREE.CylinderGeometry(0.7, 0.6, 3.2, 16);
      const outer = new THREE.Mesh(outerGeo, fuselageMat);
      outer.rotation.x = Math.PI / 2;

      const ringGeo = new THREE.TorusGeometry(0.72, 0.04, 6, 24);
      const ring = new THREE.Mesh(ringGeo, accentMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.z = 1.4;

      const coreGeo = new THREE.CylinderGeometry(0.35, 0.35, 3.25, 12);
      const core = new THREE.Mesh(coreGeo, darkMetalMat);
      core.rotation.x = Math.PI / 2;

      const glowGeo = new THREE.CircleGeometry(0.45, 12);
      const glow = new THREE.Mesh(glowGeo, this.engineGlowMat);
      glow.position.set(0, 0, -1.63);

      const heatRingGeo = new THREE.TorusGeometry(0.5, 0.03, 6, 16);
      const heatRing = new THREE.Mesh(heatRingGeo, this.heatRingMat);
      heatRing.rotation.x = Math.PI / 2;
      heatRing.position.z = -1.6;

      engineGroup.add(outer, ring, core, glow, heatRing);
      engineGroup.position.set(xPos, -0.8, 0.5);
      return engineGroup;
    };

    this.airplaneGroup.add(createEngine(-4.5));
    this.airplaneGroup.add(createEngine(4.5));

    // Cola
    const tailVertical = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4.2, 3.0), accentMat);
    tailVertical.position.set(0, 2.8, -5.8);
    tailVertical.rotation.x = -0.25;

    const rudder = new THREE.Mesh(new THREE.BoxGeometry(0.1, 3.5, 2.2), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.6 }));
    rudder.position.set(0, 2.8, -5.5);
    rudder.rotation.x = -0.25;

    const tailHorizontal = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.18, 2.0), fuselageMat);
    tailHorizontal.position.set(0, 0.9, -6.2);

    const elevatorGeo = new THREE.BoxGeometry(2.5, 0.12, 1.8);
    this.airplaneGroup.add(tailVertical, rudder, tailHorizontal,
      this.makeMesh(elevatorGeo, darkMetalMat, -2.2, 0.9, -6.1),
      this.makeMesh(elevatorGeo, darkMetalMat, 2.2, 0.9, -6.1)
    );

    // Tren de aterrizaje
    const createLandingGear = (xPos: number, zPos: number) => {
      const gearGroup = new THREE.Group();
      const strutMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), strutMat);
      strut.position.y = -0.6;

      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12), wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.y = -1.2;

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.22, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -1.2;

      gearGroup.add(strut, wheel, rim);
      gearGroup.position.set(xPos, -0.8, zPos);
      return gearGroup;
    };

    this.airplaneGroup.add(createLandingGear(-1.5, 1.5));
    this.airplaneGroup.add(createLandingGear(1.5, 1.5));

    const noseGearGroup = new THREE.Group();
    const noseStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 6), new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 }));
    noseStrut.position.y = -0.5;
    const noseWheel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.15, 8), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 }));
    noseWheel.rotation.x = Math.PI / 2;
    noseWheel.position.y = -1.0;
    noseGearGroup.add(noseStrut, noseWheel);
    noseGearGroup.position.set(0, -0.5, 7.5);
    this.airplaneGroup.add(noseGearGroup);

    // Puerta de carga
    this.airplaneGroup.add(this.makeMesh(new THREE.BoxGeometry(1.8, 1.5, 0.08), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.5 }), 0, 0.5, -7.05));
    this.airplaneGroup.add(this.makeMesh(new THREE.BoxGeometry(2.0, 1.7, 0.06), darkMetalMat, 0, 0.5, -7.08));

    // Antenas
    const antGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5);
    this.airplaneGroup.add(this.makeMesh(antGeo, darkMetalMat, 0, 2.0, -3));
    this.airplaneGroup.add(this.makeMesh(antGeo, darkMetalMat, 0.5, 1.9, -2).rotateZ(0.3));

    // Luces estroboscópicas
    const strobeGeo = new THREE.SphereGeometry(0.1, 6, 6);
    this.airplaneLightsGroup.add(this.makeMesh(strobeGeo, this.strobeOffMat, 0, 1.7, -2));
    this.airplaneLightsGroup.add(this.makeMesh(strobeGeo, this.strobeOffMat, 0, -1.2, -2));
    this.airplaneLightsGroup.add(this.makeMesh(strobeGeo, this.strobeOffMat, -8, 0.3, 0));
    this.airplaneLightsGroup.add(this.makeMesh(strobeGeo, this.strobeOffMat, 8, 0.3, 0));

    this.airplaneGroup.add(this.airplaneLightsGroup);
    this.airplaneGroup.position.set(4, 1.6, -25);
    this.scene.add(this.airplaneGroup);
  }

  private createEngineParticles(): void {
    const createParticleSystem = (xPos: number) => {
      const particleCount = 50;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
        positions[i * 3 + 2] = -1.5 - Math.random() * 3;
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1.0;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.12, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
      });

      const particles = new THREE.Points(geometry, material);
      particles.position.set(xPos, -0.8, 0.5);
      this.airplaneGroup.add(particles);
      this.engineParticles.push(particles);
    };

    createParticleSystem(-4.5);
    createParticleSystem(4.5);
  }

  private createCargo(): void {
    this.cargoGroup = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }));
    box.castShadow = true;
    this.cargoGroup.add(box);
    this.cargoGroup.position.set(-3, 1, 12);
    this.cargoGroup.visible = false;
    this.scene.add(this.cargoGroup);
  }

  // ─── CLOUDS ───
  private createClouds(): void {
    this.cloudsGroup = new THREE.Group();

    // Materiales reutilizables
    const cloudMatNear = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.35,
      flatShading: true,
      depthWrite: false
    });

    const cloudMatMid = new THREE.MeshStandardMaterial({
      color: 0xbfdbfe,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.45,
      flatShading: true,
      depthWrite: false
    });

    const cloudMatFar = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.25,
      flatShading: true,
      depthWrite: false
    });

    // === CAPA 1: Nubes DEBAJO del avión (Y = 18-28) ===
    for (let c = 0; c < 20; c++) {
      const cluster = new THREE.Group();
      const blobs = Math.floor(Math.random() * 4) + 2;
      for (let b = 0; b < blobs; b++) {
        const r = Math.random() * 3 + 2;
        const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), cloudMatMid);
        blob.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5);
        blob.scale.set(1.2, 0.45, 1.1);
        cluster.add(blob);
      }
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 40 + 8;
      cluster.position.set(Math.cos(angle) * dist, Math.random() * 10 + 18, Math.sin(angle) * dist);
      this.cloudsGroup.add(cluster);
    }

    // === CAPA 2: Nubes ALREDEDOR del avión (Y = 28-36) — más pequeñas y transparentes ===
    for (let c = 0; c < 18; c++) {
      const cluster = new THREE.Group();
      const blobs = Math.floor(Math.random() * 3) + 2;
      for (let b = 0; b < blobs; b++) {
        const r = Math.random() * 2 + 1;
        const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), cloudMatNear);
        blob.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 3);
        blob.scale.set(1, 0.4, 0.9);
        cluster.add(blob);
      }
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 35 + 12;
      cluster.position.set(Math.cos(angle) * dist, Math.random() * 8 + 28, Math.sin(angle) * dist);
      this.cloudsGroup.add(cluster);
    }

    // === CAPA 3: Nubes ENCIMA del avión (Y = 36-48) ===
    for (let c = 0; c < 15; c++) {
      const cluster = new THREE.Group();
      const blobs = Math.floor(Math.random() * 4) + 2;
      for (let b = 0; b < blobs; b++) {
        const r = Math.random() * 3.5 + 2;
        const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), cloudMatMid);
        blob.position.set((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5);
        blob.scale.set(1.3, 0.5, 1.2);
        cluster.add(blob);
      }
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 45 + 10;
      cluster.position.set(Math.cos(angle) * dist, Math.random() * 12 + 36, Math.sin(angle) * dist);
      this.cloudsGroup.add(cluster);
    }

    // === CAPA 4: Nubes de FONDO lejanas ===
    for (let c = 0; c < 12; c++) {
      const cluster = new THREE.Group();
      const blobs = Math.floor(Math.random() * 3) + 2;
      for (let b = 0; b < blobs; b++) {
        const r = Math.random() * 5 + 3;
        const blob = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), cloudMatFar);
        blob.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 8);
        blob.scale.set(1.4, 0.55, 1.3);
        cluster.add(blob);
      }
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 70 + 55;
      cluster.position.set(Math.cos(angle) * dist, Math.random() * 25 + 15, Math.sin(angle) * dist);
      this.cloudsGroup.add(cluster);
    }

    this.cloudsGroup.visible = false;
    this.scene.add(this.cloudsGroup);
  }

  // ─── DELIVERY TRUCK ───
  private createDeliveryTruck(): void {
    this.truckGroup = new THREE.Group();
    this.truckWheels = [];

    const cabMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3, metalness: 0.6 });
    const containerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4, metalness: 0.1 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x1e293b, transmission: 0.7, transparent: true, roughness: 0.1 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    // Cabina
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.9, 2.6), cabMat);
    cab.position.set(0, 1.45, 2.2);
    cab.castShadow = true;
    this.truckGroup.add(cab);

    // Parabrisas
    const windshield = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.1), glassMat);
    windshield.position.set(0, 1.85, 3.51);
    this.truckGroup.add(windshield);

    // Ventanas laterales
    const sideWinGeo = new THREE.PlaneGeometry(1.0, 0.8);
    const swl = new THREE.Mesh(sideWinGeo, glassMat);
    swl.position.set(-1.21, 1.8, 2.2);
    swl.rotation.y = -Math.PI / 2;
    this.truckGroup.add(swl);

    const swr = new THREE.Mesh(sideWinGeo, glassMat);
    swr.position.set(1.21, 1.8, 2.2);
    swr.rotation.y = Math.PI / 2;
    this.truckGroup.add(swr);

    // Contenedor
    const container = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.4, 5.5), containerMat);
    container.position.set(0, 1.7, -2.5);
    container.castShadow = true;
    this.truckGroup.add(container);

    // Franja
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.35, 5.52), stripeMat);
    stripe.position.set(0, 2.1, -2.5);
    this.truckGroup.add(stripe);

    // Puertas traseras
    const backDoor = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 0.08), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5, metalness: 0.3 }));
    backDoor.position.set(0, 1.7, -5.29);
    this.truckGroup.add(backDoor);

    // Ruedas
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 14);
    const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.47, 10);
    const wheelPositions = [
      [-1.4, 0.55, 2.3], [1.4, 0.55, 2.3],
      [-1.4, 0.55, -0.8], [1.4, 0.55, -0.8],
      [-1.4, 0.55, -4.0], [1.4, 0.55, -4.0]
    ];

    wheelPositions.forEach(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, darkMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheel.rotation.z = Math.PI / 2;
      rim.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      rim.position.set(x, y, z);
      wheel.castShadow = true;
      this.truckGroup.add(wheel, rim);
      this.truckWheels.push(wheel);
    });

    // Faros
    const headGeo = new THREE.BoxGeometry(0.35, 0.25, 0.12);
    this.truckGroup.add(this.makeMesh(headGeo, headlightMat, -0.8, 1.2, 3.52));
    this.truckGroup.add(this.makeMesh(headGeo, headlightMat, 0.8, 1.2, 3.52));

    // Conos de luz
    const coneGeo = new THREE.ConeGeometry(0.6, 4, 8, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.06, side: THREE.DoubleSide });
    this.truckGroup.add(this.makeMesh(coneGeo, coneMat, -0.8, 1.2, 5.6).rotateX(-Math.PI / 2));
    this.truckGroup.add(this.makeMesh(coneGeo, coneMat, 0.8, 1.2, 5.6).rotateX(-Math.PI / 2));

    // Luces traseras
    const tailGeo = new THREE.BoxGeometry(0.35, 0.25, 0.12);
    this.truckGroup.add(this.makeMesh(tailGeo, taillightMat, -0.8, 1.2, -5.3));
    this.truckGroup.add(this.makeMesh(tailGeo, taillightMat, 0.8, 1.2, -5.3));

    // Defensa
    this.truckGroup.add(this.makeMesh(new THREE.BoxGeometry(2.6, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 }), 0, 0.5, -5.4));

    // Escapes
    const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    this.truckGroup.add(this.makeMesh(exhaustGeo, exhaustMat, -1.35, 0.6, -5.2).rotateZ(Math.PI / 2));
    this.truckGroup.add(this.makeMesh(exhaustGeo, exhaustMat, 1.35, 0.6, -5.2).rotateZ(Math.PI / 2));

    this.truckGroup.position.set(-4, 0, 15);
    this.truckGroup.visible = false;
    this.scene.add(this.truckGroup);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    gsap.globalTimeline.clear();
  }
}