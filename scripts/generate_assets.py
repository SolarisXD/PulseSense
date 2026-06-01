from PIL import Image, ImageDraw, ImageFont
import os, math

logo_path = r"E:\code\PROJECTS\PulseSense\assets\pulse sense logo2.png"
out_dir = r"E:\code\PROJECTS\PulseSense\docs"

logo = Image.open(logo_path).convert("RGBA")

# --- 1. Store icon 512x512 ---
icon = logo.resize((512, 512), Image.LANCZOS)
icon.save(os.path.join(out_dir, "store-icon.png"))
print("OK store-icon.png 512x512 saved")

# --- 2. Feature graphic 1024x500 ---
W, H = 1024, 500
bg = Image.new("RGBA", (W, H), (13, 45, 59, 255))

draw = ImageDraw.Draw(bg)
for y in range(H):
    t = y / H
    r = int(26 + (13 - 26) * t)
    g = int(95 + (45 - 95) * t)
    b = int(122 + (59 - 122) * t)
    draw.line([(0, y), (W - 1, y)], fill=(r, g, b, 255))

# decorative wave lines
for offset in [0, 80, 160]:
    pts = []
    for x in range(0, W, 4):
        y = int(H / 2 + math.sin(x / 80 + offset) * 20 + math.sin(x / 40 + offset * 2) * 10)
        pts.append((x, y))
    for i in range(len(pts) - 1):
        draw.line([pts[i], pts[i + 1]], fill=(46, 134, 171, 60), width=2)

# subtle circles
draw.ellipse([800, 50, 900, 150], fill=(46, 134, 171, 30))
draw.ellipse([850, 350, 980, 480], fill=(30, 94, 122, 25))

# place logo on right side
logo_max = 280
lw, lh = logo.size
scale = logo_max / max(lw, lh)
logo_small = logo.resize((int(lw * scale), int(lh * scale)), Image.LANCZOS)
lx = W - logo_small.width - 60
ly = (H - logo_small.height) // 2
bg.paste(logo_small, (lx, ly), logo_small)

# text
try:
    title_font = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", 52)
    tag_font = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuii.ttf", 22)
    chip_font = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 16)
except:
    title_font = ImageFont.load_default()
    tag_font = title_font
    chip_font = title_font

draw.text((50, 140), "PulseSense", fill=(255, 255, 255, 255), font=title_font)
draw.text((50, 210), "Offline Vital Log & Triage", fill=(160, 210, 230, 255), font=tag_font)

# chips
chips = [("Normal", "#2DC653"), ("Borderline", "#F4A261"), ("Critical", "#E63946")]
cx = 50
for text, color in chips:
    tw = draw.textbbox((0, 0), text, font=chip_font)[2] - draw.textbbox((0, 0), text, font=chip_font)[0]
    th = draw.textbbox((0, 0), text, font=chip_font)[3] - draw.textbbox((0, 0), text, font=chip_font)[1]
    draw.rounded_rectangle([cx - 6, 260 - 3, cx + tw + 10, 260 + th + 3], radius=12, fill=(255, 255, 255, 25))
    draw.text((cx, 260), text, fill=color, font=chip_font)
    cx += tw + 30

bg.save(os.path.join(out_dir, "feature-graphic.png"))
print("OK feature-graphic.png 1024x500 saved")
