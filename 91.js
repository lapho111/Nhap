// YouTubeDownload.js

function getDownloadUrl(videoId, quality) {
    return new Promise((resolve, reject) => {
        // Gửi yêu cầu lấy thông tin video từ YouTube API
        fetch(`https://youtubei.googleapis.com/youtubei/v1/player?videoId=${videoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('yt_auth_token')
            },
            body: JSON.stringify({
                videoId: videoId,
                context: {
                    client: {
                        clientName: 'WEB',
                        clientVersion: '2.20230413'
                    }
                }
            })
        })
        .then(response => response.json())
        .then(data => {
            const formats = data.streamingData.formats;
            let downloadUrl = '';

            // Lọc và chọn video có chất lượng cao nhất (720p hoặc 1080p)
            formats.forEach(format => {
                if (format.qualityLabel === quality) {
                    downloadUrl = format.url;
                }
            });

            if (downloadUrl) {
                resolve(downloadUrl);
            } else {
                reject('Không tìm thấy video với chất lượng mong muốn.');
            }
        })
        .catch(error => reject(error));
    });
}

// Hàm tải video xuống
function downloadVideo(videoId, quality) {
    getDownloadUrl(videoId, quality)
        .then(url => {
            // Tải video
            const a = document.createElement('a');
            a.href = url;
            a.download = `${videoId}-${quality}.mp4`; // Tên file tải xuống
            a.click(); // Mở hộp thoại tải xuống
        })
        .catch(error => {
            console.error('Lỗi khi tải video:', error);
        });
}

// Hàm khởi tạo và kiểm tra video
function initDownload(videoUrl, quality) {
    const videoId = videoUrl.split('v=')[1]; // Lấy videoId từ URL
    downloadVideo(videoId, quality);
}

// Gọi hàm download từ video URL YouTube với chất lượng 720p
initDownload('https://www.youtube.com/watch?v=VIDEO_ID_HERE', '1080p'); // Hoặc '720p'
