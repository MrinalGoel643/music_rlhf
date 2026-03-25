# 🎵 Music Rationale RLHF
### Challenge 2 — Taming the Language Model

> Fine-tuning `Qwen/Qwen2.5-1.5B-Instruct` to generate **better explanations** for why someone would enjoy a recommended song, using human preference data and a full RLHF loop (Reward Model + PPO).

**Authors:** Mrinal · Atharva

---

## What This Is

This project implements a complete RLHF pipeline on a music recommendation task — but with a deliberate framing choice.

Rather than recommending songs (a collaborative filtering problem, not an LLM alignment problem), we frame it as a **text quality task**: given a song a user loves, generate a rationale explaining *why* a recommended song fits. Humans then pick which of two rationales is more specific and insightful. This gives us a genuine pairwise preference signal over text, which is exactly what RLHF trains on.

The overoptimization behavior is the analytical centerpiece — by training a small reward model on ~80 examples and running 50 PPO steps, we observe Goodhart's Law in action: length hacking, template collapse, and hollow specificity.

---

## Project Files

| File | Description |
|---|---|
| `music_rlhf.ipynb` | Full pipeline notebook — runs end to end |
| `music_rlhf_preferences.json` | 100 human preference pairs with ties |
| `music-rlhf-ui.zip` | Vercel-deployable React frontend for preference collection |
| `music_rlhf_presentation.pptx` | 11-slide presentation deck |
| `music_rlhf_summary.md` | Shareable project summary for teammates |

---

## Pipeline

```
Preference Data (100 pairs)
        ↓
Bradley-Terry Reward Model
        ↓
SFT Baseline (LoRA, 15 epochs)
        ↓
PPO Fine-Tuning (50 steps, adaptive KL)
        ↓
Overoptimization & Misalignment Analysis
```

---

## Setup

### Requirements

```bash
pip install trl==0.11.4 transformers datasets accelerate peft torch \
            scikit-learn matplotlib seaborn pandas numpy
```

> **TRL version matters.** Pin to `0.11.4` — the `PPOConfig`/`PPOTrainer` API changed significantly across minor versions.

### HuggingFace Login

Qwen2.5 requires accepting the model license:

```bash
huggingface-cli login
```

### Hardware

- Tested on **A100 80GB** with BF16
- Both the policy model and reward model use `Qwen/Qwen2.5-1.5B-Instruct` as the backbone
- To run on smaller GPUs: swap to `Qwen/Qwen2.5-0.5B-Instruct` in `BASE_MODEL_NAME`

### Running the Notebook

Place `music_rlhf_preferences.json` in the same directory as `music_rlhf.ipynb`, then run top to bottom.

Estimated runtime on A100: **~25–40 minutes** for the full pipeline.

---

## Dataset

`music_rlhf_preferences.json` contains **100 pairwise preference examples** across genres including jazz, classical, hip-hop, pop, rock, EDM, folk, and R&B.

Each example:

```json
{
  "id": 1,
  "input_song": "Bohemian Rhapsody by Queen",
  "rationale_A": "You might like 'Stairway to Heaven' by Led Zeppelin because it similarly blends soft acoustic passages with explosive rock climaxes, creating a journey within a single track.",
  "rationale_B": "This song has great vibes and energy that you'll love.",
  "preference": "A"
}
```

**Preference values:** `"A"` | `"B"` | `"tie"`

**What makes a chosen rationale:** specific musical analysis — production techniques, structural comparisons, emotional texture, musical genealogy, instrument references.

**What makes a rejected rationale:** generic praise — "great vibes", "similar energy", "you'll love it."

Ties (~20 examples) are included to simulate realistic human label noise and are excluded from reward model training.

---

## Model Stack

| Component | Value |
|---|---|
| Base model | `Qwen/Qwen2.5-1.5B-Instruct` |
| Reward model | Same backbone + scalar head |
| LoRA target modules | `q_proj, k_proj, v_proj, o_proj` |
| LoRA rank / alpha | `r=16, alpha=32` |
| SFT epochs | 15 |
| SFT learning rate | `5e-4` |
| PPO steps | 50 |
| PPO batch size | 16 |
| KL coef (init) | 0.2 |
| Target KL | 6.0 |
| Reward model LR | `2e-5` |
| Reward model epochs | 5 |
| Precision | BF16 |
| Optimizer | AdamW Fused |

---

## Reward Model

A **Bradley-Terry** reward model trained on pairwise (chosen, rejected) examples.

**Loss:** `-log σ(r_chosen − r_rejected)`

The model learns to assign higher scalar scores to specific, substantive rationales over generic ones. Final eval accuracy reaches ~70% vs a 50% random baseline.

Key implementation detail: outputs are cast from BF16 → float32 before the sigmoid for numerical stability.

---

## SFT Baseline

Before PPO, a LoRA-adapted `Qwen2.5-1.5B-Instruct` is fine-tuned on chosen rationales so the model knows the task format. Without SFT, PPO has nothing to improve — it just produces incoherent completions.

**Prompt format** uses the Qwen2.5 chat template with a system prompt that explicitly instructs the model to be specific and avoid filler phrases:

```
<|im_start|>system
You are a music expert. Given a song the user loves, recommend one song
and explain in 2-3 sentences exactly why they will enjoy it. Be specific:
reference production style, structural elements, emotional texture, or
musical genealogy. Avoid generic phrases like 'great vibes' or 'similar energy'.
<|im_end|>
<|im_start|>user
I love 'Bohemian Rhapsody by Queen'. What should I listen to next and why?
<|im_end|>
<|im_start|>assistant
```

Only completion tokens are trained on (prompt tokens masked with `-100`).

---

## PPO Training

Uses HuggingFace TRL's `PPOTrainer` with adaptive KL control.

**Objective:** `r(x, y) − β · KL[π_θ(y|x) || π_SFT(y|x)]`

The adaptive KL controller increases `β` when KL exceeds `target_kl=6.0` and decreases it when KL is below target — preventing the policy from drifting too far from the SFT reference while still allowing reward improvement.

---

## Overoptimization Analysis

This is the analytical core of the project. We track four proxy metrics comparing SFT vs PPO outputs:

| Metric | What it measures |
|---|---|
| **Response length** | Proxy for length hacking — verbosity without quality |
| **Lexical diversity (TTR)** | Type-token ratio; drops when model repeats phrases |
| **Generic phrase count** | Density of filler phrases ("great vibes", "amazing", etc.) |
| **Specificity score** | Music-domain term density per 100 words |

### Observed failure modes

**Length hacking** — Response length grows ~15% over PPO training without proportional quality gain. The reward model slightly over-rewards verbose text, and PPO exploits this.

**Template collapse** — Late PPO outputs converge on a narrow set of structural patterns. The model learned which sentence structures score well and over-indexes on reproducing those surface features rather than generating diverse, genuinely insightful rationales.

**Hollow specificity** — The specificity score (music term density) rises after PPO, but this reflects the model learning to sprinkle in domain vocabulary, not producing correct or meaningful musical analysis. The reward model cannot distinguish "sounds specific" from "is actually insightful" on only ~80 training examples.

**KL explosion** — KL consistently exceeded `target_kl=6.0` at late steps. The adaptive controller could not keep up because the reward gradient is strong relative to the KL penalty at this dataset scale.

This is **Goodhart's Law** in observable form: the reward measure became the target, and ceased to be a good measure.

### Mitigations (not implemented, discussed)

- Larger preference dataset (500+ examples) — harder reward model to exploit
- Length penalty: `reward_adj = reward − 0.1 × max(0, len − 80)`
- Lower `target_kl` (2.0) or higher `init_kl_coef` to constrain drift
- Self-BLEU diversity penalty to discourage template collapse
- DPO as an alternative — bypasses RM training entirely, same data

---

## Frontend (Preference Collection UI)

**Live demo:** [https://rlhf-music.vercel.app/](https://rlhf-music.vercel.app/)

`music-rlhf-ui.zip` contains a Vercel-ready React app for collecting preferences.

### Deploy

```bash
unzip music-rlhf-ui.zip
cd music-rlhf-ui
npm install
npm run dev        # local: http://localhost:5173
npx vercel         # production deploy
```

Vercel auto-detects Vite + React — no config needed.

**What it does:** user enters a song → sees two AI-generated rationale cards side by side → picks the better one or ties them → session history tracked in sidebar. No backend, no LLM calls, no data persistence — pure frontend demo using genre-aware dummy preference pairs.

---

## Presentation

`music_rlhf_presentation.pptx` is an 11-slide deck covering:

1. Cover
2. Problem framing (why this task, not song recommendation)
3. Full pipeline overview
4. Dataset design and examples
5. Bradley-Terry reward model
6. SFT with LoRA
7. PPO with adaptive KL control
8. PPO training metrics
9. Overoptimization & misalignment analysis
10. Mitigations and extensions
11. Key takeaways

---

## Extensions

To make this more robust:

```python
# 1. Swap to a larger model (still fits A100 with LoRA)
BASE_MODEL_NAME = 'Qwen/Qwen2.5-7B-Instruct'

# 2. Add length penalty to reward signal
def get_reward_adjusted(texts):
    rewards = get_reward(texts)
    lengths = [len(tokenizer(t)['input_ids']) for t in texts]
    return [r - 0.1 * max(0, l - 80) for r, l in zip(rewards, lengths)]

# 3. Enable W&B logging
ppo_config = PPOConfig(..., log_with='wandb')

```

---

## AI Usage

This project was developed with assistance from **Claude (Anthropic)**, specifically Claude Sonnet 4.6 via [claude.ai](https://claude.ai).

AI assistance was used for:

- **Notebook scaffolding** — initial code structure for the Bradley-Terry reward model, SFT LoRA training loop, and PPO pipeline
- **Qwen2.5 migration** — updating model loading, LoRA target modules (`q/k/v/o_proj`), chat template prompt formatting, and BF16/A100-specific hyperparameters from a distilgpt2 baseline
- **Frontend (React UI)** — implementation of the preference collection interface [rlhf-music.vercel.app](https://rlhf-music.vercel.app/)

All model training decisions, experimental framing, analysis of overoptimization results, and final deliverable review were done by the authors.