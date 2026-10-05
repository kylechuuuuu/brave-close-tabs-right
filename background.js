// 后台 service worker。
// 关键改动：MV3 的 contextMenus 菜单项不跨浏览器会话持久化，
// 所以每次 SW 启动都重新注册，而不是只写在 onInstalled 里。

importScripts('common.js');

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    const report = { ts: Date.now(), version: chrome.runtime.getManifest().version, items: [] };
    const wanted = [
      { id: MENU_TAB, contexts: ['tab'] },   // 标签页右键（Chromium 155 起默认支持，见 README）
      { id: MENU_PAGE, contexts: ['page'] }  // 页面右键：肯定会出现，位置在「查看页面源代码/检查」上方
    ];
    let pending = wanted.length;
    const done = () => {
      if (--pending === 0) chrome.storage.local.set({ [DIAG_KEY]: report });
    };
    for (const item of wanted) {
      chrome.contextMenus.create(
        { id: item.id, title: MENU_TITLE, contexts: item.contexts },
        () => {
          report.items.push({
            id: item.id,
            contexts: item.contexts.join(','),
            error: chrome.runtime.lastError ? chrome.runtime.lastError.message : null
          });
          done();
        }
      );
    }
  });
}

createMenus();                                   // 每次 SW 启动都注册
chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_TAB || info.menuItemId === MENU_PAGE) {
    ctrCloseRightOf(tab);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const tab = await ctrActiveTab();
  if (command === 'close-tabs-right') ctrCloseRightOf(tab);
  else if (command === 'close-other-tabs') ctrCloseOthers(tab);
});
