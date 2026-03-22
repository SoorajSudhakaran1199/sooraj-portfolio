import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

def inject_thumbnail(emoji, image_src):
    pattern = r'(<article class="card shine-card project-card")>(\s*<div class="project-header">\s*<div class="project-icon">' + emoji + r'[\s\S]*?</article>)'
    
    def replacer(match):
        start = match.group(1)
        inner = match.group(2)
        inner = inner.rsplit('</article>', 1)[0] # remove the trailing closing tag
        
        if image_src:
            img_tag = f'<div style="width: 100%; height: 220px; overflow: hidden; border-bottom: 1px solid var(--theme-line);"><img src="{image_src}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'"></div>'
        else:
            img_tag = f'<div style="width: 100%; height: 220px; border-bottom: 1px solid var(--theme-line); background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.05)); display: flex; align-items: center; justify-content: center; font-size: 4rem;">{emoji}</div>'
            
        return f'{start} style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">\n{img_tag}\n<div style="padding: 2rem; display: flex; flex-direction: column; flex: 1;">\n{inner}\n</div>\n</article>'
    return re.sub(pattern, replacer, html)

html = inject_thumbnail('🤖', 'assets/images/vaccumbot.jpeg')
html = inject_thumbnail('🥽', 'assets/images/VR.jpeg')
html = inject_thumbnail('📐', 'assets/images/topology.jpeg')
html = inject_thumbnail('📊', '') # Generic gradient

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Project thumbnails correctly mounted across the grid.")
