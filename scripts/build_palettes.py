"""One-shot helper: parse 4 beadcolors CSVs and emit a TS palettes file.

Run from the backend folder; CSVs must already be downloaded to /tmp.
This script picks 'popular' indices heuristically from color names + RGB.
"""
import csv
import colorsys
import os

OUT = r"D:\mbfczzzz\claude\BeadForge\frontend\src\data\palettes.ts"
CSV_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_csv_tmp")
SOURCES = [
    ("artkal-c", "Artkal C (2.6mm Mini)", "Artkal Mini 迷你拼豆，2.6mm，国内主流", os.path.join(CSV_DIR, "artkal_c.csv")),
    ("artkal-r", "Artkal R (5mm)", "Artkal Regular 标准拼豆，5mm", os.path.join(CSV_DIR, "artkal_r.csv")),
    ("perler", "Perler (5mm)", "Perler 美国 5mm 标准珠", os.path.join(CSV_DIR, "perler.csv")),
    ("hama-midi", "Hama Midi (5mm)", "Hama Midi 欧洲 5mm 标准珠", os.path.join(CSV_DIR, "hama.csv")),
]

def to_hex(r, g, b):
    return "#" + "".join(f"{int(x):02X}" for x in (r, g, b))

def parse_csv(path):
    rows = []
    seen = set()
    with open(path, encoding="utf-8") as f:
        for row in csv.reader(f):
            if len(row) < 5:
                continue
            code = row[0].strip()
            name = row[1].strip()
            try:
                r, g, b = int(row[2]), int(row[3]), int(row[4])
            except ValueError:
                continue
            if code in seen:
                continue
            seen.add(code)
            rows.append({"code": code, "hex": to_hex(r, g, b), "name": name, "r": r, "g": g, "b": b})
    return rows

def hsv(c):
    return colorsys.rgb_to_hsv(c["r"]/255, c["g"]/255, c["b"]/255)

def pick_popular(rows):
    """Pick ~36 indices covering: B/W/grays, 6 hues x 3-4 lightness, 4-6 skin, plus specials."""
    chosen = []
    chosen_idx = set()
    NL = lambda c: c["name"].lower()

    def add(i):
        if i is not None and i not in chosen_idx:
            chosen_idx.add(i)
            chosen.append(i)

    # 1) neutrals: white, light gray, dark gray, black -- pick by V (value) extremes + low saturation
    neutrals = []
    for i, c in enumerate(rows):
        h, s, v = hsv(c)
        if s < 0.10:  # near grayscale
            neutrals.append((i, v, c))
    neutrals.sort(key=lambda x: x[1])
    if neutrals:
        # pick blackest
        add(neutrals[0][0])
        # pick whitest
        add(neutrals[-1][0])
        # pick a dark gray (~0.3) and a light gray (~0.7)
        for target in (0.30, 0.50, 0.70):
            best = min(neutrals, key=lambda x: abs(x[1]-target))
            add(best[0])

    # 2) 6 hues x ~3 lightness slots
    # hue centers (degrees): red 0, orange 30, yellow 50, green 130, blue 210, purple 280, pink 320
    hue_targets = [
        (0/360, "red"), (25/360, "orange"), (50/360, "yellow"),
        (110/360, "green"), (200/360, "cyan-blue"), (240/360, "blue"),
        (280/360, "purple"), (320/360, "pink"),
    ]
    # for each hue, take 3 lightness buckets
    for ht, _ in hue_targets:
        # collect colors near this hue with reasonable saturation
        cand = []
        for i, c in enumerate(rows):
            h, s, v = hsv(c)
            if s < 0.25:
                continue
            # circular hue distance
            dh = min(abs(h-ht), 1-abs(h-ht))
            if dh > 0.07:  # ~25 degrees
                continue
            cand.append((i, v, s, c))
        if not cand:
            continue
        # pick lightness buckets: dark (v~0.35), mid (v~0.6), bright (v~0.85)
        for tv in (0.35, 0.60, 0.85):
            best = min(cand, key=lambda x: abs(x[1]-tv))
            add(best[0])

    # 3) skin tones - look for keywords or warm desaturated yellows/oranges
    skin_keywords = ("skin", "tan", "beige", "blush", "peach", "apricot", "sand", "fawn",
                     "mocha", "nougat", "vanilla", "ivory", "teint", "cream", "butterscotch",
                     "caffe", "creme", "bubble", "old pink", "deer", "clay", "pale skin",
                     "warm blush", "mandys")
    skin_picks = []
    for i, c in enumerate(rows):
        nl = NL(c)
        if any(k in nl for k in skin_keywords):
            skin_picks.append(i)
    # cap to ~6
    for i in skin_picks[:6]:
        add(i)

    # 4) specials: gold/silver/copper/glow/neon/fluo
    special_keywords = ("gold", "silver", "copper", "glow", "neon", "fluor", "metallic", "bronze", "pearl", "rose gold")
    special_picks = []
    for i, c in enumerate(rows):
        nl = NL(c)
        if any(k in nl for k in special_keywords):
            special_picks.append(i)
    for i in special_picks[:4]:
        add(i)

    # 5) brown spectrum (often missing from hue scan because low sat)
    brown_keywords = ("brown", "chocolate", "cocoa", "chestnut", "rust", "sienna", "redwood", "burgundy")
    bp = []
    for i, c in enumerate(rows):
        nl = NL(c)
        if any(k in nl for k in brown_keywords):
            bp.append(i)
    for i in bp[:3]:
        add(i)

    # cap to 36
    chosen = chosen[:36]
    # sort by hue then lightness for nicer UI default
    def sort_key(i):
        h, s, v = hsv(rows[i])
        # neutrals (low sat) go first by V ascending
        if s < 0.10:
            return (0, v)
        return (1, h, -v)
    chosen.sort(key=sort_key)
    return chosen

def emit_color(c):
    # one line; escape backslash and double quote
    name = c["name"].replace('\\', '\\\\').replace('"', '\\"')
    code = c["code"].replace('\\', '\\\\').replace('"', '\\"')
    return f'    {{ code: "{code}", hex: "{c["hex"]}", name: "{name}" }},'

def emit_palette(key, label, desc, rows, popular):
    lines = []
    lines.append("  {")
    lines.append(f'    key: "{key}",')
    lines.append(f'    label: "{label}",')
    lines.append(f'    desc: "{desc}",')
    lines.append("    colors: [")
    for c in rows:
        lines.append("    " + emit_color(c))
    lines.append("    ],")
    lines.append(f"    popularIndices: [{', '.join(str(i) for i in popular)}],")
    lines.append("  },")
    return "\n".join(lines)

def main():
    out = []
    out.append("// 自动从 maxcleme/beadcolors（MIT）抓取转换。源：https://github.com/maxcleme/beadcolors")
    out.append("// 抓取日期: 2026-05-08。请勿手工修改本文件，重新生成请运行 backend/build_palettes.py")
    out.append("")
    out.append("export interface BeadColor {")
    out.append("  /** 品牌 SKU 编号，如 \"C44\"、\"H56\"、\"31\" */")
    out.append("  code: string;")
    out.append("  /** 16 进制色值，统一大写 7 字符 #RRGGBB */")
    out.append("  hex: string;")
    out.append("  /** 品牌官方色名。可能包含中英文 */")
    out.append("  name: string;")
    out.append("}")
    out.append("")
    out.append("export interface BeadPalette {")
    out.append("  /** 程序内 key，小写连字符，给后端 API 用 */")
    out.append("  key: string;")
    out.append("  /** UI 标签 */")
    out.append("  label: string;")
    out.append("  /** 简短说明（尺寸 / 用途） */")
    out.append("  desc: string;")
    out.append("  /** 全色清单 */")
    out.append("  colors: BeadColor[];")
    out.append("  /** 热门 36 色子集，按色相 → 明度排序 */")
    out.append("  popularIndices: number[];")
    out.append("}")
    out.append("")
    out.append("export const BEAD_PALETTES: BeadPalette[] = [")
    summary = []
    for key, label, desc, path in SOURCES:
        if not os.path.exists(path):
            out.append(f"  // FIXME: 未找到 {key}（路径 {path}），待补")
            summary.append(f"{key}: MISSING")
            continue
        rows = parse_csv(path)
        popular = pick_popular(rows)
        out.append(emit_palette(key, label, desc, rows, popular))
        summary.append(f"{key}: {len(rows)} colors, popular={len(popular)}")
    out.append("];")
    out.append("")
    out.append("/** 兼容旧 default / classic 调色板的入口（hex 数组），让 PALETTES.default 仍可用 */")
    out.append("export const LEGACY_PALETTES: Record<string, string[][]> = {")
    out.append("  // 先空着，第二阶段再处理")
    out.append("};")
    out.append("")
    text = "\n".join(out)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)
    print("WROTE", OUT, "lines:", text.count("\n")+1)
    for s in summary:
        print(s)

if __name__ == "__main__":
    main()
