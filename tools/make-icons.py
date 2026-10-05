#!/usr/bin/env python3
"""生成「关闭右侧标签页」扩展的红色图标。

用法：
    python tools/make-icons.py                 # 输出到 ./icons
    python tools/make-icons.py <输出目录>

设计：醒目红（#E8112D）圆角方块 + 白色图形（左边一条 = 当前标签页，右边 ✕ = 关掉它右边的东西）。
小尺寸（16px）下图形会被浏览器缩小显示，所以线宽按比例放大并做 8 倍超采样再降采样，
保证红色块和图形在小图标里依然一眼可辨。
依赖：Pillow
"""
import os
import sys

from PIL import Image, ImageDraw

RED = (232, 17, 45, 255)       # 主色：醒目红
RED_DARK = (168, 8, 28, 255)   # 描边：让红块在浅色/深色工具栏上都有轮廓
WHITE = (255, 255, 255, 255)
SIZES = (16, 32, 48, 128)
SS = 8                         # 超采样倍数


def render(size: int) -> Image.Image:
    """渲染单个尺寸（先在 size*SS 画布上画，再 LANCZOS 降采样）。"""
    s = size * SS
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    m = s * 0.03
    d.rounded_rectangle(
        [m, m, s - m, s - m],
        radius=s * 0.23,
        fill=RED,
        outline=RED_DARK,
        width=max(1, int(s * 0.035)),
    )

    # 当前标签页：左侧白色竖条
    bw = s * 0.135
    bx = s * 0.215
    d.rounded_rectangle([bx, s * 0.255, bx + bw, s * 0.745], radius=bw / 2, fill=WHITE)

    # 右侧 ✕（关掉右侧）
    cx, cy = s * 0.665, s * 0.5
    arm, w = s * 0.175, s * 0.095
    for x1, y1, x2, y2 in (
        (cx - arm, cy - arm, cx + arm, cy + arm),
        (cx - arm, cy + arm, cx + arm, cy - arm),
    ):
        d.line([x1, y1, x2, y2], fill=WHITE, width=int(w))
    for px, py in (
        (cx - arm, cy - arm),
        (cx + arm, cy + arm),
        (cx - arm, cy + arm),
        (cx + arm, cy - arm),
    ):
        r = w / 2
        d.ellipse([px - r, py - r, px + r, py + r], fill=WHITE)

    return img.resize((size, size), Image.LANCZOS)


def preview(icons: dict, path: str) -> None:
    """生成检查用对比图：各尺寸图标放在深色/浅色底上，放大 6 倍（最近邻，保留像素）。"""
    zoom = 6
    rows = 2
    cell_w = max(SIZES) * zoom + 24
    sheet = Image.new("RGB", (cell_w * len(SIZES), 110 * rows), (27, 27, 31))
    for row, bg in enumerate(((27, 27, 31), (242, 242, 244))):
        strip = Image.new("RGB", (cell_w * len(SIZES), 110), bg)
        sheet.paste(strip, (0, row * 110))
        for col, size in enumerate(SIZES):
            big = icons[size].resize((size * zoom, size * zoom), Image.NEAREST)
            x = col * cell_w + (cell_w - size * zoom) // 2
            sheet.paste(big, (x, row * 110 + (110 - size * zoom) // 2), big)
    sheet.save(path)


def main() -> int:
    out_dir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons"
    )
    os.makedirs(out_dir, exist_ok=True)

    icons = {}
    for size in SIZES:
        img = render(size)
        icons[size] = img
        target = os.path.join(out_dir, f"icon{size}.png")
        img.save(target, optimize=True)
        print(f"{target}  {os.path.getsize(target)} bytes")

    prev = os.path.join(os.environ.get("TEMP", "/tmp"), "ctr-icon-preview.png")
    preview(icons, prev)
    print(f"preview -> {prev}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
