// 漢字宇宙 - Kanji Cosmos 3D Visualizer
// Inspired by ancient iPhone kanji apps with floating kanji in space

class KanjiCosmos {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.kanjiData = [];
        this.kanjiMeshes = [];
        this.connectionLines = [];
        this.particles = [];
        this.currentUniverse = 'water';
        this.displayMode = 'kanji';
        this.autoRotate = false;
        this.tooltip = document.getElementById('kanjiTooltip');
        this.cosmosTitle = document.getElementById('cosmosTitle');

        this.init();
        this.loadKanjiData();
        this.createParticleField();
        this.animate();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 50);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('kanjiCosmos').appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.enablePan = true;
        this.controls.autoRotate = false;
        this.controls.autoRotateSpeed = 0.5;

        // Lighting
        this.setupLighting();

        // Event listeners
        this.setupEventListeners();

        // Title animation
        setTimeout(() => {
            this.cosmosTitle.classList.add('show');
            setTimeout(() => {
                this.cosmosTitle.classList.remove('show');
            }, 3000);
        }, 1000);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);

        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x0088ff, 1, 100);
        pointLight1.position.set(30, 30, 30);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xff4444, 1, 100);
        pointLight2.position.set(-30, -30, -30);
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x44ff44, 0.5, 100);
        pointLight3.position.set(0, 50, 0);
        this.scene.add(pointLight3);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());

        // Mouse events for tooltips
        this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
        this.renderer.domElement.addEventListener('mouseleave', () => this.hideTooltip());

        // Touch events for mobile
        this.renderer.domElement.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.renderer.domElement.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.renderer.domElement.addEventListener('touchend', () => this.hideTooltip());
    }

    async loadKanjiData() {
        try {
            console.log('Loading kanji data...');
            const response = await fetch('/api/kanji/all?limit=500'); // Load first 500 kanji
            const data = await response.json();

            if (data.success) {
                this.kanjiData = data.kanji;
                console.log(`Loaded ${this.kanjiData.length} kanji`);
                this.createUniverse(this.currentUniverse);
                this.updateStats();
            }
        } catch (error) {
            console.error('Failed to load kanji data:', error);
            // Fallback to sample data
            this.createFallbackUniverse();
        }
    }

    createUniverse(universe) {
        this.currentUniverse = universe;
        this.clearScene();

        switch(universe) {
            case 'water':
                this.createWaterUniverse();
                break;
            case 'fire':
                this.createFireUniverse();
                break;
            case 'earth':
                this.createEarthUniverse();
                break;
            case 'wind':
                this.createWindUniverse();
                break;
            case 'radical':
                this.createRadicalUniverse();
                break;
            case 'emotion':
                this.createEmotionUniverse();
                break;
        }

        this.updateStats();
    }

    createFallbackUniverse() {
        console.log('Creating fallback universe...');
        // Create a beautiful fallback with some sample kanji
        const sampleKanji = [
            { kanji: '日', meanings: ['sun', 'day'], categories: ['time'] },
            { kanji: '月', meanings: ['moon', 'month'], categories: ['time'] },
            { kanji: '水', meanings: ['water'], categories: ['water'] },
            { kanji: '火', meanings: ['fire'], categories: ['fire'] },
            { kanji: '土', meanings: ['earth', 'ground'], categories: ['earth'] },
            { kanji: '風', meanings: ['wind'], categories: ['wind'] },
            { kanji: '心', meanings: ['heart', 'mind'], categories: ['emotion'] },
            { kanji: '愛', meanings: ['love'], categories: ['emotion'] },
            { kanji: '山', meanings: ['mountain'], categories: ['earth'] },
            { kanji: '川', meanings: ['river'], categories: ['water'] },
            { kanji: '木', meanings: ['tree'], categories: ['plant'] },
            { kanji: '花', meanings: ['flower'], categories: ['plant'] }
        ];

        this.createSemanticUniverse(sampleKanji, '宇宙', 0xFFD700);
    }

    createWaterUniverse() {
        if (this.kanjiData.length === 0) {
            this.createFallbackUniverse();
            return;
        }

        const waterKanji = this.kanjiData.filter(k =>
            k.categories && k.categories.some(cat =>
                ['water', 'sea', 'ocean', 'river', 'rain', 'ice', 'liquid'].includes(cat)
            )
        ).slice(0, 50); // Limit for performance

        if (waterKanji.length === 0) {
            // Fallback water-related kanji
            const waterTerms = ['水', '海', '川', '雨', '氷', '池', '泉', '波', '湖', '河', '洋', '湾', '潮', '泡', '湿'];
            const fallbackKanji = this.kanjiData.filter(k => waterTerms.includes(k.kanji)).slice(0, 30);
            this.createSemanticUniverse(fallbackKanji, '水', 0x0088ff);
        } else {
            this.createSemanticUniverse(waterKanji, '水', 0x0088ff);
        }
    }

    createFireUniverse() {
        const fireKanji = this.kanjiData.filter(k =>
            k.categories && k.categories.some(cat =>
                ['fire', 'heat', 'burn', 'flame', 'light'].includes(cat)
            )
        ).slice(0, 50);

        if (fireKanji.length === 0) {
            const fireTerms = ['火', '炎', '燃', '熱', '灯', '焼', '炊', '炉', '炭', '煙', '燭', '焔', '焦'];
            const fallbackKanji = this.kanjiData.filter(k => fireTerms.includes(k.kanji)).slice(0, 30);
            this.createSemanticUniverse(fallbackKanji, '火', 0xff4444);
        } else {
            this.createSemanticUniverse(fireKanji, '火', 0xff4444);
        }
    }

    createEarthUniverse() {
        const earthKanji = this.kanjiData.filter(k =>
            k.categories && k.categories.some(cat =>
                ['earth', 'ground', 'mountain', 'stone', 'soil', 'plant'].includes(cat)
            )
        ).slice(0, 50);

        if (earthKanji.length === 0) {
            const earthTerms = ['土', '地', '山', '石', '岩', '砂', '泥', '丘', '谷', '崖', '島', '陸'];
            const fallbackKanji = this.kanjiData.filter(k => earthTerms.includes(k.kanji)).slice(0, 30);
            this.createSemanticUniverse(fallbackKanji, '土', 0x8B4513);
        } else {
            this.createSemanticUniverse(earthKanji, '土', 0x8B4513);
        }
    }

    createWindUniverse() {
        const windKanji = this.kanjiData.filter(k =>
            k.categories && k.categories.some(cat =>
                ['wind', 'air', 'breathe', 'fly', 'sky'].includes(cat)
            )
        ).slice(0, 50);

        if (windKanji.length === 0) {
            const windTerms = ['風', '空', '飛', '鳥', '雲', '天', '気', '息', '吹', '翔', '翼', '飄'];
            const fallbackKanji = this.kanjiData.filter(k => windTerms.includes(k.kanji)).slice(0, 30);
            this.createSemanticUniverse(fallbackKanji, '風', 0x87CEEB);
        } else {
            this.createSemanticUniverse(windKanji, '風', 0x87CEEB);
        }
    }

    createRadicalUniverse() {
        // Group kanji by radical
        const radicalGroups = {};
        this.kanjiData.slice(0, 100).forEach(kanji => {
            const radical = kanji.radical || 'unknown';
            if (!radicalGroups[radical]) {
                radicalGroups[radical] = [];
            }
            radicalGroups[radical].push(kanji);
        });

        this.createGroupedUniverse(radicalGroups, 0xFFD700);
    }

    createEmotionUniverse() {
        const emotionKanji = this.kanjiData.filter(k =>
            k.categories && k.categories.some(cat =>
                ['emotion', 'feeling', 'heart', 'mind', 'love', 'happy', 'sad'].includes(cat)
            )
        ).slice(0, 50);

        if (emotionKanji.length === 0) {
            const emotionTerms = ['心', '愛', '喜', '悲', '怒', '恐', '楽', '苦', '思', '感', '情', '念'];
            const fallbackKanji = this.kanjiData.filter(k => emotionTerms.includes(k.kanji)).slice(0, 30);
            this.createSemanticUniverse(fallbackKanji, '心', 0xFF69B4);
        } else {
            this.createSemanticUniverse(emotionKanji, '心', 0xFF69B4);
        }
    }

    createSemanticUniverse(kanjiList, centerKanji, color) {
        // Create central hub
        this.createKanjiNode(centerKanji, 0, 0, 0, color, 2.0, true);

        // Create orbiting kanji
        const radius = 15;
        const angleStep = (Math.PI * 2) / kanjiList.length;

        kanjiList.forEach((kanji, index) => {
            const angle = index * angleStep;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (Math.random() - 0.5) * 10;

            this.createKanjiNode(kanji.kanji, x, y, z, color, 1.0, false, kanji);

            // Create connection line to center
            this.createConnection(0, 0, 0, x, y, z, color);
        });
    }

    createGroupedUniverse(groups, color) {
        const groupKeys = Object.keys(groups);
        const radius = 20;
        const groupAngleStep = (Math.PI * 2) / groupKeys.length;

        groupKeys.forEach((groupKey, groupIndex) => {
            const groupAngle = groupIndex * groupAngleStep;
            const groupX = Math.cos(groupAngle) * radius;
            const groupZ = Math.sin(groupAngle) * radius;

            // Create group center
            this.createKanjiNode(groupKey, groupX, 0, groupZ, color, 1.5, true);

            // Create kanji in this group
            const groupKanji = groups[groupKey].slice(0, 8); // Limit per group
            const kanjiRadius = 5;
            const kanjiAngleStep = (Math.PI * 2) / groupKanji.length;

            groupKanji.forEach((kanji, kanjiIndex) => {
                const kanjiAngle = kanjiIndex * kanjiAngleStep;
                const kanjiX = groupX + Math.cos(kanjiAngle) * kanjiRadius;
                const kanjiZ = groupZ + Math.sin(kanjiAngle) * kanjiRadius;
                const kanjiY = (Math.random() - 0.5) * 4;

                this.createKanjiNode(kanji.kanji, kanjiX, kanjiY, kanjiZ, color, 0.8, false, kanji);

                // Connect to group center
                this.createConnection(groupX, 0, groupZ, kanjiX, kanjiY, kanjiZ, color);
            });
        });
    }

    createKanjiNode(kanji, x, y, z, color, scale = 1.0, isHub = false, kanjiData = null) {
        // Create 3D text geometry for kanji
        const loader = new THREE.FontLoader();

        // For now, create a simple plane with kanji texture
        const geometry = new THREE.PlaneGeometry(scale, scale);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData = { kanji, kanjiData, isHub };

        // Add glow effect for hubs
        if (isHub) {
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.3
            });
            const glowGeometry = new THREE.RingGeometry(scale * 0.8, scale * 1.2, 32);
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            glowMesh.position.set(x, y, z);
            this.scene.add(glowMesh);
        }

        this.scene.add(mesh);
        this.kanjiMeshes.push(mesh);

        // Add floating animation
        if (!isHub) {
            mesh.userData.originalY = y;
            mesh.userData.floatSpeed = Math.random() * 0.02 + 0.01;
            mesh.userData.floatAmplitude = Math.random() * 2 + 1;
        }
    }

    createConnection(x1, y1, z1, x2, y2, z2, color) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            x1, y1, z1,
            x2, y2, z2
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4
        });

        const line = new THREE.Line(geometry, material);
        this.scene.add(line);
        this.connectionLines.push(line);
    }

    createParticleField() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 1000;
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x444444,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(particles);
        this.particles.push(particles);
    }

    clearScene() {
        // Remove all kanji meshes
        this.kanjiMeshes.forEach(mesh => {
            this.scene.remove(mesh);
        });
        this.kanjiMeshes = [];

        // Remove connection lines
        this.connectionLines.forEach(line => {
            this.scene.remove(line);
        });
        this.connectionLines = [];
    }

    updateStats() {
        document.getElementById('kanjiCount').textContent = this.kanjiMeshes.length;
        document.getElementById('connectionCount').textContent = this.connectionLines.length;
        document.getElementById('currentUniverse').textContent = this.currentUniverse;
    }

    onMouseMove(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.kanjiMeshes);

        if (intersects.length > 0) {
            const intersected = intersects[0].object;
            this.showTooltip(intersected, event.clientX, event.clientY);
        } else {
            this.hideTooltip();
        }
    }

    onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.kanjiMeshes);

            if (intersects.length > 0) {
                const intersected = intersects[0].object;
                this.showTooltip(intersected, touch.clientX, touch.clientY);
            }
        }
    }

    onTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    showTooltip(mesh, x, y) {
        const kanji = mesh.userData.kanji;
        const kanjiData = mesh.userData.kanjiData;

        document.getElementById('tooltipKanji').textContent = kanji;

        let info = '';
        if (kanjiData) {
            info += `Strokes: ${kanjiData.strokes || 'N/A'}\n`;
            info += `Grade: ${kanjiData.grade || 'N/A'}\n`;
            if (kanjiData.meanings && kanjiData.meanings.length > 0) {
                info += `Meaning: ${kanjiData.meanings.slice(0, 2).join(', ')}\n`;
            }
            if (kanjiData.categories && kanjiData.categories.length > 0) {
                info += `Categories: ${kanjiData.categories.join(', ')}`;
            }
        }

        document.getElementById('tooltipInfo').textContent = info;

        this.tooltip.style.left = (x + 10) + 'px';
        this.tooltip.style.top = (y - 10) + 'px';
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update controls
        this.controls.update();

        // Animate floating kanji
        const time = Date.now() * 0.001;
        this.kanjiMeshes.forEach(mesh => {
            if (mesh.userData.originalY !== undefined) {
                mesh.position.y = mesh.userData.originalY +
                    Math.sin(time * mesh.userData.floatSpeed) * mesh.userData.floatAmplitude;
            }

            // Rotate hubs slowly
            if (mesh.userData.isHub) {
                mesh.rotation.z += 0.005;
            }
        });

        // Animate particles
        this.particles.forEach(particles => {
            particles.rotation.x += 0.001;
            particles.rotation.y += 0.001;
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Global functions for UI
function changeUniverse() {
    const universe = document.getElementById('universeSelect').value;
    if (window.kanjiCosmos) {
        window.kanjiCosmos.createUniverse(universe);
    }
}

function changeDisplayMode() {
    const mode = document.getElementById('displayMode').value;
    if (window.kanjiCosmos) {
        window.kanjiCosmos.displayMode = mode;
        // Implement display mode changes
    }
}

function resetCamera() {
    if (window.kanjiCosmos) {
        window.kanjiCosmos.camera.position.set(0, 0, 50);
        window.kanjiCosmos.controls.reset();
    }
}

function toggleAutoRotate() {
    if (window.kanjiCosmos) {
        window.kanjiCosmos.autoRotate = !window.kanjiCosmos.autoRotate;
        window.kanjiCosmos.controls.autoRotate = window.kanjiCosmos.autoRotate;
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    window.kanjiCosmos = new KanjiCosmos();
});