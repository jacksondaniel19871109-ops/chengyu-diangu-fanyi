const main = document.querySelector("main");
let stories = [];

// A few source files do not include an English title. These editorial titles keep
// the catalogue bilingual without changing the imported corpus text.
const fallbackTitles = {
  "II-1-澶х娌绘按": "Yu the Great Controlling the Floods",
  "II-2-娑傚北浼氱洘": "Alliance at Mount Tu",
  "鎵侀箠娌荤梾": "Bian Que Treating Illness",
  "钄″コ鑽¤垷": "The Cai Woman鈥檚 Boat Ride",
  "闄堥獔濂旇枦": "Chen Pian Flees to Xue",
  "鍩庢慨涔嬫垬": "The Battle of Chengpu",
  "妤氬簞鐜嬩笉鍑绘檵": "King Zhuang of Chu Declines to Attack Jin",
  "妤氬簞鐜嬫嫆缁濊鎯?: "King Zhuang of Chu Resists Temptation",
  "娣充簬楂¤榄忕帇": "Chunyu Kun Advises the King of Wei",
  "澶уか绉嶇煡寮鸿秺": "Minister Zhong Knows Yue鈥檚 Strength",
  "鏇存柊-澶х帇浜剁埗灞呴偁": "King Danfu Dwells in Bin",
  "绠″瓙褰掗綈": "Guan Zhong Returns to Qi",
  "娴?: "The Sea, the Great, and the Fish",
  "妗撳叕寰楀畞鎴?: "Duke Huan Finds Ning Qi",
  "妗撳叕璇讳功浜庡爞涓?: "Duke Huan Reads in the Hall",
  "榛勯緳璐熻垷": "A Yellow Dragon Bears the Boat",
  "鎯犲瓱瑙佸畫搴风帇": "Hui Meng Meets King Kang of Song",
  "鎯犳柦绔嬫硶": "Hui Shi Enacts Laws",
  "鏅嬫枃鍏紣鍘?: "Duke Wen of Jin Attacks Yuan",
  "椴佷汉棰滈槚": "Yan He of Lu",
  "鍥氱缇戦噷": "Imprisoned at Youli",
  "涓夊鐏櫤浼紙涓ょ瘒锛?: "Three Families Destroy Zhi Bo",
  "甯堟椃纰庣惔锛堜袱绡囷級": "Shi Kuang Smashes the Zither",
  "鍙斿瓩娆轰簬绔栫墰": "Shusun Deceived by Shuniu",
  "瀛欏彅鏁栦笁鎬?: "Sun Shuao and Three Resentments",
  "澶叕璋堟不鍥?: "The Duke of Zhou and Taigong on Governing",
  "鐢伴獔璇撮綈鐜?: "Tian Pian Advises the King of Qi",
  "鐢版皬浠ｉ綈": "The Tian Clan Replaces Qi",
  "榄忔渚棶鏉庡厠": "Marquis Wu of Wei Questions Li Ke",
  "鏂囩帇鐮ュ痉淇斂": "King Wen Cultivates Virtue and Reforms Governance",
  "闂斂灏逛綒": "King Cheng Asks Yin Yi About Governance",
  "涔岄箠涔嬫櫤": "The Wisdom of Crows and Magpies",
  "浜旈煶娌诲浗": "Governing with the Five Tones",
  "姝︾帇鍏嬫": "King Wu Conquers Yin",
  "姝︾帇鍏嬫2-3": "King Wu Conquers Yin (Parts Two and Three)",
  "姝︾帇鍏嬫4": "King Wu Conquers Yin (Part Four)",
  "姝︾帇闂お鍏?: "King Wu Questions Taigong",
  "澶忔娈风海": "Xia Jie and Yin Zhou",
  "寰愬亙鐜嬭浠佷箟": "King Yan of Xu Practices Benevolence and Righteousness",
  "鏅忓┐鏁欏お鍗?: "Yan Ying Teaches the Grand Diviner",
  "涓€韬笁鍙?: "One Person, Three Transformations",
  "浼婂肮璐熼紟": "Yi Yin Carries the Cauldron",
  "浼婂肮鍏村湡鍔?: "Yi Yin Mobilizes Labor for Earthworks",
  "閮戝瓙闃冲ソ缃?: "Zheng Ziyang Loves Punishment",
  "閲嶈€虫祦浜¤繃鏇癸紙鏈変袱绡囷級": "Chong'er Passes Through Cao in Exile",
  "鍛ㄥ叕鎽勬斂": "The Duke of Zhou Acts as Regent",
  "鍛ㄥ叕鎽勬斂2": "The Duke of Zhou Acts as Regent (Part Two)",
  "瀛愯矾浠ュ媷姝?: "Zilu Dies for His Courage"
};
const titleOverrides = {
  "姝︾帇鍏嬫2-3": "姝︾帇鍏嬫锛堢浜屻€佷笁鍒欙級",
  "姝︾帇鍏嬫4": "姝︾帇鍏嬫锛堢鍥涘垯锛?
};

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
const paragraphs = values => values?.filter(Boolean).map(value => `<p>${escapeHtml(value)}</p>`).join("") || "<p>姝ゆ爮鍦ㄥ師濮嬫枃妗ｄ腑鏈彁渚涖€?/p>";

function renderHome(query = "") {
  const term = query.trim().toLowerCase();
  const filtered = stories.filter(story => [story.titleZh, story.titleEn, story.sourceFile].join(" ").toLowerCase().includes(term));
  main.innerHTML = `
    <section class="hero">
      <p class="eyebrow">HUAINAN NORMAL UNIVERSITY 路 BILINGUAL CORPUS</p>
      <h1>鎴愯鍏告晠缈昏瘧</h1>
      <p>姹囬泦涓浗鍙や唬鍏告晠鐨勫師鏂囥€佷粖璇戜笌鑻辫瘧锛屼緵鏁欏銆佺爺绌跺拰璺ㄦ枃鍖栭槄璇讳娇鐢ㄣ€?/p>
      <label class="search-bar"><input id="search" type="search" placeholder="鎼滅储涓枃棰樺悕銆佽嫳鏂囬鍚嶆垨鏂囦欢鍚? value="${escapeHtml(query)}" aria-label="鎼滅储璇枡" /></label>
      <p class="count">鍏?${stories.length} 绡囪鏂欙紝褰撳墠鏄剧ず ${filtered.length} 绡?/p>
    </section>
    <section class="story-grid" aria-label="璇枡鐩綍">${filtered.map(story => `
      <a class="story-card" href="#/story/${encodeURIComponent(story.id)}">
        <div><h2>${escapeHtml(story.titleZh)}</h2>${story.titleEn ? `<p>${escapeHtml(story.titleEn)}</p>` : ""}</div>
        <span>闃呰璇枡 鈫?/span>
      </a>`).join("") || '<p class="empty">娌℃湁鎵惧埌鍖归厤鐨勮鏂欍€?/p>'}
    </section>`;
  document.querySelector("#search")?.addEventListener("input", event => renderHome(event.target.value));
}

function renderStory(id) {
  const story = stories.find(item => item.id === id);
  if (!story) { main.innerHTML = '<p class="empty">鏈壘鍒拌繖绡囪鏂欍€?a href="#/">杩斿洖鐩綍</a></p>'; return; }
  const sections = story.sections.map((section, index) => `
    <section class="reading-section">
      ${section.heading ? `<h2 class="section-title">${escapeHtml(section.heading)}</h2>` : (story.sections.length > 1 ? `<h2 class="section-title">绗?${index + 1} 鍒?/h2>` : "")}
      <div class="translation-stack">
        <article class="translation-card"><h3>鍘熸枃</h3>${paragraphs(section.original)}</article>
        <article class="translation-card"><h3>浠婅瘧</h3>${paragraphs(section.modern)}</article>
        <article class="translation-card english"><h3>鑻辫瘧</h3>${paragraphs(section.english)}</article>
      </div>
      ${section.notes?.length ? `<aside class="notes"><h3>鍑哄涓庢敞閲?/h3>${paragraphs(section.notes)}</aside>` : ""}
    </section>`).join("");
  main.innerHTML = `
    <a class="back-link" href="#/">鈫?杩斿洖璇枡鐩綍</a>
    <header class="story-heading"><p class="eyebrow">BILINGUAL CLASSICS</p><h1>${escapeHtml(story.titleZh)}</h1>${story.titleEn ? `<p class="english-title">${escapeHtml(story.titleEn)}</p>` : ""}<p class="source-file">鍘熷鏂囦欢锛?{escapeHtml(story.sourceFile)}</p></header>
    ${sections}`;
}

function route() {
  const match = location.hash.match(/^#\/story\/(.+)$/);
  if (match) renderStory(decodeURIComponent(match[1])); else renderHome();
  window.scrollTo({ top: 0, behavior: "instant" });
}

if (Array.isArray(window.STORIES)) {
  stories = window.STORIES.map(story => ({ ...story, titleZh: titleOverrides[story.id] || story.titleZh, titleEn: story.titleEn || fallbackTitles[story.id] || "" }));
  route();
} else {
  main.innerHTML = '<p class="empty">璇枡鏁版嵁鏈姞杞姐€傝纭 data/stories.js 涓?index.html 浣嶄簬鍚屼竴缃戠珯鐩綍銆?/p>';
}
window.addEventListener("hashchange", route);

