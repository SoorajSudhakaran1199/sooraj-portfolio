import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# I will define the exact strings found in the file:
# <h3>Robot Operating System · edX</h3>
# <h3>Non-Destructive Testing Level 2</h3>
# <h3>Process Piping and Quality Control</h3>
# <h3>Internship in Mechatronics</h3>
# <h3>Telerobotics</h3>
# <h3>Industrial Thesis / Internship Certificate · KEBA Group</h3>
# <h3>AutoCAD Workshop</h3>

cert_icon = lambda color, svg: f'''<div class="card-icon" style="flex-shrink: 0; color: {color}; background: rgba(148,163,184,0.08); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid var(--theme-line);">
{svg}
</div>'''

icon_ros = cert_icon('var(--theme-accent)', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>')
icon_ndt = cert_icon('var(--text-primary)', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m12 18-7-7 7-7"/></svg>')
icon_piping = cert_icon('var(--text-primary)', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M14 2v20"/><path d="M3 10h18"/></svg>')
icon_internship = cert_icon('var(--theme-accent-2)', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>')
icon_telerobotics = cert_icon('#ec4899', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><circle cx="12" cy="12" r="3"/></svg>')
icon_keba = cert_icon('var(--theme-accent-2)', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 8 4 4-4 4"/><path d="M16 16V8"/></svg>')
icon_autocad = cert_icon('#ef4444', '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>')

# Replace exactly based on the h3 inner HTML bounds:
html = re.sub(r'(<h3>Robot Operating System · edX</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_ros + r'\1</div>', html)
html = re.sub(r'(<h3>Non-Destructive Testing Level 2</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_ndt + r'\1</div>', html)
html = re.sub(r'(<h3>Process Piping and Quality Control</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_piping + r'\1</div>', html)
html = re.sub(r'(<h3>Internship in Mechatronics</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_internship + r'\1</div>', html)
html = re.sub(r'(<h3>Telerobotics</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_telerobotics + r'\1</div>', html)
html = re.sub(r'(<h3>Industrial Thesis / Internship Certificate · KEBA Group</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_keba + r'\1</div>', html)
html = re.sub(r'(<h3>AutoCAD Workshop</h3>)', r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_autocad + r'\1</div>', html)

# Cleanup any potential margin overlaps:
html = html.replace(' margin-bottom:1rem;"><h3>', ' margin-bottom:0.5rem;"><h3 style="margin:0; font-size:1.3rem;">')

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
