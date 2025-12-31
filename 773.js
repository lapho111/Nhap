/*
 * TeraBox – Block Ads + Enable 1.25x + Data Saver
 * Không giả premium
 */

const url = $request.url;
if (!$response || !$response.body) $done({});

let obj;
try {
  obj = JSON.parse($response.body);
} catch {
  $done({});
}

/* =========================
   1. CHẶN QUẢNG CÁO
========================= */
if (
  url.includes("/adx") ||
  url.includes("/getad") ||
  url.includes("/advert") ||
  url.includes("/commercial")
) {
  if (obj.data) obj.data = [];
  if (obj.ads) obj.ads = [];
  obj.status = 0;
}

/* =========================
   2. MỞ TỐC ĐỘ PHÁT 1.25x
========================= */
if (obj.playback || obj.player || obj.video) {
  const p = obj.playback || obj.player || obj.video;

  // Cho phép đổi tốc độ
  p.enable_playback_rate = true;

  // Ép danh sách tốc độ hợp lệ
  p.playback_rates = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  // Không khóa tốc độ
  p.rate_locked = false;
}

/* =========================
   3. TIẾT KIỆM DỮ LIỆU
========================= */
if (obj.streams || obj.video_streams || obj.data?.streams) {
  let streams =
    obj.streams ||
    obj.video_streams ||
    obj.data?.streams;

  if (Array.isArray(streams)) {
    // Giữ lại stream <= 720p, ưu tiên bitrate thấp
    streams = streams.filter(s =>
      (s.height && s.height <= 720) ||
      (s.bitrate && s.bitrate <= 1200000)
    );

    // Sắp xếp theo bitrate tăng dần
    streams.sort((a, b) =>
      (a.bitrate || 0) - (b.bitrate || 0)
    );
  }

  if (obj.streams) obj.streams = streams;
  if (obj.video_streams) obj.video_streams = streams;
  if (obj.data?.streams) obj.data.streams = streams;
}

/* =========================
   4. KHÔNG ĐỤNG VIP
========================= */
// Cố tình KHÔNG sửa:
// vip, is_vip, membership, privilege

$done({ body: JSON.stringify(obj) });
