/*
 * TeraBox – Clean Block (Ads + Paywall)
 * - Không fake VIP
 * - Không đụng membership
 * - Vô hiệu logic Premium / Paywall
 * - Chặn quảng cáo gốc JSON
 */

const url = $request.url;

if (!$response || !$response.body) {
  $done({});
}

let obj;
try {
  obj = JSON.parse($response.body);
} catch {
  $done({});
}

/* =========================
   1. CHẶN AD CONFIG / AD FEED
========================= */
if (
  url.includes("/adx") ||
  url.includes("/getad") ||
  url.includes("/ad/get") ||
  url.includes("/advert") ||
  url.includes("/commercial")
) {
  if (obj.data) obj.data = [];
  if (obj.ads) obj.ads = [];
  if (obj.ad) obj.ad = null;
  if (obj.ad_info) obj.ad_info = null;
  if (obj.ad_config) obj.ad_config = null;
  if (obj.adConfig) obj.adConfig = null;
  if (obj.status !== undefined) obj.status = 0;
}

/* =========================
   2. LỌC ITEM QUẢNG CÁO TRONG LIST
========================= */
const cleanList = list =>
  Array.isArray(list)
    ? list.filter(i =>
        !i?.is_ad &&
        !i?.ad_type &&
        !i?.adInfo &&
        !i?.ad_info &&
        !i?.commercial
      )
    : list;

if (obj.list) obj.list = cleanList(obj.list);
if (obj.data?.list) obj.data.list = cleanList(obj.data.list);

/* =========================
   3. ẨN TAB / ENTRY PREMIUM
========================= */
const dropPremiumTab = arr =>
  Array.isArray(arr)
    ? arr.filter(t =>
        !/vip|premium|member|pro|upgrade/i.test(
          t?.id || t?.type || t?.name || t?.title || ""
        )
      )
    : arr;

if (obj.tab_list) obj.tab_list = dropPremiumTab(obj.tab_list);
if (obj.bottom_tabs) obj.bottom_tabs = dropPremiumTab(obj.bottom_tabs);
if (obj.entry) obj.entry = dropPremiumTab(obj.entry);

/* =========================
   4. TẮT POPUP / DIALOG ÉP VIP
========================= */
obj.popup = null;
obj.popups = [];
obj.dialog = null;
obj.paywall = null;
obj.upsell = null;
obj.vip_entry = null;
obj.premium_entry = null;

/* =========================
   5. VÔ HIỆU LOGIC PAYWALL (QUAN TRỌNG)
========================= */
const killPaywall = o => {
  if (!o || typeof o !== "object") return;

  for (const k in o) {
    if (
      /need_vip|vip_only|paywall|premium|upgrade|limit|locked|max_rate|speed_limit/i.test(
        k
      )
    ) {
      if (typeof o[k] === "boolean") o[k] = false;
      if (typeof o[k] === "number") o[k] = 0;
      if (typeof o[k] === "string") o[k] = "";
    }

    if (typeof o[k] === "object") {
      killPaywall(o[k]);
    }
  }
};

killPaywall(obj);

/* =========================
   6. MỞ PLAYBACK RATE (NẾU PLAYER CHO)
========================= */
const enableRate = o => {
  if (!o || typeof o !== "object") return;

  if (o.playback || o.player || o.video) {
    const p = o.playback || o.player || o.video;
    p.enable_playback_rate = true;
    p.rate_locked = false;
    p.playback_rates = [0.5, 0.75, 1.0, 1.25];
  }

  for (const k in o) {
    if (typeof o[k] === "object") enableRate(o[k]);
  }
};

enableRate(obj);

/* =========================
   7. KHÔNG ĐỤNG PREMIUM THẬT
========================= */
// KHÔNG sửa:
// vip, is_vip, membership, privilege, product

$done({ body: JSON.stringify(obj) });
