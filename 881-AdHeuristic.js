/* ========= TikTok_AdHeuristic.js ========= */
/* Heuristic nhận diện quảng cáo TikTok – bản cập nhật đầy đủ theo góp ý */

/* Keyword nặng: dính là gần như chắc Ads */
const STRONG_KEYS = [
  "sponsored",
  "advertisement",
  "ad_id",
  "is_ad",
  "paid_promotion",
  "promoted",
  "promotion_info",
  "brand_ad",
  "ad_label"
];

/* Keyword nhẹ: cộng điểm */
const SOFT_KEYS = [
  "sale",
  "shop",
  "buy",
  "product",
  "discount",
  "deal",
  "offer",
  "coupon",
  "link in bio"
];

/* CTA button thường gặp trong Ads */
const CTA_KEYS = [
  "shop_now",
  "get_quote",
  "view_now",
  "learn more",
  "install now",
  "buy now"
];

/* ========= API dựa vào ProtoCore =========
   Yêu cầu tồn tại:
   - iterateNode
   - countUrl
   - countString
   - hasBigInt
*/

/**
 * Nhận diện quảng cáo TikTok (Safe nhưng không bỏ sót native ads)
 * @param {Object} node
 * @param {Object} opts { threshold?: number }
 * @returns {boolean}
 */
function isTikTokAd(node, opts = {}) {
  if (!node || typeof node !== "object") return false;

  const THRESHOLD = opts.threshold ?? 6;
  let score = 0;

  /* 1. Link ngoài (tracking / shop) */
  score += countUrl(node) * 2;

  /* 2. Keyword nặng (Ads metadata) */
  score += countString(node, STRONG_KEYS) * 3;

  /* 3. Keyword nhẹ (commerce text) */
  score += countString(node, SOFT_KEYS);

  /* 4. CTA button Ads */
  score += countString(node, CTA_KEYS) * 2;

  /* 5. ID lớn (Ads / Commerce payload) */
  if (hasBigInt(node)) score += 1;

  /* 6. Commerce Ads đặc trưng:
        product + số cực lớn => gần như chắc TikTok Shop Ad */
  let commerceHit = false;
  iterateNode(node, v => {
    if (typeof v === "string") {
      let s = v.toLowerCase();
      if (s.includes("product")) commerceHit = true;
    }
    if (typeof v === "bigint" || (typeof v === "number" && v > 1e15)) {
      if (commerceHit) score += 3;
    }
  });

  /* 7. Tracking / redirect dấu hiệu */
  iterateNode(node, v => {
    if (typeof v === "string") {
      let s = v.toLowerCase();
      if (s.includes("tracking") && s.includes("http")) score += 2;
    }
  });

  return score >= THRESHOLD;
}

/* Export global cho Shadowrocket */
this.isTikTokAd = isTikTokAd;
