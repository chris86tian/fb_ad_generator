import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { loadSettingsForOptionsPage } from './storage.js';
import { renderArchiveList } from './archive.js';
import { currentLanguage } from './localization.js';

export const views = { main: dom.mainView, options: dom.optionsView, info: dom.infoView, archive: dom.archiveView };

export function showView(viewName) {
  Object.keys(views).forEach(key => {
    views[key].style.display = (key === viewName) ? 'block' : 'none';
  });
  
  const backButtonTitle = chrome.i18n.getMessage('backButton');
  if (dom.backToMainBtnFromOptions) dom.backToMainBtnFromOptions.title = backButtonTitle;
  if (dom.backToMainBtnFromInfo) dom.backToMainBtnFromInfo.title = backButtonTitle;
  if (dom.backToMainBtnFromArchive) dom.backToMainBtnFromArchive.title = backButtonTitle;

  if (dom.backToMainBtnFromOptions) dom.backToMainBtnFromOptions.style.display = (viewName === 'options') ? 'inline-block' : 'none';
  if (dom.backToMainBtnFromInfo) dom.backToMainBtnFromInfo.style.display = (viewName === 'info') ? 'inline-block' : 'none';
  if (dom.backToMainBtnFromArchive) dom.backToMainBtnFromArchive.style.display = (viewName === 'archive') ? 'inline-block' : 'none';
  
  const mainHeaderControls = document.querySelector('#mainView .header-controls');
  if (mainHeaderControls) mainHeaderControls.style.display = (viewName === 'main') ? 'flex' : 'none';

  if (viewName === 'info' && dom.systemPromptDisplay) {
    const currentCopywriter = dom.copywriterSelect.value || "Default";
    const currentAddressForm = dom.formOfAddressSelect.value || "Du";
    const currentTargetAudience = dom.targetAudienceInput.value || "";
    dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, currentTargetAudience);
  }
  if (viewName === 'options') {
    loadSettingsForOptionsPage();
  }
  if (viewName === 'archive') {
    renderArchiveList();
  }
}

export function parseAdVersions(text) {
  const versions = [];
  if (!text || typeof text !== 'string') return versions;
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

export function displayAdVersionsInTabs(adVersions) {
  Object.values(dom.tabContents).forEach(tc => tc.innerHTML = '');

  if (adVersions.length === 0) {
    const noVersionsMsg = chrome.i18n.getMessage('tabNoVersionsParsedMessage');
    Object.values(dom.tabContents).forEach(tc => tc.innerHTML = `<p>${noVersionsMsg}</p>`);
    dom.multiVersionTabsContainer.style.display = 'block';
    return;
  }

  const primaryTextMsg = chrome.i18n.getMessage('tabPrimaryTexts');
  const headlinesMsg = chrome.i18n.getMessage('tabHeadlines');
  const descriptionsMsg = chrome.i18n.getMessage('tabDescriptions');

  adVersions.forEach((version, index) => {
    const versionNumber = index + 1;

    const ptTitle = chrome.i18n.getMessage('versionItemTitle', [primaryTextMsg, versionNumber.toString()]);
    const ptItem = createVersionItemElement(version.primaryText, ptTitle, ptTitle);
    dom.tabContents.primaryTexts.appendChild(ptItem);

    const hlTitle = chrome.i18n.getMessage('versionItemTitle', [headlinesMsg, versionNumber.toString()]);
    const hlItem = createVersionItemElement(version.headline, hlTitle, hlTitle);
    dom.tabContents.headlines.appendChild(hlItem);

    const descTitle = chrome.i18n.getMessage('versionItemTitle', [descriptionsMsg, versionNumber.toString()]);
    const descItem = createVersionItemElement(version.description, descTitle, descTitle);
    dom.tabContents.descriptions.appendChild(descItem);
  });
  dom.multiVersionTabsContainer.style.display = 'block';
  if (dom.tabLinks.length > 0) switchTab(dom.tabLinks[0]); 
}

export function createVersionItemElement(text, title, copyButtonTitleText) {
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

export function copyToClipboard(text, fieldName) {
  const naText = chrome.i18n.getMessage('naText');
  const willBeFilled = chrome.i18n.getMessage('willBeFilledText');
  const generating = chrome.i18n.getMessage('generatingText');
  const errorGenerating = chrome.i18n.getMessage('errorGeneratingText');
  const notFound = chrome.i18n.getMessage('notFoundText');
  const couldNotParse = chrome.i18n.getMessage('couldNotParseText');

  const nonCopyableTexts = [willBeFilled, generating, errorGenerating, notFound, couldNotParse, naText, ""];

  if (nonCopyableTexts.includes(text)) {
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => {
      // console.log(chrome.i18n.getMessage('copiedToClipboardAlert', [fieldName]));
    })
    .catch(err => {
      console.error(`Error copying ${fieldName} to clipboard: `, err);
      alert(chrome.i18n.getMessage('copyErrorAlert', [fieldName])); 
    });
}

export function switchTab(clickedTab) {
  dom.tabLinks.forEach(link => link.classList.remove('active'));
  Object.values(dom.tabContents).forEach(content => content.classList.remove('active'));

  clickedTab.classList.add('active');
  const tabId = clickedTab.dataset.tab;
  if (document.getElementById(tabId)) {
      document.getElementById(tabId).classList.add('active');
  }
}
