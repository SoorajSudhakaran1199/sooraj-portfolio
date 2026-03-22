import re

html_file = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/journey.html"
css_file = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/style.css"

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. NEW HIGHLIGHTS SECTION WITH CSS GLOBE
highlights_html = """<section id="highlights" class="reveal-on-scroll" style="margin-top: 3rem; margin-bottom: 2rem;">
      <div class="container">
        <div class="card shine-card highlight-grid">
          
          <div style="z-index: 2; padding: 1.5rem;">
            <div class="eyebrow" style="color: var(--theme-accent-2); margin-bottom: 0.8rem; font-weight: bold; letter-spacing: 1px;">INTERNATIONAL TRANSITION</div>
            <h2 style="font-size: 2.4rem; margin-bottom: 1.2rem; line-height: 1.2;">From India to Germany</h2>
            <p class="muted" style="margin-bottom: 2rem; font-size: 1.1rem; line-height: 1.6;">
              "A meaningful engineering journey is built not only by technical skills, but by consistency, leadership, and the courage to move toward a bigger vision."
            </p>
            <div class="timeline-meta" style="display: flex; gap: 1rem; align-items: stretch; flex-wrap: wrap;">
              <div class="glass-badge">
                <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">M.Eng Mechatronics</strong>
                <span class="small" style="color: var(--theme-accent);">THD Germany</span>
              </div>
              <div class="glass-badge success">
                <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">Industrial Robotics</strong>
                <span class="small" style="color: var(--theme-accent-2);">KEBA Group</span>
              </div>
            </div>
          </div>
          
          <div class="globe-container">
             <div class="css-globe">
               <div class="globe-map"></div>
               <div class="globe-shading"></div>
             </div>
             <svg class="flight-svg" viewBox="0 0 300 200">
                 <path d="M 60 140 Q 150 20 250 80" fill="none" stroke="var(--theme-accent-2)" stroke-width="3" stroke-dasharray="6 6" stroke-linecap="round"></path>
                 <circle r="6" fill="var(--theme-success)" filter="drop-shadow(0 0 10px var(--theme-success))">
                    <animateMotion dur="3.5s" repeatCount="indefinite" path="M 60 140 Q 150 20 250 80" />
                 </circle>
                 <circle cx="60" cy="140" r="5" fill="var(--theme-accent)" />
                 <text x="35" y="165" fill="var(--theme-accent)" font-size="14" font-weight="bold">INDIA</text>
                 <circle cx="250" cy="80" r="5" fill="var(--theme-accent-2)" />
                 <text x="235" y="60" fill="var(--theme-accent-2)" font-size="14" font-weight="bold">GERMANY</text>
             </svg>
          </div>

        </div>
      </div>
    </section>"""

# Delete the old highlight section (lines roughly 101-140)
# It's currently `<section class="reveal-on-scroll">` followed by `<div class="container">` and `<div class="highlight-card">`
html = re.sub(r'<section class="reveal-on-scroll">\s*<div class="container">\s*<div class="highlight-card">[\s\S]*?</section>', highlights_html, html, count=1)


# 2. INTERACTIVE JOURNEY OVERVIEW
interactive_timeline_html = """<section id="journey-interactive" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Professional Journey</h2>
            <p>Click any milestone below to expand and view the chapter details.</p>
          </div>
        </div>
        
        <div class="interactive-timeline">
          
          <div class="timeline-collapsible">
            <button class="timeline-toggle" onclick="toggleTimeline(this)">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2017</span>
                 <h3>School Foundation</h3>
                 <span class="expand-icon">+</span>
              </div>
            </button>
            <div class="timeline-content">
              <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
                 <div class="date">1st Standard to 12th Standard</div>
                 <h4 style="margin: 0.5rem 0; font-size: 1.2rem;">CBSE · Sree Narayana Central School</h4>
                 <p class="muted">My school journey was completed at Sree Narayana Central School, under the CBSE curriculum. This phase built the academic foundation, discipline, and curiosity that later supported my engineering path.</p>
                 <ul class="clean" style="margin-bottom:0;">
                   <li>Completed 10th standard with an outstanding score of 98%.</li>
                   <li>Built a strong base in mathematics, science, discipline, and structured learning.</li>
                 </ul>
              </div>
            </div>
          </div>

          <div class="timeline-collapsible">
            <button class="timeline-toggle" onclick="toggleTimeline(this)">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2017 - 2021</span>
                 <h3>Engineering & Leadership Formation</h3>
                 <span class="expand-icon">+</span>
              </div>
            </button>
            <div class="timeline-content">
              <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
                 <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">B.Tech Mechanical Engineering · APJ Abdul Kalam Tech. University</h4>
                 <p class="muted">Engineering journey quickly expanded beyond classrooms into leadership, organization building, and project-driven learning.</p>
                 <ul class="clean">
                   <li>Served in leadership positions including President and Secretary of the Mechanical Engineering Department Association.</li>
                   <li><strong>Best Project Award:</strong> Developed a hospital service robot during the COVID-19 pandemic.</li>
                   <li>Developed communication, event coordination, and institutional engagement skills.</li>
                 </ul>
              </div>
            </div>
          </div>

          <div class="timeline-collapsible">
            <button class="timeline-toggle" onclick="toggleTimeline(this)">
              <div class="time-marker"><div class="time-dot"></div><div class="time-line"></div></div>
              <div class="time-content-header">
                 <span class="time-year">2022</span>
                 <h3>Early Career & Industry Transition</h3>
                 <span class="expand-icon">+</span>
              </div>
            </button>
            <div class="timeline-content">
              <div class="timeline-content-inner card shine-card" style="margin: 0 0 2rem 4rem; padding: 1.5rem;">
                 <div class="date">02/2022 – 09/2022</div>
                 <h4 style="margin: 0.5rem 0; font-size: 1.2rem;">Non-Destructive Testing Technician</h4>
                 <p class="muted">This role gave me real industrial field exposure and allowed me to apply inspection knowledge in a practical environment.</p>
                 <ul class="clean" style="margin-bottom:0;">
                   <li>Performed NDT-based quality assessments to support structural integrity and engineering compliance.</li>
                   <li>Developed practical experience in industrial reporting, quality procedures, and technical responsibility.</li>
                 </ul>
              </div>
            </div>
          </div>

          <div class="timeline-collapsible">
            <button class="timeline-toggle" onclick="toggleTimeline(this)">
              <div class="time-marker"><div class="time-dot live-dot-timeline"></div><div class="time-line" style="display:none;"></div></div>
              <div class="time-content-header" style="border-bottom: none;">
                 <span class="time-year" style="color: var(--theme-accent-2);">2023 - Present</span>
                 <h3>The Germany Dream & Industrial Robotics</h3>
                 <span class="expand-icon">+</span>
              </div>
            </button>
            <div class="timeline-content">
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
            </div>
          </div>

        </div>
      </div>
    </section>"""

# Delete the old journey map section and all detailed sections below it
# Regex to match from `<section id="journey-map"` down to `</section>` of school/engineering/etc
html = re.sub(r'<section id="journey-map"[\s\S]*?</section>', interactive_timeline_html, html, count=1)
html = re.sub(r'<section id="school"[\s\S]*?</section>', '', html, count=1)
# The detailed ones are gone because they were inside #school's container in my initial file? No wait, `#school` holds `<details>` for ALL of them. Let's make sure!
# Wait, `#school` has `<details open>` then `<details id="engineering">` etc. So substituting `#school` removes all detail blocks! Perfect.
# There is also `<section id="impact"`. I'll keep section impact.


# 3. ENHANCED TRAVEL FOOTPRINT
footprint_html = """<section id="travel-footprint" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Travel Footprint</h2>
            <p>International exposure shapes perspective. Here are the footprints of my journey.</p>
          </div>
        </div>

        <div class="travel-dashboard grid grid-3 stagger-children">
          <!-- Footprint Card Template -->
          <article class="travel-location card shine-card">
            <div class="travel-map-bg"></div>
            <div class="travel-marker">
              <div class="pulse-ring"></div>
              <div class="pulse-dot"></div>
            </div>
            <div class="travel-info">
              <span style="font-size: 2rem; margin-bottom: 0.5rem; display:block;">🇮🇳</span>
              <h3 style="margin: 0;">India</h3>
              <p class="muted small" style="margin-top:0.5rem;">Roots. Foundation. B.Tech Engineering.</p>
              <div class="mini-chips">
                <span>Kerala</span><span>Tamil Nadu</span><span>Rajasthan</span><span>Goa</span>
              </div>
            </div>
          </article>

          <article class="travel-location card shine-card">
            <div class="travel-map-bg germ"></div>
            <div class="travel-marker">
              <div class="pulse-ring"></div>
              <div class="pulse-dot"></div>
            </div>
            <div class="travel-info">
               <span style="font-size: 2rem; margin-bottom: 0.5rem; display:block;">🇩🇪</span>
              <h3 style="margin: 0;">Germany</h3>
              <p class="muted small" style="margin-top:0.5rem;">M.Eng Studies. Industrial Robotics. Current home.</p>
              <div class="mini-chips">
                <span>Deggendorf</span><span>Stuttgart</span><span>Munich</span>
              </div>
            </div>
          </article>

          <article class="travel-location card shine-card">
            <div class="travel-map-bg eu"></div>
            <div class="travel-marker">
              <div class="pulse-ring"></div>
              <div class="pulse-dot"></div>
            </div>
            <div class="travel-info">
               <span style="font-size: 2rem; margin-bottom: 0.5rem; display:block;">🌍</span>
              <h3 style="margin: 0;">European Exploration</h3>
              <p class="muted small" style="margin-top:0.5rem;">Cultural exposure and networking.</p>
              <div class="mini-chips">
                <span>Austria</span><span>Switzerland</span><span>Czech Republic</span><span>Luxembourg</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>"""
html = re.sub(r'<section id="travel-footprint"[\s\S]*?</section>', footprint_html, html, count=1)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)


# 4. APPEND NEW CSS
new_css = """
/* --- JOURNEY ADVANCED STYLES --- */
.highlight-grid {
  display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2rem; align-items: center; overflow: hidden; padding: 0 !important;
}
@media (max-width: 900px) { .highlight-grid { grid-template-columns: 1fr; } }
.glass-badge {
  background: rgba(37, 99, 235, 0.1); padding: 1rem 1.4rem; border-radius: 12px; border: 1px solid rgba(37, 99, 235, 0.2); flex: 1; min-width: 150px;
}
.glass-badge.success {
  background: rgba(5, 150, 105, 0.1); border-color: rgba(5, 150, 105, 0.2);
}

.globe-container { position: relative; height: 380px; width: 100%; display: flex; align-items: center; justify-content: center; }
.css-globe {
  width: 200px; height: 200px; border-radius: 50%;
  background: var(--theme-accent);
  box-shadow: inset -20px -20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(37, 99, 235, 0.3);
  position: relative; overflow: hidden;
}
.globe-map {
  width: 400px; height: 200px; background: url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg');
  background-size: cover; opacity: 0.4; filter: invert(1);
  animation: spinGlobe 15s linear infinite;
}
@keyframes spinGlobe { 100% { transform: translateX(-200px); } }
.globe-shading { position: absolute; inset: 0; border-radius: 50%; box-shadow: inset -25px -25px 40px rgba(0,0,0,0.6); }
.flight-svg { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; height: 100%; pointer-events: none; z-index: 10; }

.interactive-timeline { display: flex; flex-direction: column; width: 100%; max-width: 800px; margin: 0 auto; }
.timeline-collapsible { display: flex; flex-direction: column; width: 100%; margin-bottom: 0; }
.timeline-toggle { background: transparent; border: none; padding: 0; width: 100%; text-align: left; cursor: pointer; display: flex; align-items: stretch; outline: none; }
.time-marker { display: flex; flex-direction: column; align-items: center; width: 40px; margin-right: 1.5rem; flex-shrink: 0; }
.time-dot { width: 16px; height: 16px; border-radius: 50%; background: var(--theme-accent); border: 4px solid var(--bg-color-1); box-shadow: 0 0 0 2px var(--theme-accent); z-index: 2; margin-top: 1.8rem; transition: transform 0.3s ease; }
.live-dot-timeline { background: var(--theme-accent-2); box-shadow: 0 0 12px var(--theme-accent-2); animation: pulseGreen 2s infinite; }
@keyframes pulseGreen { 0% { box-shadow: 0 0 0 0 rgba(5,150,105, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(5,150,105, 0); } 100% { box-shadow: 0 0 0 0 rgba(5,150,105, 0); } }
.time-line { width: 2px; flex-grow: 1; background: var(--theme-line-strong); margin: 0.5rem 0; min-height: 40px; }
.timeline-toggle:hover .time-dot { transform: scale(1.3); }

.time-content-header { flex-grow: 1; padding: 1.5rem 0; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--theme-line); transition: all 0.3s ease; }
.time-year { font-family: 'Outfit', sans-serif; font-weight: 700; color: var(--theme-accent); width: 120px; font-size: 1.1rem; }
.time-content-header h3 { margin: 0; flex-grow: 1; font-size: 1.4rem; color: var(--text-primary); transition: color 0.3s ease; }
.expand-icon { font-size: 1.5rem; font-weight: 300; color: var(--text-muted); transition: transform 0.4s ease; }
.timeline-toggle:hover .time-content-header h3 { color: var(--theme-accent); }

.timeline-content { max-height: 0; overflow: hidden; transition: max-height 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease; opacity: 0; }
.timeline-collapsible.active .timeline-content { opacity: 1; max-height: 1000px; }
.timeline-collapsible.active .expand-icon { transform: rotate(45deg); color: var(--theme-accent); }
.timeline-collapsible.active .time-content-header { border-bottom-color: transparent; }

.travel-dashboard { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
.travel-location { position: relative; overflow: hidden; padding: 2rem !important; display: flex; flex-direction: column; min-height: 280px; }
.travel-map-bg { position: absolute; inset: 0; opacity: 0.04; background-image: radial-gradient(circle at 1px 1px, var(--text-primary) 1px, transparent 0); background-size: 15px 15px; transition: transform 3s ease, opacity 0.5s ease; z-index: 0; }
.travel-location:hover .travel-map-bg { transform: scale(1.1); opacity: 0.08; }
.travel-info { position: relative; z-index: 2; flex-grow: 1; display: flex; flex-direction: column; }
.mini-chips { margin-top: auto; padding-top: 1rem; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.mini-chips span { font-size: 0.75rem; padding: 0.2rem 0.6rem; background: var(--theme-line); border-radius: 99px; color: var(--text-muted); border: 1px solid var(--theme-line-strong); }

.travel-marker { position: absolute; top: 2rem; right: 2rem; width: 24px; height: 24px; z-index: 2; }
.pulse-dot { width: 12px; height: 12px; background: var(--theme-accent); border-radius: 50%; position: absolute; top: 6px; left: 6px; }
.pulse-ring { width: 24px; height: 24px; border: 2px solid var(--theme-accent); border-radius: 50%; position: absolute; top: 0; left: 0; animation: pulsateRing 2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
@keyframes pulsateRing { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
.travel-location:hover .pulse-dot { background: var(--theme-accent-2); }
.travel-location:hover .pulse-ring { border-color: var(--theme-accent-2); }
"""
with open(css_file, 'a', encoding='utf-8') as f:
    f.write(new_css)

# Add the JS logic to app.js
app_js_file = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/app.js"
with open(app_js_file, 'a', encoding='utf-8') as f:
    f.write("\n\n// Interactive Timeline Toggle Script\nwindow.toggleTimeline = function(btn) {\n  const parent = btn.parentElement;\n  parent.classList.toggle('active');\n};\n")

print("Journey structural updates complete!")
