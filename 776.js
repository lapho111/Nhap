/*
 * TeraBox – Clean Ad Block
 * - Chặn quảng cáo từ gốc (JSON)
 * - Không fake VIP
 * - Không động membership / privilege
 * - Tránh màn đen, tránh timeout
 */

const url = $request.url;

if (!$response || !$response.body) {
  $done({});
}

let obj;
try {
  obj = JSON.parse($response.body);
} catch (e) {
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
  // các dạng ads phổ biến
  if (obj.data) obj.data = [];
  if (obj.ads) obj.ads = [];
  if (obj.ad) obj.ad = null;
  if (obj.ad_info) obj.ad_info = null;
  if (obj.ad_config) obj.ad_config = null;
  if (obj.adConfig) obj.adConfig = null;

  // một số API dùng status
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
   3. TẮT POPUP ÉP XEM ADS / MUA VIP
========================= */
if (obj.popup) obj.popup = null;
if (obj.popups) obj.popups = [];
if (obj.dialog) obj.dialog = null;

/* =========================
   4. KHÔNG ĐỘNG PREMIUM
========================= */
// Cố tình KHÔNG sửa:
// vip, is_vip, membership, privilege, product

$done({ body: JSON.stringify(obj) });
