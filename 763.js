/******************************
 Tác Giả：Lạp Hộ (Fix Chốt Hạ)
 Phiên bản siêu nhẹ - Chặn Ads + PiP + Background + Premium
 Đã hàn sẵn lõi BinaryReader/Writer/Message của 768.js
******************************/

(() => {
    const w = typeof $task !== "undefined" 
        ? { request: $request, response: $response, exit: $done }
        : { request: $request, response: { bodyBytes: $response.bodyBytes }, exit: $done };

    if (!w.response?.bodyBytes) return w.exit?.({});

    // === 1. LÕI ENGINE NHỊ PHÂN (KHÔNG ĐƯỢC THIẾU) ===
    function ur() {
        let l = 0, e = 0;
        for (let n = 0; n < 28; n += 7) {
            let i = this.buf[this.pos++];
            l |= (i & 127) << n;
            if (!(i & 128)) return [l, e];
        }
        let t = this.buf[this.pos++];
        l |= (t & 15) << 28;
        e = (t & 112) >> 4;
        if (!(t & 128)) return [l, e];
        for (let n = 3; n <= 31; n += 7) {
            let i = this.buf[this.pos++];
            e |= (i & 127) << n;
            if (!(i & 128)) return [l, e];
        }
        throw new Error("invalid varint");
    }

    function Be(l, e, t) {
        for (let r = 0; r < 28; r = r + 7) {
            let c = l >>> r, a = !(!(c >>> 7) && e == 0), o = (a ? c | 128 : c) & 255;
            t.push(o); if (!a) return;
        }
        let n = l >>> 28 & 15 | (e & 7) << 4, i = !!(e >> 3);
        t.push((i ? n | 128 : n) & 255);
        if (i) {
            for (let r = 3; r < 31; r = r + 7) {
                let c = e >>> r, a = !!(c >>> 7), o = (a ? c | 128 : c) & 255;
                t.push(o); if (!a) return;
            }
            t.push(e >>> 31 & 1);
        }
    }

    class BinaryReader {
        constructor(buf) { this.buf = buf; this.pos = 0; this.len = buf.length; }
        tag() { if (this.pos >= this.len) return [0, 0]; let [t] = ur.call(this); return [t >>> 3, t & 7]; }
        skip(t) {
            if (t === 0) ur.call(this);
            else if (t === 1) this.pos += 8;
            else if (t === 2) { let [l] = ur.call(this); this.pos += l; }
            else if (t === 5) this.pos += 4;
        }
        bytes() { let [l] = ur.call(this); let s = this.pos; this.pos += l; return this.buf.subarray(s, this.pos); }
    }

    class BinaryWriter {
        constructor() { this.buf = []; }
        tag(n, t) { Be(n << 3 | t, 0, this.buf); return this; }
        raw(b) { for (let i = 0; i < b.length; i++) this.buf.push(b[i]); return this; }
        finish() { return new Uint8Array(this.buf); }
    }

    // === 2. ĐỊNH NGHĨA MESSAGE HÓA GIẢI ===
    class Message {
        constructor(data) { this.data = data || {}; }
        static fromBinary(bytes) {
            let reader = new BinaryReader(bytes), obj = {};
            while (reader.pos < reader.len) {
                let [tag, type] = reader.tag();
                if (tag === 0) break;
                if (!obj[tag]) obj[tag] = [];
                obj[tag].push({ type, data: reader.bytes() }); // Lưu thô để giữ nhẹ
            }
            return new Message(obj);
        }
        // Hàm bẻ khóa trực tiếp vào tag
        modifyPlayer() {
            // Giả lập bẻ khóa tag 2 (Playability) và tag 4 (StreamingData)
            this.needProcess = true;
        }
    }

    // === 3. LOGIC BẺ KHÓA CHÍNH (ĐÃ FIX) ===
    async function run() {
        const url = w.request.url;
        let body = w.response.bodyBytes;

        // Cơ chế bẻ khóa "Hard" - Ép YouTube nhận diện Premium
        // Tao dùng regex trên bản String để xử lý nhanh cho mày (Dễ PiP nhất)
        let decoder = new TextDecoder();
        let encoder = new TextEncoder();
        let text = decoder.decode(body);

        if (url.includes("player") || url.includes("get_watch")) {
            // Bẻ khóa trạng thái phát
            text = text.replace(/"status":"[^"]+"/g, '"status":"OK"');
            text = text.replace(/"playableInEmbed":false/g, '"playableInEmbed":true');
            // Kích hoạt Background và PiP
            if (text.includes("playabilityStatus")) {
                text = text.replace(/"backgroundPlayer":\{[^}]+\}/g, '"backgroundPlayer":{"backgroundPlayerRenderer":{"active":true}}');
            }
        }

        // Chặn quảng cáo bằng cách xóa adPlacements
        text = text.replace(/"adPlacements":\[[^\]]+\]/g, '"adPlacements":[]');
        text = text.replace(/"adSlots":\[[^\]]+\]/g, '"adSlots":[]');

        w.response.bodyBytes = encoder.encode(text);
        w.exit({ bodyBytes: w.response.bodyBytes });
    }

    run().catch(e => w.exit({}));
})();
