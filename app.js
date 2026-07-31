/* 小龙工作台 - Hello Kitty风格 */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // ====== 工具 ======
  const store = {
    get(k, def){ try{ const v = localStorage.getItem(k); if(v==null) return def; try{return JSON.parse(v);}catch(_){return v;} }catch(e){ return def; } },
    set(k, v){ if(typeof v === 'string') localStorage.setItem(k, v); else localStorage.setItem(k, JSON.stringify(v)); }
  };
  const todayKey = () => { const d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); };
  const monthKey = () => { const d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1); };
  const pad = n => (n<10?'0':'')+n;
  const fmt = n => Number(n||0).toFixed(2);
  const toast = m => {
    const t = $('#toast'); t.textContent = m;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(()=>t.classList.remove('show'), 1400);
  };

  const wkMap = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];

  function tickClock(){
    const d = new Date();
    $('#statusTime').textContent = pad(d.getHours())+':'+pad(d.getMinutes());
    const dateStr = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    $('#todayDate').textContent = dateStr;
    $('#clockTime').textContent = pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
    $('#clockDate').textContent = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 · '+wkMap[d.getDay()];
    ['en','ledger','sport','news','fin','memo','todo'].forEach(k => {
      const el = $('#'+k+'Date'); if(el) el.textContent = dateStr;
    });
  }

  // ====== 导航 ======
  function bindNav(){
    $$('.nav-item').forEach(b => b.addEventListener('click', () => {
      $$('.nav-item').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const t = b.dataset.target;
      $$('.page').forEach(p => p.classList.remove('active'));
      const page = $('#page-'+t);
      if(page) page.classList.add('active');
      document.querySelector('.sidebar')?.classList.remove('open');
    }));
    $('#menuToggle').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
  }

  // ====== 每日激励 ======
  const QUOTES = [
    {cn:'今天也要元气满满呀', en:'Be full of energy today'},
    {cn:'慢慢来，比较快', en:'Slowly is the fastest way'},
    {cn:'你比你想象的更勇敢', en:'You are braver than you think'},
    {cn:'温柔地对待自己', en:'Be gentle with yourself'},
    {cn:'今天又是崭新的开始', en:'Today is a brand new start'},
    {cn:'坚持下去，星光会为你亮起', en:'Keep going, the stars will light up for you'},
    {cn:'小小进步，也是大大的胜利', en:'Small progress is still big victory'},
    {cn:'把每一天过成你喜欢的样子', en:'Live each day the way you love'},
    {cn:'你已经是自己的小太阳了', en:'You are already your own sunshine'},
    {cn:'专注当下，未来可期', en:'Stay focused, the future is bright'},
    {cn:'努力会被看见的', en:'Effort will be seen'},
    {cn:'今天也辛苦啦，记得爱自己', en:'Great job today, remember to love yourself'},
    {cn:'运气藏在努力里', en:'Luck hides in hard work'},
    {cn:'一步一步来，你可以的', en:'Step by step, you can do it'},
    {cn:'保持好奇，世界很有趣', en:'Stay curious, the world is fun'},
    {cn:'今天比昨天好一点点就好', en:'A little better than yesterday is enough'},
    {cn:'生活明朗，万物可爱', en:'Life is bright, everything is lovely'},
    {cn:'别忘了夸夸自己', en:"Don't forget to praise yourself"},
    {cn:'做喜欢的自己', en:'Be the self you love'},
    {cn:'每一份努力都值得', en:'Every effort is worth it'},
    {cn:'愿你眼里有光，心中有爱', en:'May your eyes shine and heart full of love'},
    {cn:'把烦恼留给昨天', en:'Leave the worries to yesterday'},
    {cn:'心情要好，事情才顺', en:'Good mood makes everything smoother'},
    {cn:'再坚持一下下', en:'Just hold on a little longer'},
    {cn:'今天也要好好吃饭呀', en:'Remember to eat well today'},
    {cn:'心怀希望，永不放弃', en:'Keep hope, never give up'},
    {cn:'你比你以为的更闪亮', en:'You shine more than you know'},
    {cn:'每一天都是礼物', en:'Every day is a gift'},
    {cn:'做自己想做的那个人', en:'Be who you want to be'},
    {cn:'愿温柔被世界温柔以待', en:'May gentleness be met with gentleness'},
    {cn:'你值得所有的美好', en:'You deserve all the beautiful things'},
  ];

  function pickDaily(){
    const key = 'workbench_quote_'+todayKey();
    const cached = store.get(key, null);
    if(cached) return cached;
    const item = QUOTES[Math.floor(Math.random()*QUOTES.length)];
    store.set(key, item);
    return item;
  }
  function refreshMotto(){
    const q = pickDaily();
    $('#mottoCN').textContent = q.cn;
    $('#mottoEN').textContent = q.en;
    $('#quoteCN').textContent = q.cn;
    $('#quoteEN').textContent = q.en;
    $('#quoteDate').textContent = todayKey();
  }

  // ====== 本月日历 ======
  function renderCal(){
    const d = new Date();
    const y = d.getFullYear(), m = d.getMonth();
    const today = d.getDate();
    const firstDay = new Date(y, m, 1).getDay(); // 0=Sun
    const lastDate = new Date(y, m+1, 0).getDate();
    const heads = ['日','一','二','三','四','五','六'];
    const grid = $('#calGrid'); grid.innerHTML='';
    heads.forEach(h => {
      const e = document.createElement('div'); e.className='d-head'; e.textContent = h; grid.appendChild(e);
    });
    // 前面空格
    const offset = firstDay; // 把周日作为列首
    for(let i=0;i<offset;i++){
      const e = document.createElement('div'); e.className='d-cell muted'; e.textContent=''; grid.appendChild(e);
    }
    for(let i=1;i<=lastDate;i++){
      const e = document.createElement('div');
      e.className = 'd-cell'+(i===today?' today':'');
      e.textContent = i;
      e.addEventListener('click', ()=> toast(i+'日 · '+y+'年'+(m+1)+'月'));
      grid.appendChild(e);
    }
    $('#calMonthLabel').textContent = y+'年'+(m+1)+'月';
    $('#calTip').textContent = '今天是 '+y+'年'+(m+1)+'月'+today+'日 · '+wkMap[d.getDay()];
  }

  // ====== 今日固定行程 ======
  const ROUTINE_KEY = 'workbench_routine';
  const ROUTINE_DONE_KEY = 'workbench_routine_done';
  function getDefaultRoutine(){
    return [
      {time:'07:30', name:'起床 + 一杯温水'},
      {time:'08:00', name:'早餐'},
      {time:'09:00', name:'学习 2 小时'},
      {time:'12:00', name:'午餐'},
      {time:'13:00', name:'午休'},
      {time:'18:00', name:'运动 30 分钟'},
      {time:'22:30', name:'睡觉'},
    ];
  }
  function refreshRoutine(){
    const list = store.get(ROUTINE_KEY, null) || getDefaultRoutine();
    if(!store.get(ROUTINE_KEY, null)) store.set(ROUTINE_KEY, list);
    const done = store.get(ROUTINE_DONE_KEY+'_'+todayKey(), {});
    const ul = $('#routineList'); ul.innerHTML='';
    list.forEach((r,i)=>{
      const li = document.createElement('div');
      li.className = 'routine-item'+(done[i]?' done':'');
      li.innerHTML = `<span class="time">${r.time}</span>
        <span class="name">${r.name}</span>
        <span class="chk"></span>
        <button data-i="${i}" class="del">✕</button>`;
      li.addEventListener('click', e=>{
        if(e.target.classList.contains('del')) return;
        const d = store.get(ROUTINE_DONE_KEY+'_'+todayKey(), {});
        d[i] = !d[i];
        store.set(ROUTINE_DONE_KEY+'_'+todayKey(), d);
        refreshRoutine();
      });
      ul.appendChild(li);
    });
    $$('.routine-item .del').forEach(b => b.addEventListener('click', e=>{
      e.stopPropagation();
      const arr = store.get(ROUTINE_KEY, []);
      arr.splice(+e.target.dataset.i,1);
      store.set(ROUTINE_KEY, arr);
      refreshRoutine();
    }));
    const total = list.length;
    const dn = Object.values(done).filter(Boolean).length;
    $('#checkDone').textContent = dn;
    $('#checkPct').textContent = total? Math.round(dn/total*100) : 0;
  }
  function bindRoutine(){
    $('#addRoutineBtn').addEventListener('click', ()=>{
      const t = prompt('行程时间（如 09:30）');
      if(!t) return;
      const n = prompt('行程名称');
      if(!n) return;
      const arr = store.get(ROUTINE_KEY, getDefaultRoutine());
      arr.push({time:t, name:n, ico:'✨'});
      store.set(ROUTINE_KEY, arr);
      refreshRoutine();
    });
    refreshRoutine();
  }

  // ====== 英语 ======
  const WORDS = [
    {en:'serendipity',p:'/ˌserənˈdɪpəti/',cn:'意外发现美好事物的能力',ex:'Meeting you was pure serendipity.'},
    {en:'resilient',p:'/rɪˈzɪliənt/',cn:'有弹性的；适应力强的',ex:'Kids are incredibly resilient.'},
    {en:'tranquil',p:'/ˈtræŋkwɪl/',cn:'平静的；安宁的',ex:'A tranquil morning at the lake.'},
    {en:'whimsical',p:'/ˈwɪmzɪkl/',cn:'异想天开的；古怪而有趣的',ex:'She drew whimsical little cats.'},
    {en:'cozy',p:'/ˈkoʊzi/',cn:'舒适的；惬意的',ex:'A cozy corner with a book.'},
    {en:'grateful',p:'/ˈɡreɪtfl/',cn:'感激的',ex:'I am grateful for this little life.'},
    {en:'radiant',p:'/ˈreɪdiənt/',cn:'容光焕发的；光辉的',ex:'You look radiant today.'},
    {en:'gentle',p:'/ˈdʒentl/',cn:'温柔的；轻柔的',ex:'Be gentle with yourself.'},
    {en:'curious',p:'/ˈkjʊriəs/',cn:'好奇的',ex:'Stay curious, stay young.'},
    {en:'mindful',p:'/ˈmaɪndfl/',cn:'专注的；留心的',ex:'Be mindful of each breath.'},
    {en:'cherish',p:'/ˈtʃerɪʃ/',cn:'珍爱；珍惜',ex:'Cherish every little moment.'},
    {en:'aspire',p:'/əˈspaɪər/',cn:'渴望；立志',ex:'Aspire to be a better you.'},
    {en:'optimistic',p:'/ˌɑːptɪˈmɪstɪk/',cn:'乐观的',ex:'Stay optimistic about life.'},
    {en:'wander',p:'/ˈwɑːndər/',cn:'漫步；徘徊',ex:"Let's wander through the old town."},
    {en:'breeze',p:'/briːz/',cn:'微风',ex:'A cool breeze blew in.'},
    {en:'sunshine',p:'/ˈsʌnʃaɪn/',cn:'阳光；快乐的人',ex:'You are my sunshine.'},
    {en:'courage',p:'/ˈkɜːrɪdʒ/',cn:'勇气',ex:'Have the courage to follow your heart.'},
    {en:'twinkle',p:'/ˈtwɪŋkl/',cn:'闪烁',ex:'Stars twinkle in the night sky.'},
    {en:'harmony',p:'/ˈhɑːrməni/',cn:'和谐；和声',ex:'Live in harmony with nature.'},
    {en:'kindle',p:'/ˈkɪndl/',cn:'点燃；激起',ex:'Her words kindled my hope.'},
    {en:'wonder',p:'/ˈwʌndər/',cn:'惊奇；奇迹',ex:"It's a wonder to behold."},
    {en:'blossom',p:'/ˈblɑːsəm/',cn:'花朵；盛开',ex:'Cherry blossoms are everywhere in spring.'},
    {en:'petrichor',p:'/ˈpetrɪkɔːr/',cn:'雨后泥土的芬芳',ex:'I love the petrichor after summer rain.'},
    {en:'epiphany',p:'/ɪˈpɪfəni/',cn:'顿悟；突然的领悟',ex:'It was an epiphany for me.'},
    {en:'eloquent',p:'/ˈeləkwənt/',cn:'雄辩的；有说服力的',ex:'She gave an eloquent speech.'},
  ];
  let wordIdx = Math.floor(Math.random()*WORDS.length);
  function refreshWord(){
    const w = WORDS[wordIdx];
    $('#wordEN').textContent = w.en;
    $('#wordPhonetic').textContent = w.p;
    $('#wordCN').textContent = w.cn;
    $('#wordExample').textContent = w.ex;
  }
  function refreshWordStats(){
    const s = store.get('workbench_word_stats', {today:{},total:{}});
    $('#wordKnownCount').textContent = s.today[todayKey()]||0;
    $('#wordTotalCount').textContent = Object.keys(s.total||{}).length;
  }
  function bindWord(){
    $('#wordNext').addEventListener('click', ()=>{
      wordIdx = (wordIdx+1) % WORDS.length;
      refreshWord();
    });
    $('#wordKnown').addEventListener('click', ()=>{
      const stats = store.get('workbench_word_stats', {today:{},total:{}});
      stats.today[todayKey()] = (stats.today[todayKey()]||0)+1;
      stats.total[WORDS[wordIdx].en] = true;
      store.set('workbench_word_stats', stats);
      refreshWordStats();
      wordIdx = (wordIdx+1) % WORDS.length;
      refreshWord();
      toast('已掌握');
    });
    refreshWord();
    refreshWordStats();
  }
  function bindPlan(){
    $('#addPlanBtn').addEventListener('click', ()=> $('#planAdd').hidden = !$('#planAdd').hidden);
    $('#planSave').addEventListener('click', ()=>{
      const t = $('#planInput').value.trim();
      if(!t){ toast('请输入内容'); return; }
      const list = store.get('workbench_plan', []);
      list.push({title:t, cycle:$('#planCycle').value});
      store.set('workbench_plan', list);
      $('#planInput').value=''; $('#planAdd').hidden=true;
      refreshPlan();
    });
    refreshPlan();
  }
  function refreshPlan(){
    const list = store.get('workbench_plan', []);
    const ul = $('#planList'); ul.innerHTML='';
    list.forEach((p,i)=>{
      const li = document.createElement('li');
      li.innerHTML = `<div class="left"><span>${p.title}</span></div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="badge todo" style="font-size:10px;">${({daily:'每日',weekly:'每周',monthly:'每月'})[p.cycle]||'每日'}</span>
          <button data-i="${i}" class="p-del" style="background:none;color:#999;cursor:pointer;">✕</button>
        </div>`;
      ul.appendChild(li);
    });
    $$('.p-del').forEach(b => b.addEventListener('click', e=>{
      const arr = store.get('workbench_plan', []);
      arr.splice(+e.target.dataset.i,1);
      store.set('workbench_plan', arr);
      refreshPlan();
    }));
  }
  function refreshStreakGrid(){
    const g = $('#streakGrid'); g.innerHTML='';
    const today = new Date();
    for(let i=29;i>=0;i--){
      const d = new Date(today); d.setDate(today.getDate()-i);
      const k = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
      const obj = store.get('workbench_word_done_'+k, false);
      const cell = document.createElement('div');
      cell.className = 'day'+(obj?' checked':'')+(i===0?' today':'');
      cell.textContent = d.getDate();
      g.appendChild(cell);
    }
  }

  // ====== 4321 记账 ======
  const POT_CONFIG = {
    need:   {name:'刚需支出', pct:0.40, icon:'./assets/icons/pot-need.svg',
             desc:'吃饭/房租/水电/日用品',
             keywords:['吃饭','外卖','三餐','伙食','饭','餐','房租','水电','水','电','燃气','日用品','用品','早餐','午餐','晚餐','夜宵','交通','公交','地铁','油费']},
    want:   {name:'休闲弹性', pct:0.30, icon:'./assets/icons/pot-want.svg',
             desc:'穿搭/聚餐/爱好/网购/娱乐',
             keywords:['网购','衣服','穿搭','娱乐','聚餐','爱好','打车','车','唱K','KTV','电影','游戏','咖啡','奶茶','小吃']},
    save:   {name:'储蓄理财', pct:0.20, icon:'./assets/icons/pot-save.svg',
             desc:'原则只存入，减少支出',
             keywords:['理财','基金','股票','储蓄','投资']},
    emerg:  {name:'应急备用', pct:0.10, icon:'./assets/icons/pot-emerg.svg',
             desc:'医疗/突发紧急开销',
             keywords:['医院','医疗','急诊','突发','维修','修理']}
  };
  const NEED_KEYS = POT_CONFIG.need.keywords;
  const WANT_KEYS = POT_CONFIG.want.keywords;

  function incomeKey(mk){ return 'workbench_4321_income_'+(mk||monthKey()); }
  function potsKey(mk){ return 'workbench_4321_pots_'+(mk||monthKey()); }
  function transKey(mk){ return 'workbench_4321_trans_'+(mk||monthKey()); }
  const GOALS_KEY = 'workbench_4321_goals';
  const PLANS_KEY = 'workbench_4321_plans';

  function getIncome(mk){ return store.get(incomeKey(mk), 0) || 0; }
  function setIncome(mk, v){
    store.set(incomeKey(mk), v);
    // 重置 pots 分配
    const pots = {};
    for(const k in POT_CONFIG){ pots[k] = +(v * POT_CONFIG[k].pct).toFixed(2); }
    store.set(potsKey(mk), pots);
  }

  function getPots(mk){
    const pots = store.get(potsKey(mk), null);
    if(!pots){
      // 如果没有，按当前收入初始化
      const inc = getIncome(mk);
      const fresh = {};
      for(const k in POT_CONFIG){ fresh[k] = +(inc * POT_CONFIG[k].pct).toFixed(2); }
      store.set(potsKey(mk), fresh);
      return fresh;
    }
    return pots;
  }
  function setPots(mk, pots){ store.set(potsKey(mk), pots); }

  function getTrans(mk){ return store.get(transKey(mk), []); }
  function setTrans(mk, list){ store.set(transKey(mk), list); }

  // 自动分类：根据 note 里的关键词匹配 pot 和 category
  function autoCategorize(note){
    const n = note || '';
    // 优先级1：明确的休闲信号词（避免被 need 的「饭」「餐」误伤）
    const wantFirst = ['奶茶','咖啡','唱K','KTV','电影','聚餐','网购','穿搭','打车','小吃'];
    for(const kw of wantFirst){
      if(n.indexOf(kw) >= 0) return {pot:'want', category:'休闲'};
    }
    // 优先级2：need 关键词
    for(const kw of NEED_KEYS){
      if(n.indexOf(kw) >= 0) return {pot:'need', category:'刚需'};
    }
    // 优先级3：want 其他关键词
    for(const kw of WANT_KEYS){
      if(n.indexOf(kw) >= 0) return {pot:'want', category:'休闲'};
    }
    // 没匹配上的关键词，默认到 want（休闲弹性更通用）
    return {pot:'want', category:'其他'};
  }

  // 解析对话输入
  function parseChatInput(text){
    text = (text||'').trim();
    if(!text) return null;

    // 收入：收入 N 或 收入+N 或 收入-N
    let m = text.match(/^收入\s*([+\-]?)(\d+(?:\.\d+)?)$/);
    if(m){
      const sign = m[1] === '-' ? -1 : 1;
      const v = sign * parseFloat(m[2]);
      return {type:'income', amount:v, raw:text};
    }
    // 强制 pot 前缀：^(刚需|休闲|储蓄|备用)\s+(.+?)\s+(\d+)$
    m = text.match(/^(刚需|休闲|储蓄|备用)\s+(.+?)\s+(\d+(?:\.\d+)?)$/);
    if(m){
      const potMap = {刚需:'need', 休闲:'want', 储蓄:'save', 备用:'emerg'};
      const pot = potMap[m[1]];
      const note = m[2];
      const amount = parseFloat(m[3]);
      return {type:'expense', amount, note, pot, category:POT_CONFIG[pot].name};
    }
    // 普通：note + 数字
    m = text.match(/^(.+?)\s+(\d+(?:\.\d+)?)$/);
    if(m){
      const note = m[1];
      const amount = parseFloat(m[2]);
      const {pot, category} = autoCategorize(note);
      return {type:'expense', amount, note, pot, category};
    }
    return null;
  }

  // 添加一笔交易
  function addTrans(item){
    const mk = monthKey();
    const list = getTrans(mk);
    const d = new Date();
    const entry = Object.assign({
      id:'t_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
      ts:Date.now(),
      date:todayKey(),
      time:pad(d.getHours())+':'+pad(d.getMinutes())
    }, item);
    list.push(entry);
    setTrans(mk, list);
    // 扣 pot
    if(item.type === 'expense' && item.pot){
      const pots = getPots(mk);
      pots[item.pot] = +(pots[item.pot] - item.amount).toFixed(2);
      setPots(mk, pots);
    }
    return entry;
  }
  // 删除一笔交易
  function delTrans(id){
    const mk = monthKey();
    const list = getTrans(mk);
    const item = list.find(x=>x.id===id);
    if(!item) return;
    // 退还 pot
    if(item.type === 'expense' && item.pot){
      const pots = getPots(mk);
      pots[item.pot] = +(pots[item.pot] + item.amount).toFixed(2);
      setPots(mk, pots);
    }
    setTrans(mk, list.filter(x=>x.id!==id));
  }

  // 老数据迁移：把 workbench_ledger 里的当月记录迁过来
  function migrateLegacyLedger(){
    const mk = monthKey();
    const newTrans = getTrans(mk);
    if(newTrans.length > 0) return; // 已经有新数据了
    const old = store.get('workbench_ledger', []);
    if(!old || old.length === 0) return;
    let incMigrated = false;
    for(const x of old){
      if(x.month !== mk) continue;
      if(x.type === 'income' && !incMigrated){
        // 只迁移第一个 income 作为本月收入
        setIncome(mk, x.amount);
        incMigrated = true;
        continue;
      }
      if(x.type === 'expense'){
        const {pot, category} = autoCategorize(x.note || x.category || '');
        addTrans({
          type:'expense',
          amount:x.amount,
          note:x.note || x.category || '其他',
          pot,
          category,
          time:x.time || ''
        });
      }
    }
  }

  // ====== 渲染函数 ======
  function refreshIncome(){
    const inc = getIncome();
    $('#monthIncome').textContent = fmt(inc);
  }

  function refreshPots(){
    const inc = getIncome();
    const pots = getPots();
    ['need','want','save','emerg'].forEach(k => {
      const total = +(inc * POT_CONFIG[k].pct).toFixed(2);
      const left = pots[k] || 0;
      const used = total - left;
      const pct = total > 0 ? Math.max(0, Math.min(100, used/total*100)) : 0;
      const leftEl = $('#pot'+k.charAt(0).toUpperCase()+k.slice(1)+'Left');
      if(leftEl) leftEl.textContent = '¥'+fmt(Math.max(0, left));
      const totalEl = $('#pot'+k.charAt(0).toUpperCase()+k.slice(1)+'Total');
      if(totalEl) totalEl.textContent = fmt(total);
      const bar = $('#pot'+k.charAt(0).toUpperCase()+k.slice(1)+'Bar');
      if(bar){
        bar.style.width = pct+'%';
        bar.classList.toggle('over', left < 0);
      }
    });
  }

  function renderTransList(target){
    const list = getTrans().slice().reverse();
    const ul = $('#'+target);
    if(!ul) return;
    ul.innerHTML = '';
    list.forEach(x => {
      const li = document.createElement('li');
      const potCfg = POT_CONFIG[x.pot];
      const tag = x.type==='income' ? '收入' : (potCfg ? potCfg.name : '支出');
      li.innerHTML = `<div class="l-info">
          <span><span class="l-tag">${tag}</span>${x.note||''}</span>
          <span class="muted" style="font-size:11px;">${(x.date||'').slice(5)} ${x.time||''}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <span class="l-amount ${x.type==='income'?'inc':'exp'}">${x.type==='income'?'+':'-'}¥${fmt(x.amount)}</span>
          <button class="l-del" data-id="${x.id}">✕</button>
        </div>`;
      ul.appendChild(li);
    });
    ul.querySelectorAll('.l-del').forEach(b => b.addEventListener('click', e=>{
      delTrans(e.target.dataset.id);
      refreshAll();
    }));
    // 更新计数
    const cnt1 = $('#transCount'), cnt2 = $('#transCount2');
    if(cnt1) cnt1.textContent = list.length;
    if(cnt2) cnt2.textContent = list.length;
  }

  function refreshAll(){
    refreshIncome();
    refreshPots();
    renderTransList('transList4321');
    renderTransList('transList2_4321');
    refreshGoals();
    refreshPlans();
  }

  // ====== Tab 切换 ======
  function bindLedgerTabs(){
    $$('#ledgerTabs .tab-item').forEach(b => b.addEventListener('click', ()=>{
      $$('#ledgerTabs .tab-item').forEach(x=>x.classList.remove('active'));
      $$('.tab-pane').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const t = b.dataset.tab;
      const pane = $(`.tab-pane[data-pane="${t}"]`);
      if(pane) pane.classList.add('active');
    }));
  }

  // ====== 对话记账 ======
  function bindChat(){
    const submit = $('#chatSubmit');
    const input = $('#chatInput');
    submit.addEventListener('click', handleChat);
    input.addEventListener('keydown', e=>{ if(e.key === 'Enter') handleChat(); });

    function handleChat(){
      const text = input.value;
      if(!text.trim()) return;
      const parsed = parseChatInput(text);
      if(!parsed){
        toast('没看懂，换个说法试试，如「奶茶15」「收入8000」');
        return;
      }
      if(parsed.type === 'income'){
        const cur = getIncome();
        const next = +(cur + parsed.amount).toFixed(2);
        if(next < 0){
          toast('收入不能为负');
          return;
        }
        setIncome(monthKey(), next);
        toast(parsed.amount > 0 ? `收入已 +¥${fmt(parsed.amount)}` : `收入已 -¥${fmt(-parsed.amount)}`);
      } else {
        // expense
        if(parsed.amount <= 0){
          toast('金额要大于 0');
          return;
        }
        addTrans({
          type:'expense',
          amount:parsed.amount,
          note:parsed.note,
          pot:parsed.pot,
          category:parsed.category
        });
        const potName = POT_CONFIG[parsed.pot].name;
        toast(`已记账：${parsed.note} -¥${fmt(parsed.amount)} · ${potName}`);
      }
      input.value = '';
      refreshAll();
    }

    $('#resetMonthBtn').addEventListener('click', ()=>{
      if(!confirm('清空本月所有账单？存钱罐金额也会重置。')) return;
      const mk = monthKey();
      localStorage.removeItem(transKey(mk));
      localStorage.removeItem(potsKey(mk));
      refreshAll();
      toast('已清空');
    });
  }

  // ====== 设置收入弹窗 ======
  let modalCallback = null;
  function openModal(id){
    const el = $('#'+id);
    if(el) el.hidden = false;
  }
  function closeModal(id){
    const el = $('#'+id);
    if(el) el.hidden = true;
  }
  function bindSetIncome(){
    $('#setIncomeBtn').addEventListener('click', ()=>{
      $('#setIncomeInput').value = getIncome();
      openModal('setIncomeModal');
    });
    $$('[data-close]').forEach(b => b.addEventListener('click', e=>{
      closeModal(e.target.dataset.close);
    }));
    $('#setIncomeConfirm').addEventListener('click', ()=>{
      const v = +$('#setIncomeInput').value;
      if(!v || v <= 0){ toast('请输入有效金额'); return; }
      setIncome(monthKey(), v);
      closeModal('setIncomeModal');
      refreshAll();
      toast('已设置本月收入');
    });
  }

  // ====== 储蓄目标 ======
  function getGoals(){ return store.get(GOALS_KEY, []); }
  function setGoals(g){ store.set(GOALS_KEY, g); }

  function suggestedMonthly(target, saved, deadline){
    const t = new Date(deadline);
    const now = new Date();
    const months = Math.max(1, (t.getFullYear()-now.getFullYear())*12 + (t.getMonth()-now.getMonth()));
    return Math.ceil((target - saved) / months);
  }

  function refreshGoals(){
    const goals = getGoals();
    const ul = $('#goalList4321');
    if(!ul) return;
    ul.innerHTML = '';
    if(goals.length === 0){
      ul.innerHTML = '<div class="card" style="text-align:center;color:var(--ink-soft);font-size:13px;">还没有储蓄目标，点击下方按钮创建你的第一个目标吧 ✨</div>';
      return;
    }
    goals.forEach(g => {
      const saved = g.saved || 0;
      const pct = Math.min(100, saved/g.target*100);
      const monthly = suggestedMonthly(g.target, saved, g.deadline);
      const deadlineStr = g.deadline.slice(0,7);
      const card = document.createElement('div');
      card.className = 'goal-card';
      card.innerHTML = `<div class="goal-head">
          <div class="goal-ico"><img src="./assets/icons/target.svg" style="width:24px;height:24px;"></div>
          <div class="goal-info">
            <div class="goal-name">${g.name}</div>
            <div class="goal-meta">目标 ¥${fmt(g.target)} · ${deadlineStr} 前 · 建议每月存 <b>¥${monthly}</b></div>
          </div>
          <button class="goal-del" data-id="${g.id}">✕</button>
        </div>
        <div class="goal-progress"><i style="width:${pct}%"></i></div>
        <div class="goal-stat"><span>已存 <b>¥${fmt(saved)}</b> / ¥${fmt(g.target)}</span><span>${pct.toFixed(1)}%</span></div>
        <div class="goal-actions">
          <button class="deposit-btn" data-id="${g.id}">＋ 存入</button>
          <button class="history-btn" data-id="${g.id}">流水明细</button>
        </div>`;
      ul.appendChild(card);
    });
    // 绑定按钮
    ul.querySelectorAll('.goal-del').forEach(b => b.addEventListener('click', e=>{
      if(!confirm('删除这个储蓄目标？')) return;
      setGoals(getGoals().filter(g=>g.id!==e.target.dataset.id));
      refreshGoals();
    }));
    ul.querySelectorAll('.deposit-btn').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      const goal = getGoals().find(g=>g.id===id);
      if(!goal) return;
      $('#depositTitle').textContent = '存入 · '+goal.name;
      $('#depositInput').value = '';
      openModal('depositModal');
      modalCallback = (amt)=>{
        if(amt <= 0) return;
        // 从储蓄理财罐扣
        const mk = monthKey();
        const pots = getPots(mk);
        if(pots.save < amt){
          toast('储蓄理财罐余额不足');
          return;
        }
        pots.save = +(pots.save - amt).toFixed(2);
        setPots(mk, pots);
        goal.saved = (goal.saved || 0) + amt;
        goal.history = goal.history || [];
        const d = new Date();
        goal.history.push({amount:amt, ts:Date.now(), date:todayKey(), time:pad(d.getHours())+':'+pad(d.getMinutes())});
        setGoals(getGoals().map(g=>g.id===id?goal:g));
        refreshAll();
        toast('已存入 ¥'+fmt(amt));
      };
    }));
    ul.querySelectorAll('.history-btn').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      const goal = getGoals().find(g=>g.id===id);
      if(!goal) return;
      showHistory(goal);
    }));
  }

  function bindGoals(){
    $('#addGoalBtn').addEventListener('click', ()=>{
      $('#goalNameInput').value = '';
      $('#goalTargetInput').value = '';
      const d = new Date();
      d.setFullYear(d.getFullYear()+1);
      $('#goalDeadlineInput').value = d.toISOString().slice(0,10);
      openModal('addGoalModal');
    });
    $('#addGoalConfirm').addEventListener('click', ()=>{
      const name = $('#goalNameInput').value.trim();
      const target = +$('#goalTargetInput').value;
      const deadline = $('#goalDeadlineInput').value;
      if(!name || !target || !deadline){ toast('请填完整'); return; }
      const goals = getGoals();
      goals.push({
        id:'g_'+Date.now(),
        name, target, deadline,
        saved:0,
        history:[]
      });
      setGoals(goals);
      closeModal('addGoalModal');
      refreshGoals();
      toast('目标已创建');
    });
    $('#monthReportBtn').addEventListener('click', showMonthReport);
    $('#depositConfirm').addEventListener('click', ()=>{
      const amt = +$('#depositInput').value;
      if(!amt || amt <= 0){ toast('金额无效'); return; }
      if(modalCallback){ modalCallback(amt); modalCallback = null; }
      closeModal('depositModal');
    });
  }

  function showHistory(goal){
    $('#historyTitle').textContent = goal.name+' · 流水';
    const ul = $('#historyList');
    ul.innerHTML = '';
    if(!goal.history || goal.history.length === 0){
      ul.innerHTML = '<li style="justify-content:center;color:var(--ink-soft);">还没有流水</li>';
    } else {
      goal.history.slice().reverse().forEach(h => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="l-info">
            <span>存入 ¥${fmt(h.amount)}</span>
            <span class="muted" style="font-size:11px;">${(h.date||'').slice(5)} ${h.time||''}</span>
          </div>`;
        ul.appendChild(li);
      });
    }
    openModal('historyModal');
  }

  function showMonthReport(){
    const inc = getIncome();
    const pots = getPots();
    const trans = getTrans();
    const inc_total = trans.filter(x=>x.type==='income').reduce((s,x)=>s+x.amount, 0);
    const exp_total = trans.filter(x=>x.type==='expense').reduce((s,x)=>s+x.amount, 0);
    const lines = [
      `📊 本月财务报告`,
      `─────────────────`,
      `本月收入：¥${fmt(inc)}（已记录 +¥${fmt(inc_total)}）`,
      ``,
      `【4 个存钱罐】`,
      `刚需支出：剩 ¥${fmt(pots.need)} / ¥${fmt(inc*POT_CONFIG.need.pct)}`,
      `休闲弹性：剩 ¥${fmt(pots.want)} / ¥${fmt(inc*POT_CONFIG.want.pct)}`,
      `储蓄理财：剩 ¥${fmt(pots.save)} / ¥${fmt(inc*POT_CONFIG.save.pct)}`,
      `应急备用：剩 ¥${fmt(pots.emerg)} / ¥${fmt(inc*POT_CONFIG.emerg.pct)}`,
      ``,
      `【账单统计】`,
      `总支出：¥${fmt(exp_total)}`,
      `账单数：${trans.length} 笔`
    ];
    $('#historyTitle').textContent = '本月财务报告';
    const ul = $('#historyList');
    ul.innerHTML = '';
    lines.forEach(line => {
      const li = document.createElement('li');
      li.style.whiteSpace = 'pre';
      li.style.display = 'block';
      li.textContent = line;
      ul.appendChild(li);
    });
    openModal('historyModal');
  }

  // ====== 存钱计划 ======
  function getPlans(){ return store.get(PLANS_KEY, []); }
  function setPlans(p){ store.set(PLANS_KEY, p); }

  function generate52Week(start){
    const items = [];
    for(let i=1;i<=52;i++){
      items.push({idx:i, label:'第'+i+'周', amount:start*i, done:false});
    }
    return {id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
      type:'52w', name:'52周递增法 · 起存 ¥'+start,
      config:{start},
      totalAmount: items.reduce((s,x)=>s+x.amount, 0),
      items};
  }
  function generate12Month(monthly){
    const items = [];
    for(let i=1;i<=12;i++){
      items.push({idx:i, label:'第'+i+'月', amount:monthly, done:false});
    }
    return {id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
      type:'12m', name:'12存单法 · 每月 ¥'+monthly,
      config:{monthly},
      totalAmount: items.reduce((s,x)=>s+x.amount, 0),
      items};
  }
  function generatePct(percent, income){
    const monthly = +(income * percent / 100).toFixed(2);
    const items = [];
    for(let i=1;i<=12;i++){
      items.push({idx:i, label:'第'+i+'月', amount:monthly, done:false});
    }
    return {id:'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
      type:'pct', name:'收入比例法 · '+percent+'% · 月 ¥'+fmt(monthly),
      config:{percent, income},
      totalAmount: items.reduce((s,x)=>s+x.amount, 0),
      items};
  }

  function refreshPlans(){
    const plans = getPlans();
    const wrap = $('#planList4321');
    if(!wrap) return;
    wrap.innerHTML = '';
    if(plans.length === 0) return;
    plans.forEach(p => {
      const doneCount = p.items.filter(x=>x.done).length;
      const doneAmt = p.items.filter(x=>x.done).reduce((s,x)=>s+x.amount, 0);
      const pct = p.items.length>0 ? doneCount/p.items.length*100 : 0;
      const card = document.createElement('div');
      card.className = 'plan-card';
      card.innerHTML = `<div class="plan-card-head">
          <div class="plan-card-name">${p.name}</div>
          <button class="goal-del" data-id="${p.id}" title="删除">✕</button>
        </div>
        <div class="plan-progress"><i style="width:${pct}%"></i></div>
        <div class="plan-card-stat">已完成 <b>${doneCount}/${p.items.length}</b> 笔 · 累计 <b>¥${fmt(doneAmt)}</b> / ¥${fmt(p.totalAmount)}</div>
        <div class="plan-items">${p.items.map(it => `
          <div class="plan-item ${it.done?'done':''}">
            <label style="display:flex;align-items:center;gap:4px;justify-content:center;">
              <input type="checkbox" data-pid="${p.id}" data-idx="${it.idx}" ${it.done?'checked':''}>
              <span>${it.label}</span>
            </label>
            <span>¥${fmt(it.amount)}</span>
          </div>`).join('')}</div>`;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll('.goal-del').forEach(b => b.addEventListener('click', e=>{
      if(!confirm('删除这个存钱计划？')) return;
      setPlans(getPlans().filter(p=>p.id!==e.target.dataset.id));
      refreshPlans();
    }));
    wrap.querySelectorAll('.plan-item input[type=checkbox]').forEach(cb => cb.addEventListener('change', e=>{
      const pid = e.target.dataset.pid;
      const idx = +e.target.dataset.idx;
      const plan = getPlans().find(p=>p.id===pid);
      if(!plan) return;
      const item = plan.items.find(x=>x.idx===idx);
      if(!item) return;
      item.done = e.target.checked;
      if(item.done){ item.ts = Date.now(); }
      setPlans(getPlans().map(p=>p.id===pid?plan:p));
      refreshPlans();
    }));
  }

  function bindPlans(){
    $('#gen52Btn').addEventListener('click', ()=>{
      const start = +$('#plan52Start').value || 10;
      const plans = getPlans();
      plans.push(generate52Week(start));
      setPlans(plans);
      refreshPlans();
      toast('已生成 52 周计划');
    });
    $('#gen12Btn').addEventListener('click', ()=>{
      const monthly = +$('#plan12Amount').value || 500;
      const plans = getPlans();
      plans.push(generate12Month(monthly));
      setPlans(plans);
      refreshPlans();
      toast('已生成 12 存单计划');
    });
    $('#genPctBtn').addEventListener('click', ()=>{
      const percent = +$('#planPct').value || 20;
      const income = getIncome();
      if(income <= 0){ toast('请先设置本月收入'); return; }
      const plans = getPlans();
      plans.push(generatePct(percent, income));
      setPlans(plans);
      refreshPlans();
      toast('已生成收入比例计划');
    });
  }

  // 总入口
  function bindLedger(){
    migrateLegacyLedger();
    bindLedgerTabs();
    bindChat();
    bindSetIncome();
    bindGoals();
    bindPlans();
    refreshAll();
  }

  // ====== 锻炼 ======
  const SPORT_KEY = 'workbench_sport';
  function refreshSport(){
    const all = store.get(SPORT_KEY, []);
    const wkStart = (()=>{
      const d = new Date(); const day = d.getDay()||7;
      d.setDate(d.getDate()-day+1); d.setHours(0,0,0,0); return d;
    })();
    const wkDates = [];
    for(let i=0;i<7;i++){
      const x = new Date(wkStart); x.setDate(wkStart.getDate()+i);
      wkDates.push(x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate());
    }
    $('#sportWeek').textContent = new Set(all.filter(s=> wkDates.includes(s.date)).map(s=>s.date+s.name)).size;
    $('#sportTotal').textContent = all.length;
    const ul = $('#sportList'); ul.innerHTML='';
    all.slice().reverse().slice(0,20).forEach(s=>{
      const li = document.createElement('li');
      li.innerHTML = `<div class="l-info">
          <span><span class="badge todo" style="font-size:10px;">${s.name}</span> ${s.min?'· '+s.min+' 分钟':''}</span>
          <span class="muted" style="font-size:11px;">${s.date.slice(5)}</span>
        </div>
        <button class="l-del" data-id="${s.id}">✕</button>`;
      ul.appendChild(li);
    });
    $$('.l-del', ul).forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      store.set(SPORT_KEY, store.get(SPORT_KEY, []).filter(x=>x.id!==id));
      refreshSport();
    }));
    const g = $('#sportWeekGrid'); g.innerHTML='';
    const wkMap2 = ['一','二','三','四','五','六','日'];
    wkDates.forEach((d,i)=>{
      const cell = document.createElement('div');
      const has = all.some(s => s.date===d);
      cell.className = 'cell'+(has?' done':'');
      cell.innerHTML = `<b>${wkMap2[i]}</b><span>${d.slice(8)}</span>`;
      g.appendChild(cell);
    });
  }
  function bindSport(){
    $$('.sport-quick button').forEach(b => b.addEventListener('click', () => addSport(b.dataset.sport)));
    $('#sportAdd').addEventListener('click', ()=>{
      const name = $('#sportName').value.trim();
      const min = +$('#sportMin').value||0;
if(!name){ toast('请输入运动项目'); return; }
    addSport(name, min);
    $('#sportName').value=''; $('#sportMin').value='';
    });
    refreshSport();
  }
  function addSport(name, min){
    const all = store.get(SPORT_KEY, []);
    all.push({id:'s_'+Date.now(), name, min:min||0, date:todayKey()});
    store.set(SPORT_KEY, all);
    refreshSport();
    toast('已打卡');
  }

  // ====== 新闻 ======
  const NEWS_TODAY = [
    {tag:'科技', title:'AI 助手进化加速，多家厂商发布新一代模型', time:'09:12'},
    {tag:'财经', title:'央行政策释放积极信号，市场风险偏好回暖', time:'08:45'},
    {tag:'生活', title:'秋日氛围渐浓，多地桂花悄然绽放', time:'08:10'},
    {tag:'娱乐', title:'高分国产剧口碑持续走高，掀起追剧热潮', time:'07:55'},
    {tag:'教育', title:'多所高校新增"人工智能"通识必修课', time:'07:30'},
    {tag:'健康', title:'秋季养生：早睡早起，饮食温润', time:'07:01'},
  ];
  function refreshNews(){
    const ul = $('#newsList'); ul.innerHTML='';
    NEWS_TODAY.forEach(n => {
      const li = document.createElement('li');
      li.innerHTML = `<div style="flex:1;"><div>${n.title}</div><div class="muted" style="font-size:11px;">${n.time}</div></div>
        <span class="tag">${n.tag}</span>`;
      ul.appendChild(li);
    });
    const follow = store.get('workbench_follow', []);
    const f = $('#followList'); f.innerHTML='';
    follow.forEach((it, i)=>{
      const li = document.createElement('li');
      li.innerHTML = `<span>${it}</span><button data-i="${i}" class="followDel" style="background:none;color:#999;cursor:pointer;">✕</button>`;
      f.appendChild(li);
    });
    $$('.followDel').forEach(b => b.addEventListener('click', e=>{
      const arr = store.get('workbench_follow', []);
      arr.splice(+e.target.dataset.i, 1);
      store.set('workbench_follow', arr);
      refreshNews();
    }));
  }
  function bindNews(){
    $('#addNewsBtn').addEventListener('click', ()=> $('#followAdd').hidden = !$('#followAdd').hidden);
    $('#followSave').addEventListener('click', ()=>{
      const v = $('#followInput').value.trim();
      if(!v){ toast('请输入关注话题'); return; }
      const arr = store.get('workbench_follow', []);
      arr.push(v);
      store.set('workbench_follow', arr);
      $('#followInput').value='';
      $('#followAdd').hidden=true;
      refreshNews();
    });
    refreshNews();
  }

  // ====== 理财 ======
  const FIN_KEY = 'workbench_fin';
  const GOAL_KEY = 'workbench_goal';
  function refreshFin(){
    const fin = store.get(FIN_KEY, {balance:0,fund:0,saving:0,other:0});
    $('#finBalance').textContent = fmt(fin.balance);
    $('#finFund').textContent = fmt(fin.fund);
    $('#finSaving').textContent = fmt(fin.saving);
    $('#finOther').textContent = fmt(fin.other);
    const total = (fin.balance||0)+(fin.fund||0)+(fin.saving||0)+(fin.other||0);
    $('#finTotal').textContent = fmt(total);
    const list = store.get(GOAL_KEY, []);
    const ul = $('#goalList'); ul.innerHTML='';
    list.forEach((g, i)=>{
      const pct = Math.min(100, g.saved/g.amt*100);
      const li = document.createElement('li');
      li.innerHTML = `<div style="font-weight:700;">${g.name}</div>
        <button class="goalDel" data-i="${i}" style="background:none;color:#999;cursor:pointer;">✕</button>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="small"><span>${fmt(g.saved)} / ${fmt(g.amt)}</span><span>${pct.toFixed(1)}%</span></div>`;
      ul.appendChild(li);
    });
    $$('.goalDel').forEach(b => b.addEventListener('click', e=>{
      const arr = store.get(GOAL_KEY, []);
      arr.splice(+e.target.dataset.i, 1);
      store.set(GOAL_KEY, arr);
      refreshFin();
    }));
  }
  function bindFin(){
    $('#finAdd').addEventListener('click', ()=>{
      const amt = +$('#finInput').value;
      const kind = $('#finKind').value;
      if(!amt){ toast('请填写金额'); return; }
      const fin = store.get(FIN_KEY, {balance:0,fund:0,saving:0,other:0});
      fin[kind] = (fin[kind]||0) + amt;
      store.set(FIN_KEY, fin);
      $('#finInput').value='';
      refreshFin();
    });
    $('#goalAdd').addEventListener('click', ()=>{
      const name = $('#goalName').value.trim();
      const amt = +$('#goalAmt').value;
      const saved = +$('#goalSaved').value||0;
      if(!name||!amt){ toast('请填写目标名称和金额'); return; }
      const list = store.get(GOAL_KEY, []);
      list.push({name, amt, saved});
      store.set(GOAL_KEY, list);
      $('#goalName').value=''; $('#goalAmt').value=''; $('#goalSaved').value='';
      refreshFin();
    });
    refreshFin();
  }

  // ====== 备忘录 ======
  const MEMO_KEY = 'workbench_memo';
  function refreshMemo(){
    const list = store.get(MEMO_KEY, []);
    const ul = $('#memoList'); ul.innerHTML='';
    list.slice().reverse().forEach(m => {
      const li = document.createElement('li');
      li.innerHTML = `<div style="flex:1;">
          <div>${m.text}</div>
          <div class="muted" style="font-size:11px;">${m.date} ${m.time||''}</div>
        </div>
        <button data-id="${m.id}" class="memoDel" style="background:none;color:#999;cursor:pointer;">✕</button>`;
      ul.appendChild(li);
    });
    $$('.memoDel').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      store.set(MEMO_KEY, store.get(MEMO_KEY, []).filter(x=>x.id!==id));
      refreshMemo();
    }));
  }
  function bindMemo(){
    $('#memoSave').addEventListener('click', ()=>{
      const text = $('#memoInput').value.trim();
      if(!text){ toast('请输入内容'); return; }
      const list = store.get(MEMO_KEY, []);
      const d = new Date();
      list.push({id:'m_'+Date.now(), text, date:todayKey(), time:pad(d.getHours())+':'+pad(d.getMinutes())});
      store.set(MEMO_KEY, list);
      $('#memoInput').value='';
      refreshMemo();
      toast('已保存');
    });
    $('#memoClear').addEventListener('click', ()=>{
      if(!confirm('清空全部备忘录？')) return;
      store.set(MEMO_KEY, []);
      refreshMemo();
    });
    $('#memoExport').addEventListener('click', ()=>{
      const list = store.get(MEMO_KEY, []);
      const txt = list.map(x=> x.date+' '+x.time+'  '+x.text).join('\n');
      const blob = new Blob([txt], {type:'text/plain'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'memo.txt'; a.click();
      URL.revokeObjectURL(url);
    });
    refreshMemo();
  }

  // ====== 待办四象限 ======
  const TODO_KEY = 'workbench_todo';
  function refreshTodo(){
    const all = store.get(TODO_KEY, []);
    $$('.q-list').forEach(ul => { ul.innerHTML=''; });
    all.forEach(t => {
      const ul = $(`.q-list[data-q="${t.quadrant}"]`);
      if(!ul) return;
      const li = document.createElement('li');
      if(t.done) li.classList.add('done');
      li.innerHTML = `<div class="text"><input type="checkbox" data-id="${t.id}" ${t.done?'checked':''}/><span>${t.title}</span></div>
        <button data-id="${t.id}" class="todoDel">✕</button>`;
      ul.appendChild(li);
    });
    $$('.q-list input[type=checkbox]').forEach(c => c.addEventListener('change', e=>{
      const all = store.get(TODO_KEY, []);
      const it = all.find(x => x.id===e.target.dataset.id);
      if(it){ it.done = e.target.checked; it.doneAt = todayKey(); }
      store.set(TODO_KEY, all);
      refreshTodo();
    }));
    $$('.todoDel').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      store.set(TODO_KEY, store.get(TODO_KEY, []).filter(x=>x.id!==id));
      refreshTodo();
    }));
    const done = all.filter(t => t.done).slice().reverse();
    $('#doneCount').textContent = done.length + ' 项';
    const dul = $('#doneList'); dul.innerHTML='';
    done.slice(0,10).forEach(t => {
      const li = document.createElement('li');
      li.innerHTML = `<span style="text-decoration:line-through;color:var(--ink-soft);">${t.title}</span>
        <span class="muted" style="font-size:11px;">${t.doneAt||''}</span>`;
      dul.appendChild(li);
    });
  }
  function bindTodo(){
    $('#todoAdd').addEventListener('click', ()=>{
      const text = $('#todoInput').value.trim();
      const q = $('#todoQuadrant').value;
      if(!text){ toast('请输入内容'); return; }
      const list = store.get(TODO_KEY, []);
      list.push({id:'t_'+Date.now(), title:text, quadrant:q, done:false});
      store.set(TODO_KEY, list);
      $('#todoInput').value='';
      refreshTodo();
    });
    refreshTodo();
  }

  // ====== 启动 ======
  // ====== 换装中心 ======
  const ASSETS_KEY = 'workbench_assets';
  const THEME_KEY = 'workbench_theme';
  const NICK_KEY = 'workbench_nickname';

  // 默认图片路径表（用于重置）
  const DEFAULT_ASSETS = {
    bg: './assets/kitty-pattern.svg',
    avatar: './assets/kitty.svg',
    hero: './assets/kitty-hero.svg',
    sideBottom: './assets/kitty-avatar.jpg',
    nav: {
      today: './assets/kitty.svg',
      english: './assets/icons/book.svg',
      ledger: './assets/icons/ledger.svg',
      exercise: './assets/icons/run.svg',
      news: './assets/icons/fire.svg',
      finance: './assets/icons/money.svg',
      memo: './assets/icons/memo.svg',
      todo: './assets/icons/todo.svg',
    },
    pageIco: {
      cal: './assets/icons/cal.svg',
      check: './assets/icons/check.svg',
      heart: './assets/icons/heart.svg',
      clock: './assets/icons/clock.svg',
    }
  };

  // 6 套预设配色
  const THEMES = [
    {key:'pink',     name:'Kitty 粉', swatches:['#ff5a8d','#ffc8d8','#fff0f3']},
    {key:'azure',    name:'天蓝',    swatches:['#2f8fc9','#8fcaee','#eaf4fb']},
    {key:'lavender', name:'薰衣草', swatches:['#8a5fc9','#dac6ff','#f1ebfa']},
    {key:'mint',     name:'薄荷绿',  swatches:['#3fae76','#b4eccc','#ecf6f0']},
    {key:'amber',    name:'暖橘',    swatches:['#f5a015','#ffcf70','#fdf3e3']},
    {key:'charcoal', name:'极简灰',  swatches:['#3a3a3a','#9f9f9f','#ececec']},
  ];

  // 深读 assets 配置
  function getAssets(){
    return store.get(ASSETS_KEY, {});
  }
  // 按 "a.b" 路径取值，回退到 DEFAULT_ASSETS
  function getAsset(path){
    const a = getAssets();
    const parts = path.split('.');
    let val = a;
    for(const p of parts){ val = val?.[p]; if(val===undefined) break; }
    if(val) return val;
    // 回退默认
    let def = DEFAULT_ASSETS;
    for(const p of parts){ def = def?.[p]; if(def===undefined) break; }
    return def;
  }
  // 写入 assets（按 "a.b" 路径）
  function setAsset(path, dataUrl){
    const a = getAssets();
    const parts = path.split('.');
    let obj = a;
    for(let i=0;i<parts.length-1;i++){
      obj[parts[i]] = obj[parts[i]] || {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length-1]] = dataUrl;
    store.set(ASSETS_KEY, a);
  }
  // 删除某个 asset（恢复默认）
  function delAsset(path){
    const a = getAssets();
    const parts = path.split('.');
    let obj = a;
    for(let i=0;i<parts.length-1;i++){
      if(!obj[parts[i]]) return;
      obj = obj[parts[i]];
    }
    delete obj[parts[parts.length-1]];
    store.set(ASSETS_KEY, a);
  }

  // 把 assets 应用到 DOM
  function applyAssets(){
    // 背景：CSS 变量 --bg-img
    const bg = getAsset('bg');
    document.documentElement.style.setProperty('--bg-img', `url('${bg}')`);
    // 头像
    const avatar = getAsset('avatar');
    $('.avatar-img').src = avatar;
    // Hero
    const hero = getAsset('hero');
    $('.hero-kitty').src = hero;
    const ledIllu = $('.led-illu'); if(ledIllu) ledIllu.src = hero;
    // 侧边栏底部
    const sideBottom = getAsset('sideBottom');
    $('.bot-kitty').src = sideBottom;
    // 8 个导航图标
    ['today','english','ledger','exercise','news','finance','memo','todo'].forEach(k => {
      const img = $(`.nav-item[data-target="${k}"] .ico-img img`);
      if(img) img.src = getAsset('nav.'+k);
    });
    // 首页 4 个小图标：cal/check/heart/clock 都是 .card-ico
    // 但首页 page-header 也有 cal.svg 用 .header-ico
    const pageIcoMap = {cal:'.card-ico[src*="cal.svg"], .header-ico[src*="cal.svg"]'};
    // 更通用的做法：遍历所有 img，按 src 中的文件名匹配替换
    $$('.card-ico, .header-ico').forEach(img => {
      const src = img.getAttribute('src') || '';
      // 检测原始 src（含路径）来决定属于哪类
      // 但因为已经被 applyAssets 改过，这里靠 data-default 属性来判断更稳
      // 简化处理：只要 src 里含 cal.svg 就用 pageIco.cal，以此类推
      const origName = (img.dataset && img.dataset.origName) || '';
    });
    // 上面的逻辑太复杂，改成在 applyAssets 里直接遍历页面所有 img 按 data-orig 标签处理
    // 先给所有 .card-ico/.header-ico 打上 data-orig
    $$('.card-ico, .header-ico').forEach(img => {
      if(!img.dataset.orig) img.dataset.orig = img.src;
    });
    // 然后按 data-orig 中的文件名匹配
    $$('.card-ico, .header-ico').forEach(img => {
      const orig = img.dataset.orig || '';
      let key = null;
      if(orig.includes('cal.svg')) key = 'pageIco.cal';
      else if(orig.includes('check.svg')) key = 'pageIco.check';
      else if(orig.includes('heart.svg')) key = 'pageIco.heart';
      else if(orig.includes('clock.svg')) key = 'pageIco.clock';
      else if(orig.includes('book.svg')) key = 'nav.english';
      else if(orig.includes('ledger.svg')) key = 'nav.ledger';
      else if(orig.includes('run.svg')) key = 'nav.exercise';
      else if(orig.includes('fire.svg')) key = 'nav.news';
      else if(orig.includes('money.svg')) key = 'nav.finance';
      else if(orig.includes('memo.svg')) key = 'nav.memo';
      else if(orig.includes('todo.svg')) key = 'nav.todo';
      else if(orig.includes('kitty.svg')) key = 'nav.today';
      if(key) img.src = getAsset(key);
    });
  }

  // 应用配色
  function applyTheme(key){
    if(!key) key = store.get(THEME_KEY, 'pink');
    document.documentElement.setAttribute('data-theme', key);
    $$('.theme-card').forEach(c => c.classList.toggle('selected', c.dataset.theme===key));
  }
  // 应用昵称
  function applyNickname(name){
    if(!name) name = store.get(NICK_KEY, '小龙');
    const el = $('.avatar-name'); if(el) el.textContent = name;
  }

  // 压缩图片到 500px 宽度，避免 localStorage 溢出
  function compressImage(file, cb){
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 500;
        let w = img.width, h = img.height;
        if(w > maxW){ h = h * maxW / w; w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const isSvg = file.type === 'image/svg+xml';
        cb(isSvg ? e.target.result : canvas.toDataURL('image/png', 0.92));
      };
      img.onerror = () => cb(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => cb(null);
    reader.readAsDataURL(file);
  }

  // 刷新面板里的预览缩略图
  function refreshCustPreviews(){
    $$('.cust-item').forEach(item => {
      const key = item.dataset.key;
      const val = getAsset(key);
      const prev = item.querySelector('.preview');
      if(prev){
        prev.style.backgroundImage = `url('${val}')`;
        prev.textContent = val.startsWith('data:') ? '' : '';
      }
    });
  }

  function bindCustomize(){
    // 打开
    $('#customizeBtn').addEventListener('click', () => {
      $('#custOverlay').classList.add('open');
      refreshCustPreviews();
      applyTheme(store.get(THEME_KEY, 'pink'));
      $('#nickInput').value = store.get(NICK_KEY, '小龙');
    });
    // 关闭
    $('#custClose').addEventListener('click', () => $('#custOverlay').classList.remove('open'));
    $('#saveAllBtn').addEventListener('click', () => {
      $('#custOverlay').classList.remove('open');
      toast('换装已保存');
    });
    $('#custOverlay').addEventListener('click', e => {
      if(e.target === $('#custOverlay')) $('#custOverlay').classList.remove('open');
    });

    // 标签页切换
    $$('.cust-tab').forEach(t => t.addEventListener('click', () => {
      $$('.cust-tab').forEach(x => x.classList.remove('active'));
      $$('.cust-pane').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      $(`.cust-pane[data-pane="${t.dataset.pane}"]`).classList.add('active');
    }));

    // 图片上传 & 重置
    $$('.cust-item').forEach(item => {
      const key = item.dataset.key;
      const upBtn = item.querySelector('.upload-btn');
      const reBtn = item.querySelector('.reset-btn');
      const preview = item.querySelector('.preview');
      // 点击整行也能触发上传
      const triggerUpload = () => {
        const inp = document.createElement('input');
        inp.type = 'file'; inp.accept = 'image/*';
        inp.onchange = ev => {
          const f = ev.target.files[0];
          if(!f) return;
          compressImage(f, data => {
            if(!data){ toast('图片读取失败'); return; }
            setAsset(key, data);
            applyAssets();
            refreshCustPreviews();
            toast('已更新');
          });
        };
        inp.click();
      };
      upBtn.addEventListener('click', triggerUpload);
      preview.addEventListener('click', triggerUpload);
      reBtn.addEventListener('click', () => {
        delAsset(key);
        applyAssets();
        refreshCustPreviews();
        toast('已重置');
      });
    });

    // 配色卡片
    const tg = $('#themeGrid'); tg.innerHTML='';
    THEMES.forEach(t => {
      const card = document.createElement('div');
      card.className = 'theme-card';
      card.dataset.theme = t.key;
      card.innerHTML = `<div class="swatch">${t.swatches.map(c=>`<span style="background:${c}"></span>`).join('')}</div>
        <div class="name">${t.name}</div>`;
      card.addEventListener('click', () => {
        applyTheme(t.key);
        store.set(THEME_KEY, t.key);
        toast('已切换：'+t.name);
      });
      tg.appendChild(card);
    });

    // 昵称
    $('#nickSave').addEventListener('click', () => {
      const v = $('#nickInput').value.trim() || '小龙';
      store.set(NICK_KEY, v);
      applyNickname(v);
      toast('昵称已保存');
    });

    // 全部重置
    $('#resetAllBtn').addEventListener('click', () => {
      if(!confirm('确定要重置全部换装配置吗？所有自定义图片、配色、昵称都会回到默认。')) return;
      localStorage.removeItem(ASSETS_KEY);
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(NICK_KEY);
      document.documentElement.style.setProperty('--bg-img', `url('./assets/kitty-pattern.svg')`);
      document.documentElement.removeAttribute('data-theme');
      // 重新应用默认
      // 把所有 img 的 src 重置
      $$('.avatar-img, .hero-kitty, .led-illu, .bot-kitty').forEach(img => {
        if(img.classList.contains('avatar-img')) img.src = DEFAULT_ASSETS.avatar;
        else if(img.classList.contains('hero-kitty') || img.classList.contains('led-illu')) img.src = DEFAULT_ASSETS.hero;
        else if(img.classList.contains('bot-kitty')) img.src = DEFAULT_ASSETS.sideBottom;
      });
      ['today','english','ledger','exercise','news','finance','memo','todo'].forEach(k => {
        const img = $(`.nav-item[data-target="${k}"] .ico-img img`);
        if(img) img.src = DEFAULT_ASSETS.nav[k];
      });
      $$('.card-ico, .header-ico').forEach(img => {
        const orig = img.dataset.orig || '';
        let key = null;
        if(orig.includes('cal.svg')) key = 'pageIco.cal';
        else if(orig.includes('check.svg')) key = 'pageIco.check';
        else if(orig.includes('heart.svg')) key = 'pageIco.heart';
        else if(orig.includes('clock.svg')) key = 'pageIco.clock';
        else if(orig.includes('book.svg')) key = 'nav.english';
        else if(orig.includes('ledger.svg')) key = 'nav.ledger';
        else if(orig.includes('run.svg')) key = 'nav.exercise';
        else if(orig.includes('fire.svg')) key = 'nav.news';
        else if(orig.includes('money.svg')) key = 'nav.finance';
        else if(orig.includes('memo.svg')) key = 'nav.memo';
        else if(orig.includes('todo.svg')) key = 'nav.todo';
        else if(orig.includes('kitty.svg')) key = 'nav.today';
        if(key){
          const parts = key.split('.');
          let def = DEFAULT_ASSETS;
          for(const p of parts) def = def?.[p];
          if(def) img.src = def;
        }
      });
      applyNickname('小龙');
      refreshCustPreviews();
      applyTheme('pink');
      toast('已全部重置');
    });
  }

  function init(){
    bindNav();
    tickClock(); setInterval(tickClock, 1000);
    renderCal();
    refreshMotto();
    bindRoutine();
    bindWord();
    bindPlan();
    refreshStreakGrid();
    bindLedger();
    bindSport();
    bindNews();
    bindFin();
    bindMemo();
    bindTodo();
    // 换装
    applyAssets();
    applyTheme(store.get(THEME_KEY, 'pink'));
    applyNickname(store.get(NICK_KEY, '小龙'));
    bindCustomize();
    // 安装引导
    bindInstallTip();
  }

  // ====== 安装到主屏幕引导 ======
  function detectPlatform(){
    const ua = navigator.userAgent;
    if(/iPhone|iPad|iPod/i.test(ua)) return 'ios';
    if(/Android/i.test(ua)) return 'android';
    if(/Chrome\/(\d+)/i.test(ua) && !/Mobile/i.test(ua)) return 'desktop-chrome';
    return 'desktop';
  }
  function isInStandalone(){
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  }
  function bindInstallTip(){
    // 已经在 standalone 模式（已加到主屏）就不显示
    if(isInStandalone()) return;
    // 用户之前关过就不显示
    if(localStorage.getItem('workbench_install_dismissed')) return;
    const tip = $('#installTip');
    const body = $('#installBody');
    const head = $('#installHead');
    const platform = detectPlatform();
    let title = '把工作台添加到主屏幕';
    let html = '';
    if(platform === 'ios'){
      title = '添加到主屏幕（iOS）';
      html = '<ol class="steps">' +
        '<li>点击底部<b>分享按钮</b>（方框加箭头那个）</li>' +
        '<li>滑动后选择<b>「添加到主屏幕」</b></li>' +
        '<li>名称可以改，点击右上角<b>「添加」</b></li>' +
        '</ol><div style="margin-top:6px;">添加后会显示 Kitty 图标，点开直接进入全屏工作台 ✨</div>';
    } else if(platform === 'android'){
      title = '添加到主屏幕（Android）';
      html = '<ol class="steps">' +
        '<li>点击右上角<b>菜单按钮（三个点）</b></li>' +
        '<li>选择<b>「添加到主屏幕」</b>或<b>「安装应用」</b></li>' +
        '<li>确认名称，点击<b>「添加」</b></li>' +
        '</ol><div style="margin-top:6px;">Chrome 浏览器会问是否安装，直接确认即可 ✨</div>';
    } else {
      // desktop / 其他：chrome 桌面端的 beforeinstallprompt
      title = '安装为应用（推荐）';
      html = '<ol class="steps">' +
        '<li>点击地址栏右侧的<b>「安装」</b>小图标（电脑图标）</li>' +
        '<li>或点右上角菜单 → <b>「安装小龙工作台」</b></li>' +
        '<li>桌面会生成一个独立的应用图标</li>' +
        '</ol>';
    }
    head.textContent = title;
    body.innerHTML = html;
    tip.classList.add('show');
    $('#installLater').addEventListener('click', ()=>{
      tip.classList.remove('show');
    });
    $('#installGot').addEventListener('click', ()=>{
      tip.classList.remove('show');
      localStorage.setItem('workbench_install_dismissed', '1');
    });
    // Chrome 的 beforeinstallprompt 捕获
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      window.__deferredPrompt = e;
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();