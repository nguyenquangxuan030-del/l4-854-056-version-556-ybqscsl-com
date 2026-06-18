(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var overlay = document.getElementById("play-overlay");
        if (!video || !overlay || !streamUrl) {
            return;
        }
        var attached = false;
        var hls = null;
        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                video.src = streamUrl;
            } else {
                video.src = streamUrl;
            }
        }
        function start() {
            attach();
            overlay.classList.add("hidden");
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    overlay.classList.remove("hidden");
                });
            }
        }
        overlay.addEventListener("click", start);
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            overlay.classList.add("hidden");
        });
        video.addEventListener("error", function () {
            overlay.classList.remove("hidden");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
