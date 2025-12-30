/******************************
 Tác Giả：Lạp Hộ
 Cập Nhật：2025-12-31
 Liên Lạc：Zalo: 0886632736
 Face Book: https://www.facebook.com/lapho111
******************************/
[Rule]
DOMAIN, ads-vta.tiktok.com, REJECT
DOMAIN, ads.tiktok.com, REJECT
DOMAIN, analytics.tiktok.com, REJECT
DOMAIN-KEYWORD, ads-normal-useast, REJECT

[Script]
TikTok_Combined = type=http-response,pattern=^https?:\/\/.*\.tiktokv\.com\/aweme\/v\d\/feed\/,requires-body=1,binary-body=1,max-size=0,script-path= https://raw.githubusercontent.com/lapho111/Nhap/refs/heads/main/778.js

[MITM]
hostname = %APPEND% *.tiktokv.com, *.byteoversea.com, *.musical.ly
