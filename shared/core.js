// ==========================================================
//  复拍 POLYMETER — 共享脚本
//  全局：导航 / 光标波形 / 节拍器
// ==========================================================

// -------- 导航数据 --------
const NAV = [
  { num: '01', en: 'Index',     zh: '首页',   href: 'index.html'     },
  { num: '02', en: 'Method',    zh: '技术',   href: 'anatomy.html'   },
  { num: '03', en: 'Archive',   zh: '乐队',   href: 'archive.html'   },
  { num: '04', en: 'History',   zh: '历史',   href: 'history.html'   },
  { num: '05', en: 'Discourse', zh: '讨论',   href: 'discourse.html' },
];

// -------- 注入顶部导航 --------
function buildHeader(activePage) {
  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="container">
      <a href="index.html" class="brand">
        <svg class="brand-mark" viewBox="0 0 40 40" id="brand-svg">
          <rect x="6" y="6" width="28" height="28" fill="none" stroke="var(--acid)" stroke-width="1.5" id="brand-r1" />
          <rect x="11" y="11" width="18" height="18" fill="none" stroke="var(--paper)" stroke-width="1" id="brand-r2" />
          <rect x="16" y="16" width="8" height="8" fill="var(--acid)" id="brand-r3" />
        </svg>
        <div class="brand-text">
          <div class="display-en">POLYMETER</div>
          <div class="zh">复 · 拍</div>
        </div>
      </a>
      <nav class="nav-links">
        ${NAV.map(n => `
          <a href="${n.href}" class="${activePage === n.href ? 'active' : ''}">
            <span class="num">${n.num}</span>
            <span class="zh-label">${n.zh}</span>
          </a>
        `).join('')}
      </nav>
      <a href="login.html" class="login-btn">登录 / Login →</a>
    </div>
  `;
  document.body.insertBefore(header, document.body.firstChild);

  // Logo 旋转动画
  let tick = 0;
  setInterval(() => {
    tick++;
    const r1 = document.getElementById('brand-r1');
    const r2 = document.getElementById('brand-r2');
    const r3 = document.getElementById('brand-r3');
    if (r1) r1.setAttribute('transform', `rotate(${tick * 0.5} 20 20)`);
    if (r2) r2.setAttribute('transform', `rotate(${-tick * 0.7} 20 20)`);
    if (r3) r3.setAttribute('transform', `rotate(${tick * 1.3} 20 20)`);
  }, 80);
}

// -------- 注入页脚 --------
function buildFooter() {
  const footer = document.createElement('footer');
  footer.className = 'site-footer';
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="display-en" style="font-size:28px; font-weight:700;">POLYMETER</div>
          <div class="serif" style="font-size:14px; letter-spacing:0.2em; margin-top:4px; color: var(--paper-dim);">复拍 · 数学摇滚入门指南</div>
          <p style="margin-top:16px; font-size:13px; color: var(--paper-dim); line-height:1.7; max-width:420px;">
            一份关于数学摇滚的开放档案——它的历史、它的理论，它奇异而美丽的算术。人手编辑，非生成。
          </p>
        </div>
        <div>
          <h4>章节 · Sections</h4>
          <ul>
            <li><a href="index.html">首页 Index</a></li>
            <li><a href="anatomy.html">技术 Method</a></li>
            <li><a href="archive.html">乐队 Archive</a></li>
            <li><a href="history.html">历史 History</a></li>
            <li><a href="discourse.html">讨论 Discourse</a></li>
          </ul>
        </div>
        <div>
          <h4>元信息 · Meta</h4>
          <ul>
            <li><a href="#">关于本站</a></li>
            <li><a href="#">个人编辑</a></li>
            
           
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© POLYMETER · 保留所有拍号</span>
        <span>编译于 7/8 拍</span>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

// -------- 光标波形 --------
function setupCursorWave() {
  if (window.innerWidth < 768) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'cursor-wave';
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  poly.setAttribute('fill', 'none');
  poly.setAttribute('stroke', 'var(--acid)');
  poly.setAttribute('stroke-width', '1');
  poly.setAttribute('opacity', '0.6');
  svg.appendChild(poly);

  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '3');
  dot.setAttribute('fill', 'var(--acid)');
  svg.appendChild(dot);

  document.body.appendChild(svg);

  let cx = -100, cy = -100, t = 0;
  window.addEventListener('mousemove', (e) => { cx = e.clientX; cy = e.clientY; });
  setInterval(() => {
    t++;
    const points = [];
    for (let i = 0; i < 40; i++) {
      const x = cx - i * 4;
      const y = cy + Math.sin((t * 0.3 + i * 0.5)) * (10 - i * 0.2);
      points.push(`${x},${y}`);
    }
    poly.setAttribute('points', points.join(' '));
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
  }, 40);
}

// -------- 全局节拍器（供其他脚本订阅） --------
window.METRONOME = { tick: 0, listeners: [] };
setInterval(() => {
  window.METRONOME.tick++;
  window.METRONOME.listeners.forEach(fn => fn(window.METRONOME.tick));
}, 80);

window.subscribeTick = (fn) => window.METRONOME.listeners.push(fn);

// -------- 拍号数据（全站共用） --------
window.METERS = [
  { name: '4/4',  zh: '四四拍',  desc: '标准节拍 · the standard',          beats: [1,0,0,0,1,0,0,0],            total: 8,  accent: [0,4]        },
  { name: '7/8',  zh: '七八拍',  desc: '不对称脉动 · asymmetric pulse',     beats: [1,0,0,1,0,1,0],              total: 7,  accent: [0,3,5]      },
  { name: '5/4',  zh: '五四拍',  desc: '《Take Five》之地 · Take Five territory', beats: [1,0,0,1,0,1,0,1,0,0],   total: 10, accent: [0,3,5,7]    },
  { name: '11/8', zh: '十一八拍', desc: '深度数学领域 · deep math territory', beats: [1,0,0,1,0,1,0,0,1,0,1],     total: 11, accent: [0,3,5,8,10] },
];

// -------- 乐队数据（全站共用） --------
window.BANDS = [
  { name: 'Slint',             zh: '斯林特',     year: 1986, country: 'USA', region: '美国', meter: '5/4',  album: 'Spiderland',                       albumZh: '《蛛地》',        color: '#d4ff3a' },
  { name: 'Don Caballero',     zh: '堂·骑兵',    year: 1991, country: 'USA', region: '美国', meter: '7/8',  album: 'American Don',                     albumZh: '《美国堂》',      color: '#ff5b3a' },
  { name: 'Toe',               zh: '脚趾',       year: 2000, country: 'JPN', region: '日本', meter: '11/8', album: 'The Book About My Idle Philosophy', albumZh: '《关于我的闲散哲学》', color: '#3aafff' },
  { name: 'American Football', zh: '美式足球',   year: 1997, country: 'USA', region: '美国', meter: '6/4',  album: 'American Football (LP1)',          albumZh: '《同名首专》',    color: '#d4ff3a' },
  { name: 'tricot',            zh: '崔可',       year: 2010, country: 'JPN', region: '日本', meter: '9/8',  album: 'T H E',                            albumZh: '《T H E》',      color: '#ff5b3a' },
  { name: 'Tortoise',          zh: '陆龟',       year: 1990, country: 'USA', region: '美国', meter: '5/4',  album: 'Millions Now Living',              albumZh: '《亿万生灵》',    color: '#3aafff' },
  { name: 'CHON',              zh: 'CHON',       year: 2008, country: 'USA', region: '美国', meter: '4/4',  album: 'Grow',                             albumZh: '《Grow》',        color: '#d4ff3a' },
  { name: 'Battles',           zh: '战役',       year: 2002, country: 'USA', region: '美国', meter: '5/4',  album: 'Mirrored',                         albumZh: '《镜像》',        color: '#ff5b3a' },
  { name: 'LITE',              zh: '光体',       year: 2003, country: 'JPN', region: '日本', meter: '7/8',  album: 'Phantasia',                        albumZh: '《幻想曲》',      color: '#3aafff' },
];

// -------- 入口 --------
function initPage(activePage) {
  buildHeader(activePage);
  buildFooter();
  setupCursorWave();
}
