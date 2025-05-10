document.addEventListener('DOMContentLoaded', async () => {
  // --- DOM Elements ---
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
  
  const systemPromptDisplay = document.getElementById('systemPromptDisplay');

  const saveToArchiveBtn = document.getElementById('saveToArchiveBtn');
  const viewArchiveBtn = document.getElementById('viewArchiveBtn');
  const archiveListContainer = document.getElementById('archiveListContainer');
  const emptyArchiveMessage = document.getElementById('emptyArchiveMessage');

  const copyPrimaryTextBtn = document.getElementById('copyPrimaryTextBtn');
  const copyHeadlineBtn = document.getElementById('copyHeadlineBtn');
  const copyDescriptionBtn = document.getElementById('copyDescriptionBtn');

  const multiVersionTabsContainer = document.getElementById('multiVersionTabsContainer');
  const tabLinks = document.querySelectorAll('.tab-navigation .tab-link');
  const tabContents = {
    primaryTexts: document.getElementById('primaryTextsTabContent'),
    headlines: document.getElementById('headlinesTabContent'),
    descriptions: document.getElementById('descriptionsTabContent')
  };

  const langDeBtn = document.getElementById('langDeBtn');
  const langEnBtn = document.getElementById('langEnBtn');

  // --- Storage Keys ---
  const STORAGE_KEY_API_KEY = 'openai_key';
  const STORAGE_KEY_MODEL = 'openai_model';
  const STORAGE_KEY_INPUT = 'fbAdInputContent';
  const STORAGE_KEY_PRIMARY = 'fbAdPrimaryText'; 
  const STORAGE_KEY_HEADLINE = 'fbAdHeadline';   
  const STORAGE_KEY_DESCRIPTION = 'fbAdDescription'; 
  const STORAGE_KEY_COPYWRITER = 'fbAdCopywriterSelect';
  const STORAGE_KEY_ADDRESS_FORM = 'fbAdAddressFormSelect';
  const STORAGE_KEY_ARCHIVES = 'fbAdArchives';
  const STORAGE_KEY_LANGUAGE = 'fbAdLanguage';

  let currentLanguage = 'de'; // Default language

  // --- Localization ---
  async function applyLocalization(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    await chrome.storage.local.set({ [STORAGE_KEY_LANGUAGE]: lang });

    document.querySelectorAll('[data-i18n-key]').forEach(el => {
      const key = el.dataset.i18nKey;
      const message = chrome.i18n.getMessage(key);
      if (message) {
        el.textContent = message;
      }
    });
    document.querySelectorAll('[data-i18n-html-key]').forEach(el => {
        const key = el.dataset.i18nHtmlKey;
        const message = chrome.i18n.getMessage(key);
        if (message) {
            el.innerHTML = message; // Use innerHTML for keys that contain HTML
        }
    });
    document.querySelectorAll('[data-i18n-placeholder-key]').forEach(el => {
      const key = el.dataset.i18nPlaceholderKey;
      const message = chrome.i18n.getMessage(key);
      if (message) {
        el.placeholder = message;
      }
    });
    document.querySelectorAll('[title^="__MSG_"]').forEach(el => {
        const key = el.title.replace("__MSG_", "").replace("__", "");
        const message = chrome.i18n.getMessage(key);
        if (message) {
            el.title = message;
        }
    });
    
    // Update dynamic elements
    updateDynamicPlaceholders();
    updateCopyButtonTitles();
    updateTabPlaceholders(true); // Force update placeholders in tabs
    updateLanguageButtonStates();

    // Reload system prompt if info view is active
    if (infoView.style.display === 'block' && systemPromptDisplay) {
      const currentCopywriter = copywriterSelect.value || "Default";
      const currentAddressForm = formOfAddressSelect.value || "Du";
      systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm);
    }
    // Re-render archive if visible
    if (archiveView.style.display === 'block') {
        renderArchiveList();
    }
  }

  function updateLanguageButtonStates() {
    if (currentLanguage === 'de') {
      langDeBtn.classList.add('active');
      langEnBtn.classList.remove('active');
    } else {
      langEnBtn.classList.add('active');
      langDeBtn.classList.remove('active');
    }
  }

  langDeBtn.addEventListener('click', () => applyLocalization('de'));
  langEnBtn.addEventListener('click', () => applyLocalization('en'));

  async function loadInitialLanguage() {
    const result = await chrome.storage.local.get(STORAGE_KEY_LANGUAGE);
    const savedLang = result[STORAGE_KEY_LANGUAGE];
    // Fallback to browser language if no preference, then to 'de'
    const browserLang = chrome.i18n.getUILanguage().split('-')[0];
    applyLocalization(savedLang || browserLang || 'de');
  }
  
  function updateDynamicPlaceholders() {
    const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
    if (primaryTextField.innerText === "Will be filled..." || primaryTextField.innerText === "Wird gefüllt...") primaryTextField.innerText = willBeFilledMsg;
    if (headlineField.innerText === "Will be filled..." || headlineField.innerText === "Wird gefüllt...") headlineField.innerText = willBeFilledMsg;
    if (descriptionField.innerText === "Will be filled..." || descriptionField.innerText === "Wird gefüllt...") descriptionField.innerText = willBeFilledMsg;
  }

  function updateCopyButtonTitles() {
    const primaryTextTitle = chrome.i18n.getMessage('primaryTextV1Title');
    const headlineTitle = chrome.i18n.getMessage('headlineV1Title');
    const descriptionTitle = chrome.i18n.getMessage('descriptionV1Title');

    copyPrimaryTextBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [primaryTextTitle]);
    copyHeadlineBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [headlineTitle]);
    copyDescriptionBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [descriptionTitle]);
  }
  
  function updateTabPlaceholders(forceUpdate = false) {
    const messageKey = 'tabGenerateAdCopyMessage';
    const message = chrome.i18n.getMessage(messageKey);
    Object.values(tabContents).forEach(tc => {
        // Update only if it's the placeholder or if forceUpdate is true
        if (forceUpdate || tc.innerHTML.includes("versions here") || tc.innerHTML.includes("Versionen hier")) {
            tc.innerHTML = `<p data-i18n-key="${messageKey}">${message}</p>`;
        }
    });
  }


  // --- System Prompt Generation ---
  function getSystemPrompt(selectedCopywriter = "Default", formOfAddress = "Du") {
    // System prompt remains in German as it's for the AI and crafted for specific output
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
    
    const backButtonTitle = chrome.i18n.getMessage('backButton');
    backToMainBtnFromOptions.title = backButtonTitle;
    backToMainBtnFromInfo.title = backButtonTitle;
    backToMainBtnFromArchive.title = backButtonTitle;

    backToMainBtnFromOptions.style.display = (viewName === 'options') ? 'inline-block' : 'none';
    backToMainBtnFromInfo.style.display = (viewName === 'info') ? 'inline-block' : 'none';
    backToMainBtnFromArchive.style.display = (viewName === 'archive') ? 'inline-block' : 'none';
    
    const mainHeaderControls = document.querySelector('#mainView .header-controls');
    if (mainHeaderControls) mainHeaderControls.style.display = (viewName === 'main') ? 'flex' : 'none';


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

  // --- Text & Selections Persistence (Main View - Version 1) ---
  async function saveMainViewSelections() {
    const dataToSave = {};
    dataToSave[STORAGE_KEY_INPUT] = inputContent.value;
    // Save actual content, not localized placeholders
    dataToSave[STORAGE_KEY_PRIMARY] = (primaryTextField.dataset.originalContent || primaryTextField.innerText);
    dataToSave[STORAGE_KEY_HEADLINE] = (headlineField.dataset.originalContent || headlineField.innerText);
    dataToSave[STORAGE_KEY_DESCRIPTION] = (descriptionField.dataset.originalContent || descriptionField.innerText);
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
    
    const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
    primaryTextField.innerText = result[STORAGE_KEY_PRIMARY] || willBeFilledMsg;
    headlineField.innerText = result[STORAGE_KEY_HEADLINE] || willBeFilledMsg;
    descriptionField.innerText = result[STORAGE_KEY_DESCRIPTION] || willBeFilledMsg;
    
    // Store original content if it's not the placeholder
    if (primaryTextField.innerText !== willBeFilledMsg) primaryTextField.dataset.originalContent = primaryTextField.innerText;
    if (headlineField.innerText !== willBeFilledMsg) headlineField.dataset.originalContent = headlineField.innerText;
    if (descriptionField.innerText !== willBeFilledMsg) descriptionField.dataset.originalContent = descriptionField.innerText;

    if (result[STORAGE_KEY_COPYWRITER]) copywriterSelect.value = result[STORAGE_KEY_COPYWRITER];
    if (result[STORAGE_KEY_ADDRESS_FORM]) formOfAddressSelect.value = result[STORAGE_KEY_ADDRESS_FORM];
    
    multiVersionTabsContainer.style.display = 'none';
    updateTabPlaceholders(true);
  }
  
  inputContent.addEventListener('input', saveMainViewSelections);
  copywriterSelect.addEventListener('change', saveMainViewSelections);
  formOfAddressSelect.addEventListener('change', saveMainViewSelections);

  // --- Settings Management (Options View) ---
  async function loadSettingsForOptionsPage() {
    const result = await chrome.storage.local.get([STORAGE_KEY_API_KEY, STORAGE_KEY_MODEL]);
    apiKeyInput.value = result[STORAGE_KEY_API_KEY] || '';
    modelSelect.value = result[STORAGE_KEY_MODEL] || 'gpt-4o'; 
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
      alert(chrome.i18n.getMessage('settingsSavedAlert'));
      showView('main');
    });
  }
  
  async function getApiKey() {
    const result = await chrome.storage.local.get(STORAGE_KEY_API_KEY);
    return result[STORAGE_KEY_API_KEY];
  }

  async function getSelectedModel() {
    const result = await chrome.storage.local.get(STORAGE_KEY_MODEL);
    return result[STORAGE_KEY_MODEL] || 'gpt-4o'; 
  }

  // --- Ad Parsing & Display Logic ---
  function parseAdVersions(text) {
    const versions = [];
    const versionBlocks = text.split(/Version \d+:/i).slice(1); 

    versionBlocks.forEach((block) => {
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
        } else if (currentPart === "primary") { 
          primaryTextBuffer.push(line); 
        }
      });
      version.primaryText = primaryTextBuffer.join('\n').trim();
      
      if (version.primaryText || version.headline || version.description) {
        versions.push(version);
      }
    });
    return versions;
  }

  function displayAdVersionsInTabs(adVersions) {
    Object.values(tabContents).forEach(tc => tc.innerHTML = '');

    if (adVersions.length === 0) {
      const noVersionsMsg = chrome.i18n.getMessage('tabNoVersionsParsedMessage');
      Object.values(tabContents).forEach(tc => tc.innerHTML = `<p>${noVersionsMsg}</p>`);
      multiVersionTabsContainer.style.display = 'block';
      return;
    }

    const primaryTextMsg = chrome.i18n.getMessage('tabPrimaryTexts');
    const headlinesMsg = chrome.i18n.getMessage('tabHeadlines');
    const descriptionsMsg = chrome.i18n.getMessage('tabDescriptions');

    adVersions.forEach((version, index) => {
      const versionNumber = index + 1;

      const ptTitle = chrome.i18n.getMessage('versionItemTitle', [primaryTextMsg, versionNumber.toString()]);
      const ptItem = createVersionItemElement(version.primaryText, ptTitle, ptTitle);
      tabContents.primaryTexts.appendChild(ptItem);

      const hlTitle = chrome.i18n.getMessage('versionItemTitle', [headlinesMsg, versionNumber.toString()]);
      const hlItem = createVersionItemElement(version.headline, hlTitle, hlTitle);
      tabContents.headlines.appendChild(hlItem);

      const descTitle = chrome.i18n.getMessage('versionItemTitle', [descriptionsMsg, versionNumber.toString()]);
      const descItem = createVersionItemElement(version.description, descTitle, descTitle);
      tabContents.descriptions.appendChild(descItem);
    });
    multiVersionTabsContainer.style.display = 'block';
    switchTab(tabLinks[0]); 
  }

  function createVersionItemElement(text, title, copyButtonTitleText) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('version-item', 'preview-box');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('preview-box-header');
    
    const strongTitle = document.createElement('strong');
    strongTitle.textContent = title;
    
    const copyButton = document.createElement('button');
    copyButton.classList.add('copy-btn', 'copy-version-btn');
    copyButton.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [copyButtonTitleText]);
    copyButton.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
    copyButton.addEventListener('click', () => copyToClipboard(text, copyButtonTitleText));

    headerDiv.appendChild(strongTitle);
    headerDiv.appendChild(copyButton);

    const textContentDiv = document.createElement('div');
    textContentDiv.classList.add('text-content-display');
    textContentDiv.innerText = text || chrome.i18n.getMessage('naText');

    itemDiv.appendChild(headerDiv);
    itemDiv.appendChild(textContentDiv);
    return itemDiv;
  }


  if (generateBtn) {
    generateBtn.addEventListener('click', async () => {
      const input = inputContent.value;
      const selectedCopywriter = copywriterSelect.value;
      const selectedAddressForm = formOfAddressSelect.value;

      if (!input.trim()) {
        alert(chrome.i18n.getMessage('pleasePasteContentAlert'));
        return;
      }
      const key = await getApiKey();
      if (!key) {
        alert(chrome.i18n.getMessage('apiKeyNotSetAlert'));
        showView('options');
        return;
      }

      const generatingMsg = chrome.i18n.getMessage('generatingText');
      primaryTextField.innerText = generatingMsg;
      headlineField.innerText = generatingMsg;
      descriptionField.innerText = generatingMsg;
      Object.values(tabContents).forEach(tc => tc.innerHTML = `<p>${generatingMsg}</p>`);
      multiVersionTabsContainer.style.display = 'block';

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
            temperature: 0.75 
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
          const notFoundMsg = chrome.i18n.getMessage('notFoundText');
          const couldNotParseMsg = chrome.i18n.getMessage('couldNotParseText');

          if (adVersions.length > 0) {
            primaryTextField.innerText = adVersions[0].primaryText || notFoundMsg;
            headlineField.innerText = adVersions[0].headline || notFoundMsg;
            descriptionField.innerText = adVersions[0].description || notFoundMsg;
            
            // Store original content
            primaryTextField.dataset.originalContent = adVersions[0].primaryText || notFoundMsg;
            headlineField.dataset.originalContent = adVersions[0].headline || notFoundMsg;
            descriptionField.dataset.originalContent = adVersions[0].description || notFoundMsg;

            displayAdVersionsInTabs(adVersions);
          } else {
            primaryTextField.innerText = couldNotParseMsg;
            headlineField.innerText = couldNotParseMsg;
            descriptionField.innerText = couldNotParseMsg;
            primaryTextField.dataset.originalContent = couldNotParseMsg;
            headlineField.dataset.originalContent = couldNotParseMsg;
            descriptionField.dataset.originalContent = couldNotParseMsg;
            Object.values(tabContents).forEach(tc => tc.innerHTML = `<p>${couldNotParseMsg} Raw response:</p><pre>${rawText}</pre>`);
          }
          
          await saveMainViewSelections();
          saveToHistory(rawText, currentModel); 
        } else {
          throw new Error("No content received from API.");
        }

      } catch (error) {
        console.error("Error generating ad copy:", error);
        const errorGeneratingMsg = chrome.i18n.getMessage('errorGeneratingText');
        primaryTextField.innerText = errorGeneratingMsg;
        headlineField.innerText = errorGeneratingMsg;
        descriptionField.innerText = errorGeneratingMsg;
        primaryTextField.dataset.originalContent = errorGeneratingMsg;
        headlineField.dataset.originalContent = errorGeneratingMsg;
        descriptionField.dataset.originalContent = errorGeneratingMsg;
        Object.values(tabContents).forEach(tc => tc.innerHTML = `<p>Error: ${error.message}</p>`);
        alert(`Error generating ad copy: ${error.message}`);
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      inputContent.value = '';
      const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
      primaryTextField.innerText = willBeFilledMsg;
      headlineField.innerText = willBeFilledMsg;
      descriptionField.innerText = willBeFilledMsg;
      primaryTextField.removeAttribute('data-original-content');
      headlineField.removeAttribute('data-original-content');
      descriptionField.removeAttribute('data-original-content');

      copywriterSelect.value = 'Default'; 
      formOfAddressSelect.value = 'Du';
      
      multiVersionTabsContainer.style.display = 'none';
      updateTabPlaceholders(true);
      if (tabLinks.length > 0) switchTab(tabLinks[0]);

      await chrome.storage.local.remove([
        STORAGE_KEY_INPUT, STORAGE_KEY_PRIMARY, STORAGE_KEY_HEADLINE,
        STORAGE_KEY_DESCRIPTION, STORAGE_KEY_COPYWRITER, STORAGE_KEY_ADDRESS_FORM
      ]);
      // alert('Input and generated texts have been reset.'); // Alert can be annoying, consider removing or making it a toast
    });
  }

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

  async function handleSaveToArchive() {
    const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
    const archiveEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      inputContent: inputContent.value,
      copywriter: copywriterSelect.value,
      formOfAddress: formOfAddressSelect.value,
      primaryText: primaryTextField.dataset.originalContent || (primaryTextField.innerText === willBeFilledMsg ? "" : primaryTextField.innerText), 
      headline: headlineField.dataset.originalContent || (headlineField.innerText === willBeFilledMsg ? "" : headlineField.innerText),     
      description: descriptionField.dataset.originalContent || (descriptionField.innerText === willBeFilledMsg ? "" : descriptionField.innerText), 
    };

    if (!archiveEntry.inputContent && !archiveEntry.primaryText) {
      alert(chrome.i18n.getMessage('pleasePasteContentAlert')); // Or a more specific "nothing to save"
      return;
    }

    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    const archives = result[STORAGE_KEY_ARCHIVES];
    archives.unshift(archiveEntry);
    if (archives.length > 100) {
        archives.length = 100;
    }
    await chrome.storage.local.set({ [STORAGE_KEY_ARCHIVES]: archives });
    // alert('Ad copy (Version 1) saved to archive!');
  }

  async function renderArchiveList() {
    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    const archives = result[STORAGE_KEY_ARCHIVES];
    archiveListContainer.innerHTML = ''; 

    const emptyMsgKey = 'emptyArchiveMessageText';
    emptyArchiveMessage.dataset.i18nKey = emptyMsgKey; // For localization
    emptyArchiveMessage.textContent = chrome.i18n.getMessage(emptyMsgKey);


    if (archives.length === 0) {
      emptyArchiveMessage.style.display = 'block';
      return;
    }
    emptyArchiveMessage.style.display = 'none';

    const savedMsg = chrome.i18n.getMessage('archiveItemSaved');
    const inputMsg = chrome.i18n.getMessage('archiveItemInput');
    const primaryV1Msg = chrome.i18n.getMessage('archiveItemPrimaryV1');
    const loadV1Msg = chrome.i18n.getMessage('archiveLoadButton');
    const deleteMsg = chrome.i18n.getMessage('archiveDeleteButton');


    archives.forEach(entry => {
      const itemDiv = document.createElement('div');
      itemDiv.classList.add('archive-item');
      
      const detailsDiv = document.createElement('div');
      detailsDiv.classList.add('archive-item-details');
      const displayDate = new Date(entry.timestamp).toLocaleString(currentLanguage); // Localize date
      const inputSnippet = entry.inputContent ? entry.inputContent.substring(0, 50) + (entry.inputContent.length > 50 ? '...' : '') : chrome.i18n.getMessage('naText');
      
      detailsDiv.innerHTML = `
        <strong>${savedMsg}</strong> <span class="archive-data">${displayDate}</span>
        <strong>${inputMsg}</strong> <span class="archive-data">${inputSnippet}</span>
        <strong>${primaryV1Msg}</strong> <span class="archive-data">${(entry.primaryText || "").substring(0,50)}...</span>
      `;

      const actionsDiv = document.createElement('div');
      actionsDiv.classList.add('archive-item-actions');

      const loadButton = document.createElement('button');
      loadButton.textContent = loadV1Msg;
      loadButton.classList.add('btn-secondary');
      loadButton.addEventListener('click', () => loadFromArchive(entry.id));

      const deleteButton = document.createElement('button');
      deleteButton.textContent = deleteMsg;
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
    const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');

    if (entryToLoad) {
      inputContent.value = entryToLoad.inputContent;
      copywriterSelect.value = entryToLoad.copywriter;
      formOfAddressSelect.value = entryToLoad.formOfAddress;
      primaryTextField.innerText = entryToLoad.primaryText || willBeFilledMsg; 
      headlineField.innerText = entryToLoad.headline || willBeFilledMsg;     
      descriptionField.innerText = entryToLoad.description || willBeFilledMsg; 
      
      primaryTextField.dataset.originalContent = entryToLoad.primaryText || "";
      headlineField.dataset.originalContent = entryToLoad.headline || "";
      descriptionField.dataset.originalContent = entryToLoad.description || "";
      
      multiVersionTabsContainer.style.display = 'none';
      updateTabPlaceholders(true);
      if (tabLinks.length > 0) switchTab(tabLinks[0]);

      await saveMainViewSelections();
      showView('main');
      alert(chrome.i18n.getMessage('archiveLoadedAlert'));
    } else {
      alert('Error: Could not find archive entry.'); // Should be localized too
    }
  }

  async function deleteFromArchive(archiveId) {
    if (!confirm(chrome.i18n.getMessage('archiveDeleteConfirm'))) {
        return;
    }
    const result = await chrome.storage.local.get({ [STORAGE_KEY_ARCHIVES]: [] });
    let archives = result[STORAGE_KEY_ARCHIVES];
    archives = archives.filter(entry => entry.id !== archiveId);
    await chrome.storage.local.set({ [STORAGE_KEY_ARCHIVES]: archives });
    renderArchiveList();
    alert(chrome.i18n.getMessage('archiveDeletedAlert'));
  }

  if (saveToArchiveBtn) {
    saveToArchiveBtn.addEventListener('click', handleSaveToArchive);
  }

  function copyToClipboard(text, fieldName) {
    const naText = chrome.i18n.getMessage('naText');
    const willBeFilled = chrome.i18n.getMessage('willBeFilledText');
    const generating = chrome.i18n.getMessage('generatingText');
    const errorGenerating = chrome.i18n.getMessage('errorGeneratingText');
    const notFound = chrome.i18n.getMessage('notFoundText');
    const couldNotParse = chrome.i18n.getMessage('couldNotParseText');

    const nonCopyableTexts = [willBeFilled, generating, errorGenerating, notFound, couldNotParse, naText, ""];

    if (nonCopyableTexts.includes(text)) {
      alert(chrome.i18n.getMessage('noValidContentToCopyAlert', [fieldName]));
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(chrome.i18n.getMessage('copiedToClipboardAlert', [fieldName]));
      })
      .catch(err => {
        console.error(`Error copying ${fieldName} to clipboard: `, err);
        alert(`Could not copy ${fieldName}. See console for details.`); // Should be localized
      });
  }

  if (copyPrimaryTextBtn) {
    copyPrimaryTextBtn.addEventListener('click', () => {
      copyToClipboard(primaryTextField.dataset.originalContent || primaryTextField.innerText, chrome.i18n.getMessage('primaryTextV1Title'));
    });
  }
  if (copyHeadlineBtn) {
    copyHeadlineBtn.addEventListener('click', () => {
      copyToClipboard(headlineField.dataset.originalContent || headlineField.innerText, chrome.i18n.getMessage('headlineV1Title'));
    });
  }
  if (copyDescriptionBtn) {
    copyDescriptionBtn.addEventListener('click', () => {
      copyToClipboard(descriptionField.dataset.originalContent || descriptionField.innerText, chrome.i18n.getMessage('descriptionV1Title'));
    });
  }

  function switchTab(clickedTab) {
    tabLinks.forEach(link => link.classList.remove('active'));
    Object.values(tabContents).forEach(content => content.classList.remove('active'));

    clickedTab.classList.add('active');
    const tabId = clickedTab.dataset.tab;
    if (document.getElementById(tabId)) {
        document.getElementById(tabId).classList.add('active');
    }
  }

  tabLinks.forEach(link => {
    link.addEventListener('click', () => switchTab(link));
  });

  // --- Initialization ---
  await loadInitialLanguage(); // Load and apply language first
  await loadMainViewSelections(); // Then load other selections
  
  showView('main');
  if (tabLinks.length > 0) switchTab(tabLinks[0]);
});
