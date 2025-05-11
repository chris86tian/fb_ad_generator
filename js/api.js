export async function callOpenAI(apiKey, model, systemPrompt, userInput) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Hier ist der Content, auf dem die Ad Copy basieren soll: ${userInput}` }
      ],
      temperature: 0.75 
    })
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(`API Error (${res.status} - Model: ${model}): ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}
