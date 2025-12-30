/* ========= MITM_Entry.js ========= */
/* TikTok Protobuf MITM Entry */

(function () {
  try {
    if (!$response || !$response.bodyBytes) {
      return $done({});
    }

    /* ---- RAW BINARY ---- */
    let raw = new Uint8Array($response.bodyBytes);

    /* ---- DECODE ---- */
    let decoded;
    try {
      decoded = decodeBinary(raw);
    } catch (e) {
      // Decode fail → trả nguyên gốc
      return $done({ bodyBytes: raw.buffer });
    }

    if (!decoded || typeof decoded !== "object") {
      return $done({ bodyBytes: raw.buffer });
    }

    /* ---- STRIP / DOWNGRADE ADS ---- */
    try {
      stripAds(decoded);
    } catch (e) {
      // Strip lỗi → trả gốc để tránh crash
      return $done({ bodyBytes: raw.buffer });
    }

    /* ---- ENCODE BACK ---- */
    let out;
    try {
      out = encodeBinary(decoded);
    } catch (e) {
      // Encode fail → trả gốc
      return $done({ bodyBytes: raw.buffer });
    }

    /* ---- DONE ---- */
    return $done({ bodyBytes: out.buffer });

  } catch (err) {
    // Ultimate fallback
    return $done({});
  }
})();
