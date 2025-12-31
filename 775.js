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
        !/vip|premium|member|pro|upgrade/i.t
