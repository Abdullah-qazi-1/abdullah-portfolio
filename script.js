(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- progress bar ---------- */
  var progress = document.getElementById('progress');
  function onScroll(){
    var h = document.documentElement;
    var pct = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = pct + '%';
  }
  document.addEventListener('scroll', onScroll, {passive:true});

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function navScroll(){
    if(window.scrollY > 40){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', navScroll, {passive:true});
  navScroll();

  /* active nav link */
  var navLinks = document.querySelectorAll('[data-nav]');
  var navSections = ['work','about','system','achievement','contact'].map(function(id){return document.getElementById(id);});
  function activeNav(){
    var pos = window.scrollY + 200;
    var current = null;
    navSections.forEach(function(sec){ if(sec && sec.offsetTop <= pos){ current = sec.id; } });
    navLinks.forEach(function(l){
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });
  }
  document.addEventListener('scroll', activeNav, {passive:true});
  activeNav();

  /* ---------- mobile nav ---------- */
  var toggle = document.getElementById('navToggle');
  var mnav = document.getElementById('mnav');
  var mnavClose = document.getElementById('mnavClose');
  function openMnav(){ mnav.classList.add('open'); toggle.setAttribute('aria-expanded','true'); }
  function closeMnav(){ mnav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }
  toggle.addEventListener('click', openMnav);
  mnavClose.addEventListener('click', closeMnav);
  document.querySelectorAll('[data-mnav]').forEach(function(a){ a.addEventListener('click', closeMnav); });

  /* ---------- hero load reveal ---------- */
  var hero = document.querySelector('.hero');
  requestAnimationFrame(function(){
    setTimeout(function(){ hero.classList.add('loaded'); }, 150);
  });

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:.12, rootMargin:'0px 0px -60px 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- custom cursor ---------- */
  if(!isTouch){
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mx=0,my=0,rx=0,ry=0;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate('+mx+'px,'+my+'px) translate(-50%,-50%)';
    });
    function raf(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      ring.style.transform = 'translate('+rx+'px,'+ry+'px) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    }
    raf();
    var hoverables = document.querySelectorAll('a, button, .cap-row, .chip, [tabindex]');
    hoverables.forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('hover'); ring.classList.remove('view'); });
    });
    document.querySelectorAll('.project').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('view'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('view'); });
    });
  }

  /* ---------- what-i-build diagram swap ---------- */
  var capRows = document.querySelectorAll('.cap-row');
  var diagrams = document.querySelectorAll('.cap-diagram');
  function activateDiagram(key){
    diagrams.forEach(function(d){ d.classList.toggle('active', d.getAttribute('data-key') === key); });
  }
  capRows.forEach(function(row){
    row.addEventListener('mouseenter', function(){ activateDiagram(row.getAttribute('data-diagram')); });
    row.addEventListener('focus', function(){ activateDiagram(row.getAttribute('data-diagram')); });
  });

  /* ---------- tech stack relations ---------- */
  var relations = {
    "ChromaDB": ["RAG","LangChain","FastAPI","Groq","Prompt Engineering"],
    "RAG": ["ChromaDB","FAISS","LangChain","Hugging Face","Prompt Engineering"],
    "LangChain": ["RAG","ChromaDB","FAISS","Prompt Engineering","Groq"],
    "FAISS": ["RAG","LangChain","ChromaDB"],
    "Prompt Engineering": ["LangChain","RAG","Groq","Hugging Face"],
    "Groq": ["LangChain","RAG","ChromaDB","FastAPI"],
    "Hugging Face": ["RAG","Prompt Engineering","Scikit-learn"],
    "FastAPI": ["Docker","AWS EC2","ChromaDB","MLflow","MongoDB Atlas"],
    "Flask": ["Docker","AWS EC2"],
    "Streamlit": ["Python","Pandas"],
    "BeautifulSoup": ["Selenium","Python","Pandas"],
    "Selenium": ["BeautifulSoup","Python"],
    "Docker": ["AWS EC2","GitHub Actions","FastAPI","Elastic Beanstalk"],
    "AWS EC2": ["Docker","GitHub Actions","FastAPI","AWS S3"],
    "AWS S3": ["AWS EC2","Elastic Beanstalk"],
    "Elastic Beanstalk": ["Docker","AWS S3"],
    "GitHub Actions": ["Docker","AWS EC2","Git"],
    "MongoDB Atlas": ["FastAPI","MLflow"],
    "MySQL": ["SQL","Pandas"],
    "Git": ["GitHub Actions","VS Code"],
    "Jupyter": ["Pandas","NumPy","Scikit-learn"],
    "VS Code": ["Git","Python"],
    "Scikit-learn": ["XGBoost","LightGBM","Pandas","NumPy","MLflow"],
    "XGBoost": ["Scikit-learn","LightGBM","MLflow"],
    "LightGBM": ["Scikit-learn","XGBoost","MLflow"],
    "Pandas": ["NumPy","Scikit-learn","Jupyter"],
    "NumPy": ["Pandas","Scikit-learn","Jupyter"],
    "MLflow": ["DagsHub","Scikit-learn","XGBoost","LightGBM","Docker","MongoDB Atlas"],
    "DagsHub": ["MLflow","Git"],
    "Python": ["Pandas","NumPy","Scikit-learn","FastAPI","Jupyter"],
    "SQL": ["MySQL","MongoDB Atlas"],
    "Bash": ["Docker","GitHub Actions"],
    "R": ["Scikit-learn"]
  };
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function(chip){
    chip.addEventListener('mouseenter', function(){
      var tech = chip.getAttribute('data-tech');
      var related = relations[tech] || [];
      chips.forEach(function(c){
        var t = c.getAttribute('data-tech');
        if(t === tech || related.indexOf(t) > -1){
          c.classList.add('related'); c.classList.remove('dim');
        } else {
          c.classList.add('dim'); c.classList.remove('related');
        }
      });
    });
    chip.addEventListener('mouseleave', function(){
      chips.forEach(function(c){ c.classList.remove('related'); c.classList.remove('dim'); });
    });
  });

  /* ---------- case study overlays ---------- */
  var openers = document.querySelectorAll('[data-open]');
  var lastFocused = null;
  function openOverlay(key){
    var ov = document.getElementById('overlay-' + key);
    if(!ov) return;
    lastFocused = document.activeElement;
    ov.classList.add('open');
    document.body.style.overflow = 'hidden';
    var closeBtn = ov.querySelector('[data-close]');
    if(closeBtn) closeBtn.focus();
  }
  function closeOverlay(ov){
    ov.classList.remove('open');
    document.body.style.overflow = '';
    if(lastFocused) lastFocused.focus();
  }
  openers.forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      openOverlay(btn.getAttribute('data-open'));
    });
  });
  document.querySelectorAll('.overlay [data-close]').forEach(function(btn){
    btn.addEventListener('click', function(){ closeOverlay(btn.closest('.overlay')); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      document.querySelectorAll('.overlay.open').forEach(closeOverlay);
      closeMnav();
    }
  });

  /* ---------- magnetic buttons ---------- */
  if(!isTouch && !reduced){
    document.querySelectorAll('.magnetic').forEach(function(el){
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width/2) * 0.25;
        var y = (e.clientY - r.top - r.height/2) * 0.4;
        el.style.transform = 'translate('+x+'px,'+y+'px)';
      });
      el.addEventListener('mouseleave', function(){ el.style.transform = ''; });
    });
  }

  /* ---------- hero canvas: system map ---------- */
  var heroCanvas = document.getElementById('hero-canvas');
  var hctx = heroCanvas.getContext('2d');
  var W,H,dpr = Math.min(window.devicePixelRatio||1, 2);
  var nodes = [];
  var labels = ['DATA','RETRIEVAL','MODEL','AGENT','OUTPUT'];
  var mouseX=0.5, mouseY=0.5;
  var heroMobile = false;

  function sizeCanvas(){
    var rect = heroCanvas.parentElement.getBoundingClientRect();
    W = rect.width; H = rect.height;
    heroMobile = W < 700;
    heroCanvas.width = W*dpr; heroCanvas.height = H*dpr;
    heroCanvas.style.width = W+'px'; heroCanvas.style.height = H+'px';
    hctx.setTransform(dpr,0,0,dpr,0,0);
    buildNodes();
  }
  function buildNodes(){
    nodes = [];
    var n = labels.length;
    for(var i=0;i<n;i++){
      var t = n===1?0.5:i/(n-1);
      nodes.push({
        x: W*0.12 + t*W*0.76,
        y: H*0.5 + Math.sin(t*Math.PI*1.4)*H*0.14,
        baseY: H*0.5 + Math.sin(t*Math.PI*1.4)*H*0.14,
        label: labels[i],
        phase: Math.random()*Math.PI*2
      });
    }
    // particles
    particles = [];
    for(var p=0;p<26;p++){
      particles.push({
        edge: Math.floor(Math.random()*(n-1)),
        t: Math.random(),
        speed: 0.0018 + Math.random()*0.0026
      });
    }
  }
  var particles = [];
  window.addEventListener('mousemove', function(e){
    var rect = heroCanvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left)/rect.width;
    mouseY = (e.clientY - rect.top)/rect.height;
  });
  window.addEventListener('resize', sizeCanvas);
  sizeCanvas();

  var t0 = performance.now();
  function drawHero(now){
    var t = (now-t0)/1000;
    hctx.clearRect(0,0,W,H);
    var parallaxX = (mouseX-0.5)*18;
    var parallaxY = (mouseY-0.5)*10;

    // update node y with gentle float + mouse parallax
    nodes.forEach(function(node,i){
      node.y = node.baseY + Math.sin(t*0.6 + node.phase)*6 + parallaxY*(0.3+i*0.08);
      node.px = node.x + parallaxX*(0.3+i*0.06);
    });

    // connecting lines
    hctx.lineWidth = 1;
    for(var i=0;i<nodes.length-1;i++){
      var a = nodes[i], b = nodes[i+1];
      hctx.strokeStyle = 'rgba(242,239,230,0.14)';
      hctx.beginPath();
      hctx.moveTo(a.px,a.y);
      hctx.lineTo(b.px,b.y);
      hctx.stroke();
    }

    // particles traveling
    hctx.fillStyle = '#7b6bff';
    particles.forEach(function(p){
      if(!reduced){ p.t += p.speed; if(p.t>1){p.t=0; p.edge = (p.edge+1) % (nodes.length-1);} }
      var a = nodes[p.edge], b = nodes[p.edge+1];
      var x = a.px + (b.px-a.px)*p.t;
      var y = a.y + (b.y-a.y)*p.t;
      hctx.globalAlpha = 0.85;
      hctx.beginPath();
      hctx.arc(x,y,1.6,0,Math.PI*2);
      hctx.fill();
    });
    hctx.globalAlpha = 1;

    // nodes
    var nodeR = heroMobile ? 2.6 : 4;
    var nodeInnerR = heroMobile ? 1 : 1.6;
    nodes.forEach(function(node){
      hctx.beginPath();
      hctx.arc(node.px, node.y, nodeR, 0, Math.PI*2);
      hctx.fillStyle = '#0a0b0d';
      hctx.fill();
      hctx.lineWidth = 1.3;
      hctx.strokeStyle = 'rgba(123,107,255,0.9)';
      hctx.stroke();

      hctx.beginPath();
      hctx.arc(node.px, node.y, nodeInnerR, 0, Math.PI*2);
      hctx.fillStyle = '#7b6bff';
      hctx.fill();
    });

    if(!reduced){ requestAnimationFrame(drawHero); }
  }
  requestAnimationFrame(drawHero);
  if(reduced){ setTimeout(function(){ hctx.clearRect(0,0,W,H); }, 50); drawHero(0); }

  /* ---------- achievement canvas: scattered global network ---------- */
  var aCanvas = document.getElementById('achieve-canvas');
  var actx = aCanvas.getContext('2d');
  function sizeAchieve(){
    var rect = aCanvas.parentElement.getBoundingClientRect();
    aCanvas.width = rect.width*dpr; aCanvas.height = rect.height*dpr;
    aCanvas.style.width = rect.width+'px'; aCanvas.style.height = rect.height+'px';
    actx.setTransform(dpr,0,0,dpr,0,0);
    drawAchieve(rect.width, rect.height);
  }
  function drawAchieve(w,h){
    actx.clearRect(0,0,w,h);
    var pts = [];
    var seedRand = mulberry32(42);
    for(var i=0;i<38;i++){
      pts.push({x: seedRand()*w, y: seedRand()*h});
    }
    actx.strokeStyle = 'rgba(10,11,13,0.10)';
    actx.lineWidth = 1;
    for(var i=0;i<pts.length;i++){
      for(var j=i+1;j<pts.length;j++){
        var dx = pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        var d = Math.sqrt(dx*dx+dy*dy);
        if(d < Math.min(w,h)*0.16){
          actx.beginPath();
          actx.moveTo(pts[i].x,pts[i].y);
          actx.lineTo(pts[j].x,pts[j].y);
          actx.stroke();
        }
      }
    }
    actx.fillStyle = 'rgba(123,107,255,0.55)';
    pts.forEach(function(p){
      actx.beginPath();
      actx.arc(p.x,p.y,1.8,0,Math.PI*2);
      actx.fill();
    });
  }
  function mulberry32(a){
    return function(){
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }
  window.addEventListener('resize', sizeAchieve);
  sizeAchieve();

  /* ---------- sitewide cursor-reactive starfield ---------- */
  var bgCanvas = document.getElementById('bg-canvas');
  var bctx = bgCanvas.getContext('2d');
  var BW, BH, bdpr = Math.min(window.devicePixelRatio||1, 2);
  var stars = [];
  var glowRadius = 220;
  var cursorX = -9999, cursorY = -9999;
  var targetCursorX = -9999, targetCursorY = -9999;
  var starCount = isTouch ? 46 : 92;

  function sizeBg(){
    BW = window.innerWidth; BH = window.innerHeight;
    bgCanvas.width = BW*bdpr; bgCanvas.height = BH*bdpr;
    bgCanvas.style.width = BW+'px'; bgCanvas.style.height = BH+'px';
    bctx.setTransform(bdpr,0,0,bdpr,0,0);
    buildStars();
  }
  function buildStars(){
    stars = [];
    for(var i=0;i<starCount;i++){
      stars.push({
        x: Math.random()*BW,
        y: Math.random()*BH,
        vx: (Math.random()-0.5)*0.06,
        vy: (Math.random()-0.5)*0.06,
        r: 0.7 + Math.random()*1.1,
        tw: Math.random()*Math.PI*2
      });
    }
  }
  window.addEventListener('resize', sizeBg);
  sizeBg();

  if(!isTouch){
    window.addEventListener('mousemove', function(e){
      targetCursorX = e.clientX; targetCursorY = e.clientY;
    });
    window.addEventListener('mouseleave', function(){ targetCursorX = -9999; targetCursorY = -9999; });
  }

  var bgT0 = performance.now();
  function drawBg(now){
    var t = (now-bgT0)/1000;
    bctx.clearRect(0,0,BW,BH);

    if(!reduced){
      cursorX += (targetCursorX-cursorX)*0.14;
      cursorY += (targetCursorY-cursorY)*0.14;
    } else {
      cursorX = targetCursorX; cursorY = targetCursorY;
    }

    // soft ambient glow at cursor position
    if(cursorX > -1000){
      var grad = bctx.createRadialGradient(cursorX,cursorY,0,cursorX,cursorY,glowRadius*1.3);
      grad.addColorStop(0,'rgba(123,107,255,0.10)');
      grad.addColorStop(1,'rgba(123,107,255,0)');
      bctx.fillStyle = grad;
      bctx.fillRect(cursorX-glowRadius*1.3, cursorY-glowRadius*1.3, glowRadius*2.6, glowRadius*2.6);
    }

    // drift stars
    if(!reduced){
      stars.forEach(function(s){
        s.x += s.vx; s.y += s.vy;
        if(s.x < -10) s.x = BW+10; if(s.x > BW+10) s.x = -10;
        if(s.y < -10) s.y = BH+10; if(s.y > BH+10) s.y = -10;
      });
    }

    // constellation lines between nearby stars, brighter near cursor
    bctx.lineWidth = 1;
    var linkDist = 130;
    for(var i=0;i<stars.length;i++){
      for(var j=i+1;j<stars.length;j++){
        var a = stars[i], b = stars[j];
        var dx = a.x-b.x, dy = a.y-b.y;
        var d = Math.sqrt(dx*dx+dy*dy);
        if(d < linkDist){
          var mx = (a.x+b.x)/2, my = (a.y+b.y)/2;
          var cd = Math.hypot(mx-cursorX, my-cursorY);
          var glow = Math.max(0, 1 - cd/glowRadius);
          var baseA = (1 - d/linkDist) * 0.05;
          var alpha = baseA + glow*0.5;
          if(alpha > 0.01){
            bctx.strokeStyle = 'rgba(123,107,255,'+Math.min(alpha,0.85)+')';
            bctx.beginPath();
            bctx.moveTo(a.x,a.y);
            bctx.lineTo(b.x,b.y);
            bctx.stroke();
          }
        }
      }
    }

    // stars themselves, brighter + larger near cursor
    stars.forEach(function(s){
      var d = Math.hypot(s.x-cursorX, s.y-cursorY);
      var glow = Math.max(0, 1 - d/glowRadius);
      var twinkle = reduced ? 0 : (Math.sin(t*1.2 + s.tw)*0.12);
      var alpha = Math.min(1, 0.28 + twinkle + glow*0.9);
      var radius = s.r + glow*2.2;
      bctx.beginPath();
      bctx.arc(s.x, s.y, radius, 0, Math.PI*2);
      bctx.fillStyle = 'rgba(243,240,232,'+alpha+')';
      bctx.fill();
      if(glow > 0.15){
        bctx.beginPath();
        bctx.arc(s.x, s.y, radius*2.4, 0, Math.PI*2);
        bctx.fillStyle = 'rgba(123,107,255,'+(glow*0.18)+')';
        bctx.fill();
      }
    });

    if(!reduced){ requestAnimationFrame(drawBg); }
  }
  requestAnimationFrame(drawBg);
  if(!isTouch && reduced){
    window.addEventListener('mousemove', function(){ requestAnimationFrame(drawBg); });
  }

})();
