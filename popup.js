const diagEl = document.getElementById('diag');

document.getElementById('btn-right').addEventListener('click', async () => {
  await ctrCloseRightOf(await ctrActiveTab());
  window.close();
});
document.getElementById('btn-others').addEventListener('click', async () => {
  await ctrCloseOthers(await ctrActiveTab());
  window.close();
});
document.getElementById('btn-left').addEventListener('click', async () => {
  await ctrCloseLeftOf(await ctrActiveTab());
  window.close();
});

// 诊断：菜单项到底注册成功没有（这是判断「右键菜单里没出现」的关键信息）。
chrome.storage.local.get('diag').then(({ diag }) => {
  if (!diag) { diagEl.textContent = '后台脚本还没注册过菜单项。'; return; }
  const lines = [`版本 ${diag.version}  ${new Date(diag.ts).toLocaleTimeString()}`];
  for (const item of diag.items) {
    lines.push(`${item.contexts}: ${item.error ? '失败 → ' + item.error : '已注册'}`);
  }
  lines.push('tab 项已注册但 Brave 不显示 → 见 README');
  diagEl.textContent = lines.join('\n');
});
