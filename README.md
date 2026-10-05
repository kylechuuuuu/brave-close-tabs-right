<img src="icons/icon128.png" width="72" alt="红色图标">

# 关闭右侧标签页 · Brave / Chrome 扩展

一个 MV3 扩展：给浏览器补上「一键关闭右侧所有标签页」，入口做成了**醒目的红色图标**，固定到地址栏右边后一眼可见。

Brave 的标签页右键菜单里只有「关闭 / 关闭重复的标签页 / 关闭其他标签页」，**没有 Chrome 那样的「关闭右侧标签页」**（垂直标签页下叫「关闭以下标签页」）。本扩展一次补齐五个入口。

## 入口一览

| 入口 | 怎么用 | 位置 |
| --- | --- | --- |
| **红色图标 · 左键** | 点一下 → 面板里点大按钮 | 固定在**顶部工具栏**（见下方「固定图标」） |
| **红色图标 · 右键** | 右键那个红图标 | 就在这个小菜单的**最上方** ✅ |
| **标签页右键菜单** | 右键任意标签页 | 在「关闭 / 关闭其他 / 关闭以下」一组**上方**（Chromium 固定插槽，见下） |
| **页面右键菜单** | 右键网页空白处 | 就在 `查看页面源代码 / 检查` **正上方**（页面菜单的最底部区域） |
| **快捷键** | `Alt+Shift+Right` 关右侧、`Alt+Shift+O` 关其他 | 任何地方 |

## 固定图标（关键一步，让红色图标出现在顶部工具栏）

1. 点地址栏右侧的**拼图图标**（扩展菜单）
2. 找到「**关闭右侧标签页**」，点它右边的**图钉 📌**
3. 红色图标就固定到工具栏了；想换位置可以右键图标（或按住拖动）调整

> 扩展没法自己把图标钉上去（浏览器不提供这个 API），所以这一步只能点一下。

## 安装（加载已解压的扩展）

1. 克隆本仓库：

   ```bash
   git clone https://github.com/kylechuuuuu/brave-close-tabs-right.git
   ```

2. 打开 `brave://extensions/`（Chrome 用 `chrome://extensions/`），打开右上角**开发者模式**
3. 点**加载已解压的扩展程序**，选择克隆下来的仓库目录
4. 更新过版本后，在本扩展卡片上点**「重新加载」**（改了 manifest 必须重载一次）
5. 想改快捷键：`brave://extensions/shortcuts`

## 关于菜单项的位置（为什么不能放最顶部 / 最底部）

这是浏览器写死的，扩展无能为力：

- **标签页右键菜单**：Chromium `chrome/browser/ui/tabs/tab_menu_model.cc` 的 `TabMenuModel::Build()` 先把原生项加完，再 `// Append extension items for the 'tab' context if the feature is enabled.` 追加扩展项，**之后**才加 `// Separator Close Tab items` + 关闭 / 关闭其他 / 关闭右侧。所以扩展项永远固定在关闭分组**前面那一格**——既不在最顶部，也不在最底部。
- **Brave 还在末尾追加自己的项**：`BraveTabMenuModel::Build()` 在关闭分组之后又加了「重新打开关闭的标签页」「为所有标签页添加书签…」「显示垂直标签页」等，所以 Brave 的菜单底部永远是浏览器自己的东西。Chrome 没有这些尾巴项，看着才像「扩展项在最底部」。
- **页面右键菜单**：Chromium `chrome/browser/renderer_context_menu/render_view_context_menu.cc` 把扩展项加在开发者项（查看页面源代码 / 检查）**之前** ⇒ 页面菜单里扩展项就是最底部区域（放不到顶部）。
- **图标右键菜单**（本扩展新加的 `contexts: ["action"]`）：这个小菜单里扩展项排在原生的「选项 / 管理扩展程序 / 从工具栏移除」**之前** ⇒ **这一项是真的在最上方**。想要「右键一眼看到、就在顶部」，用这个。
- 另外：Chromium 的 `kExtensionTabContextMenu` 特性开关（flag `brave://flags/#extension-tab-context-menu`）控制标签页上下文里的扩展项是否渲染。若某项在标签页右键里不出现，可以试着把该 flag 设为 **Enabled** 后重启浏览器。

> 垂直标签页用户注意：Brave 的垂直标签菜单里有原生**「关闭以下标签页」**，在竖排标签下它和「关闭右侧标签页」是同一件事，不装扩展也有（只是同样不在最底部）。

## 图标

- 设计：醒目红 `#E8112D` 圆角方块 + 白色图形（左边一条竖条 = 当前标签页，右边 ✕ = 关掉它右边的东西），16/32/48/128 四个尺寸。
- 重新生成（需要 Pillow）：

  ```bash
  python tools/make-icons.py
  ```

  脚本用 8 倍超采样后 LANCZOS 降采样，保证 16px 下红块和图形都清晰；同时会在 `%TEMP%\ctr-icon-preview.png` 生成一张深/浅底色对比图，方便检查。

## 诊断

点扩展图标，面板底部会显示后台脚本注册菜单项的结果：

- `图标右键: 已注册` / `标签页右键: 已注册` / `页面右键: 已注册` → 扩展侧正常，菜单里看不到是浏览器行为（见上）
- `失败 → ...` → 真正的注册错误（重复 id、缺 `contextMenus` 权限、上下文名不支持等）

技术细节：**MV3 的右键菜单项不跨浏览器会话持久化**——浏览器不会把 `menu_items` 写进 Secure Preferences。所以本扩展在 service worker 每次启动时都重新注册，而不是只在 `onInstalled` 里注册一次（早期版本踩过这个坑：首次安装能用，重启浏览器后菜单项消失）。

## 文件

| 文件 | 作用 |
| --- | --- |
| `manifest.json` | MV3 清单：权限 `contextMenus` + `tabs` + `storage`，图标，popup 面板，两个快捷键命令 |
| `background.js` | service worker：注册图标 / 标签页 / 页面三个菜单项，处理点击与快捷键，写诊断 |
| `common.js` | 共用逻辑（按 `tab.index` 过滤后批量关闭） |
| `popup.html` / `popup.js` | 图标面板（红色主按钮）+ 诊断显示 |
| `icons/icon{16,32,48,128}.png` | 红色图标 |
| `tools/make-icons.py` | 图标生成脚本 |

## 许可

[MIT](LICENSE)
