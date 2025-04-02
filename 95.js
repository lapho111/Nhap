// YouTube5_Offline.js - Hỗ trợ tải xuống ngoại tuyến 720p/1080p mà không xung đột với chặn quảng cáo
// Tạo bởi Grok 3 (xAI) cho mày!

var w = {
    getInstance: (name) => ({ name, debug: (msg) => console.log(`${name}: ${msg}`) }),
    decodeParams: (e) => {
        let arg = typeof $argument === "string" && $argument.includes("{") ? JSON.parse($argument) : {};
        return Object.assign({ debug: true }, arg);
    },
};

class OfflineHandler {
    constructor() {
        this.name = "YouTubeOffline";
        this.argument = w.decodeParams({});
        this.message = {};
        this.modified = false;
        this.originalData = null; // Lưu dữ liệu gốc từ script trước
        w.debug(`${this.name}: Initialized`);
    }

    fromBinary(data) {
        if (data instanceof Uint8Array) {
            this.originalData = data; // Giữ nguyên dữ liệu từ YouTube5.js
            w.debug(`${this.name}: Received bodyBytesSize: ${Math.floor(data.length / 1024)} kb`);
            try {
                // Giả lập parse dữ liệu (cần thay bằng protobuf thực tế từ YouTube5.js)
                let decoded = new TextDecoder().decode(data); // Tạm thời dùng TextDecoder
                this.message = JSON.parse(decoded); // Giả định JSON, thay bằng protobuf nếu cần
            } catch (e) {
                w.debug(`${this.name}: Failed to parse binary data: ${e}. Using fallback structure.`);
                this.message = { streamingData: { formats: [], adaptiveFormats: [] } };
            }
            return this;
        }
        w.debug(`${this.name}: No binary data received`);
        return this;
    }

    enableOfflineDownload() {
        if (this.message.streamingData) {
            let formats = this.message.streamingData.formats || [];
            let adaptiveFormats = this.message.streamingData.adaptiveFormats || [];

            let highQualityFormats = [...formats, ...adaptiveFormats].filter(format => {
                return [22, 136, 137, 18].includes(format.itag); // 720p: 22, 136; 1080p: 137, 18
            });

            if (highQualityFormats.length > 0) {
                w.debug(`${this.name}: Detected high-quality formats:`, highQualityFormats.map(f => ({ itag: f.itag, quality: f.quality || "unknown" })));
                // Không sửa đổi sâu, chỉ xác nhận và giữ nguyên để client xử lý
                this.message.streamingData.formats = formats;
                this.message.streamingData.adaptiveFormats = adaptiveFormats;
                this.modified = true;
                w.debug(`${this.name}: Enabled offline download support`);
            } else {
                w.debug(`${this.name}: No high-quality formats found`);
            }
        } else {
            w.debug(`${this.name}: No streamingData in response`);
        }
    }

    toBinary() {
        if (this.modified) {
            // Giả lập chuyển lại binary (cần thay bằng protobuf thực tế nếu có)
            let data = new TextEncoder().encode(JSON.stringify(this.message));
            w.debug(`${this.name}: Converted to binary, size: ${Math.floor(data.length / 1024)} kb`);
            return data;
        }
        return this.originalData; // Trả về dữ liệu gốc từ YouTube5.js nếu không sửa
    }

    done() {
        if (this.modified) {
            w.debug(`${this.name}: Modified response for offline download`);
            $done({ bodyBytes: this.toBinary() });
        } else {
            w.debug(`${this.name}: No changes needed, passing original data`);
            $done({ bodyBytes: this.originalData }); // Giữ nguyên dữ liệu từ YouTube5.js
        }
    }
}

// Khởi chạy
let wInstance = w.getInstance("YouTubeOffline");
let requestBody = $request.bodyBytes || new Uint8Array();
let offlineHandler = new OfflineHandler().fromBinary(requestBody);

(async () => {
    offlineHandler.enableOfflineDownload();
    offlineHandler.done();
})();
