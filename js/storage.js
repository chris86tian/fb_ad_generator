import * as dom from './dom.js';
import * as constants from './constants.js';
import { parseAdVersions, displayAdVersionsInTabs } from './ui.js';
import { updateTabPlaceholders } from './localization.js';

export async function saveMainViewSelections() {
  const dataToSave = {};
  dataToSave[constants.STORAGE_KEY_INPUT] = dom.inputContent.value;
  dataToSave[constants.STORAGE_KEY_TARGET_AUDIENCE] = dom.targetAudienceInput.value;
  dataToSave[constants.STORAGE_KEY_PRIMARY] = (dom.primaryTextField.dataset.originalContent || dom.primaryTextField.innerText);
  dataToSave[constants.STORAGE_KEY_HEADLINE] = (dom.headlineField.dataset.originalContent || dom.headlineField.innerText);
  dataToSave[constants.STORAGE_KEY_DESCRIPTION] = (dom.descriptionField.dataset.originalContent || dom.descriptionField.innerText);
  dataToSave[constants.STORAGE_KEY_COPYWRITER] = dom.copywriterSelect.value;
  dataToSave[constants.STORAGE_KEY_ADDRESS_FORM] = dom.formOfAddressSelect.value;
  await chrome.storage.local.set(dataToSave);
}

export async function loadMainViewSelections() {
  const result = await chrome.storage.local.get([
    constants.STORAGE_KEY_INPUT, constants.STORAGE_KEY_TARGET_AUDIENCE, 
    constants.STORAGE_KEY_PRIMARY, constants.STORAGE_KEY_HEADLINE,
    constants.STORAGE_KEY_DESCRIPTION, constants.STORAGE_KEY_COPYWRITER, 
    constants.STORAGE_KEY_ADDRESS_FORM, constants.STORAGE_KEY_LAST_RAW_RESPONSE
  ]);

  if (result[constants.STORAGE_KEY_INPUT]) dom.inputContent.value = result[constants.STORAGE_KEY_INPUT];
  // Corrected typo here: constants.STORAGE_KEY_TARGET_AUDIENCE
  if (result[constants.STORAGE_KEY_TARGET_AUDIENCE]) dom.targetAudienceInput.value = result[constants.STORAGE_KEY_TARGET_AUDIENCE]; 
  
  const willBeFilledMsg = chrome.i18n.getMessage('willBeFilledText');
  dom.primaryTextField.innerText = result[constants.STORAGE_KEY_PRIMARY] || willBeFilledMsg;
  dom.headlineField.innerText = result[constants.STORAGE_KEY_HEADLINE] || willBeFilledMsg;
  dom.descriptionField.innerText = result[constants.STORAGE_KEY_DESCRIPTION] || willBeFilledMsg;
  
  if (dom.primaryTextField.innerText !== willBeFilledMsg) dom.primaryTextField.dataset.originalContent = dom.primaryTextField.innerText;
  if (dom.headlineField.innerText !== willBeFilledMsg) dom.headlineField.dataset.originalContent = dom.headlineField.innerText;
  if (dom.descriptionField.innerText !== willBeFilledMsg) dom.descriptionField.dataset.originalContent = dom.descriptionField.innerText;

  if (result[constants.STORAGE_KEY_COPYWRITER]) dom.copywriterSelect.value = result[constants.STORAGE_KEY_COPYWRITER];
  if (result[constants.STORAGE_KEY_ADDRESS_FORM]) dom.formOfAddressSelect.value = result[constants.STORAGE_KEY_ADDRESS_FORM];
  
  if (result[constants.STORAGE_KEY_LAST_RAW_RESPONSE]) {
    const adVersions = parseAdVersions(result[constants.STORAGE_KEY_LAST_RAW_RESPONSE]);
    if (adVersions.length > 0) {
      const v1 = adVersions[0];
      const notFoundMsg = chrome.i18n.getMessage('notFoundText');
      dom.primaryTextField.innerText = v1.primaryText || notFoundMsg;
      dom.headlineField.innerText = v1.headline || notFoundMsg;
      dom.descriptionField.innerText = v1.description || notFoundMsg;
      dom.primaryTextField.dataset.originalContent = v1.primaryText || "";
      dom.headlineField.dataset.originalContent = v1.headline || "";
      dom.descriptionField.dataset.originalContent = v1.description || "";
      
      displayAdVersionsInTabs(adVersions);
    } else {
      dom.multiVersionTabsContainer.style.display = 'none';
      updateTabPlaceholders(true);
    }
  } else {
    dom.multiVersionTabsContainer.style.display = 'none';
    updateTabPlaceholders(true);
  }
}

export async function loadSettingsForOptionsPage() {
  const result = await chrome.storage.local.get([constants.STORAGE_KEY_API_KEY, constants.STORAGE_KEY_MODEL]);
  dom.apiKeyInput.value = result[constants.STORAGE_KEY_API_KEY] || '';
  dom.modelSelect.value = result[constants.STORAGE_KEY_MODEL] || 'gpt-4o'; 
}

export async function getApiKey() {
  const result = await chrome.storage.local.get(constants.STORAGE_KEY_API_KEY);
  return result[constants.STORAGE_KEY_API_KEY];
}

export async function getSelectedModel() {
  const result = await chrome.storage.local.get(constants.STORAGE_KEY_MODEL);
  return result[constants.STORAGE_KEY_MODEL] || 'gpt-4o'; 
}

export function saveToHistory(content, modelUsed) {
  chrome.storage.local.get({ [constants.HISTORY_STORAGE_KEY]: [] }, (data) => {
    const history = data[constants.HISTORY_STORAGE_KEY];
    history.unshift({ 
      time: new Date().toISOString(), 
      input: dom.inputContent.value,
      targetAudience: dom.targetAudienceInput.value,
      copywriter: dom.copywriterSelect.value,
      addressForm: dom.formOfAddressSelect.value,
      model: modelUsed,
      generatedText: content 
    });
    if (history.length > 50) { 
      history.length = 50;
    }
    chrome.storage.local.set({ [constants.HISTORY_STORAGE_KEY]: history });
  });
}
