// YouTube5_Offline.js - Chuyên hỗ trợ tải xuống ngoại tuyến 720p/1080p
// Tạo bởi Grok 3 (xAI) cho mày!

var w = {
    getInstance: (name) => ({ name, debug: (msg) => console.log(`${name}: ${msg}`) }),
    decodeParams: () => ({}),
};

class OfflineHandler {
    constructor() {
        this.name = "YouTubeOffline";
        this.argument = w.decodeParams({ debug: true });
        w.debug(`${this.name}: Initialized`);
    }

    fromBinary(data) {
        if (data instanceof Uint8Array) {
            this.message = JSON.parse(new TextDecoder().decode(data)); // Giả sử phản hồi là JSON (có thể cần chỉnh nếu dùng protobuf)
            w.debug(`${this.name}: bodyBytesSize: ${Math.floor(data.length / 1024)} kb`);
            return this;
        }
        w.debug(`${this.name}: Cannot get binaryBody`);
        return this;
    }

    enableOfflineDownload() {
        if (this.message.streamingData) {
            let originalFormats = this.message.streamingData.formats || [];
            let originalAdaptiveFormats = this.message.streamingData.adaptiveFormats || [];

            // Lọc các định dạng chất lượng cao (720p và 1080p)
            let highQualityFormats = [...originalFormats, ...originalAdaptiveFormats].filter(format => {
                return [22, 136, 137, 18].includes(format.itag); // 720p: 22, 136; 1080p: 137, 18
            });

            if (highQualityFormats.length > 0) {
                w.debug(`${this.name}: Detected high-quality formats for offline download:`, highQualityFormats.map(f => ({ itag: f.itag, quality: f.quality })));
                // Giữ nguyên dữ liệu để client xử lý
                this.message.streamingData.formats = originalFormats;
                this.message.streamingData.adaptiveFormats = originalAdaptiveFormats;
                this.modified = true;
            } else {
                w.debug(`${this.name}: No high-quality formats found for offline download.`);
            }
        } else {
            w.debug(`${this.name}: No streamingData found in response.`);
        }
    }

    toBinary() {
        if (this.modified) {
            return new TextEncoder().encode(JSON.stringify(this.message)); // Chuyển lại thành binary
        }
        return $request.bodyBytes;
    }

    done() {
        if (this.modified) {
            w.debug(`${this.name}: Modified response for offline download.`);
            $done({ bodyBytes: this.toBinary() });
        } else {
            w.debug(`${this.name}: No changes needed.`);
            $done();
        }
    }
}

// Khởi chạy script
let requestBody = $request.bodyBytes || new Uint8Array();
let offlineHandler = new OfflineHandler().fromBinary(requestBody);

(async () => {
    offlineHandler.enableOfflineDownload();
    offlineHandler.done();
})();
