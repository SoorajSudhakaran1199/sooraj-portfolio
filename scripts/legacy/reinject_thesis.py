import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

timeline_thesis = r'''<article class="timeline-item shine-card premium-hover-card">
    <div class="timeline-content" style="display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
                <div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white;">
                    <img src="assets/images/keba.png" alt="KEBA Group" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div>
                    <h3 style="font-size: 1.5rem; margin-bottom: 0.2rem;">Master Thesis in Industrial Robotics</h3>
                    <p class="muted" style="margin-bottom: 0.5rem;">KEBA Group, Linz, Austria</p>
                    <span class="meta-pill" style="display: inline-flex; font-size: 0.85rem;"><span class="spark"></span>Active Implementation</span>
                </div>
            </div>
            <div class="date" style="font-family: 'Space Mono', monospace; font-size: 0.9rem; color: var(--theme-accent); font-weight: bold; background: rgba(37,99,235,0.08); padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(37,99,235,0.2);">Oct 2024 - Apr 2025</div>
        </div>
        <p class="muted" style="margin-top: 1rem; line-height: 1.6;">Investigated and developed safe motion algorithms for multi-axis industrial robots. Implemented trajectory planning and collision avoidance using ROS/MoveIt! while ensuring highly robust deployment protocols for factory-floor automation cells.</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
            <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line);">Motion Planning</span>
            <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line);">ROS Workspace</span>
            <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line);">Collision Avoidance</span>
        </div>
    </div>
</article>'''

# Inject before Operations Engineer - Non-Destructive Testing
# Find the start of the article block that contains "Operations Engineer"
html = re.sub(
    r'(<article[^>]*>\s*<div[^>]*>[\s\S]*?Operations Engineer - Non-Destructive Testing)',
    timeline_thesis + r'\n\n\1',
    html
)

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Thesis reinjected gracefully.")
