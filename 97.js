// YouTube_Offline.js - Fix tải 720p/1080p
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

// Chặn DRM trước khi xử lý
const drmBlockList = ["widevine", "get_video_info", "timedtext"];
if (drmBlockList.some(url => $request.url.includes(url))) {
    console.log("Blocking DRM request: " + $request.url);
    $done({ status: 403, body: "" });
}

class OfflineHandler {
    constructor() {
        this.name = "YouTubeOffline";
        this.argument = w.decodeParams({});
        this.message = {};
        this.modified = false;
    }

    async fromBinary(data) {
        if (data instanceof Uint8Array) {
            console.log(`${this.name}: Processing binary response`);

            try {
                let decoded = JSON.parse(new TextDecoder().decode(data));
                this.message = decoded;
            } catch (e) {
                console.log(`${this.name}: Error parsing response, using fallback`);
                this.message.streamingData = { formats: [], adaptiveFormats: [] };
            }
            return this;
        }
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
                console.log(`${this.name}: Unlocking 720p/1080p`);

                highQualityFormats.forEach(format => {
                    format.premiumOnly = false;
                    format.url = format.url.replace("signature=", "bypass_signature=");
                });

                this.message.streamingData.formats = highQualityFormats;
                this.message.streamingData.adaptiveFormats = highQualityFormats;
                this.modified = true;
            }
        }
    }

    async toBinary() {
        if (this.modified) {
            let data = new TextEncoder().encode(JSON.stringify(this.message));
            console.log(`${this.name}: Modified response, size: ${Math.floor(data.length / 1024)} kb`);
            return data;
        }
        return $request.bodyBytes;
    }

    async done() {
        if (this.modified) {
            console.log(`${this.name}: Sending modified response`);
            $done({ bodyBytes: await this.toBinary() });
        } else {
            $done();
        }
    }
}

let wInstance = w.getInstance("YouTubeOffline");
let requestBody = $request.bodyBytes || new Uint8Array();
let offlineHandler = new OfflineHandler();

(async () => {
    await offlineHandler.fromBinary(requestBody);
    offlineHandler.enableOfflineDownload();
    await offlineHandler.done();
})();
