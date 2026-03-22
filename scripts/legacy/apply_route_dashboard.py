import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/journey.html', 'r', encoding='utf-8') as f:
    jny = f.read()

# 1. Start Journey button fix
jny = re.sub(r'<a[^>]*>Start the Journey</a>', '<a href="#highlights" class="btn hover-scale" style="position:relative; z-index:100; padding:1.2rem 2.4rem; font-size:1.1rem;">Start the Journey</a>', jny)

# Also fix Back to Portfolio button at top
jny = re.sub(r'<a[^>]*>← Back to Portfolio</a>', '<a href="index.html" class="btn btn-outline hover-scale" style="position:relative; z-index:100;">← Back to Portfolio</a>', jny)

# 2. Complete globe replacement with "Premium Route Dashboard"
premium_route_html = """<section id="highlights" class="reveal-on-scroll" style="margin-top: 5rem; margin-bottom: 5rem;">
  <div class="container">
    <div class="card shine-card" style="padding: 4rem; position: relative; overflow: hidden !important; background: var(--card-bg);">
      
      <!-- Content Top -->
      <div style="text-align: center; margin-bottom: 4rem; position: relative; z-index: 2;">
        <div class="eyebrow" style="color: var(--theme-accent-2); font-weight: bold; letter-spacing: 2px; margin-bottom: 1rem; text-transform: uppercase;">International Transition</div>
        <h2 style="font-size: 3rem; margin-bottom: 1.5rem; line-height: 1.1;">From India to Germany</h2>
        <p class="muted mx-auto" style="font-size: 1.2rem; line-height: 1.6; max-width: 700px;">
          "A meaningful engineering journey is built not only by technical skills, but by consistency, leadership, and the courage to move toward a bigger vision."
        </p>
      </div>
      
      <!-- Premium Route Dashboard -->
      <div class="route-dashboard" style="display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 2; margin-top: 2rem; background: rgba(0,0,0,0.02); border-radius: 20px; padding: 3rem; border: 1px solid var(--theme-line);">
        
        <!-- India Node -->
        <div class="route-node" style="width: 25%; text-align: center; position: relative;">
            <div class="pulse-ring" style="width: 80px; height: 80px; background: rgba(37,99,235,0.1); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(37,99,235,0.3); position: relative;">
                <div style="width: 20px; height: 20px; background: #2563eb; border-radius: 50%; box-shadow: 0 0 15px #2563eb;"></div>
                <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #2563eb; animation: ripple 2s infinite;"></div>
            </div>
            <h3 style="margin-top: 1.5rem; font-size: 1.8rem; margin-bottom: 0.5rem;">India</h3>
            <p class="muted" style="margin-bottom: 0;">Foundation</p>
            <div class="glass-badge mx-auto" style="margin-top:1rem; display:inline-block; font-size:0.9rem; border: 1px solid rgba(37,99,235,0.2);">B.Tech Mech</div>
        </div>

        <!-- Connection Arc -->
        <div class="route-connection" style="width: 50%; height: 120px; position: relative;">
            <svg viewBox="0 0 200 100" preserveAspectRatio="none" style="width: 100%; height: 100%; overflow: visible;">
                <!-- Dashed Arc -->
                <path id="route-arc" d="M 0 80 Q 100 -20 200 80" fill="none" stroke="var(--theme-accent-2)" stroke-width="3" stroke-dasharray="8 8" stroke-linecap="round"></path>
                <!-- Animated Dot -->
                <circle r="6" fill="#10b981" filter="drop-shadow(0 0 10px #10b981)">
                    <animateMotion dur="3.5s" repeatCount="indefinite" path="M 0 80 Q 100 -20 200 80" />
                </circle>
            </svg>
            <div class="route-distance" style="position: absolute; width: 100%; text-align: center; top: 120px; color: var(--text-muted); font-size: 0.95rem; font-weight: 600; letter-spacing: 3px; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">✈️</span> 7,000+ KM
            </div>
        </div>

        <!-- Germany Node -->
        <div class="route-node" style="width: 25%; text-align: center; position: relative;">
            <div class="pulse-ring" style="width: 80px; height: 80px; background: rgba(16,185,129,0.1); border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(16,185,129,0.3); position: relative;">
                <div style="width: 20px; height: 20px; background: #10b981; border-radius: 50%; box-shadow: 0 0 15px #10b981;"></div>
                <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; border: 2px solid #10b981; animation: ripple 2s infinite; animation-delay: 1s;"></div>
            </div>
            <h3 style="margin-top: 1.5rem; font-size: 1.8rem; margin-bottom: 0.5rem;">Germany</h3>
            <p class="muted" style="margin-bottom: 0;">Industrial Robotics</p>
            <div class="glass-badge mx-auto success" style="margin-top:1rem; display:inline-block; font-size:0.9rem; border: 1px solid rgba(16,185,129,0.2);">M.Eng Mechatronics</div>
        </div>

      </div>

    </div>
  </div>
</section>"""
jny = re.sub(r'<section id="highlights"[\s\S]*?</section>', premium_route_html, jny, count=1)

with open(f'{PORTFOLIO}/journey.html', 'w', encoding='utf-8') as f:
    f.write(jny)


# 4. CSS Updates
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# I need to wipe out the old globe styles `.exact-globe-card`, `.robust-globe`
css = re.sub(r'/\* ---- ROBUST 3D CSS GLOBE ---- \*/[\s\S]*?(?=\/\* Enhancing Timeline UI \*/)', '', css)

dashboard_css = """
/* ---- PREMIUM FLIGHT DASHBOARD ---- */
.hover-scale { transition: transform 0.3s ease; } .hover-scale:hover { transform: scale(1.05); }

@keyframes ripple {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

@media (max-width: 900px) {
  .route-dashboard { flex-direction: column !important; padding: 2rem !important; }
  .route-node { width: 100% !important; margin-bottom: 3rem; }
  .route-connection { width: 100% !important; height: 120px !important; margin-bottom: 3rem; margin-top: -1rem; transform: rotate(90deg); }
  .route-distance { top: -25px !important; transform: rotate(-90deg); margin-left: 50px; }
}

"""

# Ensure we remove the deeply nested grids to replace them
css = css.replace('/* Architectural Engineering Background for Journey */', '/* OLD JOURNEY GRID REMOVED */')
css = re.sub(r'body\.journey-page\s*{[^}]*}', '', css)
css = re.sub(r'\[data-theme="light"\]\s*body\.journey-page\s*{[^}]*}', '', css)

strong_differentiation = """
/* Extremely distinct Journey Background */
body.journey-page {
   background-color: #0b1121 !important;
   background-image: 
       radial-gradient(ellipse at top, rgba(37, 99, 235, 0.15) 0%, transparent 60%),
       radial-gradient(ellipse at bottom, rgba(16, 185, 129, 0.15) 0%, transparent 60%),
       linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
       linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px) !important;
   background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px !important;
   background-position: center !important;
   background-attachment: fixed !important;
}

[data-theme="light"] body.journey-page {
   background-color: #f1f5f9 !important;
   background-image: 
       radial-gradient(ellipse at top, rgba(37, 99, 235, 0.08) 0%, transparent 60%),
       radial-gradient(ellipse at bottom, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
       linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
       linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px) !important;
   background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px !important;
   background-position: center !important;
   background-attachment: fixed !important;
}

/* Make Timeline Accordions slightly more padded and prominent */
.premium-details { margin-bottom: 1.5rem; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; overflow: hidden; box-shadow: var(--card-shadow); transition: transform 0.3s ease, box-shadow 0.3s ease; }
.premium-details:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
.premium-summary { padding: 1.5rem; border-radius: 16px; }
.timeline-content-inner { background: transparent; box-shadow: none; border: none; padding: 0 1.5rem 2rem 4rem !important; }
[data-theme="light"] .route-dashboard { background: rgba(0,0,0,0.03) !important; }
"""

with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
    f.write(css + '\n' + dashboard_css + '\n' + strong_differentiation)

print("Premium Route Dashboard and Topographic Deepening Implemented.")
