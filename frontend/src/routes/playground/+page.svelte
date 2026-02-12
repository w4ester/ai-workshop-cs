<script>
	/**
	 * Playground — 5 tabbed Pyodide activities mapped to CSTA AI Priorities
	 * Pyodide loads lazily on first "Run" click
	 */
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import { runPython } from '$lib/pyodide.js';

	// Tab definitions
	const tabs = [
		{
			id: 'A', title: 'Can a Computer Think Like You?',
			grades: 'K-5', badge: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
			category: 'A. Humans and AI', msde: 'Gap — no current standard',
			desc: 'Students compare how humans and AI make decisions. This unplugged-to-plugged activity starts with a guessing game: is the decision made by a human or an AI?',
			filename: 'humans_and_ai.py'
		},
		{
			id: 'B', title: 'How Does AI "See" Data?',
			grades: '6-8', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
			category: 'B. Representation & Reasoning', msde: '8.DA.IM.01 (partial)',
			desc: 'Students explore how AI represents information as numbers. Everything AI works with — text, images, categories — must be converted to numbers first.',
			filename: 'representation.py'
		},
		{
			id: 'C', title: 'Train Your Own Classifier!',
			grades: '6-8', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
			category: 'C. Machine Learning', msde: '8.DA.IM.01 (extend to ML)',
			desc: 'Students build a simple machine learning model from scratch. Feed it examples, then test it on new data. See how training data affects predictions.',
			filename: 'train_classifier.py'
		},
		{
			id: 'D', title: 'Bias Detective',
			grades: '9-12', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
			category: 'D. Ethical AI System Design', msde: 'IC.C.02 (extend to AI bias)',
			desc: 'Students investigate how biased training data leads to unfair AI decisions. Analyze a hiring dataset and discover hidden bias, then fix it.',
			filename: 'bias_detective.py'
		},
		{
			id: 'E', title: 'AI Impact Simulator',
			grades: '9-12', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
			category: 'E. Societal Impacts of AI', msde: '8.IC.C.01 (extend to AI)',
			desc: 'Students model how AI adoption affects different sectors of society. Adjust parameters and see ripple effects across jobs, education, environment, and equity.',
			filename: 'ai_impact_sim.py'
		}
	];

	// Original Python code for each tab
	const originalCodes = [
		// Tab A: Humans & AI
`# === Can a Computer Think Like You? ===
# CSTA AI Priority A: Humans and AI
# Grade Band: 3-5

# Humans and AI both make decisions — but DIFFERENTLY!
# Let's compare...

decisions = [
    {"task": "Pick your favorite ice cream flavor", "who": "Human",
     "reason": "AI doesn't have taste buds or preferences!"},
    {"task": "Sort 1,000 photos by color", "who": "AI",
     "reason": "AI can compare pixels super fast. Humans get tired!"},
    {"task": "Tell if your friend is sad", "who": "Human",
     "reason": "Humans understand emotions from experience."},
    {"task": "Check if an email is spam", "who": "AI",
     "reason": "AI can scan patterns in millions of emails instantly."},
    {"task": "Write a poem about your dog", "who": "Human",
     "reason": "Only YOU know what makes YOUR dog special!"},
]

print("=== HUMAN vs AI: Who Does It Better? ===\\n")

human_count = 0
ai_count = 0

for d in decisions:
    print(f"Task: {d['task']}")
    print(f"  Better at it: {d['who']}")
    print(f"  Why: {d['reason']}")
    print()
    if d['who'] == 'Human':
        human_count += 1
    else:
        ai_count += 1

print(f"Score: Humans {human_count} — AI {ai_count}")
print(f"\\nKey idea: AI is a TOOL that humans create and control.")
print("Neither is 'better' — they're good at DIFFERENT things!")

# === TRY IT: Add your own! ===
# Add a new decision to the list above.
# Think: Is this better for a human or AI? Why?`,

		// Tab B: Representation
`# === How Does AI "See" Data? ===
# CSTA AI Priority B: Representation & Reasoning
# Grade Band: 6-8

# AI can't read words — it reads NUMBERS.
# Let's see how text becomes numbers!

def text_to_numbers(text):
    """Convert each character to its number code (ASCII)"""
    return [ord(char) for char in text]

def simple_similarity(word1, word2):
    """A simple way to measure how 'similar' two words are"""
    nums1 = text_to_numbers(word1.lower())
    nums2 = text_to_numbers(word2.lower())
    # Compare average character values
    avg1 = sum(nums1) / len(nums1)
    avg2 = sum(nums2) / len(nums2)
    diff = abs(avg1 - avg2)
    return round(100 - diff, 1)

# Part 1: See how AI represents text
print("=== HOW AI SEES YOUR WORDS ===\\n")
words = ["Hello", "AI", "Maryland", "Code"]
for word in words:
    numbers = text_to_numbers(word)
    print(f'  "{word}" → {numbers}')

# Part 2: Simple similarity
print("\\n=== WORD SIMILARITY (simple model) ===\\n")
pairs = [("cat", "hat"), ("dog", "log"), ("happy", "sad"), ("AI", "ai")]
for w1, w2 in pairs:
    score = simple_similarity(w1, w2)
    print(f'  "{w1}" vs "{w2}" → similarity: {score}')

print("\\n--- Key Idea ---")
print("Real AI uses MUCH more sophisticated representations")
print("(called 'embeddings'), but the core idea is the same:")
print("convert everything to numbers so math can find patterns!")

# === TRY IT ===
# Change the words above — what happens to the numbers?
# Add your own word pairs to test similarity!`,

		// Tab C: Machine Learning
`# === Train Your Own Classifier! ===
# CSTA AI Priority C: Machine Learning
# Grade Band: 6-8

# Machine Learning = Learning from EXAMPLES
# Let's build a fruit classifier!

# Step 1: Training data (what we teach the AI)
training_data = [
    {"color": "red",    "size": "small",  "fruit": "apple"},
    {"color": "red",    "size": "small",  "fruit": "apple"},
    {"color": "yellow", "size": "long",   "fruit": "banana"},
    {"color": "yellow", "size": "long",   "fruit": "banana"},
    {"color": "orange", "size": "medium", "fruit": "orange"},
    {"color": "green",  "size": "small",  "fruit": "apple"},
    {"color": "yellow", "size": "medium", "fruit": "orange"},
]

# Step 2: "Train" — count patterns
print("=== TRAINING PHASE ===")
print(f"Learning from {len(training_data)} examples...\\n")

patterns = {}
for item in training_data:
    key = f"{item['color']}+{item['size']}"
    fruit = item['fruit']
    if key not in patterns:
        patterns[key] = {}
    patterns[key][fruit] = patterns[key].get(fruit, 0) + 1

print("Patterns learned:")
for key, fruits in patterns.items():
    color, size = key.split("+")
    print(f"  {color} + {size} → {fruits}")

# Step 3: Predict!
def predict(color, size):
    key = f"{color}+{size}"
    if key in patterns:
        best = max(patterns[key], key=patterns[key].get)
        confidence = patterns[key][best] / sum(patterns[key].values())
        return best, round(confidence * 100)
    return "unknown", 0

print("\\n=== PREDICTION PHASE ===")
tests = [
    ("red", "small"),
    ("yellow", "long"),
    ("orange", "medium"),
    ("purple", "small"),   # never seen this!
]

for color, size in tests:
    fruit, conf = predict(color, size)
    status = f"{conf}% confident" if conf > 0 else "never seen this combo!"
    print(f"  {color} + {size} → {fruit} ({status})")

print("\\n--- Key Ideas ---")
print("1. ML learns PATTERNS from training data")
print("2. More examples = better predictions")
print("3. It can't predict what it's never seen!")
print("4. Biased training data = biased predictions")

# === TRY IT ===
# Add more training examples above!
# What happens if you add 5 "purple + small = grape"?
# What happens with ALL apples and no bananas?`,

		// Tab D: Ethical AI
`# === Bias Detective: Find the Unfairness ===
# CSTA AI Priority D: Ethical AI System Design
# Grade Band: 9-12

# A company trained an AI to screen job applications.
# Let's investigate the training data for bias.

import random
random.seed(42)

# Simulated historical hiring data
# (reflects real-world bias that existed in past decisions)
applicants = []
for i in range(200):
    school = random.choice(["Elite University"] * 3 + ["State College"] * 7)
    has_cs_degree = random.random() > 0.3
    years_exp = random.randint(0, 15)

    # Historical bias: elite school applicants were hired more often
    # regardless of actual qualifications
    if school == "Elite University":
        hired = random.random() > 0.25  # 75% hire rate
    else:
        hired = random.random() > 0.60  # 40% hire rate

    applicants.append({
        "school": school, "cs_degree": has_cs_degree,
        "years_exp": years_exp, "hired": hired
    })

# Analyze the data
print("=== BIAS DETECTIVE: Hiring Data Analysis ===\\n")

# Overall stats
total = len(applicants)
hired_count = sum(1 for a in applicants if a["hired"])
print(f"Total applicants: {total}")
print(f"Total hired: {hired_count} ({round(hired_count/total*100)}%)\\n")

# By school type
for school in ["Elite University", "State College"]:
    group = [a for a in applicants if a["school"] == school]
    group_hired = sum(1 for a in group if a["hired"])
    rate = round(group_hired / len(group) * 100)
    print(f"{school}:")
    print(f"  Applied: {len(group)} | Hired: {group_hired} | Rate: {rate}%")

    # Check if qualifications justify the difference
    avg_exp = round(sum(a["years_exp"] for a in group) / len(group), 1)
    cs_rate = round(sum(1 for a in group if a["cs_degree"]) / len(group) * 100)
    print(f"  Avg experience: {avg_exp} yrs | CS degree: {cs_rate}%")
    print()

print("=== BIAS REPORT ===")
print("The hiring RATES differ significantly by school name,")
print("but the QUALIFICATIONS (experience, CS degree) are similar!")
print()
print("If an AI learns from this data, it will REPLICATE the bias.")
print("It will favor 'Elite University' — not because those")
print("applicants are better, but because the HISTORICAL data")
print("reflects human prejudice, not merit.")
print()
print("--- What Can We Do? ---")
print("1. Audit training data BEFORE building the model")
print("2. Remove features that encode bias (school name)")
print("3. Test model outputs for disparate impact")
print("4. Create 'model cards' documenting known limitations")
print("5. Include diverse stakeholders in AI design")

# === TRY IT ===
# Change the hire rates above — make them EQUAL.
# What would fair training data look like?`,

		// Tab E: Societal Impacts
`# === AI Impact Simulator ===
# CSTA AI Priority E: Societal Impacts of AI
# Grade Band: 9-12

# Simulate how AI adoption affects a community.
# Change the settings below and see what happens!

# === SETTINGS (change these!) ===
ai_adoption_rate = 0.6    # 0.0 to 1.0 (60% = moderate adoption)
investment_in_training = 0.4  # 0.0 to 1.0 (how much we invest in retraining)
regulation_level = 0.3    # 0.0 to 1.0 (how regulated is AI use)

# === SIMULATION ===
print("=" * 50)
print("    AI COMMUNITY IMPACT SIMULATOR")
print("=" * 50)
print(f"\\n  AI Adoption Rate:     {ai_adoption_rate*100:.0f}%")
print(f"  Retraining Investment: {investment_in_training*100:.0f}%")
print(f"  Regulation Level:      {regulation_level*100:.0f}%")
print()

# Jobs impact
jobs_displaced = round(ai_adoption_rate * 35)
jobs_created = round(ai_adoption_rate * 20 + investment_in_training * 15)
net_jobs = jobs_created - jobs_displaced
print("--- JOBS ---")
print(f"  Jobs automated away:   ~{jobs_displaced}% of current roles")
print(f"  New jobs created:      ~{jobs_created}% new roles")
print(f"  Net change:            {'+' if net_jobs >= 0 else ''}{net_jobs}%")

# Education impact
ed_access = round(50 + ai_adoption_rate * 40 - (1-regulation_level) * 15)
ed_quality = round(60 + investment_in_training * 30)
print("\\n--- EDUCATION ---")
print(f"  Learning access score:  {min(ed_access, 100)}/100")
print(f"  Teacher readiness:      {min(ed_quality, 100)}/100")

# Environment
energy = round(ai_adoption_rate * 45 - regulation_level * 20)
efficiency = round(ai_adoption_rate * 30)
print("\\n--- ENVIRONMENT ---")
print(f"  Energy use increase:   +{max(energy, 0)}%")
print(f"  Efficiency gains:      +{efficiency}%")
print(f"  Net environmental:     {'Concerning' if energy > efficiency else 'Manageable'}")

# Equity
equity_gap = round((ai_adoption_rate * 40) - (investment_in_training * 35) - (regulation_level * 20))
print("\\n--- EQUITY ---")
print(f"  Digital divide change: {'+' if equity_gap > 0 else ''}{equity_gap} points")
print(f"  Status: {'Gap WIDENING' if equity_gap > 5 else 'Gap STABLE' if equity_gap > -5 else 'Gap NARROWING'}")

# Overall assessment
score = round(50 + jobs_created - jobs_displaced + investment_in_training*20 + regulation_level*10 - ai_adoption_rate*5)
print(f"\\n{'=' * 50}")
print(f"  COMMUNITY WELLNESS SCORE: {min(max(score, 0), 100)}/100")
bar = '#' * (min(max(score, 0), 100) // 5) + '-' * (20 - min(max(score, 0), 100) // 5)
print(f"  [{bar}]")
print(f"{'=' * 50}")
print()
print("Key takeaway: AI impact depends on HUMAN CHOICES")
print("about investment, regulation, and equity — not")
print("just the technology itself!")

# === TRY IT ===
# Scenario 1: High adoption, NO retraining, NO regulation
#   → Change to: 0.9, 0.0, 0.0
# Scenario 2: Moderate adoption WITH strong support
#   → Change to: 0.5, 0.8, 0.7
# Which community would YOU want to live in?`
	];

	// State
	let activeTab = $state(0);
	let codes = $state(originalCodes.map(c => c));
	let outputs = $state(tabs.map(() => ''));
	let isRunning = $state(false);
	let pyodideStatus = $state('');
	let pyodidePct = $state(0);
	let tab = $derived(tabs[activeTab]);

	async function handleRun() {
		if (isRunning) return;
		isRunning = true;
		outputs[activeTab] = '';

		const result = await runPython(codes[activeTab], (progress) => {
			pyodideStatus = progress.status;
			pyodidePct = progress.pct;
		});

		outputs[activeTab] = result.output;
		pyodideStatus = '';
		isRunning = false;
	}

	function handleReset() {
		codes[activeTab] = originalCodes[activeTab];
		outputs[activeTab] = '';
	}
</script>

<svelte:head>
	<title>Playground — AI Workshop CS</title>
</svelte:head>

<!-- Header -->
<section class="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-800 text-white py-12">
	<div class="max-w-5xl mx-auto px-6">
		<h1 class="text-3xl font-extrabold tracking-tight mb-2">Interactive Playground</h1>
		<p class="text-blue-100 max-w-2xl">
			Run Python code in your browser — no installation needed. Five AI-themed activities, each mapped to a CSTA AI Priority category.
		</p>
	</div>
</section>

<!-- Tab bar -->
<section class="max-w-5xl mx-auto px-6 pt-6">
	<div class="flex gap-0 border-b-2 border-gray-200 dark:border-slate-700 overflow-x-auto scrollbar-hide">
		{#each tabs as tab, i}
			<button
				onclick={() => activeTab = i}
				class="px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-3 transition-colors {activeTab === i ? 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 border-transparent hover:text-blue-500'}"
			>
				{tab.id}.
				<span class="hidden sm:inline"> {tab.title}</span>
				<span class="ml-1.5 inline-block text-xs px-2 py-0.5 rounded-full font-bold {tab.badge}">
					{tab.grades}
				</span>
			</button>
		{/each}
	</div>
</section>

<!-- Active panel -->
<section class="max-w-5xl mx-auto px-6 py-6">
	<!-- Activity description -->
	<div class="mb-5">
		<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{tab.title}</h2>
		<p class="text-sm text-gray-600 dark:text-gray-300 mb-3">{tab.desc}</p>
		<div class="flex flex-wrap gap-2">
			<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
				CSTA: {tab.category}
			</span>
			<span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
				MSDE: {tab.msde}
			</span>
			<span class="text-xs font-bold px-2.5 py-1 rounded-full {tab.badge}">
				Grades {tab.grades}
			</span>
		</div>
	</div>

	<!-- Code editor -->
	<CodeEditor
		bind:code={codes[activeTab]}
		filename={tab.filename}
		onRun={handleRun}
		onReset={handleReset}
		{isRunning}
		output={outputs[activeTab]}
	/>

	<!-- Pyodide loading status -->
	{#if pyodideStatus}
		<div class="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3 text-center">
			<div class="text-sm text-blue-700 dark:text-blue-300 font-medium mb-2">{pyodideStatus}</div>
			<div class="h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
				<div class="h-full bg-blue-600 rounded-full transition-all duration-300" style="width: {pyodidePct}%"></div>
			</div>
		</div>
	{/if}

	<!-- Callout -->
	<div class="mt-6 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex items-start gap-3">
		<span class="text-xl">&#128161;</span>
		<div>
			<p class="text-sm text-gray-700 dark:text-gray-300">
				<strong>Want a full lesson plan around this activity?</strong> Head to the
				<a href="/lessons" class="text-blue-600 hover:underline font-semibold">Lesson Builder</a>
				and select the <strong>{tab.category}</strong> category to generate a complete, standards-aligned lesson.
			</p>
		</div>
	</div>
</section>
