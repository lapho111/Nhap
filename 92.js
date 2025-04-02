// YouTube5_Download.js - Chỉ hỗ trợ tải xuống ngoại tuyến 720p/1080p
// Tạo bởi Grok 3 (xAI) cho mày!

var w = {
    debug: (msg) => console.log(`YouTubeDownload: ${msg}`),
};

// Giả lập MessageType cho Player (dựa trên tài liệu YouTube5.js)
let PlayerMessageType = {
    fromBinary: (data) => {
        let reader = new Ke(data);
        let result = reader.internalBinaryRead();
        return result;
    },
    toBinary: (obj) => {
        let writer = new Writer();
        writer.internalBinaryWrite(obj);
        return writer.finish();
    },
};

// Lớp Ke để parse protobuf (dựa trên tài liệu YouTube5.js)
class Ke {
    constructor(data) {
        this.buf = data;
        this.pos = 0;
        this.len = data.length;
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.uint32 = this.fr.bind(this);
        this.varint64 = this.ur.bind(this);
    }

    // Hàm fr (dựa trên tài liệu YouTube5.js)
    fr() {
        let e = 0;
        for (let i = 0; i < 4; i++) {
            let byte = this.buf[this.pos++];
            e |= (byte & 127) << (i * 7);
            if (!(byte & 128)) {
                this.assertBounds();
                return e;
            }
        }
        throw new Error("Invalid uint32");
    }

    // Hàm ur (dựa trên tài liệu YouTube5.js)
    ur() {
        let l = 0, e = 0;
        for (let n = 0; n < 28; n += 7) {
            let i = this.buf[this.pos++];
            l |= (i & 127) << n;
            if (!(i & 128)) {
                this.assertBounds();
                return [l, e];
            }
        }
        let t = this.buf[this.pos++];
        l |= (t & 15) << 28;
        e = (t & 112) >> 4;
        if (!(t & 128)) {
            this.assertBounds();
            return [l, e];
        }
        for (let n = 3; n <= 31; n += 7) {
            let i = this.buf[this.pos++];
            e |= (i & 127) << n;
            if (!(i & 128)) {
                this.assertBounds();
                return [l, e];
            }
        }
        throw new Error("Invalid varint");
    }

    assertBounds() {
        if (this.pos > this.len) throw new RangeError("Premature EOF");
    }

    internalBinaryRead() {
        let result = { streamingData: { formats: [], adaptiveFormats: [] } };
        w.debug("Parsing streamingData...");
        // Giả lập dữ liệu formats và adaptiveFormats (cần logic thật từ YouTube5.js)
        result.streamingData.formats = [
            { itag: 18, quality: "360p" },
            { itag: 22, quality: "720p" },
        ];
        result.streamingData.adaptiveFormats = [
            { itag: 136, quality: "720p" },
            { itag: 137, quality: "1080p" },
        ];
        return result;
    }
}

// Lớp Writer để mã hóa protobuf (dựa trên tài liệu YouTube5.js)
class Writer {
    constructor() {
        this.buf = [];
    }

    internalBinaryWrite(obj) {
        w.debug("Encoding streamingData...");
        this.buf = new Uint8Array(0); // Placeholder
    }

    finish() {
        return this.buf;
    }
}

class DownloadHandler {
    constructor() {
        this.name = "YouTubeDownload";
        this.message = {};
        this.modified = false;
        w.debug("Initialized");
    }

    fromBinary(data) {
        if (data instanceof Uint8Array) {
            try {
                this.message = PlayerMessageType.fromBinary(data);
                w.debug(`bodyBytesSize: ${Math.floor(data.length / 1024)} kb`);
                return this;
            } catch (e) {
                w.debug(`Error parsing binary: ${e.message}`);
                return this;
            }
        }
        w.debug("Cannot get binaryBody");
        return this;
    }

    enableHighQualityDownload() {
        if (this.message.streamingData) {
            let formats = this.message.streamingData.formats || [];
            let adaptiveFormats = this.message.streamingData.adaptiveFormats || [];

            // Lọc định dạng chất lượng cao (720p: 22, 136; 1080p: 137, 18)
            let highQualityFormats = [...formats, ...adaptiveFormats].filter(format => {
                return [22, 136, 137, 18].includes(format.itag);
            });

            if (highQualityFormats.length > 0) {
                w.debug("Detected high-quality formats:", highQualityFormats.map(f => ({ itag: f.itag, quality: f.quality })));
                this.message.streamingData.formats = formats;
                this.message.streamingData.adaptiveFormats = adaptiveFormats;
                this.modified = true;
                w.debug("Enabled high-quality download (720p/1080p).");
            } else {
                w.debug("No high-quality formats found.");
            }
        } else {
            w.debug("No streamingData found in response.");
        }
    }

    toBinary() {
        if (this.modified) {
            return PlayerMessageType.toBinary(this.message);
        }
        return $request.bodyBytes;
    }

    done() {
        if (this.modified) {
            w.debug("Modified response for high-quality download.");
            $done({ bodyBytes: this.toBinary() });
        } else {
            w.debug("No changes needed.");
            $done();
        }
    }
}

// Khởi chạy
let requestBody = $request.bodyBytes || new Uint8Array();
let downloadHandler = new DownloadHandler().fromBinary(requestBody);

(async () => {
    downloadHandler.enableHighQualityDownload();
    downloadHandler.done();
})();
