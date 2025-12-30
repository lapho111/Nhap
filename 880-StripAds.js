/* ========= StripAds.js ========= */
/* TikTok Native Ads Heuristic + Strip / Downgrade */

const REMOVE_AD = false; 
// true  = xóa hẳn node (splice)
// false = downgrade (ẩn label, giữ feed mượt)

/* ========= Utils ========= */

function decodeIfBinary(v) {
  if (v instanceof Uint8Array) {
    try {
      return new TextDecoder("utf-8").decode(v);
    } catch {
      return null;
    }
  }
  return v;
}

function hasBigIntLike(v) {
  return (
    typeof v === "bigint" ||
    (typeof v === "number" && v > 1e12)
  );
}

/* ========= Core Heuristic ========= */

function isTikTokAd(node, downgradeOps) {
  let score = 0;

  iterateNode(node, (v, p, k) => {
    if (!p) return;

    v = decodeIfBinary(v);
    if (v == null) return;

    /* ---- STRING ---- */
    if (typeof v === "string") {
      let s = v.toLowerCase();

      // Heavy ad labels
      if (
        s.includes("sponsored") ||
        s.includes("promoted") ||
        s.includes("advertisement")
      ) {
        score += 3;
        downgradeOps.push({ p, k, type: "text" });
      }

      // CTA buttons
      if (
        s.includes("shop_now") ||
        s.includes("shop now") ||
        s.includes("get_quote") ||
        s.includes("get quote") ||
        s.includes("view_now") ||
        s.includes("view now")
      ) {
        score += 2;
        downgradeOps.push({ p, k, type: "text" });
      }

      // Commerce signal
      if (s.includes("product") && /\d{10,}/.test(s)) {
        score += 3;
      }

      // URL là tín hiệu mạnh
      if (/https?:\/\//.test(s)) {
        score += 2;
      }
    }

    /* ---- BIG ID ---- */
    if (hasBigIntLike(v) && /ad|campaign|promo|product/i.test(k)) {
      score += 2;
      downgradeOps.push({ p, k, type: "id" });
    }

    /* ---- FLAG ---- */
    if (
      typeof v === "boolean" &&
      /is_ad|ad_flag|sponsored|promo/i.test(k)
    ) {
      score += 2;
      downgradeOps.push({ p, k, type: "flag" });
    }
  });

  // Ngưỡng an toàn
  return score >= 6;
}

/* ========= Strip / Downgrade ========= */

function stripAds(root) {
  if (!root || typeof root !== "object") return;

  iterateNode(root, (node, parent, key) => {
    if (!parent || !Array.isArray(parent)) return;
    if (!node || typeof node !== "object") return;

    let downgradeOps = [];

    if (!isTikTokAd(node, downgradeOps)) return;

    /* ---- REMOVE ---- */
    if (REMOVE_AD) {
      parent.splice(key, 1);
      return;
    }

    /* ---- DOWNGRADE ---- */
    for (let i = 0; i < downgradeOps.length; i++) {
      const { p, k, type } = downgradeOps[i];
      if (!p) continue;

      if (type === "text") p[k] = "";
      else if (type === "flag") p[k] = false;
      else if (type === "id") p[k] = 0;
    }
  });
}

/* ========= EXPORT ========= */
this.stripAds = stripAds;
