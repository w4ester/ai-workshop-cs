# PRD: AI-Aligned Lesson Builder for Maryland CS Educators

**Product Requirements Document**
**Version:** 0.1 (Draft)
**Date:** 2026-02-10
**Status:** Discovery

---

## 1. Problem Statement

Maryland's K-12 Computer Science Standards (adopted 2018) contain **one mention of AI** across 55 pages of standards — a single 12th-grade standard. Meanwhile, the CSTA/AI4K12 *AI Learning Priorities for All K-12 Students* report (2025) identifies ~60 AI learning outcomes across K-12 in five categories. Maryland legislation (SB0980, 2024) mandates updated CS content standards that include AI by June 2025, but educators are caught in the gap: they need to teach AI now, with standards that don't address it, using tools that don't bridge the disconnect.

Only **42% of CS teachers feel equipped to teach AI**, yet **70% are already doing it**. Maryland has 24 school systems, ~17 preservice CS teacher programs (via CS4MD), and existing resources (MCCE K-5 Toolkit, ECSNet lesson repository, SCRIPT planning framework) — but none of these systematically map to AI learning priorities.

**Teachers need a tool that meets them where they are, creates AI-aligned lessons within their existing workflows, and delivers content students can access in real time.**

---

## 2. Vision

A **platform-agnostic AI agent** that helps Maryland CS educators generate standards-aligned lesson content integrating the CSTA AI Priorities — delivered in the format teachers choose, accessible wherever students are, and built to fit into existing Maryland PD infrastructure (MCCE workshops, ECSNet, district PD days).

### Core Principle: Educator Choice

> "Agnostic within the reality of choice for educators."

The tool does not prescribe a platform, format, or delivery mechanism. It generates structured lesson content and adapts output to teacher preference: Google Docs, PDF, slide decks, Markdown, HTML — whatever the teacher's ecosystem demands. The agent adapts to the teacher, not the reverse.

---

## 3. Goals

| # | Goal | Success Metric |
|---|------|----------------|
| G1 | Teachers create AI-aligned lessons in < 15 minutes | Time-to-first-lesson measured in pilot workshops |
| G2 | Lessons map to both MSDE CS Standards AND CSTA AI Priorities | Every generated lesson includes dual alignment table |
| G3 | Platform-agnostic output | Support >= 4 output formats at launch |
| G4 | Real-time student access via browser | Students reach lesson content via URL, no login, mobile-responsive |
| G5 | Workshop-ready | Complete PD module: facilitator guide, hands-on activities, follow-up resources |
| G6 | Integrate with existing MD resources | Link to MCCE Toolkit, ECSNet lessons, CS4MD annotations |

---

## 4. Users

### Primary: Maryland CS Educators
- K-5 classroom teachers (many teaching CS for the first time)
- 6-8 CS / STEM teachers (often also teach math or science)
- 9-12 CS teachers (may have deeper technical background)
- CTE pathway instructors (Digital Technology cluster)

### Secondary: PD Facilitators & Curriculum Coaches
- MCCE staff and CS4MD network coordinators
- District CS supervisors (24 school systems)
- Preservice CS methods instructors (Towson, UMBC, UMD, Morgan, etc.)

### Tertiary: Students
- Access lesson content in real-time via browser
- Interact with embedded activities
- No account creation required

---

## 5. User Stories

### Teacher Stories

**T1: The New-to-AI Elementary Teacher**
> "I teach 3rd grade CS using Code.org. I need a lesson about how AI learns from data that my students can do in 30 minutes, connects to what they already know about patterns, and I can share as a Google Doc with my co-teacher."

**T2: The Experienced Middle School CS Teacher**
> "I already teach a unit on data bias. I want to upgrade it to explicitly address AI bias using the CSTA framework, export it as slides, and have my students access an interactive version on their Chromebooks during class."

**T3: The CTE Pathway Instructor**
> "I'm building a Digital Technology pathway and need a sequence of 5 lessons covering Ethical AI System Design that align to both MSDE standards and industry credentials. I need PDF lesson plans I can submit to my district for course approval."

**T4: The Workshop Participant**
> "I'm at a Saturday PD session. I've never thought about AI in my CS class before. Walk me through creating one lesson I can use Monday morning. I want to pick the grade level, the AI topic, and get something I can actually teach."

### Student Stories

**S1: The Chromebook Student**
> "My teacher shared a link. I tap it on my Chromebook and I can see today's lesson, follow along with the activities, and answer the check-for-understanding questions right in my browser."

**S2: The Phone-Access Student**
> "I'm reviewing the lesson on my phone at home. It loads fast, reads clean, and I can see the embedded activity even on mobile."

### Facilitator Stories

**F1: The Workshop Leader**
> "I'm running a 3-hour PD for 25 teachers. I need a facilitator guide that walks me through: (1) the AI standards gap, (2) hands-on lesson creation using the agent, (3) teachers creating their own lesson, (4) sharing and peer review."

---

## 6. Product Architecture

### 6.1 The Agent (Lesson Generator)

The AI agent is the core engine. It takes teacher inputs and generates structured, standards-aligned lesson content.

**Inputs:**
- Grade band (K-2, 3-5, 6-8, 9-12)
- CSTA AI Priority category (or "suggest for me")
  - A. Humans and AI
  - B. Representation and Reasoning
  - C. Machine Learning
  - D. Ethical AI System Design and Programming
  - E. Societal Impacts of AI
- Lesson duration (20 min, 30 min, 45 min, 60 min, multi-day)
- Existing context (what students already know, what tools are available)
- Output format preference

**Outputs (structured lesson content):**
- Lesson title and overview
- Learning objectives (tied to specific CSTA AI Priority outcomes)
- Standards alignment table (MSDE CS Standard code + CSTA AI Priority code)
- Materials needed
- Lesson sequence (warm-up, instruction, activity, assessment, wrap-up)
- Embedded student activities (discussion prompts, hands-on tasks, unplugged activities)
- Differentiation notes (scaffolding, extensions, accessibility)
- Assessment / check-for-understanding
- Teacher background notes ("what you need to know to teach this")
- Connection to existing MD resources (MCCE Toolkit links, ECSNet lessons, etc.)

**Knowledge Base (what the agent knows):**
- Full MSDE K-12 CS Standards (2018) — all grade bands, all concepts
- CSTA/AI4K12 AI Learning Priorities (2025) — all categories, all grade bands
- MSDE-to-CSTA crosswalk mapping (generated as part of this project)
- MCCE K-5 Toolkit resources and links
- ECSNet lesson repository structure
- Maryland CTE cluster framework (Digital Technology focus)
- AI4K12 Five Big Ideas and progression charts
- Grade-appropriate AI tools (Teachable Machine, MIT RAISE, Scratch, etc.)

### 6.2 Output Formats (Teacher Choice)

The agent generates structured content that can be rendered in multiple formats:

| Format | Use Case | Implementation |
|--------|----------|----------------|
| **Google Doc** | Editing, sharing with co-teachers, district submission | Google Docs API / export |
| **Google Slides** | Classroom presentation | Google Slides API / export |
| **PDF** | Printing, archiving, formal submission | PDF generation from template |
| **Markdown** | Version control, developer-friendly, GitHub | Native output |
| **HTML (hosted)** | Real-time student access, browser delivery | Static site / hosted page |
| **Interactive HTML** | Student activities, embedded assessments | Enhanced HTML with JS components |

**Export flow:**
```
Agent generates structured content (JSON/Markdown)
    |
    v
Teacher selects format(s)
    |
    +---> Google Doc --> Google Drive / Team Drive
    +---> Google Slides --> Google Drive / Team Drive
    +---> PDF --> Download / Drive
    +---> Markdown --> Download / Git
    +---> HTML --> Hosted URL (shareable with students)
    +---> Interactive HTML --> Hosted URL with activities
```

### 6.3 Student-Facing Delivery

**Browser-based, no-login access:**
- Teacher generates lesson -> gets a shareable URL
- Students access via any browser (Chromebook, phone, tablet, desktop)
- Mobile-responsive design
- Works offline after initial load (PWA approach)

**Content layers (progressive):**
1. **View layer** — Read-only lesson content (always available)
2. **Activity layer** — Embedded interactive components (drag-drop, multiple choice, code blocks, discussion prompts)
3. **Collaboration layer** — Real-time annotation, student responses visible to teacher (future phase)

### 6.4 Google Drive Integration

- One-click "Save to Drive" for any output format
- Support for both personal Drive and Team/Shared Drives
- Folder structure suggestion: `CS Lessons / AI-Aligned / [Grade Band] / [Category]`
- Maintain formatting and embedded links on export
- Version tracking (lesson v1, v2, etc.)

---

## 7. Workshop Module Design

The product is not just a tool — it's a **professional development experience**. The workshop module is the delivery vehicle.

### 7.1 Workshop Structure: "Teaching AI When Your Standards Don't"

**Duration:** 3 hours (adaptable to half-day or full-day)

**Module 1: The Landscape (30 min)**
- Where Maryland stands: the 2018 standards, the one AI mention
- What CSTA/AI4K12 says every student should know
- The gap — and why it matters now (SB0980, careers, student readiness)
- Hands-on: Teachers identify which CSTA AI Priority aligns closest to what they already teach

**Module 2: Meet the Agent (30 min)**
- Live demo: generate a lesson in real time
- Anatomy of a generated lesson (standards mapping, teacher notes, activities)
- Format options and Google Drive workflow
- Teachers explore 3 pre-generated example lessons (one per grade band)

**Module 3: Build Your Own (60 min)**
- Teachers create their first AI-aligned lesson using the agent
- Choose their grade band, AI category, duration, format
- Iterate: refine, adjust, personalize
- Export to their preferred format / Drive

**Module 4: Teach It Forward (30 min)**
- Pair-share: teachers present their lesson to a partner, get feedback
- Group discussion: what worked, what needs adjustment, what's missing
- Planning: when will you teach this? What support do you need?

**Module 5: Resources and Next Steps (15 min)**
- Connecting to MCCE Toolkit, ECSNet, CS4MD
- Ongoing access to the agent
- Community of practice (optional follow-up sessions)
- Feedback collection

### 7.2 Workshop Deliverables (what teachers leave with)

- [ ] At least one completed, standards-aligned AI lesson in their chosen format
- [ ] Saved to their Google Drive / Team Drive
- [ ] Student-accessible URL for their lesson
- [ ] MSDE-to-CSTA AI Priorities crosswalk reference card
- [ ] List of grade-appropriate AI tools and activities
- [ ] Connection to MCCE/ECSNet for additional resources

### 7.3 Facilitator Kit

- Facilitator guide (slide-by-slide notes)
- Presentation deck (customizable)
- Participant handouts
- Pre-workshop survey (assess comfort level with AI topics)
- Post-workshop survey (measure confidence change, collect feedback)
- Technical setup guide (agent access, Drive permissions, network requirements)

---

## 8. Standards Crosswalk (Core Data Model)

The agent's intelligence depends on a structured mapping between Maryland's current standards and the CSTA AI Priorities. This crosswalk is a first-class data artifact.

### 8.1 Crosswalk Structure

```
{
  "msde_standard": {
    "code": "8. DA.IM.01",
    "text": "Refine existing or develop and implement new computational models based on observed and generated data",
    "grade_band": "6-8",
    "concept": "Data Analysis",
    "subconcept": "Inference & Models"
  },
  "csta_ai_priority": {
    "category": "C. Machine Learning",
    "subtopic": "Building and Using AI Models",
    "grade_band": "6-8",
    "text": "Using a dataset and a machine learning pipeline, develop an AI model, and consider the impact of the model on various users.",
    "priority_level": "high"
  },
  "alignment_strength": "strong",
  "notes": "MSDE standard addresses computational models broadly; CSTA AI priority specifies ML pipeline and impact consideration. Lesson should bridge from general modeling to ML-specific modeling."
}
```

### 8.2 Alignment Categories

- **Strong alignment**: MSDE standard directly supports the AI priority with minimal adaptation
- **Partial alignment**: MSDE standard covers related concepts but needs AI-specific framing
- **Gap**: No corresponding MSDE standard; AI priority requires new content (these are the opportunities)
- **Extension**: MSDE standard can be extended to include AI without replacing existing content

### 8.3 Priority Mapping Summary

| MSDE Concept | CSTA AI Category | Alignment |
|---|---|---|
| Data Analysis > Inference & Models | C. Machine Learning | Partial — needs ML framing |
| Algorithms & Programming > Algorithms | B. Representation & Reasoning | Partial — needs AI algorithm types |
| Impacts of Computing > Culture & Diversity | E. Societal Impacts | Partial — needs AI-specific impacts |
| Impacts of Computing > Safety, Law & Ethics | D. Ethical AI System Design | Partial — needs AI ethics framing |
| Computing Systems > Hardware & Software | C. Machine Learning > Sensing | Weak — sensors mentioned but not in AI context |
| (no corresponding standard) | A. Humans and AI | **Gap** — entirely new content needed |
| 12. AP.A.01 (the one AI standard) | B + C combined | Partial — too narrow, only 12th grade |

---

## 9. Technical Requirements

### 9.1 Agent Requirements

| Requirement | Detail |
|---|---|
| **LLM backbone** | Claude (Anthropic) — for lesson generation, standards mapping, teacher dialogue |
| **Knowledge retrieval** | RAG over standards documents, AI priorities, MCCE resources |
| **Structured output** | JSON schema for lesson components; template rendering for each format |
| **Conversation mode** | Multi-turn: teacher refines lesson through dialogue with agent |
| **Batch mode** | Generate lesson sequence (e.g., 5-lesson unit) in one request |

### 9.2 Platform Requirements

| Requirement | Detail |
|---|---|
| **Access method** | Browser-based (primary); Claude Code agent (secondary for power users) |
| **Authentication** | Google OAuth (for Drive integration); anonymous access for student view |
| **Hosting** | Static hosting for student-facing pages (Cloudflare Pages, Vercel, or similar) |
| **Google API integration** | Docs API, Slides API, Drive API (including Shared/Team Drives) |
| **Mobile responsive** | All student-facing and teacher-facing views must work on phone/tablet |
| **Offline capability** | Student lesson pages work offline after first load (service worker / PWA) |
| **Accessibility** | WCAG 2.1 AA minimum; screen reader compatible; keyboard navigable |

### 9.3 Data Requirements

| Data Asset | Source | Format | Status |
|---|---|---|---|
| MSDE K-12 CS Standards | `docs/msde_K-12StandardsLandscape.pdf` | Structured JSON (to be extracted) | Needs processing |
| CSTA AI Priorities | `docs/AI-Priorities-for-All-K-12-Students-Report-from-CSTA-AI4K12.pdf` | Structured JSON (to be extracted) | Needs processing |
| MSDE-CSTA Crosswalk | To be created | JSON | Not started |
| MD CTE Crosswalk | `docs/MD-CTE-Crosswalk-2026-02-10.xlsx` | XLSX / JSON | Available |
| MCCE K-5 Toolkit | cs4md.com | Links + metadata | Needs scraping |
| ECSNet Lessons | sparkcsmd.wixsite.com/ecsnet | Links + metadata | Needs scraping |
| AI4K12 Five Big Ideas | ai4k12.org | Structured data | Needs processing |
| Grade-appropriate AI tools | Curated list | JSON | Not started |

---

## 10. Phased Delivery

### Phase 1: Foundation (Weeks 1-4)
- [ ] Extract and structure MSDE standards into JSON
- [ ] Extract and structure CSTA AI Priorities into JSON
- [ ] Build MSDE-to-CSTA crosswalk mapping
- [ ] Create agent with standards knowledge base
- [ ] Implement lesson generation (Markdown output)
- [ ] Basic format conversion (Markdown -> PDF, Google Doc)
- [ ] Workshop Module 1 content (The Landscape)

### Phase 2: Teacher Experience (Weeks 5-8)
- [ ] Multi-format output (Google Docs, Slides, PDF, HTML)
- [ ] Google Drive integration (personal + Team Drive)
- [ ] Conversational lesson refinement (multi-turn agent)
- [ ] Teacher-facing web interface (browser-based agent access)
- [ ] Workshop Modules 2-5 content
- [ ] Facilitator kit
- [ ] Pilot workshop with 10-15 teachers

### Phase 3: Student Access (Weeks 9-12)
- [ ] Student-facing hosted lesson pages (shareable URLs)
- [ ] Mobile-responsive lesson viewer
- [ ] Embedded interactive activities (basic: discussion prompts, multiple choice)
- [ ] Offline capability (PWA)
- [ ] Pilot with 2-3 classrooms

### Phase 4: Scale (Weeks 13+)
- [ ] Advanced interactive activities (drag-drop, code blocks, AI tool embeds)
- [ ] Real-time collaboration features
- [ ] Analytics (which lessons are created, which standards are covered)
- [ ] Integration with MCCE Toolkit and ECSNet
- [ ] District-level deployment support
- [ ] Updated standards integration (when MSDE publishes AI-inclusive standards)

---

## 11. Success Criteria

| Metric | Target | Measurement |
|---|---|---|
| Lessons created per workshop | >= 1 per teacher | Workshop output count |
| Teacher confidence (pre/post) | +30% increase | Survey: "I feel equipped to teach AI" |
| Lesson alignment accuracy | 100% dual-mapped | Every lesson cites MSDE + CSTA codes |
| Format export success | >= 95% | Google Drive save completes without error |
| Student page load time | < 3 seconds | Lighthouse performance score |
| Mobile usability | Score >= 90 | Lighthouse mobile score |
| Workshop NPS | >= 50 | Post-workshop survey |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| MSDE releases new standards mid-build | Medium | Medium | Modular crosswalk design — new standards plug in as a data update, not a rebuild |
| Teachers lack Google accounts | Low (MD uses Google Workspace widely) | Medium | Support non-Google export (PDF, Markdown download) |
| LLM generates inaccurate standards mapping | Medium | High | Crosswalk is pre-built and verified; agent retrieves from verified mappings, doesn't guess |
| Workshop time too short for meaningful output | Medium | High | Pre-load example lessons; ensure 60+ min hands-on time |
| Student devices can't access hosted pages | Low | Medium | PWA offline support; minimal JS; works on low-bandwidth |
| AI tools referenced in lessons require age 13+ | High | Medium | Agent flags age-restricted tools; suggests unplugged alternatives for K-5 |

---

## 13. Open Questions

1. **Authentication model**: Do teachers need individual accounts, or is workshop-code-based access sufficient for initial pilots?
2. **Content moderation**: Should generated lessons go through a review step before being student-accessible, or is teacher judgment sufficient?
3. **Branding**: Does this live under MCCE/CS4MD branding, MSDE branding, independent, or co-branded?
4. **Sustainability**: Post-pilot, who maintains the agent and hosting? District-level? State-level? Grant-funded?
5. **CSTA standards revision timing**: National CSTA standards rewrite lands summer 2026. Do we build for current MSDE standards and plan to update, or wait?
6. **ECSNet integration depth**: Surface-level linking to existing ECSNet lessons, or deeper integration (e.g., agent can remix ECSNet lessons with AI framing)?

---

## 14. Reference Materials

| Document | Location | Description |
|---|---|---|
| CSTA/AI4K12 AI Priorities Report | `docs/AI-Priorities-for-All-K-12-Students-Report-from-CSTA-AI4K12.pdf` | 2025 report defining AI learning priorities for K-12 |
| MSDE K-12 CS Standards | `docs/msde_K-12StandardsLandscape.pdf` | Maryland's current CS standards (2018) |
| MD CTE Crosswalk | `docs/MD-CTE-Crosswalk-2026-02-10.xlsx` | Maryland CTE cluster-to-postsecondary mapping |
| CS4MD K-5 Toolkit | [cs4md.com/toolkit-for-k-5-computer-science](https://www.cs4md.com/toolkit-for-k-5-computer-science) | MCCE elementary CS resource collection |
| ECSNet Lesson Repository | [sparkcsmd.wixsite.com/ecsnet](https://sparkcsmd.wixsite.com/ecsnet) | Maryland CS lesson database |
| CS4MD Preservice CS | [cs4md.com/highereducation/preservicecs](https://www.cs4md.com/highereducation/preservicecs) | Maryland preservice CS teacher programs |
| CS4MD Standards Annotations | [cs4md.com/annotations](https://www.cs4md.com/annotations) | Clarifications and implementation guidance for MD standards |
| SB0980 (2024) | [Maryland Legislature](https://mgaleg.maryland.gov/mgawebsite/Legislation/Details/sb0980?ys=2024RS) | Legislation requiring AI in CS standards by June 2025 |
| CSTA K-12 Standards Revision | [csteachers.org/k12standards/revision](https://csteachers.org/k12standards/revision/) | National standards rewrite timeline (summer 2026) |
