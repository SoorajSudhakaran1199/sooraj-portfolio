import re

PORTFOLIO = "/Users/soorajsudhakaran/Desktop/Personal/sooraj-portfolio"

with open(f'{PORTFOLIO}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Image Injection

# Hero Image
hero_img = '<img src="assets/images/Gemini_Generated_Image_e7ez3he7ez3he7ez.png" alt="Sooraj Sudhakaran" style="width: 100%; height: 100%; object-fit: cover; border-radius: 30px;">'
html = re.sub(r'<div class="hero-image placeholder-img" data-text="Profile Image"></div>', hero_img, html)

# Experience Logos
keba_img = '<div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><img src="assets/images/keba.png" alt="KEBA Group" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>'
html = re.sub(r'<div class="experience-logo placeholder-img" data-text="KEBA Logo"></div>', keba_img, html)

# The second experience logo (NDT) - placeholder for now
ndt_img = '<div class="experience-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: rgba(37,99,235,0.1); color: var(--theme-accent);"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>'
html = re.sub(r'<div class="experience-logo placeholder-img" data-text="NDT Logo"></div>', ndt_img, html)

# Education Logos
thd_img = '<div class="edu-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><img src="assets/images/technische-hochschule-deggendorf-vector-logo.svg" alt="THD" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>'
html = re.sub(r'<div class="edu-logo placeholder-img" data-text="THD Logo"></div>', thd_img, html)

apj_img = '<div class="edu-logo" style="width: 60px; height: 60px; border-radius: 12px; overflow: hidden; display: flex; align-items: center; justify-content: center;"><img src="assets/images/APJ_Abdul_Kalam_Technological_University_logo.png" alt="APJ" style="max-width: 100%; max-height: 100%; object-fit: contain;"></div>'
html = re.sub(r'<div class="edu-logo placeholder-img" data-text="University Logo"></div>', apj_img, html)

# Project Images - Replacing placeholder divs with real images
proj_keba = '<img src="assets/images/keba theisi.jpeg" alt="KEBA Thesis" style="width: 100%; height: 100%; object-fit: cover;">'
html = re.sub(r'<div class="project-image-placeholder placeholder-img" data-text="Thesis Image"></div>', proj_keba, html)

proj_vacuum = '<img src="assets/images/vaccumbot.jpeg" alt="Vacuum Bot" style="width: 100%; height: 100%; object-fit: cover;">'
html = re.sub(r'<div class="project-image-placeholder placeholder-img" data-text="Vacuum Bot Image"></div>', proj_vacuum, html)

proj_vr = '<img src="assets/images/VR.jpeg" alt="VR Control" style="width: 100%; height: 100%; object-fit: cover;">'
html = re.sub(r'<div class="project-image-placeholder placeholder-img" data-text="VR Control Image"></div>', proj_vr, html)

proj_top = '<img src="assets/images/topology.jpeg" alt="Topology Optimization" style="width: 100%; height: 100%; object-fit: cover;">'
html = re.sub(r'<div class="project-image-placeholder placeholder-img" data-text="Topology Opt Image"></div>', proj_top, html)


# 2. Add CV & Feedback Buttons to Contact Section
cv_btn = '''<a href="mailto:soorajsudhakaran1199@gmail.com?subject=Request%20for%20Curriculum%20Vitae&body=Hi%20Sooraj,%0A%0AI%20was%20reviewing%20your%20engineering%20portfolio%20and%20was%20very%20impressed.%20Could%20you%20please%20share%20a%20copy%20of%20your%20latest%20CV?%0A%0AThank%20you!" class="btn premium-btn hover-scale" style="gap: 0.5rem; justify-content: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Request Full CV
</a>'''

feed_btn = '''<a href="mailto:soorajsudhakaran1199@gmail.com?subject=Portfolio%20Feedback&body=Hi%20Sooraj,%0A%0AI%20explored%20your%20portfolio%20website%20and%20wanted%20to%20share%20some%20feedback%20and%20suggestions:%0A%0A" class="btn btn-outline premium-btn hover-scale" style="gap: 0.5rem; justify-content: center;">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Provide Feedback
</a>'''

action_buttons = f'<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem;">{cv_btn}\n{feed_btn}</div>'

# Sub the contact direct buttons to add the new ones
# Look for <a href="mailto:soorajsudhakaran1199@gmail.com" class="btn" style="width: 100%; justify-content: center; margin-bottom: 1rem;">Send me an email</a>
html = re.sub(r'<a href="mailto:soorajsudhakaran1199@gmail.com"[^>]*>Send me an email</a>', action_buttons, html)

with open(f'{PORTFOLIO}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# Add to journey.html as well at the very bottom
with open(f'{PORTFOLIO}/journey.html', 'r', encoding='utf-8') as f:
    jny = f.read()

jny_action_buttons = f'<div style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;">{cv_btn}\n{feed_btn}</div>'
jny = re.sub(r'(Ready to dive back into the tech\?</h2>)', r'\1\n' + jny_action_buttons + r'\n<br><br>', jny)

with open(f'{PORTFOLIO}/journey.html', 'w', encoding='utf-8') as f:
    f.write(jny)

print("Image arrays mapped and CV triggers wired.")
