class JigsawPuzzle {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pieces = [];
        this.selectedPiece = null;
        this.dragOffset = new THREE.Vector3();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.originalImage = null;
        this.puzzleSize = 3; // 3x3 by default
        this.pieceSize = 1;
        this.isDragging = false;
        this.completedPieces = 0;
        this.totalPieces = 0;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
        this.camera.position.set(0, 8, 8);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        const canvas = document.getElementById('jigsawCanvas');
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(800, 600);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Controls setup
        this.controls = new THREE.OrbitControls(this.camera, canvas);
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 20;

        // Lighting
        this.setupLighting();

        // Ground plane
        this.createGroundPlane();

        // Animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light for dramatic effect
        const pointLight = new THREE.PointLight(0xffd700, 0.5);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    createGroundPlane() {
        // Create a more visible ground plane with grid pattern
        const geometry = new THREE.PlaneGeometry(20, 20, 40, 40);

        // Create a grid texture programmatically
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Fill with base color
        ctx.fillStyle = '#1a1a3a';
        ctx.fillRect(0, 0, 512, 512);

        // Draw grid lines
        ctx.strokeStyle = '#3a3a6a';
        ctx.lineWidth = 2;

        // Vertical lines
        for (let x = 0; x <= 512; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 512);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();
        }

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);

        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7
        });

        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.receiveShadow = true;
        this.scene.add(plane);

        // Add a subtle border ring around the playing area
        const ringGeometry = new THREE.RingGeometry(9.5, 10, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.01; // Slightly above the ground plane
        this.scene.add(ring);
    }

    setupEventListeners() {
        const canvas = document.getElementById('jigsawCanvas');

        // Mouse events
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

        // Touch events for mobile
        canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Image upload
        document.getElementById('imageInput').addEventListener('change', this.onImageUpload.bind(this));

        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.puzzleSize = Math.sqrt(parseInt(e.target.dataset.pieces));
                this.updateCreateButton();
            });
        });

        // Control buttons
        document.getElementById('createPuzzleBtn').addEventListener('click', this.createPuzzle.bind(this));
        document.getElementById('shuffleBtn').addEventListener('click', this.shufflePieces.bind(this));
        document.getElementById('hintBtn').addEventListener('click', this.showHint.bind(this));
        document.getElementById('resetBtn').addEventListener('click', this.resetPuzzle.bind(this));
        document.getElementById('newPuzzleBtn').addEventListener('click', this.newPuzzle.bind(this));

        // Window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.originalImage = new Image();
                this.originalImage.onload = () => {
                    this.updateCreateButton();
                };
                this.originalImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    updateCreateButton() {
        const btn = document.getElementById('createPuzzleBtn');
        btn.disabled = !this.originalImage;
        if (this.originalImage) {
            btn.innerHTML = `🎨 Create ${this.puzzleSize}×${this.puzzleSize} Puzzle`;
        }
    }

    createPuzzle() {
        if (!this.originalImage) return;

        this.clearPuzzle();
        this.totalPieces = this.puzzleSize * this.puzzleSize;
        this.completedPieces = 0;

        const pieceWidth = this.originalImage.width / this.puzzleSize;
        const pieceHeight = this.originalImage.height / this.puzzleSize;

        // Create canvas for piece generation
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        for (let row = 0; row < this.puzzleSize; row++) {
            for (let col = 0; col < this.puzzleSize; col++) {
                // Create piece texture
                canvas.width = pieceWidth;
                canvas.height = pieceHeight;
                ctx.drawImage(
                    this.originalImage,
                    col * pieceWidth, row * pieceHeight,
                    pieceWidth, pieceHeight,
                    0, 0,
                    pieceWidth, pieceHeight
                );

                const texture = new THREE.CanvasTexture(canvas);
                texture.needsUpdate = true;

                // Create 3D piece
                this.createJigsawPiece(texture, col, row);
            }
        }

        this.shufflePieces();
        this.updateUI();
    }

    createJigsawPiece(texture, col, row) {
        // Create geometry with irregular edges for jigsaw effect
        const geometry = this.createJigsawGeometry();

        // Create material
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: false
        });

        // Create mesh
        const piece = new THREE.Mesh(geometry, material);
        piece.castShadow = true;
        piece.receiveShadow = true;

        // Store original position data
        piece.userData = {
            originalCol: col,
            originalRow: row,
            correctPosition: new THREE.Vector3(
                (col - this.puzzleSize / 2 + 0.5) * this.pieceSize,
                0.1,
                (row - this.puzzleSize / 2 + 0.5) * this.pieceSize
            ),
            isPlaced: false
        };

        // Random initial position
        piece.position.set(
            (Math.random() - 0.5) * 10,
            Math.random() * 2 + 0.5,
            (Math.random() - 0.5) * 10
        );

        // Random rotation
        piece.rotation.y = Math.random() * Math.PI * 2;

        this.pieces.push(piece);
        this.scene.add(piece);
    }

    createJigsawGeometry() {
        // Create a simple box geometry with some edge variation
        const geometry = new THREE.BoxGeometry(
            this.pieceSize * 0.9,
            0.1,
            this.pieceSize * 0.9
        );

        // Add some irregularity to the edges (simplified jigsaw effect)
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const z = positions[i + 2];

            // Add small random variations to edges
            if (Math.abs(x) > this.pieceSize * 0.4 || Math.abs(z) > this.pieceSize * 0.4) {
                positions[i] += (Math.random() - 0.5) * 0.05;
                positions[i + 2] += (Math.random() - 0.5) * 0.05;
            }
        }

        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        return geometry;
    }

    shufflePieces() {
        this.pieces.forEach(piece => {
            piece.position.set(
                (Math.random() - 0.5) * 8,
                Math.random() * 1.5 + 0.5,
                (Math.random() - 0.5) * 8
            );
            piece.rotation.y = Math.random() * Math.PI * 2;
            piece.userData.isPlaced = false;
        });
        this.completedPieces = 0;
        this.updateUI();
    }

    showHint() {
        // Find an unplaced piece and highlight its correct position
        const unplacedPieces = this.pieces.filter(p => !p.userData.isPlaced);
        if (unplacedPieces.length > 0) {
            const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];

            // Create a glowing indicator at the correct position
            this.showPositionHint(randomPiece.userData.correctPosition);
        }
    }

    showPositionHint(position) {
        // Create a temporary glowing sphere
        const geometry = new THREE.SphereGeometry(0.2, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.7
        });
        const hint = new THREE.Mesh(geometry, material);
        hint.position.copy(position);
        hint.position.y += 0.5;
        this.scene.add(hint);

        // Animate and remove after 3 seconds
        let opacity = 1;
        const animate = () => {
            opacity -= 0.02;
            hint.material.opacity = opacity;
            hint.scale.multiplyScalar(1.01);

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                this.scene.remove(hint);
            }
        };
        animate();
    }

    resetPuzzle() {
        this.clearPuzzle();
        this.createPuzzle();
    }

    newPuzzle() {
        this.clearPuzzle();
        document.getElementById('imageInput').value = '';
        document.getElementById('previewSection').style.display = 'none';
        this.originalImage = null;
        this.updateUI();
    }

    clearPuzzle() {
        this.pieces.forEach(piece => {
            this.scene.remove(piece);
        });
        this.pieces = [];
        this.completedPieces = 0;
        this.totalPieces = 0;
    }

    onMouseDown(event) {
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.pieces);
        if (intersects.length > 0) {
            this.selectedPiece = intersects[0].object;
            this.isDragging = true;

            // Calculate drag offset
            this.dragOffset.copy(intersects[0].point).sub(this.selectedPiece.position);

            // Disable orbit controls during drag
            this.controls.enabled = false;

            // Highlight selected piece
            this.selectedPiece.material.emissive.setHex(0x444444);
        }
    }

    onMouseMove(event) {
        if (!this.isDragging || !this.selectedPiece) return;

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Create a plane at the piece's current height
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -this.selectedPiece.position.y);
        const intersection = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersection);

        // Move piece to intersection point
        this.selectedPiece.position.copy(intersection.sub(this.dragOffset));
    }

    onMouseUp(event) {
        if (!this.selectedPiece) return;

        // Re-enable orbit controls
        this.controls.enabled = true;

        // Remove highlight
        this.selectedPiece.material.emissive.setHex(0x000000);

        // Check if piece is in correct position
        this.checkPiecePlacement(this.selectedPiece);

        this.selectedPiece = null;
        this.isDragging = false;
    }

    onTouchStart(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
    }

    onTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
    }

    onTouchEnd(event) {
        event.preventDefault();
        this.onMouseUp();
    }

    updateMousePosition(event) {
        const canvas = document.getElementById('jigsawCanvas');
        const rect = canvas.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    checkPiecePlacement(piece) {
        const correctPos = piece.userData.correctPosition;
        const distance = piece.position.distanceTo(correctPos);
        const rotationDiff = Math.abs(piece.rotation.y % (Math.PI * 2));

        // Check if close enough to correct position and rotation
        if (distance < 0.3 && rotationDiff < 0.3) {
            // Snap to correct position
            piece.position.copy(correctPos);
            piece.rotation.y = 0; // Reset rotation
            piece.userData.isPlaced = true;
            this.completedPieces++;

            // Visual feedback - make piece glow briefly
            this.showPlacementEffect(piece);

            this.updateUI();
            this.checkPuzzleComplete();
        }
    }

    showPlacementEffect(piece) {
        const originalColor = piece.material.emissive.getHex();
        piece.material.emissive.setHex(0x00ff00);

        setTimeout(() => {
            piece.material.emissive.setHex(originalColor);
        }, 500);
    }

    checkPuzzleComplete() {
        if (this.completedPieces === this.totalPieces) {
            this.showVictoryEffect();
            document.getElementById('progressInfo').textContent = '🎉 PUZZLE COMPLETE! 🎉';
        }
    }

    showVictoryEffect() {
        // Create confetti effect
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const geometry = new THREE.SphereGeometry(0.05, 8, 8);
                const material = new THREE.MeshBasicMaterial({
                    color: Math.random() * 0xffffff
                });
                const confetti = new THREE.Mesh(geometry, material);

                confetti.position.set(
                    (Math.random() - 0.5) * 10,
                    Math.random() * 5 + 5,
                    (Math.random() - 0.5) * 10
                );

                confetti.userData.velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    -Math.random() * 0.1,
                    (Math.random() - 0.5) * 0.2
                );

                this.scene.add(confetti);

                // Animate confetti
                const animate = () => {
                    confetti.position.add(confetti.userData.velocity);
                    confetti.userData.velocity.y -= 0.005;

                    if (confetti.position.y > -5) {
                        requestAnimationFrame(animate);
                    } else {
                        this.scene.remove(confetti);
                    }
                };
                animate();
            }, i * 100);
        }
    }

    updateUI() {
        const progressInfo = document.getElementById('progressInfo');

        if (this.totalPieces === 0) {
            progressInfo.textContent = 'Ready to create a puzzle! Choose an image above.';
        } else {
            progressInfo.textContent = `Progress: ${this.completedPieces}/${this.totalPieces} pieces placed`;
        }

        // Update button states
        document.getElementById('shuffleBtn').disabled = this.totalPieces === 0;
        document.getElementById('hintBtn').disabled = this.totalPieces === 0;
        document.getElementById('resetBtn').disabled = this.totalPieces === 0;
    }

    onWindowResize() {
        const canvas = document.getElementById('jigsawCanvas');
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new JigsawPuzzle();
});