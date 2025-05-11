import * as dom from './dom.js';
import { getSystemPrompt } from './prompt.js';
import { renderArchiveList } from './archive.js'; // Assuming renderArchiveList will be in archive.js

export let currentLanguage = 'de'; // Default language

export async function applyLocalization(lang) {
  currentLanguage = lang;
  document.documentElement.lang = lang;

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
          el.innerHTML = message; 
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
  
  updateDynamicPlaceholders();
  updateCopyButtonTitles();
  updateTabPlaceholders(true); 

  if (dom.infoView.style.display === 'block' && dom.systemPromptDisplay) {
    const currentCopywriter = dom.copywriterSelect.value || "Default";
    const currentAddressForm = dom.formOfAddressSelect.value || "Du";
    const currentTargetAudience = dom.targetAudienceInput.value || "";
    dom.systemPromptDisplay.innerText = getSystemPrompt(currentCopywriter, currentAddressForm, currentTargetAudience);
  }
  if (dom.archiveView.style.display === 'block') {
      renderArchiveList(); // This function will need access to currentLanguage
  }
}

export async function loadInitialLanguage() {
  applyLocalization('de');
}

export function updateDynamicPlaceholders() {
  const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
  if (dom.primaryTextField.innerText === "Will be filled..." || dom.primaryTextField.innerText === "Wird gefüllt...") dom.primaryTextField.innerText = willBeFilledMsg;
  if (dom.headlineField.innerText === "Will be filled..." || dom.headlineField.innerText === "Wird gefüllt...") dom.headlineField.innerText = willBeFilledMsg;
  if (dom.descriptionField.innerText === "Will be filled..." || dom.descriptionField.innerText === "Wird gefüllt...") dom.descriptionField.innerText = willBeFilledMsg;
}

export function updateCopyButtonTitles() {
  const primaryTextTitle = chrome.i18n.getMessage('primaryTextV1Title');
  const headlineTitle = chrome.i18n.getMessage('headlineV1Title');
  const descriptionTitle = chrome.i18n.getMessage('descriptionV1Title');

  dom.copyPrimaryTextBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [primaryTextTitle]);
  dom.copyHeadlineBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [headlineTitle]);
  dom.copyDescriptionBtn.title = chrome.i18n.getMessage('copyButtonTitleGeneric', [descriptionTitle]);
}

export function updateTabPlaceholders(forceUpdate = false) {
  const messageKey = 'tabGenerateAdCopyMessage';
  const message = chrome.i18n.getMessage(messageKey);
  Object.values(dom.tabContents).forEach(tc => {
      if (forceUpdate || tc.innerHTML.includes("versions here") || tc.innerHTML.includes("Versionen hier")) {
          tc.innerHTML = `<p data-i18n-key="${messageKey}">${message}</p>`;
      }
  });
}
