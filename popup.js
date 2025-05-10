document.getElementById('generateBtn').addEventListener('click', async () => {
  const input = document.getElementById('inputContent').value;
  const key = await getApiKey();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Du bist ein Werbetexter für Facebook Ads." },
        { role: "user", content: `Hier ist der Inhalt: ${input}. Erstelle 3 Varianten für Primary Text, Headline, Description.` }
      ]
    })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  document.getElementById('variantsContainer').innerText = text;
  saveToHistory(text);
});

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['openai_key'], (result) => {
      resolve(result.openai_key);
    });
  });
}

function saveToHistory(content) {
  chrome.storage.local.get({ history: [] }, (data) => {
    const history = data.history;
    history.unshift({ time: new Date().toISOString(), content });
    chrome.storage.local.set({ history });
  });
}