document.addEventListener('DOMContentLoaded', async () => {
  const mainView = document.getElementById('mainView');
  const optionsView = document.getElementById('optionsView');
  const infoView = document.getElementById('infoView'); 
  const archiveView = document.getElementById('archiveView');

  const configureBtnMain = document.getElementById('configureBtnMain');
  const infoBtnMain = document.getElementById('infoBtnMain'); 
  
  const backToMainBtnFromOptions = document.getElementById('backToMainBtnFromOptions');
  const backToMainBtnFromInfo = document.getElementById('backToMainBtnFromInfo');
  const backToMainBtnFromArchive = document.getElementById('backToMainBtnFromArchive');

  const apiKeyInput = document.getElementById('apiKeyInput');
  const modelSelect = document.getElementById('modelSelect');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  
  const generateBtn = document.getElementById('generateBtn');
  const resetBtn = document.getElementById('resetBtn'); 
  const inputContent = document.getElementById('inputContent');
  const copywriterSelect = document.getElementById('copywriterSelect');
  const formOfAddressSelect = document.getElementById('formOfAddressSelect');

  const primaryTextField = document.getElementById('primaryText');
  const headlineField = document.getElementById('headline');
  const descriptionField = document.getElementById('description');
  const variantsContainer = document.getElementById('variantsContainer');
  const systemPromptDisplay = document.getElementById('systemPromptDisplay');

  const saveToArchiveBtn = document.getElementById('saveToArchiveBtn');
  const viewArchiveBtn = document.getElementById('viewArchiveBtn');
  const archiveListContainer = document.getElementById('archiveListContainer');
  const emptyArchiveMessage = document.getElementById('emptyArchiveMessage');

  const copyPrimaryTextBtn = document.getElementById('copyPrimaryTextBtn');
  const copyHeadlineBtn = document.getElementById('copyHeadlineBtn');
  const copyDescriptionBtn = document.getElementById('copyDescriptionBtn');


  // --- Storage Keys ---
  const STORAGE_KEY_API_KEY = 'openai_key';
  const STORAGE_KEY_MODEL = 'openai_model';
  const STORAGE_KEY_INPUT = 'fbAdInputContent';
  const STORAGE_KEY_PRIMARY = 'fbAdPrimaryText'; // Stores only the first version for now
  const STORAGE_KEY_HEADLINE = 'fbAdHeadline';   // Stores only the first version for now
  const STORAGE_KEY_DESCRIPTION = 'fbAdDescription'; // Stores only the first version for now
  const STORAGE_KEY_COPYWRITER = 'fbAdCopywriterSelect';
  const STORAGE_KEY_ADDRESS_FORM = 'fbAdAddressFormSelect';
  const STORAGE_KEY_ARCHIVES = 'fbAdArchives'; // Archive will also store only the first version for now


  // --- System Prompt Generation ---
  function getSystemPrompt(selectedCopywriter = "Default", formOfAddress = "Du") {
    const copywriterInstruction = selectedCopywriter === "Default" 
      ? "You are an expert copywriter for Facebook Ads."
      : `You are an expert copywriter for Facebook Ads, writing in the ansprechenden Stil von ${selectedCopywriter}.`;

    return `${copywriterInstruction}
Bitte erstelle eine Facebook Ad Copy basierend auf den folgenden Copywriting-Prinzipien.
Schreibe die Ad Copy in der ${formOfAddress}-Form und beachte die Spezifikationen der Facebook Ads.

Copywriting-Prinzipien:
1. Verwende eine klare, natürliche und prägnante Sprache (keine KI-Floskeln wie 'entfesseln Sie die Kraft von', 'revolutionieren Sie Ihr', 'in der heutigen schnelllebigen Welt').
2. Schreibe interessant und ansprechend.
3. Sei informativ und relevant für den Input des Nutzers.
4. Fokussiere dich auf die Bedürfnisse und Wünsche der Zielgruppe.
5. Verwende Handlungsaufforderungen (CTAs), wo passend.

STRUKTUR UND FORMATIERUNG:
- Nutze Absätze, um den Text aufzulockern und die Lesbarkeit zu verbessern. Denke daran, dass der "Primary Text" auf Facebook oft mit "Mehr anzeigen" gekürzt wird, also muss der Anfang (Hook) besonders stark sein.
- Verwende Bullet Points (z.B. mit "-" oder "*") für Aufzählungen von Vorteilen, Eigenschaften oder wichtigen Punkten, falls dies zum Input-Text passt und sinnvoll ist. Formatiere Bullet Points so, dass sie auch in einem reinen Textfeld gut aussehen.
- Stelle sicher, dass der Textfluss natürlich bleibt und die Formatierung die Botschaft unterstützt, nicht davon ablenkt.
- Achte darauf, dass der Hook des Primärtextes kurz und prägnant bleibt (max. 125 Zeichen) und der Rest des Primärtextes diesen sinnvoll ergänzt.

Facebook Ads Spezifikationen (BITTE GENAU BEACHTEN!):
- Primärer Text:
  - Einleitung (Hook): Maximal 125 Zeichen. Dieser erste Teil muss besonders fesselnd sein.
  - Hauptteil: Ergänzt den Hook. Der gesamte Primärtext (Hook + Hauptteil) sollte idealerweise 300-700 Zeichen lang sein, darf aber 800 Zeichen nicht überschreiten. Er soll informativ und überzeugend sein und kann Absätze/Bulletpoints enthalten.
- Überschrift: Maximal 40 Zeichen. Prägnant und aufmerksamkeitsstark.
- Beschreibung: Maximal 30 Zeichen. Klar und handlungsorientiert.

ANFORDERUNG FÜR MEHRERE VERSIONEN:
Bitte generiere 3 unterschiedliche Anzeigenversionen für den gegebenen Input. Jede Version muss einen eigenen Primärtext, eine eigene Überschrift und eine eigene Beschreibung haben. Stelle sicher, dass jede Version einen einzigartigen Blickwinkel oder unterschiedliche Vorteile des Angebots hervorhebt, während alle zuvor genannten Richtlinien und Zeichenbeschränkungen eingehalten werden.

Output Format für mehrere Versionen:
Kennzeichne jede Version deutlich. Beispiel:

Version 1:
Primary Text: [Hier dein vollständiger Primärtext für Version 1...]
Headline: [Deine generierte Überschrift für Version 1 hier]
Description: [Deine generierte Beschreibung für Version 1 hier]

Version 2:
Primary Text: [Hier dein vollständiger Primärtext für Version 2...]
Headline: [Deine generierte Überschrift für Version 2 hier]
Description: [Deine generierte Beschreibung für Version 2 hier]

Version 3:
Primary Text: [Hier dein vollständiger Primärtext für Version 3...]
Headline: [Deine generierte Überschrift für Version 3 hier]
Description: [Deine generierte Beschreibung für Version 3 hier]

Der Input des Nutzers, auf dem die Anzeige basieren soll, folgt als nächste Nachricht.`;
  }

  // --- View Management ---
  const views = { main: mainView, options: optionsView, info: infoView, archive: archiveView };
  function showView(viewName) {
    Object.keys(views).forEach(key => {
      views[key].style.display = (key === viewName) ? 'block' : 'none';
    });
    backToMainBtnFromOptions.style.display = (viewName === 'options') ? 'inline-block' : 'none';
    backToMainBtnFromInfo.style.display = (viewName === 'info') ? 'inline-block' : 'none';
    backToMainBtnFromArchive.style.display = (viewName === 'archive') ? 'inline-block' : 'none';
    
    const mainHeaderIcons = document.querySelector('#mainView .header-icons');
    if (mainHeaderIcons) mainHeaderIcons.style.display = (viewName === 'main') ? 'flex' : 'none';

    if (viewName === 'info' && systemPromptDisplay) {
      const currentCopywriter = copywriterSelect.value || "Default";
      const currentAddressForm = formOfAddressSelect.value || "Du";
      systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm);
    }
    if (viewName === 'options') {
      loadSettingsForOptionsPage();
    }
    if (viewName === 'archive') {
      renderArchiveList();
    }
  }

  // --- Navigation ---
  if (configureBtnMain) configureBtnMain.addEventListener('click', () => showView('options'));
  if (infoBtnMain) infoBtnMain.addEventListener('click', () => showView('info'));
  if (viewArchiveBtn) viewArchiveBtn.addEventListener('click', () => showView('archive'));

  if (backToMainBtnFromOptions) backToMainBtnFromOptions.addEventListener('click', () => showView('main'));
  if (backToMainBtnFromInfo) backToMainBtnFromInfo.addEventListener('click', () => showView('main'));
  if (backToMainBtnFromArchive) backToMainBtnFromArchive.addEventListener('click', () => showView('main'));

  // --- Text & Selections Persistence (Main View) ---
  async function saveMainViewSelections() {
    const dataToSave = {};
    dataToSave[STORAGE_KEY_INPUT] = inputContent.value;
    dataToSave[STORAGE_KEY_PRIMARY] = primaryTextField.innerText; // Saves only the first version
    dataToSave[STORAGE_KEY_HEADLINE] = headlineField.innerText;   // Saves only the first version
    dataToSave[STORAGE_KEY_DESCRIPTION] = descriptionField.innerText; // Saves only the first version
    dataToSave[STORAGE_KEY_COPYWRITER] = copywriterSelect.value;
    dataToSave[STORAGE_KEY_ADDRESS_FORM] = formOfAddressSelect.value;
    await chrome.storage.local.set(dataToSave);
  }

  async function loadMainViewSelections() {
    const result = await chrome.storage.local.get([
      STORAGE_KEY_INPUT, STORAGE_KEY_PRIMARY, STORAGE_KEY_HEADLINE,
      STORAGE_KEY_DESCRIPTION, STORAGE_KEY_COPYWRITER, STORAGE_KEY_ADDRESS_FORM
    ]);
    if (result[STORAGE_KEY_INPUT]) inputContent.value = result[STORAGE_KEY_INPUT];
    primaryTextField.innerText = result[STORAGE_KEY_PRIMARY] || "Will be filled...";
    headlineField.innerText = result[STORAGE_KEY_HEADLINE] || "Will be filled...";
    descriptionField.innerText = result[STORAGE_KEY_DESCRIPTION] || "Will be filled...";
    if (result[STORAGE_KEY_COPYWRITER]) copywriterSelect.value = result[STORAGE_KEY_COPYWRITER];
    if (result[STORAGE_KEY_ADDRESS_FORM]) formOfAddressSelect.value = result[STORAGE_KEY_ADDRESS_FORM];
    // variantsContainer is not persisted directly, it's repopulated on generation
    variantsContainer.style.display = 'none';
    variantsContainer.innerHTML = '';
  }
  
  await loadMainViewSelections(); 

  inputContent.addEventListener('input', saveMainViewSelections);
  copywriterSelect.addEventListener('change', saveMainViewSelections);
  formOfAddressSelect.addEventListener('change', saveMainViewSelections);

  // --- Settings Management (Options View) ---
  async function loadSettingsForOptionsPage() {
    const result = await chrome.storage.local.get([STORAGE_KEY_API_KEY, STORAGE_KEY_MODEL]);
    apiKeyInput.value = result[STORAGE_KEY_API_KEY] || '';
    modelSelect.value = result[STORAGE_KEY_MODEL] || 'gpt-4o'; // Default to gpt-4o
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const apiKey = apiKeyInput.value;
      const selectedModel = modelSelect.value;
      if (apiKey && apiKey.trim() !== "") {
        await chrome.storage.local.set({ [STORAGE_KEY_API_KEY]: apiKey });
      } else {
        await chrome.storage.local.remove(STORAGE_KEY_API_KEY);
        apiKeyInput.value = ''; 
      }
      await chrome.storage.local.set({ [STORAGE_KEY_MODEL]: selectedModel });
      alert('Settings saved.');
      showView('main');
    });
  }
  
  async function getApiKey() {
    const result = await chrome.storage.local.get(STORAGE_KEY_API_KEY);
    return result[STORAGE_KEY_API_KEY];
  }

  async function getSelectedModel() {
    const result = await chrome.storage.local.get(STORAGE_KEY_MODEL);
    return result[STORAGE_KEY_MODEL] || 'gpt-4o'; // Default to gpt-4o
  }

  // --- Ad Generation Logic ---
  function parseAdVersions(text) {
    const versions = [];
    const versionBlocks = text.split(/Version \d+:/i).slice(1); // Split by "Version X:" and remove first empty part

    versionBlocks.forEach((block, index) => {
      const version = { primaryText: "", headline: "", description: "" };
      const lines = block.trim().split('\n');
      let currentPart = null;
      let primaryTextBuffer = [];

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.toLowerCase().startsWith("primary text:")) {
          currentPart = "primary";
          const content = cleanLine.substring("primary text:".length).trim();
          if (content) primaryTextBuffer.push(content);
        } else if (cleanLine.toLowerCase().startsWith("headline:")) {
          currentPart = "headline";
          version.headline = cleanLine.substring("headline:".length).trim();
        } else if (cleanLine.toLowerCase().startsWith("description:")) {
          currentPart = "description";
          version.description = cleanLine.substring("description:".length).trim();
        } else if (currentPart === "primary") { // Continue collecting primary text lines
          primaryTextBuffer.push(line); // Keep original spacing for paragraphs/bullets
        }
      });
      version.primaryText = primaryTextBuffer.join('\n').trim();
      
      if (version.primaryText || version.headline || version.description) {
        versions.push(version);
      }
    });
    return versions;
  }


  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const input = inputContent.value;
      const selectedCopywriter = copywriterSelect.value;
      const selectedAddressForm = formOfAddressSelect.value;

      if (!input.trim()) {
        alert("Please paste your content first.");
        return;
      }
      const key = await getApiKey();
      if (!key) {
        alert("OpenAI API Key is not set. Please configure it in settings. (Click the ⚙️ icon)");
        showView('options');
        return;
      }

      primaryTextField.innerText = "Generating...";
      headlineField.innerText = "Generating...";
      descriptionField.innerText = "Generating...";
      variantsContainer.innerHTML = '<h4>Additional Versions:</h4>Generating...';
      variantsContainer.style.display = 'block';


      const systemPrompt = getSystemPrompt(selectedCopywriter, selectedAddressForm);
      const currentModel = await getSelectedModel();

      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: currentModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Hier ist der Content, auf dem die Ad Copy basieren soll: ${input}` }
            ],
            temperature: 0.75 // Slightly higher temp for more variation
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`API Error (${res.status} - Model: ${currentModel}): ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await res.json();
        const rawText = data.choices?.[0]?.message?.content;

        if (rawText) {
          const adVersions = parseAdVersions(rawText);

          if (adVersions.length > 0) {
            primaryTextField.innerText = adVersions[0].primaryText || "Not found";
            headlineField.innerText = adVersions[0].headline || "Not found";
            descriptionField.innerText = adVersions[0].description || "Not found";

            variantsContainer.innerHTML = '<h4>Additional Versions:</h4>'; // Clear "Generating..."
            if (adVersions.length > 1) {
              adVersions.slice(1).forEach((version, index) => {
                const versionDiv = document.createElement('div');
                versionDiv.classList.add('preview-box'); // Reuse existing style for consistency
                versionDiv.innerHTML = `
                  <strong>Version ${index + 2}</strong><br>
                  <strong>Primary Text:</strong> <div style="white-space: pre-wrap;">${version.primaryText || "N/A"}</div>
                  <strong>Headline:</strong> <div style="white-space: pre-wrap;">${version.headline || "N/A"}</div>
                  <strong>Description:</strong> <div style="white-space: pre-wrap;">${version.description || "N/A"}</div>
                `;
                variantsContainer.appendChild(versionDiv);
              });
              variantsContainer.style.display = 'block';
            } else {
              variantsContainer.innerHTML += '<p>No additional versions generated or parsed.</p>';
              variantsContainer.style.display = 'block';
            }
          } else {
            primaryTextField.innerText = "Could not parse versions.";
            headlineField.innerText = "Could not parse versions.";
            descriptionField.innerText = "Could not parse versions.";
            variantsContainer.innerHTML = '<h4>Additional Versions:</h4><p>Could not parse any versions from the AI response. Raw response:</p><pre>' + rawText + '</pre>';
            variantsContainer.style.display = 'block';
          }
          
          await saveMainViewSelections(); // Saves only the first version for now
          saveToHistory(rawText, currentModel); 
        } else {
          throw new Error("No content received from API.");
        }

      } catch (error) {
        console.error("Error generating ad copy:", error);
        primaryTextField.innerText = "Error generating.";
        headlineField.innerText = "Error generating.";
        descriptionField.innerText = "Error generating.";
        variantsContainer.innerHTML = `<h4>Additional Versions:</h4><p>Error: ${error.message}</p>`;
        variantsContainer.style.display = 'block';
        alert(`Error generating ad copy: ${error.message}`);
      }
    });
  }
  
  // --- Reset Button Logic ---
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      inputContent.value = '';
      primaryTextField.innerText = 'Will be filled...';
      headlineField.innerText = 'Will be filled...';
      descriptionField.innerText = 'Will be filled...';
      variantsContainer.style.display = 'none';
      variantsContainer.innerHTML = '';
      copywriterSelect.value = 'Default'; 
      formOfAddressSelect.value = 'Du';
      await chrome.storage.local.remove([
        STORAGE_KEY_INPUT, STORAGE_KEY_PRIMARY, STORAGE_KEY_HEADLINE,
        STORAGE_KEY_DESCRIPTION, STORAGE_KEY_COPYWRITER, STORAGE_KEY_ADDRESS_FORM
      ]);
      alert('Input and generated texts have been reset.');
    });
  }

  // --- Save to History (for OpenAI calls, not user archive) ---
  function saveToHistory(content, modelUsed) {
    chrome.storage.local.get({ history: [] }, (data) => {
      const history = data.history;
      history.unshift({ 
        time: new Date().toISOString(), 
        input: inputContent.value,
        copywriter: copywriterSelect.value,
        addressForm: formOfAddressSelect.value,
        model: modelUsed,
        generatedText: content 
      });
      if (history.length > 50) { 
        history.length = 50;
      }
      chrome.storage.local.set({ history });
    });
  }

  // --- Archive Functionality ---
  async function handleSaveToArchive() {
    const archiveEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      inputContent: inputContent.value,
      copywriter: copywriterSelect.value,
      formOfAddress: formOfAddressSelect.value,
      primaryText: primaryTextField.innerText, // Saves only the first version
      headline: headlineField.innerText,     // Saves only the first version
      description: descriptionField.innerText, // Saves only the first version
    };

    if (!archiveEntry.inputContent && 
        (archiveEntry.primaryText === "Will be filled..." || !archiveEntry.primaryText)) {
      alert("Nothing to save. Please input content or generate an ad first.");
      return;
    }

    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    const archives = result[STORAGE_KEY_ARCHIVES];
    archives.unshift(archiveEntry);
    if (archives.length > 100) {
        archives.length = 100;
    }
    await chrome.storage.local.set({ [STORAGE_KEY_ARCHIVES]: archives });
    alert('Ad copy (first version) saved to archive!');
  }

  async function renderArchiveList() {
    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    const archives = result[STORAGE_KEY_ARCHIVES];
    archiveListContainer.innerHTML = ''; 

    if (archives.length === 0) {
      emptyArchiveMessage.style.display = 'block';
      return;
    }
    emptyArchiveMessage.style.display = 'none';

    archives.forEach(entry => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('archive-item');
      
      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('archive-item-details');
      const displayDate = new Date(entry.timestamp).toLocaleString();
      const inputSnippet = entry.inputContent ? entry.inputContent.substring(0, 50) + (entry.inputContent.length > 50 ? '...' : '') : 'No input';
      
      detailsDiv.innerHTML = `
        <strong>Saved:</strong> <span class="archive-data">${displayDate}</span>
        <strong>Input:</strong> <span class="archive-data">${inputSnippet}</span>
        <strong>Primary (V1):</strong> <span class="archive-data">${entry.primaryText.substring(0,50)}...</span>
      `;

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('archive-item-actions');

      const loadButton = document.createElement('button');
      loadButton.textContent = 'Load (V1)';
      loadButton.classList.add('btn-secondary');
      loadButton.addEventListener('click', () => loadFromArchive(entry.id));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('btn-danger');
      deleteButton.addEventListener('click', () => deleteFromArchive(entry.id));

      actionsDiv.appendChild(loadButton);
      actionsDiv.appendChild(deleteButton);
      
      itemDiv.appendChild(detailsDiv);
      itemDiv.appendChild(actionsDiv);
      archiveListContainer.appendChild(itemDiv);
    });
  }

  async function loadFromArchive(archiveId) {
    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    const archives = result[STORAGE_KEY_ARCHIVES];
    const entryToLoad = archives.find(entry => entry.id === archiveId);

    if (entryToLoad) {
      inputContent.value = entryToLoad.inputContent;
      copywriterSelect.value = entryToLoad.copywriter;
      formOfAddressSelect.value = entryToLoad.formOfAddress;
      primaryTextField.innerText = entryToLoad.primaryText; // Loads only the first version
      headlineField.innerText = entryToLoad.headline;     // Loads only the first version
      descriptionField.innerText = entryToLoad.description; // Loads only the first version
      variantsContainer.style.display = 'none'; // Clear variants when loading from archive
      variantsContainer.innerHTML = '';
      
      await saveMainViewSelections();
      showView('main');
      alert('Ad copy (first version) loaded from archive.');
    } else {
      alert('Error: Could not find archive entry.');
    }
  }

  async function deleteFromArchive(archiveId) {
    if (!confirm('Are you sure you want to delete this archived item?')) {
        return;
    }
    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    let archives = result[STORAGE_KEY_ARCHIVES];
    archives = archives.filter(entry => entry.id !== archiveId);
    await chrome.storage.local.set({ [STORAGE_KEY_ARCHIVES]: archives });
    renderArchiveList();
    alert('Archived item deleted.');
  }

  if (saveToArchiveBtn) {
    saveToArchiveBtn.addEventListener('click', handleSaveToArchive);
  }

  // --- Copy to Clipboard ---
  function copyToClipboard(text, fieldName) {
    if (!text || text === "Will be filled..." || text === "Generating..." || text === "Error generating." || text === "Not found" || text === "Could not parse versions.") {
      alert(`No valid content to copy for ${fieldName}.`);
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`${fieldName} (Version 1) copied to clipboard!`);
      })
      .catch(err => {
        console.error(`Error copying ${fieldName} to clipboard: `, err);
        alert(`Could not copy ${fieldName}. See console for details.`);
      });
  }

  if (copyPrimaryTextBtn) {
    copyPrimaryTextBtn.addEventListener('click', () => {
      copyToClipboard(primaryTextField.innerText, 'Primary Text');
    });
  }
  if (copyHeadlineBtn) {
    copyHeadlineBtn.addEventListener('click', () => {
      copyToClipboard(headlineField.innerText, 'Headline');
    });
  }
  if (copyDescriptionBtn) {
    copyDescriptionBtn.addEventListener('click', () => {
      copyToClipboard(descriptionField.innerText, 'Description');
    });
  }

  // Initialize view
  showView('main');
});
