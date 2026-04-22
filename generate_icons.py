from PIL import Image, ImageDraw
import os

def create_icon(size, filename):
    img = Image.new('RGBA', (size, size), (10, 14, 26, 255)) # #0A0E1A
    draw = ImageDraw.Draw(img)
    
    padding = size * 0.1
    # Blue circle
    draw.ellipse(
        [padding, padding, size - padding, size - padding],
        fill=(59, 130, 246, 255) # #3B82F6
    )
    
    inner_padding = size * 0.25
    # White circle
    draw.ellipse(
        [inner_padding, inner_padding, size - inner_padding, size - inner_padding],
        fill=(255, 255, 255, 255)
    )
    
    img.save(f"signetra-extension/icons/{filename}")

os.makedirs("signetra-extension/icons", exist_ok=True)
create_icon(16, "icon16.png")
create_icon(48, "icon48.png")
create_icon(128, "icon128.png")
print("Icons generated successfully!")
