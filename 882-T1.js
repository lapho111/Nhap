/* ========= Generic Protobuf Decoder ========= */

const _td = new TextDecoder("utf-8");

function decodeBinary(buf) {
  try {
    let out = {};
    let pos = 0;

    while (pos < buf.length) {
      let tag = readVarint(buf, () => pos++);
      let field = Number(tag >> 3);
      let wire = Number(tag & 7);
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
  } catch {
    return null;
  }
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

/* ========= Encoder ========= */

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
  while (v >= 0x80) {
    b.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  b.push(v);
  return new Uint8Array(b);
}

function encodeVarint(v) {
  let n = BigInt(v);
  let b = [];
  while (n >= 128n) {
    b.push(Number((n & 0x7fn) | 0x80n));
    n >>= 7n;
  }
  b.push(Number(n));
  return new Uint8Array(b);
}

function concatUint8(arrs) {
  let len = arrs.reduce((a, b) => a + b.length, 0);
  let out = new Uint8Array(len);
  let off = 0;
  for (let a of arrs) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}

/* ========= Utils ========= */

function iterateNode(node, cb, parent = null, key = null) {
  cb(node, parent, key);
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      iterateNode(node[i], cb, node, i);
    }
  } else if (node && typeof node === "object") {
    for (let k in node) {
      iterateNode(node[k], cb, node, k);
    }
  }
}

function countUrl(node) {
  let c = 0;
  iterateNode(node, v => {
    if (typeof v === "string" && /^https?:\/\//.test(v)) c++;
  });
  return c;
}

function countString(node, keys) {
  let c = 0;
  iterateNode(node, v => {
    let s = null;

    if (typeof v === "string") {
      s = v;
    } else if (v instanceof Uint8Array) {
      try {
        s = _td.decode(v);
      } catch {
        return;
      }
    }

    if (!s) return;
    let low = s.toLowerCase();
    for (let k of keys) {
      if (low.includes(k)) {
        c++;
        break;
      }
    }
  });
  return c;
}

function hasBigInt(node) {
  let hit = false;
  iterateNode(node, v => {
    if (typeof v === "bigint") hit = true;
    if (typeof v === "number" && v > 1e15) hit = true;
  });
  return hit;
}

/* ========= Strip Ads (SAFE MODE) ========= */

function stripAds(root) {
  iterateNode(root, (node, parent, key) => {
    if (!parent || !Array.isArray(parent)) return;
    if (!node || typeof node !== "object") return;

    let score = 0;
    score += countUrl(node) * 2;
    score += countString(node, ["sponsored", "ad_id", "advertisement", "promoted"]);
    score += countString(node, ["sale", "shop", "buy", "product"]);
    if (hasBigInt(node)) score += 1;

    if (score >= 6) {
      parent.splice(key, 1);
    }
  });
}

/* ========= MITM Entry ========= */

(function () {
  if (!$response?.bodyBytes) return $done({});
  let raw = new Uint8Array($response.bodyBytes);
  let decoded = decodeBinary(raw);
  if (!decoded) return $done({});

  stripAds(decoded);

  try {
    let out = encodeBinary(decoded);
    $done({ bodyBytes: out.buffer });
  } catch {
    $done({});
  }
})();
