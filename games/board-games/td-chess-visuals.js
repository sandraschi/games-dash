/**
 * Tri-Dimensional Chess Visual Renderer
 * Uses Three.js to render the multi-level board
 */

class TDChessVisuals {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.controls = null;
        this.pieces = new THREE.Group();
        this.boards = new THREE.Group();
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        this.init();
    }

    init() {
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.set(10, 10, 15);
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight.position.set(10, 20, 10);
        this.scene.add(pointLight);

        const blueLight = new THREE.PointLight(0x0000ff, 0.5, 50);
        blueLight.position.set(-10, 5, -10);
        this.scene.add(blueLight);

        this.scene.add(this.boards);
        this.scene.add(this.pieces);

        this.modelLoader = new Chess3DModels();

        this.container.addEventListener('click', (e) => this.onSquareClick(e));

        this.animate();
    }

    render() {
        this.clearBoard();
        this.drawBoards();
        this.drawPieces();
    }

    clearBoard() {
        while (this.boards.children.length > 0) this.boards.remove(this.boards.children[0]);
        while (this.pieces.children.length > 0) this.pieces.remove(this.pieces.children[0]);
    }

    drawBoards() {
        if (!window.TDGame) return;

        window.TDGame.boards.forEach(b => {
            const size = b.size;
            const group = new THREE.Group();

            // Draw squares
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const geometry = new THREE.PlaneGeometry(0.9, 0.9);
                    const isV = (r + c) % 2 === 0;
                    const color = b.id < 3 ? (isV ? 0xdddddd : 0x222222) : (isV ? 0x00ffff : 0x004444);
                    const material = new THREE.MeshStandardMaterial({
                        color,
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.6,
                        metalness: 0.5,
                        roughness: 0.2
                    });
                    const square = new THREE.Mesh(geometry, material);
                    square.rotation.x = -Math.PI / 2;

                    const localCoords = { x: c - size / 2 + 0.5, y: r - size / 2 + 0.5 };
                    square.position.set(localCoords.x, 0, localCoords.y);

                    // Metadata for raycasting
                    square.userData = { boardId: b.id, x: c, y: r, type: 'square' };
                    group.add(square);
                }
            }

            // Position board in 3D space
            const pos = this.getBoardGlobalPos(b);
            group.position.set(pos.x, pos.y, pos.z);
            this.boards.add(group);
        });
    }

    getBoardGlobalPos(b) {
        // Reduced vertical distance from 4 to 2.5 for better compactness
        const verticalScale = 2.5;
        if (b.id < 3) {
            return { x: 0, y: b.id * verticalScale, z: 0 };
        } else {
            // Attack boards based on pins
            const pins = [
                { x: -1.5, z: -1.5 }, { x: 1.5, z: -1.5 },
                { x: -1.5, z: 1.5 }, { x: 1.5, z: 1.5 }
            ];
            const pin = pins[b.pin];
            const yBase = b.level * verticalScale;
            // Half vertical scale offset for attack boards (up or down from pin)
            const yOffset = b.owner === 'white' ? -0.5 * verticalScale : 0.5 * verticalScale;
            return { x: pin.x, y: yBase + yOffset, z: pin.z };
        }
    }

    drawPieces() {
        if (!window.TDGame) return;

        window.TDGame.boards.forEach(b => {
            const boardPos = this.getBoardGlobalPos(b);
            for (let r = 0; r < b.size; r++) {
                for (let c = 0; c < b.size; c++) {
                    const pieceData = b.squares[r][c];
                    if (pieceData) {
                        const piece = this.modelLoader.createLowPolyPiece(pieceData.type, pieceData.color);
                        piece.scale.set(0.5, 0.5, 0.5);

                        const localX = c - b.size / 2 + 0.5;
                        const localZ = r - b.size / 2 + 0.5;
                        piece.position.set(boardPos.x + localX, boardPos.y, boardPos.z + localZ);

                        piece.userData = { boardId: b.id, x: c, y: r, type: 'piece' };
                        this.pieces.add(piece);
                    }
                }
            }
        });
    }

    onSquareClick(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        // Intersect both squares and pieces
        const intersects = this.raycaster.intersectObjects([...this.boards.children, ...this.pieces.children], true);

        if (intersects.length > 0) {
            let target = intersects[0].object;
            // Bubble up to group with userData
            while (target && !target.userData.type) target = target.parent;

            if (target && target.userData) {
                const { boardId, x, y } = target.userData;
                this.handleSelection(boardId, x, y, target);
            }
        }
    }

    handleSelection(boardId, x, y, target) {
        try {
            const game = window.TDGame;
            const square = game.boards[boardId].squares[y][x];

            if (this.selected) {
                // Try to move
                const move = { boardId, x, y };
                const validMoves = game.getValidMoves(this.selected.boardId, this.selected.x, this.selected.y);

                const isValid = validMoves.some(m => m.boardId === boardId && m.x === x && m.y === y);

                if (isValid) {
                    game.makeMove(this.selected, move);
                    this.selected = null;
                    this.render();
                    document.getElementById('status').textContent = `${game.currentPlayer.toUpperCase()}'s turn. Logic stable.`;
                } else if (target && target.userData && target.userData.type === 'board_marker') {
                    // Board move
                    game.makeBoardMove(target.userData.boardId, target.userData.pin);
                    this.selected = null;
                    this.render();
                    document.getElementById('status').textContent = `${game.currentPlayer.toUpperCase()}'s turn. Logic stable.`;
                } else {
                    this.selected = null;
                    this.render();
                }
            } else if (target && target.userData && target.userData.type === 'piece' && square && square.color === game.currentPlayer) {
                this.selected = { boardId, x, y };
                this.highlightMoves(boardId, x, y);
            } else if (target && target.userData && target.userData.type === 'square' && boardId > 2) {
                // Check if board can move
                const boardMoves = game.getValidBoardMoves(boardId);
                if (boardMoves.length > 0) {
                    this.selectedBoard = boardId;
                    this.highlightBoardMoves(boardId, boardMoves);
                }
            }
        } catch (e) {
            console.error(`[td-chess] handleSelection error: ${e.message}`, { boardId, x, y, target: target ? 'yes' : 'no' });
            document.getElementById('status').textContent = `Error: ${e.message}. Try refreshing.`;
        }
    }

    highlightBoardMoves(boardId, moves) {
        this.render();
        moves.forEach(m => {
            const pins = [
                { x: -1.5, z: -1.5 }, { x: 1.5, z: -1.5 },
                { x: -1.5, z: 1.5 }, { x: 1.5, z: 1.5 }
            ];
            const pinPos = pins[m.pin];
            const verticalScale = 2.5;
            const b = window.TDGame.boards[boardId];
            const y = b.level * verticalScale + (b.owner === 'white' ? -0.5 * verticalScale : 0.5 * verticalScale);

            const markerGeo = new THREE.BoxGeometry(1, 0.1, 1);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(pinPos.x, y, pinPos.z);
            marker.userData = { type: 'board_marker', boardId, pin: m.pin };
            this.pieces.add(marker);
        });
    }

    highlightMoves(boardId, x, y) {
        const moves = window.TDGame.getValidMoves(boardId, x, y);
        // Visual indicator for selected piece
        // (Simplified for now: just render and wait for next click)
        this.render();

        // Add highlight markers (green spheres)
        moves.forEach(m => {
            const b = window.TDGame.boards[m.boardId];
            const bPos = this.getBoardGlobalPos(b);
            const localX = m.x - b.size / 2 + 0.5;
            const localZ = m.y - b.size / 2 + 0.5;

            const markerGeo = new THREE.SphereGeometry(0.1, 8, 8);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            marker.position.set(bPos.x + localX, bPos.y + 0.1, bPos.z + localZ);
            this.pieces.add(marker);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.controls) this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    resetCamera() {
        this.camera.position.set(10, 10, 15);
        this.controls.target.set(0, 4, 0);
        this.controls.update();
    }

    setSideView(side) {
        if (side === 'white') this.camera.position.set(0, 8, 20);
        if (side === 'black') this.camera.position.set(0, 8, -20);
        if (side === 'neutral') this.camera.position.set(20, 8, 0);
        this.controls.target.set(0, 4, 0);
        this.controls.update();
    }
}

// Global visual instance
window.visuals = null;
function initVisuals() {
    window.visuals = new TDChessVisuals('chess3dContainer');
    if (window.TDGame) window.visuals.render();
}
