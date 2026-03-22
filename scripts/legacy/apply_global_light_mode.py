import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

# Define the variable mappings
var_map = {
    r'var\(--text\)': 'var(--text-primary)',
    r'var\(--muted\)': 'var(--text-muted)',
    r'var\(--bg\)': 'var(--bg-primary)',
    r'var\(--panel\)': 'var(--bg-secondary)',
    r'var\(--panel-2\)': 'var(--bg-secondary)',
    r'var\(--accent\)': 'var(--theme-accent)',
    r'var\(--accent-2\)': 'var(--theme-accent-2)',
    r'var\(--success\)': 'var(--theme-success)',
    r'var\(--line\)': 'var(--theme-line)',
    r'var\(--line-strong\)': 'var(--theme-line-strong)',
    r'var\(--shadow\)': 'var(--card-shadow)',
    r'var\(--shadow-soft\)': 'var(--card-shadow)'
}

for filename in ['index.html', 'journey.html', 'style.css']:
    try:
        with open(f'{PORTFOLIO}/{filename}', 'r', encoding='utf-8') as f:
            content = f.read()

        for old, new in var_map.items():
            content = re.sub(old, new, content)

        # Explicitly patch `body` background for Light Mode inside style.css
        if filename == 'style.css':
            # Check if there's already a clean override for body
            if '[data-theme="light"] body' not in content:
                content += "\n\n/* GLOBAL LIGHT MODE FALLBACKS */\n"
                content += '[data-theme="light"] body { background: var(--bg-primary) !important; color: var(--text-primary) !important; }\n'
                content += '[data-theme="light"] .card, [data-theme="light"] .hero-card, [data-theme="light"] .timeline-item { background: var(--card-bg) !important; border-color: var(--theme-line) !important; }\n'
                content += '[data-theme="light"] .meta-item, [data-theme="light"] .stat-box { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.1) !important; }\n'
                content += '[data-theme="light"] .btn { background: #fff !important; color: #0f172a !important; border-color: rgba(0,0,0,0.2) !important; }\n'
                content += '[data-theme="light"] .eyebrow { background: rgba(0,0,0,0.05) !important; border-color: rgba(0,0,0,0.1) !important; color: var(--theme-accent) !important; }\n'
                content += '[data-theme="light"] h1, [data-theme="light"] h2, [data-theme="light"] h3, [data-theme="light"] h4 { color: var(--text-primary) !important; }\n'

        with open(f'{PORTFOLIO}/{filename}', 'w', encoding='utf-8') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Failed on {filename}: {e}")

print("Normalized variables and injected comprehensive Light Mode DOM overrides.")
