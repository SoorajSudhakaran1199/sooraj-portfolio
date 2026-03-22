import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. CORE SKILLS UPGRADE
icon_robotics = '''<div class="card-icon" style="margin-bottom: 1.2rem; color: var(--theme-accent); background: rgba(37,99,235,0.08); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(37,99,235,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M12 20v2"/><path d="M5 9v6"/><path d="M19 9v6"/><path d="M9 22h6"/><path d="M9 2h6"/><path d="M5 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/><path d="M9 12h6"/></svg>
</div>'''

icon_programming = '''<div class="card-icon" style="margin-bottom: 1.2rem; color: var(--theme-accent-2); background: rgba(16,185,129,0.08); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid rgba(16,185,129,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
</div>'''

icon_sensing = '''<div class="card-icon" style="margin-bottom: 1.2rem; color: var(--text-primary); background: rgba(148,163,184,0.08); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid var(--theme-line);">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="4"/></svg>
</div>'''

html = re.sub(r'(<h3[^>]*>Robotics (?:&amp;|&) Control</h3>)', icon_robotics + r'\n\1', html)
html = re.sub(r'(<h3[^>]*>Programming (?:&amp;|&) Simulation</h3>)', icon_programming + r'\n\1', html)
html = re.sub(r'(<h3[^>]*>Sensing (?:&amp;|&) Engineering Tools</h3>)', icon_sensing + r'\n\1', html)


# 2. ACCOMPLISHMENTS UPGRADE
icon_trophy = '''<div class="card-icon" style="flex-shrink: 0; color: #f59e0b; background: rgba(245,158,11,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid rgba(245,158,11,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
</div>'''

icon_users = '''<div class="card-icon" style="flex-shrink: 0; color: var(--theme-accent); background: rgba(37,99,235,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid rgba(37,99,235,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
</div>'''

icon_robot_arm = '''<div class="card-icon" style="flex-shrink: 0; color: var(--theme-accent-2); background: rgba(16,185,129,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid rgba(16,185,129,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2h-6l-2.6 6H9c-1.7 0-3 1.3-3 3v2c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4v-2c0-1.7 1.3-3 3-3h2.6l2-6h3c1.1 0 2-.9 2-2s-.9-2-2-2z"/></svg>
</div>'''

icon_network = '''<div class="card-icon" style="flex-shrink: 0; color: #a855f7; background: rgba(168,85,247,0.1); width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid rgba(168,85,247,0.2);">
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>
</div>'''

html = re.sub(
    r'(<h3[^>]*>Best Bachelor Project Award</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_trophy + r'<h3 style="margin:0; font-size:1.3rem;">Best Bachelor Project Award</h3></div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Department Association Secretary</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_users + r'<h3 style="margin:0; font-size:1.3rem;">Department Association Secretary</h3></div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Industrial Robotics Thesis Experience</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_robot_arm + r'<h3 style="margin:0; font-size:1.3rem;">Industrial Robotics Thesis Experience</h3></div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Cross-Domain Engineering Portfolio</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_network + r'<h3 style="margin:0; font-size:1.3rem;">Cross-Domain Engineering Portfolio</h3></div>', 
    html
)

# 3. CERTIFICATES UPGRADE
arrow_svg = ''' <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left:5px; transition: transform 0.2s;"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>'''
html = re.sub(r'(View Certificate)(</a>)', r'\1' + arrow_svg + r'\2', html)

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

html = re.sub(
    r'(<h3[^>]*>ROS \(Robot Operating System\).*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_ros + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>NDT Level 2 \(ASNT\).*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_ndt + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Process Piping \(ASME\).*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_piping + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Internship on Quality Control.*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_internship + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Tele Robotics Technology.*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_telerobotics + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>Basic KEBA Systems Training.*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_keba + r'\1</div>', 
    html
)
html = re.sub(
    r'(<h3[^>]*>AutoCAD \(Mechanical\).*?</h3>)', 
    r'<div style="display:flex; align-items:center; gap: 1rem; margin-bottom:1rem;">' + icon_autocad + r'\1</div>', 
    html
)

# 4. UNIVERSAL HOVER CLASSES
html = re.sub(r'class="card glass-card"', 'class="card glass-card premium-hover-card"', html)
html = re.sub(r'class="btn btn-outline"', 'class="btn btn-outline premium-btn"', html)
# Clean up potential duplicates if the script is run multiple times
html = html.replace('premium-hover-card premium-hover-card', 'premium-hover-card')
html = html.replace('premium-btn premium-btn', 'premium-btn')

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 5. GLOBAL ANIMATIONS IN CSS
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make sure we don't append multiple times
css = re.sub(r'/\* ---- PREMIUM CARD INTERACTIONS ---- \*/[\s\S]*', '', css)

animation_styles = """
/* ---- PREMIUM CARD INTERACTIONS ---- */
.premium-hover-card {
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.premium-hover-card:hover {
    transform: scale(1.02);
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
}
[data-theme="dark"] .premium-hover-card:hover {
    box-shadow: 0 15px 35px rgba(0,0,0,0.4);
}

.card-icon {
    transition: transform 0.3s ease, filter 0.3s ease;
}
.premium-hover-card:hover .card-icon {
    transform: scale(1.1);
    filter: drop-shadow(0 0 8px currentColor);
}

.premium-btn {
    transition: all 0.3s ease !important;
    display: inline-flex;
    align-items: center;
}
.premium-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(37,99,235,0.2) !important;
}
.premium-btn:hover svg {
    transform: translate(3px, -3px);
}
"""

with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
    f.write(css + "\n" + animation_styles)

print("SVGs injected and CSS physics applied.")
