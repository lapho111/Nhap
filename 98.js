// YouTube_Combined.js - Kết hợp chặn quảng cáo và tải xuống ngoại tuyến 720p/1080p
// Tạo bởi Grok 3 (xAI) cho mày!

var w = {
    getInstance: (name) => ({ name, debug: (msg) => console.log(`${name}: ${msg}`) }),
    setJSON: () => {},
    getJSON: () => ({}),
    decodeParams: (e) => {
        let arg = typeof $argument === "string" && $argument.includes("{") ? JSON.parse($argument) : {};
        return Object.assign({ lyricLang: "off", captionLang: "off", blockUpload: true, blockImmersive: true, debug: true }, arg);
    },
};

class G {
    constructor(msgType, name) {
        this.name = name;
        this.msgType = msgType;
        this.argument = w.decodeParams({});
        this.message = {};
        this.needProcess = false;
        this.needSave = false;
        w.debug(`${this.name}: Initialized`);
    }

    iterate(obj, key, callback) {
        if (typeof obj === "object" && obj) {
            let stack = [obj];
            while (stack.length) {
                let item = stack.pop();
                let keys = Object.keys(item);
                for (let k of keys) {
                    if (k === key && callback(item)) return;
                    typeof item[k] === "object" && stack.push(item[k]);
                }
            }
        }
    }

    fromBinary(data) {
        if (data instanceof Uint8Array) {
            this.message = this.msgType.fromBinary(data);
            w.debug(`${this.name}: bodyBytesSize: ${Math.floor(data.length / 1024)} kb`);
            return this;
        }
        w.debug(`${this.name}: Cannot get binaryBody`);
        return this;
    }

    toBinary() {
        return this.msgType.toBinary(this.message);
    }

    save() {
        if (this.needSave) {
            w.debug(`${this.name}: Update Config`);
            w.setJSON({ version: "1.0" }, "YouTubeAdvertiseInfo");
        }
    }

    done() {
        this.save();
        if (this.needProcess) {
            w.debug(`${this.name}: Modified response`);
            let data = this.toBinary();
            w.debug(`${this.name}: modifiedBodySize: ${Math.floor(data.length / 1024)} kb`);
            $done({ bodyBytes: data });
        } else {
            w.debug(`${this.name}: No changes needed`);
            $done();
        }
    }
}

class Player extends G {
    constructor(e = {}, t = "Player") {
        super(e, t);
        this.argument = w.decodeParams(this.argument);
        w.debug(`${this.name}: Argument: ${JSON.stringify(this.argument)}`);
    }

    async pure() {
        this.removeAd();
        this.addPlayability();
        this.addTranslateCaption();
        this.enableOfflineDownload();
        this.needProcess = true;
        return this;
    }

    removeAd() {
        if (this.message.adplacements?.length) {
            this.message.adplacements.length = 0;
            w.debug(`${this.name}: Removed adplacements.`);
        }
        if (this.message.adslots?.length) {
            this.message.adslots.length = 0;
            w.debug(`${this.name}: Removed adslots.`);
        }
        if (this.message?.playbackTracking?.pageadviewthroughconversion) {
            delete this.message.playbackTracking.pageadviewthroughconversion;
            w.debug(`${this.name}: Removed pageadviewthroughconversion.`);
        }
    }

    addPlayability() {
        let e = this.message?.playabilityStatus?.miniPlayer?.miniPlayerRenderer;
        if (typeof e === "object") {
            e.active = true;
            w.debug(`${this.name}: Enabled miniPlayer.`);
        }
        if (typeof this.message.playabilityStatus === "object") {
            this.message.playabilityStatus.backgroundPlayer = { backgroundPlayerRenderer: { active: true } };
            w.debug(`${this.name}: Enabled backgroundPlayer.`);
        }
    }

    addTranslateCaption() {
        let e = this.argument.captionLang;
        if (e !== "off") {
            this.iterate(this.message, "captionTracks", t => {
                let n = t.captionTracks, i = t.emissionTracks;
                if (Array.isArray(n)) {
                    let c = {}, a = -1, o = 0;
                    for (let s = 0; s < n.length; s++) {
                        let d = n[s], g = c[d.languageCode] || 0;
                        if (g > a) { a = g; o = s; }
                        d.isTranslatable = true;
                    }
                    if (a !== -1) {
                        n.push({
                            baseUrl: n[o].baseUrl + `&lang=${e}`,
                            name: { runs: [{ text: `Enhanced ${e}` }] },
                            vssId: `.${e}`,
                            languageCode: e,
                            isTranslatable: true
                        });
                    }
                    if (Array.isArray(i)) {
                        let s = a === -1 ? n.length - 1 : o;
                        for (let d of i) {
                            if (!d.captionTrackIndices?.includes(s)) d.captionTrackIndices.push(s);
                            d.defaultCaptionTrackIndex = s;
                            d.captionInitialState = 3;
                        }
                    }
                    let r = {
                        "de": "Deutsch", "ru": "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
                        "fr": "Fran\u00E7ais", "fi": "Filipino", "ko": "\uD55C\uAD6D\uC5B4",
                        "ja": "\u65E5\u672C\u8A9E", "en": "English", "vi": "Ti\u1EBFng Vi\u1EC7t",
                        "zh-Hant": "\u4E2D\u6587\uFF08\u7E41\u9AD4\uFF09", "zh-Hans": "\u4E2D\u6587\uFF08\u7B80\u4F53\uFF09",
                        "und": "eVirgilclyne"
                    };
                    t.translationLanguages = Object.entries(r).map(([c, a]) => ({
                        languageCode: c,
                        languageName: { runs: [{ text: a }] }
                    }));
                }
            });
            w.debug(`${this.name}: Added caption translation for ${e}.`);
        }
    }

    enableOfflineDownload() {
        if (this.message.streamingData) {
            let originalFormats = this.message.streamingData.formats || [];
            let originalAdaptiveFormats = this.message.streamingData.adaptiveFormats || [];

            let highQualityFormats = [...originalFormats, ...originalAdaptiveFormats].filter(format => {
                return [22, 136, 137, 18].includes(format.itag); // 720p: 22, 136; 1080p: 137, 18
            });

            if (highQualityFormats.length > 0) {
                w.debug(`${this.name}: Detected high-quality formats:`, highQualityFormats.map(f => ({ itag: f.itag, quality: f.quality })));
                // Giữ nguyên dữ liệu để client xử lý, tránh can thiệp sâu
                this.message.streamingData.formats = originalFormats;
                this.message.streamingData.adaptiveFormats = originalAdaptiveFormats;
                w.debug(`${this.name}: Enabled offline download support.`);
            } else {
                w.debug(`${this.name}: No high-quality formats found for offline download.`);
            }
        } else {
            w.debug(`${this.name}: No streamingData found in response.`);
        }
    }
}

// Khởi chạy
let wInstance = w.getInstance("YouTube");
let requestBody = $request.bodyBytes || new Uint8Array();
let player = new Player({}, "Player").fromBinary(requestBody);

(async () => {
    await player.pure();
    player.done();
})();
