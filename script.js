/* =========================================================
   DIGISIM – Logic Circuit Simulator  v2.5
   script.js – Fixed: strict sim lock, expanded AI knowledge
   ========================================================= */

// ── PAGE NAVIGATION ─────────────────────────────────────────────
function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) pg.classList.add('active');
  if (el) el.classList.add('active');
  if (name === 'directory') renderDirectory();
  if (name === 'workspace') { setTimeout(resizeCanvas, 50); }
  window.scrollTo(0, 0);
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// ── GATE CAROUSEL (HOME) ─────────────────────────────────────────
const GATES = ['AND','OR','NOT','NAND','NOR','XOR','XNOR'];
let carouselIdx = 0;
let carouselAutoTimer = null;

function prevGate() { carouselIdx = (carouselIdx - 1 + GATES.length) % GATES.length; drawCarousel(); resetCarouselAuto(); }
function nextGate() { carouselIdx = (carouselIdx + 1) % GATES.length; drawCarousel(); resetCarouselAuto(); }
function goToGate(i) { carouselIdx = i; drawCarousel(); resetCarouselAuto(); }
function resetCarouselAuto() {
  clearInterval(carouselAutoTimer);
  carouselAutoTimer = setInterval(() => { carouselIdx = (carouselIdx + 1) % GATES.length; drawCarousel(); }, 2400);
}
function drawCarousel() {
  const c = document.getElementById('gateCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  document.getElementById('gateName').textContent = GATES[carouselIdx] + ' GATE';
  drawGateOnCanvas(ctx, GATES[carouselIdx], c.width / 2, c.height / 2, 1.5, true);
  const dotsEl = document.getElementById('carouselDots');
  if (dotsEl) {
    dotsEl.innerHTML = GATES.map((g, i) =>
      `<span class="cdot${i === carouselIdx ? ' active' : ''}" onclick="goToGate(${i})" title="${g} Gate"></span>`
    ).join('');
  }
}

// ── MINI COMP LIBRARY ICONS ──────────────────────────────────────
function drawMiniIcons() {
  document.querySelectorAll('.comp-mini-canvas').forEach(c => {
    const g = c.dataset.gate;
    if (!g) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    drawGateOnCanvas(ctx, g, c.width / 2, c.height / 2 - 2, 0.8, false);
  });
}

// ── GATE DRAWING ENGINE ──────────────────────────────────────────
function drawGateOnCanvas(ctx, type, cx, cy, scale = 1, glow = false, inputs = 2) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const mainColor = '#00e5a0';
  const lineW = glow ? 2.5 : 1.8;
  if (glow) { ctx.shadowColor = mainColor; ctx.shadowBlur = 14; }
  ctx.strokeStyle = mainColor;
  ctx.fillStyle = 'rgba(0,229,160,0.07)';
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const w = 44;
  const h = Math.max(30, getGateBodyHeight(inputs));
  switch (type) {
    case 'AND': drawAND(ctx, w, h); break;
    case 'OR': drawOR(ctx, w, h); break;
    case 'NOT': drawNOT(ctx); break;
    case 'NAND':
      drawAND(ctx, w, h); drawBubble(ctx, h/2 + 4);
      // Extend stub past bubble so port dot clears it
      ctx.beginPath(); ctx.moveTo(h/2+11, 0); ctx.lineTo(h/2+18, 0); ctx.stroke();
      break;
    case 'NOR':
      drawOR(ctx, w, h); drawBubble(ctx, w/2 + 6);
      // Extend stub past bubble so port dot clears it
      ctx.beginPath(); ctx.moveTo(w/2+14, 0); ctx.lineTo(w/2+24, 0); ctx.stroke();
      break;
    case 'XOR': drawXOR(ctx, w, h); break;
    case 'XNOR':
      drawXOR(ctx, w, h); drawBubble(ctx, w/2 + 8);
      // Extend stub past bubble so port dot clears it
      ctx.beginPath(); ctx.moveTo(w/2+16, 0); ctx.lineTo(w/2+24, 0); ctx.stroke();
      break;
  }
  ctx.restore();
}
function drawAND(ctx, w, h) {
  ctx.beginPath();
  ctx.moveTo(-w/2,-h/2); ctx.lineTo(0,-h/2);
  ctx.arc(0,0,h/2,-Math.PI/2,Math.PI/2);
  ctx.lineTo(-w/2,h/2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w/2-10,-h/4); ctx.lineTo(-w/2,-h/4);
  ctx.moveTo(-w/2-10,h/4); ctx.lineTo(-w/2,h/4);
  ctx.moveTo(h/2,0); ctx.lineTo(h/2+10,0); ctx.stroke();
}
function drawOR(ctx, w, h) {
  ctx.beginPath();
  ctx.moveTo(-w/2,-h/2);
  ctx.bezierCurveTo(0,-h/2,w/2+4,-h/3,w/2+6,0);
  ctx.bezierCurveTo(w/2+4,h/3,0,h/2,-w/2,h/2);
  ctx.bezierCurveTo(-w/2+10,0,-w/2+10,0,-w/2,-h/2);
  ctx.fill(); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-w/2-10,-h/4); ctx.lineTo(-w/2+5,-h/4);
  ctx.moveTo(-w/2-10,h/4); ctx.lineTo(-w/2+5,h/4);
  ctx.moveTo(w/2+6,0); ctx.lineTo(w/2+16,0); ctx.stroke();
}
function drawNOT(ctx) {
  ctx.beginPath();
  ctx.moveTo(-18,-16); ctx.lineTo(-18,16); ctx.lineTo(18,0); ctx.closePath();
  ctx.fill(); ctx.stroke(); drawBubble(ctx,22);
  ctx.beginPath(); ctx.moveTo(-28,0); ctx.lineTo(-18,0); ctx.moveTo(26,0); ctx.lineTo(36,0); ctx.stroke();
}
function drawXOR(ctx, w, h) {
  drawOR(ctx,w,h);
  ctx.beginPath();
  ctx.moveTo(-w/2-6,-h/2);
  ctx.bezierCurveTo(-w/2+4,0,-w/2+4,0,-w/2-6,h/2); ctx.stroke();
}
function drawBubble(ctx, x) {
  ctx.beginPath(); ctx.arc(x+3,0,4,0,Math.PI*2);
  ctx.fillStyle='rgba(0,229,160,0.12)'; ctx.fill(); ctx.stroke();
}

// ── CIRCUIT DATA MODEL ───────────────────────────────────────────
let components = [];
let wires = [];
let nodes = [];
let nodeCounter = 0;
let compCounter = 0;
let selectedComp = null;
let selectedWire = null;
let draggingComp = null;
let dragOffX = 0, dragOffY = 0;
let simRunning = false;
let undoStack = [];
let redoStack = [];
let currentCircuitName = 'Untitled';

// ── FILE INDICATOR ────────────────────────────────────────────────
function updateFileIndicator() {
  const el = document.getElementById('fileIndicatorName');
  if (el) el.textContent = (currentCircuitName || 'Untitled') + '.json';
}

// ── ZOOM / PAN ───────────────────────────────────────────────────
let viewScale = 1.0;
let viewOffX = 0, viewOffY = 0;
let isPanning = false;
let panLastX = 0, panLastY = 0;

// ── GROUP SELECT ─────────────────────────────────────────────────
let groupSelectActive = false;
let groupSelecting = false;
let groupSelStartX = 0, groupSelStartY = 0;
let groupSelCurX = 0, groupSelCurY = 0;
let groupSelected = [];
let groupDragging = false;
let groupDragStartX = 0, groupDragStartY = 0;
let groupDragOrigPos = [];
let groupDragOrigWires = [];

// ── WIRING STATE ─────────────────────────────────────────────────
let drawingWire = false;
let wireStartPort = null;
let wireLiveEnd = null;
let wireCorners = [];
let _wireClickSizes = [];  // tracks how many corners each user click added (for Backspace undo)

function saveState() {
  undoStack.push(JSON.stringify({ components, wires, nodes }));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}
function undoAction() {
  if (!undoStack.length) return;
  redoStack.push(JSON.stringify({ components, wires, nodes }));
  const s = JSON.parse(undoStack.pop());
  components = s.components; wires = s.wires; nodes = s.nodes || [];
  selectedComp = null; selectedWire = null; groupSelected = [];
  // Sync compCounter to highest existing ID after undo
  syncCompCounter();
  updatePropsPanel(); redrawCanvas();
}
function redoAction() {
  if (!redoStack.length) return;
  undoStack.push(JSON.stringify({ components, wires, nodes }));
  const s = JSON.parse(redoStack.pop());
  components = s.components; wires = s.wires; nodes = s.nodes || [];
  selectedComp = null; selectedWire = null; groupSelected = [];
  // Sync compCounter to highest existing ID after redo
  syncCompCounter();
  updatePropsPanel(); redrawCanvas();
}

// ── COUNTER SYNC HELPER ───────────────────────────────────────────
// Sets compCounter to the highest numeric suffix among existing component IDs.
// If canvas is empty, resets to 0 so the next gate starts at G1.
function syncCompCounter() {
  if (components.length === 0) {
    compCounter = 0;
    nodeCounter = 0;
    return;
  }
  let max = 0;
  for (const c of components) {
    const match = c.id && c.id.match(/^G(\d+)$/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > max) max = n;
    }
  }
  compCounter = max;
}

// ── CANVAS SETUP ─────────────────────────────────────────────────
let canvas, ctx;
function initCanvas() {
  canvas = document.getElementById('mainCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('dblclick', onDblClick);
  canvas.addEventListener('contextmenu', onRightClick);
  canvas.addEventListener('dragover', e => e.preventDefault());
  canvas.addEventListener('drop', onDrop);
  canvas.addEventListener('wheel', onWheel, { passive: false });

  canvas.addEventListener('touchstart', e => onMouseDown(touchToMouse(e)), { passive: false });
  canvas.addEventListener('touchmove', e => onMouseMove(touchToMouse(e)), { passive: false });
  canvas.addEventListener('touchend', e => onMouseUp(touchToMouse(e)));
}
function touchToMouse(e) {
  e.preventDefault();
  const t = e.touches[0] || e.changedTouches[0];
  return { clientX: t.clientX, clientY: t.clientY, button: 0, preventDefault: () => {} };
}
function resizeCanvas() {
  if (!canvas) return;
  const wrapper = document.getElementById('canvasWrapper');
  if (!wrapper) return;
  canvas.width = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
  redrawCanvas();
}

// ── ZOOM / PAN ───────────────────────────────────────────────────
function onWheel(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const factor = e.deltaY < 0 ? 1.12 : 1/1.12;
  const newScale = Math.max(0.1, Math.min(5, viewScale * factor));
  viewOffX = mx - (mx - viewOffX) * (newScale / viewScale);
  viewOffY = my - (my - viewOffY) * (newScale / viewScale);
  viewScale = newScale;
  updateZoomLabel(); redrawCanvas();
}
function zoomIn() { viewScale = Math.min(5, viewScale*1.2); updateZoomLabel(); redrawCanvas(); }
function zoomOut() { viewScale = Math.max(0.1, viewScale/1.2); updateZoomLabel(); redrawCanvas(); }
function zoomReset() { viewScale=1; viewOffX=0; viewOffY=0; updateZoomLabel(); redrawCanvas(); }
function updateZoomLabel() {
  const el = document.getElementById('zoomLabel');
  if (el) el.textContent = Math.round(viewScale*100)+'%';
}
function screenToWorld(sx, sy) { return { x:(sx-viewOffX)/viewScale, y:(sy-viewOffY)/viewScale }; }
function worldToScreen(wx, wy) { return { x:wx*viewScale+viewOffX, y:wy*viewScale+viewOffY }; }

// ── DROP FROM LIBRARY ────────────────────────────────────────────
let dragGateType = null;
function dragGate(e, type) { dragGateType = type; }
function onDrop(e) {
  e.preventDefault();
  // STRICT SIM LOCK: no adding components during simulation
  if (simRunning) {
    showToast('🔒 Stop simulation before adding components', 'error');
    dragGateType = null;
    return;
  }
  if (!dragGateType) return;
  const rect = canvas.getBoundingClientRect();
  const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  saveState(); addComponent(dragGateType, x, y); dragGateType = null;
}

const GRID = 10;
const GATE_W = 80;
const GATE_H = 60;

function snapToGrid(val) {
  return Math.round(val / GRID) * GRID;
}

function addComponent(type, x, y) {
  const id = 'G' + (++compCounter);
  const defaultInputs = type === 'NOT' ? 1 : (type === 'INPUT' || type === 'OUTPUT' ? (type === 'INPUT' ? 0 : 1) : 2);
  const bodyH = getGateBodyHeight(defaultInputs);
  const comp = {
    id, type, x, y,
    inputs: defaultInputs,
    inputValues: [],
    value: 0,
    label: id,
    rotation: 0,
    width: GATE_W,
    height: Math.max(GATE_H, bodyH + 20)
  };
  if (type === 'INPUT') {
    comp.value = 0;
    comp.bitWidth = 1; // default
    comp.bitValues = [0]; // array of bit values
    comp.displayMode = 'decimal'; // 'decimal' or 'binary'
  }
  components.push(comp);
  document.getElementById('canvasHint').style.display = 'none';
  redrawCanvas();
  return comp;
}

// ── PORT POSITIONS ────────────────────────────────────────────────
const PORT_SPACING = 16;
function getGateBodyHeight(inputs) {
  if (!inputs || inputs <= 1) return 30;
  return Math.max(30, (inputs - 1) * PORT_SPACING + 16);
}

function getGateGeometry(type, inputs) {
  const w = 44;
  const h = getGateBodyHeight(inputs || 2);
  switch (type) {
    case 'AND':
      return { inX: -w/2 - 10, outX: h/2 + 10, bodyX1: -w/2, bodyX2: h/2, bodyY1: -h/2, bodyY2: h/2 };
    case 'NAND':
      // outX moved 8px further right so port dot clears the bubble
      return { inX: -w/2 - 10, outX: h/2 + 18, bodyX1: -w/2, bodyX2: h/2, bodyY1: -h/2, bodyY2: h/2 };
    case 'OR':
      return { inX: -w/2 - 10, outX: w/2 + 16, bodyX1: -w/2, bodyX2: w/2+6, bodyY1: -h/2, bodyY2: h/2 };
    case 'NOR':
      // outX moved 8px further right so port dot clears the bubble
      return { inX: -w/2 - 10, outX: w/2 + 24, bodyX1: -w/2, bodyX2: w/2+6, bodyY1: -h/2, bodyY2: h/2 };
    case 'XOR':
      return { inX: -w/2 - 10, outX: w/2 + 16, bodyX1: -w/2, bodyX2: w/2+6, bodyY1: -h/2, bodyY2: h/2 };
    case 'XNOR':
      // outX moved 8px further right so port dot clears the bubble
      return { inX: -w/2 - 10, outX: w/2 + 24, bodyX1: -w/2, bodyX2: w/2+6, bodyY1: -h/2, bodyY2: h/2 };
    case 'NOT':
      return { inX: -28, outX: 36, bodyX1: -18, bodyX2: 26, bodyY1: -16, bodyY2: 16 };
    default:
      return { inX: -32, outX: 28, bodyX1: -22, bodyX2: 22, bodyY1: -h/2, bodyY2: h/2 };
  }
}

// ── ROTATION HELPERS ─────────────────────────────────────────────
function rotatePoint(lx, ly, angleDeg) {
  if (!angleDeg) return { x: lx, y: ly };
  const rad = angleDeg * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return { x: lx * cos - ly * sin, y: lx * sin + ly * cos };
}

function rotateWorldPoint(wx, wy, pivotX, pivotY, angleDeg) {
  const dx = wx - pivotX, dy = wy - pivotY;
  const rot = rotatePoint(dx, dy, angleDeg);
  return { x: pivotX + rot.x, y: pivotY + rot.y };
}

function getInputPort(comp, i) {
  if (comp.type === 'INPUT') return null;
  if (comp.type === 'OUTPUT') {
    const local = { x: -22, y: 0 };
    const rot = rotatePoint(local.x, local.y, comp.rotation || 0);
    return { x: comp.x + rot.x, y: comp.y + rot.y };
  }
  const geo = getGateGeometry(comp.type, comp.inputs);
  const total = comp.inputs;
  const bodyH = getGateBodyHeight(total);
  const margin = 8;
  const usable = bodyH - margin * 2;
  const spacing = total > 1 ? usable / (total - 1) : 0;
  const startY = -(bodyH / 2) + margin;
  const relY = total === 1 ? 0 : startY + i * spacing;
  const rot = rotatePoint(geo.inX, relY, comp.rotation || 0);
  return { x: comp.x + rot.x, y: comp.y + rot.y };
}

function getOutputPort(comp) {
  if (comp.type === 'OUTPUT') return null;
  if (comp.type === 'INPUT') {
    const rot = rotatePoint(30, 0, comp.rotation || 0);
    return { x: comp.x + rot.x, y: comp.y + rot.y };
  }
  const geo = getGateGeometry(comp.type, comp.inputs);
  const rot = rotatePoint(geo.outX, 0, comp.rotation || 0);
  return { x: comp.x + rot.x, y: comp.y + rot.y };
}

function getOutputPortBit(comp, bitIndex) {
  if (comp.type !== 'INPUT') return null;
  const bitWidth = comp.bitWidth || 1;
  const portSpacing = bitWidth > 1 ? 12 : 0;
  const portY = (bitIndex - (bitWidth - 1) / 2) * portSpacing;
  const rot = rotatePoint(30, portY, comp.rotation || 0);
  return { x: comp.x + rot.x, y: comp.y + rot.y };
}

// Helper to get output port for wire operations (handles multi-bit inputs)
function getWireStartOutputPort(comp, portIndex) {
  if (comp.type === 'INPUT' && (comp.bitWidth || 1) >= 2) {
    return getOutputPortBit(comp, portIndex);
  }
  return getOutputPort(comp);
}

function getCompBBox(comp, pad) {
  const size = Math.max(
    (comp.type === 'INPUT') ? 60 : (comp.type === 'OUTPUT') ? 44 : 80,
    comp.width || 80,
    comp.height || 60
  ) / 2 + (pad || 0);
  return {
    x1: comp.x - size,
    y1: comp.y - size,
    x2: comp.x + size,
    y2: comp.y + size
  };
}

// ── PORT HIT DETECTION ────────────────────────────────────────────
const PORT_HIT_RADIUS = 22;
let hoveredPort = null;

function getPortAt(wx, wy) {
  const threshold = PORT_HIT_RADIUS / viewScale;
  let best = null, bestDist = Infinity;
  for (const c of components) {
    if (c.type === 'LABEL') continue;
    
    // Handle multiple output ports for multi-bit INPUT
    if (c.type === 'INPUT') {
      const bitWidth = c.bitWidth || 1;
      for (let b = 0; b < bitWidth; b++) {
        const op = getOutputPortBit(c, b);
        if (op) {
          const d = Math.hypot(wx-op.x, wy-op.y);
          if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'output', portIndex: b, pt: op }; }
        }
      }
    } else {
      const op = getOutputPort(c);
      if (op) {
        const d = Math.hypot(wx-op.x, wy-op.y);
        if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'output', portIndex: 0, pt: op }; }
      }
    }
    
    for (let i = 0; i < c.inputs; i++) {
      const ip = getInputPort(c, i);
      if (ip) {
        const d = Math.hypot(wx-ip.x, wy-ip.y);
        if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'input', portIndex: i, pt: ip }; }
      }
    }
  }
  return best;
}

function getCompAt(wx, wy) {
  for (let i = components.length-1; i >= 0; i--) {
    const c = components[i];
    const bbox = getCompBBox(c, 8);
    if (wx >= bbox.x1 && wx <= bbox.x2 && wy >= bbox.y1 && wy <= bbox.y2) return c;
  }
  return null;
}

const SNAP_RADIUS = 50;
function getSnapTarget(wx, wy, startPort) {
  const threshold = SNAP_RADIUS / viewScale;
  let best = null, bestDist = Infinity;

  for (const c of components) {
    if (c.type === 'LABEL') continue;
    if (startPort) {
      if (startPort.portType === 'output') {
        if (c.id === startPort.comp.id) continue;
        for (let i = 0; i < c.inputs; i++) {
          const ip = getInputPort(c, i);
          if (!ip) continue;
          const d = Math.hypot(wx - ip.x, wy - ip.y);
          if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'input', portIndex: i, pt: ip }; }
        }
      } else {
        if (c.id === startPort.comp.id) continue;
        // Handle multiple output ports for multi-bit INPUT
        if (c.type === 'INPUT') {
          const bitWidth = c.bitWidth || 1;
          for (let b = 0; b < bitWidth; b++) {
            const op = getOutputPortBit(c, b);
            if (op) {
              const d = Math.hypot(wx - op.x, wy - op.y);
              if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'output', portIndex: b, pt: op }; }
            }
          }
        } else {
          const op = getOutputPort(c);
          if (op) {
            const d = Math.hypot(wx - op.x, wy - op.y);
            if (d < threshold && d < bestDist) { bestDist = d; best = { comp: c, portType: 'output', portIndex: 0, pt: op }; }
          }
        }
      }
    } else {
      // Handle multiple output ports for multi-bit INPUT
      if (c.type === 'INPUT') {
        const bitWidth = c.bitWidth || 1;
        for (let b = 0; b < bitWidth; b++) {
          const op = getOutputPortBit(c, b);
          if (op) {
            const d = Math.hypot(wx-op.x, wy-op.y);
            if (d < threshold && d < bestDist) { bestDist=d; best={comp:c,portType:'output',portIndex:b,pt:op}; }
          }
        }
      } else {
        const op = getOutputPort(c);
        if (op) { const d = Math.hypot(wx-op.x, wy-op.y); if (d < threshold && d < bestDist) { bestDist=d; best={comp:c,portType:'output',portIndex:0,pt:op}; } }
      }
      for (let i = 0; i < c.inputs; i++) {
        const ip = getInputPort(c, i);
        if (!ip) continue;
        const d = Math.hypot(wx-ip.x, wy-ip.y);
        if (d < threshold && d < bestDist) { bestDist=d; best={comp:c,portType:'input',portIndex:i,pt:ip}; }
      }
    }
  }
  return best;
}

// ── WIRE SEGMENT DRAGGING ─────────────────────────────────────────
let draggingWireSegment = null;
let wireDragStartX = 0, wireDragStartY = 0;

function getWireSegmentAt(px, py, wire) {
  const pts = getWirePointsForWire(wire);
  const thresh = 8 / viewScale;
  for (let i = 0; i < pts.length - 1; i++) {
    const ax = pts[i].x, ay = pts[i].y;
    const bx = pts[i+1].x, by = pts[i+1].y;
    if (distToSegment(px, py, ax, ay, bx, by) < thresh) {
      const isH = Math.abs(by - ay) < 1;
      return { segIndex: i, axis: isH ? 'h' : 'v' };
    }
  }
  return null;
}

// ── MOUSE HANDLERS ────────────────────────────────────────────────
let mouseX = 0, mouseY = 0;
function getCanvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
function getWorldPos(e) {
  const { x: sx, y: sy } = getCanvasPos(e);
  return screenToWorld(sx, sy);
}

function onMouseDown(e) {
  const sc = getCanvasPos(e);
  const { x, y } = screenToWorld(sc.x, sc.y);
  mouseX = x; mouseY = y;

  // Always allow pan (middle mouse or space+drag)
  if (e.button === 1 || spaceDown) {
    isPanning = true; panLastX = sc.x; panLastY = sc.y;
    if (e.button === 1) e.preventDefault();
    return;
  }
  if (e.button === 2) return;

  // ── STRICT SIM LOCK ───────────────────────────────────────────
  if (simRunning) {
    return;
  }

  // ── WHILE DRAWING A WIRE (not sim) ────────────────────────────
  if (drawingWire) {
    const snap = getSnapTarget(x, y, wireStartPort);
    if (snap) { finishWire(snap); return; }

    // Compute the last known point the wire is routing from
    const lastPt = wireCorners.length > 0
      ? wireCorners[wireCorners.length - 1]
      : (wireStartPort.portType === 'output'
          ? getWireStartOutputPort(wireStartPort.comp, wireStartPort.portIndex)
          : getInputPort(wireStartPort.comp, wireStartPort.portIndex));

    // Use the same orthogonal routing the preview shows so the placed
    // segments exactly match the blue dashed suggestion
    const clickTarget = { x, y };
    const routeFrom = wireStartPort.portType === 'output' ? lastPt : clickTarget;
    const routeTo   = wireStartPort.portType === 'output' ? clickTarget : lastPt;
    const excludeIds = new Set([wireStartPort.comp.id]);
    const orthoCorners = computeSmartCorners(routeFrom, routeTo, excludeIds);

    const before = wireCorners.length;
    if (orthoCorners.length > 0 && wireStartPort.portType === 'output') {
      orthoCorners.forEach(c => wireCorners.push({ x: c.x, y: c.y }));
    } else if (orthoCorners.length > 0 && wireStartPort.portType === 'input') {
      [...orthoCorners].reverse().forEach(c => wireCorners.push({ x: c.x, y: c.y }));
    } else {
      wireCorners.push({ x, y });
    }
    // Track how many corners this single click added so Backspace undoes one click at a time
    _wireClickSizes.push(wireCorners.length - before);

    updateWireStatusBar(); redrawCanvas(); return;
  }

  // ── PORT CLICK → START WIRE ───────────────────────────────────
  const portHit = getPortAt(x, y);
  if (portHit) {
    if (portHit.portType === 'input') {
      const existingIdx = wires.findIndex(w => w.toComp === portHit.comp.id && w.toPort === portHit.portIndex);
      if (existingIdx >= 0) {
        saveState();
        const detached = wires[existingIdx];
        wires.splice(existingIdx, 1);
        const srcComp = detached.fromComp ? components.find(c => c.id === detached.fromComp) : null;
        if (srcComp) {
          const portIdx = detached.fromPort || 0;
          startWire({ comp: srcComp, portType: 'output', portIndex: portIdx, pt: getWireStartOutputPort(srcComp, portIdx) }, x, y);
        } else {
          startWire(portHit, x, y);
        }
        redrawCanvas(); return;
      }
    }
    startWire(portHit, x, y);
    return;
  }

  // ── COMPONENT CLICK ───────────────────────────────────────────
  const comp = getCompAt(x, y);
  if (comp) {
    // Group drag
    if (groupSelected.length > 0 && groupSelected.includes(comp.id)) {
      groupDragging = true;
      groupDragStartX = x; groupDragStartY = y;
      groupDragOrigPos = groupSelected.map(id => {
        const c = components.find(cc => cc.id === id);
        return { id, x: c.x, y: c.y };
      });
      const ids = new Set(groupSelected);
      groupDragOrigWires = wires
        .filter(w => ids.has(w.fromComp) || ids.has(w.toComp))
        .map(w => ({
          ref: w,
          fromIn: ids.has(w.fromComp),
          toIn: ids.has(w.toComp),
          corners: (w.corners || []).map(c => ({ x: c.x, y: c.y }))
        }));
      return;
    }

    selectedWire = null; groupSelected = [];
    selectedComp = comp;

    draggingComp = comp;
    dragOffX = x - comp.x;
    dragOffY = y - comp.y;
    updatePropsPanel(); redrawCanvas();
    return;
  }

  // ── WIRE SEGMENT DRAG ─────────────────────────────────────────
  for (let i = wires.length - 1; i >= 0; i--) {
    const seg = getWireSegmentAt(x, y, wires[i]);
    if (seg) {
      const wire = wires[i];
      const pts = getWirePointsForWire(wire);
      if (!wire.corners || wire.corners.length === 0) {
        wire.corners = pts.slice(1, -1).map(p => ({ x: p.x, y: p.y }));
      }
      draggingWireSegment = { wire, segIndex: seg.segIndex, axis: seg.axis, pts: pts.map(p => ({ x: p.x, y: p.y })) };
      wireDragStartX = x; wireDragStartY = y;
      selectedWire = wire; selectedComp = null;
      redrawCanvas(); return;
    }
  }

  // ── WIRE CLICK → SELECT ───────────────────────────────────────
  const hitWire = getWireAt(x, y);
  if (hitWire) {
    selectedComp = null; groupSelected = [];
    selectedWire = selectedWire === hitWire ? null : hitWire;
    updatePropsPanel(); redrawCanvas();
    if (selectedWire) showToast('Wire selected — Delete/Backspace to remove', 'info');
    return;
  }

  // ── EMPTY CANVAS → LASSO ──────────────────────────────────────
  selectedWire = null;
  groupSelecting = true;
  groupSelStartX = x; groupSelStartY = y;
  groupSelCurX = x; groupSelCurY = y;
  if (selectedComp) { selectedComp = null; updatePropsPanel(); }
  redrawCanvas();
}

function startWire(portInfo, wx, wy) {
  drawingWire = true;
  wireStartPort = portInfo;
  wireLiveEnd = { x: wx, y: wy, snapped: false, snapPort: null };
  wireCorners = [];
  canvas.style.cursor = 'crosshair';
  updateWireStatusBar();
  showToast(
    portInfo.portType === 'output'
      ? 'Wiring from output → click any input port to connect'
      : 'Wiring from input → click any output port to connect',
    'info'
  );
  redrawCanvas();
}

function finishWire(targetPort) {
  if (!wireStartPort) { cancelWire(); return; }

  let fromPort, toPort;
  if (wireStartPort.portType === 'output' && targetPort.portType === 'input') {
    fromPort = wireStartPort; toPort = targetPort;
  } else if (wireStartPort.portType === 'input' && targetPort.portType === 'output') {
    fromPort = targetPort; toPort = wireStartPort;
  } else {
    showToast('Connect an output port to an input port', 'error');
    cancelWire(); return;
  }

  if (fromPort.comp.id === toPort.comp.id) {
    showToast('Cannot connect a gate to itself', 'error');
    cancelWire(); return;
  }

  const existing = wires.find(w => w.toComp === toPort.comp.id && w.toPort === toPort.portIndex);
  if (existing) {
    showToast('That input is already connected — click it to re-wire', 'error');
    cancelWire(); return;
  }

  saveState();
  const from = getWireStartOutputPort(fromPort.comp, fromPort.portIndex);
  const to = getInputPort(toPort.comp, toPort.portIndex);
  const excludeIds = new Set([fromPort.comp.id, toPort.comp.id]);

  let finalCorners;
  if (wireCorners.length > 0) {
    // Corners were placed in the order the user clicked.
    // Output-started: clicks go output→input, already in correct order.
    // Input-started:  clicks go input→output, must reverse so stored corners go output→input.
    finalCorners = wireStartPort.portType === 'output' ? [...wireCorners] : [...wireCorners].reverse();
  } else {
    finalCorners = from && to ? computeSmartCorners(from, to, excludeIds) : [];
  }

  wires.push({ fromComp: fromPort.comp.id, fromPort: fromPort.portIndex || 0, fromNode: null, toComp: toPort.comp.id, toPort: toPort.portIndex, corners: finalCorners });

  showToast('Connected!', 'success');
  cancelWire();
}

let spaceDown = false;
window.addEventListener('keydown', e => {
  if (e.key === ' ' && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
    spaceDown = true;
    if (canvas) canvas.style.cursor = 'grab';
    e.preventDefault();
  }
  if (e.key === 'Escape') {
    if (drawingWire) { cancelWire(); return; }
    if (selectedWire) { selectedWire = null; redrawCanvas(); return; }
    exitGroupSelect();
    // Deactivate temp label if active
    if (typeof window._stopTempLabel !== 'undefined' && window.isTempLabelActive()) { window._stopTempLabel(); return; }
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && !['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
    e.preventDefault();
    if (drawingWire) {
      if (wireCorners.length > 0) {
        const n = _wireClickSizes.length > 0 ? _wireClickSizes.pop() : 1;
        for (let i = 0; i < n; i++) wireCorners.pop();
        updateWireStatusBar(); redrawCanvas();
      }
      return;
    }
    // STRICT SIM LOCK: no deletion during simulation
    if (simRunning) {
      showToast('🔒 Stop simulation before deleting', 'error');
      return;
    }
    if (groupSelected.length) { deleteGroupSelected(); return; }
    if (selectedWire) { deleteSelectedWire(); return; }
    if (selectedComp) { deleteSelected(); return; }
  }
  // R key to rotate
  if (e.key === 'r' || e.key === 'R') {
    if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
    if (simRunning) {
      showToast('🔒 Stop simulation before rotating', 'error');
      return;
    }
    if (groupSelected.length > 0) {
      rotateGroupSelected(90); return;
    }
    if (selectedComp) {
      rotateComponent(selectedComp, 90); return;
    }
  }
  if (e.ctrlKey && e.key === 'a') {
    if (!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      selectAllCanvasComponents();
    }
  }
  if (e.ctrlKey && e.key === 'c') {
    if (!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      copySelected();
    }
  }
  if (e.ctrlKey && e.key === 'v') {
    if (!['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) {
      e.preventDefault();
      pasteClipboard();
    }
  }
  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undoAction(); }
  if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redoAction(); }
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveCircuit(); }
});
window.addEventListener('keyup', e => {
  if (e.key === ' ') {
    spaceDown = false;
    if (canvas) canvas.style.cursor = drawingWire ? 'crosshair' : '';
    if (isPanning) isPanning = false;
  }
});

function cancelWire() {
  drawingWire = false; wireStartPort = null; wireCorners = []; wireLiveEnd = null;
  _wireClickSizes = [];
  if (canvas) canvas.style.cursor = '';
  updateWireStatusBar(); redrawCanvas();
}

function deleteSelectedWire() {
  if (!selectedWire) return;
  saveState();
  wires = wires.filter(w => w !== selectedWire);
  selectedWire = null;
  if (simRunning) propagate();
  redrawCanvas(); showToast('Wire deleted', 'info');
}

function updateWireStatusBar() {
  const ws = document.getElementById('wireStatus');
  if (!ws) return;
  if (drawingWire && wireStartPort) {
    ws.style.display = 'flex';
    const fromType = wireStartPort.portType;
    const toType = wireStartPort.portType === 'output' ? 'input' : 'output';
    const corners = wireCorners.length;
    const cornerText = corners > 0 ? ` &nbsp;<b style="color:#ffc832">${corners} anchor${corners!==1?'s':''}</b>` : '';
    ws.innerHTML = `<i class="fa fa-project-diagram"></i>&nbsp; Wiring from <b style="color:#00e5a0">${fromType}</b>${cornerText} → hover <b style="color:#4a9eff">${toType}</b> port &nbsp;|&nbsp; <b>click canvas</b> to anchor &nbsp;|&nbsp; <kbd>Backspace</kbd> undo &nbsp;|&nbsp; <kbd>Esc</kbd> cancel`;
  } else {
    ws.style.display = 'none';
  }
}

function onMouseMove(e) {
  const sc = getCanvasPos(e);
  const { x, y } = screenToWorld(sc.x, sc.y);
  mouseX = x; mouseY = y;

  if (isPanning) {
    viewOffX += sc.x - panLastX; viewOffY += sc.y - panLastY;
    panLastX = sc.x; panLastY = sc.y;
    redrawCanvas(); return;
  }

  // STRICT SIM LOCK: no dragging of any kind during simulation
  if (simRunning) {
    const prevCursor = canvas.style.cursor;
    if (spaceDown) {
      canvas.style.cursor = 'grab';
    } else {
      const comp = getCompAt(x, y);
      canvas.style.cursor = comp && comp.type === 'INPUT' ? 'pointer' : 'not-allowed';
    }
    hoveredPort = null;
    if (prevCursor !== canvas.style.cursor) redrawCanvas();
    return;
  }

  if (groupDragging) {
    const dx = x - groupDragStartX, dy = y - groupDragStartY;
    groupDragOrigPos.forEach(o => {
      const c = components.find(cc => cc.id === o.id);
      if (c) { c.x = o.x + dx; c.y = o.y + dy; }
    });
    groupDragOrigWires.forEach(ow => {
      const wire = wires.find(w => w === ow.ref);
      if (!wire) return;
      if (ow.fromIn && ow.toIn) {
        wire.corners = ow.corners.map(c => ({ x: c.x + dx, y: c.y + dy }));
      } else { rerouteWire(wire); }
    });
    redrawCanvas(); return;
  }

  if (groupSelecting) { groupSelCurX = x; groupSelCurY = y; redrawCanvas(); return; }

  if (draggingWireSegment) {
    const { wire, segIndex, axis, pts } = draggingWireSegment;
    const dx = x - wireDragStartX, dy = y - wireDragStartY;
    const newCorners = pts.slice(1, -1).map(p => ({ x: p.x, y: p.y }));
    if (axis === 'h') {
      if (segIndex === 0) {
        if (newCorners.length > 0) newCorners[0].y = pts[1].y + dy;
        else { const midX = (pts[0].x + pts[pts.length-1].x) / 2; newCorners.push({ x: midX, y: pts[0].y + dy }); newCorners.push({ x: midX, y: pts[pts.length-1].y }); }
      } else if (segIndex === pts.length - 2) {
        if (newCorners.length > 0) newCorners[newCorners.length-1].y = pts[pts.length-2].y + dy;
      } else {
        const ci = segIndex - 1;
        if (ci >= 0 && ci < newCorners.length) newCorners[ci].y += dy;
        if (ci + 1 >= 0 && ci + 1 < newCorners.length) newCorners[ci+1].y += dy;
      }
    } else {
      if (segIndex === 0) {
        if (newCorners.length > 0) newCorners[0].x = pts[1].x + dx;
        else { newCorners.push({ x: pts[0].x + dx, y: pts[0].y }); newCorners.push({ x: pts[0].x + dx, y: pts[pts.length-1].y }); }
      } else if (segIndex === pts.length - 2) {
        if (newCorners.length > 0) newCorners[newCorners.length-1].x = pts[pts.length-2].x + dx;
      } else {
        const ci = segIndex - 1;
        if (ci >= 0 && ci < newCorners.length) newCorners[ci].x += dx;
        if (ci + 1 >= 0 && ci + 1 < newCorners.length) newCorners[ci+1].x += dx;
      }
    }
    wire.corners = newCorners;
    redrawCanvas(); return;
  }

  if (draggingComp) {
    draggingComp.x = x - dragOffX;
    draggingComp.y = y - dragOffY;
    wires.forEach(w => {
      if (w.fromComp === draggingComp.id || w.toComp === draggingComp.id) rerouteWire(w);
    });
    redrawCanvas(); return;
  }

  if (drawingWire && wireStartPort) {
    const snap = getSnapTarget(x, y, wireStartPort);
    if (snap) {
      wireLiveEnd = { x: snap.pt.x, y: snap.pt.y, snapped: true, snapPort: snap };
      canvas.style.cursor = 'cell';
    } else {
      wireLiveEnd = { x, y, snapped: false, snapPort: null };
      canvas.style.cursor = 'crosshair';
    }
    hoveredPort = getPortAt(x, y);
    redrawCanvas(); return;
  }

  const prevHovered = hoveredPort;
  hoveredPort = getPortAt(x, y);

  let overSegment = false;
  if (!hoveredPort) {
    for (const wire of wires) {
      if (getWireSegmentAt(x, y, wire)) { overSegment = true; break; }
    }
  }

  if (hoveredPort) {
    canvas.style.cursor = hoveredPort.portType === 'output' ? 'crosshair' : 'cell';
  } else if (overSegment) {
    canvas.style.cursor = 'row-resize';
  } else if (getCompAt(x, y)) {
    canvas.style.cursor = 'grab';
  } else {
    canvas.style.cursor = 'default';
  }

  if (prevHovered !== hoveredPort) redrawCanvas();
}

function onMouseUp(e) {
  const sc = getCanvasPos(e);
  const { x, y } = screenToWorld(sc.x, sc.y);

  if (isPanning) { isPanning = false; canvas.style.cursor = simRunning ? 'not-allowed' : ''; return; }

  // STRICT SIM LOCK: discard any dragging state during sim
  if (simRunning) {
    draggingComp = null; draggingWireSegment = null; groupDragging = false;
    return;
  }

  if (groupDragging) { saveState(); groupDragging = false; redrawCanvas(); return; }
  if (draggingWireSegment) { saveState(); draggingWireSegment = null; canvas.style.cursor = ''; redrawCanvas(); return; }

  if (groupSelecting) {
    groupSelecting = false;
    const x1 = Math.min(groupSelStartX, groupSelCurX), y1 = Math.min(groupSelStartY, groupSelCurY);
    const x2 = Math.max(groupSelStartX, groupSelCurX), y2 = Math.max(groupSelStartY, groupSelCurY);
    if (Math.abs(x2-x1) > 5 || Math.abs(y2-y1) > 5) {
      groupSelected = components.filter(c => c.x >= x1 && c.x <= x2 && c.y >= y1 && c.y <= y2).map(c => c.id);
      if (groupSelected.length) showToast(groupSelected.length + ' component(s) selected. Press R to rotate group.', 'info');
    } else {
      groupSelected = []; selectedComp = null; updatePropsPanel();
    }
    redrawCanvas(); return;
  }

  if (draggingComp) { saveState(); draggingComp = null; canvas.style.cursor = ''; redrawCanvas(); return; }
  draggingComp = null;
}

function onDblClick(e) {
  const { x, y } = getWorldPos(e);
  if (drawingWire) { cancelWire(); return; }

  const comp = getCompAt(x, y);

  // INPUT handling
  if (comp && comp.type === 'INPUT') {
    // Multi-bit input (2-4 bits): open configuration modal
    if ((comp.bitWidth || 1) >= 2) {
      openInputBitConfigModal(comp);
      return;
    }
    // Single-bit input: toggle value
    saveState();
    comp.value = comp.value ? 0 : 1;
    comp.bitValues = [comp.value];
    if (simRunning) propagate();
    updatePropsPanel(); redrawCanvas();
    return;
  }

  // Everything else below only if not simulating
  if (simRunning) return;

  const hitWire = getWireAt(x, y);
  if (hitWire) {
    saveState(); hitWire.corners = []; rerouteWire(hitWire);
    showToast('Wire auto-routed', 'info'); redrawCanvas();
  }
}

// ── ROTATION ──────────────────────────────────────────────────────
function rotateComponent(comp, deg) {
  if (!comp) return;
  if (simRunning) { showToast('🔒 Stop simulation before rotating', 'error'); return; }
  saveState();

  const cx = comp.x, cy = comp.y;
  comp.rotation = ((comp.rotation || 0) + deg) % 360;

  wires.forEach(w => {
    if (w.fromComp === comp.id || w.toComp === comp.id) {
      if (w.corners && w.corners.length > 0) {
        w.corners = w.corners.map(pt => rotateWorldPoint(pt.x, pt.y, cx, cy, deg));
      }
      rerouteWire(w);
    }
  });

  redrawCanvas();
  showToast(`Rotated ${comp.id} to ${comp.rotation}°`, 'info');
  updatePropsPanel();
}

function rotateGroupSelected(deg) {
  if (!groupSelected.length) return;
  if (simRunning) { showToast('🔒 Stop simulation before rotating', 'error'); return; }
  saveState();

  const ids = new Set(groupSelected);
  const selectedComps = components.filter(c => ids.has(c.id));

  const cx = selectedComps.reduce((sum, c) => sum + c.x, 0) / selectedComps.length;
  const cy = selectedComps.reduce((sum, c) => sum + c.y, 0) / selectedComps.length;

  selectedComps.forEach(comp => {
    const rotPos = rotateWorldPoint(comp.x, comp.y, cx, cy, deg);
    comp.x = rotPos.x;
    comp.y = rotPos.y;
    comp.rotation = ((comp.rotation || 0) + deg) % 360;
  });

  wires.forEach(w => {
    const fromIn = ids.has(w.fromComp);
    const toIn = ids.has(w.toComp);

    if (fromIn || toIn) {
      if (w.corners && w.corners.length > 0) {
        w.corners = w.corners.map(pt => rotateWorldPoint(pt.x, pt.y, cx, cy, deg));
      }
      rerouteWire(w);
    }
  });

  redrawCanvas();
  showToast(`Group rotated ${deg}° (${groupSelected.length} components)`, 'info');
}

// ── RIGHT-CLICK: context menu ─────────────────────────────────────
const CTX_MENU_ID = 'ctxMenu';
function hideContextMenu() { const m = document.getElementById(CTX_MENU_ID); if (m) m.remove(); }

function showContextMenu(screenX, screenY, items) {
  hideContextMenu();
  const menu = document.createElement('div');
  menu.id = CTX_MENU_ID;
  menu.style.cssText = `position:fixed;left:${screenX}px;top:${screenY}px;background:#1a2540;border:1px solid #2e4070;border-radius:6px;box-shadow:0 8px 32px rgba(0,0,0,0.6);z-index:9000;min-width:190px;overflow:hidden;font-family:'Share Tech Mono',monospace;`;
  items.forEach(item => {
    if (item === 'sep') {
      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:#263655;margin:2px 0;';
      menu.appendChild(sep); return;
    }
    const btn = document.createElement('div');
    btn.style.cssText = `padding:10px 16px;cursor:pointer;font-size:12px;color:${item.color||'#dde6f5'};display:flex;align-items:center;gap:10px;transition:background 0.15s;`;
    btn.innerHTML = `<i class="fa ${item.icon}" style="width:14px;text-align:center"></i> ${item.label}`;
    btn.addEventListener('mouseenter', () => btn.style.background = '#263655');
    btn.addEventListener('mouseleave', () => btn.style.background = '');
    btn.addEventListener('mousedown', ev => { ev.stopPropagation(); hideContextMenu(); item.action(); });
    menu.appendChild(btn);
  });
  document.body.appendChild(menu);
  setTimeout(() => document.addEventListener('mousedown', hideContextMenu, { once: true }), 10);
}

function onRightClick(e) {
  e.preventDefault();
  if (drawingWire) { cancelWire(); return; }

  // During simulation, right-click does nothing on canvas
  if (simRunning) return;

  const { x, y } = getWorldPos(e);
  const comp = getCompAt(x, y);

  if (groupSelected.length > 0 && comp && groupSelected.includes(comp.id)) {
    const menuItems = [
      { icon: 'fa-copy', label: `Block Copy (${groupSelected.length})`, action: () => blockCopy() },
      { icon: 'fa-redo', label: 'Rotate Group 90°', action: () => rotateGroupSelected(90) },
      { icon: 'fa-redo', label: 'Rotate Group 180°', action: () => rotateGroupSelected(180) },
      'sep',
      { icon: 'fa-trash', label: `Block Delete (${groupSelected.length})`, color: '#ef4444', action: () => deleteGroupSelected() },
      'sep',
      { icon: 'fa-times-circle', label: 'Deselect All', action: () => { groupSelected = []; redrawCanvas(); } }
    ];
    showContextMenu(e.clientX, e.clientY, menuItems);
    return;
  }

  if (comp) {
    selectedComp = comp; selectedWire = null; updatePropsPanel(); redrawCanvas();
    const menuItems = [
      { icon: 'fa-redo', label: 'Rotate 90° (R)', action: () => rotateComponent(comp, 90) },
      { icon: 'fa-redo', label: 'Rotate 180°', action: () => rotateComponent(comp, 180) },
      { icon: 'fa-undo', label: 'Rotate -90°', action: () => rotateComponent(comp, 270) },
      'sep',
      { icon: 'fa-copy', label: 'Duplicate', action: () => duplicateComp(comp) },
      { icon: 'fa-trash', label: 'Delete', color: '#ef4444', action: () => { selectedComp = comp; deleteSelected(); } }
    ];
    showContextMenu(e.clientX, e.clientY, menuItems);
    return;
  }

  for (let i = wires.length-1; i >= 0; i--) {
    if (isPointOnWire(x, y, wires[i])) {
      selectedWire = wires[i]; selectedComp = null; redrawCanvas();
      const wireMenuItems = [
        {
          icon: 'fa-trash', label: 'Delete Wire', color: '#ef4444',
          action: () => { saveState(); wires.splice(i, 1); selectedWire = null; redrawCanvas(); showToast('Wire deleted', 'info'); }
        },
        {
          icon: 'fa-undo', label: 'Auto-route',
          action: () => { saveState(); wires[i].corners = []; rerouteWire(wires[i]); redrawCanvas(); showToast('Wire auto-routed', 'info'); }
        }
      ];
      showContextMenu(e.clientX, e.clientY, wireMenuItems);
      return;
    }
  }
}

function duplicateComp(comp) {
  saveState();
  const newComp = JSON.parse(JSON.stringify(comp));
  newComp.id = 'G' + (++compCounter);
  newComp.label = newComp.id;
  newComp.x += 40; newComp.y += 40;
  components.push(newComp);
  selectedComp = newComp;
  updatePropsPanel(); redrawCanvas();
  showToast('Duplicated ' + comp.id, 'success');
}

function blockCopy() {
  if (!groupSelected.length) return;
  saveState();
  const idMap = {};
  const newComps = [];
  const OFFSET = 50;
  groupSelected.forEach(id => {
    const c = components.find(cc => cc.id === id);
    if (!c) return;
    const nc = JSON.parse(JSON.stringify(c));
    nc.id = 'G' + (++compCounter);
    nc.label = nc.id;
    nc.x += OFFSET; nc.y += OFFSET;
    idMap[c.id] = nc.id;
    components.push(nc); newComps.push(nc);
  });
  const origWireCount = wires.length;
  for (let i = 0; i < origWireCount; i++) {
    const w = wires[i];
    if (idMap[w.fromComp] && idMap[w.toComp]) {
      const newCorners = w.corners ? w.corners.map(c => ({ x: c.x + OFFSET, y: c.y + OFFSET })) : [];
      wires.push({ ...w, fromComp: idMap[w.fromComp], toComp: idMap[w.toComp], corners: newCorners });
    }
  }
  groupSelected = newComps.map(c => c.id);
  redrawCanvas(); showToast('Block copied ' + newComps.length + ' components', 'success');
}

// ── NODE / WIRE HIT DETECTION ─────────────────────────────────────
function getNodeAt(wx, wy) {
  const threshold = 10/viewScale;
  return nodes.find(n => Math.hypot(wx-n.x, wy-n.y) < threshold) || null;
}
function getWireAt(wx, wy) {
  for (let i = wires.length-1; i >= 0; i--) {
    if (isPointOnWire(wx, wy, wires[i])) return wires[i];
  }
  return null;
}
function isPointOnWire(px, py, wire) {
  const pts = getWirePointsForWire(wire);
  for (let i = 0; i < pts.length-1; i++) {
    if (distToSegment(px, py, pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y) < 8/viewScale) return true;
  }
  return false;
}
function distToSegment(px, py, ax, ay, bx, by) {
  const dx=bx-ax, dy=by-ay;
  if (dx===0&&dy===0) return Math.hypot(px-ax,py-ay);
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy)));
  return Math.hypot(px-(ax+t*dx), py-(ay+t*dy));
}

// ── WIRE ROUTING ─────────────────────────────────────────────────
function getWirePointsForWire(wire) {
  let fromPt = null, toPt = null;
  if (wire.fromNode) {
    const n = nodes.find(nd => nd.id === wire.fromNode);
    if (n) fromPt = { x: n.x, y: n.y };
  } else if (wire.fromComp) {
    const from = components.find(c => c.id === wire.fromComp);
    if (from) fromPt = getWireStartOutputPort(from, wire.fromPort || 0);
  }
  if (wire.toNode) {
    const n = nodes.find(nd => nd.id === wire.toNode);
    if (n) toPt = { x: n.x, y: n.y };
  } else if (wire.toComp) {
    const to = components.find(c => c.id === wire.toComp);
    if (to) toPt = getInputPort(to, wire.toPort);
  }
  if (!fromPt || !toPt) return [];
  if (wire.corners && wire.corners.length > 0) return [fromPt, ...wire.corners, toPt];
  const excludeIds = new Set([wire.fromComp, wire.toComp].filter(Boolean));
  return defaultOrthogonal(fromPt, toPt, excludeIds);
}

function rerouteWire(wire) {
  let fromPt = null, toPt = null;
  if (wire.fromNode) {
    const n = nodes.find(nd => nd.id === wire.fromNode);
    if (n) fromPt = { x: n.x, y: n.y };
  } else if (wire.fromComp) {
    const fc = components.find(c => c.id === wire.fromComp);
    if (fc) fromPt = getWireStartOutputPort(fc, wire.fromPort || 0);
  }
  if (wire.toNode) {
    const n = nodes.find(nd => nd.id === wire.toNode);
    if (n) toPt = { x: n.x, y: n.y };
  } else if (wire.toComp) {
    const tc = components.find(c => c.id === wire.toComp);
    if (tc) toPt = getInputPort(tc, wire.toPort);
  }
  if (!fromPt || !toPt) return;
  const excludeIds = new Set([wire.fromComp, wire.toComp].filter(Boolean));
  wire.corners = computeSmartCorners(fromPt, toPt, excludeIds);
}

function computeSmartCorners(from, to, excludeIds) {
  if (!from || !to) return [];
  if (Math.abs(from.y - to.y) < 2) return [];
  const PAD = 16;
  const STUB = 20;
  const boxes = components
    .filter(c => !excludeIds || !excludeIds.has(c.id))
    .map(c => getCompBBox(c, PAD));

  const fromRight = from.x + STUB;
  const toLeft = to.x - STUB;

  function clearVertical(x, y1, y2) {
    const loY = Math.min(y1, y2), hiY = Math.max(y1, y2);
    return !boxes.some(b => x > b.x1 && x < b.x2 && hiY > b.y1 && loY < b.y2);
  }
  function clearHorizontal(y, x1, x2) {
    const loX = Math.min(x1, x2), hiX = Math.max(x1, x2);
    return !boxes.some(b => y > b.y1 && y < b.y2 && hiX > b.x1 && loX < b.x2);
  }

  if (clearVertical(fromRight, from.y, to.y) && clearHorizontal(to.y, fromRight, to.x))
    return [{ x: fromRight, y: from.y }, { x: fromRight, y: to.y }];

  const mid = (from.x + to.x) / 2;
  if (clearVertical(mid, from.y, to.y) && clearHorizontal(to.y, mid, to.x))
    return [{ x: mid, y: from.y }, { x: mid, y: to.y }];

  for (let d = 10; d <= 400; d += 10) {
    const cx1 = mid + d, cx2 = mid - d;
    if (clearVertical(cx1, from.y, to.y) && clearHorizontal(to.y, cx1, to.x))
      return [{ x: cx1, y: from.y }, { x: cx1, y: to.y }];
    if (clearVertical(cx2, from.y, to.y) && clearHorizontal(to.y, cx2, to.x))
      return [{ x: cx2, y: from.y }, { x: cx2, y: to.y }];
  }

  const safeX = Math.max(from.x, to.x) + 60;
  return [{ x: safeX, y: from.y }, { x: safeX, y: to.y }];
}

function defaultOrthogonal(from, to, excludeIds) {
  const corners = computeSmartCorners(from, to, excludeIds);
  if (corners.length === 0) return [from, to];
  return [from, ...corners, to];
}

// ── CANVAS DRAWING ────────────────────────────────────────────────
function redrawCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(viewOffX, viewOffY);
  ctx.scale(viewScale, viewScale);

  for (const wire of wires) drawWire(wire);

  if (drawingWire && wireStartPort && wireLiveEnd) {
    const startPt = wireStartPort.portType === 'output'
      ? getWireStartOutputPort(wireStartPort.comp, wireStartPort.portIndex)
      : getInputPort(wireStartPort.comp, wireStartPort.portIndex);

    if (startPt) {
      const target = wireLiveEnd.snapped && wireLiveEnd.snapPort ? wireLiveEnd.snapPort.pt : wireLiveEnd;
      let allPts;
      // Exclude both endpoint components from obstacle routing, mirroring finishWire exactly
      const previewExcludeIds = new Set([wireStartPort.comp.id]);
      if (wireLiveEnd.snapped && wireLiveEnd.snapPort) {
        previewExcludeIds.add(wireLiveEnd.snapPort.comp.id);
      }

      if (wireCorners.length > 0) {
        // Corners were placed in click order. Display them the same way finishWire stores them:
        // output-started → [startPt, ...corners, target]
        // input-started  → [target, ...reversedCorners, startPt]  (mirrors finishWire's reverse)
        if (wireStartPort.portType === 'output') {
          allPts = [startPt, ...wireCorners, target];
        } else {
          allPts = [target, ...[...wireCorners].reverse(), startPt];
        }
      } else {
        // No manual corners — auto-route from output to input
        let routeFrom, routeTo;
        if (wireStartPort.portType === 'output') { routeFrom = startPt; routeTo = target; }
        else { routeFrom = target; routeTo = startPt; }
        const corners = computeSmartCorners(routeFrom, routeTo, previewExcludeIds);
        if (wireStartPort.portType === 'output') {
          allPts = corners.length > 0 ? [startPt, ...corners, target] : [startPt, target];
        } else {
          allPts = corners.length > 0 ? [target, ...corners, startPt] : [target, startPt];
        }
      }
      ctx.save();
      if (wireLiveEnd.snapped) {
        ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]); ctx.shadowColor = '#4a9eff'; ctx.shadowBlur = 6;
      }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(allPts[0].x, allPts[0].y);
      for (let i = 1; i < allPts.length; i++) ctx.lineTo(allPts[i].x, allPts[i].y);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(startPt.x, startPt.y, 5, 0, Math.PI*2);
      ctx.fillStyle = wireLiveEnd.snapped ? '#00e5a0' : '#4a9eff';
      ctx.shadowBlur = wireLiveEnd.snapped ? 12 : 6; ctx.fill();
      if (wireCorners.length > 0) {
        ctx.shadowColor = '#ffc832'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffc832'; ctx.strokeStyle = '#1a2540'; ctx.lineWidth = 1.5;
        wireCorners.forEach(corner => { ctx.beginPath(); ctx.arc(corner.x, corner.y, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke(); });
      }
      if (wireLiveEnd.snapped && wireLiveEnd.snapPort) {
        const sp = wireLiveEnd.snapPort.pt;
        ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 20;
        ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 12, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 5, 0, Math.PI*2);
        ctx.fillStyle = '#00e5a0'; ctx.fill();
      }
      ctx.restore();
    }
  }

  for (const node of nodes) {
    ctx.beginPath(); ctx.arc(node.x, node.y, 5, 0, Math.PI*2);
    ctx.fillStyle = '#4a9eff'; ctx.fill();
    ctx.strokeStyle = '#2060c0'; ctx.lineWidth = 1.5; ctx.stroke();
  }

  for (const comp of components) drawComponent(comp);

  // Draw temporary label if active
  if (tempLabelActive) {
    _drawTempLabel();
  }

  if (hoveredPort && !simRunning) {
    const pt = hoveredPort.pt;
    ctx.save();
    const isOut = hoveredPort.portType === 'output';
    const col = isOut ? '#00e5a0' : '#4a9eff';
    ctx.strokeStyle = col; ctx.lineWidth = 1.5;
    ctx.shadowColor = col; ctx.shadowBlur = 16; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 13, 0, Math.PI*2); ctx.stroke();
    ctx.globalAlpha = 0.18; ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 13, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    const label = isOut ? '▶ OUT' : '◀ IN';
    ctx.font = 'bold 9px Share Tech Mono'; ctx.fillStyle = col; ctx.textAlign = 'center';
    ctx.fillText(label, pt.x, pt.y - 18);
    if (drawingWire && wireStartPort) {
      const isValidTarget =
        (wireStartPort.portType === 'output' && hoveredPort.portType === 'input' && hoveredPort.comp.id !== wireStartPort.comp.id) ||
        (wireStartPort.portType === 'input' && hoveredPort.portType === 'output' && hoveredPort.comp.id !== wireStartPort.comp.id);
      if (isValidTarget) { ctx.fillStyle = '#00e5a0'; ctx.font = 'bold 10px Share Tech Mono'; ctx.fillText('✓ CONNECT', pt.x, pt.y - 28); }
      else if (hoveredPort.comp.id === wireStartPort.comp.id) { ctx.fillStyle = '#ef4444'; ctx.font = 'bold 9px Share Tech Mono'; ctx.fillText('same gate', pt.x, pt.y - 28); }
      else { ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 9px Share Tech Mono'; ctx.fillText('wrong type', pt.x, pt.y - 28); }
    }
    ctx.globalAlpha = 1; ctx.restore();
  }

  if (draggingWireSegment) {
    const pts = getWirePointsForWire(draggingWireSegment.wire);
    if (pts.length > 1) {
      const si = draggingWireSegment.segIndex;
      const mx = (pts[si].x + pts[si+1].x) / 2, my = (pts[si].y + pts[si+1].y) / 2;
      ctx.save(); ctx.fillStyle = '#ffc832'; ctx.strokeStyle = '#1a2540'; ctx.lineWidth = 1;
      ctx.shadowColor = '#ffc832'; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.restore();
    }
  }

  if (groupSelecting) {
    ctx.save(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5;
    ctx.setLineDash([5,4]); ctx.fillStyle = 'rgba(59,130,246,0.07)';
    const rx = Math.min(groupSelStartX, groupSelCurX), ry = Math.min(groupSelStartY, groupSelCurY);
    const rw = Math.abs(groupSelCurX-groupSelStartX), rh = Math.abs(groupSelCurY-groupSelStartY);
    ctx.fillRect(rx,ry,rw,rh); ctx.strokeRect(rx,ry,rw,rh);
    ctx.setLineDash([]); ctx.restore();
  }

  if (groupSelected.length) {
    ctx.save(); ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2;
    ctx.setLineDash([4,3]); ctx.shadowColor='#3b82f6'; ctx.shadowBlur=8;
    groupSelected.forEach(id => {
      const c = components.find(cc => cc.id === id);
      if (c) {
        const bbox = getCompBBox(c, 12);
        ctx.strokeRect(bbox.x1, bbox.y1, bbox.x2 - bbox.x1, bbox.y2 - bbox.y1);
      }
    });
    ctx.setLineDash([]); ctx.restore();
  }

  ctx.restore();
}

function drawWire(wire) {
  const pts = getWirePointsForWire(wire);
  if (!pts || pts.length < 2) return;
  let active = false;
  if (simRunning && wire.fromComp) {
    const from = components.find(c => c.id === wire.fromComp);
    if (from) {
      // For multi-bit INPUTs, use the specific bit value; otherwise use overall value
      active = getComponentOutputValue(from, wire.fromPort) === 1;
    }
  }
  const isSelected = (wire === selectedWire);
  const isBeingDragged = draggingWireSegment && draggingWireSegment.wire === wire;

  ctx.save();
  if (isSelected || isBeingDragged) {
    ctx.strokeStyle = isBeingDragged ? 'rgba(255,200,50,0.5)' : 'rgba(255,200,50,0.3)';
    ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
  if (active) { ctx.strokeStyle = '#00e5a0'; ctx.lineWidth = 2.5; ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 8; }
  else if (isSelected || isBeingDragged) { ctx.strokeStyle = '#ffc832'; ctx.lineWidth = 2.5; ctx.shadowColor = '#ffc832'; ctx.shadowBlur = 6; }
  else { ctx.strokeStyle = '#4a9eff'; ctx.lineWidth = 2; ctx.shadowBlur = 0; }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.beginPath(); ctx.arc(pts[0].x, pts[0].y, 3, 0, Math.PI*2);
  ctx.fillStyle = active ? '#00e5a0' : (isSelected ? '#ffc832' : '#4a9eff'); ctx.fill();

  if (isSelected && !simRunning) {
    ctx.shadowBlur = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i+1].x) / 2, my = (pts[i].y + pts[i+1].y) / 2;
      const segLen = Math.hypot(pts[i+1].x - pts[i].x, pts[i+1].y - pts[i].y);
      if (segLen < 16) continue;
      ctx.fillStyle = 'rgba(255,200,50,0.6)'; ctx.strokeStyle = '#1a2540'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(mx, my, 4, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    }
  }
  ctx.restore();
}

function getNodeValue(nodeId) {
  const feeder = wires.find(w => w.toNode === nodeId);
  if (!feeder) return 0;
  if (feeder.fromComp) {
    const c = components.find(cc => cc.id === feeder.fromComp);
    return c ? c.value : 0;
  }
  return 0;
}

function drawComponent(comp) {
  ctx.save();
  const isSelected = (selectedComp && selectedComp.id === comp.id);
  if (isSelected) { ctx.shadowColor='#3b82f6'; ctx.shadowBlur=18; }
  if (comp.type === 'INPUT') drawInputSwitch(comp, isSelected);
  else if (comp.type === 'OUTPUT') drawOutputLED(comp, isSelected);
  else drawLogicGate(comp, isSelected);
  ctx.restore();
}

function drawLogicGate(comp, selected) {
  ctx.save();
  ctx.translate(comp.x, comp.y);
  if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);

  drawGateOnCanvas(ctx, comp.type, 0, 0, 1.0, simRunning, comp.inputs);

  const portR = 5;
  const geo = getGateGeometry(comp.type, comp.inputs);

  for (let i = 0; i < comp.inputs; i++) {
    const ip_local = (() => {
      const total = comp.inputs;
      const bodyH = getGateBodyHeight(total);
      const margin = 8;
      const usable = bodyH - margin * 2;
      const spacing = total > 1 ? usable / (total - 1) : 0;
      const startY = -(bodyH / 2) + margin;
      const relY = total === 1 ? 0 : startY + i * spacing;
      return { x: geo.inX, y: relY };
    })();

    const connected = wires.some(w => w.toComp === comp.id && w.toPort === i);
    const isHovered = !simRunning && hoveredPort && hoveredPort.comp.id === comp.id &&
      hoveredPort.portType === 'input' && hoveredPort.portIndex === i;

    ctx.beginPath();
    ctx.strokeStyle = connected ? '#4a9eff' : (isHovered ? '#4a9eff' : '#263655');
    ctx.lineWidth = 1.5;
    ctx.moveTo(geo.inX + 10, ip_local.y); ctx.lineTo(ip_local.x, ip_local.y);
    ctx.stroke();

    if (isHovered) { ctx.shadowColor = '#4a9eff'; ctx.shadowBlur = 10; }
    ctx.beginPath(); ctx.arc(ip_local.x, ip_local.y, isHovered ? portR + 2 : portR, 0, Math.PI*2);
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = connected ? '#4a9eff' : (isHovered ? '#00e5a0' : '#ef4444');
    ctx.lineWidth = isHovered ? 2.5 : 1.5; ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    if (comp.inputs >= 4) {
      ctx.font = '8px Share Tech Mono'; ctx.fillStyle = '#4a6080'; ctx.textAlign = 'left';
      ctx.fillText(i, ip_local.x + 7, ip_local.y + 3);
    }
  }

  const op_local = { x: geo.outX, y: 0 };
  const isOutHovered = !simRunning && hoveredPort && hoveredPort.comp.id === comp.id && hoveredPort.portType === 'output';
  if (isOutHovered) { ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 10; }
  ctx.beginPath(); ctx.arc(op_local.x, op_local.y, isOutHovered ? portR + 2 : portR, 0, Math.PI*2);
  ctx.fillStyle = '#0d1117';
  ctx.strokeStyle = (simRunning && comp.value) ? '#00e5a0' : (isOutHovered ? '#00e5a0' : '#4a9eff');
  ctx.lineWidth = isOutHovered ? 2.5 : 1.5; ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.restore();
  ctx.save();
  ctx.translate(comp.x, comp.y);
  ctx.font = '10px Share Tech Mono';
  ctx.fillStyle = selected ? '#3b82f6' : '#4a5568';
  ctx.textAlign = 'center';
  const geo2 = getGateGeometry(comp.type, comp.inputs);
  const labelOffset = Math.max(geo2.bodyY2, 22) + 16;
  ctx.fillText(comp.label || comp.id, 0, labelOffset);

  if (selected) {
    const bbox = getCompBBox(comp, 0);
    const r = Math.max(bbox.x2 - comp.x, bbox.y2 - comp.y) + 6;
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
    ctx.setLineDash([]);
    if (comp.rotation) {
      ctx.font = 'bold 9px Share Tech Mono'; ctx.fillStyle = '#60a5fa'; ctx.textAlign = 'center';
      ctx.fillText(comp.rotation + '°', 0, -r - 4);
    }
  }
  ctx.restore();
  return;
}

function drawInputSwitch(comp, selected) {
  const w=60, h=36;
  ctx.save(); ctx.translate(comp.x, comp.y);
  if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);
  const on = comp.value === 1;
  const bitWidth = comp.bitWidth || 1;
  ctx.fillStyle = on ? 'rgba(0,229,160,0.15)' : 'rgba(30,45,74,0.5)';
  ctx.strokeStyle = on ? '#00e5a0' : '#4a9eff';
  ctx.lineWidth=1.5;
  roundRect(ctx,-w/2,-h/2,w,h,6); ctx.fill(); ctx.stroke();
  ctx.font='bold 13px Share Tech Mono'; ctx.fillStyle = on ? '#00e5a0' : '#94a3b8';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  // For multi-bit inputs (2+), display based on displayMode; otherwise display 1/0
  let displayValue;
  if (bitWidth >= 2) {
    const mode = comp.displayMode || 'decimal';
    if (mode === 'binary') {
      displayValue = (comp.value || 0).toString(2).padStart(bitWidth, '0');
    } else {
      displayValue = String(comp.value || 0);
    }
  } else {
    displayValue = on ? '1' : '0';
  }
  ctx.fillText(displayValue, 0, 0);
  ctx.restore();
  
  // Draw output ports (one per bit)
  for (let b = 0; b < bitWidth; b++) {
    ctx.save();
    ctx.translate(comp.x, comp.y);
    if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);
    
    // Multiple ports spaced vertically
    const portSpacing = bitWidth > 1 ? 12 : 0;
    const portY = (b - (bitWidth - 1) / 2) * portSpacing;
    
    const isOutHovered = !simRunning && hoveredPort && hoveredPort.comp.id === comp.id 
                         && hoveredPort.portType === 'output' && hoveredPort.portIndex === b;
    if (isOutHovered) { ctx.shadowColor = '#00e5a0'; ctx.shadowBlur = 10; }
    
    ctx.beginPath(); 
    ctx.arc(w/2, portY, isOutHovered ? 7 : 5, 0, Math.PI*2);
    const bitValue = (comp.bitValues && comp.bitValues[b]) || ((comp.value >>> b) & 1);
    ctx.fillStyle='#0d1117'; 
    ctx.strokeStyle = (bitValue || isOutHovered) ? '#00e5a0' : '#4a9eff';
    ctx.lineWidth = isOutHovered ? 2.5 : 1.5; 
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }
  
  ctx.save(); ctx.translate(comp.x, comp.y);
  if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);
  if (selected) {
    ctx.strokeStyle='#3b82f6'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
    ctx.strokeRect(-w/2-6,-h/2-6,w+12,h+12); ctx.setLineDash([]);
  }
  ctx.restore();
  
  ctx.save(); ctx.translate(comp.x, comp.y);
  ctx.font='9px Share Tech Mono'; ctx.fillStyle='#4a5568'; ctx.textBaseline='alphabetic'; ctx.textAlign='center';
  ctx.fillText(comp.label||comp.id, 0, h/2+12);
  if (comp.rotation) { ctx.font = 'bold 9px Share Tech Mono'; ctx.fillStyle='#60a5fa'; ctx.fillText(comp.rotation+'°', 0, h/2+22); }
  ctx.restore();
  
  ctx.save(); ctx.translate(comp.x, comp.y);
  ctx.fillStyle = '#3b82f6';
  ctx.font = '10px Rajdhani';
  ctx.textAlign = 'center';
  ctx.fillText(bitWidth + '-bit', 0, h/2+24);
  ctx.restore();
}


function drawOutputLED(comp, selected) {
  const r=22;
  ctx.save(); ctx.translate(comp.x, comp.y);
  if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);
  const on = comp.value===1;
  if (on && simRunning) { ctx.shadowColor='#00e5a0'; ctx.shadowBlur=20; }
  ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
  ctx.fillStyle = on&&simRunning ? 'rgba(0,229,160,0.25)' : 'rgba(30,45,74,0.5)';
  ctx.strokeStyle = on&&simRunning ? '#00e5a0' : '#4a9eff';
  ctx.lineWidth=2; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,r*0.55,0,Math.PI*2);
  ctx.fillStyle = on&&simRunning ? '#00e5a0' : '#1e2d4a'; ctx.fill();
  const isInHovered = !simRunning && hoveredPort && hoveredPort.comp.id === comp.id && hoveredPort.portType === 'input';
  if (isInHovered) { ctx.shadowColor = '#4a9eff'; ctx.shadowBlur = 10; }
  ctx.beginPath(); ctx.arc(-r, 0, isInHovered ? 7 : 5, 0, Math.PI*2);
  ctx.fillStyle='#0d1117'; ctx.strokeStyle = isInHovered ? '#00e5a0' : '#4a9eff';
  ctx.lineWidth = isInHovered ? 2.5 : 1.5; ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  if (selected) {
    ctx.strokeStyle='#3b82f6'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.arc(0,0,r+8,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
  }
  ctx.restore();
  ctx.save(); ctx.translate(comp.x, comp.y);
  ctx.font='9px Share Tech Mono'; ctx.fillStyle='#4a5568'; ctx.textAlign='center';
  ctx.fillText(comp.label||comp.id, 0, r+14);
  if (comp.rotation) { ctx.font = 'bold 9px Share Tech Mono'; ctx.fillStyle='#60a5fa'; ctx.fillText(comp.rotation+'°', 0, r+24); }
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
}

// ── SIMULATION ───────────────────────────────────────────────────
function toggleSimulation() {
  simRunning = !simRunning;
  const btn = document.getElementById('simBtn');
  const status = document.getElementById('simStatus');
  if (simRunning) {
    btn.innerHTML='<i class="fa fa-stop"></i> STOP'; btn.classList.add('active');
    status.textContent='● RUNNING'; status.classList.add('running');
    // Clear ALL selection and interaction state when sim starts
    selectedComp = null; selectedWire = null; groupSelected = [];
    draggingComp = null; draggingWireSegment = null; groupDragging = false;
    groupSelecting = false;
    if (drawingWire) cancelWire();
    // Deactivate temp label if active
    if (typeof window._stopTempLabel !== 'undefined') window._stopTempLabel();
    canvas.style.cursor = 'not-allowed';
    updatePropsPanel();
    propagate();
    showToast('🟢 Simulation started — double-click INPUT switches to toggle. Everything else is locked.', 'info');
  } else {
    btn.innerHTML='<i class="fa fa-play"></i> SIMULATE'; btn.classList.remove('active');
    status.textContent='● IDLE'; status.classList.remove('running');
    canvas.style.cursor = '';
    hoveredPort = null;
    showToast('Simulation stopped', 'info');
  }
  redrawCanvas();
}
// Helper: Get output value from a component, considering multi-bit INPUTs
function getComponentOutputValue(comp, fromPort) {
  if (!comp) return 0;
  // For multi-bit INPUTs, return the specific bit value
  if (comp.type === 'INPUT' && (comp.bitWidth || 1) >= 2) {
    const bitIdx = fromPort || 0;
    return (comp.bitValues && comp.bitValues[bitIdx]) ? 1 : 0;
  }
  // For single-bit INPUTs and all other components, return overall value
  return comp.value ? 1 : 0;
}

function propagate() {
  for (let pass = 0; pass < 20; pass++) {  // more passes to let feedback settle
    for (const comp of components) { if (comp.type !== 'INPUT') evalComponent(comp); }
  }
}
function evalComponent(comp) {
  if (comp.type === 'OUTPUT') {
    const inWire = wires.find(w => w.toComp === comp.id && w.toPort === 0);
    if (inWire) {
      const src = inWire.fromComp ? components.find(c => c.id === inWire.fromComp) : null;
      comp.value = src ? getComponentOutputValue(src, inWire.fromPort) : 0;
    }
    return;
  }
  const inputVals = [];
  for (let i = 0; i < comp.inputs; i++) {
    const w = wires.find(w2 => w2.toComp === comp.id && w2.toPort === i);
    if (w) {
      let val = 0;
      if (w.fromComp) {
        const src = components.find(c => c.id === w.fromComp);
        val = src ? getComponentOutputValue(src, w.fromPort) : 0;
      }
      else if (w.fromNode) { val = getNodeValue(w.fromNode); }
      inputVals.push(val);
    } else { inputVals.push(0); }
  }
  switch (comp.type) {
    case 'AND': comp.value = inputVals.every(v=>v===1)?1:0; break;
    case 'OR': comp.value = inputVals.some(v=>v===1)?1:0; break;
    case 'NOT': comp.value = inputVals[0]?0:1; break;
    case 'NAND': comp.value = inputVals.every(v=>v===1)?0:1; break;
    case 'NOR': comp.value = inputVals.some(v=>v===1)?0:1; break;
    case 'XOR': comp.value = inputVals.reduce((a,b)=>a^b,0); break;
    case 'XNOR': comp.value = inputVals.reduce((a,b)=>a^b,0)?0:1; break;
  }
}
function evaluateGate(type, inputs) {
  switch (type) {
    case 'AND': return inputs.every(v=>v===1)?1:0;
    case 'OR': return inputs.some(v=>v===1)?1:0;
    case 'NOT': return inputs[0]?0:1;
    case 'NAND': return inputs.every(v=>v===1)?0:1;
    case 'NOR': return inputs.some(v=>v===1)?0:1;
    case 'XOR': return inputs.reduce((a,b)=>a^b,0);
    case 'XNOR': return inputs.reduce((a,b)=>a^b,0)?0:1;
    default: return 0;
  }
}

// ── PROPERTIES PANEL ─────────────────────────────────────────────
function updatePropsPanel() {
  const noSel = document.getElementById('noSelection');
  const selProps = document.getElementById('selectionProps');

  if (selectedWire && !selectedComp) {
    noSel.style.display='none'; selProps.style.display='';
    document.getElementById('propTitle').textContent = 'Wire';
    document.getElementById('propId').textContent = '—';
    document.getElementById('propType').textContent = 'Wire';
    document.getElementById('propInputsRow').style.display = 'none';
    document.getElementById('propOutputRow').style.display = 'none';
    document.getElementById('propValueRow').style.display = 'none';
    document.getElementById('propRotateRow') && (document.getElementById('propRotateRow').style.display = 'none');
    const labelField = document.getElementById('propLabel');
    if (labelField) labelField.value = '';
    return;
  }

  if (!selectedComp) { noSel.style.display=''; selProps.style.display='none'; return; }
  noSel.style.display='none'; selProps.style.display='';
  document.getElementById('propTitle').textContent = selectedComp.type + (selectedComp.type==='INPUT'||selectedComp.type==='OUTPUT'?'':' Gate');
  document.getElementById('propId').textContent = selectedComp.id;
  document.getElementById('propType').textContent = selectedComp.type;

  const inputsRow = document.getElementById('propInputsRow');
  inputsRow.style.display = (selectedComp.type!=='INPUT'&&selectedComp.type!=='OUTPUT'&&selectedComp.type!=='NOT'&&selectedComp.type!=='LABEL') ? '' : 'none';
  const propInputsEl = document.getElementById('propInputs');
  propInputsEl.value = selectedComp.inputs;
  propInputsEl.max = 10;

  const outRow = document.getElementById('propOutputRow');
  outRow.style.display = (selectedComp.type !== 'INPUT' && selectedComp.type !== 'LABEL') ? '' : 'none';
  const outBadge = document.getElementById('propOutput');
  outBadge.textContent = selectedComp.value + (selectedComp.value ? ' (HIGH)' : ' (LOW)');
  outBadge.style.color = selectedComp.value ? 'var(--accent)' : 'var(--danger)';

  const valRow = document.getElementById('propValueRow');
  valRow.style.display = selectedComp.type === 'INPUT' ? '' : 'none';
  const tog = document.getElementById('propToggle');
  tog.textContent = selectedComp.value ? '1 (HIGH)' : '0 (LOW)';
  tog.className = 'toggle-btn ' + (selectedComp.value ? 'high' : 'low');

  const bitWidthRow = document.getElementById('propBitWidthRow');
  if (bitWidthRow) {
    if (selectedComp.type === 'INPUT') {
      bitWidthRow.style.display = '';
      const bitWidthSel = document.getElementById('propBitWidth');
      if (bitWidthSel) bitWidthSel.value = String(selectedComp.bitWidth || 1);
    } else {
      bitWidthRow.style.display = 'none';
    }
  }

  const displayModeRow = document.getElementById('propDisplayModeRow');
  if (displayModeRow) {
    if (selectedComp.type === 'INPUT' && (selectedComp.bitWidth || 1) >= 2) {
      displayModeRow.style.display = '';
      const displayModeSel = document.getElementById('propDisplayMode');
      if (displayModeSel) displayModeSel.value = selectedComp.displayMode || 'decimal';
    } else {
      displayModeRow.style.display = 'none';
    }
  }

  const rotRow = document.getElementById('propRotateRow');
  if (rotRow) {
    rotRow.style.display = '';
    const rotVal = document.getElementById('propRotation');
    if (rotVal) rotVal.textContent = (selectedComp.rotation || 0) + '°';
  }

  const labelField = document.getElementById('propLabel');
  if (labelField) labelField.value = selectedComp.label || selectedComp.id;
}

function updateInputCount() {
  if (!selectedComp) return;
  let val = parseInt(document.getElementById('propInputs').value);
  val = Math.max(2, Math.min(10, val));
  document.getElementById('propInputs').value = val;
  saveState();
  selectedComp.inputs = val;
  const bodyH = getGateBodyHeight(val);
  selectedComp.height = Math.max(GATE_H, bodyH + 20);
  wires = wires.filter(w => !(w.toComp === selectedComp.id && w.toPort >= val));
  if (simRunning) propagate();
  redrawCanvas();
}

function updateLabel() {
  if (!selectedComp) return;
  selectedComp.label = document.getElementById('propLabel').value;
  redrawCanvas();
}

function toggleInputValue() {
  if (!selectedComp || selectedComp.type !== 'INPUT') return;
  saveState(); selectedComp.value = selectedComp.value ? 0 : 1;
  if (simRunning) propagate(); updatePropsPanel(); redrawCanvas();
}

// ── MULTI-BIT INPUT CONFIGURATION ──────────────────────────────────
let _multiBitInputComp = null; // Reference to the INPUT comp being configured

function updateInputBitWidth() {
  if (!selectedComp || selectedComp.type !== 'INPUT') return;
  const newWidth = parseInt(document.getElementById('propBitWidth').value, 10) || 1;
  if (newWidth === selectedComp.bitWidth) return;
  saveState();
  selectedComp.bitWidth = newWidth;
  // Initialize bitValues array with 0s
  selectedComp.bitValues = Array(newWidth).fill(0);
  selectedComp.value = 0;
  updatePropsPanel();
  redrawCanvas();
}

function updateInputDisplayMode() {
  if (!selectedComp || selectedComp.type !== 'INPUT') return;
  const newMode = document.getElementById('propDisplayMode').value;
  selectedComp.displayMode = newMode;
  redrawCanvas();
}

function openInputBitConfigModal(comp) {
  _multiBitInputComp = comp;
  const container = document.getElementById('bitConfigContainer');
  if (!container) return;
  container.innerHTML = '';
  
  const bitWidth = comp.bitWidth || 1;
  if (!comp.bitValues) comp.bitValues = Array(bitWidth).fill(0);
  
  for (let i = 0; i < bitWidth; i++) {
    const bitValue = comp.bitValues[i] || 0;
    const bitLabel = document.createElement('div');
    bitLabel.style.display = 'flex';
    bitLabel.style.alignItems = 'center';
    bitLabel.style.gap = '12px';
    bitLabel.style.padding = '10px';
    bitLabel.style.background = 'rgba(0,229,160,0.08)';
    bitLabel.style.borderRadius = '4px';
    
    const label = document.createElement('span');
    label.style.fontFamily = 'var(--font-mono)';
    label.style.color = 'var(--text-secondary)';
    label.style.minWidth = '60px';
    label.textContent = `Bit ${i}:`;
    
    const btn = document.createElement('button');
    btn.className = 'toggle-btn ' + (bitValue ? 'high' : 'low');
    btn.textContent = bitValue ? '1 (HIGH)' : '0 (LOW)';
    btn.style.flex = '1';
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      if (!_multiBitInputComp.bitValues) _multiBitInputComp.bitValues = [];
      _multiBitInputComp.bitValues[i] = _multiBitInputComp.bitValues[i] ? 0 : 1;
      btn.textContent = _multiBitInputComp.bitValues[i] ? '1 (HIGH)' : '0 (LOW)';
      btn.className = 'toggle-btn ' + (_multiBitInputComp.bitValues[i] ? 'high' : 'low');
    };
    
    bitLabel.appendChild(label);
    bitLabel.appendChild(btn);
    container.appendChild(bitLabel);
  }
  
  openModal('multiBitInputModal');
}

function commitMultiBitInputConfig() {
  if (!_multiBitInputComp) return;
  saveState();
  // Calculate combined value from bits (LSB at index 0)
  let value = 0;
  for (let i = 0; i < _multiBitInputComp.bitValues.length; i++) {
    if (_multiBitInputComp.bitValues[i]) {
      value |= (1 << i);
    }
  }
  _multiBitInputComp.value = value;
  if (simRunning) propagate();
  closeModal('multiBitInputModal');
  updatePropsPanel();
  redrawCanvas();
}
function deleteSelected() {
  if (simRunning) { showToast('🔒 Stop simulation before deleting', 'error'); return; }
  if (!selectedComp) return;
  saveState();
  wires = wires.filter(w => w.fromComp !== selectedComp.id && w.toComp !== selectedComp.id);
  components = components.filter(c => c.id !== selectedComp.id);
  selectedComp = null;
  // Recalculate compCounter from remaining components so next ID re-uses the freed slot
  syncCompCounter();
  updatePropsPanel(); redrawCanvas();
}

// ── GROUP SELECT ─────────────────────────────────────────────────
function toggleGroupSelect() {
  showToast('Drag on empty canvas to lasso-select. Press R to rotate group. Right-click for more options.', 'info');
}
function selectAllCanvasComponents() {
  if (!components.length) return;
  selectedComp = null;
  groupSelected = components.map(c => c.id);
  updatePropsPanel();
  redrawCanvas();
}
function exitGroupSelect() {
  groupSelected = []; groupSelecting = false;
  const btn = document.getElementById('groupSelBtn');
  if (btn) btn.classList.remove('tb-active');
  redrawCanvas();
}

// ── FIX #1 (group): DELETE GROUP WITH COUNTER ROLLBACK ────────────
function deleteGroupSelected() {
  if (simRunning) { showToast('🔒 Stop simulation before deleting', 'error'); return; }
  if (!groupSelected.length) return;
  saveState();
  const ids = new Set(groupSelected);
  wires = wires.filter(w => !ids.has(w.fromComp) && !ids.has(w.toComp));
  components = components.filter(c => !ids.has(c.id));
  groupSelected = [];
  // Recalculate compCounter from remaining components
  syncCompCounter();
  updatePropsPanel(); redrawCanvas();
  showToast('Group deleted', 'info');
}

// ── CLIPBOARD (Copy/Paste) ────────────────────────────────────────
let _clipboard = null;

function copySelected() {
  // Determine what to copy: single component, group, or nothing
  let toCopy = [];
  if (groupSelected.length > 0) {
    toCopy = groupSelected.map(id => components.find(c => c.id === id)).filter(Boolean);
  } else if (selectedComp) {
    toCopy = [selectedComp];
  } else {
    showToast('Nothing selected to copy', 'info');
    return;
  }
  
  // Deep clone components
  _clipboard = toCopy.map(comp => ({
    type: comp.type,
    x: comp.x,
    y: comp.y,
    inputs: comp.inputs,
    inputValues: comp.inputValues ? [...comp.inputValues] : [],
    value: comp.value,
    label: comp.label,
    rotation: comp.rotation || 0,
    width: comp.width,
    height: comp.height,
    // Multi-bit INPUT properties
    bitWidth: comp.bitWidth,
    bitValues: comp.bitValues ? [...comp.bitValues] : undefined,
    displayMode: comp.displayMode
  }));
  
  showToast(`Copied ${toCopy.length} component${toCopy.length !== 1 ? 's' : ''}`, 'info');
}

function pasteClipboard() {
  if (!_clipboard || _clipboard.length === 0) {
    showToast('Nothing to paste', 'info');
    return;
  }
  
  saveState();
  
  const pastedIds = [];
  const offsetX = 30;
  const offsetY = 30;
  
  for (const compData of _clipboard) {
    const id = 'G' + (++compCounter);
    const newComp = {
      id,
      type: compData.type,
      x: compData.x + offsetX,
      y: compData.y + offsetY,
      inputs: compData.inputs,
      inputValues: [...(compData.inputValues || [])],
      value: compData.value,
      label: compData.label,
      rotation: compData.rotation || 0,
      width: compData.width,
      height: compData.height
    };
    
    // Copy multi-bit INPUT properties if present
    if (compData.bitWidth !== undefined) {
      newComp.bitWidth = compData.bitWidth;
      newComp.bitValues = [...(compData.bitValues || [])];
      newComp.displayMode = compData.displayMode || 'decimal';
    }
    
    components.push(newComp);
    pastedIds.push(id);
  }
  
  // Update selection to pasted components
  selectedComp = null;
  selectedWire = null;
  groupSelected = pastedIds;
  
  updatePropsPanel();
  redrawCanvas();
  showToast(`Pasted ${pastedIds.length} component${pastedIds.length !== 1 ? 's' : ''}`, 'info');
}

// ── TOOLBAR ACTIONS ─────────────────────────────────────────────
function newCircuit() {
  if (components.length && !confirm('Start a new circuit? Unsaved work will be lost.')) return;
  _resetWorkspace();
  _workspaceActive = true;  // user has explicitly created a file
}

// Called by the Home Page "Create New Design" button.
// Shows the Save/Discard/Cancel guard if there are unsaved changes,
// otherwise creates the new design immediately.
function newDesignFromHome() {
  if (_workspaceActive && hasUnsavedChanges()) {
    const sub = document.getElementById('dirGuardSubtitle');
    if (sub) sub.textContent = `"${currentCircuitName}" has unsaved changes. Save before creating a new design?`;
    _pendingDirNavEl = null;
    _pendingDirAction = () => {
      showPage('workspace', document.querySelector('[href="#workspace"]'));
      _resetWorkspace();
      _workspaceActive = true;
    };
    openModal('dirGuardModal');
    return;
  }
  showPage('workspace', document.querySelector('[href="#workspace"]'));
  _resetWorkspace();
  _workspaceActive = true;
}
// Returns a unique circuit name based on `base` that does not already
// exist in localStorage. Continues from the highest existing suffix number
// (never reuses numbers from deleted files).
// Pass `excludeName` to ignore one existing entry (used when renaming the
// currently open file so it doesn't conflict with itself).
function _uniqueCircuitName(base, excludeName) {
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const names = new Set(saved.map(c => c.name).filter(n => n !== excludeName));
  if (!names.has(base)) return base;
  // Find the highest existing suffix number for this base (including gaps)
  const re = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\((\\d+)\\)$`);
  let max = 0;
  for (const n of names) {
    const m = n.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${base} (${max + 1})`;
}

function _resetWorkspace() {
  components = []; wires = []; nodes = [];
  selectedComp = null; selectedWire = null; groupSelected = [];
  compCounter = 0; nodeCounter = 0;
  currentCircuitName = _uniqueCircuitName('Untitled');
  updateFileIndicator();
  viewScale = 1; viewOffX = 0; viewOffY = 0;
  drawingWire = false; wireStartPort = null; wireCorners = []; wireLiveEnd = null;
  simRunning = false;
  const simBtn = document.getElementById('simBtn');
  if (simBtn) { simBtn.innerHTML = '<i class="fa fa-play"></i> SIMULATE'; simBtn.classList.remove('active'); }
  const simStatus = document.getElementById('simStatus');
  if (simStatus) { simStatus.textContent = '● IDLE'; simStatus.classList.remove('running'); }
  updateZoomLabel();
  const hint = document.getElementById('canvasHint');
  if (hint) hint.style.display = '';
  canvas.style.cursor = '';
  updatePropsPanel(); redrawCanvas();
}

function clearCanvas() {
  if (!confirm('Clear the canvas?')) return;
  saveState();
  components = []; wires = []; nodes = [];
  selectedComp = null; selectedWire = null; groupSelected = [];
  compCounter = 0; nodeCounter = 0;  // reset counters on clear
  const hint = document.getElementById('canvasHint');
  if (hint) hint.style.display = '';
  updatePropsPanel(); redrawCanvas();
}

function saveCircuit() {
  document.getElementById('saveNameInput').value = currentCircuitName;
  // Reset modal header/button to SAVE mode (in case it was left in EXPORT mode)
  _setSaveModalMode('save');
  openModal('saveModal');
}
function confirmSave() {
  const typed = document.getElementById('saveNameInput').value.trim() || 'Untitled';
  // Ensure the chosen name doesn't collide with a *different* existing file.
  // Exclude the current file's name so saving under the same name is a plain overwrite.
  const name = _uniqueCircuitName(typed, currentCircuitName);
  currentCircuitName = name;
  updateFileIndicator();
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const existing = saved.findIndex(c => c.name === name);
  const thumb = generateThumb();
  const entry = { name, components, wires, nodes, compCounter, nodeCounter, date: new Date().toLocaleDateString(), thumb };
  if (existing >= 0) saved[existing] = entry; else saved.push(entry);
  localStorage.setItem('digisim_circuits', JSON.stringify(saved));
  closeModal('saveModal');
  showToast('Circuit saved: ' + name, 'success');
}

// ── FIX #2: EXPORT WITH SAVE + RENAME PROMPT ─────────────────────
function _setSaveModalMode(mode) {
  const modal = document.getElementById('saveModal');
  const header = modal.querySelector('.modal-header span');
  const saveBtn = modal.querySelector('.modal-footer .btn-primary');
  if (mode === 'export') {
    if (header) header.textContent = 'EXPORT CIRCUIT';
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa fa-file-export"></i> SAVE & EXPORT';
      saveBtn.onclick = confirmExport;
    }
  } else {
    if (header) header.textContent = 'SAVE CIRCUIT';
    if (saveBtn) {
      saveBtn.innerHTML = '<i class="fa fa-save"></i> SAVE';
      saveBtn.onclick = confirmSave;
    }
  }
}

function exportCircuit() {
  // Show the modal with export mode — user can rename before downloading
  document.getElementById('saveNameInput').value = currentCircuitName;
  _setSaveModalMode('export');
  openModal('saveModal');
}

function confirmExport() {
  const typed = document.getElementById('saveNameInput').value.trim() || 'circuit';
  // Ensure the chosen name doesn't collide with a *different* existing file.
  const name = _uniqueCircuitName(typed, currentCircuitName);
  currentCircuitName = name;
  updateFileIndicator();
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const existing = saved.findIndex(c => c.name === name);
  const thumb = generateThumb();
  const entry = { name, components, wires, nodes, compCounter, nodeCounter, date: new Date().toLocaleDateString(), thumb };
  if (existing >= 0) saved[existing] = entry; else saved.push(entry);
  localStorage.setItem('digisim_circuits', JSON.stringify(saved));

  // Download the JSON file
  const data = JSON.stringify({ name, components, wires, nodes, compCounter, nodeCounter }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name.replace(/\s+/g, '_') + '.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);

  closeModal('saveModal');
  // Reset modal back to SAVE mode for next use
  _setSaveModalMode('save');
  showToast('Saved & Exported: ' + name + '.json', 'success');
}

// ── UNSAVED-CHANGE DETECTION ──────────────────────────────────────
// Returns true if the current canvas state differs from what is stored
// in localStorage for currentCircuitName.
function hasUnsavedChanges() {
  // Empty canvas is never considered "unsaved"
  if (components.length === 0 && wires.length === 0) return false;
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const entry = saved.find(c => c.name === currentCircuitName);
  // Circuit was never saved → it has unsaved changes
  if (!entry) return true;
  // Deep-compare the circuit data (ignore thumbnail / date)
  const currentSnap = JSON.stringify({ components, wires, nodes });
  const savedSnap   = JSON.stringify({
    components: entry.components || [],
    wires:      entry.wires      || [],
    nodes:      entry.nodes      || []
  });
  return currentSnap !== savedSnap;
}

// Holds parsed file data between the file-picker callback and the
// user's decision in the import-guard modal.
let _pendingImport = null;   // { data, fileNameBase }

// Silently persists the current circuit to localStorage (used by
// "Save and Continue" in the import guard).
function _saveCurrentSilent() {
  const name = currentCircuitName || 'Untitled';
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const existing = saved.findIndex(c => c.name === name);
  const thumb = generateThumb();
  const entry = { name, components, wires, nodes, compCounter, nodeCounter,
                  date: new Date().toLocaleDateString(), thumb };
  if (existing >= 0) saved[existing] = entry; else saved.push(entry);
  localStorage.setItem('digisim_circuits', JSON.stringify(saved));
}

// Applies a parsed import payload to the workspace.
function _applyImport(data, fileNameBase) {
  components         = Array.isArray(data.components) ? data.components : [];
  wires              = Array.isArray(data.wires)       ? data.wires      : [];
  nodes              = Array.isArray(data.nodes)       ? data.nodes      : [];
  compCounter        = typeof data.compCounter === 'number' ? data.compCounter : components.length;
  nodeCounter        = typeof data.nodeCounter === 'number' ? data.nodeCounter : 0;
  currentCircuitName = _uniqueCircuitName(fileNameBase || 'Imported');
  updateFileIndicator();
  components.forEach(c => { if (c.rotation === undefined) c.rotation = 0; });
  selectedComp  = null; selectedWire  = null; groupSelected = [];
  draggingComp  = null;
  drawingWire   = false; wireStartPort = null; wireCorners = []; wireLiveEnd = null;
  simRunning    = false;
  const simBtn = document.getElementById('simBtn');
  if (simBtn) { simBtn.innerHTML = '<i class="fa fa-play"></i> SIMULATE'; simBtn.classList.remove('active'); }
  const simStatus = document.getElementById('simStatus');
  if (simStatus) { simStatus.textContent = '● IDLE'; simStatus.classList.remove('running'); }
  showPage('workspace', document.querySelector('[href="#workspace"]'));
  _workspaceActive = true;  // user has explicitly opened a file via import
  setTimeout(() => { resizeCanvas(); }, 100);
  setTimeout(() => {
    const hint = document.getElementById('canvasHint');
    if (hint) hint.style.display = components.length > 0 ? 'none' : '';
    viewScale = 1; viewOffX = 0; viewOffY = 0;
    updateZoomLabel(); updatePropsPanel(); redrawCanvas();
    if (components.length > 0) fitCircuitToView();
    // Auto-save the freshly imported circuit to the directory
    const thumb = generateThumb();
    const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
    const existing = saved.findIndex(c => c.name === currentCircuitName);
    const entry = { name: currentCircuitName, components, wires, nodes,
                    compCounter, nodeCounter, date: new Date().toLocaleDateString(), thumb };
    if (existing >= 0) saved[existing] = entry; else saved.push(entry);
    localStorage.setItem('digisim_circuits', JSON.stringify(saved));
    showToast('Imported: ' + currentCircuitName, 'success');
  }, 250);
}

// ── IMPORT GUARD MODAL ACTIONS ────────────────────────────────────
function importGuardSaveAndContinue() {
  closeModal('importGuardModal');
  if (!_pendingImport) return;
  _saveCurrentSilent();
  showToast('Saved: ' + currentCircuitName, 'success');
  const { data, fileNameBase } = _pendingImport;
  _pendingImport = null;
  _applyImport(data, fileNameBase);
}
function importGuardDiscard() {
  closeModal('importGuardModal');
  if (!_pendingImport) return;
  const { data, fileNameBase } = _pendingImport;
  _pendingImport = null;
  _applyImport(data, fileNameBase);
}
function importGuardCancel() {
  closeModal('importGuardModal');
  _pendingImport = null;
  showToast('Import cancelled', 'info');
}

// ── IMPORT CIRCUIT (entry point) ──────────────────────────────────
function importCircuit() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const fileNameBase = file.name.replace(/\.json$/i, '').trim();
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        // ── Unsaved-change gate ───────────────────────────────────
        if (hasUnsavedChanges()) {
          // Park the parsed payload and show the 3-option guard modal
          _pendingImport = { data, fileNameBase };
          // Show the current circuit name in the modal subtitle
          const sub = document.getElementById('importGuardSubtitle');
          if (sub) sub.textContent =
            `"${currentCircuitName}" has unsaved changes. What would you like to do?`;
          openModal('importGuardModal');
        } else {
          // No unsaved changes — import immediately
          _applyImport(data, fileNameBase);
        }
      } catch (err) {
        console.error('Import error:', err);
        showToast('Invalid or corrupt JSON file — ' + err.message, 'error');
      }
    };
    reader.onerror = () => showToast('Could not read file', 'error');
    reader.readAsText(file);
  };
  document.body.appendChild(input);
  input.click();
  setTimeout(() => { if (input.parentNode) input.parentNode.removeChild(input); }, 5000);
}

function fitCircuitToView() {
  if (!components.length || !canvas) return;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  components.forEach(c => {
    const bbox = getCompBBox(c, 40);
    minX = Math.min(minX, bbox.x1); minY = Math.min(minY, bbox.y1);
    maxX = Math.max(maxX, bbox.x2); maxY = Math.max(maxY, bbox.y2);
  });
  const pw = maxX - minX, ph = maxY - minY;
  const scaleX = canvas.width / (pw || 1), scaleY = canvas.height / (ph || 1);
  viewScale = Math.min(scaleX, scaleY, 1.5) * 0.85;
  viewOffX  = (canvas.width  - pw * viewScale) / 2 - minX * viewScale;
  viewOffY  = (canvas.height - ph * viewScale) / 2 - minY * viewScale;
  updateZoomLabel(); redrawCanvas();
}

function toggleLibrary() {
  const lib = document.getElementById('compLib');
  lib.classList.toggle('collapsed');
  const showBtn = document.getElementById('libShowBtn');
  if (showBtn) showBtn.style.display = lib.classList.contains('collapsed') ? 'flex' : 'none';
  setTimeout(resizeCanvas, 350);
}
function toggleProps() {
  const panel = document.getElementById('propsPanel');
  panel.classList.toggle('collapsed');
  const showBtn = document.getElementById('propsShowBtn');
  if (showBtn) showBtn.style.display = panel.classList.contains('collapsed') ? 'flex' : 'none';
  setTimeout(resizeCanvas, 350);
}

// ── THUMBNAIL ────────────────────────────────────────────────────
function generateThumb() {
  if (!components.length) return null;
  const tc = document.createElement('canvas');
  tc.width=280; tc.height=160;
  const tctx = tc.getContext('2d');
  tctx.fillStyle='#0d1117'; tctx.fillRect(0,0,280,160);
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  components.forEach(c => {
    minX=Math.min(minX,c.x-c.width/2); minY=Math.min(minY,c.y-c.height/2);
    maxX=Math.max(maxX,c.x+c.width/2); maxY=Math.max(maxY,c.y+c.height/2);
  });
  const pw=maxX-minX+40, ph=maxY-minY+40;
  const ts=Math.min(280/pw,160/ph,1.4);
  const ox=(280-pw*ts)/2-minX*ts+20*ts, oy=(160-ph*ts)/2-minY*ts+20*ts;
  tctx.save(); tctx.translate(ox,oy); tctx.scale(ts,ts);
  for (const wire of wires) {
    const pts = getWirePointsForWire(wire);
    if (!pts||pts.length<2) continue;
    tctx.strokeStyle='#4a9eff'; tctx.lineWidth=1.5;
    tctx.beginPath(); tctx.moveTo(pts[0].x,pts[0].y);
    pts.slice(1).forEach(p=>tctx.lineTo(p.x,p.y)); tctx.stroke();
  }
  components.forEach(comp => {
    tctx.save(); tctx.translate(comp.x,comp.y);
    if (comp.rotation) tctx.rotate(comp.rotation * Math.PI / 180);
    if (comp.type==='INPUT'||comp.type==='OUTPUT') {
      tctx.fillStyle='rgba(30,45,74,0.8)'; tctx.strokeStyle='#4a9eff'; tctx.lineWidth=1.5;
      if (comp.type==='INPUT') { roundRect(tctx,-30,-18,60,36,5); tctx.fill(); tctx.stroke(); }
      else { tctx.beginPath(); tctx.arc(0,0,18,0,Math.PI*2); tctx.fill(); tctx.stroke(); }
    } else { drawGateOnCanvas(tctx,comp.type,0,0,0.9,false); }
    tctx.restore();
  });
  tctx.restore();
  return tc.toDataURL('image/png');
}

// ── CIRCUIT ANALYSIS ─────────────────────────────────────────────
function openAnalysis() {
  const inputs = components.filter(c => c.type==='INPUT');
  const outputs = components.filter(c => c.type==='OUTPUT');
  if (!inputs.length) { showToast('Add INPUT switches to your circuit','info'); return; }
  if (!outputs.length) { showToast('Add OUTPUT LEDs to your circuit','info'); return; }
  document.getElementById('analysisTitle').textContent = 'CIRCUIT ANALYSIS — '+outputs.map(o=>o.id).join(', ');
  const n = inputs.length;
  const rows = Math.pow(2, Math.min(n,4));
  let html='<table><tr>';
  inputs.forEach(inp=>html+=`<th>${inp.id}</th>`);
  outputs.forEach(out=>html+=`<th>${out.id}</th>`);
  html+='</tr>';
  let curHlRow=-1;
  if (simRunning) { const cv=inputs.map(i=>i.value); curHlRow=parseInt(cv.join(''),2); }
  const savedInputs=inputs.map(i=>i.value);
  for (let r=0;r<rows;r++) {
    for (let b=0;b<n;b++) inputs[n-1-b].value=(r>>b)&1;
    propagate();
    const hl=r===curHlRow?' class="highlighted"':'';
    html+=`<tr${hl}>`;
    inputs.forEach(inp=>html+=`<td>${inp.value}</td>`);
    outputs.forEach(out=>html+=`<td>${out.value}</td>`);
    html+='</tr>';
  }
  html+='</table>';
  document.getElementById('ttWrapper').innerHTML=html;
  inputs.forEach((inp,i)=>inp.value=savedInputs[i]);
  if (simRunning) propagate(); redrawCanvas();
  let exprHtml='';
  outputs.forEach(out=>{
    const sop=computeSOP(inputs,out);
    exprHtml+=`<span class="expr-label">${out.id} =</span><span class="expr-val">${sop||'0'}</span><br/>`;
    exprHtml+='<hr style="border-color:var(--border);margin:10px 0"/>';
    const inpLabels=inputs.map(inp=>`<span class="input-indicator ${inp.value?'high':'low'}">${inp.value}</span>`).join(' ');
    exprHtml+=`<span class="expr-label">Current Inputs: ${inpLabels}</span>`;
  });
  document.getElementById('logicExprBox').innerHTML=exprHtml;
  openModal('analysisModal');
}
function computeSOP(inputs, output) {
  const n=inputs.length;
  const rows=Math.pow(2,Math.min(n,4));
  const savedInputs=inputs.map(i=>i.value);
  const minterms=[];
  for (let r=0;r<rows;r++) {
    for (let b=0;b<n;b++) inputs[n-1-b].value=(r>>b)&1;
    propagate();
    if (output.value===1) minterms.push(r);
  }
  inputs.forEach((inp,i)=>inp.value=savedInputs[i]);
  if (simRunning) propagate();
  if (!minterms.length) return '0';
  if (minterms.length===rows) return '1';
  const terms=minterms.map(m=>inputs.map((inp,i)=>{
    const bit=(m>>(n-1-i))&1; return bit?inp.id:inp.id+"'";
  }).join('·'));
  return terms.join(' + ');
}

// ── DIRECTORY ────────────────────────────────────────────────────
function renderDirectory() {
  const saved=JSON.parse(localStorage.getItem('digisim_circuits')||'[]');
  const grid=document.getElementById('circuitGrid');
  const empty=document.getElementById('dirEmpty');
  if (!saved.length) { grid.innerHTML=''; empty.style.display=''; return; }
  empty.style.display='none';
  grid.innerHTML=saved.map((c,i)=>`
    <div class="circuit-card" onclick="loadCircuit(${i})">
      <div class="circuit-thumb">
        ${c.thumb
          ? `<img src="${c.thumb}" style="width:100%;height:100%;object-fit:contain;display:block;"/>`
          : `<canvas class="circuit-thumb-canvas" id="thumb_${i}" width="280" height="160"></canvas>`
        }
      </div>
      <div class="circuit-info">
        <span class="circuit-name">${c.name}</span>
        <div class="circuit-actions">
          <button class="circuit-icon-btn" title="Load" onclick="event.stopPropagation();loadCircuit(${i})"><i class="fa fa-folder-open"></i></button>
          <button class="circuit-icon-btn" title="Export" onclick="event.stopPropagation();exportSaved(${i})"><i class="fa fa-download"></i></button>
          <button class="circuit-icon-btn del" title="Delete" onclick="event.stopPropagation();deleteCircuit(${i})"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    </div>
  `).join('');
  saved.forEach((c,i)=>{
    if (!c.thumb) {
      const tc=document.getElementById('thumb_'+i);
      if (tc) renderMiniCircuit(tc, c.components||[], c.wires||[]);
    }
  });
}
function renderMiniCircuit(canvas2d, comps, wrs) {
  const tctx=canvas2d.getContext('2d');
  tctx.fillStyle='#0d1117'; tctx.fillRect(0,0,280,160);
  if (!comps.length) { tctx.fillStyle='#253555'; tctx.font='12px Share Tech Mono'; tctx.textAlign='center'; tctx.fillText('Empty circuit',140,85); return; }
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  comps.forEach(c=>{ minX=Math.min(minX,c.x-(c.width||80)/2-10); minY=Math.min(minY,c.y-(c.height||60)/2-10); maxX=Math.max(maxX,c.x+(c.width||80)/2+10); maxY=Math.max(maxY,c.y+(c.height||60)/2+10); });
  const pw=maxX-minX,ph=maxY-minY;
  const ts=Math.min(280/pw,160/ph)*0.9;
  const ox=(280-pw*ts)/2-minX*ts, oy=(160-ph*ts)/2-minY*ts;
  tctx.save(); tctx.translate(ox,oy); tctx.scale(ts,ts);
  tctx.strokeStyle='#4a9eff'; tctx.lineWidth=1.5;
  comps.forEach(comp=>{
    tctx.save(); tctx.translate(comp.x,comp.y);
    if (comp.rotation) tctx.rotate(comp.rotation * Math.PI / 180);
    if (comp.type==='INPUT') { tctx.fillStyle='rgba(30,45,74,0.8)'; tctx.strokeStyle='#4a9eff'; tctx.lineWidth=1.5; roundRect(tctx,-30,-18,60,36,5); tctx.fill(); tctx.stroke(); }
    else if (comp.type==='OUTPUT') { tctx.strokeStyle='#4a9eff'; tctx.fillStyle='rgba(30,45,74,0.8)'; tctx.lineWidth=1.5; tctx.beginPath(); tctx.arc(0,0,18,0,Math.PI*2); tctx.fill(); tctx.stroke(); }
    else { drawGateOnCanvas(tctx,comp.type,0,0,0.9,false); }
    tctx.restore();
  });
  tctx.restore();
}
function exportSaved(i) {
  const saved=JSON.parse(localStorage.getItem('digisim_circuits')||'[]');
  const c=saved[i]; if (!c) return;
  const data=JSON.stringify({name:c.name,components:c.components,wires:c.wires,nodes:c.nodes||[],compCounter:c.compCounter||0},null,2);
  const blob=new Blob([data],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url; a.download=c.name.replace(/\s+/g,'_')+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast('Exported: '+c.name,'success');
}
// ── DIRECTORY NAVIGATION GUARD ───────────────────────────────────
// All navigation TO the directory goes through this single function.
// The confirmation dialog is ONLY shown after the user has explicitly
// created or opened a file in the workspace. If the user is on the
// Home Page and has not yet created/opened a file, proceed directly.
let _pendingDirNavEl = null;  // the nav link element to activate after confirm
let _pendingDirAction = null; // optional callback for non-navigation guard uses (e.g. loadCircuit)
let _pendingLoadIdx = null;   // index of circuit to load after confirm

// Set to true the first time the user explicitly creates or opens a file.
// Remains false while the user is still on the Home Page at startup.
let _workspaceActive = false;

function navigateToDirectory(el) {
  // No file created/opened yet (still on Home Page) → go straight, no prompt
  if (!_workspaceActive) {
    _pendingDirNavEl = el || null;
    _proceedToDirectory();
    return;
  }

  // File is open but already saved → go straight, no prompt
  if (!hasUnsavedChanges()) {
    _pendingDirNavEl = el || null;
    _proceedToDirectory();
    return;
  }

  // File has unsaved changes → show Save / Discard / Cancel dialog
  const sub = document.getElementById('dirGuardSubtitle');
  if (sub) {
    sub.textContent = `"${currentCircuitName}" has unsaved changes. Save before going to the directory?`;
  }
  _pendingDirNavEl = el || null;
  openModal('dirGuardModal');
}

function _proceedToDirectory() {
  // Actually perform the navigation after user confirmed
  const el = _pendingDirNavEl;
  _pendingDirNavEl = null;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const pg = document.getElementById('page-directory');
  if (pg) pg.classList.add('active');
  if (el) el.classList.add('active');
  renderDirectory();
  window.scrollTo(0, 0);
}

function dirGuardSaveChanges() {
  closeModal('dirGuardModal');
  _saveCurrentSilent();
  showToast('Saved: ' + currentCircuitName, 'success');
  if (_pendingDirAction) {
    const action = _pendingDirAction;
    _pendingDirAction = null;
    action();
  } else {
    _proceedToDirectory();
  }
}
function dirGuardDiscard() {
  closeModal('dirGuardModal');
  if (_pendingDirAction) {
    const action = _pendingDirAction;
    _pendingDirAction = null;
    action();
  } else {
    _proceedToDirectory();
  }
}
function dirGuardCancel() {
  closeModal('dirGuardModal');
  _pendingDirNavEl = null;
  _pendingDirAction = null;
  _pendingLoadIdx = null;
}

function loadCircuit(i) {
  // If the workspace has unsaved changes, prompt before replacing it
  if (_workspaceActive && hasUnsavedChanges()) {
    _pendingLoadIdx = i;
    const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
    const c = saved[i];
    const sub = document.getElementById('dirGuardSubtitle');
    if (sub && c) {
      sub.textContent = `"${currentCircuitName}" has unsaved changes. Save before opening "${c.name}"?`;
    }
    // Reuse dirGuardModal — wire its confirm actions to the pending load
    _pendingDirNavEl = null;
    _pendingDirAction = () => _doLoadCircuit(i);
    openModal('dirGuardModal');
    return;
  }
  _doLoadCircuit(i);
}

function _doLoadCircuit(i) {
  const saved = JSON.parse(localStorage.getItem('digisim_circuits') || '[]');
  const c = saved[i];
  if (!c) return;
  components    = Array.isArray(c.components) ? c.components : [];
  wires         = Array.isArray(c.wires)      ? c.wires      : [];
  nodes         = Array.isArray(c.nodes)      ? c.nodes      : [];
  compCounter   = c.compCounter  || 0;
  nodeCounter   = c.nodeCounter  || 0;
  currentCircuitName = c.name;
  updateFileIndicator();
  components.forEach(cc => { if (cc.rotation === undefined) cc.rotation = 0; });
  selectedComp  = null; selectedWire = null; groupSelected = [];
  draggingComp  = null;
  drawingWire   = false; wireStartPort = null; wireCorners = []; wireLiveEnd = null;
  simRunning    = false;
  const simBtn = document.getElementById('simBtn');
  if (simBtn) { simBtn.innerHTML = '<i class="fa fa-play"></i> SIMULATE'; simBtn.classList.remove('active'); }
  const simStatus = document.getElementById('simStatus');
  if (simStatus) { simStatus.textContent = '● IDLE'; simStatus.classList.remove('running'); }
  showPage('workspace', document.querySelector('[href="#workspace"]'));
  _workspaceActive = true;
  setTimeout(() => { resizeCanvas(); }, 100);
  setTimeout(() => {
    const h = document.getElementById('canvasHint');
    if (h) h.style.display = components.length > 0 ? 'none' : '';
    viewScale = 1; viewOffX = 0; viewOffY = 0;
    updateZoomLabel(); updatePropsPanel(); redrawCanvas();
    if (components.length > 0) fitCircuitToView();
    showToast('Loaded: ' + c.name, 'success');
  }, 250);
}
function deleteCircuit(i) {
  if (!confirm('Delete this circuit?')) return;
  const saved=JSON.parse(localStorage.getItem('digisim_circuits')||'[]');
  saved.splice(i,1);
  localStorage.setItem('digisim_circuits',JSON.stringify(saved));
  renderDirectory(); showToast('Circuit deleted','info');
}

// ── K-MAP SIMPLIFIER ─────────────────────────────────────────────
let kmapVars=2, kmapValues={};
const VAR_NAMES=['A','B','C','D'];
const GRAY2=[0,1], GRAY4=[0,1,3,2];
function getKmapDims(vars) {
  if (vars===2) return {rows:2,cols:2,rowVars:1,colVars:1};
  if (vars===3) return {rows:2,cols:4,rowVars:1,colVars:2};
  if (vars===4) return {rows:4,cols:4,rowVars:2,colVars:2};
}
function getMintermIndex(rowIdx,colIdx,vars) {
  const {rowVars,colVars}=getKmapDims(vars);
  const rowGray=rowVars===1?GRAY2[rowIdx]:GRAY4[rowIdx];
  const colGray=colVars===1?GRAY2[colIdx]:GRAY4[colIdx];
  return (rowGray<<colVars)|colGray;
}
function setKmapVars(n) {
  kmapVars=n; kmapValues={};
  [2,3,4].forEach(v=>{document.getElementById('varBtn'+v).classList.toggle('active',v===n);});
  renderKmapInput(); renderKmapVisual();
  document.getElementById('kmapResult').innerHTML='<span class="kmap-hint">Enter values and click SIMPLIFY</span>';
  document.getElementById('kmapGroupsInfo').innerHTML='';
}
function renderKmapInput() {
  const {rows,cols,rowVars,colVars}=getKmapDims(kmapVars);
  const container=document.getElementById('kmapInputGrid');
  let html='';
  html+='<div class="kmap-row-labels"><div class="kmap-row-label" style="width:40px;min-width:40px"></div>';
  const colAxisLabel=VAR_NAMES.slice(rowVars,rowVars+colVars).join('');
  const rowAxisLabel=VAR_NAMES.slice(0,rowVars).join('');
  html+=`<div style="font-family:var(--font-mono);font-size:10px;color:var(--accent);padding:0 0 4px 0;width:${cols*44}px;text-align:center">${colAxisLabel}</div></div>`;
  html+='<div class="kmap-row-labels" style="padding-left:40px">';
  for (let c=0;c<cols;c++) {
    const cg=colVars===1?GRAY2[c]:GRAY4[c];
    html+=`<div class="kmap-col-label" style="width:40px;min-width:40px">${cg.toString(2).padStart(colVars,'0')}</div>`;
  }
  html+='</div>';
  for (let r=0;r<rows;r++) {
    const rg=rowVars===1?GRAY2[r]:GRAY4[r];
    const rowLabel=rg.toString(2).padStart(rowVars,'0');
    html+=`<div class="kmap-row"><div class="kmap-row-label" style="width:40px;min-width:40px;font-size:9px">${r===0?rowAxisLabel+'<br/>':''}${rowLabel}</div>`;
    for (let c=0;c<cols;c++) {
      const m=getMintermIndex(r,c,kmapVars);
      const v=kmapValues[m]!==undefined?kmapValues[m]:0;
      const cls=v===1?'val-1':v==='x'?'val-x':'val-0';
      const display=v==='x'?'X':v;
      html+=`<div class="kmap-cell-input ${cls}" data-minterm="${m}" onclick="toggleKmapCell(${m})">${display}</div>`;
    }
    html+='</div>';
  }
  container.innerHTML=html;
}
function toggleKmapCell(m) {
  const cur=kmapValues[m];
  if (cur===undefined||cur===0) kmapValues[m]=1;
  else if (cur===1) kmapValues[m]='x';
  else kmapValues[m]=0;
  renderKmapInput();
}
function resetKmap() {
  kmapValues={}; renderKmapInput(); renderKmapVisual();
  document.getElementById('kmapResult').innerHTML='<span class="kmap-hint">Enter values and click SIMPLIFY</span>';
  document.getElementById('kmapGroupsInfo').innerHTML='';
}
function fillFromTruthTable() {
  const inputs=components.filter(c=>c.type==='INPUT');
  const outputs=components.filter(c=>c.type==='OUTPUT');
  if (!inputs.length||!outputs.length) { showToast('Build a circuit with inputs and outputs first','info'); return; }
  const n=Math.min(inputs.length,4);
  setKmapVars(n);
  const savedInputs=inputs.map(i=>i.value);
  for (let r=0;r<Math.pow(2,n);r++) {
    for (let b=0;b<n;b++) inputs[n-1-b].value=(r>>b)&1;
    propagate(); kmapValues[r]=outputs[0].value;
  }
  inputs.forEach((inp,i)=>inp.value=savedInputs[i]);
  if (simRunning) propagate();
  renderKmapInput(); showToast('Truth table loaded into K-Map','success');
}
function solveKmap() {
  const totalMinterms=Math.pow(2,kmapVars);
  const vals=[];
  for (let i=0;i<totalMinterms;i++) { const v=kmapValues[i]; vals.push(v===undefined?0:v); }
  const ones=vals.map((v,i)=>v===1?i:-1).filter(i=>i>=0);
  const dontCares=vals.map((v,i)=>v==='x'?i:-1).filter(i=>i>=0);
  if (!ones.length) { document.getElementById('kmapResult').innerHTML='<span class="kmap-zero">F = 0</span>'; document.getElementById('kmapGroupsInfo').innerHTML=''; renderKmapVisual([]); return; }
  if (ones.length+dontCares.length===totalMinterms) { document.getElementById('kmapResult').innerHTML='<span class="kmap-one">F = 1</span>'; document.getElementById('kmapGroupsInfo').innerHTML=''; renderKmapVisual([]); return; }
  const allGroups=findAllGroups(ones,dontCares,kmapVars);
  const essentials=findEssentialPIs(ones,allGroups);
  const terms=essentials.map(g=>groupToTerm(g,kmapVars));
  const unique=[...new Set(terms)];
  const sop=unique.length>0?unique.join(' + '):'0';
  document.getElementById('kmapResult').innerHTML=`<span class="kmap-sop">F = ${sop}</span>`;
  const groupColors=['#f43f5e','#3b82f6','#a855f7','#f59e0b','#06b6d4','#84cc16'];
  let infoHtml='<strong style="color:var(--text-muted);font-size:10px">IDENTIFIED GROUPS:</strong><br/>';
  essentials.forEach((g,i)=>{
    const color=groupColors[i%groupColors.length];
    const term=groupToTerm(g,kmapVars);
    infoHtml+=`<span class="group-tag" style="background:${color}22;color:${color};border:1px solid ${color}44">Group ${i+1}</span> Minterms {${g.join(',')}} &rarr; <strong style="color:${color}">${term}</strong><br/>`;
  });
  document.getElementById('kmapGroupsInfo').innerHTML=infoHtml;
  const mintermGroups={};
  essentials.forEach((g,i)=>{g.forEach(m=>{if(!mintermGroups[m])mintermGroups[m]=[];mintermGroups[m].push(i);});});
  renderKmapVisual(mintermGroups);
}
function findAllGroups(ones,dontCares,vars) {
  const valid=new Set([...ones,...dontCares]);
  const groups=[];
  const sizes=[1,2,4,8,16].filter(s=>s<=Math.pow(2,vars));
  for (const size of sizes) {
    const combos=getCombinations([...valid],size);
    for (const combo of combos) {
      if (isValidKmapGroup(combo,vars)) { if (combo.some(m=>ones.includes(m))) groups.push(combo); }
    }
  }
  return groups;
}
function getCombinations(arr,k) {
  if (k===1) return arr.map(a=>[a]);
  if (k===arr.length) return [arr];
  if (k>arr.length) return [];
  const result=[];
  for (let i=0;i<=arr.length-k;i++) { const rest=getCombinations(arr.slice(i+1),k-1); rest.forEach(r=>result.push([arr[i],...r])); }
  return result;
}
function isValidKmapGroup(minterms,vars) {
  const size=minterms.length;
  if (!size) return false;
  if ((size&(size-1))!==0) return false;
  if (size===1) return true;
  const xorAll=minterms.reduce((a,b)=>a|b)^minterms.reduce((a,b)=>a&b);
  const diffBits=countOnes(xorAll);
  return Math.pow(2,diffBits)===size&&diffBits<=vars;
}
function countOnes(n) { let c=0; while(n){c+=n&1;n>>=1;} return c; }
function findEssentialPIs(ones,allGroups) {
  if (!allGroups.length) return ones.map(m=>[m]);
  const sorted=[...allGroups].sort((a,b)=>b.length-a.length);
  const covered=new Set(), chosen=[];
  for (const one of ones) {
    const covers=sorted.filter(g=>g.includes(one));
    if (covers.length===1) {
      if (!chosen.some(c=>JSON.stringify(c.sort())===JSON.stringify(covers[0].sort()))) {
        chosen.push(covers[0]); covers[0].filter(m=>ones.includes(m)).forEach(m=>covered.add(m));
      }
    }
  }
  for (const one of ones) {
    if (covered.has(one)) continue;
    const best=sorted.find(g=>g.includes(one)&&!chosen.some(c=>JSON.stringify(c.sort())===JSON.stringify(g.sort())));
    if (best) { chosen.push(best); best.filter(m=>ones.includes(m)).forEach(m=>covered.add(m)); }
    else { if (!chosen.some(c=>c.length===1&&c[0]===one)) chosen.push([one]); covered.add(one); }
  }
  return chosen;
}
function groupToTerm(minterms,vars) {
  if (!minterms.length) return '0';
  const n=vars;
  const xorAll=minterms.reduce((a,b)=>a|b)^minterms.reduce((a,b)=>a&b);
  const andAll=minterms.reduce((a,b)=>a&b);
  const parts=[];
  for (let b=n-1;b>=0;b--) {
    const bit=1<<b;
    if (xorAll&bit) continue;
    const varName=VAR_NAMES[n-1-b];
    if (andAll&bit) parts.push(varName); else parts.push(varName+"'");
  }
  return parts.length>0?parts.join(''):'1';
}
function renderKmapVisual(mintermGroups) {
  const {rows,cols,rowVars,colVars}=getKmapDims(kmapVars);
  const groupColors=['group-0','group-1','group-2','group-3','group-4','group-5'];
  const visual=document.getElementById('kmapVisual');
  const colAxisLabel=VAR_NAMES.slice(rowVars,rowVars+colVars).join('');
  const rowAxisLabel=VAR_NAMES.slice(0,rowVars).join('');
  let html='';
  html+=`<div class="kmap-vis-row-labels"><span style="font-family:var(--font-mono);font-size:9px;color:var(--accent);width:56px;display:inline-block;text-align:right;padding-right:8px">${rowAxisLabel} \\ ${colAxisLabel}</span>`;
  for (let c=0;c<cols;c++) {
    const cg=colVars===1?GRAY2[c]:GRAY4[c];
    html+=`<div class="kmap-vis-col-label">${cg.toString(2).padStart(colVars,'0')}</div>`;
  }
  html+='</div>';
  for (let r=0;r<rows;r++) {
    const rg=rowVars===1?GRAY2[r]:GRAY4[r];
    html+=`<div class="kmap-vis-row"><div class="kmap-vis-row-label">${rg.toString(2).padStart(rowVars,'0')}</div>`;
    for (let c=0;c<cols;c++) {
      const m=getMintermIndex(r,c,kmapVars);
      const v=kmapValues[m]!==undefined?kmapValues[m]:0;
      const vcls=v===1?'val-1':v==='x'?'val-x':'val-0';
      const display=v==='x'?'X':v;
      const groups=mintermGroups&&mintermGroups[m]?mintermGroups[m]:[];
      const gcls=groups.length>0?groupColors[groups[0]%groupColors.length]:'';
      html+=`<div class="kmap-vis-cell ${vcls} ${gcls}"><span class="minterm-num">${m}</span>${display}</div>`;
    }
    html+='</div>';
  }
  visual.innerHTML=html;
}
function openKmap() { closeModal('analysisModal'); renderKmapInput(); renderKmapVisual([]); openModal('kmapModal'); }

// ── AI COMPANION ──────────────────────────────────────────────────
let aiChatHistory = [];
let aiIsStreaming = false;

function openAICompanion() { openModal('aiModal'); }

function askAIQuick(q) {
  if (aiIsStreaming) return;
  document.getElementById('aiInput').value = q;
  sendAIMessage();
}

function appendAIMsg(role, html) {
  const area = document.getElementById('aiChatArea');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-' + role;
  div.innerHTML = `<div class="ai-bubble">${html}</div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function streamText(bubbleEl, text, area, onDone) {
  let i = 0;
  const speed = () => Math.random() * 12 + 6;
  function tick() {
    if (i >= text.length) { bubbleEl.innerHTML = renderAIMarkdown(text); if (onDone) onDone(); return; }
    const chunk = Math.floor(Math.random() * 3) + 1;
    i = Math.min(i + chunk, text.length);
    bubbleEl.innerHTML = renderAIMarkdown(text.slice(0, i)) + '<span class="ai-cursor">&#9611;</span>';
    area.scrollTop = area.scrollHeight;
    setTimeout(tick, speed());
  }
  tick();
}

async function sendAIMessage() {
  if (aiIsStreaming) return;
  const inp = document.getElementById('aiInput');
  const msg = (inp.value || '').trim();
  if (!msg) return;
  inp.value = '';
  appendAIMsg('user', escapeHtml(msg));
  aiChatHistory.push({ role: 'user', content: msg });
  const area = document.getElementById('aiChatArea');
  const div = document.createElement('div');
  div.className = 'ai-msg ai-msg-assistant';
  const bubbleId = 'ai-bubble-' + Date.now();
  div.innerHTML = `<div class="ai-bubble" id="${bubbleId}"><span class="ai-cursor">&#9611;</span></div>`;
  area.appendChild(div); area.scrollTop = area.scrollHeight;
  aiIsStreaming = true;
  const sendBtn = document.getElementById('aiSendBtn');
  if (sendBtn) { sendBtn.disabled = true; sendBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>'; }
  const thinkDelay = 400 + Math.random() * 500;
  await new Promise(r => setTimeout(r, thinkDelay));
  const reply = generateAIReply(msg, aiChatHistory);
  const bubble = document.getElementById(bubbleId);
  if (bubble) {
    streamText(bubble, reply, area, () => {
      aiIsStreaming = false;
      aiChatHistory.push({ role: 'assistant', content: reply });
      const btn = document.getElementById('aiSendBtn');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa fa-paper-plane"></i>'; }
    });
  }
}

// ── AI KNOWLEDGE BASE ─────────────────────────────────────────────
function generateAIReply(msg, history) {
  const m = msg.toLowerCase().trim();
  const prev = history.length >= 2 ? history[history.length - 2].content.toLowerCase() : '';

  // ── IDENTITY ────────────────────────────────────────────────────
  if (/who (are|r) (you|u)|what are you|what r u|your name|ur name|introduce yourself|tell me about (yourself|you)|what (can|do) (you|u) do|what are (your|ur) capabilities/.test(m)) {
    return "## Hey, I'm DIGISIM AI!\n\nI'm the built-in AI guide for this digital logic circuit simulator. Here's what I can help you with:\n\n- **Circuit Design** — half adders, full adders, multiplexers, decoders, latches, encoders, comparators, parity circuits, and more.\n- **Logic Gate Theory** — AND, OR, NOT, NAND, NOR, XOR, XNOR: truth tables, Boolean expressions, behavior.\n- **Boolean Algebra** — laws, theorems, De Morgan's, simplification, SOP/POS forms.\n- **K-Map Simplification** — grouping, minimization, prime implicants.\n- **Digital Logic Concepts** — combinational vs sequential, timing, propagation delay, fan-out, noise margins.\n- **Gate Selection Guidance** — tell me what operation you need and I'll recommend the right gate(s).\n- **Using DIGISIM** — wiring, simulation, group select, save/export, analysis tools.\n\nJust ask anything in plain English!";
  }

  // ── GREETINGS ───────────────────────────────────────────────────
  if (/^(hi+|hello+|hey+|sup|yo+|howdy|good\s*(morning|afternoon|evening|day)|what'?s up|how are you|how r u|hiya|greetings)/.test(m)) {
    return pick(["Hey! I'm DIGISIM AI — your digital logic assistant. Ask me about gates, circuits, Boolean algebra, or how to use DIGISIM. What are you working on?","Hello! Ready to dive into some digital logic? I can help you design circuits, understand gate behavior, simplify Boolean expressions, and more. What do you need?","Hey there! Whether it's gate theory, a half adder, or something more complex — I've got you. What circuit are we building today?"]);
  }

  // ── THANKS ──────────────────────────────────────────────────────
  if (/thank(s| you)|thx|ty\b|appreciate|helpful|great answer|awesome|nice one|perfect/.test(m)) {
    return pick(["Happy to help! Let me know if you want to go deeper on any part of the circuit.","Anytime! Feel free to ask follow-up questions — digital logic has a lot of layers.","Glad that helped! If something's unclear or you want me to explain it differently, just ask."]);
  }

  // ── WHAT IS A LOGIC GATE? ────────────────────────────────────────
  if (/what (is|are) (a |an )?(logic )?gate[s]?|define.*gate|explain.*gate|logic gate.*mean|meaning.*logic gate/.test(m)) {
    return "## What is a Logic Gate?\n\nA logic gate is a fundamental building block of digital circuits. It is an electronic device that performs a **Boolean logic operation** on one or more binary inputs (0 or 1) and produces a single binary output.\n\n### Key Points\n- Inputs and outputs are always binary: **0 (LOW/False)** or **1 (HIGH/True)**\n- Each gate implements a specific Boolean function\n- Real gates are built from transistors (MOSFET or BJT)\n- Gates can be combined to build any digital system — calculators, CPUs, memory, and more\n\n### The 7 Basic Gates\n- **AND** — output is 1 only when ALL inputs are 1\n- **OR** — output is 1 when at least ONE input is 1\n- **NOT** — inverts the input\n- **NAND** — NOT AND (universal gate)\n- **NOR** — NOT OR (universal gate)\n- **XOR** — output is 1 when inputs are DIFFERENT\n- **XNOR** — output is 1 when inputs are EQUAL\n\n### Why They Matter\nLogic gates are the foundation of all digital electronics. A modern CPU contains billions of gates working together at billions of operations per second.";
  }

  // ── WHAT IS BOOLEAN ALGEBRA? ─────────────────────────────────────
  if (/what (is|are) bool(e|ea)n|define boolean|explain boolean|boolean algebra.*mean|boolean.*logic/.test(m)) {
    return "## What is Boolean Algebra?\n\nBoolean algebra is a branch of mathematics that deals with **binary variables** (values of only 0 and 1) and **logical operations**. It was developed by George Boole in 1854 and is the mathematical foundation of all digital logic and computer science.\n\n### Core Operations\n- **AND (·)** — multiplication: A · B = 1 only if both A=1 and B=1\n- **OR (+)** — addition: A + B = 1 if either A=1 or B=1\n- **NOT (')** — complement: if A=1 then A'=0, and vice versa\n\n### Fundamental Laws\n\n**Identity Laws**\n- A + 0 = A\n- A · 1 = A\n\n**Null Laws**\n- A + 1 = 1\n- A · 0 = 0\n\n**Idempotent Laws**\n- A + A = A\n- A · A = A\n\n**Complement Laws**\n- A + A' = 1\n- A · A' = 0\n\n**Double Negation**\n- (A')' = A\n\n**Commutative Laws**\n- A + B = B + A\n- A · B = B · A\n\n**Associative Laws**\n- A + (B + C) = (A + B) + C\n- A · (B · C) = (A · B) · C\n\n**Distributive Laws**\n- A · (B + C) = A·B + A·C\n- A + (B · C) = (A+B) · (A+C)\n\n### Why It Matters\nBoolean algebra lets you simplify complex logic expressions, reducing gate count and power consumption in real circuits. The K-MAP tool in DIGISIM automates this simplification.";
  }

  // ── TRUTH TABLE GENERAL ──────────────────────────────────────────
  if (/what is (a )?truth table|explain truth table|define truth table|how.*truth table work/.test(m)) {
    return "## What is a Truth Table?\n\nA truth table is a mathematical table that lists all possible combinations of input values and shows the corresponding output for a logic function or circuit.\n\n### Structure\n- Columns represent input variables (A, B, C...) and outputs (Q, F...)\n- Rows represent every possible combination of 0s and 1s\n- For n inputs, there are always **2^n rows**\n\n### Example: 2-input AND gate\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |\n\n### In DIGISIM\nClick **ANALYZE** in the toolbar to auto-generate the truth table for your current circuit. It tests every combination of your INPUT switches automatically!";
  }

  // ── XOR TRUTH TABLE ──────────────────────────────────────────────
  if (/\b(xor|ex.?or|exclusive.?or)\b.*table|table.*\b(xor|ex.?or|exclusive.?or)\b/.test(m)) {
    return "## XOR Gate Truth Table\n\nXOR (Exclusive OR) — output is HIGH when inputs are **different**.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |\n\n### Boolean Expression\nQ = A ⊕ B\n\n### Key Property\nXOR detects whether two bits are **different**. If A=B → output is 0. If A≠B → output is 1.\n\n### Uses\n- Building half adders and full adders (the sum bit)\n- Parity generators and checkers\n- Comparing two binary values\n- Encryption circuits (XOR cipher)\n\nIn DIGISIM: drag an XOR gate onto the canvas, add two INPUT switches and an OUTPUT LED, then hit SIMULATE to verify!";
  }

  // ── XNOR TRUTH TABLE ─────────────────────────────────────────────
  if (/\b(xnor|ex.?nor|exclusive.?nor)\b.*table|table.*\b(xnor|ex.?nor)\b/.test(m)) {
    return "## XNOR Gate Truth Table\n\nXNOR (Exclusive NOR) — output is HIGH when inputs are **equal**.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |\n\n### Boolean Expression\nQ = NOT(A ⊕ B) = A ⊙ B\n\n### Key Property\nXNOR is the equality detector — output is 1 when both inputs match.\n\n### Uses\n- Equality comparators\n- Error detection\n- Bit comparators in ALUs";
  }

  // ── AND TRUTH TABLE ──────────────────────────────────────────────
  if (/\band\s*(gate)?\b.*table|table.*\band\s*(gate)?\b/.test(m)) {
    return "## AND Gate Truth Table\n\nOutput is HIGH only when **ALL** inputs are HIGH.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |\n\n### Boolean Expression\nQ = A · B\n\n### For 3 inputs (A, B, C):\n- Output is 1 only when A=1 AND B=1 AND C=1\n- All other combinations → 0\n\n### Uses\nConditional logic, enable signals, carry generation in adders.";
  }

  // ── OR TRUTH TABLE ───────────────────────────────────────────────
  if (/\bor\s*(gate)?\b.*table|table.*\bor\s*(gate)?\b/.test(m)) {
    return "## OR Gate Truth Table\n\nOutput is HIGH when **at least one** input is HIGH.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 1 |\n\n### Boolean Expression\nQ = A + B\n\n### Uses\nCombining flags, implementing SOP terms, any situation where multiple conditions can trigger an output.";
  }

  // ── NOT TRUTH TABLE ──────────────────────────────────────────────
  if (/\bnot\s*(gate|inverter)?\b.*table|table.*\bnot\s*(gate)?\b/.test(m)) {
    return "## NOT Gate (Inverter) Truth Table\n\nSingle input — flips the bit.\n\n| A | Q |\n|---|---|\n| 0 | 1 |\n| 1 | 0 |\n\n### Boolean Expression\nQ = A'\n\n### Uses\nComplementing signals, building active-low logic, part of NAND/NOR/XNOR implementations.";
  }

  // ── NAND TRUTH TABLE ─────────────────────────────────────────────
  if (/\bnand\s*(gate)?\b.*table|table.*\bnand\s*(gate)?\b/.test(m)) {
    return "## NAND Gate Truth Table\n\nNOT AND — output is LOW only when ALL inputs are HIGH.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |\n\n### Boolean Expression\nQ = (A · B)'\n\n### Universal Gate\nNAND is a **universal gate** — you can build ANY logic function using only NAND gates:\n- NOT A = NAND(A, A)\n- A AND B = NAND(NAND(A,B), NAND(A,B))\n- A OR B = NAND(NAND(A,A), NAND(B,B))";
  }

  // ── NOR TRUTH TABLE ──────────────────────────────────────────────
  if (/\bnor\s*(gate)?\b.*table|table.*\bnor\s*(gate)?\b/.test(m)) {
    return "## NOR Gate Truth Table\n\nNOT OR — output is HIGH only when ALL inputs are LOW.\n\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 0 |\n\n### Boolean Expression\nQ = (A + B)'\n\n### Universal Gate\nNOR is also a **universal gate** — any logic function can be built with only NOR gates:\n- NOT A = NOR(A, A)\n- A OR B = NOR(NOR(A,B), NOR(A,B))\n- A AND B = NOR(NOR(A,A), NOR(B,B))";
  }

  // ── GATE SELECTION ───────────────────────────────────────────────
  if (/what gate.*use|which gate.*for|gate.*for (this|the) operation|what gate.*do i need|recommend.*gate|suggest.*gate/.test(m)) {
    return "## Gate Selection Guide\n\nHere's how to pick the right gate for your operation:\n\n### Use AND when...\n- You need ALL conditions to be true\n- Example: alarm sounds only when door is open AND motion is detected\n- Expression: F = A · B\n\n### Use OR when...\n- You need ANY condition to be true\n- Example: light turns on if switch A OR switch B is pressed\n- Expression: F = A + B\n\n### Use NOT when...\n- You need to invert a signal\n- Example: active-low enable, complement of a variable\n- Expression: F = A'\n\n### Use NAND when...\n- You want AND but with inverted output\n- Building everything from one gate type (universal)\n- Most common in CMOS implementations\n\n### Use NOR when...\n- You want OR but with inverted output\n- Building everything from one gate type (universal)\n\n### Use XOR when...\n- You need to detect if inputs are DIFFERENT\n- Adding bits (sum in a half/full adder)\n- Parity checking, comparison, encryption\n- Expression: F = A ⊕ B\n\n### Use XNOR when...\n- You need to detect if inputs are EQUAL\n- Equality comparators, error checking\n- Expression: F = (A ⊕ B)'\n\n**Tell me your specific operation and I'll give you an exact recommendation!**";
  }

  if (/gate.*equal|equal.*gate|detect.*same|same.*detect|compare.*bit/.test(m)) {
    return "## Gate for Equality Detection\n\nUse an **XNOR gate**!\n\nXNOR outputs 1 when both inputs are equal:\n- 0 and 0 → 1 (equal)\n- 1 and 1 → 1 (equal)\n- 0 and 1 → 0 (not equal)\n- 1 and 0 → 0 (not equal)\n\nFor multi-bit equality: XNOR each bit pair, then AND all the results together.\n\nIn DIGISIM: drag an XNOR gate, add two INPUTs and one OUTPUT, then simulate!";
  }

  if (/gate.*different|different.*gate|detect.*differ|differ.*detect/.test(m)) {
    return "## Gate for Difference Detection\n\nUse an **XOR gate**!\n\nXOR outputs 1 when inputs are different:\n- 0 and 1 → 1 (different)\n- 1 and 0 → 1 (different)\n- 0 and 0 → 0 (same)\n- 1 and 1 → 0 (same)\n\nExpression: Q = A ⊕ B\n\nUse XOR for: parity checkers, half adder sum bits, comparators.";
  }

  if (/gate.*invert|invert.*gate|flip.*bit|negate.*signal|complement/.test(m)) {
    return "## Gate for Inverting / Negating\n\nUse a **NOT gate** (also called an inverter)!\n\n- Input 0 → Output 1\n- Input 1 → Output 0\n\nExpression: Q = A'\n\nIf you need to invert after an AND or OR, use NAND or NOR respectively — they're more efficient in hardware.";
  }

  if (/gate.*add|add.*gate|binary.*add|sum.*bit|adder.*gate/.test(m)) {
    return "## Gates for Binary Addition\n\nBinary addition uses a combination:\n\n### Half Adder (adds 2 bits)\n- **Sum** = A XOR B\n- **Carry** = A AND B\n\nGates needed: 1 XOR + 1 AND\n\n### Full Adder (adds 3 bits including carry-in)\n- **Sum** = A XOR B XOR Cin\n- **Cout** = (A AND B) OR (Cin AND (A XOR B))\n\nGates needed: 2 XOR + 2 AND + 1 OR\n\nWant me to walk you through building one in DIGISIM?";
  }

  if (/gate.*all.*high|all.*input.*1|all.*inputs.*high|output.*1.*when.*all/.test(m)) {
    return "## Gate Where Output is 1 Only When All Inputs Are 1\n\nThat's an **AND gate**!\n\n- All inputs must be HIGH (1) for the output to be HIGH (1)\n- Even one LOW input pulls the output to LOW\n\nFor multiple inputs: use a multi-input AND gate (select it in DIGISIM properties panel to set 3, 4, or more inputs).";
  }

  if (/gate.*any.*high|any.*input.*1|at least one|output.*1.*if.*any/.test(m)) {
    return "## Gate Where Output is 1 When Any Input is 1\n\nThat's an **OR gate**!\n\n- Output is HIGH if at least one input is HIGH\n- Output is LOW only when ALL inputs are LOW\n\nFor multiple inputs: use a multi-input OR gate in DIGISIM.";
  }

  // ── UNIVERSAL GATES ──────────────────────────────────────────────
  if (/universal gate|nand.*universal|nor.*universal|why.*nand.*nor|implement.*using.*nand|implement.*using.*nor/.test(m)) {
    return "## Universal Gates\n\nA **universal gate** is one that can implement any Boolean function on its own — without needing any other gate type.\n\nBoth **NAND** and **NOR** are universal gates.\n\n### Implementing Everything with NAND\n- **NOT A** = NAND(A, A)\n- **A AND B** = NAND(NAND(A,B), NAND(A,B))\n- **A OR B** = NAND(NAND(A,A), NAND(B,B))\n\n### Implementing Everything with NOR\n- **NOT A** = NOR(A, A)\n- **A OR B** = NOR(NOR(A,B), NOR(A,B))\n- **A AND B** = NOR(NOR(A,A), NOR(B,B))\n\n### Why Does This Matter?\nIn hardware manufacturing, using only one gate type simplifies fabrication. NAND gates are especially popular in CMOS technology because they are fast and power-efficient.";
  }

  // ── COMBINATIONAL vs SEQUENTIAL ──────────────────────────────────
  if (/combinational.*circuit|sequential.*circuit|difference.*combinational.*sequential|combinational vs sequential/.test(m)) {
    return "## Combinational vs Sequential Circuits\n\n### Combinational Circuits\n- Output depends **only on current inputs**\n- No memory or feedback\n- Examples: adders, multiplexers, decoders, encoders, comparators\n- All gates in DIGISIM work in combinational mode by default\n\n### Sequential Circuits\n- Output depends on **current inputs AND past state** (memory)\n- Contains feedback loops and flip-flops\n- Examples: SR latch, D flip-flop, registers, counters, state machines\n- The SR latch you can build in DIGISIM is a basic sequential circuit\n\n### Key Difference\nCombinational circuits are \"memoryless\" — change the inputs, output immediately follows. Sequential circuits \"remember\" their previous state.";
  }

  // ── PROPAGATION DELAY ────────────────────────────────────────────
  if (/propagation delay|gate delay|timing.*circuit|signal.*delay/.test(m)) {
    return "## Propagation Delay\n\nPropagation delay is the time it takes for a signal change at the **input** of a gate to appear at its **output**.\n\n### Key Points\n- Every real gate has a small but nonzero delay (typically picoseconds to nanoseconds)\n- Denoted as **tpd** or **tp**\n- Two components: tpHL (HIGH to LOW) and tpLH (LOW to HIGH)\n\n### Why It Matters\n- Limits the **maximum clock frequency** of a circuit\n- Too many gates in series → longer total delay → lower speed\n- Can cause **hazards** (glitches) in combinational circuits\n\n### Critical Path\nThe longest delay path through a circuit is called the **critical path** — it determines the worst-case delay and thus the maximum operating speed.\n\n### In DIGISIM\nDIGISIM simulates ideal gates with no delay. Real SPICE simulators model propagation delay.";
  }

  // ── FAN-OUT ──────────────────────────────────────────────────────
  if (/fan.?out|fanout|how many.*inputs.*drive|drive.*multiple/.test(m)) {
    return "## Fan-Out\n\nFan-out is the maximum number of gate inputs that a single gate output can reliably drive.\n\n### Why It's Limited\nEach gate input draws a small current. A gate output can only source/sink a finite amount of current before the voltage levels degrade and logic values become unreliable.\n\n### Typical Values\n- TTL logic: fan-out of 10\n- CMOS logic: fan-out of 50+ (very high impedance inputs)\n\n### In DIGISIM\nDIGISIM assumes ideal gates with unlimited fan-out. In real hardware design, you must respect the fan-out specification of your logic family.";
  }

  // ── SOP / POS ────────────────────────────────────────────────────
  if (/sop|sum of products|pos|product of sums|minterm|maxterm|canonical form/.test(m)) {
    return "## SOP and POS Forms\n\n### Sum of Products (SOP)\n- A Boolean expression written as an OR of AND terms\n- Each AND term is called a **minterm**\n- Example: F = A'B + AB' + AB\n- This is the natural output of a K-Map simplification\n\n### Product of Sums (POS)\n- A Boolean expression written as an AND of OR terms\n- Each OR term is called a **maxterm**\n- Example: F = (A+B)(A'+B')\n\n### Canonical Forms\n- **Canonical SOP** (sum of minterms): lists every minterm where F=1\n- **Canonical POS** (product of maxterms): lists every maxterm where F=0\n\n### Which to Use?\n- SOP is generally easier to implement with AND-OR or NAND-NAND networks\n- POS uses OR-AND or NOR-NOR networks\n- Use the K-MAP tool in DIGISIM to get the minimized SOP automatically!";
  }

  // ── DE MORGAN'S THEOREM ──────────────────────────────────────────
  if (/de morgan|demorgan|morgan.*theorem/.test(m)) {
    return "## De Morgan's Theorems\n\nDe Morgan's theorems are two fundamental rules for transforming Boolean expressions.\n\n### Theorem 1\nNOT(A AND B) = NOT A OR NOT B\n\n(A · B)' = A' + B'\n\n### Theorem 2\nNOT(A OR B) = NOT A AND NOT B\n\n(A + B)' = A' · B'\n\n### How to Remember\nBreak the bar, change the operator:\n- Break the long bar into individual bars\n- Change AND to OR (or OR to AND)\n\n### Practical Use\n- NAND gate implements NOT(A AND B) = A' + B'\n- NOR gate implements NOT(A OR B) = A' · B'\n- Used to convert between SOP and POS forms\n- Essential for NAND-only or NOR-only implementations\n\n### Example\nProve NAND is universal: NAND(A,A) = NOT(A · A) = A' + A' = A' — that's a NOT gate!";
  }

  // ── DIGITAL vs ANALOG ────────────────────────────────────────────
  if (/digital.*analog|analog.*digital|what is digital|difference.*digital.*analog/.test(m)) {
    return "## Digital vs Analog\n\n### Analog Signals\n- Continuous range of values\n- Examples: audio waveforms, temperature sensors, voltage from a microphone\n- Susceptible to noise and degradation\n\n### Digital Signals\n- Only two discrete levels: **0 (LOW)** and **1 (HIGH)**\n- In TTL: 0 ≈ 0–0.8V, 1 ≈ 2–5V\n- In CMOS: 0 ≈ 0V, 1 ≈ supply voltage\n- Much more **noise-immune** than analog\n- Can be processed, stored, and transmitted perfectly\n\n### Why Digital?\n- Immune to noise (a corrupted 0.9V is still read as 0)\n- Easy to store in memory\n- Can represent any information in binary\n- Logic gates work entirely in the digital domain\n\nDIGISIM works exclusively with digital signals — every wire is either 0 or 1.";
  }

  // ── BINARY / NUMBER SYSTEMS ──────────────────────────────────────
  if (/what is binary|binary number|binary.*system|how.*binary.*work|bit.*byte|number system/.test(m)) {
    return "## Binary Number System\n\nBinary (base-2) is the number system used by all digital circuits. It uses only two digits: **0** and **1** (corresponding to LOW and HIGH voltage).\n\n### Place Values (right to left)\n2^0=1, 2^1=2, 2^2=4, 2^3=8, 2^4=16, ...\n\n### Examples\n- Binary 0101 = 0×8 + 1×4 + 0×2 + 1×1 = **5**\n- Binary 1010 = 1×8 + 0×4 + 1×2 + 0×1 = **10**\n- Binary 1111 = 8+4+2+1 = **15**\n\n### Terminology\n- **Bit** — a single binary digit (0 or 1)\n- **Nibble** — 4 bits\n- **Byte** — 8 bits (0–255)\n- **Word** — 16, 32, or 64 bits depending on architecture\n\n### Why Binary?\nElectronic switches (transistors) have two stable states — ON and OFF. Binary maps perfectly to this physical reality.";
  }

  // ── MULTIPLEXER THEORY ───────────────────────────────────────────
  if (/what is (a )?mux|what is (a )?multiplexer|explain.*mux|mux.*theory/.test(m)) {
    return "## What is a Multiplexer (MUX)?\n\nA multiplexer is a **combinational circuit** that selects one of multiple input data lines and routes it to a single output, based on select lines.\n\n### Key Properties\n- 2^n data inputs, n select lines, 1 output\n- Acts as a digitally controlled switch\n- Also called a **data selector**\n\n### Common Types\n- 2-to-1 MUX: 2 inputs, 1 select, 1 output\n- 4-to-1 MUX: 4 inputs, 2 selects, 1 output\n- 8-to-1 MUX: 8 inputs, 3 selects, 1 output\n\n### 2-to-1 MUX Expression\nY = (A AND NOT S) OR (B AND S)\n- When S=0: Y = A\n- When S=1: Y = B\n\n### Uses\n- Data routing in buses\n- Implementing Boolean functions\n- Parallel-to-serial conversion\n- Address selection in memory systems";
  }

  // ── DECODER THEORY ───────────────────────────────────────────────
  if (/what is (a )?decoder|explain.*decoder|decoder.*theory/.test(m)) {
    return "## What is a Decoder?\n\nA decoder is a combinational circuit that converts a binary code on its inputs into a unique output line for each input combination.\n\n### Key Properties\n- n inputs → 2^n outputs\n- Exactly ONE output is HIGH at a time (active HIGH decoder)\n- The active output corresponds to the binary value of the inputs\n\n### 2-to-4 Decoder\n- Inputs: A (MSB), B (LSB)\n- Outputs: Y0=A'B', Y1=A'B, Y2=AB', Y3=AB\n\n| A | B | Y0 | Y1 | Y2 | Y3 |\n|---|---|----|----|----|----|---|\n| 0 | 0 | 1  | 0  | 0  | 0  |\n| 0 | 1 | 0  | 1  | 0  | 0  |\n| 1 | 0 | 0  | 0  | 1  | 0  |\n| 1 | 1 | 0  | 0  | 0  | 1  |\n\n### Uses\n- Memory address decoding\n- Instruction decoding in CPUs\n- Driving seven-segment displays\n- Demultiplexing";
  }

  // ── ENCODER THEORY ───────────────────────────────────────────────
  if (/what is (an )?encoder|explain.*encoder|encoder.*theory/.test(m)) {
    return "## What is an Encoder?\n\nAn encoder is the opposite of a decoder. It converts one of 2^n active inputs into an n-bit binary code.\n\n### Key Properties\n- 2^n inputs → n outputs\n- Only ONE input should be active at a time\n- Outputs represent the binary address of the active input\n\n### 4-to-2 Encoder\n- Inputs: I0, I1, I2, I3 (one active at a time)\n- Outputs: A (MSB), B (LSB)\n- A = I2 + I3\n- B = I1 + I3\n\n### Priority Encoder\nA smarter encoder that handles multiple active inputs — the highest-priority (usually highest-numbered) active input takes precedence.\n\n### Uses\n- Keyboard encoders\n- Interrupt priority systems\n- Converting sensor inputs to binary addresses";
  }

  // ── FLIP-FLOP THEORY ─────────────────────────────────────────────
  if (/what is (a )?flip.?flop|explain.*flip.?flop|flip.?flop.*theory|types.*flip.?flop/.test(m)) {
    return "## What is a Flip-Flop?\n\nA flip-flop is a **sequential circuit** element that stores one bit of information. Unlike combinational gates, flip-flops have memory — their output depends on past inputs as well as current ones.\n\n### Key Properties\n- Bistable: two stable states (0 or 1)\n- Clocked: state changes occur on clock edge\n- Forms the basis of registers, counters, and memory\n\n### Common Types\n\n**SR Flip-Flop (Set-Reset)**\n- S=1 → sets output to 1\n- R=1 → resets output to 0\n- S=R=1 → forbidden state\n\n**D Flip-Flop (Data)**\n- On clock edge: output Q = input D\n- Most common type in modern design\n\n**JK Flip-Flop**\n- Like SR but J=K=1 causes toggle\n- No forbidden state\n\n**T Flip-Flop (Toggle)**\n- T=1 → output toggles on each clock edge\n- Used in counters\n\n### In DIGISIM\nYou can build an SR latch (level-triggered) using cross-coupled NAND or NOR gates. Ask me how!";
  }

  // ── PARITY ───────────────────────────────────────────────────────
  if (/parity.*bit|parity.*check|parity.*generator|even parity|odd parity/.test(m)) {
    return "## Parity Bits and Checkers\n\nParity is a simple error-detection method used in data transmission and storage.\n\n### Even Parity\n- Add a parity bit so the total number of 1s is **even**\n- Data 1011 has three 1s (odd) → parity bit = 1 → 10111 (four 1s, even)\n\n### Odd Parity\n- Add a parity bit so the total number of 1s is **odd**\n- Data 1011 has three 1s (odd) → parity bit = 0 → 10110\n\n### Implementation with XOR\nParity is implemented with a chain of XOR gates!\n- XOR all data bits together\n- Result = 0 means even number of 1s\n- Result = 1 means odd number of 1s\n\nFor a 4-bit parity generator: P = D3 XOR D2 XOR D1 XOR D0\n\n### Limitation\nParity can only detect an **odd number** of bit errors — it cannot correct errors or detect even-numbered errors.";
  }

  // ── COMPARATOR ───────────────────────────────────────────────────
  if (/comparator|compare.*two.*number|magnitude.*compare|1.?bit.*compar/.test(m)) {
    return "## Binary Comparator\n\nA comparator circuit compares two binary numbers and indicates their relationship: A=B, A>B, or A<B.\n\n### 1-Bit Comparator\n- A = B: XNOR(A, B) — outputs 1 when A equals B\n- A > B: A AND NOT B — outputs 1 when A=1, B=0\n- A < B: NOT A AND B — outputs 1 when A=0, B=1\n\n### Build in DIGISIM\n1. Add INPUTs A and B\n2. XNOR gate → OUTPUT (Equal)\n3. AND gate with NOT on B input → OUTPUT (A greater)\n4. AND gate with NOT on A input → OUTPUT (B greater)\n5. Simulate and test all 4 input combinations";
  }

  // ── SPECIFIC CIRCUITS ───────────────────────────────────────────
  if (/half.?adder/.test(m)) {
    return "## Half Adder\n\nAdds two 1-bit numbers. Produces a Sum and a Carry output.\n\n### Expressions\n- Sum = A XOR B\n- Carry = A AND B\n\n### Truth Table\n| A | B | Sum | Carry |\n|---|---|-----|-------|\n| 0 | 0 |  0  |   0   |\n| 0 | 1 |  1  |   0   |\n| 1 | 0 |  1  |   0   |\n| 1 | 1 |  0  |   1   |\n\n### Build Steps in DIGISIM\n1. Add 2 INPUT switches — label them A and B\n2. Add an XOR gate — connect A and B — this is your Sum\n3. Add an AND gate — connect A and B — this is your Carry\n4. Add 2 OUTPUT LEDs — label them Sum and Carry\n5. Wire XOR output to Sum LED, AND output to Carry LED\n6. Hit SIMULATE and toggle the inputs to verify";
  }

  if (/full.?adder/.test(m)) {
    return "## Full Adder\n\nAdds three bits: A, B, and Carry-in (Cin).\n\n### Expressions\n- Sum = A XOR B XOR Cin\n- Cout = (A AND B) OR (Cin AND (A XOR B))\n\n### Truth Table\n| A | B | Cin | Sum | Cout |\n|---|---|-----|-----|------|\n| 0 | 0 |  0  |  0  |  0   |\n| 0 | 0 |  1  |  1  |  0   |\n| 0 | 1 |  0  |  1  |  0   |\n| 0 | 1 |  1  |  0  |  1   |\n| 1 | 0 |  0  |  1  |  0   |\n| 1 | 0 |  1  |  0  |  1   |\n| 1 | 1 |  0  |  0  |  1   |\n| 1 | 1 |  1  |  1  |  1   |\n\n### Build Steps in DIGISIM\n1. Add 3 INPUTs: A, B, Cin\n2. XOR1: connect A and B\n3. XOR2: connect XOR1 output and Cin → Sum\n4. AND1: connect A and B\n5. AND2: connect XOR1 output and Cin\n6. OR gate: connect AND1 and AND2 → Carry-out\n7. Add 2 OUTPUTs: Sum and Cout\n8. SIMULATE and test all 8 combinations";
  }

  if (/\bmux|multiplexer|2.?to.?1 mux|selector/.test(m)) {
    return "## 2-to-1 Multiplexer\n\nSelects one of two inputs based on select line S.\n\n### Expression\nY = (A AND NOT S) OR (B AND S)\n\n### Truth Table\n| S | Y |\n|---|---|\n| 0 | A |\n| 1 | B |\n\n### Build Steps in DIGISIM\n1. Add 3 INPUTs: A, B, and S\n2. NOT gate: connect S → NOT S\n3. AND1: connect A and NOT S\n4. AND2: connect B and S\n5. OR gate: connect AND1 and AND2 → Y\n6. Add OUTPUT: Y\n7. SIMULATE — S=0 passes A, S=1 passes B";
  }

  if (/sr.?latch|sr.?flip|set.?reset/.test(m)) {
    return "## SR Latch (NAND implementation)\n\n### Build Steps in DIGISIM\n1. Add 2 INPUTs: S and R — both start at 0\n2. Add NAND1: inputs are S and NAND2's output\n3. Add NAND2: inputs are R and NAND1's output\n4. Add 2 OUTPUTs: Q and Q-bar\n5. SIMULATE\n\n### Operation (NAND SR Latch — active LOW)\n| S | R | Action |\n|---|---|--------|\n| 0 | 1 | Set: Q=1 |\n| 1 | 0 | Reset: Q=0 |\n| 1 | 1 | Hold state |\n| 0 | 0 | FORBIDDEN |\n\n### NOR SR Latch (active HIGH)\nUse NOR gates instead for active-HIGH inputs. Same behavior but S=R=1 is the forbidden state.";
  }

  if (/decoder|2.?to.?4/.test(m)) {
    return "## 2-to-4 Decoder\n\n### Build Steps in DIGISIM\n1. Add 2 INPUTs: A (MSB) and B (LSB)\n2. 2 NOT gates → NOT A and NOT B\n3. AND0: NOT A AND NOT B → Y0\n4. AND1: NOT A AND B → Y1\n5. AND2: A AND NOT B → Y2\n6. AND3: A AND B → Y3\n7. Add 4 OUTPUTs: Y0–Y3\n8. SIMULATE — exactly one LED lights for each input combo";
  }

  if (/majority|majority.?circuit/.test(m)) {
    return "## 3-Input Majority Circuit\n\n### Expression\nF = (A AND B) OR (A AND C) OR (B AND C)\n\n### Truth Table\n| A | B | C | F |\n|---|---|---|---|\n| 0 | 0 | 0 | 0 |\n| 0 | 0 | 1 | 0 |\n| 0 | 1 | 0 | 0 |\n| 0 | 1 | 1 | 1 |\n| 1 | 0 | 0 | 0 |\n| 1 | 0 | 1 | 1 |\n| 1 | 1 | 0 | 1 |\n| 1 | 1 | 1 | 1 |\n\n### Build Steps in DIGISIM\n1. Add 3 INPUTs: A, B, C\n2. AND1: A AND B\n3. AND2: A AND C\n4. AND3: B AND C\n5. OR gate (3 inputs): connect AND1, AND2, AND3 → F\n6. Add OUTPUT: F\n7. SIMULATE — output is 1 when 2 or more inputs are 1";
  }

  // ── INDIVIDUAL GATE EXPLANATIONS ─────────────────────────────────
  if (/(\band\s*gate\b|how.*(and gate|does and)|explain.*\band\b)/.test(m)||m==='and'||m==='and gate') {
    return "## AND Gate\n\nOutputs 1 only when ALL inputs are 1.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |\n\n### Expression\nQ = A · B\n\n### Behavior\nThink of AND as a series circuit — current only flows when ALL switches are closed.\n\n### Uses\nConditional enabling, carry generation in adders, masking bits.";
  }

  if (/(\bor\s*gate\b|how.*(or gate|does or)|explain.*\bor\b)/.test(m)||m==='or'||m==='or gate') {
    return "## OR Gate\n\nOutputs 1 when at least one input is 1.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 1 |\n\n### Expression\nQ = A + B\n\n### Behavior\nThink of OR as a parallel circuit — current flows if ANY switch is closed.\n\n### Uses\nCombining flags, implementing SOP terms, any situation where multiple conditions can trigger an output.";
  }

  if (/(\bnot\s*gate\b|inverter)/.test(m)||m==='not'||m==='not gate') {
    return "## NOT Gate (Inverter)\n\nFlips the input. The only single-input gate.\n\n### Truth Table\n| A | Q |\n|---|---|\n| 0 | 1 |\n| 1 | 0 |\n\n### Expression\nQ = A'\n\n### Uses\nComplementing signals, building active-low logic, part of NAND/NOR/XNOR implementations.";
  }

  if (/\bnand\b/.test(m)||m==='nand') {
    return "## NAND Gate\n\nOpposite of AND — output is LOW only when ALL inputs are HIGH. Universal gate.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |\n\n### Expression\nQ = (A · B)'\n\n### Universal Gate\nAny circuit can be built with only NAND gates. Widely used in CMOS due to efficiency.";
  }

  if (/\bnor\b/.test(m)||m==='nor') {
    return "## NOR Gate\n\nOpposite of OR — output is HIGH only when ALL inputs are LOW. Universal gate.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 0 |\n\n### Expression\nQ = (A + B)'\n\n### Universal Gate\nAny circuit can be built with only NOR gates.";
  }

  if (/\bxor\b/.test(m)||m==='xor') {
    return "## XOR Gate\n\nOutput is 1 when inputs are DIFFERENT.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |\n\n### Expression\nQ = A ⊕ B\n\n### Uses\nSum bit in adders, parity generation, equality testing (inverted), bit manipulation.";
  }

  if (/\bxnor\b/.test(m)||m==='xnor') {
    return "## XNOR Gate\n\nOutput is 1 when inputs are EQUAL.\n\n### Truth Table\n| A | B | Q |\n|---|---|---|\n| 0 | 0 | 1 |\n| 0 | 1 | 0 |\n| 1 | 0 | 0 |\n| 1 | 1 | 1 |\n\n### Expression\nQ = (A ⊕ B)' = A ⊙ B\n\n### Uses\nEquality detection, parity checking, error detection.";
  }

  // ── DIGISIM FEATURES ─────────────────────────────────────────────
  if (/rotat|rotate|spin|turn/.test(m)) {
    return "## Rotating in DIGISIM v2.5\n\n### Single Component\n- Select a gate or I/O component\n- Press **R** to rotate 90° clockwise\n- Or **right-click → Rotate 90°/180°/-90°**\n- Wires connected to that component auto-reroute\n\n### Group Rotate (wires rotate WITH the group!)\n- Lasso-select multiple components (drag on empty canvas)\n- Press **R** — the whole group rotates as one, including internal wire corners\n- Or right-click → Rotate Group 90°/180°\n- The group rotates around its **collective centroid**\n\n### Notes\n- Rotation is blocked during simulation — stop sim first\n- Rotation is preserved in save/export/import";
  }

  if (/simulate|how.*simulate/.test(m)) {
    return "## Running a Simulation\n\n1. Build your circuit with INPUTs and OUTPUTs\n2. Click **SIMULATE** in the toolbar\n3. Double-click any INPUT switch to toggle it 0↔1\n4. Watch wires turn green (HIGH) or blue (LOW)\n5. Click **STOP** to end\n\n### 🔒 Simulation Lock\nDuring simulation, **everything is locked** except INPUT toggles:\n- Cannot move, add, or delete components\n- Cannot draw, drag, or delete wires\n- Cannot rotate, select, or group anything\n- **Only double-clicking an INPUT switch works**\n\nStop simulation first to resume editing.";
  }

  if (/how.*wire|connect.*gate|draw.*wire|wire.*connect|routing|how to wire/.test(m)) {
    return "## Wiring in DIGISIM v2.5\n\n### Starting a Wire\n- **Click any output port** (right side, green dot) to wire forward\n- **Click any input port** (left side, red dot) to wire backward\n\n### During Wiring\n- Live preview follows your cursor\n- Input ports show **✓ CONNECT** when hovering a valid target\n- A status bar at the bottom guides you\n\n### Finishing\n- Click the target port to complete\n- Wire auto-routes around obstacles\n\n### Canceling\n- **Esc** or **Right-click** to cancel\n\n### Re-wiring\n- Click an already-connected input to detach and re-route\n- Double-click a wire to reset routing\n- Drag wire segments to adjust path";
  }

  if (/what is digisim|about digisim/.test(m)) {
    return "## DIGISIM v2.5\n\nAn interactive browser-based logic circuit simulator.\n\n### Features\n- 7 logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)\n- **Strict sim-lock** — only INPUT toggle allowed during simulation, everything else frozen\n- Bidirectional wiring with smart snap\n- Real-time simulation with color-coded wires\n- Truth Table Analyzer\n- K-Map Simplifier (2-4 variables)\n- Group Select with group rotation\n- Save/Export/Import\n- AI Guide (that's me!)\n\nBuilt by Group 3, LBYCPG3, BS-CpE E25, DLSU.";
  }

  if (/save|export|import/.test(m)) {
    return "## Saving & Exporting Circuits\n\n- **SAVE** — stores in your browser (accessible in DIRECTORY). Prompts for a name.\n- **EXPORT** — opens a dialog where you can **rename** the circuit before downloading a .json file. Also auto-saves to the directory.\n- **IMPORT** — loads any .json file. The filename becomes the circuit name automatically!\n- **Ctrl+S** — quick save shortcut\n\n### Export Flow\n1. Click EXPORT in the toolbar\n2. Edit the name in the dialog if needed\n3. Click **SAVE & EXPORT** — file downloads and directory updates";
  }

  if (/boolean|de morgan/.test(m)) {
    return "## Boolean Algebra\n\n### Key Laws\n- A OR 0 = A, A AND 1 = A\n- A OR 1 = 1, A AND 0 = 0\n- NOT(NOT A) = A\n- A OR NOT A = 1, A AND NOT A = 0\n\n### De Morgan's\n- NOT(A AND B) = NOT A OR NOT B\n- NOT(A OR B) = NOT A AND NOT B\n\nUse the K-MAP tool to simplify automatically!";
  }

  if (/k.?map|karnaugh/.test(m)) {
    return "## K-Map Simplification\n\n1. Build circuit with INPUTs and OUTPUTs\n2. Click **K-MAP** in toolbar\n3. Click **FROM CIRCUIT** to load truth table\n4. Click **SIMPLIFY** — done!\n\nSupports 2, 3, and 4-variable K-Maps. Groups 1s to find minimal SOP expression.";
  }

  // ── CONTINUATION HANDLERS ────────────────────────────────────────
  if (/^(yes|yeah|sure|ok|okay|go ahead|please|do it|show me|tell me more|continue|more|elaborate)/.test(m)) {
    if (prev.includes('half adder')) return generateAIReply('half adder', []);
    if (prev.includes('full adder')) return generateAIReply('full adder', []);
    if (prev.includes('mux')||prev.includes('multiplexer')) return generateAIReply('multiplexer', []);
    if (prev.includes('latch')||prev.includes('sr')) return generateAIReply('sr latch', []);
    if (prev.includes('decoder')) return generateAIReply('decoder', []);
    if (prev.includes('majority')) return generateAIReply('majority circuit', []);
    if (prev.includes('boolean')) return generateAIReply('boolean algebra', []);
    if (prev.includes('de morgan')) return generateAIReply('de morgan', []);
    if (prev.includes('flip')) return generateAIReply('flip-flop', []);
    if (prev.includes('parity')) return generateAIReply('parity', []);
    if (prev.includes('comparator')) return generateAIReply('comparator', []);
    return pick(["Sure! Could you be a bit more specific? Which circuit or concept?","Of course! Tell me more about what you're working on.","Happy to help! What specifically would you like to know?"]);
  }

  // ── SMART FALLBACK ───────────────────────────────────────────────
  if (/circuit|build|design|implement|create/.test(m) && /and|or|not|nand|nor|xor|gate|adder|mux|decoder|latch/.test(m)) {
    return "I can help you build that! Could you describe the circuit a bit more?\n\nFor example:\n- **What are your inputs?** (how many, what they represent)\n- **What should the output do?** (the logic operation or behavior)\n- **Any specific gates** you want to use?\n\nOr try asking directly: *'How do I build a half adder?'* or *'What gate gives output 1 when inputs are different?'*";
  }

  return pick([
    "That's outside my area, but I'm strong in digital logic! Try asking:\n- **'What is a logic gate?'**\n- **'What gate should I use to detect when inputs are equal?'**\n- **'Show me the truth table for XOR'**\n- **'How do I build a half adder?'**\n- **'What is Boolean algebra?'**",
    "I'm focused on digital logic, gates, Boolean algebra, and DIGISIM. For broader questions, a general AI would help more. Here's what I can answer:\n- Gate truth tables\n- Circuit design (adders, MUX, decoders, latches)\n- Boolean simplification\n- K-Map explanation\n- How to use any DIGISIM feature",
    "Outside my specialty! I'm great at digital logic. Ask me about a specific gate, Boolean algebra, circuit design, or DIGISIM features and I'll give you a thorough answer."
  ]);
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function renderAIMarkdown(text) {
  const lines = text.split('\n');
  let html = '';
  let inOL = false, inUL = false;
  const closeOL = () => { if (inOL) { html += '</ol>'; inOL = false; } };
  const closeUL = () => { if (inUL) { html += '</ul>'; inUL = false; } };
  const closeLists = () => { closeOL(); closeUL(); };
  const inlineFormat = (s) => {
    s = s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    s = s.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g,'<em>$1</em>');
    s = s.replace(/`([^`]+)`/g,'<code>$1</code>');
    return s;
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { closeLists(); continue; }
    if (/^## (.+)$/.test(line)) { closeLists(); html+=`<h2 class="ai-h2">${inlineFormat(line.slice(3))}</h2>`; continue; }
    if (/^### (.+)$/.test(line)) { closeLists(); html+=`<h3 class="ai-h3">${inlineFormat(line.slice(4))}</h3>`; continue; }
    if (/^\d+\. (.+)$/.test(line)) { closeUL(); if (!inOL){html+='<ol class="ai-ol">';inOL=true;} html+=`<li>${inlineFormat(line.replace(/^\d+\. /,''))}</li>`; continue; }
    if (/^[-•*] (.+)$/.test(line)) { closeOL(); if (!inUL){html+='<ul class="ai-ul">';inUL=true;} html+=`<li>${inlineFormat(line.replace(/^[-•*] /,''))}</li>`; continue; }
    if (/^---+$/.test(line)) { closeLists(); html+='<hr class="ai-hr"/>'; continue; }
    if (/^\|/.test(line)) {
      closeLists();
      if (/^[\|\s\-:]+$/.test(line)) continue;
      const cells = line.split('|').filter((c,i,a)=>i>0&&i<a.length-1).map(c=>`<td>${inlineFormat(c.trim())}</td>`).join('');
      html += `<table style="border-collapse:collapse;margin:4px 0;font-family:var(--font-mono);font-size:11px;width:100%"><tr>${cells}</tr></table>`;
      continue;
    }
    closeLists();
    html+=`<p class="ai-p">${inlineFormat(line)}</p>`;
  }
  closeLists();
  return html;
}

// ── MODAL HELPERS ────────────────────────────────────────────────
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  // Always reset save modal back to SAVE mode when closed
  if (id === 'saveModal') _setSaveModalMode('save');
}

// ── TOAST ────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type='info') {
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast show '+type;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),3500);
}

// ── INIT ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  drawCarousel(); resetCarouselAuto(); drawMiniIcons();
  initCanvas(); renderKmapInput(); renderKmapVisual([]); updateZoomLabel();
  updateFileIndicator();
  setInterval(()=>{ if (simRunning) { propagate(); redrawCanvas(); } }, 200);

  document.querySelectorAll('.comp-item').forEach(item => {
    item.addEventListener('click', ()=>{
      // STRICT SIM LOCK: no adding during simulation
      if (simRunning) {
        showToast('🔒 Stop simulation before adding components', 'error');
        return;
      }
      const type=item.dataset.type;
      const cw=document.getElementById('canvasWrapper');
      const wx=(cw.clientWidth/2-viewOffX)/viewScale+(Math.random()-0.5)*80;
      const wy=(cw.clientHeight/2-viewOffY)/viewScale+(Math.random()-0.5)*60;
      saveState(); addComponent(type, wx, wy);
      const h=document.getElementById('canvasHint');
      if (h) h.style.display='none';
    });
  });
});

/* =========================================================
   DIGISIM – Text Label Feature  (labels.js)
   Loaded AFTER script.js. Patches the existing engine to
   support LABEL-type "components" that render as styled
   text annotations on the canvas.
   =========================================================
   Design rules
   ─────────────
   • LABEL objects live in the `components` array alongside
     gates, just with type === 'LABEL'.
   • They have no ports (getInputPort / getOutputPort return
     null for them already because of the existing guard
     `if (comp.type === 'OUTPUT') return null` style checks —
     LABEL falls through to the same result since getPortAt
     can't find a match).
   • All existing undo/redo, save/load, group-select, drag,
     clear, and delete logic works automatically because it
     operates on `components` generically.
   • We PATCH (wrap) the three functions that draw on the
     canvas so labels are rendered there:
       – drawComponent()
       – updatePropsPanel()
       – addComponent()   (to set sensible defaults)
   • We also intercept keyboard 'T' to activate the label
     tool, and double-click to open the inline editor.
   ========================================================= */

(function () {
  'use strict';

  // ── Label tool state ────────────────────────────────────────────
  let labelToolActive = false;
  let editingLabel = null;   // reference to the label comp being edited
  let tempLabelActive = false; // temporary label following cursor
  let tempLabelX = 0, tempLabelY = 0;
  window.tempLabelActive = tempLabelActive; // make it accessible globally

  // ── Activate / deactivate the label placement tool ──────────────
  window.activateLabelTool = function () {
    if (typeof simRunning !== 'undefined' && simRunning) {
      showToast('🔒 Stop simulation before placing labels', 'error');
      return;
    }
    // If temporary label is active, deactivate it first
    if (tempLabelActive) {
      _stopTempLabel();
    }
    labelToolActive = !labelToolActive;
    const btn = document.getElementById('labelToolBtn');
    if (btn) {
      if (labelToolActive) {
        btn.classList.add('tb-active-label');
        btn.style.borderColor = '#00e5a0';
        btn.style.color = '#00e5a0';
        btn.style.background = 'rgba(0,229,160,0.12)';
        if (canvas) canvas.style.cursor = 'text';
        showToast('Label tool active — click anywhere on canvas to place a label. Press T or Esc to cancel.', 'info');
      } else {
        _deactivateLabelTool();
      }
    }
  };

  function _deactivateLabelTool() {
    labelToolActive = false;
    const btn = document.getElementById('labelToolBtn');
    if (btn) {
      btn.classList.remove('tb-active-label');
      btn.style.borderColor = '';
      btn.style.color = '';
      btn.style.background = '';
    }
    if (canvas) canvas.style.cursor = '';
  }

  // ── Temporary label mode (when label tool is off, press T) ──────
  function _startTempLabel() {
    if (tempLabelActive) return;
    tempLabelActive = true;
    tempLabelX = mouseX || 0;
    tempLabelY = mouseY || 0;
    if (canvas) canvas.style.cursor = 'text';
    showToast('Label mode: Click to place label, or press T/Esc to cancel.', 'info');
    redrawCanvas();
  }

  function _stopTempLabel() {
    if (!tempLabelActive) return;
    tempLabelActive = false;
    if (canvas) canvas.style.cursor = '';
    redrawCanvas();
  }
  window._stopTempLabel = _stopTempLabel;
  window.isTempLabelActive = function() { return tempLabelActive; };

  // ── Patch addComponent to supply LABEL defaults ──────────────────
  const _origAddComponent = window.addComponent;
  window.addComponent = function (type, x, y) {
    if (type !== 'LABEL') return _origAddComponent(type, x, y);
    // Build a minimal LABEL object
    const id = 'G' + (++compCounter);
    const comp = {
      id,
      type: 'LABEL',
      x, y,
      inputs: 0,
      inputValues: [],
      value: 0,
      label: id,
      rotation: 0,
      width: 120,
      height: 24,
      // Label-specific fields
      labelText: 'Label',
      labelSize: 14,
      labelColor: '#00e5a0',
      labelBold: false,
    };
    components.push(comp);
    document.getElementById('canvasHint').style.display = 'none';
    redrawCanvas();
    return comp;
  };

  // ── Patch drawComponent to render LABEL type ─────────────────────
  const _origDrawComponent = window.drawComponent;
  window.drawComponent = function (comp) {
    if (comp.type !== 'LABEL') return _origDrawComponent(comp);
    _drawLabelComponent(comp);
  };

  function _drawLabelComponent(comp) {
    const isSelected = (selectedComp && selectedComp.id === comp.id);
    const isGroupSel = groupSelected && groupSelected.includes(comp.id);
    const text = comp.labelText || 'Label';
    const size = comp.labelSize || 14;
    const color = comp.labelColor || '#00e5a0';
    const bold = comp.labelBold || false;

    ctx.save();
    ctx.translate(comp.x, comp.y);
    if (comp.rotation) ctx.rotate(comp.rotation * Math.PI / 180);

    // Measure text for hit area and selection box
    ctx.font = (bold ? 'bold ' : '') + size + 'px Share Tech Mono, monospace';
    const metrics = ctx.measureText(text);
    const tw = metrics.width;
    const th = size;

    // Update stored dimensions so drag/hit detection stays accurate
    comp.width = tw + 16;
    comp.height = th + 10;

    // Selection / hover highlight
    if (isSelected || isGroupSel) {
      ctx.fillStyle = 'rgba(59,130,246,0.08)';
      ctx.strokeStyle = isSelected ? '#3b82f6' : 'rgba(59,130,246,0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      const pad = 6;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(-pad, -th / 2 - pad, tw + pad * 2, th + pad * 2, 4)
                    : ctx.rect(-pad, -th / 2 - pad, tw + pad * 2, th + pad * 2);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Text shadow / glow when selected
    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
    }

    // Draw the text
    ctx.font = (bold ? 'bold ' : '') + size + 'px Share Tech Mono, monospace';
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  function _drawTempLabel() {
    const text = 'Label';
    const size = 14;
    const color = '#00e5a0';
    const bold = false;

    ctx.save();
    ctx.translate(tempLabelX, tempLabelY);

    // Measure text
    ctx.font = (bold ? 'bold ' : '') + size + 'px Share Tech Mono, monospace';
    const metrics = ctx.measureText(text);
    const tw = metrics.width;
    const th = size;

    // Semi-transparent background
    ctx.fillStyle = 'rgba(0,229,160,0.1)';
    ctx.strokeStyle = 'rgba(0,229,160,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    const pad = 6;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(-pad, -th / 2 - pad, tw + pad * 2, th + pad * 2, 4)
                  : ctx.rect(-pad, -th / 2 - pad, tw + pad * 2, th + pad * 2);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw the text
    ctx.font = (bold ? 'bold ' : '') + size + 'px Share Tech Mono, monospace';
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }

  // ── Patch updatePropsPanel to handle LABEL type ──────────────────
  const _origUpdatePropsPanel = window.updatePropsPanel;
  window.updatePropsPanel = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') {
      // Hide label section when not selected
      const sec = document.getElementById('propLabelSection');
      if (sec) sec.style.display = 'none';
      const row = document.getElementById('propLabelTextRow');
      if (row) row.style.display = '';
      return _origUpdatePropsPanel();
    }

    // Show common skeleton
    const noSel = document.getElementById('noSelection');
    const selProps = document.getElementById('selectionProps');
    noSel.style.display = 'none';
    selProps.style.display = '';

    document.getElementById('propTitle').textContent = 'Text Label';
    document.getElementById('propId').textContent = selectedComp.id;
    document.getElementById('propType').textContent = 'LABEL';

    // Hide gate-specific rows
    document.getElementById('propInputsRow').style.display = 'none';
    document.getElementById('propOutputRow').style.display = 'none';
    document.getElementById('propValueRow').style.display = 'none';
    document.getElementById('propRotateRow').style.display = 'none';
    // Hide the generic label field (we use our own)
    const labelTextRow = document.getElementById('propLabelTextRow');
    if (labelTextRow) labelTextRow.style.display = 'none';

    // Show label-specific section
    const sec = document.getElementById('propLabelSection');
    if (sec) sec.style.display = '';

    // Populate label fields
    const textIn = document.getElementById('propLabelText');
    if (textIn) textIn.value = selectedComp.labelText || '';

    const sizeIn = document.getElementById('propLabelSize');
    if (sizeIn) sizeIn.value = String(selectedComp.labelSize || 14);

    const colorIn = document.getElementById('propLabelColor');
    if (colorIn) colorIn.value = selectedComp.labelColor || '#00e5a0';

    const boldIn = document.getElementById('propLabelBold');
    if (boldIn) boldIn.checked = !!selectedComp.labelBold;
  };

  // Props panel update helpers called from HTML
  window.updateCanvasLabelText = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') return;
    const v = document.getElementById('propLabelText').value;
    selectedComp.labelText = v;
    redrawCanvas();
  };
  window.updateCanvasLabelSize = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') return;
    selectedComp.labelSize = parseInt(document.getElementById('propLabelSize').value, 10) || 14;
    redrawCanvas();
  };
  window.updateCanvasLabelColor = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') return;
    selectedComp.labelColor = document.getElementById('propLabelColor').value;
    redrawCanvas();
  };
  window.updateCanvasLabelBold = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') return;
    selectedComp.labelBold = document.getElementById('propLabelBold').checked;
    redrawCanvas();
  };

  // ── Inline label text editor ─────────────────────────────────────
  function _showLabelEditor(comp) {
    editingLabel = comp;
    const overlay = document.getElementById('labelEditorOverlay');
    const input = document.getElementById('labelEditorInput');
    if (!overlay || !input) return;

    // Position the editor over the label in screen space
    const wrapper = document.getElementById('canvasWrapper');
    const wRect = wrapper.getBoundingClientRect();
    const sp = worldToScreen(comp.x, comp.y);
    const scale = viewScale;

    input.style.fontSize = Math.max(12, (comp.labelSize || 14) * scale) + 'px';
    input.style.fontWeight = comp.labelBold ? 'bold' : 'normal';
    input.style.color = comp.labelColor || '#00e5a0';
    input.style.borderColor = comp.labelColor || '#00e5a0';
    input.style.boxShadow = '0 0 12px ' + (comp.labelColor || '#00e5a0') + '44';
    input.value = comp.labelText || '';

    overlay.style.display = 'block';
    overlay.style.left = sp.x + 'px';
    overlay.style.top = (sp.y - 20) + 'px';

    // Fit width to content
    input.style.width = Math.max(80, (comp.labelText || '').length * 10 + 40) + 'px';

    setTimeout(() => { input.focus(); input.select(); }, 30);
  }

  function _hideLabelEditor() {
    const overlay = document.getElementById('labelEditorOverlay');
    if (overlay) overlay.style.display = 'none';
    editingLabel = null;
  }

  window.commitLabelEdit = function () {
    if (!editingLabel) return;
    const input = document.getElementById('labelEditorInput');
    const newText = input ? input.value : '';
    if (newText.trim() === '' && editingLabel.labelText === 'Label') {
      // User blanked a brand-new label — delete it
      saveState();
      components = components.filter(c => c.id !== editingLabel.id);
      selectedComp = null;
      syncCompCounter();
      updatePropsPanel();
    } else {
      saveState();
      editingLabel.labelText = newText || editingLabel.labelText;
      // Sync props panel text field
      const t = document.getElementById('propLabelText');
      if (t) t.value = editingLabel.labelText;
    }
    _hideLabelEditor();
    redrawCanvas();
  };

  window.onLabelEditorKey = function (e) {
    if (e.key === 'Enter') { e.preventDefault(); commitLabelEdit(); }
    if (e.key === 'Escape') { e.preventDefault(); commitLabelEdit(); }
    // Resize input dynamically
    const input = document.getElementById('labelEditorInput');
    if (input) {
      setTimeout(() => {
        input.style.width = Math.max(80, input.value.length * 10 + 40) + 'px';
      }, 0);
    }
  };

  window.beginEditSelectedLabel = function () {
    if (!selectedComp || selectedComp.type !== 'LABEL') return;
    _showLabelEditor(selectedComp);
  };

  // ── Intercept canvas mousedown for label tool placement ──────────
  // We wrap the existing onMouseDown by listening on the same canvas
  // with capture so we can intercept BEFORE the existing handler.
  // Actually the cleanest approach: patch the existing handler by
  // installing a pre-handler on the canvas at capture phase.
  function _labelPreHandler(e) {
    if (e.button !== 0) return;

    // ── Temporary label placement ────────────────────────────────
    if (tempLabelActive) {
      if (typeof simRunning !== 'undefined' && simRunning) return;
      saveState();
      const comp = addComponent('LABEL', tempLabelX, tempLabelY);
      selectedComp = comp;
      groupSelected = [];
      updatePropsPanel();
      redrawCanvas();
      _stopTempLabel();
      // Open inline editor immediately
      setTimeout(() => _showLabelEditor(comp), 60);
      e.stopImmediatePropagation();
      return;
    }

    // ── Label tool click → place new label ──────────────────────
    if (labelToolActive) {
      if (typeof simRunning !== 'undefined' && simRunning) return;
      const rect = canvas.getBoundingClientRect();
      const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      saveState();
      const comp = addComponent('LABEL', x, y);
      selectedComp = comp;
      groupSelected = [];
      updatePropsPanel();
      redrawCanvas();
      _deactivateLabelTool();
      // Open inline editor immediately
      setTimeout(() => _showLabelEditor(comp), 60);
      e.stopImmediatePropagation();
      return;
    }
  }

  // ── Intercept double-click for editing existing labels ───────────
  function _labelDblClickHandler(e) {
    if (typeof drawingWire !== 'undefined' && drawingWire) return;
    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const comp = _getLabelAt(x, y);
    if (comp) {
      selectedComp = comp;
      groupSelected = [];
      updatePropsPanel();
      redrawCanvas();
      _showLabelEditor(comp);
      e.stopImmediatePropagation();
    }
  }

  function _getLabelAt(wx, wy) {
    for (let i = components.length - 1; i >= 0; i--) {
      const c = components[i];
      if (c.type !== 'LABEL') continue;
      const hw = (c.width || 120) / 2 + 8;
      const hh = (c.height || 24) / 2 + 8;
      if (wx >= c.x - 6 && wx <= c.x + hw + 6 && wy >= c.y - hh && wy <= c.y + hh) return c;
    }
    return null;
  }

  // ── Keyboard shortcut T to activate/deactivate label tool ────────
  // Wrap the existing keydown handler via addEventListener at capture.
  function _labelKeyHandler(e) {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'T' || e.key === 't') {
      if (typeof simRunning !== 'undefined' && simRunning) return;
      e.preventDefault();
      if (labelToolActive) {
        // If label tool is active, deactivate it
        activateLabelTool();
      } else {
        // If label tool is inactive, start temporary label mode
        _startTempLabel();
      }
    }
    if (e.key === 'Escape' && (labelToolActive || tempLabelActive)) {
      _deactivateLabelTool();
      _stopTempLabel();
      if (canvas) canvas.style.cursor = '';
    }
  }

  // ── Wire the handlers once the DOM/canvas are ready ─────────────
  function _hookHandlers() {
    if (!canvas) {
      setTimeout(_hookHandlers, 100);
      return;
    }
    canvas.addEventListener('mousedown', _labelPreHandler, true);
    canvas.addEventListener('dblclick', _labelDblClickHandler, true);
    window.addEventListener('keydown', _labelKeyHandler, true);

    // Patch drag-drop so LABEL type dropped onto canvas works
    const _origOnDrop = window.onDrop;
    // onDrop is an anonymous function assigned to the canvas event listener
    // — we just need dragGate to set dragGateType correctly, which it already does.
    // addComponent is already patched above.

    // Also patch getCompBBox so LABEL comps have proper hit boxes
    const _origGetCompBBox = window.getCompBBox;
    window.getCompBBox = function (comp, pad) {
      if (comp.type !== 'LABEL') return _origGetCompBBox(comp, pad);
      const hw = (comp.width || 120) / 2 + (pad || 0);
      const hh = (comp.height || 24) / 2 + (pad || 0);
      return { x1: comp.x - 6, y1: comp.y - hh, x2: comp.x + comp.width + 6, y2: comp.y + hh };
    };

    // Patch getInputPort / getOutputPort to hard-return null for LABELs
    // (they already do for INPUT/OUTPUT via early returns, but LABEL falls
    //  through to the gate path which could crash)
    const _origGetInputPort = window.getInputPort;
    window.getInputPort = function (comp, i) {
      if (comp.type === 'LABEL') return null;
      return _origGetInputPort(comp, i);
    };
    const _origGetOutputPort = window.getOutputPort;
    window.getOutputPort = function (comp) {
      if (comp.type === 'LABEL') return null;
      return _origGetOutputPort(comp);
    };

    // Patch evalComponent to skip LABELs during simulation
    const _origEvalComponent = window.evalComponent;
    window.evalComponent = function (comp) {
      if (comp.type === 'LABEL') return;
      return _origEvalComponent(comp);
    };
  }

  // Cursor hint while label tool is active and hovering over canvas
  function _labelMouseMoveHint(e) {
    if (labelToolActive || tempLabelActive) {
      if (canvas) canvas.style.cursor = 'text';
    }
    if (tempLabelActive) {
      const rect = canvas.getBoundingClientRect();
      const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      tempLabelX = x;
      tempLabelY = y;
      redrawCanvas();
    }
  }

  // Start hooking after a small delay to ensure script.js has fully run
  setTimeout(() => {
    _hookHandlers();
    if (canvas) {
      canvas.addEventListener('mousemove', _labelMouseMoveHint, false);
    }
  }, 200);

})();
