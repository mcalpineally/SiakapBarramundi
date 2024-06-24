export const triggerCustomWidgetEmbed = async (pubId) => {
  const frames = document.querySelectorAll('.hn-embed-widget');
  if (frames.length === 0) {
    return;
  }
  frames.forEach(async (frame) => {
    try {
      const iframe = document.createElement('iframe');
      const host = window.location.hostname;
      iframe.id = `frame-${frame.id}`;
      iframe.sandbox = 'allow-same-origin allow-forms allow-presentation allow-scripts allow-popups';
      iframe.src =
        host.indexOf('.hashnode.net') !== -1 || host.indexOf('.app.localhost') !== -1
          ? `${baseUrl}/api/pub/${pubId}/embed/${frame.id}`
          : `https://embeds.hashnode.com?p=${pubId}&w=${frame.id}`;
      iframe.width = '100%';
      iframe.style.border = 'none'; // Opsiyonel: iframe etrafında border olmaması için

      frame.innerHTML = '';
      frame.appendChild(iframe);

      iframe.onload = () => {
        const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        const observer = new MutationObserver(() => {
          const innerIframe = innerDoc.querySelector('iframe');
          if (innerIframe) {
            innerIframe.style.width = '500px';
          }
        });

        observer.observe(innerDoc, {
          childList: true,
          subtree: true,
        });

        // İlk yükleme sırasında mevcut iframe'i ayarlayın
        const innerIframe = innerDoc.querySelector('iframe');
        if (innerIframe) {
          innerIframe.style.width = '500px';
        }
      };

      setTimeout(() => {
        // TODO:
        // eslint-disable-next-line no-undef
        iFrameResize({ log: false, autoResize: true }, `#${iframe.id}`);
      }, 1000);
      frame.setAttribute('class', 'hn-embed-widget-expanded');
    } catch (e) {
      console.log(e);
    }
  });
};
