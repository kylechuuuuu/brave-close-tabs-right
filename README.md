# 关闭右侧标签页 · Brave / Chrome 扩展

一个 MV3 扩展：给浏览器补上「一键关闭右侧所有标签页」。

Brave 的标签页右键菜单里只有「关闭 / 关闭重复的标签页 / 关闭其他标签页」，**没有 Chrome 那样的「关闭右侧标签页」**（垂直标签页下叫「关闭以下标签页」）。本扩展一次补齐四个入口。

## 四个入口

| 入口 | 可用性 | 位置 |
| --- | --- | --- |
| **页面右键菜单** | 一定出现 | 就在 `查看页面源代码 / 检查` 的**正上方**（= 页面菜单最底部区域） |
| **工具栏图标面板** | 一定出现 | 点扩展图标 → 三个按钮：关闭右侧 / 关闭其他 / 关闭左侧，面板底部带诊断信息 |
| **快捷键** | 一定可用 | 默认 `Alt+Shift+Right` 关闭右侧、`Alt+Shift+O` 关闭其他 |
| **标签页右键菜单** | 一定出现，但位置固定 | 在「关闭 / 关闭其他 / 关闭以下」这一组**上方**（Chromium 规定的插槽，见下） |

## 安装（加载已解压的扩展）

1. 克隆本仓库：

   ```bash
   git clone https://github.com/kylechuuuuu/brave-close-tabs-right.git
   ```

2. 打开 `brave://extensions/`（Chrome 用 `chrome://extensions/`），打开右上角**开发者模式**
3. 点**加载已解压的扩展程序**，选择克隆下来的仓库目录
4. 更新过版本后，在本扩展卡片上点**「重新加载」**（改了 manifest 必须重载一次）
5. 想改快捷键：`brave://extensions/shortcuts`

## 为什么菜单项不可能排到「最底部」

这是浏览器写死的，扩展无能为力：

- **标签页右键菜单**：Chromium `chrome/browser/ui/tabs/tab_menu_model.cc` 的 `TabMenuModel::Build()` 先把原生项加完，再
  `// Append extension items for the 'tab' context if the feature is enabled.` 追加扩展项，**之后**才加 `// Separator Close Tab items` + 关闭 / 关闭其他 / 关闭右侧。所以扩展项永远在关闭分组**前面**。
- **Brave 还在末尾追加自己的项**：`BraveTabMenuModel::Build()` 在关闭分组之后又加了「重新打开关闭的标签页」「为所有标签页添加书签…」「将标签页移至新窗口 / 使用垂直标签」等，所以 Brave 的菜单底部永远是浏览器自己的东西。Chrome 没有这些尾巴项，看着才像「扩展项在最底部」。
- **页面右键菜单**：Chromium `chrome/browser/renderer_context_menu/render_view_context_menu.cc` 把扩展项加在开发者项（查看页面源代码 / 检查）**之前** ⇒ 页面菜单里扩展项就是最底部区域。**想要「最底部」的感觉，用页面右键那一项。**
- 另外：Chromium 的 `kExtensionTabContextMenu` 特性开关（flag `brave://flags/#extension-tab-context-menu`）控制标签页上下文里的扩展项是否渲染。若某项在标签页右键里不出现，可以试着把该 flag 设为 **Enabled** 后重启浏览器。

> 垂直标签页用户注意：Brave 的垂直标签菜单里有原生**「关闭以下标签页」**，在竖排标签下它和「关闭右侧标签页」是同一件事，不装扩展也有（只是同样不在最底部）。

## 诊断

点扩展图标，面板底部会显示后台脚本注册菜单项的结果：

- `tab: 已注册` / `page: 已注册` → 扩展侧正常，菜单里看不到是浏览器行为（见上）
- `失败 → ...` → 真正的注册错误（重复 id、缺 `contextMenus` 权限等）

技术细节：**MV3 的右键菜单项不跨浏览器会话持久化**——浏览器不会把 `menu_items` 写进 Secure Preferences。所以本扩展在 service worker 每次启动时都重新注册，而不是只在 `onInstalled` 里注册一次（早期版本踩过这个坑：首次安装能用，重启浏览器后菜单项消失）。

## 文件

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | MV3 清单：权限 `contextMenus` + `tabs` + `storage`，popup 面板，两个快捷键命令 |
| `background.js` | service worker：注册 tab / page 两个菜单项，处理点击与快捷键，写诊断 |
| `common.js` | 共用逻辑（按 `tab.index` 过滤后批量关闭） |
| `popup.html` / `popup.js` | 图标面板 + 诊断显示 |

## 许可

[MIT](LICENSE)
