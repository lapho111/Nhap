// YouTube_Offline.js - Hỗ trợ tải 720p/1080p ngoại tuyến
// Đã sửa lại protobuf + chặn DRM

var w = {
    getInstance: (name) => ({ 
        name, 
        debug: (msg) => console.log(`${name}: ${msg}`) 
    }),
    decodeParams: (e) => {
        let arg = typeof $argument === "string" && $argument.includes("{") ? JSON.parse($argument) : {};
        return Object.assign({ debug: false }, arg);
    },
};

// Import thư viện protobuf
const protobuf = require("protobufjs");

class OfflineHandler {
    constructor() {
        this.name = "YouTubeOffline";
        this.argument = w.decodeParams({});
        this.message = {};
        this.modified = false;
        w.debug(`${this.name}: Initialized`);
    }

    async fromBinary(data) {
        if (data instanceof Uint8Array) {
            w.debug(`${this.name}: bodyBytesSize: ${Math.floor(data.length / 1024)} kb`);

            try {
                // Parse dữ liệu protobuf
                const root = await protobuf.load("youtube.proto");
                const PlayerResponse = root.lookupType("youtube.PlayerResponse");
                this.message = PlayerResponse.decode(data);
            } catch (e) {
                w.debug(`${this.name}: Failed to parse binary data, using raw streamingData`);
                this.message.streamingData = { formats: [], adaptiveFormats: [] };
            }
            return this;
        }
        w.debug(`${this.name}: Cannot get binaryBody`);
        return this;
    }

    enableOfflineDownload() {
        if (this.message.streamingData) {
            let originalFormats = this.message.streamingData.formats || [];
            let originalAdaptiveFormats = this.message.streamingData.adaptiveFormats || [];

            let highQualityFormats = [...originalFormats, ...originalAdaptiveFormats].filter(format => {
                return [22, 136, 137].includes(format.itag); // 720p: 22, 136 | 1080p: 137
            });

            if (highQualityFormats.length > 0) {
                w.debug(`${this.name}: High-quality formats found, unlocking...`);
                
                // Gỡ bỏ kiểm tra Premium
                highQualityFormats.forEach(format => {
                    format.premiumOnly = false;
                    format.url = format.url.replace("signature=", "bypass_signature=");
                });

                this.message.streamingData.formats = [...originalFormats, ...highQualityFormats];
                this.message.streamingData.adaptiveFormats = [...originalAdaptiveFormats, ...highQualityFormats];
                this.modified = true;
            } else {
                w.debug(`${this.name}: No high-quality formats found.`);
            }
        } else {
            w.debug(`${this.name}: No streamingData found.`);
        }
    }

    async toBinary() {
        if (this.modified) {
            // Convert protobuf về binary
            const root = await protobuf.load("youtube.proto");
            const PlayerResponse = root.lookupType("youtube.PlayerResponse");
            let data = PlayerResponse.encode(this.message).finish();

            w.debug(`${this.name}: Converted to binary, size: ${Math.floor(data.length / 1024)} kb`);
            return data;
        }
        return $request.bodyBytes;
    }

    async done() {
        if (this.modified) {
            w.debug(`${this.name}: Modified response for offline download.`);
            $done({ bodyBytes: await this.toBinary() });
        } else {
            w.debug(`${this.name}: No changes needed.`);
            $done();
        }
    }
}

// Chặn DRM
const drmBlockList = [
    "https://www.youtube.com/api/timedtext?",
    "https://youtubei.googleapis.com/get_video_info",
    "https://youtubei.googleapis.com/widevine"
];

if (drmBlockList.some(url => $request.url.includes(url))) {
    w.debug("Blocking DRM request: " + $request.url);
    $done({ status: 403, body: "" });
} else {
    let wInstance = w.getInstance("YouTubeOffline");
    let requestBody = $request.bodyBytes || new Uint8Array();
    let offlineHandler = new OfflineHandler();
    
    (async () => {
        await offlineHandler.fromBinary(requestBody);
        offlineHandler.enableOfflineDownload();
        await offlineHandler.done();
    })();
}
