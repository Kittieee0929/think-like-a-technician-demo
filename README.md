# Think Like a Technician — proposal demo

A small, static, interactive website for the proposed **Grade 12 Computer Systems Servicing (CSS) classroom-based action research** on computational thinking. It follows the original five-step *Think Like a Technician* strategy.

## Live experience

The demo presents a **fictional** desktop-PC fault (fans run, display says “No Signal”) and guides visitors through:

1. **Mystery Unit** — analyze symptoms without seeing the cause.
2. **Plan Before Touching** — apply decomposition, pattern recognition, abstraction, and algorithm design; confirm safe practices.
3. **Test and Log** — choose safe, simulated checks and read prewritten observations.
4. **Peer Debugging** — critique a fictional partner's diagnostic log.
5. **Reveal and Reflect** — see the simulated root cause, reflect, and optionally download a plain-text practice log.

The fictional cause in this case is a partly unseated external HDMI connector. The site intentionally models testing **one variable at a time**. It never instructs learners to work on energized components or open an energized power supply.

### Proposal and ethics boundaries

- **Prototype only**: not an approved teaching intervention, expert-validated instrument, or completed study.
- **No actual research data**: no student names, user accounts, servers, analytics, database, cookies, or persistent local storage.
- **No CT scores**: proposed pre/post assessments must be administered independently and validated separately; this site does not claim to measure improvement.
- **No real repair operations**: all case tests are simulated. Practical hardware work requires teacher approval and school safety procedures.

## Project structure

- `index.html` — the accessible five-step activity interface
- `styles.css` — responsive computer-themed design
- `script.js` — local-only interactions and simulation logic
- `.nojekyll` — static GitHub Pages compatibility

## Run locally

Open `index.html` in a modern browser. No build tools, npm, or API keys are needed.

Alternatively, start a local HTTP server:

```sh
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new **public** repository on GitHub (e.g. `think-like-a-technician-demo`).
2. Upload the files from this folder to the repository root.
3. Open **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, select **main** and **/(root)**, and save.
5. GitHub will show the published URL once Pages finishes deploying.

GitHub Pages availability and UI may vary by account or plan.

## Proposed research alignment

**Participants:** proposed Grade 12 CSS classes at Marcos National High School, Bagbag–Solsona National High School, and Ilocos Norte College of Arts and Trades (INCAT), subject to school permissions and confirmed schedules.

**Primary focus:** decomposition, pattern recognition, abstraction, and algorithm design.

**Manuscript boundary:** proposed baseline and posttest tasks, quality validation, consent/assent, and data collection are separate activities. This repository is strictly a proof-of-concept demo for the proposal presentation.

## License

Demo materials are original to this prototype. You may reuse and modify them within your research group. Third-party brand and institutional endorsements are not implied.
