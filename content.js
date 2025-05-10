chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'autofill') {
    const [primary, headline, desc] = msg.text.split('\n').slice(0, 3);
    document.querySelector('[data-testid="ad-primary-text"]').value = primary;
    document.querySelector('[data-testid="ad-headline"]').value = headline;
    document.querySelector('[data-testid="ad-description"]').value = desc;
  }
});