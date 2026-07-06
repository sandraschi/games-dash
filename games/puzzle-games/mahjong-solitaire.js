// Mahjong Solitaire 3D — Three.js
const TILE_W = 42, TILE_H = 52, OX = 22, OY = 26;
const TILE_SYMBOLS = ['\u{1F007}','\u{1F008}','\u{1F009}','\u{1F00A}','\u{1F00B}','\u{1F00C}','\u{1F010}','\u{1F011}','\u{1F012}','\u{1F013}','\u{1F014}','\u{1F015}','\u{1F019}','\u{1F01A}','\u{1F01B}','\u{1F01C}','\u{1F01D}','\u{1F01E}','\u{1F020}','\u{1F021}','\u{1F022}','\u{1F023}','\u{1F024}','\u{1F025}','\u{1F000}','\u{1F001}','\u{1F002}','\u{1F003}','\u{1F004}','\u{1F005}','\u{2660}','\u{2665}','\u{2666}','\u{2663}','\u{2734}','\u{2728}'];

const LAYOUTS = {
    turtle: { name:'Turtle', build(){const p=[],c=(l,r,n,m=8)=>{let s=Math.floor((m-n)/2);for(let i=0;i<n;i++)p.push({row:r,col:s+i,layer:l})};c(0,0,2);c(0,1,4);c(0,2,6);c(0,3,8);c(0,4,8);c(0,5,8);c(0,6,6);c(0,7,4);c(0,8,2);c(1,1,4);c(1,2,6);c(1,3,8);c(1,4,8);c(1,5,8);c(1,6,6);c(1,7,4);c(2,2,6);c(2,3,8);c(2,4,8);c(2,5,8);c(2,6,6);c(3,3,4);c(3,4,8);c(3,5,8);c(3,6,4);return p} },
    dragon: { name:'Dragon', build(){const p=[],c=(l,r,n,m=8)=>{let s=Math.floor((m-n)/2);for(let i=0;i<n;i++)p.push({row:r,col:s+i,layer:l})};c(0,0,4);c(0,1,8);c(0,2,8);c(0,3,8);c(0,4,8);c(0,5,6);c(0,6,4);c(0,7,2);c(1,1,6);c(1,2,8);c(1,3,8);c(1,4,8);c(1,5,6);c(1,6,4);c(1,7,4);c(2,2,6);c(2,3,8);c(2,4,8);c(2,5,6);c(2,6,4);c(2,7,2);c(3,3,6);c(3,4,8);c(3,5,6);c(3,6,4);c(3,7,2);return p} },
    pyramid: { name:'Pyramid', build(){const p=[],c=(l,r,n,m=8)=>{let s=Math.floor((m-n)/2);for(let i=0;i<n;i++)p.push({row:r,col:s+i,layer:l})};c(0,0,4);c(0,1,8);c(0,2,8);c(0,3,8);c(0,4,8);c(0,5,8);c(0,6,8);c(0,7,8);c(0,8,4);c(1,1,4);c(1,2,8);c(1,3,8);c(1,4,8);c(1,5,8);c(1,6,8);c(1,7,4);c(2,2,4);c(2,3,8);c(2,4,8);c(2,5,8);c(2,6,4);c(3,3,4);c(3,4,8);c(3,5,4);return p} },
    butterfly: { name:'Butterfly', build(){const p=[],c=(l,r,n,m=8)=>{let s=Math.floor((m-n)/2);for(let i=0;i<n;i++)p.push({row:r,col:s+i,layer:l})};c(0,0,2);c(0,1,4);c(0,2,8);c(0,3,8);c(0,4,8);c(0,5,8);c(0,6,4);c(0,7,2);c(1,1,4);c(1,2,8);c(1,3,8);c(1,4,8);c(1,5,8);c(1,6,8);c(1,7,4);c(1,8,2);c(2,2,6);c(2,3,8);c(2,4,8);c(2,5,6);c(2,6,4);c(3,3,6);c(3,4,8);c(3,5,6);c(3,6,4);return p} },
    cat: { name:'Cat', build(){const p=[],c=(l,r,n,m=8)=>{let s=Math.floor((m-n)/2);for(let i=0;i<n;i++)p.push({row:r,col:s+i,layer:l})};c(0,0,2);c(0,1,4);c(0,2,6);c(0,3,8);c(0,4,8);c(0,5,8);c(0,6,6);c(0,7,4);c(1,1,4);c(1,2,6);c(1,3,8);c(1,4,8);c(1,5,8);c(1,6,6);c(1,7,4);c(2,2,6);c(2,3,8);c(2,4,8);c(2,5,8);c(2,6,6);c(3,3,6);c(3,4,8);c(3,5,8);c(3,6,4);c(3,7,2);return p} }
};

let tiles = [], selected = null, undoStack = [], layout = [], tileMeshes = [];
let scene, camera, renderer, controls, raycaster, mouse;
let animating = false;

function getCurrentLayout() { return LAYOUTS[document.getElementById('layoutSelect')?.value || 'turtle'] || LAYOUTS.turtle; }
function buildLayout() { return getCurrentLayout().build(); }
function shuffleArray(a) { const s=[...a];for(let i=s.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[s[i],s[j]]=[s[j],s[i]]}return s; }
function buildTileSet() { const d=[];for(let t=0;t<TILE_SYMBOLS.length;t++)for(let i=0;i<4;i++)d.push({type:t,symbol:TILE_SYMBOLS[t]});return shuffleArray(d); }

function getTileAt(row, col, layer) { return tiles.find(t => t.row===row && t.col===col && t.layer===layer && !t.matched); }
function hasTileAt(row, col, layer) { return !!getTileAt(row, col, layer); }
function isFree(tile) {
    if (tile.matched) return false;
    const {row,col,layer}=tile;
    if (hasTileAt(row,col,layer+1)) return false;
    const l=hasTileAt(row,col-1,layer), r=hasTileAt(row,col+1,layer);
    return !l || !r;
}

function pixelPos(row, col, layer) { return { x: col*OX - layer*2, y: row*OY + layer*3 }; }

// Three.js scene setup
function init3D() {
    const container = document.getElementById('mahjong3d');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x16213e);

    const w = container.clientWidth, h = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000);
    camera.position.set(0, -15, 25);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.target.set(0, 0, 0);

    // Lights
    const al = new THREE.AmbientLight(0x404060);
    scene.add(al);
    const d1 = new THREE.DirectionalLight(0xffffff, 0.8);
    d1.position.set(10, 20, 10);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x4488ff, 0.3);
    d2.position.set(-10, -5, -10);
    scene.add(d2);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    renderer.domElement.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);

    animate();
}

function onResize() {
    const container = document.getElementById('mahjong3d');
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
}

function onCanvasClick(e) {
    if (animating) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const meshes = tileMeshes.filter(m => m.visible && m.userData.tile && !m.userData.tile.matched);
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length === 0) return;
    const hit = intersects[0].object;
    const tile = hit.userData.tile;
    if (tile) handleClick(tile);
}

function createTileTexture(symbol) {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 80;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0,0,0,80);
    grad.addColorStop(0,'#f8f8f8'); grad.addColorStop(0.1,'#fff'); grad.addColorStop(0.9,'#e0e0e0'); grad.addColorStop(1,'#ccc');
    ctx.fillStyle = grad;
    rRect(ctx, 0, 0, 64, 80, 6);
    ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
    rRect(ctx, 0, 0, 64, 80, 6);
    ctx.stroke();
    ctx.fillStyle = '#222';
    ctx.font = '28px serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(symbol, 32, 40);
    return new THREE.CanvasTexture(c);
}
function rRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y); ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r); ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r); ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
}

function render3D() {
    // Clear old meshes
    tileMeshes.forEach(m => { scene.remove(m); });
    tileMeshes = [];

    const centerX = layout.reduce((m,p)=>{const pos=pixelPos(p.row,p.col,p.layer);return Math.max(m,pos.x+OX/2);},0)/2-10;
    const centerY = layout.reduce((m,p)=>{const pos=pixelPos(p.row,p.col,p.layer);return Math.max(m,pos.y+OY/2);},0)/2-10;

    const visible = tiles.filter(t => !t.matched);
    visible.forEach(t => {
        const pos = pixelPos(t.row, t.col, t.layer);
        const geo = new THREE.BoxGeometry(1.6, 1.8, 0.3);
        const tex = createTileTexture(t.symbol);
        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.4,
            metalness: 0.1,
        });
        const mesh = new THREE.Mesh(geo, mat);
        const x = (pos.x - centerX) * 0.045;
        const z = (pos.y - centerY) * 0.045;
        const y = t.layer * 0.35;
        mesh.position.set(x, y, z);
        mesh.userData.tile = t;
        mesh.userData.id = t.id;
        mesh.castShadow = true;
        scene.add(mesh);
        tileMeshes.push(mesh);

        // Highlight selected
        if (selected && selected.id === t.id) {
            const hl = new THREE.BoxGeometry(1.75, 1.95, 0.35);
            const hlMat = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.3 });
            const hlMesh = new THREE.Mesh(hl, hlMat);
            hlMesh.position.copy(mesh.position);
            hlMesh.position.y += 0.05;
            scene.add(hlMesh);
            tileMeshes.push(hlMesh);
        }

        // Dim blocked tiles
        if (!isFree(t)) {
            mesh.material = mat.clone();
            mesh.material.opacity = 0.5;
            mesh.material.transparent = true;
        }
    });

    // Adjust camera target to center of board
    const avgX = visible.reduce((s,t)=>{const p=pixelPos(t.row,t.col,t.layer);return s+(p.x-centerX)*0.045;},0)/Math.max(1,visible.length);
    const avgZ = visible.reduce((s,t)=>{const p=pixelPos(t.row,t.col,t.layer);return s+(p.y-centerY)*0.045;},0)/Math.max(1,visible.length);
    controls.target.set(avgX, 0.5, avgZ);

    document.getElementById('tilesLeft').textContent = visible.length + ' left';
}

function handleClick(tile) {
    if (tile.matched || !isFree(tile)) return;
    if (!selected) { selected = tile; render3D(); return; }
    if (selected.id === tile.id) { selected = null; render3D(); return; }
    if (selected.type === tile.type) {
        undoStack.push([selected.id, tile.id]);
        selected.matched = true; tile.matched = true;
        selected = null; render3D();
        if (tiles.filter(t => !t.matched).length === 0) {
            document.getElementById('winOverlay').classList.add('show');
        }
    } else {
        selected = null; render3D();
    }
}

function newGame() {
    layout = buildLayout();
    const deck = buildTileSet();
    tiles = layout.slice(0, deck.length).map((pos, i) => ({...pos, type: deck[i].type, symbol: deck[i].symbol, matched: false, id: i}));
    undoStack = []; selected = null;
    if (scene) render3D();
}

function undo() {
    if (undoStack.length === 0) return;
    const [a,b] = undoStack.pop();
    const t1 = tiles.find(t => t.id === a);
    const t2 = tiles.find(t => t.id === b);
    if (t1 && t2) { t1.matched = false; t2.matched = false; selected = null; render3D(); }
}

function hint() {
    const free = tiles.filter(t => !t.matched && isFree(t));
    for (let i = 0; i < free.length; i++)
        for (let j = i+1; j < free.length; j++)
            if (free[i].type === free[j].type) {
                selected = free[i];
                render3D();
                setTimeout(() => { selected = null; render3D(); }, 1000);
                return;
            }
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

document.getElementById('newBtn').onclick = newGame;
document.getElementById('hintBtn').onclick = hint;
document.getElementById('undoBtn').onclick = undo;
document.addEventListener('DOMContentLoaded', () => { init3D(); newGame(); });
