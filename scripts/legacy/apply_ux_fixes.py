import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# 1. Hero text replace
idx = idx.replace("Master’s Thesis · KEBA Group", "WORKING STUDENT – KEBA GROUP (PRESENT)")

# 2. Project card overlay extraction
new_projects = """<section id="projects" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Selected Projects</h2>
            <p>Academic and hands-on projects demonstrating robotics, simulation, optimization, and embedded systems work.</p>
          </div>
        </div>

        <div class="grid grid-2">
          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
              <img src="assets/images/project1.png" alt="Autonomous Vacuum Robot" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Project+1+Placeholder'">
            </div>
            <div class="project-content">
              <div class="date">03/2024 – 06/2024</div>
              <h3>Autonomous Vacuum Robot in ROS</h3>
              <p class="muted">Designed and implemented an autonomous vacuum robot with real-time localization using SLAM, sensor fusion, obstacle detection, and optimized path planning.</p>
              <div class="project-meta" style="margin-top: auto; margin-bottom: 1.5rem;">
                <span class="project-tag">ROS</span>
                <span class="project-tag">SLAM</span>
                <span class="project-tag">Autonomy</span>
              </div>
              <div class="button-row">
                <a class="btn btn-small" href="https://github.com/SoorajSudhakaran1199/vaccumbot" target="_blank" rel="noreferrer">View Source</a>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
              <img src="assets/images/project2.png" alt="VR Workshop" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Project+2+Placeholder'">
            </div>
            <div class="project-content">
              <div class="date">03/2024 – 06/2024</div>
              <h3>VR Workshop to Operate a Machine</h3>
              <p class="muted">Developed an interactive VR-based machine operation workshop with real-time simulation, motion tracking, and authentic user interaction.</p>
              <div class="project-meta" style="margin-top: auto; margin-bottom: 1.5rem;">
                <span class="project-tag">Unity</span>
                <span class="project-tag">VR</span>
                <span class="project-tag">Training</span>
              </div>
              <div class="button-row">
                <span class="btn btn-small" style="cursor:default;">Academic Project</span>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
               <img src="assets/images/project3.png" alt="Topology Optimization" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Project+3+Placeholder'">
            </div>
            <div class="project-content">
              <div class="date">10/2023 – 01/2024</div>
              <h3>Topology Optimised Temporary Bag Sealer</h3>
              <p class="muted">Applied FEA-driven topology optimization in SOLIDWORKS, achieving weight reduction and material cost savings.</p>
              <div class="project-meta" style="margin-top: auto; margin-bottom: 1.5rem;">
                <span class="project-tag">SOLIDWORKS</span>
                <span class="project-tag">FEA</span>
                <span class="project-tag">Optimization</span>
              </div>
              <div class="button-row">
                <span class="btn btn-small" style="cursor:default;">Design Optimization Project</span>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
               <img src="assets/images/project4.png" alt="Active Suspension" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Project+4+Placeholder'">
            </div>
            <div class="project-content">
              <div class="date">10/2023 – 01/2024</div>
              <h3>Active Suspension System Modeling</h3>
              <p class="muted">Modeled an active suspension system with hydraulic actuators for real-time suspension control and performance analysis.</p>
              <div class="project-meta" style="margin-top: auto; margin-bottom: 1.5rem;">
                <span class="project-tag">MATLAB</span>
                <span class="project-tag">Simulink</span>
                <span class="project-tag">Modeling</span>
              </div>
              <div class="button-row">
                <span class="btn btn-small" style="cursor:default;">Simulation Project</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>"""
idx = re.sub(r'<section id="projects"[\s\S]*?</section>', new_projects, idx, count=1)

# Fix Experience format
idx = idx.replace("📍 Stuttgart, Germany · On-site", "📍 Stuttgart, Baden-Württemberg, Germany – On-site")
idx = idx.replace("assets/keba_logo.png", "assets/images/keba_logo.png")
idx = idx.replace("assets/thesis_robot.png", "assets/images/thesis_robot.png")
idx = idx.replace("assets/thd_logo.png", "assets/images/thd_logo.png")
idx = idx.replace("assets/apj_logo.png", "assets/images/apj_logo.png")

write(f'{PORTFOLIO}/index.html', idx)

# JOURNEY MAPPING fixes
with open(f'{PORTFOLIO}/journey.html', 'r', encoding='utf-8') as f:
    jny = f.read()

jny = jny.replace('<body>', '<body class="journey-page">')

# Cinematic globe wrapper injection 
cinematic_globe = """<div class="globe-container">
             <div class="globe-cinematic-wrapper">
               <div class="css-globe">
                 <div class="globe-map"></div>
                 <div class="globe-shading"></div>
               </div>
               <svg class="flight-svg" viewBox="0 0 300 200">
                   <path d="M 60 140 Q 150 20 250 80" fill="none" stroke="var(--theme-accent-2)" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"></path>
                   <circle r="6" fill="var(--theme-success)" filter="drop-shadow(0 0 10px var(--theme-success))">
                      <animateMotion dur="6s" repeatCount="indefinite" path="M 60 140 Q 150 20 250 80" />
                   </circle>
                   <circle cx="60" cy="140" r="5" fill="var(--theme-accent)" />
                   <text x="35" y="165" fill="var(--theme-accent)" font-size="14" font-weight="bold">INDIA</text>
                   <circle cx="250" cy="80" r="5" fill="var(--theme-accent-2)" />
                   <text x="215" y="60" fill="var(--theme-accent-2)" font-size="12" font-weight="bold">REGENSBURG</text>
                   <text x="215" y="75" fill="var(--theme-accent-2)" font-size="10" font-weight="bold">GERMANY</text>
               </svg>
             </div>
          </div>"""
jny = re.sub(r'<div class="globe-container">[\s\S]*?</div>\s*</div>', cinematic_globe + '\n        </div>', jny, count=1)

# Add "Click to view" hints to timeline headers
jny = jny.replace('<span class="expand-icon">+', '<span class="click-hint" style="font-size:0.85rem; margin-right:0.6rem; color:var(--text-muted); font-weight:normal; letter-spacing:0.5px;">Click to view</span><span class="expand-icon">+</span>')

# Footprint fixes (Remove travel-map-bg class completely and highlight Germany explicitly)
jny = re.sub(r'<h3 style="margin: 0;">Germany</h3>', r'<h3 style="margin: 0; display:flex; align-items:center;">Germany <span class="active-residence-badge" style="font-size:0.7rem; color:var(--theme-accent-2); margin-left:0.8rem; border:1px solid var(--theme-accent-2); padding:0.15rem 0.5rem; border-radius:12px; letter-spacing:1px;">ACTIVE RESIDENCE</span></h3>', jny)

write(f'{PORTFOLIO}/journey.html', jny)

# STYLES UPDATE (Light mode fix and cinematic)
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

light_mode = """[data-theme="light"] {
  --bg-color-1: #fdfdfd;
  --bg-color-2: #f8fafc;
  --bg-color-3: #f1f5f9;
  --bg-radial-1: rgba(37, 99, 235, 0.08);
  --bg-radial-2: rgba(5, 150, 105, 0.06);
  --text-primary: #0f172a;
  --text-muted: #334155;
  --theme-accent: #2563eb;
  --theme-accent-2: #059669;
  --theme-success: #16a34a;
  --theme-line: rgba(0, 0, 0, 0.12);
  --theme-line-strong: rgba(0, 0, 0, 0.2);
  
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-bg-hover: #ffffff;
  --card-border: rgba(0, 0, 0, 0.1);
  --card-border-hover: rgba(37, 99, 235, 0.4);
  --card-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
  --card-shadow-hover: 0 24px 48px rgba(0, 0, 0, 0.12), 0 0 35px rgba(37, 99, 235, 0.12);
  
  --nav-bg: rgba(255, 255, 255, 0.95);
  --nav-border: rgba(0, 0, 0, 0.1);

  --btn-bg: rgba(255, 255, 255, 1);
  --btn-border: rgba(0, 0, 0, 0.2);
  --btn-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  --btn-hover-shadow: 0 16px 32px rgba(0,0,0,0.15), 0 0 24px rgba(37, 99, 235, 0.25);

  --hero-title-gradient: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  
  --milestone-dot: #059669;
  --milestone-dot-glow: rgba(5, 150, 105, 0.5);
}"""
css = re.sub(r'\[data-theme="light"\]\s*{[^}]*}', light_mode, css, count=1)

cinematic_css = """
/* Visual Differentiation: Journey Immersive */
[data-theme="dark"] body.journey-page {
  background: radial-gradient(circle at 10% 10%, var(--bg-radial-1), transparent 45%), radial-gradient(circle at 85% 85%, var(--bg-radial-2), transparent 45%), linear-gradient(180deg, var(--bg-color-1) 0%, #030408 100%) !important;
}
/* Journey Globe Cinematic Zoom */
.globe-cinematic-wrapper {
  animation: cinematicFlight 6s infinite cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; position: relative;
}
@keyframes cinematicFlight {
  0%, 15% { transform: scale(1) translate(0, 0); }
  30%, 45% { transform: scale(1.6) translate(30px, -20px); }
  60%, 75% { transform: scale(1.6) translate(-60px, 10px); }
  90%, 100% { transform: scale(1) translate(0, 0); }
}
/* Stronger light mode specific tag borders */
[data-theme="light"] .project-tag { border-color: rgba(0,0,0,0.2) !important; color: #1e293b !important; }
[data-theme="light"] .active-residence-badge { background: rgba(5, 150, 105, 0.1); font-weight: bold; }
/* Completely hide footprints bg maps */
.travel-map-bg { display: none !important; }
.timeline-toggle:hover .click-hint { color: var(--theme-accent) !important; }
"""
write(f'{PORTFOLIO}/style.css', css + '\n' + cinematic_css)
print("Applied Python Script UX Fixes.")
