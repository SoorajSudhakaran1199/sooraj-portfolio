import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I will replace class="timeline-content" with class="experience-content" 
# only within the <div class="optical-timeline-container"> segment.

def fix_timeline(match):
    block = match.group(0)
    # Safely replace timeline-content with experience-content
    block = block.replace('class="timeline-content"', 'class="experience-content"')
    return block

html = re.sub(r'<div class="optical-timeline-container">[\s\S]*?</div>\s*</div>', fix_timeline, html)

# Wait, in the optical-timeline-container, I have 3 `<article>` tags. I'll just replace it globally 
# in the entire experience and thesis highlight sections since I don't use the collapsible journey logic there.

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Experience content unmasked.")
