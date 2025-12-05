// 3D Chess Models Loader
// **Timestamp**: 2025-12-04
// Uses free 3D models from Poly Haven and Sketchfab

class Chess3DModels {
    constructor() {
        if (typeof THREE === 'undefined') {
            console.error('Three.js not loaded!');
            return;
        }
        // Use THREE.GLTFLoader if available, otherwise fallback to global GLTFLoader
        const GLTFLoaderClass = THREE.GLTFLoader || (typeof GLTFLoader !== 'undefined' ? GLTFLoader : null);
        if (!GLTFLoaderClass) {
            console.warn('GLTFLoader not available, using procedural geometry only');
            this.loader = null;
        } else {
            this.loader = new GLTFLoaderClass();
        }
        this.modelCache = {};
        this.currentSet = 'default';
        
        // Model sets (using free resources)
        this.sets = {
            default: {
                name: 'Classic Geometric',
                useGeometry: true  // Use current simple geometries
            },
            staunton: {
                name: 'Staunton (External)',
                baseUrl: 'https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models/',
                pieces: {
                    pawn: 'RobotExpressive.glb',  // Placeholder - would need real chess models
                    rook: 'RobotExpressive.glb',
                    knight: 'RobotExpressive.glb',
                    bishop: 'RobotExpressive.glb',
                    queen: 'RobotExpressive.glb',
                    king: 'RobotExpressive.glb'
                }
            },
            low_poly: {
                name: 'Low Poly',
                useProceduralGeometry: true  // Generate better looking procedural pieces
            }
        };
    }
    
    async loadModel(url) {
        if (this.modelCache[url]) {
            return this.modelCache[url].clone();
        }
        
        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    this.modelCache[url] = gltf.scene;
                    resolve(gltf.scene.clone());
                },
                undefined,
                reject
            );
        });
    }
    
    createLowPolyPiece(type, color) {
        const pieceColor = color === 'white' ? 0xFFFFFF : 0x222222;
        const material = new THREE.MeshStandardMaterial({
            color: pieceColor,
            metalness: 0.3,
            roughness: 0.6
        });
        
        const group = new THREE.Group();
        
        switch(type) {
            case 'pawn':
                // Better pawn: sphere on cylinder
                const pawnBase = new THREE.CylinderGeometry(0.25, 0.35, 0.3, 16);
                const pawnStem = new THREE.CylinderGeometry(0.15, 0.2, 0.6, 16);
                const pawnHead = new THREE.SphereGeometry(0.25, 16, 16);
                
                const base = new THREE.Mesh(pawnBase, material);
                base.position.y = 0.15;
                
                const stem = new THREE.Mesh(pawnStem, material);
                stem.position.y = 0.6;
                
                const head = new THREE.Mesh(pawnHead, material);
                head.position.y = 1.15;
                
                group.add(base, stem, head);
                break;
                
            case 'rook':
                // Rook: castle tower with crenellations
                const towerBase = new THREE.CylinderGeometry(0.4, 0.45, 0.4, 8);
                const towerBody = new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8);
                const towerTop = new THREE.CylinderGeometry(0.4, 0.35, 0.2, 8);
                
                group.add(
                    new THREE.Mesh(towerBase, material).translateY(0.2),
                    new THREE.Mesh(towerBody, material).translateY(0.8),
                    new THREE.Mesh(towerTop, material).translateY(1.3)
                );
                
                // Add crenellations
                for (let i = 0; i < 4; i++) {
                    const cren = new THREE.BoxGeometry(0.15, 0.2, 0.15);
                    const crenMesh = new THREE.Mesh(cren, material);
                    const angle = (i * Math.PI) / 2;
                    crenMesh.position.set(
                        Math.cos(angle) * 0.35,
                        1.5,
                        Math.sin(angle) * 0.35
                    );
                    group.add(crenMesh);
                }
                break;
                
            case 'knight':
                // Knight: horse head approximation
                const knightBase = new THREE.CylinderGeometry(0.3, 0.4, 0.4, 8);
                const knightNeck = new THREE.BoxGeometry(0.25, 0.6, 0.3);
                const knightHead = new THREE.BoxGeometry(0.35, 0.4, 0.5);
                
                group.add(
                    new THREE.Mesh(knightBase, material).translateY(0.2),
                    new THREE.Mesh(knightNeck, material).translateY(0.8),
                    new THREE.Mesh(knightHead, material).translateY(1.2).rotateY(Math.PI / 4)
                );
                break;
                
            case 'bishop':
                // Bishop: tall piece with pointed top
                const bishopBase = new THREE.CylinderGeometry(0.35, 0.4, 0.4, 16);
                const bishopBody = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 16);
                const bishopTop = new THREE.ConeGeometry(0.25, 0.5, 16);
                const bishopBall = new THREE.SphereGeometry(0.15, 16, 16);
                
                group.add(
                    new THREE.Mesh(bishopBase, material).translateY(0.2),
                    new THREE.Mesh(bishopBody, material).translateY(0.8),
                    new THREE.Mesh(bishopTop, material).translateY(1.5),
                    new THREE.Mesh(bishopBall, material).translateY(1.9)
                );
                break;
                
            case 'queen':
                // Queen: crown-like top
                const queenBase = new THREE.CylinderGeometry(0.4, 0.45, 0.4, 16);
                const queenBody = new THREE.CylinderGeometry(0.3, 0.35, 0.9, 16);
                const queenCrown = new THREE.CylinderGeometry(0.35, 0.25, 0.4, 16);
                const queenBall = new THREE.SphereGeometry(0.2, 16, 16);
                
                group.add(
                    new THREE.Mesh(queenBase, material).translateY(0.2),
                    new THREE.Mesh(queenBody, material).translateY(0.85),
                    new THREE.Mesh(queenCrown, material).translateY(1.5),
                    new THREE.Mesh(queenBall, material).translateY(1.9)
                );
                
                // Crown spikes
                for (let i = 0; i < 8; i++) {
                    const spike = new THREE.ConeGeometry(0.08, 0.25, 8);
                    const spikeMesh = new THREE.Mesh(spike, material);
                    const angle = (i * Math.PI) / 4;
                    spikeMesh.position.set(
                        Math.cos(angle) * 0.3,
                        1.8,
                        Math.sin(angle) * 0.3
                    );
                    group.add(spikeMesh);
                }
                break;
                
            case 'king':
                // King: tallest piece with cross on top
                const kingBase = new THREE.CylinderGeometry(0.4, 0.45, 0.4, 16);
                const kingBody = new THREE.CylinderGeometry(0.3, 0.35, 1.0, 16);
                const kingCrown = new THREE.CylinderGeometry(0.35, 0.25, 0.3, 16);
                
                group.add(
                    new THREE.Mesh(kingBase, material).translateY(0.2),
                    new THREE.Mesh(kingBody, material).translateY(0.9),
                    new THREE.Mesh(kingCrown, material).translateY(1.5)
                );
                
                // Cross on top
                const crossV = new THREE.BoxGeometry(0.1, 0.5, 0.1);
                const crossH = new THREE.BoxGeometry(0.3, 0.1, 0.1);
                group.add(
                    new THREE.Mesh(crossV, material).translateY(2.0),
                    new THREE.Mesh(crossH, material).translateY(2.0)
                );
                break;
        }
        
        return group;
    }
}

window.Chess3DModels = Chess3DModels;

