/* 小龙工作台 - Hello Kitty风格 */
(function(){
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // ====== 工具 ======
  const store = {
    get(k, def){ try{ const v = localStorage.getItem(k); if(v==null) return def; try{return JSON.parse(v);}catch(_){return v;} }catch(e){ return def; } },
    set(k, v){
      try {
        if(typeof v === 'string') localStorage.setItem(k, v);
        else localStorage.setItem(k, JSON.stringify(v));
        return true;
      } catch(e){
        // 配额超限（QuotaExceededError）——常见于存了大量 base64 图片
        console.warn('[store] 保存失败:', k, e.name);
        toast('存储空间不足，无法保存。建议删除一些旧款式或图片');
        return false;
      }
    }
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
    ['en','ledger','sport','news','fin','memo','todo','nails'].forEach(k => {
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
    // 强制 pot 前缀：^(刚需|休闲|储蓄|备用)\s+(.+?)(?:\s+)?(\d+(?:\.\d+)?)$
    // 兼容「刚需 外卖 25」「刚需 外卖25」「刚需外卖25」三种写法
    m = text.match(/^(刚需|休闲|储蓄|备用)\s*(.+?)\s*(\d+(?:\.\d+)?)$/);
    if(m){
      const potMap = {刚需:'need', 休闲:'want', 储蓄:'save', 备用:'emerg'};
      const pot = potMap[m[1]];
      const note = m[2].trim();
      const amount = parseFloat(m[3]);
      return {type:'expense', amount, note, pot, category:POT_CONFIG[pot].name};
    }
    // 普通：note + 数字（兼容「奶茶 15」「奶茶15」）
    m = text.match(/^(.+?)(?:\s+)?(\d+(?:\.\d+)?)$/);
    if(m){
      const note = m[1].trim();
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
    // 收入为 0 时显示引导提示
    const hint = $('#potEmptyHint');
    if(hint) hint.hidden = inc > 0;
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

  // ====== 锻炼（FitDaily 风格 5 tab） ======
  const SPORT_KEY = 'workbench_sport';            // 兼容旧数据
  const SPORT_TODAY_KEY = 'workbench_sport_today';
  const SPORT_PLAN_KEY = 'workbench_sport_plan';
  const SPORT_FOLLOWS_KEY = 'workbench_sport_follows';
  const SPORT_COLLECTIONS_KEY = 'workbench_sport_collections';
  const SPORT_AI_KEY = 'workbench_sport_ai';

  const BODY_PARTS = [
    {key:'胸', emoji:'💪'},{key:'背', emoji:'🔙'},
    {key:'腿', emoji:'🦵'},{key:'肩', emoji:'🏋️'},
    {key:'臂', emoji:'💪'},{key:'核心', emoji:'🎯'},
    {key:'臀', emoji:'🍑'},{key:'全身', emoji:'🌟'},
    {key:'有氧', emoji:'🏃'}
  ];

  const WEEK_TEMPLATE = {1:'胸',2:'背',3:'有氧',4:'肩臂',5:'腿臀',6:'核心',7:'休息'};
  const BLOGGER_COLORS = ['#ff8a5b','#ffadc6','#a89bd9','#7ecaa0','#5b9bff','#e675d4','#ffcf70','#5fc9c4'];

  const SPORT_FOLLOW_DEFAULT = [
    {id:'b_pamela', name:'帕梅拉', color:'#ff8a5b'},
    {id:'b_ouyang', name:'欧阳春晓', color:'#ffadc6'},
    {id:'b_hanxiaosi', name:'韩小四', color:'#a89bd9'},
    {id:'b_zhouliuye', name:'周六野 Zoey', color:'#7ecaa0'},
    {id:'b_meilibalei', name:'美丽芭蕾', color:'#5b9bff'}
  ];

  const AI_COACH_KEYWORDS = {
    '肩颈':{
      label:'肩颈放松',
      videos:[{name:'5分钟肩颈拉伸',url:'https://www.bilibili.com/video/BV1gs411T7Cm',dur:'5min',platform:'B站'},{name:'办公室肩颈放松',url:'https://www.bilibili.com/video/BV1Eb411u7Xw',dur:'8min',platform:'B站'}],
      actions:[
        {name:'颈部绕环', time:'4 个方向 × 8 次', img:'neck-roll'},
        {name:'斜方肌拉伸', time:'左右各 30 秒', img:'trap-stretch'},
        {name:'肩部画圈', time:'前 10 / 后 10 次', img:'shoulder-roll'},
        {name:'耸肩放松', time:'×10 次', img:'shrug'}
      ]
    },
    '腰':{
      label:'久坐腰部舒缓',
      videos:[{name:'腰部舒缓瑜伽',url:'https://www.bilibili.com/video/BV1Js411o7s1',dur:'10min',platform:'B站'},{name:'猫式伸展跟练',url:'https://www.youtube.com/watch?v=R2L2RtvJqLE',dur:'7min',platform:'YouTube'}],
      actions:[
        {name:'猫式伸展', time:'×8 次', img:'cat-stretch'},
        {name:'婴儿式', time:'保持 60 秒', img:'child-pose'},
        {name:'仰卧扭转', time:'左右各 30 秒', img:'supine-twist'},
        {name:'坐姿前屈', time:'保持 30 秒', img:'seated-fold'}
      ]
    },
    '瘦肚子':{
      label:'核心燃脂',
      videos:[{name:'10分钟核心训练',url:'https://www.bilibili.com/video/BV1v4411C7g2',dur:'10min',platform:'B站'},{name:'帕梅拉腹肌',url:'https://www.bilibili.com/video/BV1PK4y1k7jT',dur:'15min',platform:'B站'}],
      actions:[
        {name:'卷腹', time:'×15 次', img:'crunch'},
        {name:'平板支撑', time:'保持 30 秒', img:'plank'},
        {name:'俄罗斯转体', time:'×20 次', img:'russian-twist'},
        {name:'仰卧抬腿', time:'×15 次', img:'leg-raise'}
      ]
    },
    '拉伸':{
      label:'睡前拉伸',
      videos:[{name:'睡前全身拉伸',url:'https://www.bilibili.com/video/BV1oW411n7jH',dur:'8min',platform:'B站'},{name:'助眠瑜伽',url:'https://www.bilibili.com/video/BV1Ds411T7tY',dur:'12min',platform:'B站'}],
      actions:[
        {name:'全身拉伸', time:'8 分钟', img:'full-stretch'},
        {name:'股四头肌拉伸', time:'左右各 30 秒', img:'quad-stretch'},
        {name:'腿部后侧拉伸', time:'左右各 30 秒', img:'hamstring-stretch'},
        {name:'颈部放松', time:'×10 次', img:'neck-roll'}
      ]
    },
    '生理期':{
      label:'经期舒缓瑜伽',
      videos:[{name:'经期舒缓瑜伽',url:'https://www.bilibili.com/video/BV1Ks411w7Ry',dur:'15min',platform:'B站'},{name:'生理期运动',url:'https://www.youtube.com/watch?v=2L2lnxIcJAQ',dur:'10min',platform:'YouTube'}],
      actions:[
        {name:'仰卧束角', time:'保持 60 秒', img:'supine-twist'},
        {name:'蝴蝶式', time:'保持 60 秒', img:'child-pose'},
        {name:'婴儿式', time:'保持 60 秒', img:'child-pose'},
        {name:'呼吸放松', time:'5 分钟', img:'meditation'}
      ]
    },
    '累':{
      label:'低强度恢复',
      videos:[{name:'10分钟放松瑜伽',url:'https://www.bilibili.com/video/BV1Gs411T7pL',dur:'10min',platform:'B站'}],
      actions:[
        {name:'散步', time:'20 分钟', img:'walk'},
        {name:'阴瑜伽', time:'10 分钟', img:'child-pose'},
        {name:'呼吸训练', time:'5 分钟', img:'meditation'}
      ]
    },
    '不想动':{
      label:'10分钟微运动',
      videos:[{name:'10分钟低强度',url:'https://www.bilibili.com/video/BV1Rs411T7vK',dur:'10min',platform:'B站'}],
      actions:[
        {name:'靠墙静蹲', time:'30 秒 × 3 组', img:'wall-sit'},
        {name:'拉伸', time:'5 分钟', img:'full-stretch'},
        {name:'深呼吸', time:'3 分钟', img:'meditation'}
      ]
    },
    '全身':{
      label:'全身燃脂',
      videos:[{name:'帕梅拉全身燃脂',url:'https://www.bilibili.com/video/BV1PK4y1k7jT',dur:'20min',platform:'B站'},{name:'全身 HIIT',url:'https://www.youtube.com/watch?v=ml6cT4AZdqI',dur:'15min',platform:'YouTube'}],
      actions:[
        {name:'开合跳', time:'×20 次', img:'jumping-jack'},
        {name:'深蹲', time:'×15 次', img:'squat'},
        {name:'俯卧撑', time:'×10 次', img:'pushup'},
        {name:'波比跳', time:'×8 次', img:'burpee'}
      ]
    },
    '腿':{
      label:'腿部塑形',
      videos:[{name:'腿部塑形跟练',url:'https://www.bilibili.com/video/BV1Js411o7wa',dur:'15min',platform:'B站'}],
      actions:[
        {name:'深蹲', time:'×15 次', img:'squat'},
        {name:'弓步蹲', time:'左右各 10', img:'lunge'},
        {name:'臀桥', time:'×15 次', img:'glute-bridge'},
        {name:'侧卧抬腿', time:'左右各 12', img:'side-leg'}
      ]
    },
    '臀':{
      label:'蜜桃臀训练',
      videos:[{name:'蜜桃臀养成',url:'https://www.bilibili.com/video/BV1Ks411w7sH',dur:'15min',platform:'B站'}],
      actions:[
        {name:'臀桥', time:'×15 次', img:'glute-bridge'},
        {name:'臀推', time:'×12 次', img:'glute-bridge'},
        {name:'侧抬腿', time:'左右各 15', img:'side-leg'},
        {name:'跪姿后踢腿', time:'×12 次', img:'knee-kick'}
      ]
    },
    '胸':{
      label:'胸部塑形',
      videos:[{name:'胸部训练',url:'https://www.bilibili.com/video/BV1Es411u7nK',dur:'12min',platform:'B站'}],
      actions:[
        {name:'俯卧撑', time:'×10 次', img:'pushup'},
        {name:'哑铃卧推', time:'×12 次', img:'bench-press'},
        {name:'跪姿俯卧撑', time:'×10 次', img:'pushup'},
        {name:'上斜推举', time:'×10 次', img:'shoulder-press'}
      ]
    },
    '背':{
      label:'背部塑形',
      videos:[{name:'背部训练',url:'https://www.bilibili.com/video/BV1Hs411T7wG',dur:'12min',platform:'B站'}],
      actions:[
        {name:'划船', time:'×12 次', img:'row'},
        {name:'YTWL', time:'各 10 次', img:'ytwl'},
        {name:'弹力带', time:'×15 次', img:'row'},
        {name:'俯身飞鸟', time:'×12 次', img:'fly'}
      ]
    },
    '手臂':{
      label:'拜拜肉消除',
      videos:[{name:'手臂塑形',url:'https://www.bilibili.com/video/BV1Cs411o7tY',dur:'10min',platform:'B站'}],
      actions:[
        {name:'哑铃弯举', time:'×12 次', img:'curl'},
        {name:'臂屈伸', time:'×10 次', img:'tricep'},
        {name:'肩推', time:'×12 次', img:'shoulder-press'},
        {name:'侧平举', time:'×12 次', img:'lateral-raise'}
      ]
    },
    '有氧':{
      label:'心肺训练',
      videos:[{name:'心肺 HIIT',url:'https://www.bilibili.com/video/BV1Zs411T7sQ',dur:'20min',platform:'B站'}],
      actions:[
        {name:'跳绳', time:'100 个', img:'skip'},
        {name:'开合跳', time:'×20 次', img:'jumping-jack'},
        {name:'波比跳', time:'×10 次', img:'burpee'},
        {name:'高抬腿', time:'30 秒', img:'high-knee'}
      ]
    }
  };

  function getSportToday(){ return store.get(SPORT_TODAY_KEY, null) || {date:'', kcal:0, completed:0, planBody:[], dietList:[]}; }
  function setSportToday(d){ store.set(SPORT_TODAY_KEY, d); }
  function getSportPlan(){ return store.get(SPORT_PLAN_KEY, null); }
  function setSportPlan(p){ store.set(SPORT_PLAN_KEY, p); }
  function getSportFollows(){ return store.get(SPORT_FOLLOWS_KEY, null); }
  function setSportFollows(f){ store.set(SPORT_FOLLOWS_KEY, f); }
  function getSportCollections(){ return store.get(SPORT_COLLECTIONS_KEY, []); }
  function setSportCollections(c){ store.set(SPORT_COLLECTIONS_KEY, c); }
  function getSportAI(){ return store.get(SPORT_AI_KEY, []); }
  function setSportAI(a){ store.set(SPORT_AI_KEY, a); }

  // 初始化默认值（首次使用）
  function initSportDefaults(){
    if(!getSportFollows()) setSportFollows(SPORT_FOLLOW_DEFAULT);
    if(!getSportPlan()) setSportPlan({weekStart:getWeekStart(), schedule:WEEK_TEMPLATE, checked:{}});
  }
  function getWeekStart(){
    const d = new Date(); const day = d.getDay()||7;
    d.setDate(d.getDate()-day+1); d.setHours(0,0,0,0);
    return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
  }
  function getTodayDayOfWeek(){
    const d = new Date(); return d.getDay()||7;
  }

  // 兼容旧数据
  function migrateSportOld(){
    const old = store.get(SPORT_KEY, []);
    if(old.length === 0) return 0;
    const todayStr = todayKey();
    const todayMin = old.filter(s => s.date === todayStr).reduce((s,x)=>s+(x.min||0), 0);
    return todayMin;
  }

  // ====== Tab 切换 ======
  function bindSportTabs(){
    $$('#sportTabs .tab-item').forEach(b => b.addEventListener('click', ()=>{
      $$('#sportTabs .tab-item').forEach(x=>x.classList.remove('active'));
      $$('#page-exercise .tab-pane').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const t = b.dataset.sptab;
      const pane = $('#page-exercise .tab-pane[data-spane="'+t+'"]');
      if(pane) pane.classList.add('active');
      // 触发对应渲染
      if(t==='today') renderSportToday();
      if(t==='week') renderSportWeekPlan();
      if(t==='blogger'){ renderSportBloggers(); renderSportCollections(); renderWeekOverview(); }
      if(t==='ai') renderSportAICoach();
    }));
    // 跨 tab 跳转
    $$('[data-go]').forEach(b => b.addEventListener('click', ()=>{
      const target = b.dataset.go;
      const tabBtn = $$('#sportTabs .tab-item').find(x => x.dataset.sptab === target);
      if(tabBtn) tabBtn.click();
    }));
  }

  // ====== 今日 Tab ======
  function renderSportToday(){
    const today = getSportToday();
    if(today.date !== todayKey()){
      today.date = todayKey();
      today.kcal = 0;
      today.completed = 0;
      today.dietList = [];
      today.planBody = [];
      setSportToday(today);
    }
    // 问候语
    const h = new Date().getHours();
    const greet = h < 6 ? '夜深了小龙' : h < 12 ? '早上好小龙' : h < 18 ? '下午好小龙' : '晚上好小龙';
    $('#sportGreeting').textContent = greet + '，今天也要元气满满 ✨';
    // 连续打卡天数（从旧数据计算）
    const oldData = store.get(SPORT_KEY, []);
    let streak = 0;
    if(oldData.length){
      const dates = Array.from(new Set(oldData.map(s=>s.date))).sort().reverse();
      const todayD = todayKey();
      let cur = new Date(); cur.setHours(0,0,0,0);
      while(dates.includes(cur.getFullYear()+'-'+(cur.getMonth()+1)+'-'+cur.getDate())){
        streak++; cur.setDate(cur.getDate()-1);
      }
    }
    $('#sportStreak').textContent = '🔥 连续打卡 ' + streak + ' 天';
    // 今日训练分钟数（合并旧数据）
    const todayMin = today.planBody.length ? (today.planBody.length * 15) : (migrateSportOld() || 0);
    $('#sportMinTotal').textContent = todayMin;
    $('#sportKcal').textContent = today.kcal;
    $('#sportKcalTag').textContent = today.kcal;
    $('#sportActions').textContent = today.completed;
    // 今日日程
    const plan = getSportPlan() || {schedule:{}};
    const dow = getTodayDayOfWeek();
    const todayBody = plan.schedule[dow];
    const schedEl = $('#sportTodaySchedule');
    if(todayBody && todayBody !== '休息'){
      schedEl.innerHTML = '<b style="color:var(--pink-700);font-size:14px;">💪 ' + todayBody + '</b><div class="muted" style="margin-top:4px;">点击「开始训练」开始今天的训练吧～</div>';
    } else {
      schedEl.innerHTML = '<div style="color:var(--ink-soft);">🎉 今天是休息日，好好放松～</div>';
    }
    // 饮食列表
    const ul = $('#sportDietList');
    ul.innerHTML = '';
    (today.dietList||[]).slice().reverse().forEach(d => {
      const li = document.createElement('li');
      li.innerHTML = '<div class="l-info"><span>'+d.name+'</span><span class="muted" style="font-size:11px;">'+d.time+'</span></div><span style="color:var(--pink-600);font-weight:700;">'+d.kcal+' kcal</span>';
      ul.appendChild(li);
    });
    if(!today.dietList || today.dietList.length === 0){
      ul.innerHTML = '<li style="justify-content:center;color:var(--ink-soft);font-size:13px;">还没有记录饮食，点击上方「记录饮食」～</li>';
    }
  }

  function bindDietModal(){
    $('#dietBtn').addEventListener('click', ()=>{
      $('#dietName').value = '';
      $('#dietKcal').value = '';
      openModal('dietModal');
    });
    $('#dietConfirm').addEventListener('click', ()=>{
      const name = $('#dietName').value.trim();
      const kcal = +$('#dietKcal').value || 0;
      if(!name){ toast('请输入食物名称'); return; }
      const today = getSportToday();
      const d = new Date();
      today.dietList = today.dietList || [];
      today.dietList.push({name, kcal, time: pad(d.getHours())+':'+pad(d.getMinutes())});
      today.kcal = (today.kcal || 0) + kcal;
      setSportToday(today);
      closeModal('dietModal');
      renderSportToday();
      toast('已记录');
    });
  }

  // ====== 选部位 Tab ======
  let sportPickedBody = [];
  function renderBodyPicker(){
    const g = $('#bodyPickerGrid');
    g.innerHTML = '';
    BODY_PARTS.forEach(b => {
      const chip = document.createElement('div');
      chip.className = 'body-chip';
      chip.innerHTML = '<div class="body-chip-circle">'+b.emoji+'</div><div class="body-chip-name">'+b.key+'</div>';
      chip.addEventListener('click', ()=>{
        const idx = sportPickedBody.indexOf(b.key);
        if(idx >= 0){ sportPickedBody.splice(idx,1); chip.classList.remove('selected'); }
        else { sportPickedBody.push(b.key); chip.classList.add('selected'); }
        $('#bodyPickedLabel').textContent = '已选：' + (sportPickedBody.length ? sportPickedBody.join('、') : '无');
      });
      g.appendChild(chip);
    });
  }

  function bindStartTraining(){
    $('#startTrainingBtn').addEventListener('click', ()=>{
      if(sportPickedBody.length === 0){ toast('请先选择部位'); return; }
      const today = getSportToday();
      today.planBody = sportPickedBody.slice();
      today.completed = (today.completed||0) + sportPickedBody.length;
      setSportToday(today);
      // 跳到周计划
      const tabBtn = $$('#sportTabs .tab-item').find(x => x.dataset.sptab === 'week');
      if(tabBtn) tabBtn.click();
      // 自动勾选今天
      const dow = getTodayDayOfWeek();
      const plan = getSportPlan() || {schedule:{}, checked:{}};
      plan.schedule[dow] = sportPickedBody.join('+');
      plan.checked[dow] = true;
      setSportPlan(plan);
      toast('已开始训练，加油 💪');
      sportPickedBody = [];
      $$('.body-chip').forEach(c => c.classList.remove('selected'));
      $('#bodyPickedLabel').textContent = '已选：无';
    });
  }

  // ====== 周计划 Tab ======
  function renderSportWeekPlan(){
    const plan = getSportPlan() || {schedule: WEEK_TEMPLATE, checked:{}, weekStart: getWeekStart()};
    if(!plan.schedule) plan.schedule = WEEK_TEMPLATE;
    if(!plan.checked) plan.checked = {};
    if(!plan.weekStart) plan.weekStart = getWeekStart();
    setSportPlan(plan);
    const wkDays = [{n:'一',d:1},{n:'二',d:2},{n:'三',d:3},{n:'四',d:4},{n:'五',d:5},{n:'六',d:6},{n:'日',d:7}];
    const dow = getTodayDayOfWeek();
    const days = [1,2,3,4,5,6,7];
    const planned = days.filter(d => plan.schedule[d] && plan.schedule[d] !== '休息');
    const done = planned.filter(d => plan.checked[d]).length;
    const pct = planned.length ? Math.round(done/planned.length*100) : 0;
    $('#sportWeekPct').textContent = pct;
    $('#sportWeekBar').style.width = pct+'%';
    $('#sportWeekCount').textContent = '已完成 '+done+'/'+planned.length+' 项';
    const wrap = $('#weekPlanList');
    wrap.innerHTML = '';
    wkDays.forEach(wd => {
      const body = plan.schedule[wd.d] || '休息';
      const isRest = !body || body === '休息';
      const checked = !!plan.checked[wd.d];
      const card = document.createElement('div');
      card.className = 'week-plan-card' + (wd.d===dow?' today':'') + (checked?' checked':'');
      let bodyClass = isRest?'rest':'';
      let tag = isRest?'<span class="week-plan-tag">休息</span>':'<span class="week-plan-tag">'+body+'</span>';
      let actionHtml = '';
      if(checked){
        actionHtml = '<button class="week-plan-act del" data-day="'+wd.d+'">✕</button>';
      } else if(!isRest){
        actionHtml = '<button class="week-plan-act del" data-day="'+wd.d+'">✕</button>';
      }
      card.innerHTML = '<div class="week-plan-day">周'+wd.n+'</div>'+
        '<div class="week-plan-body '+bodyClass+'">'+(checked?'✓ 已完成':'')+'</div>'+
        tag+
        (checked?'<button class="week-plan-act" data-check="'+wd.d+'" style="background:var(--good);color:#fff;font-size:14px;">✓</button>':'<button class="week-plan-act add" data-check="'+wd.d+'">✓</button>')+
        actionHtml;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll('[data-check]').forEach(b => b.addEventListener('click', e=>{
      const d = +b.dataset.check;
      plan.checked[d] = !plan.checked[d];
      setSportPlan(plan);
      renderSportWeekPlan();
      // 同步今日打卡
      if(d === dow){
        const today = getSportToday();
        today.completed = (plan.checked[d]?sportPickedBody.length||1:0);
        setSportToday(today);
      }
      toast(plan.checked[d]?'已标记完成 ✓':'取消完成');
    }));
    wrap.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', e=>{
      const d = +b.dataset.day;
      const body = plan.schedule[d];
      if(confirm('删除周'+['一','二','三','四','五','六','日'][d-1]+'的'+(body||'休息')+'安排？')){
        delete plan.schedule[d];
        delete plan.checked[d];
        setSportPlan(plan);
        renderSportWeekPlan();
      }
    }));
  }

  function bindGenWeek(){
    $('#genWeekBtn').addEventListener('click', ()=>{
      if(!confirm('一键生成训练分化周计划？将覆盖当前排期')) return;
      const plan = getSportPlan() || {};
      plan.schedule = Object.assign({}, WEEK_TEMPLATE);
      plan.checked = {};
      setSportPlan(plan);
      renderSportWeekPlan();
      toast('已生成训练分化周计划 ✨');
    });
  }

  // ====== 博主 Tab ======
  function renderSportBloggers(){
    const follows = getSportFollows() || SPORT_FOLLOW_DEFAULT;
    setSportFollows(follows);
    const row = $('#bloggerRow');
    row.innerHTML = '';
    follows.forEach(f => {
      const wrap = document.createElement('div');
      wrap.className = 'blogger-avatar-wrap';
      wrap.innerHTML = '<div class="blogger-avatar" style="border-color:'+f.color+';background:'+f.color+'22;color:'+f.color+'">'+f.name.charAt(0)+'</div><div class="blogger-name">'+f.name+'</div>';
      wrap.addEventListener('click', ()=>{
        const colls = getSportCollections().filter(c => c.bloggerId === f.id);
        if(colls.length === 0){ toast(f.name+' 还没有合集'); return; }
        const tabBtn = $$('#sportTabs .tab-item').find(x => x.dataset.sptab === 'blogger');
        if(tabBtn) tabBtn.click();
        toast('有 '+colls.length+' 个跟练合集');
      });
      row.appendChild(wrap);
    });
    // 添加按钮
    const add = document.createElement('div');
    add.className = 'blogger-avatar-wrap';
    add.innerHTML = '<div class="blogger-avatar add">+</div><div class="blogger-name">添加</div>';
    add.addEventListener('click', ()=>{
      $('#addBloggerName').value = '';
      selectedBloggerColor = BLOGGER_COLORS[0];
      renderBloggerColorChips();
      openModal('addBloggerModal');
    });
    row.appendChild(add);
  }

  function renderBloggerColorChips(){
    const wrap = $('#bloggerColorChips');
    wrap.innerHTML = '';
    BLOGGER_COLORS.forEach(c => {
      const chip = document.createElement('div');
      chip.className = 'blogger-color-chip' + (c===selectedBloggerColor?' selected':'');
      chip.style.background = c;
      chip.addEventListener('click', ()=>{
        selectedBloggerColor = c;
        renderBloggerColorChips();
      });
      wrap.appendChild(chip);
    });
  }
  let selectedBloggerColor = BLOGGER_COLORS[0];

  function bindAddBlogger(){
    $('#addBloggerConfirm').addEventListener('click', ()=>{
      const name = $('#addBloggerName').value.trim();
      if(!name){ toast('请输入博主名称'); return; }
      const follows = getSportFollows();
      follows.push({id:'b_'+Date.now(), name, color:selectedBloggerColor});
      setSportFollows(follows);
      closeModal('addBloggerModal');
      renderSportBloggers();
      renderWeekOverview();
      toast('已添加');
    });
  }

  // ====== 跟练合集 ======
  let newCollTempVideos = [];
  function renderSportCollections(){
    const colls = getSportCollections();
    const wrap = $('#collList');
    wrap.innerHTML = '';
    if(colls.length === 0){
      wrap.innerHTML = '<div class="coll-empty">还没有合集～点「+ 新建」创建<br>比如：一三五帕梅拉燃脂 · 二四六周六野体态</div>';
      return;
    }
    colls.forEach(c => {
      const card = document.createElement('div');
      card.className = 'collection-card';
      let vidHtml = '';
      (c.videos||[]).forEach((v,i) => {
        vidHtml += '<div class="coll-video"><span class="badge" style="font-size:10px;background:var(--line-2);color:var(--pink-700);">'+v.platform+'</span><a href="'+v.url+'" target="_blank">'+v.title+'</a><button class="coll-del" data-cid="'+c.id+'" data-vi="'+i+'" style="background:none;color:var(--ink-soft);cursor:pointer;">✕</button></div>';
      });
      card.innerHTML = '<div class="coll-head"><div class="coll-name">'+c.name+'</div><button class="coll-del" data-cdel="'+c.id+'" style="background:none;color:var(--ink-soft);cursor:pointer;">✕</button></div>'+
        '<div class="coll-videos">'+((c.videos||[]).length+' 个视频 · 创建于 '+c.date)+'</div>'+
        vidHtml+
        '<div class="coll-add-vid" data-cadd="'+c.id+'">+ 添加视频链接</div>';
      wrap.appendChild(card);
    });
    wrap.querySelectorAll('[data-cdel]').forEach(b => b.addEventListener('click', e=>{
      if(!confirm('删除这个合集？')) return;
      setSportCollections(getSportCollections().filter(c => c.id !== e.target.dataset.cdel));
      renderSportCollections();
      renderWeekOverview();
    }));
    wrap.querySelectorAll('[data-cadd]').forEach(b => b.addEventListener('click', e=>{
      const cid = e.target.dataset.cadd;
      const url = prompt('粘贴视频链接（B站/抖音/YouTube）:');
      if(!url) return;
      const title = prompt('视频标题:', detectVideoPlatform(url)+' 视频') || (detectVideoPlatform(url)+' 视频');
      const colls = getSportCollections();
      const c = colls.find(x => x.id === cid);
      if(c){
        c.videos = c.videos || [];
        c.videos.push({url, title, platform: detectVideoPlatform(url)});
        setSportCollections(colls);
        renderSportCollections();
        renderWeekOverview();
      }
    }));
    wrap.querySelectorAll('[data-cid]').forEach(b => b.addEventListener('click', e=>{
      const cid = e.target.dataset.cid;
      const vi = +e.target.dataset.vi;
      const colls = getSportCollections();
      const c = colls.find(x => x.id === cid);
      if(c && c.videos){
        c.videos.splice(vi, 1);
        setSportCollections(colls);
        renderSportCollections();
      }
    }));
  }

  function bindNewColl(){
    $('#newCollBtn').addEventListener('click', ()=>{
      newCollTempVideos = [];
      $('#newCollName').value = '';
      $('#newCollUrl').value = '';
      $('#newCollTitle').value = '';
      renderNewCollVideos();
      openModal('newCollModal');
    });
    $('#newCollAddVideo').addEventListener('click', ()=>{
      const url = $('#newCollUrl').value.trim();
      if(!url){ toast('请输入链接'); return; }
      const title = $('#newCollTitle').value.trim() || (detectVideoPlatform(url)+' 视频');
      newCollTempVideos.push({url, title, platform: detectVideoPlatform(url)});
      $('#newCollUrl').value = '';
      $('#newCollTitle').value = '';
      renderNewCollVideos();
    });
    $('#newCollConfirm').addEventListener('click', ()=>{
      const name = $('#newCollName').value.trim();
      if(!name){ toast('请输入合集名称'); return; }
      const colls = getSportCollections();
      colls.push({id:'c_'+Date.now(), name, videos:newCollTempVideos.slice(), date:todayKey()});
      setSportCollections(colls);
      closeModal('newCollModal');
      renderSportCollections();
      renderWeekOverview();
      toast('合集已创建');
    });
  }

  function renderNewCollVideos(){
    const wrap = $('#newCollVideos');
    wrap.innerHTML = '';
    newCollTempVideos.forEach((v,i) => {
      const item = document.createElement('div');
      item.className = 'coll-video';
      item.innerHTML = '<span class="badge" style="font-size:10px;background:var(--line-2);color:var(--pink-700);">'+v.platform+'</span><span style="flex:1;font-size:12px;">'+v.title+'</span><button class="nv-del" data-i="'+i+'" style="background:none;color:var(--ink-soft);cursor:pointer;font-size:14px;">✕</button>';
      item.querySelector('.nv-del').addEventListener('click', e=>{
        newCollTempVideos.splice(+e.target.dataset.i,1);
        renderNewCollVideos();
      });
      wrap.appendChild(item);
    });
  }

  function renderWeekOverview(){
    const follows = getSportFollows() || SPORT_FOLLOW_DEFAULT;
    const wrap = $('#weekOverview');
    wrap.innerHTML = '';
    follows.slice(0,5).forEach(f => {
      const row = document.createElement('div');
      row.className = 'week-overview-row';
      const grid = document.createElement('div');
      grid.className = 'week-overview-grid';
      for(let i=1;i<=7;i++){
        const cell = document.createElement('div');
        cell.className = 'week-overview-cell';
        cell.style.borderColor = f.color;
        grid.appendChild(cell);
      }
      row.innerHTML = '<div class="week-overview-name" style="color:'+f.color+';">'+f.name.charAt(0)+'</div>';
      row.appendChild(grid);
      wrap.appendChild(row);
    });
  }

  // ====== AI 教练 Tab ======
  const AI_QUICK_CHIPS = ['肩颈不舒服','久坐腰酸','想瘦肚子','睡前拉伸','生理期','不想动'];
  function renderAIQuickChips(){
    const wrap = $('#aiQuickChips');
    wrap.innerHTML = '';
    AI_QUICK_CHIPS.forEach(c => {
      const chip = document.createElement('button');
      chip.className = 'ai-quick-chip';
      chip.textContent = c;
      chip.addEventListener('click', ()=>{
        $('#aiChatInput').value = c;
        handleAIChat();
      });
      wrap.appendChild(chip);
    });
  }

  function renderSportAICoach(){
    // 重新渲染历史消息（最近 5 条）
    const wrap = $('#aiChatWrap');
    // 保留第一个初始气泡，删除其它
    wrap.innerHTML = '<div class="ai-chat-bubble"><div class="ai-chat-text"><div>你好呀！我是你的 AI 教练 💪</div><div>告诉我你的状态，比如「肩颈不舒服」「想瘦肚子」「今天好累」，我马上给你安排合适的跟练视频～</div></div></div>';
    const history = getSportAI();
    history.slice(-5).forEach(h => {
      const userDiv = document.createElement('div');
      userDiv.className = 'ai-user-msg';
      userDiv.innerHTML = '<span>🧑 '+h.query+'</span>';
      wrap.appendChild(userDiv);
      const replyDiv = document.createElement('div');
      replyDiv.className = 'ai-reply';
      replyDiv.innerHTML = h.reply;
      wrap.appendChild(replyDiv);
    });
    wrap.scrollTop = wrap.scrollHeight;
  }

  function parseAICoachQuery(text){
    const found = [];
    Object.keys(AI_COACH_KEYWORDS).forEach(kw => {
      if(text.indexOf(kw) >= 0) found.push({kw, ...AI_COACH_KEYWORDS[kw]});
    });
    return found;
  }

  function buildAIReply(matches, query){
    if(matches.length === 0){
      return '<b>没太懂呢～</b>试试说「肩颈不舒服」「想瘦肚子」「睡前拉伸」「练腿」让我帮你推跟练 💪';
    }
    let html = '<b>💪 收到！推荐以下跟练：</b>';
    matches.slice(0,3).forEach(m => {
      html += '<div class="ai-block">';
      html += '<div class="ai-block-title">'+m.label+'</div>';

      // 视频折叠区（链接容易失效，放在可折叠位置）
      if(m.videos && m.videos.length){
        html += '<details class="ai-video-details"><summary>📺 跟练视频（'+m.videos.length+' 个，可能需要联网）</summary>';
        m.videos.forEach(v => {
          html += '<div class="vid-item"><a href="'+v.url+'" target="_blank" rel="noopener">'+v.name+'</a><span class="muted-small"> · '+v.platform+' · '+v.dur+'</span></div>';
        });
        html += '</details>';
      }

      // 动作分解（核心：配图 + 时间 + 描述）
      html += '<div class="ai-actions-head">🎯 动作分解（跟图练）：</div>';
      m.actions.forEach((a, i) => {
        html += '<div class="ai-action-card">';
        html += '<div class="ai-action-img"><img src="./assets/poses/'+a.img+'.svg" alt="'+a.name+'" loading="lazy" /></div>';
        html += '<div class="ai-action-info">';
        html += '<div class="ai-action-num">'+(i+1)+'</div>';
        html += '<div class="ai-action-name">'+a.name+'</div>';
        html += '<div class="ai-action-time">⏱ '+a.time+'</div>';
        html += '</div></div>';
      });

      html += '</div>';
    });
    return html;
  }

  function handleAIChat(){
    const input = $('#aiChatInput');
    const text = input.value.trim();
    if(!text) return;
    const matches = parseAICoachQuery(text);
    const replyHtml = buildAIReply(matches, text);
    const wrap = $('#aiChatWrap');
    const userDiv = document.createElement('div');
    userDiv.className = 'ai-user-msg';
    userDiv.innerHTML = '<span>🧑 '+text+'</span>';
    wrap.appendChild(userDiv);
    const replyDiv = document.createElement('div');
    replyDiv.className = 'ai-reply';
    replyDiv.innerHTML = replyHtml;
    wrap.appendChild(replyDiv);
    input.value = '';
    setTimeout(()=>{ wrap.scrollTop = wrap.scrollHeight; }, 50);
    // 存历史
    const hist = getSportAI();
    hist.push({id:'ai_'+Date.now(), query:text, reply:replyHtml, ts:Date.now()});
    setSportAI(hist.slice(-30));
  }

  function bindAIChat(){
    $('#aiChatSend').addEventListener('click', handleAIChat);
    $('#aiChatInput').addEventListener('keydown', e => { if(e.key === 'Enter') handleAIChat(); });
  }

  // ====== 锻炼入口 ======
  function bindSport(){
    initSportDefaults();
    bindSportTabs();
    renderBodyPicker();
    bindStartTraining();
    bindGenWeek();
    bindAddBlogger();
    bindNewColl();
    renderAIQuickChips();
    bindAIChat();
    bindDietModal();
    renderSportToday();
    renderSportWeekPlan();
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

  // ====== 美甲板块 ======
  const NAILS_STYLES_KEY = 'workbench_nails_styles';
  const NAILS_GOALS_KEY = 'workbench_nails_goals';
  const NAILS_PRACTICE_KEY = 'workbench_nails_practice';

  const NAIL_TAG_DIMS = {
    color:  ['红','粉','蓝','绿','紫','黑','白','裸色','多色'],
    style:  ['温柔','酷','可爱','简约','复古','ins风'],
    shape:  ['长甲','短甲','方形','圆形','杏仁型'],
    scene:  ['日常','约会','节日','婚礼']
  };
  const NAIL_DIM_LABELS = {color:'颜色', style:'风格', shape:'甲型', scene:'场景'};

  // 对话筛选关键词词典（核心）
  const NAIL_KEYWORD_MAP = {
    color: {
      '红':'红','红色':'红','红色系':'红','大红':'红','酒红':'红','正红':'红',
      '粉':'粉','粉色':'粉','粉色系':'粉','少女粉':'粉','蜜桃粉':'粉','樱花粉':'粉',
      '蓝':'蓝','蓝色':'蓝','蓝色系':'蓝','天蓝':'蓝','湖蓝':'蓝','雾霾蓝':'蓝','克莱因蓝':'蓝',
      '绿':'绿','绿色':'绿','绿色系':'绿','抹茶绿':'绿','薄荷绿':'绿','墨绿':'绿',
      '紫':'紫','紫色':'紫','紫色系':'紫','香芋紫':'紫','丁香紫':'紫','薰衣草紫':'紫',
      '黑':'黑','黑色':'黑','黑色系':'黑','纯黑':'黑','暗黑':'黑',
      '白':'白','白色':'白','白色系':'白','纯白':'白','奶白':'白',
      '裸':'裸色','裸色':'裸色','肉色':'裸色','豆沙':'裸色','奶茶色':'裸色',
      '多色':'多色','彩色':'多色','拼色':'多色','渐变色':'多色','渐变':'多色','跳色':'多色','撞色':'多色'
    },
    style: {
      '温柔':'温柔','温柔风':'温柔','软妹':'温柔','淑女':'温柔','气质':'温柔',
      '酷':'酷','酷飒':'酷','帅气':'酷','暗黑风':'酷','辣妹':'酷','拽酷':'酷',
      '可爱':'可爱','少女':'可爱','卡哇伊':'可爱','萌':'可爱','甜妹':'可爱','甜系':'可爱',
      '简约':'简约','简单':'简约','极简':'简约','干净':'简约','素雅':'简约',
      '复古':'复古','复古风':'复古','法式':'复古','vintage':'复古','中古':'复古',
      'ins风':'ins风','ins':'ins风','网红风':'ins风','流行':'ins风','韩系':'ins风','欧美风':'ins风'
    },
    shape: {
      '长甲':'长甲','长款':'长甲','加长':'长甲','延长甲':'长甲',
      '短甲':'短甲','短款':'短甲','短指甲':'短甲',
      '方形':'方形','方甲':'方形','平直':'方形',
      '圆形':'圆形','圆甲':'圆形','圆润':'圆形',
      '杏仁型':'杏仁型','杏仁':'杏仁型','椭圆':'杏仁型','橄榄':'杏仁型','水滴':'杏仁型'
    },
    scene: {
      '日常':'日常','通勤':'日常','上班':'日常','生活':'日常','学生':'日常',
      '约会':'约会','约会款':'约会','情侣':'约会','相亲':'约会',
      '节日':'节日','过年':'节日','圣诞':'节日','新春':'节日','中秋':'节日','节庆':'节日',
      '婚礼':'婚礼','新娘':'婚礼','婚宴':'婚礼','伴娘':'婚礼','出嫁':'婚礼','结婚':'婚礼'
    }
  };

  function detectVideoPlatform(url){
    if(!url) return '链接';
    if(/bilibili\.com|b23\.tv/i.test(url)) return 'B站';
    if(/douyin\.com|iesdouyin/i.test(url)) return '抖音';
    if(/youtube\.com|youtu\.be/i.test(url)) return 'YouTube';
    if(/xiaohongshu\.com|xhslink/i.test(url)) return '小红书';
    return '链接';
  }

  function getNailStyles(){ return store.get(NAILS_STYLES_KEY, []); }
  function setNailStyles(s){ store.set(NAILS_STYLES_KEY, s); }
  function getNailGoals(){ return store.get(NAILS_GOALS_KEY, []); }
  function setNailGoals(g){ store.set(NAILS_GOALS_KEY, g); }
  function getNailPractice(){ return store.get(NAILS_PRACTICE_KEY, {}); }
  function setNailPractice(p){ store.set(NAILS_PRACTICE_KEY, p); }

  function bindNailsTabs(){
    $$('#nailsTabs .tab-item').forEach(b => b.addEventListener('click', ()=>{
      $$('#nailsTabs .tab-item').forEach(x=>x.classList.remove('active'));
      $$('#page-nails .tab-pane').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const t = b.dataset.ntab;
      const pane = $('#page-nails .tab-pane[data-npane="'+t+'"]');
      if(pane) pane.classList.add('active');
    }));
  }

  // ====== 上传图片 ======
  let nailUploadData = { img:null, tags:{color:[],style:[],shape:[],scene:[]} };
  let nailTempVideos = [];

  function renderNailTagChips(){
    Object.keys(NAIL_TAG_DIMS).forEach(dim => {
      const wrap = $('#nail'+dim.charAt(0).toUpperCase()+dim.slice(1)+'Tags');
      if(!wrap) return;
      wrap.innerHTML = '';
      NAIL_TAG_DIMS[dim].forEach(v => {
        const chip = document.createElement('button');
        chip.className = 'nail-tag-chip';
        chip.textContent = v;
        chip.dataset.val = v;
        chip.addEventListener('click', ()=>{
          const arr = nailUploadData.tags[dim];
          const idx = arr.indexOf(v);
          if(idx >= 0){ arr.splice(idx,1); chip.classList.remove('selected'); }
          else { arr.push(v); chip.classList.add('selected'); }
        });
        wrap.appendChild(chip);
      });
    });
  }

  function bindNailUpload(){
    const fileInput = $('#nailFileInput');
    const area = $('#nailUploadArea');
    area.addEventListener('click', ()=> fileInput.click());
    fileInput.addEventListener('change', e => {
      const f = e.target.files[0];
      if(!f) return;
      compressImage(f, data => {
        if(!data){ toast('图片读取失败'); return; }
        nailUploadData.img = data;
        const img = $('#nailUploadPreview');
        img.src = data; img.style.display = 'block';
        $('#nailUploadPlaceholder').style.display = 'none';
      });
    });

    $('#nailUploadBtn').addEventListener('click', ()=>{
      nailUploadData = { img:null, tags:{color:[],style:[],shape:[],scene:[]} };
      const img = $('#nailUploadPreview');
      img.style.display = 'none'; img.src = '';
      $('#nailUploadPlaceholder').style.display = 'block';
      $('#nailNoteInput').value = '';
      $$('.nail-tag-chip').forEach(c => c.classList.remove('selected'));
      openModal('nailUploadModal');
    });

    $('#nailUploadConfirm').addEventListener('click', ()=>{
      if(!nailUploadData.img){ toast('请先选择图片'); return; }
      const styles = getNailStyles();
      styles.push({
        id: 'nail_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
        img: nailUploadData.img,
        tags: JSON.parse(JSON.stringify(nailUploadData.tags)),
        note: $('#nailNoteInput').value.trim(),
        createdAt: Date.now(),
        date: todayKey()
      });
      const ok = setNailStyles(styles);
      if(!ok) return;  // 存储失败，store.set 已弹 toast，保留弹窗让用户重试
      closeModal('nailUploadModal');
      refreshNailLibrary();
      toast('款式已保存');
    });
  }

  // ====== 款式库渲染 + 筛选 ======
  let nailFilterState = { keyword:'', tags:{} };

  function renderNailTagFilters(){
    const wrap = $('#nailTagFilters');
    wrap.innerHTML = '';
    Object.keys(NAIL_TAG_DIMS).forEach(dim => {
      const label = document.createElement('span');
      label.className = 'nail-filter-chip group-label';
      label.textContent = NAIL_DIM_LABELS[dim]+':';
      wrap.appendChild(label);
      NAIL_TAG_DIMS[dim].forEach(v => {
        const chip = document.createElement('button');
        chip.className = 'nail-filter-chip';
        chip.textContent = v;
        chip.dataset.dim = dim;
        chip.dataset.val = v;
        const active = (nailFilterState.tags[dim]||[]).includes(v);
        if(active) chip.classList.add('active');
        chip.addEventListener('click', ()=>{
          if(!nailFilterState.tags[dim]) nailFilterState.tags[dim] = [];
          const arr = nailFilterState.tags[dim];
          const idx = arr.indexOf(v);
          if(idx >= 0) arr.splice(idx,1);
          else arr.push(v);
          renderNailTagFilters();
          refreshNailLibrary();
        });
        wrap.appendChild(chip);
      });
    });
  }

  function filterNailStyles(){
    let list = getNailStyles().slice().reverse();
    const kw = nailFilterState.keyword.trim().toLowerCase();
    if(kw){
      list = list.filter(s => {
        const note = (s.note||'').toLowerCase();
        const allTags = Object.values(s.tags||{}).flat().join(' ').toLowerCase();
        return note.includes(kw) || allTags.includes(kw);
      });
    }
    Object.keys(nailFilterState.tags).forEach(dim => {
      const selected = nailFilterState.tags[dim];
      if(selected && selected.length > 0){
        list = list.filter(s => {
          const st = (s.tags&&s.tags[dim])||[];
          return selected.some(v => st.includes(v));
        });
      }
    });
    return list;
  }

  function refreshNailLibrary(){
    const list = filterNailStyles();
    const grid = $('#nailGrid');
    const empty = $('#nailEmpty');
    grid.innerHTML = '';
    if(list.length === 0){ empty.hidden = false; return; }
    empty.hidden = true;
    list.forEach(s => {
      const card = document.createElement('div');
      card.className = 'nail-card';
      const allTags = Object.values(s.tags||{}).flat().slice(0,4);
      card.innerHTML = `
        <img src="${s.img}" alt="${s.note||'美甲款式'}" loading="lazy" />
        <div class="nail-card-overlay">
          ${s.note ? `<div>${s.note}</div>` : ''}
          <div class="nail-card-tags">
            ${allTags.map(t=>`<span class="nail-card-tag">${t}</span>`).join('')}
          </div>
        </div>`;
      card.addEventListener('click', ()=> openNailViewer(s.id));
      grid.appendChild(card);
    });
  }

  function bindNailSearch(){
    $('#nailSearch').addEventListener('input', e => {
      nailFilterState.keyword = e.target.value;
      refreshNailLibrary();
    });
    $('#nailClearFilter').addEventListener('click', ()=>{
      nailFilterState = { keyword:'', tags:{} };
      $('#nailSearch').value = '';
      renderNailTagFilters();
      refreshNailLibrary();
      toast('已清除筛选');
    });
  }

  function openNailViewer(id){
    const s = getNailStyles().find(x=>x.id===id);
    if(!s) return;
    $('#nailViewerImg').src = s.img;
    $('#nailViewerTitle').textContent = s.note || '款式详情';
    $('#nailViewerNote').textContent = s.note || '';
    $('#nailViewerDate').textContent = '上传于 '+s.date;
    const tagWrap = $('#nailViewerTags');
    tagWrap.innerHTML = '';
    Object.keys(s.tags||{}).forEach(dim => {
      (s.tags[dim]||[]).forEach(v => {
        const t = document.createElement('span');
        t.className = 'nv-tag';
        t.textContent = NAIL_DIM_LABELS[dim]+'·'+v;
        tagWrap.appendChild(t);
      });
    });
    $('#nailViewerDelete').dataset.id = id;
    openModal('nailViewerModal');
  }

  function bindNailViewer(){
    $('#nailViewerDelete').addEventListener('click', e => {
      const id = e.target.dataset.id;
      if(!id) return;
      if(!confirm('删除这个款式？')) return;
      setNailStyles(getNailStyles().filter(x=>x.id!==id));
      closeModal('nailViewerModal');
      refreshNailLibrary();
      toast('已删除');
    });
  }

  // ====== 风格分析（对话筛选）======
  function parseNailQuery(text){
    text = (text||'').trim().toLowerCase();
    if(!text) return null;
    const intent = { color:[], style:[], shape:[], scene:[], raw:text };
    let matched = false;
    Object.keys(NAIL_KEYWORD_MAP).forEach(dim => {
      const dict = NAIL_KEYWORD_MAP[dim];
      const found = new Set();
      Object.keys(dict).forEach(kw => {
        if(text.indexOf(kw) >= 0){ found.add(dict[kw]); matched = true; }
      });
      intent[dim] = Array.from(found);
    });
    return matched ? intent : null;
  }

  function searchNailStyles(intent){
    let list = getNailStyles().slice();
    ['color','style','shape','scene'].forEach(dim => {
      const wanted = intent[dim];
      if(wanted && wanted.length > 0){
        list = list.filter(s => {
          const st = (s.tags && s.tags[dim]) || [];
          return wanted.some(v => st.includes(v));
        });
      }
    });
    return list;
  }

  function buildNailAssistantReply(intent, results){
    const parts = [];
    if(intent.color.length) parts.push(intent.color.join('、')+'系');
    if(intent.style.length) parts.push(intent.style.join('、')+'风');
    if(intent.shape.length) parts.push(intent.shape.join('、'));
    if(intent.scene.length) parts.push('适合'+intent.scene.join('、'));
    const desc = parts.length ? parts.join(' · ') : '相关';
    if(results.length === 0){
      return `还没有${desc}的款式呢，去款式库添加几张吧～ 💅\n你可以说「粉色可爱风」「适合婚礼的」让我再帮你找找`;
    }
    let msg = `找到 ${results.length} 款${desc}的美甲`;
    if(results.length <= 3){ msg += '，看看哪款心动～ ✨'; }
    else { msg += '，先看前 6 款吧～ 💕'; }
    return msg;
  }

  function handleNailChat(){
    const input = $('#nailChatInput');
    const text = input.value.trim();
    if(!text) return;
    const bubble = $('#nailChatBubble');
    const userMsg = document.createElement('div');
    userMsg.style.cssText = 'margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);color:var(--pink-700);font-weight:600;';
    userMsg.textContent = '🧑 '+text;
    bubble.appendChild(userMsg);

    const replyWrap = document.createElement('div');
    replyWrap.style.cssText = 'margin-top:8px;';
    const resultsWrap = $('#nailChatResults');
    const intent = parseNailQuery(text);

    if(!intent){
      replyWrap.innerHTML = `没太看懂呢～试试说「蓝色系温柔风」「适合约会的款式」「复古长甲」让我帮你找 💅`;
      bubble.appendChild(replyWrap);
      resultsWrap.innerHTML = '';
      input.value = '';
      return;
    }

    const results = searchNailStyles(intent);
    const reply = buildNailAssistantReply(intent, results);
    replyWrap.textContent = '💅 '+reply;
    bubble.appendChild(replyWrap);

    resultsWrap.innerHTML = '';
    if(results.length > 0){
      const grid = document.createElement('div');
      grid.className = 'nail-chat-result-grid';
      results.slice(0,6).forEach(s => {
        const card = document.createElement('div');
        card.className = 'nail-card';
        const allTags = Object.values(s.tags||{}).flat().slice(0,3);
        card.innerHTML = `
          <img src="${s.img}" alt="${s.note||''}" loading="lazy" />
          <div class="nail-card-overlay">
            ${s.note?`<div>${s.note}</div>`:''}
            <div class="nail-card-tags">${allTags.map(t=>`<span class="nail-card-tag">${t}</span>`).join('')}</div>
          </div>`;
        card.addEventListener('click', ()=> openNailViewer(s.id));
        grid.appendChild(card);
      });
      resultsWrap.appendChild(grid);
    }
    input.value = '';
  }

  function bindNailChat(){
    const submit = $('#nailChatSubmit');
    const input = $('#nailChatInput');
    submit.addEventListener('click', handleNailChat);
    input.addEventListener('keydown', e => { if(e.key === 'Enter') handleNailChat(); });
  }

  // ====== 技能练习 ======
  function renderNailGoalList(){
    const goals = getNailGoals();
    const wrap = $('#nailGoalList');
    wrap.innerHTML = '';
    if(goals.length === 0){
      wrap.innerHTML = '<div class="card" style="text-align:center;color:var(--ink-soft);font-size:13px;">还没有练习目标，点击右上角「新建」创建吧 ✨</div>';
      return;
    }
    goals.forEach(g => {
      const card = document.createElement('div');
      card.className = 'nail-goal-card';
      let videoHtml = '';
      if(g.videos && g.videos.length > 0){
        videoHtml = '<div class="nail-video-list">' +
          g.videos.map(v => `
            <div class="nail-video-item">
              <span class="nv-platform">${v.platform}</span>
              <a href="${v.url}" target="_blank" rel="noopener" class="nv-title">${v.title||v.url}</a>
            </div>`).join('') + '</div>';
      }
      card.innerHTML = `
        <div class="nail-goal-head">
          <div class="nail-goal-ico"><img src="./assets/icons/target.svg" alt=""></div>
          <div class="nail-goal-info">
            <div class="nail-goal-name">${g.name}</div>
            ${g.desc ? `<div class="nail-goal-desc">${g.desc}</div>` : ''}
          </div>
          <button class="nail-goal-del" data-id="${g.id}">✕</button>
        </div>
        ${g.note ? `<div class="nail-goal-note">📝 ${g.note}</div>` : ''}
        ${videoHtml}
        <div class="nail-goal-actions">
          <button class="nv-add-btn" data-id="${g.id}">＋ 添加视频</button>
          <button class="nv-del-goal" data-id="${g.id}">删除目标</button>
        </div>`;
      wrap.appendChild(card);
    });
    wrap.querySelectorAll('.nv-del-goal').forEach(b => b.addEventListener('click', e=>{
      if(!confirm('删除这个练习目标？')) return;
      setNailGoals(getNailGoals().filter(g=>g.id!==e.target.dataset.id));
      renderNailGoalList();
      refreshNailPractice();
    }));
    wrap.querySelectorAll('.nv-add-btn').forEach(b => b.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      const goal = getNailGoals().find(g=>g.id===id);
      if(!goal) return;
      nailTempVideos = goal.videos ? goal.videos.slice() : [];
      $('#nailGoalName').value = goal.name;
      $('#nailGoalDesc').value = goal.desc || '';
      $('#nailGoalNote').value = goal.note || '';
      $('#nailGoalName').dataset.editId = id;
      renderNailTempVideos();
      openModal('nailGoalModal');
    }));
  }

  function renderNailTempVideos(){
    const wrap = $('#nailVideoLinks');
    wrap.innerHTML = '';
    nailTempVideos.forEach((v, i) => {
      const item = document.createElement('div');
      item.className = 'nail-video-item';
      item.innerHTML = `
        <span class="nv-platform">${v.platform}</span>
        <span class="nv-title">${v.title||v.url}</span>
        <button class="nv-del" data-i="${i}">✕</button>`;
      wrap.appendChild(item);
    });
    wrap.querySelectorAll('.nv-del').forEach(b => b.addEventListener('click', e=>{
      nailTempVideos.splice(+e.target.dataset.i, 1);
      renderNailTempVideos();
    }));
  }

  function bindNailGoalModal(){
    $('#nailAddGoalBtn').addEventListener('click', ()=>{
      nailTempVideos = [];
      $('#nailGoalName').value = '';
      $('#nailGoalDesc').value = '';
      $('#nailGoalNote').value = '';
      $('#nailGoalName').dataset.editId = '';
      renderNailTempVideos();
      openModal('nailGoalModal');
    });
    $('#nailVideoAdd').addEventListener('click', ()=>{
      const url = $('#nailVideoUrl').value.trim();
      if(!url){ toast('请输入链接'); return; }
      nailTempVideos.push({ url: url, title: detectVideoPlatform(url)+' 视频', platform: detectVideoPlatform(url) });
      $('#nailVideoUrl').value = '';
      renderNailTempVideos();
    });
    $('#nailGoalConfirm').addEventListener('click', ()=>{
      const name = $('#nailGoalName').value.trim();
      if(!name){ toast('请输入目标名称'); return; }
      const editId = $('#nailGoalName').dataset.editId;
      if(editId){
        const goals = getNailGoals();
        const g = goals.find(x=>x.id===editId);
        if(g){
          g.name = name;
          g.desc = $('#nailGoalDesc').value.trim();
          g.note = $('#nailGoalNote').value.trim();
          g.videos = nailTempVideos.slice();
        }
        setNailGoals(goals);
        toast('已更新');
      } else {
        const goals = getNailGoals();
        goals.push({
          id: 'g_nail_'+Date.now()+'_'+Math.random().toString(36).slice(2,5),
          name: name,
          desc: $('#nailGoalDesc').value.trim(),
          note: $('#nailGoalNote').value.trim(),
          videos: nailTempVideos.slice(),
          createdAt: Date.now()
        });
        setNailGoals(goals);
        toast('目标已创建');
      }
      closeModal('nailGoalModal');
      renderNailGoalList();
      refreshNailPractice();
    });
  }

  function refreshNailPractice(){
    const goals = getNailGoals();
    const practice = getNailPractice();
    const todayKeyStr = todayKey();
    const todayData = practice[todayKeyStr] || { goals: [] };
    const todayGoals = todayData.goals || [];

    $('#nailTodayLabel').textContent = todayKeyStr;
    $('#nailGoalCount').textContent = goals.length;

    const list = $('#nailPracticeList');
    list.innerHTML = '';
    if(goals.length === 0){
      list.innerHTML = '<div style="text-align:center;color:var(--ink-soft);font-size:13px;padding:10px;">先创建练习目标吧～</div>';
    } else {
      goals.forEach(g => {
        const done = todayGoals.includes(g.id);
        const item = document.createElement('div');
        item.className = 'nail-practice-item' + (done?' done':'');
        item.innerHTML = `<span class="np-name">${g.name}</span><span class="np-chk"></span>`;
        item.addEventListener('click', ()=>{
          const prac = getNailPractice();
          const td = prac[todayKeyStr] || { goals: [] };
          if(!td.goals) td.goals = [];
          const idx = td.goals.indexOf(g.id);
          if(idx >= 0) td.goals.splice(idx, 1);
          else td.goals.push(g.id);
          prac[todayKeyStr] = td;
          setNailPractice(prac);
          refreshNailPractice();
        });
        list.appendChild(item);
      });
    }

    const allDates = Object.keys(practice);
    let totalChecks = 0;
    allDates.forEach(d => { totalChecks += (practice[d].goals||[]).length; });
    $('#nailPracticeDays').textContent = allDates.filter(d => (practice[d].goals||[]).length > 0).length;
    $('#nailPracticeCount').textContent = totalChecks;
    renderNailHeatmap();
  }

  function renderNailHeatmap(){
    const g = $('#nailHeatmap');
    g.innerHTML = '';
    const practice = getNailPractice();
    const today = new Date();
    for(let i=29; i>=0; i--){
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
      const count = (practice[k] && practice[k].goals) ? practice[k].goals.length : 0;
      const cell = document.createElement('div');
      cell.className = 'hm-cell' +
        (count>=3?' l4':count===2?' l3':count===1?' l2':'') +
        (i===0?' today':'');
      cell.title = k + ' · 练习 '+count+' 项';
      g.appendChild(cell);
    }
  }

  function bindNails(){
    bindNailsTabs();
    renderNailTagChips();
    bindNailUpload();
    renderNailTagFilters();
    bindNailSearch();
    bindNailViewer();
    bindNailChat();
    bindNailGoalModal();
    renderNailGoalList();
    refreshNailLibrary();
    refreshNailPractice();
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
      nails: './assets/icons/nail.svg',
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
    // 9 个导航图标
    ['today','english','ledger','exercise','news','finance','memo','todo','nails'].forEach(k => {
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
        const maxW = 480;
        let w = img.width, h = img.height;
        if(w > maxW){ h = h * maxW / w; w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const isSvg = file.type === 'image/svg+xml';
        // 照片用 JPEG 0.72 质量（体积比 PNG 小 5-10 倍），SVG/透明 PNG 保留原格式
        if(isSvg){
          cb(e.target.result);
        } else if(file.type === 'image/png' && /logo|icon|sticker/i.test(file.name)){
          cb(canvas.toDataURL('image/png'));
        } else {
          cb(canvas.toDataURL('image/jpeg', 0.72));
        }
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
      ['today','english','ledger','exercise','news','finance','memo','todo','nails'].forEach(k => {
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
    bindNails();
    // 换装
    applyAssets();
    applyTheme(store.get(THEME_KEY, 'pink'));
    applyNickname(store.get(NICK_KEY, '小龙'));
    bindCustomize();
    // 安装引导
    bindInstallTip();
    // 💬 问问小龙
    bindAiPanel();
  }

  // ====== 💬 问问小龙（智谱 GLM-4-Flash 永久免费 API）======
  // API 提供商：智谱 GLM-4-Flash（永久免费）或 DeepSeek（付费）
  // 用户可在设置面板切换 provider 和粘贴自己的 key
  const AI_CONFIG_KEY = 'workbench_ai_config';
  const AI_HISTORY_KEY = 'workbench_ai_chat_history';
  const AI_PROVIDERS = {
    zhipu: { name:'智谱 GLM-4-Flash（永久免费）', url:'https://open.bigmodel.cn/api/paas/v4/chat/completions', model:'glm-4-flash' },
    deepseek: { name:'DeepSeek（付费）', url:'https://api.deepseek.com/chat/completions', model:'deepseek-chat' }
  };
  function getAiConfig(){
    const c = store.get(AI_CONFIG_KEY, null);
    if(c && c.key) return c;
    // 默认预填用户的智谱 key（GLM-4-Flash 永久免费）
    return { provider:'zhipu', key:'51dd9684123842ff84a6efbbfa31860e.qRJZv4hDKPCf7qOo' };
  }
  function setAiConfig(c){ store.set(AI_CONFIG_KEY, c); }
  const AI_SYSTEM_PROMPT = `你是「小龙」，用户的个人工作台 AI 助手。用户是一个住在中国的年轻女生，用 Hello Kitty 粉色风格的工作台 PWA 管理生活。

你的角色：
- 像朋友一样聊天，语气温暖、轻松、偶尔俏皮，不要客服腔
- 回答简洁实用，能用一句话说清的不用三句
- 涉及数字（金额/天数/进度）时给出具体数字，不要说"很多""一些"
- 如果用户问的数据为空（比如没记账），温和提醒ta先记录，不要编造数据
- 回答用 Markdown：**加粗**关键数字，必要时用列表，但不要整段加粗

你能看到用户工作台的实时数据，数据会作为 system 消息提供给你。基于数据回答问题。`;

  function getAiHistory(){ return store.get(AI_HISTORY_KEY, []); }
  function setAiHistory(h){ store.set(AI_HISTORY_KEY, h.slice(-40)); }

  // 收集工作台数据作为 AI 上下文
  function collectWorkbenchContext(){
    const ctx = { 时间: new Date().toLocaleString('zh-CN') };
    
    // 记账数据
    try {
      const mk = monthKey();
      const inc = getIncome(mk);
      const pots = getPots(mk);
      const trans = getTrans(mk);
      ctx.记账 = {
        月份: mk,
        月收入: '¥'+fmt(inc),
        四个存钱罐: {
          刚需支出_40百分比: '剩 ¥'+fmt(pots.need||0),
          休闲弹性_30百分比: '剩 ¥'+fmt(pots.want||0),
          储蓄理财_20百分比: '剩 ¥'+fmt(pots.save||0),
          应急备用_10百分比: '剩 ¥'+fmt(pots.emerg||0)
        },
        本月交易笔数: trans.length,
        最近5笔交易: trans.slice(-5).map(t => (t.date||'').slice(5)+' '+(t.time||'')+' '+(t.type==='income'?'收入':'支出')+' ¥'+fmt(t.amount)+' '+t.note+' ['+t.category+']')
      };
    } catch(e) { ctx.记账 = '读取失败'; }

    // 储蓄目标
    try {
      const goals = getGoals();
      if(goals && goals.length) ctx.储蓄目标 = goals.map(g => g.name+': 已存¥'+fmt(g.saved||0)+'/目标¥'+fmt(g.target)+', 截止'+(g.deadline||'无'));
    } catch(e) {}

    // 锻炼数据
    try {
      const today = getSportToday();
      const plan = getSportPlan();
      const follows = getSportFollows();
      ctx.锻炼 = {
        今日: { 日期: today.date, 消耗大卡: today.kcal, 完成动作数: today.completed, 训练部位: (today.planBody||[]).join('/')||'未定', 饮食记录数: (today.dietList||[]).length },
        周计划起始: plan ? plan.weekStart : '未生成',
        本周已完成天数: plan ? Object.keys(plan.checked||{}).length : 0,
        关注博主数: follows ? follows.length : 0
      };
    } catch(e) { ctx.锻炼 = '读取失败'; }

    // 待办
    try {
      const todos = store.get(TODO_KEY, []);
      const undone = todos.filter(t => !t.done);
      ctx.待办 = { 总数: todos.length, 未完成: undone.length, 最近未完成: undone.slice(0,8).map(t => t.text) };
    } catch(e) {}

    // 美甲
    try {
      const styles = getNailStyles();
      const goals = getNailGoals();
      const practice = getNailPractice();
      ctx.美甲 = {
        款式库数量: styles.length,
        款式标签分布: countNailTags(styles),
        练习目标数: goals.length,
        练习记录天数: Object.keys(practice || {}).length
      };
    } catch(e) {}

    // 备忘
    try {
      const memos = store.get(MEMO_KEY, []);
      if(memos.length) ctx.备忘录 = memos.slice(0,5).map(m => m.text);
    } catch(e) {}

    return JSON.stringify(ctx, null, 2);
  }

  function countNailTags(styles){
    const counts = {};
    styles.forEach(s => {
      Object.values(s.tags||{}).flat().forEach(t => { counts[t] = (counts[t]||0)+1; });
    });
    return counts;
  }

  function appendAiMsg(role, text){
    const body = $('#aiPanelBody');
    const div = document.createElement('div');
    div.className = 'ai-msg '+(role==='user'?'user':'bot');
    // 简易 Markdown：**bold** + 换行
    const html = text
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
      .replace(/`(.+?)`/g, '<code>$1</code>');
    div.innerHTML = '<div class="ai-msg-bubble">'+html.replace(/\n/g,'<br>')+'</div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
    return div;
  }

  function showAiTyping(){
    const body = $('#aiPanelBody');
    const div = document.createElement('div');
    div.className = 'ai-msg bot';
    div.id = 'aiTypingIndicator';
    div.innerHTML = '<div class="ai-msg-bubble"><div class="ai-msg-typing"><span></span><span></span><span></span></div></div>';
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }
  function hideAiTyping(){ const t = $('#aiTypingIndicator'); if(t) t.remove(); }

  async function callAi(userText){
    const cfg = getAiConfig();
    if(!cfg.key){
      throw new Error('NO_KEY');
    }
    const provider = AI_PROVIDERS[cfg.provider] || AI_PROVIDERS.zhipu;
    const context = collectWorkbenchContext();
    const messages = [
      { role:'system', content: AI_SYSTEM_PROMPT + '\n\n## 用户工作台实时数据\n```json\n' + context + '\n```' }
    ];
    // 带上最近 6 条历史
    const hist = getAiHistory();
    hist.slice(-6).forEach(h => messages.push({ role: h.role, content: h.content }));
    messages.push({ role:'user', content: userText });

    const resp = await fetch(provider.url, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+cfg.key
      },
      body: JSON.stringify({
        model: provider.model,
        messages: messages,
        max_tokens: 800,
        temperature: 0.7
      })
    });
    if(!resp.ok){
      const err = await resp.text();
      throw new Error('API '+resp.status+': '+err.substring(0,200));
    }
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  async function handleAiSend(text){
    text = (text||'').trim();
    if(!text) return;
    const input = $('#aiPanelInput');
    const sendBtn = $('#aiPanelSend');
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    // 清掉欢迎语
    const welcome = $('#aiPanelBody .ai-panel-welcome');
    if(welcome) welcome.remove();

    appendAiMsg('user', text);
    showAiTyping();

    // 记录用户消息
    const hist = getAiHistory();
    hist.push({ role:'user', content:text });

    try {
      const reply = await callAi(text);
      hideAiTyping();
      appendAiMsg('bot', reply);
      hist.push({ role:'assistant', content:reply });
      setAiHistory(hist);
    } catch(e){
      hideAiTyping();
      let errMsg = e.message;
      if(errMsg === 'NO_KEY'){
        appendAiMsg('bot', '**还没配置 API key**\n\n点击下面的「⚙️ 设置」按钮，选择「智谱 GLM-4-Flash（永久免费）」，然后粘贴你的 API key 就能用了。\n\n获取方式：\n1. 打开 open.bigmodel.cn 注册\n2. 在「API Keys」页面创建 key\n3. 复制 key 粘贴到设置里\n\nGLM-4-Flash 是**永久免费**的，不用充钱。');
        showAiSettingsLink();
      } else if(errMsg.includes('401')) errMsg = 'API key 无效，请检查设置';
      else if(errMsg.includes('429')) errMsg = '调用太频繁了，等几秒再试';
      else if(errMsg.includes('Failed to fetch')) errMsg = '网络连不上，检查下网络';
      if(errMsg !== 'NO_KEY') appendAiMsg('bot', '抱歉，出错了：'+errMsg);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  function bindAiPanel(){
    const fab = $('#aiFab');
    const panel = $('#aiPanel');
    const overlay = $('#aiPanelOverlay');
    const closeBtn = $('#aiPanelClose');
    const input = $('#aiPanelInput');
    const sendBtn = $('#aiPanelSend');

    function open(){
      panel.hidden = false;
      overlay.hidden = false;
      requestAnimationFrame(()=>{
        panel.classList.add('show');
        overlay.classList.add('show');
      });
      setTimeout(()=> input.focus(), 300);
      // 加载历史
      const hist = getAiHistory();
      if(hist.length > 0){
        const welcome = $('#aiPanelBody .ai-panel-welcome');
        if(welcome) welcome.remove();
        hist.slice(-12).forEach(h => appendAiMsg(h.role==='user'?'user':'bot', h.content));
      }
    }
    function close(){
      panel.classList.remove('show');
      overlay.classList.remove('show');
      setTimeout(()=>{ panel.hidden = true; overlay.hidden = true; }, 300);
      // 清空 body 里的消息（下次打开重新加载）
      $('#aiPanelBody').innerHTML = '<div class="ai-panel-welcome"><div class="ai-welcome-emoji">👋</div><div class="ai-welcome-text">你好呀！我能看到你工作台的所有数据（账单/锻炼/美甲/待办）。<br>试试问我：</div><div class="ai-suggest-list"><button class="ai-suggest" data-q="我这个月花了多少钱？存在哪些问题上">这个月花了多少？</button><button class="ai-suggest" data-q="分析下我的锻炼打卡情况，给建议">分析锻炼情况</button><button class="ai-suggest" data-q="我的存钱进度怎么样？要怎么改进">存钱进度分析</button><button class="ai-suggest" data-q="看看我的待办，哪些该优先处理">待办优先级</button></div></div>';
      rebindSuggests();
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);

    sendBtn.addEventListener('click', ()=> handleAiSend(input.value));
    input.addEventListener('keydown', e => {
      if(e.key === 'Enter' && !e.shiftKey){
        e.preventDefault();
        handleAiSend(input.value);
      }
    });
    // textarea 自适应高度
    input.addEventListener('input', ()=>{
      input.style.height = 'auto';
      input.style.height = Math.min(100, input.scrollHeight) + 'px';
    });

    // 设置按钮
    $('#aiSettingsBtn').addEventListener('click', openAiSettings);

    function rebindSuggests(){
      $$('.ai-suggest').forEach(btn => {
        btn.addEventListener('click', ()=>{
          handleAiSend(btn.dataset.q);
        });
      });
    }
    rebindSuggests();
  }

  function openAiSettings(){
    const cfg = getAiConfig();
    $('#aiProviderSelect').value = cfg.provider || 'zhipu';
    $('#aiKeyInput').value = cfg.key || '';
    const status = $('#aiSettingsStatus');
    status.innerHTML = cfg.key
      ? '<span style="color:#7ecaa0;">✓ 已配置（'+(AI_PROVIDERS[cfg.provider||'zhipu'].name)+'）</span>'
      : '<span style="color:#ff5a8d;">未配置，请粘贴 API key</span>';
    openModal('aiSettingsModal');
    $('#aiSettingsSave').onclick = ()=>{
      const provider = $('#aiProviderSelect').value;
      const key = $('#aiKeyInput').value.trim();
      if(!key){ toast('请先粘贴 API key'); return; }
      setAiConfig({ provider, key });
      toast('已保存，现在可以对话了');
      closeModal('aiSettingsModal');
      // 更新面板副标题
      const sub = $('#aiPanelSub');
      if(sub) sub.textContent = '已连接 · ' + AI_PROVIDERS[provider].name;
    };
  }

  function showAiSettingsLink(){
    const body = $('#aiPanelBody');
    const lastMsg = body.lastElementChild;
    if(lastMsg){
      const btn = document.createElement('button');
      btn.className = 'ai-settings-show-link';
      btn.textContent = '⚙️ 去设置 API key';
      btn.addEventListener('click', openAiSettings);
      lastMsg.querySelector('.ai-msg-bubble').appendChild(btn);
    }
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