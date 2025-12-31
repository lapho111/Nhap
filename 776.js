/*
 * TeraBox – Clean Ad Block + Hide Premium Tab
 * - Chặn quảng cáo từ gốc (JSON)
 * - Ẩn tab / banner mua Premium
 * - Không fake VIP
 */

const url = $request.url;

if (!$response || !$response.body) {
  $done({});
}

let obj;
try {
  obj = JSON.parse($response.body);
} catch (e) {
  // Không phải JSON thì bỏ qua
  $done({});
}

/* =========================
   1. CHẶN AD CONFIG / FEED
========================= */
if (
  url.includes("/adx") ||
  url.includes("/getad") ||
  url.includes("/ad/get") ||
  url.includes("/advert") ||
  url.includes("/commercial") ||
  url.includes("/feed") ||
  url.includes("/home")
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
if (Array.isArray(obj.list)) {
  obj.list = obj.list.filter(item =>
    !item.is_ad &&
    !item.ad_type &&
    !item.adInfo &&
    !item.ad_info
  );
}

/* =========================
   3. TẮT POPUP ÉP MUA PREMIUM
========================= */
if (obj.popup) obj.popup = null;
if (obj.popups) obj.popups = [];
if (obj.dialog) obj.dialog = null;
if (obj.paywall) obj.paywall = null;
if (obj.upsell) obj.upsell = null;

/* =========================
   4. ẨN TAB / ENTRY PREMIUM
========================= */

// Bottom tab
if (Array.isArray(obj.tab_list)) {
  obj.tab_list = obj.tab_list.filter(t =>
    !/vip|premium|member|pro|upgrade/i.test(
      t.id || t.type || t.title || ""
    )
  );
}

// Một số bản dùng bottom_tabs
if (Array.isArray(obj.bottom_tabs)) {
  obj.bottom_tabs = obj.bottom_tabs.filter(t =>
    !/vip|premium|member|pro|upgrade/i.test(
      t.id || t.type || t.title || ""
    )
  );
}

// Entry / feature
if (Array.isArray(obj.entry)) {
  obj.entry = obj.entry.filter(e =>
    !/vip|premium|member|pro|upgrade/i.test(
      e.id || e.type || e.name || ""
    )
  );
}

// Banner upsell
if (obj.vip_entry) obj.vip_entry = null;
if (obj.premium_entry) obj.premium_entry = null;

/* =========================
   5. KHÔNG ĐỘNG PREMIUM
========================= */
// Cố tình KHÔNG sửa:
// vip, is_vip, membership, privilege, product

$done({ body: JSON.stringify(obj) });
