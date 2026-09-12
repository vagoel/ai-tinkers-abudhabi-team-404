const PROXY_BASE = "__VOICE_PROXY_BASE__";
const ENABLED_KEY = "sightSpeakEnabled";

function prepareSightSpeak(proxyBase) {
  window.__VOICE_WIDGET__ = { proxyBase };
  if (window.__voiceWidgetMounted__) {
    return "present";
  }
  return "inject";
}

function removeSightSpeak() {
  if (window.__voiceWidgetMounted__) {
    window.dispatchEvent(new Event("sightspeak:unmount"));
  }
  delete window.__VOICE_WIDGET__;
}

async function isEnabled() {
  const state = await chrome.storage.local.get(ENABLED_KEY);
  return state[ENABLED_KEY] !== false;
}

async function setEnabled(enabled) {
  await chrome.storage.local.set({ [ENABLED_KEY]: enabled });
}

async function setActionState(tabId, state) {
  const badge = {
    on: { text: "ON", color: "#06b6d4", title: "Turn SightSpeak off" },
    off: { text: "OFF", color: "#52525b", title: "Turn SightSpeak on" },
    error: { text: "ERR", color: "#dc2626", title: "SightSpeak cannot run on this page" },
  }[state];
  await chrome.action.setBadgeBackgroundColor({ tabId, color: badge.color });
  await chrome.action.setBadgeText({ tabId, text: badge.text });
  await chrome.action.setTitle({ tabId, title: badge.title });
}

async function injectIntoTab(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      // Keep networking in the extension's isolated world so page CSP does not
      // block calls to the configured SightSpeak proxy.
      world: "ISOLATED",
      func: prepareSightSpeak,
      args: [PROXY_BASE],
    });

    if (result?.result === "inject") {
      await chrome.scripting.executeScript({
        target: { tabId },
        world: "ISOLATED",
        files: ["voice-widget.js"],
      });
    }
    await setActionState(tabId, "on");
  } catch (error) {
    console.error("SightSpeak could not run on this page", error);
    await setActionState(tabId, "error");
  }
}

async function removeFromTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      world: "ISOLATED",
      func: removeSightSpeak,
    });
    await setActionState(tabId, "off");
  } catch {
    await setActionState(tabId, "off");
  }
}

async function syncTab(tabId) {
  if (await isEnabled()) await injectIntoTab(tabId);
  else await removeFromTab(tabId);
}

async function syncAllTabs(enabled) {
  const tabs = await chrome.tabs.query({});
  await Promise.allSettled(
    tabs.flatMap((tab) => {
      if (!tab.id) return [];
      return [enabled ? injectIntoTab(tab.id) : removeFromTab(tab.id)];
    })
  );
}

async function initialize() {
  const enabled = await isEnabled();
  await setEnabled(enabled);
  await syncAllTabs(enabled);
}

chrome.runtime.onInstalled.addListener(() => void initialize());
chrome.runtime.onStartup.addListener(() => void initialize());

chrome.action.onClicked.addListener(async () => {
  const enabled = !(await isEnabled());
  await setEnabled(enabled);
  await syncAllTabs(enabled);
});

chrome.tabs.onActivated.addListener(({ tabId }) => void syncTab(tabId));

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") void syncTab(tabId);
});
