// 共用逻辑：后台 service worker 用 importScripts 加载，弹窗用 <script> 加载。

const MENU_TAB = 'ctr-tab';
const MENU_PAGE = 'ctr-page';
const MENU_TITLE = '关闭右侧标签页';
const DIAG_KEY = 'diag';

// 取当前窗口的活动标签页（弹窗/快捷键用；右键菜单会直接给 tab 参数）
async function ctrActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs && tabs[0];
}

async function ctrCloseByIndex(tab, keep) {
  if (!tab || typeof tab.index !== 'number') return 0;
  const tabs = await chrome.tabs.query({ windowId: tab.windowId });
  const ids = tabs
    .filter((t) => (keep === 'right' ? t.index > tab.index
                   : keep === 'left' ? t.index < tab.index
                   : t.index !== tab.index))
    .map((t) => t.id)
    .filter((id) => typeof id === 'number');
  if (!ids.length) return 0;
  await chrome.tabs.remove(ids);
  return ids.length;
}

const ctrCloseRightOf = (tab) => ctrCloseByIndex(tab, 'right');
const ctrCloseLeftOf = (tab) => ctrCloseByIndex(tab, 'left');
const ctrCloseOthers = (tab) => ctrCloseByIndex(tab, 'others');
