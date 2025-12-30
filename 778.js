const REMOVE_AD = false;
const _td = new TextDecoder("utf-8");
function decodeBinary(buf) {
  try {
    let out = {};
    let pos = 0;
    while (pos < buf.length) {
      let tag = readVarint(buf, () => pos++);
      let field = Number(tag >> 3n);
      let wire = Number(tag & 7n);
      if (!out[field]) out[field] = [];

      if (wire === 0) {
        out[field].push(readVarint(buf, () => pos++));
      } else if (wire === 2) {
        let len = Number(readVarint(buf, () => pos++));
        let slice = buf.slice(pos, pos + len);
        pos += len;
        if (len > 8) {
          try {
            out[field].push(decodeBinary(slice));
          } catch {
            out[field].push(slice);
          }
        } else {
          out[field].push(slice);
        }
      } else {
        break;
      }
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
  let b = [];
  while (v >= 0x80) { b.push((v & 0x7f) | 0x80); v >>>= 7; }
  b.push(v);
  return new Uint8Array(b);
}
function encodeVarint(v) {
  let n = BigInt(v), b = [];
  while (n >= 128n) { b.push(Number((n & 0x7fn) | 0x80n)); n >>= 7n; }
  b.push(Number(n));
  return new Uint8Array(b);
}
function concatUint8(arrs) {
  let len = arrs.reduce((a, b) => a + b.length, 0);
  let out = new Uint8Array(len), off = 0;
  for (let a of arrs) { out.set(a, off); off += a.length; }
  return out;
}
function iterateNode(node, cb, parent = null, key = null) {
  cb(node, parent, key);
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) iterateNode(node[i], cb, node, i);
  } else if (node && typeof node === "object") {
    for (let k in node) iterateNode(node[k], cb, node, k);
  }
}
function decodeIfBinary(v) {
  if (v instanceof Uint8Array) {
    try { return _td.decode(v); } catch { return null; }
  }
  return v;
}
function hasBigIntLike(v) {
  return typeof v === "bigint" || (typeof v === "number" && v > 1e12);
}
function isTikTokAd(node, downgradeOps) {
  let score = 0;
  iterateNode(node, (v, p, k) => {
    if (!p) return;
    let decodedV = decodeIfBinary(v);
    if (decodedV == null) return;
    if (typeof decodedV === "string") {
      let s = decodedV.toLowerCase();
      if (s.includes("sponsored") || s.includes("promoted") || s.includes("advertisement")) {
        score += 3;
        downgradeOps.push({ p, k, type: "text" });
      }
      if (/shop[ _]now|get[ _]quote|view[ _]now|learn[ _]more|install[ _]now/i.test(s)) {
        score += 2;
        downgradeOps.push({ p, k, type: "text" });
      }
      if (s.includes("product") && /\d{10,}/.test(s)) score += 3;
      if (/https?:\/\//.test(s)) score += 2;
    }
    if (hasBigIntLike(v) && /ad|campaign|promo|product/i.test(k)) {
      score += 2;
      downgradeOps.push({ p, k, type: "id" });
    }
    if (typeof v === "boolean" && /is_ad|ad_flag|sponsored|promo/i.test(k)) {
      score += 2;
      downgradeOps.push({ p, k, type: "flag" });
    }
  });
  return score >= 6;
}
function stripAds(root) {
  if (!root || typeof root !== "object") return;
  iterateNode(root, (node, parent, key) => {
    if (!parent || !Array.isArray(parent)) return;
    if (!node || typeof node !== "object") return;

    let downgradeOps = [];
    if (!isTikTokAd(node, downgradeOps)) return;

    if (REMOVE_AD) {
      parent.splice(key, 1);
    } else {
      for (let op of downgradeOps) {
        const { p, k, type } = op;
        if (type === "text") p[k] = "";
        else if (type === "flag") p[k] = false;
        else if (type === "id") p[k] = 0;
      }
    }
  });
}
(function () {
  try {
    if (typeof $response === "undefined" || !$response.bodyBytes) return $done({});
    
    let raw = new Uint8Array($response.bodyBytes);
    let decoded = decodeBinary(raw);

    if (decoded) {
      stripAds(decoded);
      try {
        let out = encodeBinary(decoded);
        $done({ bodyBytes: out.buffer });
      } catch (e) {
        $done({ bodyBytes: raw.buffer });
      }
    } else {
      $done({ bodyBytes: raw.buffer });
    }
  } catch (err) {
    $done({});
  }
})();
