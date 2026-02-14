# Lesson 01: Your First AI Skill — Teaching a Local Model to Manage Files

**Audience:** Maryland CS Educators, CTE Instructors, Curriculum Developers
**Time:** ~45 minutes (20 min guided, 25 min hands-on)
**Prerequisites:** A Mac or Linux computer, terminal access, ~8 GB free disk space
**Goal:** Install a local AI model, teach it to manage files using structured instructions, and understand how "skills" work

---

## The Big Idea

You already know how to write lesson plans that guide a student through a task step by step. In this lesson, you'll write instructions that guide an **AI model** through file management — and you'll do it on your own computer, with no cloud services, no API keys, and no cost.

This is the same concept behind **skills** in platforms like WF-AI: structured instructions that make AI models reliable at specific tasks.

**The teaching analogy:**

| Teaching a Student | Teaching an AI |
|---|---|
| Lesson plan with clear objectives | Skill file with clear operations |
| Step-by-step procedures | Numbered action steps |
| Scaffolding for younger learners | Explicit instructions for smaller models |
| "Show your work" | "Report what you did after each step" |
| "Ask before you erase the whiteboard" | "Confirm before you delete" |

---

## Part 1: Set Up Your Local AI (10 minutes)

### What is Ollama?

Ollama lets you run AI models directly on your computer. No internet required after setup. No data leaves your machine. Free.

Think of it like installing a calculator app — except instead of math, it does language.

### Install Ollama

**On Mac:**

1. Open your web browser and go to: https://ollama.com/download
2. Download and install the Mac version
3. Open Terminal (Applications → Utilities → Terminal)

**Or if you use Homebrew:**
```bash
brew install ollama
```

### Pull Your First Model

In Terminal, run:

```bash
ollama pull gemma3:4b-it-qat
```

This downloads a 4 GB model called Gemma 3. It's:
- **Small enough** for any modern laptop (needs ~8 GB RAM)
- **Capable enough** to follow structured instructions
- **Fast enough** for interactive use
- **Free** — runs entirely on your machine

### Verify It Works

```bash
ollama run gemma3:4b-it-qat "What does CRUD stand for in computer science?"
```

You should get a response explaining Create, Read, Update, Delete. If you do — you just ran AI locally.

---

## Part 2: What is CRUD? (5 minutes)

CRUD is the backbone of how every application manages data:

| Letter | Meaning | What You Already Do |
|--------|---------|-------------------|
| **C** | Create | Save a new Google Doc, make a folder on your desktop |
| **R** | Read | Open a file, browse a folder, search for a document |
| **U** | Update | Edit a lesson plan, rename a file, change a grade |
| **D** | Delete | Move a file to trash, remove an old folder |

Every app your students use — Google Drive, Canvas, PowerSchool — is CRUD underneath. When you organize your lesson files, you're doing CRUD. This lesson makes that visible.

---

## Part 3: Teach the AI to Do CRUD (15 minutes)

### The Experiment

We'll give our local model a set of structured instructions (a "system prompt") and then ask it to help with file tasks. This is exactly how skills work — structured instructions that guide the AI.

### Step 1: Create a Practice Folder

```bash
mkdir -p ~/practice-crud
echo "# My First Lesson" > ~/practice-crud/hello.md
echo '{"subject": "CS", "grade": 5}' > ~/practice-crud/sample.json
mkdir -p ~/practice-crud/activities
```

You now have:
```
~/practice-crud/
├── hello.md
├── sample.json
└── activities/
```

### Step 2: Build a Custom AI Helper

Create a file called `Modelfile` (this is Ollama's way of customizing a model):

Open Terminal and run:

```bash
cat > ~/practice-crud/Modelfile << 'DONE'
FROM gemma3:4b-it-qat

SYSTEM """
You are a file management assistant. You help users Create, Read, Update, and Delete files and folders.

RULES:
1. Ask which folder to work in before doing anything
2. Always show file contents before suggesting edits
3. Always confirm before any deletion — say what will be lost
4. Report what you did after each operation
5. Stay within the designated folder — never touch files outside it

OPERATIONS:

CREATE — When the user wants a new file or folder:
- Ask what to name it and what to put in it
- Provide the exact terminal command to create it
- Confirm it was created

READ — When the user wants to see what exists:
- Show the terminal command to list or read files
- Describe what you see
- Offer to go deeper into any file

UPDATE — When the user wants to change something:
- Show the current content first
- Describe exactly what will change
- Provide the command or new content

DELETE — When the user wants to remove something:
- Name the file and its size/date
- Ask: "Delete this? It cannot be undone."
- Only proceed after confirmation

After every operation, report:
- What you did
- The path affected
- The current state of the folder
"""

PARAMETER temperature 0.3
PARAMETER num_ctx 4096
DONE
```

### Step 3: Build and Run Your Custom Model

```bash
cd ~/practice-crud
ollama create file-helper -f Modelfile
ollama run file-helper
```

You now have a custom AI model named `file-helper` that follows your CRUD rules.

### Step 4: Test Each CRUD Operation

Try these conversations with your `file-helper`:

**CREATE:**
```
You: I want to work in ~/practice-crud. Create a new file called lesson-plan.md
     with a template for a grade 5 CS lesson.
```

**READ:**
```
You: What files are in ~/practice-crud? Here's what I see when I run ls:
     hello.md  sample.json  activities/  lesson-plan.md  Modelfile
     Tell me about each file.
```

**UPDATE:**
```
You: Here's the content of hello.md:
     # My First Lesson

     I want to change the title to "My First AI Lesson" and add a line
     that says "Grade: 5"
```

**DELETE:**
```
You: I want to remove hello.md from my practice folder.
```

### What to Notice

As you test, pay attention to:
- Does the model **ask for confirmation** before deleting? (It should — that's Rule 3)
- Does it **show current content** before suggesting edits? (Rule 2)
- Does it **report what happened** after each step? (Rule 4)
- Does it **stay in your folder**? (Rule 5)

The model follows these rules because you wrote them clearly. **That's what a skill is.**

---

## Part 4: From Modelfile to Skill (5 minutes)

What you just created — a `Modelfile` with structured SYSTEM instructions — is the local-model version of a **skill**. In the WF-AI Platform, the same concept lives in a `SKILL.md` file:

| Ollama (Local) | WF-AI Platform (Skill) |
|----------------|----------------------|
| `Modelfile` with SYSTEM prompt | `SKILL.md` with frontmatter + instructions |
| `ollama create file-helper` | Skill auto-loads when triggered |
| One model, one task | One skill, works with any model |
| You run commands manually | Claude Code runs tools directly |

The progression:

```
Modelfile (local, manual)
    ↓
SKILL.md (portable, automatic)
    ↓
Shared plugin (other educators can install it)
```

The `file-crud` skill in WF-AI Platform (`/.wf-ai/skills/file-crud/`) does exactly what your Modelfile does — but it's model-agnostic, includes a shell script for automation (`scripts/crud-helper.sh`), and works with Claude Code's tools directly.

---

## Part 5: Try the Shell Script (5 minutes)

The `file-crud` skill includes a script that bridges Ollama and file operations:

```bash
# From WF-AI Platform
# Copy or symlink the script to your practice folder:
cp ~/.wf-ai/skills/file-crud/scripts/crud-helper.sh ~/practice-crud/

# Make it executable
chmod +x ~/practice-crud/crud-helper.sh

# Try each operation:
cd ~/practice-crud

# LIST what's in the folder
./crud-helper.sh list .

# READ a file (with AI summary for large files)
./crud-helper.sh read sample.json

# CREATE a new file with AI-generated content
./crud-helper.sh create new-lesson.md "A grade 5 lesson plan about how AI recognizes patterns"

# UPDATE a file with AI guidance
./crud-helper.sh update hello.md "Change the title and add standards alignment"

# DELETE (with confirmation)
./crud-helper.sh delete hello.md
```

Notice: the script calls your local Ollama model to generate content, but it handles the actual file operations. The AI is the **brain**, the script is the **hands**.

---

## Why This Matters

### 1. You Just Taught an AI

You wrote structured instructions that a machine follows. That's **computational thinking** — the same skill you're teaching your students (CSTA 2-AP-10).

### 2. Local = Private and Free

Everything ran on your machine. No student data left your computer. No subscription. This matters for schools.

### 3. Smaller Model + Better Instructions = Same Results

A 4 GB model followed your CRUD rules because the instructions were clear and specific. The same principle works in your classroom: well-scaffolded instructions help every learner, not just the "advanced" ones.

### 4. CRUD is Universal

Whether students manage a Google Drive, update a spreadsheet, or build their first app — CRUD is the pattern underneath. This lesson makes it visible.

### 5. Skills Scale

Once written, your instructions work across models and machines. Write once, use everywhere — that's the power of the skill pattern.

---

## Standards Alignment

| Standard | How This Lesson Connects |
|----------|------------------------|
| **CSTA AI Priority A1** | Understand what AI is and what it can do — students see AI running locally |
| **CSTA AI Priority D1** | Understand how humans interact with AI systems — structured prompts as interaction design |
| **CSTA AI Priority D2** | Evaluate AI-generated content — does the model follow the rules you wrote? |
| **CSTA 2-AP-10** | Use flowcharts/pseudocode for complex problems — CRUD operations as algorithms |
| **MSDE 6.AP.A.01** | Iterative development — test, refine, test again |

---

## Reflection Questions

1. **Your Modelfile had 5 rules. Which rule did the model follow best? Which did it struggle with?** Think about: why some instructions are harder for AI than others.

2. **How is writing a Modelfile similar to writing a lesson plan?** Think about: audience, clarity, scaffolding, expected outcomes.

3. **What would you change in the SYSTEM prompt to make the model work better for your specific classroom files?** Think about: file naming, folder structure, subject-specific templates.

4. **What happens if you remove the "confirm before delete" rule?** Think about: safety, reversibility, responsible AI use.

5. **Could a student write these instructions?** Think about: what age/grade could do this activity themselves.

---

## Next Steps

| Lesson | Topic |
|--------|-------|
| **Lesson 02** | Working with structured data — JSON CRUD with your crosswalk files |
| **Lesson 03** | Creating a slash command — one-click access to your skill |
| **Lesson 04** | Sharing your skill — packaging it as a plugin other educators can install |

---

## Appendix: Quick Reference Card

Print this for workshops:

```
┌─────────────────────────────────────────────┐
│  FILE CRUD — Quick Reference                │
├─────────────────────────────────────────────┤
│  SETUP                                      │
│  brew install ollama                        │
│  ollama pull gemma3:4b-it-qat               │
│                                             │
│  CRUD OPERATIONS                            │
│  C = Create    mkdir -p / echo > file       │
│  R = Read      cat file / ls folder         │
│  U = Update    edit content / mv rename     │
│  D = Delete    rm file / rmdir folder       │
│                                             │
│  SAFETY RULES                               │
│  1. Set a working folder first              │
│  2. Read before you edit                    │
│  3. Confirm before you delete               │
│  4. Report what you did                     │
│  5. Stay in your folder                     │
│                                             │
│  CUSTOM MODEL                               │
│  ollama create file-helper -f Modelfile     │
│  ollama run file-helper                     │
│                                             │
│  SCRIPT                                     │
│  ./crud-helper.sh list .                    │
│  ./crud-helper.sh read <file>               │
│  ./crud-helper.sh create <file> "<prompt>"  │
│  ./crud-helper.sh update <file> "<prompt>"  │
│  ./crud-helper.sh delete <file>             │
└─────────────────────────────────────────────┘
```

---

*Part of the MSDE-CSTA AI Lesson Builder project*
*Skills: `ollama-setup` + `file-crud` in WF-AI Platform*

*w4ester & AI Orchestration*
