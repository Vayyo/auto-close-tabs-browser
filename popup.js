document.addEventListener('DOMContentLoaded', async () => {
  const { resolveLocale, formatRam } = TabLifecycleLogic;
  const { applyI18n, t } = TabLifecycleI18n;
  const currentTimeout = document.getElementById('currentTimeout');
  const ramCounter = document.getElementById('ramCounter');
  const openDashboardBtn = document.getElementById('openDashboardBtn');
  const protectTabCheckbox = document.getElementById('protectTabCheckbox');
  const pauseTimerCheckbox = document.getElementById('pauseTimerCheckbox');
  const masterBox = document.getElementById('masterBox');
  const masterStatusText = document.getElementById('masterStatusText');

  let currentTabId = null;
  let currentLocale = resolveLocale(null, navigator.language);

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab && activeTab.id) currentTabId = activeTab.id;

    // Считываем состояние таймера (true по умолчанию)
    const data = await chrome.storage.local.get(['timeoutMinutes', 'savedRamMb', 'protectedTabIds', 'timerEnabled', 'locale']);
    currentLocale = resolveLocale(data.locale, navigator.language);
    applyI18n(document, currentLocale);
    
    currentTimeout.textContent = data.timeoutMinutes || 10;
    ramCounter.textContent = formatRam(data.savedRamMb || 0, currentLocale);

    // Настройка главного переключателя
    const isEnabled = data.timerEnabled !== false;
    pauseTimerCheckbox.checked = isEnabled;
    updateMasterUI(isEnabled);

    const protectedTabIds = data.protectedTabIds || [];
    if (currentTabId && protectedTabIds.includes(currentTabId)) {
      protectTabCheckbox.checked = true;
    }
  } catch (e) { console.error(e); }

  // Переключение состояния глобального таймера
  pauseTimerCheckbox.addEventListener('change', async () => {
    const isEnabled = pauseTimerCheckbox.checked;
    await chrome.storage.local.set({ timerEnabled: isEnabled });
    updateMasterUI(isEnabled);
  });

  function updateMasterUI(isEnabled) {
    if (isEnabled) {
      masterBox.classList.remove('paused');
      masterStatusText.textContent = t(currentLocale, 'timerRunning');
    } else {
      masterBox.classList.add('paused');
      masterStatusText.textContent = t(currentLocale, 'timerPaused');
    }
  }

  protectTabCheckbox.addEventListener('change', async () => {
    if (!currentTabId) return;
    try {
      const data = await chrome.storage.local.get('protectedTabIds');
      let protectedTabIds = data.protectedTabIds || [];

      if (protectTabCheckbox.checked) {
        if (!protectedTabIds.includes(currentTabId)) protectedTabIds.push(currentTabId);
      } else {
        protectedTabIds = protectedTabIds.filter(id => id !== currentTabId);
      }
      await chrome.storage.local.set({ protectedTabIds });
    } catch (e) { console.error(e); }
  });

  openDashboardBtn.addEventListener('click', () => { chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') }); });
});
