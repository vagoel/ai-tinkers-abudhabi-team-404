const PROXY_BASE = "__VOICE_PROXY_BASE__";

function prepareVoiceLayer(proxyBase) {
  if (window.__voiceWidgetMounted__) {
    window.dispatchEvent(new Event("voicelayer:unmount"));
    return "removed";
  }

  window.__VOICE_WIDGET__ = { proxyBase };
  return "inject";
}

async function setBadge(tabId, text, color) {
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
  await chrome.action.setBadgeText({ tabId, text });
}

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: prepareVoiceLayer,
      args: [PROXY_BASE],
    });

    if (result?.result === "removed") {
      await setBadge(tab.id, "", "#0891b2");
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["voice-widget.js"],
    });
    await setBadge(tab.id, "ON", "#06b6d4");
  } catch (error) {
    console.error("VoiceLayer could not run on this page", error);
    await setBadge(tab.id, "ERR", "#dc2626");
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    void chrome.action.setBadgeText({ tabId, text: "" });
  }
});
