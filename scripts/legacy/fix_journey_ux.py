import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/journey.html', 'r', encoding='utf-8') as f:
    jny = f.read()

# 1. Update start journey button
jny = jny.replace('href="#down"', 'href="#highlights"')

# 2. Add Return to Portfolio button at the end
cta_html = """<section id="journey-end" class="reveal-on-scroll" style="padding: 6rem 0; text-align: center; border-top: 1px solid var(--theme-line); margin-top: 4rem;">
  <div class="container">
    <h2 style="font-size: 2.5rem; margin-bottom: 2rem;">Ready to dive back into the tech?</h2>
    <a href="index.html" class="btn hover-scale" style="padding: 1.2rem 2.5rem; font-size: 1.2rem; display: inline-flex; align-items: center; gap: 0.5rem;">
      <span>←</span> Back to Engineering Portfolio
    </a>
  </div>
</section>
"""
# Find closing tag of travel-footprint section and inject there
jny = re.sub(r'(<section id="travel-footprint"[\s\S]*?</section>)', r'\1\n\n' + cta_html, jny, count=1)

# 3. Completely rebuild the globe highlight into a robust intrinsic element
robust_globe_html = """<section id="highlights" class="reveal-on-scroll" style="margin-top: 5rem; margin-bottom: 5rem;">
  <div class="container">
    <div class="card shine-card exact-globe-card" style="padding: 4rem; overflow: hidden !important;">
      <div class="exact-globe-content" style="width: 50%; position: relative; z-index: 2;">
        <div class="eyebrow" style="color: var(--theme-accent-2); font-weight: bold; letter-spacing: 1px; margin-bottom: 0.8rem;">INTERNATIONAL TRANSITION</div>
        <h2 style="font-size: 2.8rem; margin-bottom: 1.2rem; line-height: 1.1;">From India to Germany</h2>
        <p class="muted" style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2.5rem;">
          "A meaningful engineering journey is built not only by technical skills, but by consistency, leadership, and the courage to move toward a bigger vision."
        </p>
        <div class="globe-badges" style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <div class="glass-badge" style="background: rgba(37,99,235,0.06); border: 1px solid rgba(37,99,235,0.2); border-radius: 8px; padding: 1rem;">
            <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">M.Eng Mechatronics</strong>
            <span class="small" style="color: var(--theme-accent);">THD Germany</span>
          </div>
          <div class="glass-badge success" style="background: rgba(5,150,105,0.06); border: 1px solid rgba(5,150,105,0.2); border-radius: 8px; padding: 1rem;">
            <strong style="color: var(--text-primary); display:block; font-size: 1.1rem;">Industrial Robotics</strong>
            <span class="small" style="color: var(--theme-accent-2);">KEBA Group</span>
          </div>
        </div>
      </div>
      
      <!-- New Contained 3D Globe Wrapper -->
      <div class="robust-globe-wrapper" style="position: absolute; right: 8%; top: 50%; transform: translateY(-50%); width: 330px; height: 330px; perspective: 1000px; z-index: 1;">
         <div class="robust-globe" style="width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #1e3a8a, #020617); position: relative; overflow: hidden; box-shadow: inset -15px -15px 30px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.4); animation: cinematicGlobe 7s infinite alternate ease-in-out;">
            <!-- Map Texture -->
            <div class="globe-texture" style="position: absolute; width: 300%; height: 100%; background: url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'); background-size: cover; background-position: left; opacity: 0.35; filter: invert(1); animation: spinTexture 7s infinite alternate ease-in-out;"></div>
            
            <!-- Exact Flight SVG Contained IN Globe -->
            <svg viewBox="0 0 100 100" style="position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; pointer-events: none;">
               <path id="internal-flight" d="M 70 58 Q 50 25 35 40" fill="none" stroke="var(--theme-accent-2)" stroke-width="2" stroke-dasharray="3 3"></path>
               <circle r="3" fill="var(--theme-success)">
                   <animateMotion dur="4s" repeatCount="indefinite" path="M 70 58 Q 50 25 35 40" />
               </circle>
            </svg>

            <!-- Marker: India -->
            <div class="marker marker-india" style="position: absolute; top: 56%; left: 66%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; animation: fadeMarkerIndia 7s infinite alternate ease-in-out;">
               <div class="ping" style="position: absolute; width:20px; height:20px; border-radius:50%; background:var(--theme-accent); animation:ping 2s infinite; opacity:0.5;"></div>
               <div class="dot" style="width:8px; height:8px; background:var(--theme-accent); border-radius:50%; box-shadow:0 0 5px var(--theme-accent);"></div>
               <span style="font-size: 11px; font-weight: bold; color: white; margin-top: 3px; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">INDIA</span>
            </div>
            
            <!-- Marker: Germany -->
            <div class="marker marker-germany" style="position: absolute; top: 38%; left: 30%; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; animation: fadeMarkerGermany 7s infinite alternate ease-in-out;">
               <div class="ping" style="position: absolute; width:20px; height:20px; border-radius:50%; background:var(--theme-success); animation:ping 2s infinite; opacity:0.5;"></div>
               <div class="dot" style="width:8px; height:8px; background:var(--theme-success); border-radius:50%; box-shadow:0 0 5px var(--theme-success);"></div>
               <span style="font-size: 12px; font-weight: bold; color: white; margin-top: 3px; letter-spacing: 0.5px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">GERMANY</span>
            </div>
         </div>
      </div>

    </div>
  </div>
</section>"""
jny = re.sub(r'<section id="highlights"[\s\S]*?</section>', robust_globe_html, jny, count=1)

with open(f'{PORTFOLIO}/journey.html', 'w', encoding='utf-8') as f:
    f.write(jny)


# 4. CSS Updates
with open(f'{PORTFOLIO}/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# I need to wipe out the old `.globe-cinematic-wrapper` and `.exact-globe-wrapper` styles because they clash with `.robust-globe-wrapper`.
css = re.sub(r'/\* Exact Globe UI \*/[\s\S]*?(?=\/\* Native Premium Details Timeline \*/)', '', css)

robust_css = """
/* ---- ROBUST 3D CSS GLOBE ---- */
.hover-scale { transition: transform 0.3s ease; } .hover-scale:hover { transform: scale(1.05); }
.exact-globe-card { position: relative; overflow: visible !important; min-height: 400px; display: flex; align-items: center; padding: 3rem; border-radius: 20px; }
.exact-globe-content { width: 50%; position: relative; z-index: 2; }
.globe-badges { display: flex; gap: 1rem; flex-wrap: wrap; }
@media (max-width: 900px) {
  .exact-globe-card { padding: 2rem !important; flex-direction: column; }
  .exact-globe-content { width: 100% !important; margin-bottom: 2rem; }
  .robust-globe-wrapper { position: relative !important; right: auto !important; top: auto !important; transform: none !important; width: 100% !important; height: 320px !important; margin: 0 auto; margin-top: 2rem; }
}

/* Globe Animations */
@keyframes cinematicGlobe {
   0%, 20% { transform: scale(1); box-shadow: inset -15px -15px 30px rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.5); }
   80%, 100% { transform: scale(1.6); box-shadow: inset -5px -5px 15px rgba(0,0,0,0.6), 0 30px 60px rgba(0,0,0,0.5); }
}
@keyframes spinTexture {
   0%, 20% { transform: translateX(0); }
   80%, 100% { transform: translateX(-18%); }
}
@keyframes fadeMarkerIndia {
   0%, 30% { opacity: 1; transform: scale(1); }
   80%, 100% { opacity: 0; transform: scale(0.5); }
}
@keyframes fadeMarkerGermany {
   0%, 30% { opacity: 0; transform: scale(0.5); }
   80%, 100% { opacity: 1; transform: scale(1); }
}

/* Enhancing Timeline UI */
.premium-summary { border-radius: 8px; transition: background 0.3s ease; padding: 0.5rem; }
.premium-summary:hover { background: rgba(37,99,235,0.05); }
.premium-details[open] .timeline-content-inner { border-left: 2px solid var(--theme-accent); }

/* Architectural Engineering Background for Journey */
body.journey-page {
   background-color: #020617 !important;
   background-image: radial-gradient(circle at 40% 10%, rgba(37, 99, 235, 0.12), transparent 50%),
                     linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px) !important;
   background-size: 100% 100%, 30px 30px, 30px 30px !important;
   background-position: top center, top left, top left !important;
}

[data-theme="light"] body.journey-page {
   background-color: #f1f5f9 !important;
   background-image: radial-gradient(circle at 40% 10%, rgba(37, 99, 235, 0.05), transparent 50%),
                     linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
                     linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px) !important;
   background-size: 100% 100%, 30px 30px, 30px 30px !important;
   background-position: top center, top left, top left !important;
}
"""

css = css.replace('/* Journey Deep Differentiation */', '/* OLD JOURNEY DELETED */')
css = re.sub(r'body\.journey-page\s*{[\s\S]*?}', '', css)
css = re.sub(r'\[data-theme="light"\]\s*body\.journey-page\s*{[\s\S]*?}', '', css)

with open(f'{PORTFOLIO}/style.css', 'w', encoding='utf-8') as f:
    f.write(css + '\n' + robust_css)
