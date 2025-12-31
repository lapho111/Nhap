/******************************
 Tác Giả：Lạp Hộ
 Phiên bản siêu nhẹ cuối cùng - Chỉ giữ AdBlock + Premium + Background + PiP
 Không dịch phụ đề, không fetch, không râu ria
 Cập nhật: 2026-01-01
******************************/

(() => {
    // === 1. ĐỊNH NGHĨA w ĐA NỀN TẢNG ===
    const w = typeof $task !== "undefined" 
        ? { request: $request, response: $response, exit: $done }
        : typeof $loon !== "undefined"
        ? { request: $request, response: { bodyBytes: $response.bodyBytes }, exit: $done }
        : { request: { url: request.url }, response: { bodyBytes: response.bodyBytes }, exit: $done };

    // === 2. TEXTDECODER / TEXTENCODER POLYFILL - COPY NGUYÊN GỐC ===
    (function(l) {
        function e() {}
        function t() {}
        var n = String.fromCharCode,
            i = {}.toString,
            r = i.call(l.SharedArrayBuffer),
            c = i(),
            a = l.Uint8Array,
            o = a || Array,
            s = a ? ArrayBuffer : o,
            d = s.isView || function(B) { return B && "length" in B },
            g = i.call(s.prototype);
        s = t.prototype;
        var b = l.TextEncoder,
            m = new(a ? Uint16Array : o)(32);
        e.prototype.decode = function(B) {
            if (!d(B)) {
                var D = i.call(B);
                if (D !== g && D !== r && D !== c) throw TypeError("Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
                B = a ? new o(B) : B || []
            }
            for (var S = D = "", k = 0, T = B.length | 0, le = T - 32 | 0, C, x, L = 0, _ = 0, A, $ = 0, j = -1; k < T;) {
                for (C = k <= le ? 32 : T - k | 0; $ < C; k = k + 1 | 0, $ = $ + 1 | 0) {
                    switch (x = B[k] & 255, x >> 4) {
                        case 15:
                            if (A = B[k = k + 1 | 0] & 255, A >> 6 !== 2 || 247 < x) { k = k - 1 | 0; break }
                            L = (x & 7) << 6 | A & 63, _ = 5, x = 256;
                        case 14:
                            A = B[k = k + 1 | 0] & 255, L <<= 6, L |= (x & 15) << 6 | A & 63, _ = A >> 6 === 2 ? _ + 4 | 0 : 24, x = x + 256 & 768;
                        case 13:
                        case 12:
                            A = B[k = k + 1 | 0] & 255, L <<= 6, L |= (x & 31) << 6 | A & 63, _ = _ + 7 | 0, k < T && A >> 6 === 2 && L >> _ && 1114112 > L ? (x = L, L = L - 65536 | 0, 0 <= L && (j = (L >> 10) + 55296 | 0, x = (L & 1023) + 56320 | 0, 31 > $ ? (m[$] = j, $ = $ + 1 | 0, j = -1) : (A = j, j = x, x = A))) : (x >>= 8, k = k - x - 1 | 0, x = 65533), L = _ = 0, C = k <= le ? 32 : T - k | 0;
                        default:
                            m[$] = x; continue;
                        case 11: case 10: case 9: case 8:
                    }
                    m[$] = 65533
                }
                if (S += n(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], m[12], m[13], m[14], m[15], m[16], m[17], m[18], m[19], m[20], m[21], m[22], m[23], m[24], m[25], m[26], m[27], m[28], m[29], m[30], m[31]), 32 > $ && (S = S.slice(0, $ - 32 | 0)), k < T) {
                    if (m[0] = j, $ = ~j >>> 31, j = -1, S.length < D.length) continue
                } else j !== -1 && (S += n(j));
                D += S, S = ""
            }
            return D
        }, s.encode = function(B) {
            B = B === void 0 ? "" : "" + B;
            var D = B.length | 0, S = new o((D << 1) + 8 | 0), k, T = 0, le = !a;
            for (k = 0; k < D; k = k + 1 | 0, T = T + 1 | 0) {
                var C = B.charCodeAt(k) | 0;
                if (127 >= C) S[T] = C;
                else {
                    if (2047 >= C) S[T] = 192 | C >> 6;
                    else {
                        e: {
                            if (55296 <= C) if (56319 >= C) {
                                var x = B.charCodeAt(k = k + 1 | 0) | 0;
                                if (56320 <= x && 57343 >= x) {
                                    if (C = (C << 10) + x - 56613888 | 0, 65535 < C) {
                                        S[T] = 240 | C >> 18, S[T = T + 1 | 0] = 128 | C >> 12 & 63, S[T = T + 1 | 0] = 128 | C >> 6 & 63, S[T = T + 1 | 0] = 128 | C & 63; continue
                                    }
                                    break e
                                }
                                C = 65533
                            } else 57343 >= C && (C = 65533);
                            !le && k << 1 < T && k << 1 < (T - 7 | 0) && (le = !0, x = new o(3 * D), x.set(S), S = x)
                        }
                        S[T] = 224 | C >> 12, S[T = T + 1 | 0] = 128 | C >> 6 & 63
                    }
                    S[T = T + 1 | 0] = 128 | C & 63
                }
            }
            return a ? S.subarray(0, T) : S.slice(0, T)
        }, b || (l.TextDecoder = e, l.TextEncoder = t)
    })(globalThis);

    // === 3. BỘ NÃO NHỊ PHÂN - COPY NGUYÊN GỐC TỪ FILE 768.js ===
    function ke(l) {
        let e = typeof l;
        if (e == "object") {
            if (Array.isArray(l)) return "array";
            if (l === null) return "null"
        }
        return e
    }

    function lr(l) {
        return l !== null && typeof l == "object" && !Array.isArray(l)
    }
    var M = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),
        Re = [];
    for (let l = 0; l < M.length; l++) Re[M[l].charCodeAt(0)] = l;
    Re["-".charCodeAt(0)] = M.indexOf("+");
    Re["_".charCodeAt(0)] = M.indexOf("/");

    function cr(l) {
        let e = l.length * 3 / 4;
        l[l.length - 2] == "=" ? e -= 2 : l[l.length - 1] == "=" && (e -= 1);
        let t = new Uint8Array(e),
            n = 0,
            i = 0,
            r, c = 0;
        for (let a = 0; a < l.length; a++) {
            if (r = Re[l.charCodeAt(a)], r === void 0) switch (l[a]) {
                case "=":
                    i = 0;
                case `\n`:
                case "\r":
                case "	":
                case " ":
                    continue;
                default:
                    throw Error("invalid base64 string.")
            }
            switch (i) {
                case 0:
                    c = r, i = 1;
                    break;
                case 1:
                    t[n++] = c << 2 | (r & 48) >> 4, c = r, i = 2;
                    break;
                case 2:
                    t[n++] = (c & 15) << 4 | (r & 60) >> 2, c = r, i = 3;
                    break;
                case 3:
                    t[n++] = (c & 3) << 6 | r, i = 0;
                    break
            }
        }
        if (i == 1) throw Error("invalid base64 string.");
        return t.subarray(0, n)
    }

    function dr(l) {
        let e = "",
            t = 0,
            n, i = 0;
        for (let r = 0; r < l.length; r++) switch (n = l[r], t) {
            case 0:
                e += M[n >> 2], i = (n & 3) << 4, t = 1;
                break;
            case 1:
                e += M[i | n >> 4], i = (n & 15) << 2, t = 2;
                break;
            case 2:
                e += M[i | n >> 6], e += M[n & 63], t = 0;
                break
        }
        return t && (e += M[i], e += "=", t == 1 && (e += "=")), e
    }
    var f;
    (function(l) {
        l.symbol = Symbol.for("protobuf-ts/unknown"), l.onRead = (t, n, i, r, c) => {
            (e(n) ? n[l.symbol] : n[l.symbol] = []).push({
                no: i,
                wireType: r,
                data: c
            })
        }, l.onWrite = (t, n, i) => {
            for (let {no: r, wireType: c, data: a} of l.list(n)) i.tag(r, c).raw(a)
        }, l.list = (t, n) => {
            if (e(t)) {
                let i = t[l.symbol];
                return n ? i.filter(r => r.no == n) : i
            }
            return []
        }, l.last = (t, n) => l.list(t, n).slice(-1)[0];
        let e = t => t && Array.isArray(t[l.symbol])
    })(f || (f = {}));
    var u;
    (function(l) {
        l[l.Varint = 0] = "Varint", l[l.Bit64 = 1] = "Bit64", l[l.LengthDelimited = 2] = "LengthDelimited", l[l.StartGroup = 3] = "StartGroup", l[l.EndGroup = 4] = "EndGroup", l[l.Bit32 = 5] = "Bit32"
    })(u || (u = {}));

    function ur() {
        let l = 0,
            e = 0;
        for (let n = 0; n < 28; n += 7) {
            let i = this.buf[this.pos++];
            if (l |= (i & 127) << n, !(i & 128)) return this.assertBounds(), [l, e]
        }
        let t = this.buf[this.pos++];
        if (l |= (t & 15) << 28, e = (t & 112) >> 4, !(t & 128)) return this.assertBounds(), [l, e];
        for (let n = 3; n <= 31; n += 7) {
            let i = this.buf[this.pos++];
            if (e |= (i & 127) << n, !(i & 128)) return this.assertBounds(), [l, e]
        }
        throw new Error("invalid varint")
    }

    function Be(l, e, t) {
        for (let r = 0; r < 28; r = r + 7) {
            let c = l >>> r,
                a = !(!(c >>> 7) && e == 0),
                o = (a ? c | 128 : c) & 255;
            if (t.push(o), !a) return
        }
        let n = l >>> 28 & 15 | (e & 7) << 4,
            i = !!(e >> 3);
        if (t.push((i ? n | 128 : n) & 255), !!i) {
            for (let r = 3; r < 31; r = r + 7) {
                let c = e >>> r,
                    a = !!(c >>> 7),
                    o = (a ? c | 128 : c) & 255;
                if (t.push(o), !a) return
            }
            t.push(e >>> 31 & 1)
        }
    }

    // === 4. ĐỊNH NGHĨA MESSAGE ===
    var re = [0, [1, "playerResponse"]],
        ee = [0, [1, "continuationContents"]],
        fe = [0, [1, "backgroundPlayerRenderer"]],
        Fr = [0, [1, "contents"]];

    // === 5. CLASS G + PLAYER + NEXT + WATCH ===
    class G {
        constructor(e, t) {
            this.message = {};
            this.type = t;
            this.needProcess = false;
        }
        fromBinary(e) {
            // Dùng protobuf runtime gốc - parse thành object
            this.message = this.constructor.definition.fromBinary(e);
        }
        toBinary() {
            return this.message.toBinary();
        }
        done() {
            if (this.needProcess && w.response) w.response.bodyBytes = this.toBinary();
        }
    }

    class oe extends G {
        constructor(e = ee, t = "Generic") { super(e, t); }
        async pure() {
            this.message.adPlacements && (this.message.adPlacements.length = 0);
            this.message.adSlots && (this.message.adSlots.length = 0);
            this.needProcess = true;
            return this;
        }
    }

    class be extends G {
        constructor(e = re, t = "Player") { super(e, t); }
        async pure() {
            this.removeAd();
            this.addPlayAbility();
            this.hardUnlock();
            this.needProcess = true;
            return this;
        }
        removeAd() {
            this.message.adPlacements?.length && (this.message.adPlacements.length = 0);
            this.message.adSlots?.length && (this.message.adSlots.length = 0);
            delete this.message?.playbackTracking?.pageadViewthroughconversion;
        }
        addPlayAbility() {
            let mini = this.message?.playabilityStatus?.miniPlayer?.miniPlayerRenderer;
            if (mini) mini.active = true;
            if (this.message.playabilityStatus) {
                this.message.playabilityStatus.status = "OK";
                this.message.playabilityStatus.backgroundPlayer = { backgroundPlayerRenderer: { active: true } };
            }
        }
        hardUnlock() {
            if (this.message.streamingData) {
                this.message.streamingData.adaptiveFormats?.forEach(f => {
                    f.requiresPurchase = false;
                    f.isPremium = false;
                    f.hasDrm = false;
                });
                this.message.streamingData.expiresInSeconds ??= "21540";
            }
            let m = this.message.microformat?.playerMicroformatRenderer;
            if (m) {
                m.blockedForLegalReasons = false;
                m.blockedForHistory = false;
                m.isShortsEligible = false;
            }
            if (this.message.playabilityStatus?.errorScreen) delete this.message.playabilityStatus.errorScreen;
            if (this.message.playabilityStatus) this.message.playabilityStatus.playableInEmbed = true;
        }
    }

    class Ve extends G {
        constructor(e = Fr, t = "Watch") {
            super(e, t);
            this.player = new be();
            this.next = new oe();
        }
        async pure() {
            for (let c of this.message.contents || []) {
                if (c.player) {
                    this.player.message = c.player;
                    await this.player.pure();
                }
                if (c.next) {
                    this.next.message = c.next;
                    await this.next.pure();
                }
            }
            this.needProcess = true;
            return this;
        }
    }

    // === 6. MAP ===
    var Yr = new Map([
        ["browse", oe],
        ["next", oe],
        ["player", be],
        ["get_watch", Ve]
    ]);

    function or(l) {
        for (let [e, t] of Yr.entries())
            if (l.includes(e)) return new t();
        return null
    }

    // === 7. MAIN ===
    async function qr() {
        let l = or(w.request.url);
        if (l) {
            let e = w.response.bodyBytes;
            l.fromBinary(e);
            await l.pure();
            l.done();
        }
    }
    qr().catch(l => console.log(l.message));
})();