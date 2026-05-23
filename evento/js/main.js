/* ===================== CTA — Lead ===================== */
document.querySelector('.btn-cta').addEventListener('click', function () {
  fbq('track', 'Lead', { content_name: 'QCG 2026 - CTA Hotmart' });
});

/* ===================== YouTube IFrame API ===================== */
var ytVideoStarted = false;

window.onYouTubeIframeAPIReady = function () {
  new YT.Player('yt-player', {
    events: {
      onStateChange: function (event) {
        // state 1 = playing; dispara apenas uma vez por sessão
        if (event.data === YT.PlayerState.PLAYING && !ytVideoStarted) {
          ytVideoStarted = true;
          fbq('track', 'ViewContent', { content_name: 'QCG 2026 - Assistindo Aula' });
        }
      }
    }
  });
};

(function loadYTApi() {
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();
