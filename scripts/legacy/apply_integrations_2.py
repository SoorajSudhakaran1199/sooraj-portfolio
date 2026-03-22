import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. CORE SKILLS: Professional Brand Tags
def build_brands(brands):
    tags = ''.join([f'<span style="padding: 0.3rem 0.8rem; border: 1px solid var(--theme-line); border-radius: 6px; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; cursor: default;">{b}</span>' for b in brands])
    return f'<div class="skill-brands" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--theme-line);">{tags}</div>'

robotics_brands = build_brands(['ROS / ROS2', 'MoveIt', 'C++'])
programming_brands = build_brands(['Python', 'MATLAB', 'Simulink', 'Git'])
sensing_brands = build_brands(['OpenCV', 'LiDAR', 'AutoCAD', 'PLC'])

html = re.sub(r'(<p class="muted">ROS/ROS2, navigation, SLAM, motion control, trajectory planning, robot programming, sensor integration, and safety-aware motion planning.</p>)\s*(</article>)', r'\1\n' + robotics_brands + r'\n\2', html)
html = re.sub(r'(<p class="muted">Python, C\+\+, MATLAB, Simulink, Arduino, Raspberry Pi, industrial communication protocols, and control logic development.</p>)\s*(</article>)', r'\1\n' + programming_brands + r'\n\2', html)
html = re.sub(r'(<p class="muted">Hardware deployment, sensor interfaces, debugging, circuit design, control panel wiring, quality control inspections, and CAD modeling.</p>)\s*(</article>)', r'\1\n' + sensing_brands + r'\n\2', html)

# 2. EXPERIENCE OPTICAL TIMELINE & MASTER THESIS INTEGRATION
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

# Inject thesis
html = re.sub(
    r'(<article class="timeline-item shine-card">[\s\S]*?Operations Engineer - Non-Destructive Testing)',
    timeline_thesis + r'\n\n\1',
    html
)

# Strip out old thesis block
html = re.sub(r'<section id="thesis"[\s\S]*?</section>', '', html)

# Wrap experience section
html = re.sub(
    r'(<section id="experience"[^>]*>[\s\S]*?)(<div class="grid grid-1">)',
    r'\1<div class="optical-timeline-container">\n\2',
    html
)

html = re.sub(
    r'(</section>)([\s\S]*?<!-- Section: Selected Projects -->)',
    r'</div>\n\1\2',
    html
)

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)


with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

timeline_css = """
/* --- OPTICAL VERTICAL TIMELINE --- */
@media (min-width: 900px) {
    .optical-timeline-container {
        position: relative;
        padding-left: 2.5rem;
    }
    .optical-timeline-container::before {
        content: '';
        position: absolute;
        left: 0;
        top: 2rem;
        bottom: 2rem;
        width: 3px;
        background: linear-gradient(to bottom, rgba(37,99,235,1) 0%, rgba(16,185,129,0.8) 50%, rgba(37,99,235,0.1) 100%);
        box-shadow: 0 0 12px rgba(37,99,235,0.4);
        z-index: 1;
        border-radius: 4px;
    }

    .timeline-item {
        position: relative;
        overflow: visible !important;
    }

    .timeline-item::before {
        content: '';
        position: absolute;
        left: -3rem;
        top: 2rem;
        width: 18px;
        height: 18px;
        background: var(--card-bg);
        border: 3px solid var(--theme-accent);
        border-radius: 50%;
        z-index: 3;
        box-shadow: 0 0 10px var(--theme-accent);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    
    .timeline-item.primary-experience::before {
        background: var(--theme-accent);
        border-color: #fff;
        box-shadow: 0 0 20px var(--theme-accent);
        animation: pulseAccent 3s infinite;
    }
    
    .timeline-item:hover::before {
        transform: scale(1.3);
        box-shadow: 0 0 25px var(--theme-accent-2);
        border-color: var(--theme-accent-2);
    }
}

.skill-brands span {
    transition: all 0.3s ease;
}
.skill-brands span:hover {
    color: var(--text-primary);
    border-color: var(--theme-accent);
    background: rgba(37,99,235,0.1) !important;
    box-shadow: 0 0 15px rgba(37,99,235,0.2) !important;
    transform: translateY(-2px);
}
"""

with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
    f.write(css + "\n" + timeline_css)

print("Timeline engineered and brand badges installed.")
