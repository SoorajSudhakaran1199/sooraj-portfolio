import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

timeline_block = '''<div class="optical-timeline-container">
    
    <!-- 1. WORKING STUDENT (TOP / NEWEST) -->
    <article class="timeline-item primary-experience shine-card premium-hover-card" style="margin-bottom: 3rem;">
        <div class="timeline-content">
            <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
                    <div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; padding: 0.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <img src="assets/images/keba.png" alt="KEBA Group" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.2rem; color: var(--text-primary);">Working Student – KEBA Group</h3>
                        <p class="muted" style="margin-bottom: 0.5rem;">Stuttgart, Baden-Württemberg, Germany – On-site</p>
                        <span class="meta-pill" style="display: inline-flex; font-size: 0.85rem; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10b981;"><span class="spark" style="background: #10b981; box-shadow: 0 0 8px #10b981;"></span>Present Active Role</span>
                    </div>
                </div>
            </div>
            <p class="muted" style="line-height: 1.6; color: var(--text-secondary);">Currently contributing to specialized robotics projects and control engineering frameworks, engaging directly with live automation deployment and testing routines.</p>
             <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Automation</span>
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Machine Control</span>
            </div>
        </div>
    </article>

    <!-- 2. MASTER THESIS (MIDDLE) -->
    <article class="timeline-item shine-card premium-hover-card" style="margin-bottom: 3rem;">
        <div class="timeline-content">
            <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
                    <div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: white; padding: 0.5rem; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <img src="assets/images/keba.png" alt="KEBA Group" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.2rem; color: var(--text-primary);">Master Thesis · KEBA Group / Drag&Bot</h3>
                        <p class="muted" style="margin-bottom: 0.5rem;">Stuttgart, Baden-Württemberg, Germany – On-site</p>
                    </div>
                </div>
                <div class="date" style="font-family: 'Space Mono', monospace; font-size: 0.9rem; color: var(--theme-accent); font-weight: bold; background: rgba(37,99,235,0.08); padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(37,99,235,0.2);">09/2025 - 03/2026</div>
            </div>
            <p class="muted" style="line-height: 1.6; color: var(--text-secondary);">Developed a 6-axis autonomous robot capable of operating machines through advanced robotics, motion planning, and industrial automation workflows. Focused on bridging robotics theory with real-world deployment using control systems, simulation, and deployment-ready integration.</p>
            <ul style="margin-top: 1rem; padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; list-style: square;">
                <li>Developed robot programming workflows for industrial machine operation</li>
                <li>Worked on motion planning, re-grip logic, and collision-aware execution</li>
                <li>Integrated simulation and real-cell constraints for deployment readiness</li>
                <li>Contributed to practical industrial automation use cases</li>
            </ul>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.2rem;">
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Robotics</span>
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Motion Planning</span>
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Automation</span>
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">ROS / WebSocket</span>
                <span class="project-tag" style="font-size: 0.8rem; padding: 0.3rem 0.8rem; border-radius: 4px; background: rgba(255,255,255,0.05); border: 1px solid var(--theme-line); color: var(--text-primary);">Collision Avoidance</span>
            </div>
        </div>
    </article>

    <!-- 3. NON-DESTRUCTIVE TESTING (BOTTOM / OLDEST) -->
    <article class="timeline-item shine-card premium-hover-card">
        <div class="timeline-content">
            <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; gap: 1.5rem; align-items: flex-start;">
                    <div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(245,158,11,0.05); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                    </div>
                    <div>
                        <h3 style="font-size: 1.5rem; margin-bottom: 0.2rem; color: var(--text-primary);">Non-Destructive Testing Technician</h3>
                        <p class="muted" style="margin-bottom: 0.5rem;">United Engineering and Construction Co. | Kochi, Kerala, India – On-site</p>
                    </div>
                </div>
                <div class="date" style="font-family: 'Space Mono', monospace; font-size: 0.9rem; color: var(--theme-accent); font-weight: bold; background: rgba(37,99,235,0.08); padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(37,99,235,0.2);">02/2022 - 09/2022</div>
            </div>
            <p class="muted" style="line-height: 1.6; color: var(--text-secondary);">Conducted rigorous mechanical inspections and data logging utilizing advanced NDT methodologies ensuring structural integrity pipelines and heavy machinery components.</p>
        </div>
    </article>
</div>'''

thesis_highlight = '''</section>

<!-- Section: Master Thesis Highlight -->
<section id="thesis-highlight" class="reveal-on-scroll" style="margin-top: 4rem; margin-bottom: 5rem;">
    <div class="container">
        <div class="card glass-card premium-hover-card" style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 3rem; align-items: stretch; padding: 3rem; border-radius: 24px; background: var(--card-bg); border: 1px solid var(--theme-line);">
            <div style="flex: 1; min-width: 300px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                <img src="assets/images/keba-thesis.jpeg" alt="Master Thesis Integration" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1.5; min-width: 300px; display: flex; flex-direction: column; justify-content: center;">
                <h2 style="font-size: 2.2rem; margin-bottom: 0.5rem; color: var(--text-primary);">Master Thesis Highlight</h2>
                <h4 style="color: var(--theme-accent); margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: bold;">6-Axis Autonomous Robot Deployment</h4>
                <p class="muted" style="margin-bottom: 1.5rem; line-height: 1.7; color: var(--text-secondary);">
                    The core of my thesis was translating complex robotics theory into tangible industrial automation. By integrating a <strong>6-axis autonomous robot</strong> within the KEBA / Drag&Bot ecosystem, I architected a bridge between software simulations and actual shop-floor machine operations.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 0.5rem;">
                    <div style="display: flex; gap: 0.7rem; align-items: center; color: var(--text-primary); font-weight: 500;"><svg width="20" height="20" fill="none" class="feature-icon" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Industrial Automation</div>
                    <div style="display: flex; gap: 0.7rem; align-items: center; color: var(--text-primary); font-weight: 500;"><svg width="20" height="20" fill="none" class="feature-icon" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Robotics Deployment</div>
                    <div style="display: flex; gap: 0.7rem; align-items: center; color: var(--text-primary); font-weight: 500;"><svg width="20" height="20" fill="none" class="feature-icon" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Real-Cell Constraints</div>
                    <div style="display: flex; gap: 0.7rem; align-items: center; color: var(--text-primary); font-weight: 500;"><svg width="20" height="20" fill="none" class="feature-icon" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Re-grip Logic</div>
                </div>
            </div>
        </div>
    </div>
</section>'''

# Apply string replacements to safely rewrite the subagent's changes
# The subagent renamed `<div class="optical-timeline-container">` to `<div class="timeline">`. Which is evident in view_file.
html = re.sub(
    r'<div class="timeline">[\s\S]*?</section>',
    timeline_block + '\n        </div>\n      </div>\n    ' + thesis_highlight,
    html
)

# Fix the dummy "<!-- NEW MASTER THESIS SECTION -->"
html = re.sub(r'<!-- NEW MASTER THESIS SECTION -->', '', html)

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("DOM restored and Timeline securely mounted with high-contrast text tags.")
