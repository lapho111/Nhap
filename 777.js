/* TikTok_Combined.js - Ultimate Version */
const REMOVE_AD = true; 
const _td = new TextDecoder("utf-8");

// --- 1. ProtoCore (Giữ nguyên engine ổn định) ---
function decodeBinary(buf) {
  try {
    let out = {}; let pos = 0;
    while (pos < buf.length) {
      let tag = readVarint(buf, () => pos++);
      let field = Number(tag >> 3n), wire = Number(tag & 7n);
      if (!out[field]) out[field] = [];
      if (wire === 0) out[field].push(readVarint(buf, () => pos++));
      else if (wire === 2) {
        let len = Number(readVarint(buf, () => pos++));
        let slice = buf.slice(pos, pos + len);
        pos += len;
        if (len > 0) { try { out[field].push(decodeBinary(slice)); } catch { out[field].push(slice); } }
      } else if (wire === 1 || wire === 5) pos += (wire === 1 ? 8 : 4);
      else break;
    }
    return out;
  } catch { return null; }
}
function readVarint(buf, inc) {
  let res = 0n, shift = 0n;
  while (true) {
    let b = buf[inc()];
    res |= BigInt(b & 0x7f) << shift;
    if (!(b & 0x80)) break;
    shift += 7n;
  }
  return res;
}
function encodeBinary(obj) {
  let parts = [];
  for (let f in obj) {
    let field = Number(f);
    for (let v of obj[f]) {
      if (typeof v === "bigint" || typeof v === "number") {
        parts.push(encodeUint32((field << 3) | 0));
        parts.push(encodeVarint(v));
      } else if (v instanceof Uint8Array) {
        parts.push(encodeUint32((field << 3) | 2));
        parts.push(encodeUint32(v.length));
        parts.push(v);
      } else if (typeof v === "object") {
        let nested = encodeBinary(v);
        parts.push(encodeUint32((field << 3) | 2));
        parts.push(encodeUint32(nested.length));
        parts.push(nested);
      }
    }
  }
  return concatUint8(parts);
}
function encodeUint32(v) {
  let b = []; while (v >= 0x80) { b.push((v & 0x7f) | 0x80); v >>>= 7; }
  b.push(v); return new Uint8Array(b);
}
function encodeVarint(v) {
  let n = BigInt(v), b = [];
  while (n >= 128n) { b.push(Number((n & 0x7fn) | 0x80n)); n >>= 7n; }
  b.push(Number(n)); return new Uint8Array(b);
}
function concatUint8(arrs) {
  let len = arrs.reduce((a, b) => a + b.length, 0);
  let out = new Uint8Array(len), off = 0;
  for (let a of arrs) { out.set(a, off); off += a.length; }
  return out;
}

// --- 2. AdHeuristic (Quét sâu vô tận) ---
function decodeIfBinary(v) {
  if (v instanceof Uint8Array) { try { return _td.decode(v); } catch { return null; } }
  return v;
}

function isTikTokAd(node) {
  let score = 0;
  let hasFound = false;

  // Hàm quét đệ quy tìm dấu hiệu Ad
  function deepSearch(obj) {
    if (!obj || typeof obj !== "object") return;
    for (let k in obj) {
      let v = obj[k];
      
      // Kiểm tra Key định danh Ad
      if (/ad_id|creative_id|campaign_id|is_ads|is_sponsored|anchor_type|shop_id|product_id|business_context/i.test(k)) {
        score += 3;
      }

      let decoded = decodeIfBinary(v);
      if (typeof decoded === "string") {
        let s = decoded.toLowerCase();
        // Kiểm tra Nhãn (Tất cả từ khóa bạn đã liệt kê)
        if (/sponsored|promoted|advertisement|广告|được tài trợ|đối tác quan hệ trả phí|paid partnership|branded content|giỏ hàng|tiktok shop|mua tại đây|liên kết sản phẩm|đang phát trực tiếp|livestream|phòng live/i.test(s)) {
          score += 5;
        }
        // Nút Shop/Affiliate
        if (/shop[ _]now|learn[ _]more|install[ _]now|mua ngay|tìm hiểu thêm|xem chi tiết|liên kết/i.test(s)) {
          score += 2;
        }
      } else if (typeof v === "object") {
        deepSearch(v);
      }
    }
  }

  deepSearch(node);
  return score >= 3; // Ngưỡng cực thấp để bắt cho hết
}

// --- 3. StripAds (Xử lý mảng Feed) ---
function stripAds(root) {
  if (!root || typeof root !== "object") return;
  // TikTok Feed thường là mảng ở field 1 hoặc 2 (tùy vùng)
  for (let key in root) {
    let list = root[key];
    if (Array.isArray(list)) {
      for (let i = list.length - 1; i >= 0; i--) {
        if (isTikTokAd(list[i])) {
          if (REMOVE_AD) list.splice(i, 1); // Xóa hẳn video đó
        }
      }
    } else if (typeof list === "object") {
      stripAds(list);
    }
  }
}

// --- 4. Entry ---
(function () {
  try {
    if (typeof $response === "undefined" || !$response.bodyBytes) return $done({});
    let raw = new Uint8Array($response.bodyBytes);
    let decoded = decodeBinary(raw);
    if (decoded) {
      stripAds(decoded);
      let out = encodeBinary(decoded);
      $done({ bodyBytes: out.buffer });
    } else $done({ bodyBytes: raw.buffer });
  } catch (e) { $done({}); }
})();
