import re

html_file = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/index.html"
css_file = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio/style.css"

with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Experience HTML
experience_html = """<section id="experience" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Experience</h2>
            <p>Engineering work that reflects hands-on implementation and practical problem-solving in industrial contexts.</p>
          </div>
        </div>

        <div class="timeline">
          <article class="timeline-item primary-experience shine-card">
            <div class="date">Present</div>

            <div class="title-flex" style="margin-bottom: 0.8rem;">
              <img src="/assets/keba_logo.png" alt="KEBA Group" class="experience-logo" onerror="this.src='https://via.placeholder.com/56x56?text=KEBA'">
              <div>
                <h3>
                  <span class="title-live">
                    <span class="live-badge" aria-label="Currently active">
                      <span class="live-dot-wrap"><span class="live-dot"></span></span>
                    </span>
                    <span>WORKING STUDENT – KEBA GROUP</span>
                  </span>
                </h3>
                <p style="margin: 0; color: var(--theme-accent-2); font-weight: 600;">
                  📍 Stuttgart, Germany · On-site
                </p>
              </div>
            </div>

            <p class="muted" style="margin-top: 1rem;">
              Working on robotics & industrial automation, machine operation & control systems integration, testing, Drag&Bot + ROS, and mechatronics systems.
            </p>

            <div class="project-meta" style="margin-top: 1rem; margin-bottom: 1.5rem;">
              <span class="project-tag">Robotic motion control</span>
              <span class="project-tag">Automation systems</span>
              <span class="project-tag">System integration</span>
              <span class="project-tag">Digital prototyping</span>
            </div>

            <a class="btn btn-small" href="https://www.keba.com" target="_blank" rel="noreferrer">View KEBA Group</a>
          </article>

          <article class="timeline-item shine-card">
            <div class="date">02/2022 – 09/2022</div>
            <h3>Non-Destructive Testing Technician · United Engineering and Construction Co., India</h3>
            <ul class="clean">
              <li>Performed NDT-based quality assessments to support structural integrity and engineering compliance.</li>
              <li>Documented inspection outcomes in line with engineering and site standards.</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- NEW MASTER THESIS SECTION -->
    <section id="thesis" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Master Thesis Highlight</h2>
            <p>Advancing real-world automation through robotic motion control and collision avoidance.</p>
          </div>
        </div>

        <div class="card shine-card thesis-grid">
          <div class="thesis-image-wrapper">
             <img src="/assets/thesis_robot.png" alt="6-Axis Autonomous Robot" onerror="this.src='https://via.placeholder.com/600x400?text=6-Axis+Robot'">
          </div>
          <div>
            <h3 style="font-size: 1.8rem; margin-bottom: 0.5rem;">6-Axis Autonomous Robot Optimization</h3>
            <p class="muted" style="margin-bottom: 1.5rem;">
              Focusing on industrial automation and robotics at KEBA Group. Developing an automated robot-programming framework for sheet-metal bending operations for the KEBA robotic controller.
            </p>
            <ul class="clean" style="margin-bottom: 1.5rem;">
              <li>Implemented Python-based sequencing, re-grip strategies, and collision-avoidance logic for safe robotic manipulation.</li>
              <li>Integrated simulation and real-cell constraints through ROS WebSocket connectivity for reliable deployment.</li>
              <li>Bridging the gap between robotics theory and real-world industrial application.</li>
            </ul>
            <div class="project-meta">
               <span class="project-tag">Python</span>
               <span class="project-tag">ROS / WebSocket</span>
               <span class="project-tag">Collision Avoidance</span>
               <span class="project-tag">Motion Planning</span>
            </div>
          </div>
        </div>
      </div>
    </section>"""
html = re.sub(r'<section id="experience"[\s\S]*?</section>', experience_html, html, count=1)

# 2. Projects Section
projects_html = """<section id="projects" class="reveal-on-scroll">
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
              <img src="/assets/project1.png" alt="Autonomous Vacuum Robot" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Autonomous+Vacuum+Robot'">
              <div class="project-overlay">
                <a class="btn btn-small" href="https://github.com/SoorajSudhakaran1199/vaccumbot" target="_blank" rel="noreferrer">View Source</a>
              </div>
            </div>
            <div class="project-content">
              <div class="date">03/2024 – 06/2024</div>
              <h3>Autonomous Vacuum Robot in ROS</h3>
              <p class="muted">Designed and implemented an autonomous vacuum robot with real-time localization using SLAM, sensor fusion, obstacle detection, and optimized path planning.</p>
              <div class="project-meta" style="margin-top: auto;">
                <span class="project-tag">ROS</span>
                <span class="project-tag">SLAM</span>
                <span class="project-tag">Autonomy</span>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
              <img src="/assets/project2.png" alt="VR Workshop" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=VR+Workshop+Simulation'">
              <div class="project-overlay">
                <span class="btn btn-small" style="cursor:default;">Academic Project</span>
              </div>
            </div>
            <div class="project-content">
              <div class="date">03/2024 – 06/2024</div>
              <h3>VR Workshop to Operate a Machine</h3>
              <p class="muted">Developed an interactive VR-based machine operation workshop with real-time simulation, motion tracking, and authentic user interaction.</p>
              <div class="project-meta" style="margin-top: auto;">
                <span class="project-tag">Unity</span>
                <span class="project-tag">VR</span>
                <span class="project-tag">Training</span>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
               <img src="/assets/project3.png" alt="Topology Optimization" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Topology+Optimization'">
            </div>
            <div class="project-content">
              <div class="date">10/2023 – 01/2024</div>
              <h3>Topology Optimised Temporary Bag Sealer</h3>
              <p class="muted">Applied FEA-driven topology optimization in SOLIDWORKS, achieving weight reduction and material cost savings.</p>
              <div class="project-meta" style="margin-top: auto;">
                <span class="project-tag">SOLIDWORKS</span>
                <span class="project-tag">FEA</span>
                <span class="project-tag">Optimization</span>
              </div>
            </div>
          </article>

          <article class="card shine-card project-card has-image">
            <div class="project-image-wrapper">
               <img src="/assets/project4.png" alt="Active Suspension" class="project-image" onerror="this.src='https://via.placeholder.com/600x300?text=Active+Suspension+System'">
            </div>
            <div class="project-content">
              <div class="date">10/2023 – 01/2024</div>
              <h3>Active Suspension System Modeling</h3>
              <p class="muted">Modeled an active suspension system with hydraulic actuators for real-time suspension control and performance analysis.</p>
              <div class="project-meta" style="margin-top: auto;">
                <span class="project-tag">MATLAB</span>
                <span class="project-tag">Simulink</span>
                <span class="project-tag">Modeling</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>"""
html = re.sub(r'<section id="projects"[\s\S]*?</section>', projects_html, html, count=1)

# 3. Education Section
education_html = """<section id="education" class="reveal-on-scroll">
      <div class="container">
        <div class="section-heading">
          <div>
            <h2>Education</h2>
            <p>Academic foundation in mechatronics, cyber-physical systems, and mechanical engineering.</p>
          </div>
        </div>

        <div class="grid grid-2">
          <article class="card shine-card">
            <div class="title-flex" style="margin-bottom: 0.8rem;">
              <img src="/assets/thd_logo.png" alt="THD Logo" class="edu-logo" onerror="this.src='https://via.placeholder.com/56x56?text=THD'">
              <h3 style="margin: 0; font-size: 1.25rem; line-height: 1.3;">M.Eng. Mechatronic and Cyber-Physical Systems</h3>
            </div>
            <p class="muted" style="margin-top: 0.5rem; margin-bottom: 0.5rem;"><strong>Technische Hochschule Deggendorf</strong> · 03/2023 – Present</p>
            <p class="muted">Relevant coursework: Advanced Robotics, Autonomous Systems, Cyber-Physical Systems, Additive Manufacturing, Human-Machine Interaction.</p>
          </article>

          <article class="card shine-card">
             <div class="title-flex" style="margin-bottom: 0.8rem;">
              <img src="/assets/apj_logo.png" alt="APJ Abdul Kalam University Logo" class="edu-logo" onerror="this.src='https://via.placeholder.com/56x56?text=APJ'">
              <h3 style="margin: 0; font-size: 1.25rem; line-height: 1.3;">B.Tech. Mechanical Engineering</h3>
            </div>
            <p class="muted" style="margin-top: 0.5rem; margin-bottom: 0.5rem;"><strong>APJ Abdul Kalam Technological University</strong> · 08/2017 – 07/2021</p>
            <p class="muted">Relevant coursework: CAD and CAE, Material Science, Programming in C, Fluid and Thermal Engineering.</p>
          </article>
        </div>
      </div>
    </section>"""
html = re.sub(r'<section id="education"[\s\S]*?</section>', education_html, html, count=1)

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html)

new_css = """
/* --- NEW PREMIUM COMPONENT STYLES --- */
.project-card.has-image { padding: 0 !important; display: flex; flex-direction: column; overflow: hidden; }
.project-image-wrapper { position: relative; width: 100%; height: 220px; overflow: hidden; background: var(--card-bg); border-bottom: 1px solid var(--theme-line); }
.project-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
.project-overlay { position: absolute; inset: 0; background: rgba(11, 16, 32, 0.65); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.4s ease; }
.project-card.has-image:hover .project-image { transform: scale(1.1); }
.project-card.has-image:hover .project-overlay { opacity: 1; }
.project-content { padding: 1.5rem; display: flex; flex-direction: column; flex-grow: 1; background: transparent; }
.project-content h3 { margin-bottom: 0.5rem; }

.experience-logo, .edu-logo { width: 56px; height: 56px; border-radius: 12px; background: rgba(255,255,255,0.9); padding: 4px; object-fit: contain; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-right: 1.2rem; flex-shrink: 0; }
.title-flex { display: flex; align-items: center; }

.thesis-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 2.5rem; align-items: center; padding: 0 !important; overflow: hidden; }
.thesis-grid > div:last-child { padding: 2.5rem 2.5rem 2.5rem 0; }
.thesis-image-wrapper { width: 100%; height: 100%; min-height: 340px; overflow: hidden; }
.thesis-image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.thesis-grid:hover .thesis-image-wrapper img { transform: scale(1.05); }
@media (max-width: 900px) {
  .thesis-grid { grid-template-columns: 1fr; }
  .thesis-grid > div:last-child { padding: 1.5rem; }
  .thesis-image-wrapper { min-height: 250px; }
}
"""
with open(css_file, 'a', encoding='utf-8') as f:
    f.write(new_css)

print("Rewritten successfully.")
