import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

# ---- GLOBE HIGHLIGHTS HTML REPLACEMENT ----
exact_globe_html = """<section id="highlights" class="reveal-on-scroll" style="margin-top: 5rem; margin-bottom: 5rem;">
  <div class="container">
    <div class="card shine-card exact-globe-card">
      <div class="exact-globe-content">
        <div class="eyebrow" style="color: var(--theme-accent-2); font-weight: bold; letter-spacing: 1px; margin-bottom: 0.8rem;">INTERNATIONAL TRANSITION</div>
        <h2 style="font-size: 2.8rem; margin-bottom: 1.2rem; line-height: 1.1;">From India to Germany</h2>
        <p class="muted" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem;">
          "A meaningful engineering journey is built not only by technical skills, but by consistency, leadership, and the courage to move toward a bigger vision."
        </p>
        <div class="globe-badges">
          <div class="glass-badge" style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2);">
            <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">M.Eng Mechatronics</strong>
            <span class="small" style="color: var(--theme-accent);">THD Germany</span>
          </div>
          <div class="glass-badge success" style="background: rgba(5,150,105,0.06); border: 1px solid rgba(5,150,105,0.2);">
            <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">Industrial Robotics</strong>
            <span class="small" style="color: var(--theme-accent-2);">KEBA Group</span>
          </div>
        </div>
      </div>
      
      <div class="exact-globe-wrapper">
         <div class="target-globe"></div>
         <svg class="flight-svg" viewBox="0 0 600 250">
             <path id="curve" d="M 120 200 Q 300 10 520 120" fill="none" stroke="var(--theme-accent-2)" stroke-width="4" stroke-dasharray="14 14" stroke-linecap="round"></path>
             <circle r="9" fill="var(--theme-success)" filter="drop-shadow(0 0 8px var(--theme-success))">
                <animateMotion dur="4s" repeatCount="indefinite" path="M 120 200 Q 300 10 520 120" />
             </circle>
             <circle cx="120" cy="200" r="9" fill="var(--theme-accent)" />
             <text x="50" y="235" fill="var(--theme-accent)" font-size="24" font-weight="bold">INDIA</text>
             
             <circle cx="520" cy="120" r="9" fill="var(--theme-accent-2)" />
             <text x="440" y="65" fill="var(--theme-accent-2)" font-size="32" font-weight="bold">GERMANY</text>
             <text x="510" y="95" fill="var(--theme-accent-2)" font-size="14" font-weight="bold">REGENSBURG</text>
             <text x="510" y="112" fill="var(--theme-accent-2)" font-size="11" font-weight="bold">GERMANY</text>
         </svg>
      </div>
    </div>
  </div>
</section>"""

# ---- NATIVE DETAILS HTML REPLACEMENT ----
native_timeline_html = """<div class="interactive-timeline">
          
          <details class="premium-details" name="journey">
            <summary class="premium-summary">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2017</span>
                 <h3>School Foundation</h3>
                 <span class="click-hint" style="font-size:0.85rem; margin-right:0.6rem; color:var(--text-muted); font-weight:normal; letter-spacing:0.5px;">Click to view</span><span class="expand-icon">+</span>
              </div>
            </summary>
            <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
               <div class="date">1st Standard to 12th Standard</div>
               <h4 style="margin: 0.5rem 0; font-size: 1.2rem;">CBSE · Sree Narayana Central School</h4>
               <p class="muted">My school journey was completed at Sree Narayana Central School, under the CBSE curriculum. This phase built the academic foundation, discipline, and curiosity that later supported my engineering path.</p>
               <ul class="clean" style="margin-bottom:0;">
                 <li>Completed 10th standard with an outstanding score of 98%.</li>
                 <li>Built a strong base in mathematics, science, discipline, and structured learning.</li>
               </ul>
            </div>
          </details>

          <details class="premium-details" name="journey">
            <summary class="premium-summary">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2017 - 2021</span>
                 <h3>Engineering & Leadership Formation</h3>
                 <span class="click-hint" style="font-size:0.85rem; margin-right:0.6rem; color:var(--text-muted); font-weight:normal; letter-spacing:0.5px;">Click to view</span><span class="expand-icon">+</span>
              </div>
            </summary>
            <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
               <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">B.Tech Mechanical Engineering · APJ Abdul Kalam Tech. University</h4>
               <p class="muted">Engineering journey quickly expanded beyond classrooms into leadership, organization building, and project-driven learning.</p>
               <ul class="clean">
                 <li>Served in leadership positions including President and Secretary of the Mechanical Engineering Department Association.</li>
                 <li><strong>Best Project Award:</strong> Developed a hospital service robot during the COVID-19 pandemic.</li>
                 <li>Developed communication, event coordination, and institutional engagement skills.</li>
               </ul>
            </div>
          </details>

          <details class="premium-details" name="journey">
            <summary class="premium-summary">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2022</span>
                 <h3>Early Career & Industry Transition</h3>
                 <span class="click-hint" style="font-size:0.85rem; margin-right:0.6rem; color:var(--text-muted); font-weight:normal; letter-spacing:0.5px;">Click to view</span><span class="expand-icon">+</span>
              </div>
            </summary>
            <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
               <div class="date">02/2022 – 09/2022</div>
               <h4 style="margin: 0.5rem 0; font-size: 1.2rem;">Non-Destructive Testing Technician</h4>
               <p class="muted">This role gave me real industrial field exposure and allowed me to apply inspection knowledge in a practical environment.</p>
               <ul class="clean" style="margin-bottom:0;">
                 <li>Performed NDT-based quality assessments to support structural integrity and engineering compliance.</li>
                 <li>Developed practical experience in industrial reporting, quality procedures, and technical responsibility.</li>
               </ul>
            </div>
          </details>

          <details class="premium-details" name="journey">
            <summary class="premium-summary">
              <div class="time-marker"><div class="time-dot live-dot-timeline"></div><div class="time-line" style="display:none;"></div></div>
              <div class="time-content-header" style="border-bottom: none;">
                 <span class="time-year" style="color: var(--theme-accent-2);">2023 - Present</span>
                 <h3>The Germany Dream & Industrial Robotics</h3>
                 <span class="click-hint" style="font-size:0.85rem; margin-right:0.6rem; color:var(--text-muted); font-weight:normal; letter-spacing:0.5px;">Click to view</span><span class="expand-icon">+</span>
              </div>
            </summary>
            <div class="timeline-content-inner card shine-card" style="margin: 0 0 1rem 4rem; padding: 1.5rem; border-color: var(--theme-accent-2);">
               <div class="date">03/2023 – Present</div>
               <h4 style="margin: 0.5rem 0; font-size: 1.2rem; color: var(--theme-accent-2);">M.Eng Mechatronics & KEBA Group Integration</h4>
               <p class="muted">Secured admission to Technische Hochschule Deggendorf. Progressed into direct industrial robotics work through my master’s thesis at KEBA Group.</p>
               <ul class="clean" style="margin-bottom:0;">
                 <li>Expanded from mechanical engineering into robotics, cyber-physical systems, XR, and intelligent systems.</li>
                 <li>Working as a student at KEBA Group, focusing on robot programming and deployment workflows.</li>
                 <li>Applying robotics, motion planning, and collision avoidance concepts in an industrial environment.</li>
               </ul>
            </div>
          </details>

        </div>"""

# Modify journey.html
with open(f'{PORTFOLIO}/journey.html', 'r', encoding='utf-8') as f:
    jny = f.read()

# Replace highlights container
jny = re.sub(r'<section id="highlights"[\s\S]*?</section>', exact_globe_html, jny, count=1)
# Replace interactive-timeline container
jny = re.sub(r'<div class="interactive-timeline">[\s\S]*?</div>\s*</div>\s*</section>', native_timeline_html + '\n      </div>\n    </section>', jny, count=1)
# Remove canvas node background
jny = re.sub(r'<canvas id="bg-canvas"></canvas>\s*', '', jny)
jny = re.sub(r'<script src="app.js"></script>\s*', '', jny)

with open(f'{PORTFOLIO}/journey.html', 'w', encoding='utf-8') as f:
    f.write(jny)


# ---- CSS UPDATES ----
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make transparent logos perfect
css = re.sub(r'\.experience-logo, \.edu-logo \{[^}]*\}', """.experience-logo, .edu-logo {
  width: 60px; height: 60px; object-fit: contain; flex-shrink: 0; padding: 4px;
  background: transparent !important; box-shadow: none !important; border: none !important;
}""", css)

# Advanced Light Mode Overrides added to the end
advanced_css = """
/* ---- Final UX Exact Implementations ---- */
[data-theme="light"] .meta-pill { color: #0f172a !important; border-color: rgba(0,0,0,0.1) !important; background: rgba(0,0,0,0.02); }
[data-theme="light"] .spark { color: #334155 !important; font-weight: 500; }
[data-theme="light"] .muted { color: #475569 !important; }
[data-theme="light"] .lead { color: #1e293b !important; font-weight: 500; }
[data-theme="light"] .project-tag { color: #0f172a !important; border-color: rgba(0,0,0,0.2) !important; background: rgba(0,0,0,0.04); }

/* Exact Globe UI */
.exact-globe-card { position: relative; overflow: visible !important; min-height: 400px; display: flex; align-items: center; padding: 3rem; border-radius: 20px; }
.exact-globe-content { width: 45%; position: relative; z-index: 2; }
.globe-badges { display: flex; gap: 1rem; flex-wrap: wrap; }
.exact-globe-wrapper { position: absolute; right: -40px; top: 50%; transform: translateY(-50%); width: 550px; height: 350px; pointer-events: none; z-index: 10; }
.target-globe {
  position: absolute; right: 50px; top: 50%; transform: translateY(-50%); width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #3b82f6, #0f172a);
  box-shadow: inset -20px -20px 40px rgba(0,0,0,0.6), 0 20px 40px rgba(0,0,0,0.3);
}
.target-globe::before {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg');
  background-size: cover; background-position: center; opacity: 0.25; filter: invert(1);
}
.flight-svg { position: absolute; top: 0; left: -250px; width: 620px; height: 100%; z-index: 20; }
@media (max-width: 1000px) {
  .exact-globe-card { flex-direction: column; padding: 2rem; overflow: hidden !important; }
  .exact-globe-content { width: 100%; }
  .exact-globe-wrapper { position: relative; right: auto; top: auto; transform: none; width: 100%; height: 300px; margin-top: 3rem; left: -20px; overflow: hidden; }
  .target-globe { right: 0; width: 220px; height: 220px; }
  .flight-svg { left: 0; width: 100%; }
}

/* Native Premium Details Timeline */
.premium-details { width: 100%; margin-bottom: 0; }
.premium-summary { display: flex; align-items: stretch; cursor: pointer; list-style: none; outline: none; }
.premium-summary::-webkit-details-marker { display: none; }
.premium-details[open] .expand-icon { transform: rotate(45deg); color: var(--theme-accent); }
.premium-details[open] .time-content-header { border-bottom-color: transparent; }
.premium-details[open] .timeline-content-inner { animation: slideDown 0.4s ease forwards; }
@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

/* Journey Deep Differentiation */
body.journey-page {
  background: radial-gradient(circle at top right, #0f172a, #020617), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e293b' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
  color: #f8fafc;
}
[data-theme="light"] body.journey-page {
  background: radial-gradient(circle at top right, #f8fafc, #f1f5f9), url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394a3b8' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") !important;
}
"""

with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
    f.write(css + '\n' + advanced_css)

print("Exact UX feedback updates applied.")
