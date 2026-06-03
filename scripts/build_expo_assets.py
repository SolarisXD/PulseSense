import os
from PIL import Image

def build_assets():
    assets_dir = r"E:\code\PROJECTS\PulseSense\assets"
    
    # 1. Main App Icon (icon.png)
    # Size: 1024x1024, Opaque
    # Source: store-icon.png (512x512) scaled up with high-quality Lanczos resampling
    store_icon_path = os.path.join(assets_dir, "store-icon.png")
    icon_path = os.path.join(assets_dir, "icon.png")
    
    if os.path.exists(store_icon_path):
        print(f"Loading {store_icon_path}...")
        store_img = Image.open(store_icon_path)
        icon_img = store_img.resize((1024, 1024), Image.Resampling.LANCZOS)
        icon_img.save(icon_path, "PNG")
        print(f"Saved main app icon to {icon_path} (1024x1024)")
    else:
        print(f"Error: {store_icon_path} not found!")

    # Load the vector logo (transparent logo mark) for foreground assets
    logo_vector_path = os.path.join(assets_dir, "logo vector.png")
    if not os.path.exists(logo_vector_path):
        print(f"Error: {logo_vector_path} not found!")
        return
        
    print(f"Loading {logo_vector_path}...")
    logo_vector = Image.open(logo_vector_path)
    
    # Crop to bounding box to remove excess transparent margins
    bbox = logo_vector.getbbox()
    if bbox:
        logo_cropped = logo_vector.crop(bbox)
        print(f"Cropped logo mark from bounding box: {bbox}")
    else:
        logo_cropped = logo_vector
        print("Warning: Bounding box not found, using raw logo image.")

    # Get cropped logo aspect ratio
    lw, lh = logo_cropped.size
    aspect = lw / lh

    # 2. Adaptive Icon Foreground (adaptive-icon.png)
    # Size: 1024x1024, Transparent background
    # Guideline: Android adaptive icons require the logo to sit in a safe zone (typically center 66%)
    # We will target a width of 600px (approx 58%) so it never clips on any device launcher.
    target_width = 600
    target_height = int(target_width / aspect)
    logo_adaptive = logo_cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    adaptive_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    # Center it
    ax = (1024 - target_width) // 2
    ay = (1024 - target_height) // 2
    adaptive_canvas.paste(logo_adaptive, (ax, ay), logo_adaptive)
    
    adaptive_path = os.path.join(assets_dir, "adaptive-icon.png")
    adaptive_canvas.save(adaptive_path, "PNG")
    print(f"Saved adaptive icon to {adaptive_path} (1024x1024, safe-zone padded)")

    # 3. Splash Screen Image (splash-icon.png)
    # Size: 1024x1024, Transparent background
    # Guideline: Centered on screen, background color defined in app.json (#1A5F7A)
    # Target size: width of 680px for a clean, premium visual weight on start.
    target_splash_width = 680
    target_splash_height = int(target_splash_width / aspect)
    logo_splash = logo_cropped.resize((target_splash_width, target_splash_height), Image.Resampling.LANCZOS)
    
    splash_canvas = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    sx = (1024 - target_splash_width) // 2
    sy = (1024 - target_splash_height) // 2
    splash_canvas.paste(logo_splash, (sx, sy), logo_splash)
    
    splash_path = os.path.join(assets_dir, "splash-icon.png")
    splash_canvas.save(splash_path, "PNG")
    print(f"Saved splash icon to {splash_path} (1024x1024)")

    # 4. Web Favicon (favicon.png)
    # Size: 48x48, Transparent background
    # Target logo width: 40px (centered with 4px padding for balance)
    target_fav_width = 40
    target_fav_height = int(target_fav_width / aspect)
    logo_fav = logo_cropped.resize((target_fav_width, target_fav_height), Image.Resampling.LANCZOS)
    
    fav_canvas = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
    fx = (48 - target_fav_width) // 2
    fy = (48 - target_fav_height) // 2
    fav_canvas.paste(logo_fav, (fx, fy), logo_fav)
    
    fav_path = os.path.join(assets_dir, "favicon.png")
    fav_canvas.save(fav_path, "PNG")
    print(f"Saved web favicon to {fav_path} (48x48)")

if __name__ == "__main__":
    build_assets()
