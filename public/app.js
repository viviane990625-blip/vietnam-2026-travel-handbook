const mapQuery=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
const directions=(origin,destination,waypoints=[])=>'https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(origin)+'&destination='+encodeURIComponent(destination)+(waypoints.length?'&waypoints='+encodeURIComponent(waypoints.join('|')):'')+'&travelmode=driving';
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const todoGroups=[
  {name:'💳 钱、证件与联络',items:[['cash','携带人民币现金 2,000 元'],['applepay','Apple Pay 绑定银联卡'],['zhou-card','周飞带一张实体银联卡'],['passport','护照与入境材料'],['screenshots','下载机票、酒店电子确认页'],['sim','准备越南电话卡／eSIM、卡针']]},
  {name:'🧳 随身必带',items:[['chopsticks','一次性筷子'],['spray','酒精喷雾，核对航司液体限制'],['shoe-covers','一次性鞋套'],['stomach','肠胃药及个人常用药'],['repellent','驱蚊液、防晒用品'],['raincoat','雨衣／折叠伞、防水鞋'],['jacket','大叻薄外套'],['power','充电宝、充电线与插头']]},
  {name:'🎫 出发前要办',items:[['domestic','确认 18、20 日城际航班出票及行李额'],['greenline','比价并预订 Greenline Luge'],['datanla','比价并预订 Datanla 滑车'],['spa','预约 20 日三人的 SPA 时段'],['hotel-bags','确认两家酒店的退房寄存行李'],['apps','安装 Grab、Google Maps、翻译工具']]}
];
const todoKey='viet-trip-v2-2026';let completed={};try{completed=JSON.parse(localStorage.getItem(todoKey)||'{}')}catch{}
const todoRoot=document.getElementById('todoLists');todoGroups.forEach(g=>{const el=document.createElement('div');el.className='todo-group';const title=document.createElement('h3');title.textContent=g.name;el.append(title);g.items.forEach(([id,label])=>{const row=document.createElement('label');row.className='todo-item';const input=document.createElement('input');input.type='checkbox';input.checked=!!completed[id];input.setAttribute('aria-label',label);input.addEventListener('change',()=>{completed[id]=input.checked;try{localStorage.setItem(todoKey,JSON.stringify(completed))}catch{}refreshProgress()});const span=document.createElement('span');span.textContent=label;row.append(input,span);el.append(row)});todoRoot.append(el)});
function refreshProgress(){const all=todoGroups.flatMap(g=>g.items),done=all.filter(([id])=>completed[id]).length,p=Math.round(done/all.length*100);document.getElementById('todoCount').textContent=`${done} / ${all.length}`;document.getElementById('todoBar').style.width=p+'%';document.querySelector('.bar').setAttribute('aria-valuenow',String(p))}refreshProgress();

const events=[
  {at:'2026-10-16T21:50:00+08:00',title:'杭州出发 · 飞往胡志明',note:'国际航班已订：杭州萧山 T4 → 胡志明新山一 T2。'},
  {at:'2026-10-17T11:30:00+07:00',title:'第四郡附近午餐',note:'从 183/20 Bến Vân Đồn 出发，就近吃第一顿。'},
  {at:'2026-10-17T13:30:00+07:00',title:'第一郡服装店集中逛街',note:'主逛街区在滨城／Nguyễn Trãi 一带，Compound Garment 是备选。'},
  {at:'2026-10-17T18:00:00+07:00',title:'观光巴士或雨天 Plan B',note:'若下雨，改室内商场和咖啡馆。'},
  {at:'2026-10-18T08:30:00+07:00',title:'酒店附近早餐',note:'当天要取寄存行李后前往机场。'},
  {at:'2026-10-18T15:00:00+07:00',title:'从酒店出发前往新山一机场',note:'17:30 航班仍需以出票结果确认。'},
  {at:'2026-10-18T17:30:00+07:00',title:'计划飞往大叻',note:'胡志明 → 大叻，时间以最终机票为准。'},
  {at:'2026-10-19T09:00:00+07:00',title:'Greenline Luge 赛车',note:'当天还安排 Datanla 达坦拉瀑布和高山滑车。'},
  {at:'2026-10-19T14:00:00+07:00',title:'Datanla 达坦拉瀑布',note:'关注天气与滑车开放情况。'},
  {at:'2026-10-20T10:00:00+07:00',title:'大叻 SPA 按摩',note:'之后市区逛街、取行李，傍晚去机场。'},
  {at:'2026-10-20T16:00:00+07:00',title:'出发去大叻莲姜机场',note:'回胡志明的航班约 19:00，待出票确认。'},
  {at:'2026-10-21T03:10:00+07:00',title:'国际航班飞回杭州',note:'深夜活动后及时回新山一机场 T2。'}
];
function updateCountdown(){const now=Date.now(),item=events.find(e=>Date.parse(e.at)>now);if(!item){document.getElementById('nextEvent').textContent='旅程结束，平安到家';document.getElementById('nextDate').textContent='';document.getElementById('countdown').textContent='完成';document.getElementById('nextNote').textContent='';return}const t=Date.parse(item.at),left=t-now,d=Math.floor(left/86400000),h=Math.floor(left%86400000/3600000),m=Math.floor(left%3600000/60000),s=Math.floor(left%60000/1000);document.getElementById('nextEvent').textContent=item.title;document.getElementById('nextDate').textContent=new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Ho_Chi_Minh',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(t)+' · 越南时间';document.getElementById('countdown').textContent=d>0?`${d}天 ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`:`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;document.getElementById('nextNote').textContent=item.note}updateCountdown();setInterval(updateCountdown,1000);

const days=[
{date:'17',weekday:'周六',title:'胡志明 · 逛街与夜景',sub:'住第四郡 / 第一郡服装店集中逛',city:'Ho Chi Minh City',origin:'183/20 Ben Van Don District 4 Ho Chi Minh',destination:'183/20 Ben Van Don District 4 Ho Chi Minh',waypoints:['Ben Thanh Market Ho Chi Minh','Compound Garment 158/5 Nguyen Cong Tru Ho Chi Minh','Coi Saigon 77-79 Ly Tu Trong Ho Chi Minh'],map:'Ben Thanh Market Ho Chi Minh City',note:'傍晚若下雨：跳过敞篷观光巴士，改室内商场与咖啡；晚餐和酒吧仍在第一郡衔接。',stops:[
['11:30','酒店附近午餐','Phở Cầu Dừa 或 Bún Bò Huế 14B，按当天营业情况选一处。','Pho Cau Dua 251 Ben Van Don Ho Chi Minh',''],
['12:30','咖啡时间','沿前往第一郡的路线找一杯越南咖啡，避免专程绕路。','Ben Thanh Market Ho Chi Minh',''],
['13:30','第一郡服装店集中逛','滨城／Nguyễn Trãi 周边为主；Compound Garment（158/5 Nguyễn Công Trứ）保留为设计师店备选。','Compound Garment 158/5 Nguyen Cong Tru Ho Chi Minh',''],
['18:00','观光巴士或室内备选','天晴体验 City Sightseeing 夜景线；下雨改 Saigon Centre／Takashimaya 室内逛街。','Saigon Centre Ho Chi Minh','rain'],
['19:30','顺路晚餐','第一郡可选 De Tham Restaurant；回第四郡可选 Tippy’s Mexican Food。','De Tham Restaurant 258 De Tham Ho Chi Minh',''],
['21:00','爵士酒吧 CỘI','77–79 Lý Tự Trọng，固定店面；提前查当晚演出并预订座位，结束后 Grab 回住处。','Coi Saigon 77-79 Ly Tu Trong Ho Chi Minh','book']]},
{date:'18',weekday:'周日',title:'胡志明 → 大叻',sub:'住处附近慢游 / 17:30 拟飞大叻',city:'Ho Chi Minh City',origin:'183/20 Ben Van Don District 4 Ho Chi Minh',destination:'Tan Son Nhat International Airport',waypoints:['Pho Mong 242 Khanh Hoi Ho Chi Minh'],map:'District 4 Ho Chi Minh City',note:'当天把行李寄存在住处并回去取。咖啡体验课仅在酒店附近且不超过 3 小时时安排；否则按轻松版走。',stops:[
['08:30','第四郡早餐','Phở Mong 或 Phở Cầu Dừa，离住处较近。','Pho Mong 242 Khanh Hoi Ho Chi Minh',''],
['10:00','咖啡体验或慢游','有合适场次则预订 3 小时内的咖啡课；无合适课程就沿河散步、坐咖啡馆。','coffee workshop District 4 Ho Chi Minh','book'],
['12:30','午餐、回住处取行李','午餐仍在第四郡解决，取行李时确认无物品遗漏。','183/20 Ben Van Don District 4 Ho Chi Minh',''],
['15:00','前往新山一机场','按出票后的航站楼和托运行李截止时间倒推，周日路况留余量。','Tan Son Nhat International Airport',''],
['17:30','计划飞往大叻','截图是航班搜索结果，起飞 17:30、抵达 18:25 尚待出票确认。','Lien Khuong Airport',''],
['20:00','大叻晚餐 Góc Hà Thành','入住 Villa 22 后前往市中心；若落地较晚，以邻近且仍营业的店替换。','Goc Ha Thanh 51 Truong Cong Dinh Da Lat',''],
['21:00','大叻夜市','吃热豆浆、小吃并散步；雨大就缩短逛街时间。','Da Lat Night Market','']]},
{date:'19',weekday:'周一',title:'大叻 · 双滑车日',sub:'Greenline Luge + Datanla 达坦拉瀑布',city:'Da Lat',origin:'Villa 22 Nguyen Viet Xuan Da Lat',destination:'Villa 22 Nguyen Viet Xuan Da Lat',waypoints:['Dalat Flower Plateau Ecotourism Area','Datanla Waterfall Da Lat'],map:'Datanla Waterfall Da Lat',note:'雨天 Plan B：若户外项目停运，改 Klook 上可预约的 Tam Trinh 咖啡农场体验；雨天出发前确认接送、交通与退改。',stops:[
['08:00','早餐、叫车出发','带雨具、薄外套；前往高原花卉园。','Villa 22 Nguyen Viet Xuan Da Lat',''],
['09:00','Greenline Luge / KDL','赛车预留 2–3 小时。买票核对是否包含两次滑车、花园门票、接驳与秋千。','Dalat Flower Plateau Ecotourism Area','book'],
['12:00','午餐','在返回市区或前往瀑布的线路上吃，避免专门往返。','Da Lat city center',''],
['14:00','Datanla 达坦拉瀑布','高山滑车与瀑布。滑车票、门票是否打包，依最终产品说明。','Datanla Waterfall Da Lat','book'],
['18:30','回市区晚餐','Góc Hà Thành、Nếp 或 Bina Bina，按当天体力与营业时间选择。','Nep Asian Kitchen Bar 79 Truong Cong Dinh Da Lat',''],
['雨天','咖啡庄园体验课','若 Greenline／Datanla 因雨停运，再切换到 Tam Trinh 咖啡体验。','Tam Trinh Coffee Farm Da Lat','rain']]},
{date:'20',weekday:'周二',title:'大叻 → 胡志明',sub:'SPA + 逛街 / 晚上拟飞回',city:'Da Lat',origin:'Villa 22 Nguyen Viet Xuan Da Lat',destination:'Lien Khuong Airport',waypoints:['Da Lat Market','GO Da Lat Supermarket'],map:'Da Lat Market',note:'20 日 12:00 退房。SPA 和逛街前先与酒店确认行李寄存；若回程航班时间改变，午后行程跟着调整。',stops:[
['08:30','早餐','Phở Ân 或 Bò Né Dã Quỳ，按 SPA 位置选顺路的一家。','Pho An 23/5 Tran Phu Da Lat',''],
['10:00','SPA 按摩','提前预约三人同一时段，确认价格、项目时长和到店地址。','spa massage Da Lat city center','book'],
['12:00','退房、午餐、寄存行李','午餐在市中心解决，先问 Villa 22 能否寄存至下午。','Villa 22 Nguyen Viet Xuan Da Lat',''],
['13:30','市中心逛街','大叻市场与周边小店；下雨改 Go! 超市采购咖啡、Cocoon 等。','Da Lat Market','rain'],
['16:00','取行李前往莲姜机场','按出票时间倒推；不要把下午排得太满。','Lien Khuong Airport',''],
['约19:00','计划飞回胡志明','搜索截图显示约 19:00–19:55，待出票确认。','Tan Son Nhat International Airport',''],
['21:00','机场附近夜市／晚餐','考虑 Tân Bình 的 Hoàng Hoa Thám 市场周边，先核对当晚营业；午夜前回机场。','Hoang Hoa Tham Market Tan Binh Ho Chi Minh',''],
['次日03:10','国际航班返回杭州','胡志明新山一 T2 → 杭州萧山 T4。','Tan Son Nhat International Airport Terminal 2','']]}
];
const bookingLinks={
  '观光巴士或室内备选':['官方巴士信息','https://city-sightseeing.com/en/156/saigon'],
  'Greenline Luge / KDL':['Klook 查看当日价','https://www.klook.com/en-US/activity/104858-dalat-flower-highland-ticket/'],
  'Datanla 达坦拉瀑布':['Klook 查看当日价','https://www.klook.com/activity/10072-datanla-alpine-coaster-experience-da-lat-vietnam/'],
  '咖啡庄园体验课':['Klook 查看场次','https://www.klook.cn/zh-CN/activity/98386-tam-trinh-coffee-experience-da-lat/']
};
const dayRoot=document.getElementById('dayCards');days.forEach(d=>{const article=document.createElement('article');article.className='card day-card';const route=directions(d.origin,d.destination,d.waypoints);article.innerHTML=`<div class="day-top"><div class="day-title"><div class="date-badge"><span>10.${escapeHtml(d.date)}<br>${escapeHtml(d.weekday)}</span></div><div><h3>${escapeHtml(d.title)}</h3><p>${escapeHtml(d.sub)}</p></div></div><a class="day-route" href="${route}" target="_blank" rel="noopener">整日导航 ↗</a></div><button type="button" class="map-toggle" aria-expanded="false"><span>🗺 展开当日地图</span><span>⌄</span></button><div class="day-map" hidden><iframe title="${escapeHtml(d.title)}地图" loading="lazy" referrerpolicy="no-referrer-when-downgrade" data-src="https://www.google.com/maps?q=${encodeURIComponent(d.map)}&output=embed"></iframe><p>地图预览显示当天核心区域；如需从住处依次导航，请点 <a href="${route}" target="_blank" rel="noopener">整日导航 ↗</a>。</p></div><div class="timeline">${d.stops.map(s=>`<div class="stop"><time>${escapeHtml(s[0])}</time><div><div class="stop-title"><strong>${escapeHtml(s[1])}</strong>${s[4]?`<span class="mini-label ${s[4]==='rain'?'rain':''}">${s[4]==='rain'?'雨天备选':'建议预订'}</span>`:''}</div><p>${escapeHtml(s[2])}</p><a href="${mapQuery(s[3])}" target="_blank" rel="noopener">地点导航 ↗</a>${bookingLinks[s[1]]?` <a href="${bookingLinks[s[1]][1]}" target="_blank" rel="noopener">${bookingLinks[s[1]][0]} ↗</a>`:""}</div></div>`).join('')}</div><div class="day-note">✦ ${escapeHtml(d.note)}</div>`;const button=article.querySelector('.map-toggle'),panel=article.querySelector('.day-map');button.addEventListener('click',()=>{const willOpen=panel.hidden;panel.hidden=!willOpen;button.setAttribute('aria-expanded',String(willOpen));button.querySelector('span:last-child').textContent=willOpen?'⌃':'⌄';if(willOpen){const iframe=panel.querySelector('iframe');if(!iframe.src)iframe.src=iframe.dataset.src}});dayRoot.append(article)});

const food={hcm:[
['Phở Cầu Dừa','越南牛肉河粉','4.3','₫40–100k','Pho Cau Dua 251 Ben Van Don Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/pho-bo-cau-dua'],
['Phở Mong','越南河粉','4.6','₫30–100k','Pho Mong 242 Khanh Hoi Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/pho-mong-khanh-hoi'],
['Tippy’s Mexican Food','墨西哥菜','4.6','₫100–200k','Tippys Mexican Food 99 Duong 45 Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/tippy-s-mexican-food-99-duong-so-45'],
['Bún Bò Huế 14B','顺化牛肉米线','4.2','约 ₫50–70k','Bun Bo Hue 14B Duong 46 Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/bun-bo-hue-14b'],
['Cậu Cháo','越式蚝粥','4.4','₫32–42k','Cau Chao 65 Hoang Dieu Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/cau-chao-quan-chao-hau-sua'],
['NGUYEN’S','亚洲融合','4.5','约 ₫300–400k','NGUYENS 107 Ben Van Don Ho Chi Minh',''],
['Bún Thịt Nướng Chị Tuyền','越式烤肉米线','4.4','₫30–66k','Bun Thit Nuong Chi Tuyen 175C Co Giang Ho Chi Minh','https://shopeefood.vn/ho-chi-minh/chi-tuyen-bun-thit-nuong'],
['De Tham Restaurant','越南菜／素食','4.9','₫100–300k','De Tham Restaurant 258 De Tham Ho Chi Minh',''],
['Vo Roof','越南菜／屋顶餐厅','4.6','₫100–200k','Vo Roof 113 Ton That Dam Ho Chi Minh','https://www.foody.vn/ho-chi-minh/vo-roof-garden-nha-hang-viet'],
['Hai’s Restaurant','越南菜／素食','4.9','₫100–300k','Hais Restaurant 257 Ly Tu Trong Ho Chi Minh','https://haisrestaurant.com/wp-content/uploads/2025/10/10-Menu-A4-Hai-257-LTT-da-nen.pdf'],
['Uchi Sushi','日式寿司／刺身','Foody：149 条评价','约 ₫200–300k','Uchi Sushi 14 Duong 45 District 4 Ho Chi Minh','https://www.foody.vn/ho-chi-minh/uchi-sushi'],
['Gami Sushi','日式寿司／卷物','Foody 9.1/10','约 ₫120–250k','Gami Sushi 224 Lo J Hoang Dieu District 4 Ho Chi Minh','https://www.foody.vn/ho-chi-minh/gami-sushi-hoang-dieu']],dalat:[
['Nam Phương Viet Kitchen','越南家常饭','4.8','₫100k 内','Nam Phuong Viet Kitchen 7/2 Ba Trieu Da Lat',''],
['Phở Ân','牛肉河粉','4.9','₫100k 内','Pho An 23/5 Tran Phu Da Lat','https://www.foody.vn/lam-dong/pho-an-tran-phu'],
['Bina Bina','越式蒸汽菜','4.9','₫200–300k','Bina Bina 30 Huynh Thuc Khang Da Lat',''],
['Tiệm ăn Đà Lạt Phố','越南家常菜','4.7','₫100–200k','Tiem an Da Lat Pho 38 Tang Bat Ho',''],
['Góc Hà Thành','河内风味','4.4','₫100–200k','Goc Ha Thanh 51 Truong Cong Dinh Da Lat','https://www.foody.vn/lam-dong/goc-ha-thanh-mon-ngon-ha-noi'],
['Nếp Asian Kitchen & Bar','亚洲融合','4.9','₫100–200k','Nep Asian Kitchen Bar 79 Truong Cong Dinh Da Lat',''],
['Bò Né Dã Quỳ','铁板牛肉／煎蛋','4.8','₫100–200k','Bo Ne Da Quy 119 Phan Dinh Phung Da Lat','https://shopeefood.vn/lam-dong/bo-ne-da-quy'],
['Trang’s Cookery','越南菜／早午餐','4.8','₫200–300k','Trangs Cookery 211 Phan Dinh Phung Da Lat','https://www.foody.vn/lam-dong/trang-s-cookery'],
['Vị Cuisine','越南菜','4.8','₫200–500k','Vi Cuisine 64 Huyen Tran Cong Chua Da Lat',''],
['Cơm Gà Hoàng Diệu','越式鸡饭','4.2','₫10–35k 菜品','Com Ga Hoang Dieu 2 Hoang Dieu Da Lat','https://shopeefood.vn/lam-dong/com-ga-hoang-dieu'],
['Carrot Restaurant','法式／欧式家常菜','Foody 7.4/10','约 ₫150–250k','Carrot Restaurant 36 Ba Trieu Da Lat','https://www.foody.vn/lam-dong/carrot-restaurant-mon-au-gia-viet'],
['Le Chalet Dalat','法式／越式小馆','Foody 7.4/10','约 ₫120–250k','Le Chalet Dalat 6 Huynh Thuc Khang Da Lat','https://www.foody.vn/lam-dong/le-chalet-dalat-nha-hang-phap']]
};
function renderFood(city){const data=food[city];document.getElementById('foodCards').innerHTML=data.map((r,i)=>`<article class="food-card"><div class="food-top"><h3>${String(i+1).padStart(2,'0')} · <a href="${mapQuery(r[4])}" target="_blank" rel="noopener">${escapeHtml(r[0])} ↗</a></h3><span class="star">★ ${escapeHtml(r[2])}</span></div><p>${escapeHtml(r[1])} · <span class="price">${escapeHtml(r[3])} / 人</span></p>${r[5]?`<a class="source" target="_blank" rel="noopener" href="${r[5]}">查看本地平台／菜单 ↗</a>`:'<span class="source">价格参考 Google 地图</span>'}</article>`).join('');const h=city==='hcm';document.getElementById('foodHcmBtn').setAttribute('aria-selected',String(h));document.getElementById('foodDalatBtn').setAttribute('aria-selected',String(!h))}document.getElementById('foodHcmBtn').addEventListener('click',()=>renderFood('hcm'));document.getElementById('foodDalatBtn').addEventListener('click',()=>renderFood('dalat'));renderFood('hcm');

const hour=Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Ho_Chi_Minh',hour:'numeric',hour12:false}).format(new Date()));if(hour>=19||hour<6)document.documentElement.classList.add('night');
