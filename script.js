/* ============ Word Globe (hero) ============ */
(function(){
  const canvas = document.getElementById('wordGlobe');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const wrap = canvas.parentElement;

  const WORDS = [
    'AI','ML','GenAI','LLM','RAG','NLP','Agents','MLOps',
    'Python','XGBoost','LightGBM','Transformers','Vision','Data',
    'Embeddings','Neural Nets','FastAPI','LangGraph','Docker',
    'Deep Learning','ChromaDB','SQL','AWS','MLflow','Pandas',
    'NumPy','Scikit-learn','PyTorch','Statistics','Prompting',
    'Vector DB','GPT','Gemini','Groq','DagsHub','CI/CD',
    'Feature Store','Fine-tuning','Inference','Data Pipeline'
  ];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, DPR, R;
  let points = [];
  let mouse = { x: 0, y: 0, active: false };
  let rot = { x: 0.28, y: 0 };
  let targetTilt = { x: 0, y: 0 };
  let t = 0;

  const COLORS = ['#8b7cf6', '#5b9cf6', '#2dd4bf', '#f0a94e', '#3ecf6e'];

  function buildPoints(){
    points = [];
    const n = WORDS.length;
    const offset = 2 / n;
    const increment = Math.PI * (3 - Math.sqrt(5)); // golden angle
    for(let i = 0; i < n; i++){
      const y = ((i * offset) - 1) + (offset / 2);
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const phi = i * increment;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      points.push({
        word: WORDS[i],
        x, y, z,
        color: COLORS[i % COLORS.length],
        seed: Math.random() * Math.PI * 2
      });
    }
  }

  function resize(){
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // On narrow screens the word labels themselves are wide relative to the
    // canvas, so a smaller radius keeps them from bunching up / clipping
    // against one edge instead of sitting evenly around the centre.
    const radiusFactor = W < 480 ? 0.36 : (W < 900 ? 0.42 : 0.48);
    R = Math.min(W, H) * radiusFactor;
  }

  function rotatePoint(p, ax, ay){
    // rotate around Y axis
    let x = p.x * Math.cos(ay) - p.z * Math.sin(ay);
    let z = p.x * Math.sin(ay) + p.z * Math.cos(ay);
    // rotate around X axis
    let y = p.y * Math.cos(ax) - z * Math.sin(ax);
    z = p.y * Math.sin(ax) + z * Math.cos(ax);
    return { x, y, z };
  }

  function onMove(e){
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouse.x = e.clientX - cx;
    mouse.y = e.clientY - cy;
    mouse.active = true;
    targetTilt.y = (mouse.x / (rect.width / 2)) * 0.9;
    targetTilt.x = -(mouse.y / (rect.height / 2)) * 0.6;
  }

  function onLeave(){
    mouse.active = false;
    targetTilt.x = 0;
    targetTilt.y = 0;
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseleave', onLeave);
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);

  // Keep the globe synced with its actual mobile container size. Some mobile
  // browsers settle the grid/container dimensions after the first paint.
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
  }

  // Re-measure shortly after load too: on mobile the container's size can
  // still shift slightly right after the initial paint (webfonts, browser
  // chrome/address-bar settling), which used to leave the sphere sized for
  // the wrong width until the user manually resized the window.
  window.addEventListener('load', () => setTimeout(resize, 300));

  function frame(){
    t += reduceMotion ? 0.001 : 0.0032;
    rot.y += reduceMotion ? 0.0004 : 0.0016;
    rot.x += (targetTilt.x - rot.x + 0.28) * 0.04;
    // ease auto rotation toward mouse-influenced yaw on top of continuous spin
    const easedYaw = rot.y + targetTilt.y * 0.35;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const projected = points.map(p => {
      const rp = rotatePoint(p, rot.x, easedYaw);
      // gentle per-word wobble/distortion, independent of cursor
      const wobble = reduceMotion ? 0 : Math.sin(t * 2 + p.seed) * 0.02;
      const px = cx + (rp.x + wobble) * R;
      const py = cy - (rp.y + wobble) * R * 0.98;
      const scale = (rp.z + 1.6) / 2.6; // 0..~1, closer to viewer = bigger
      return { ...p, px, py, z: rp.z, scale };
    });

    projected.sort((a, b) => a.z - b.z);

    projected.forEach(p => {
      let dx = 0, dy = 0, warp = 0;
      if(mouse.active){
        const ddx = p.px - (cx + mouse.x);
        const ddy = p.py - (cy + mouse.y);
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        const influence = Math.max(0, 1 - dist / 160);
        if(influence > 0){
          const angle = Math.atan2(ddy, ddx) + Math.sin(t * 3 + p.seed) * 0.6;
          const push = influence * 22;
          dx = Math.cos(angle) * push;
          dy = Math.sin(angle) * push;
          warp = influence;
        }
      }

      const size = 7 + p.scale * 5.5;
      const alpha = 0.22 + p.scale * 0.68;
      ctx.font = `${p.z > 0.3 ? 600 : 500} ${size}px Inter, sans-serif`;

      // Clamp so the full label (not just its anchor point) stays inside
      // the canvas — otherwise words near the sphere's edge get sliced off
      // by the canvas boundary and the cloud looks lopsided on narrow screens.
      const halfLabel = ctx.measureText(p.word).width / 2 + 6;
      const clampedX = Math.max(halfLabel, Math.min(W - halfLabel, p.px + dx));
      const clampedY = Math.max(size, Math.min(H - size, p.py + dy));

      ctx.save();
      ctx.translate(clampedX, clampedY);
      if(warp > 0){
        ctx.rotate((Math.sin(t * 4 + p.seed) * 0.25) * warp);
        ctx.scale(1 + warp * 0.35, 1 - warp * 0.15);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.min(1, alpha + warp * 0.3);
      ctx.fillText(p.word, 0, 0);
      ctx.restore();
    });

    requestAnimationFrame(frame);
  }

  buildPoints();
  resize();
  requestAnimationFrame(frame);
})();

const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c=>{
        c.classList.toggle('show', f==='all' || c.dataset.cat===f);
      });
    });
  });