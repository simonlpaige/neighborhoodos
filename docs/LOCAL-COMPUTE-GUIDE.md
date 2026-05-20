# Local Compute & AI Infrastructure Guide

This guide details the technical specifications, software setup, and safety boundaries for running our **Local AI Infrastructure** at a developer or prototyping scale.

We use standardized consumer-grade hardware (like a single RTX 4060 Ti workstation) to develop, test, and audit our pipelines completely privately and on a budget before designing larger, community-governed production deployments.

---

## 🖥 The Prototyping Workstation Spec

We design our software pipelines to run within the memory boundaries of an entry-level local GPU. 

### Baseline Hardware Profile
- **GPU**: NVIDIA RTX 4060 Ti (16GB VRAM)
- **CPU**: Intel i7-12700K (or equivalent 8+ core processor)
- **RAM**: 32GB System RAM
- **Storage**: SSD (NVMe preferred, at least 500GB free space)

*Why 16GB VRAM?* 
16GB of video RAM is our sweet spot. It allows us to load highly optimized, local 8B-parameter open weights models entirely onto the GPU, avoiding expensive cloud-hosting fees and keeping all local data completely private.

---

## 🛠 Local Software Stack Setup

### 1. Ollama (Model Host)
We use **Ollama** as our primary local inference driver.
- Download and install Ollama for Windows or Linux.
- Open your terminal and pull our target local models:
  ```bash
  # Fast triage & classification model (~304 tokens/sec)
  ollama run qwen2.5:1.5b

  # Core reasoning & structured extraction model (~59 tokens/sec)
  ollama run gemma4:e4b
  ```

### 2. Context Window Rules (VRAM Management)
To prevent model performance from spilling over into system RAM (which slows queries down by 10x to 30x), we enforce a strict context window cap on our local callers:
- **Rule**: Never request a context window greater than **4,096 to 8,192 tokens** for local models in development.
- Monitor your local GPU memory during runs to ensure zero system RAM spillover.

---

## 🔒 Privacy-Isolated Tunneling (Development Only)

When developing or demonstrating local tools with community partners (such as KC Digital Drive), we must expose our local node's API endpoints securely without opening port-forwards on Simon's home router.

### Setup via Tailscale
The safest way to share your local node's API is through **Tailscale**:
1. Install Tailscale on the prototyping workstation and your development laptop or mobile device.
2. Put both devices on the same private Tailnet.
3. Access your local Ollama instance on its private IP (e.g. `http://100.x.y.z:11434`) securely. Tailscale encrypts all traffic end-to-end, completely bypassing the public internet.

---

## 🚫 Scale Boundaries (Prototyping vs. Production)

An RTX 4060 Ti workstation is a powerful tool for **development, local pipeline auditing, and small workshops**. It physically cannot serve a whole neighborhood's concurrent real-world traffic.

When moving from pilot planning to public rollout:
1. **The Prototyping Node** remains the sandbox where we build and test tools.
2. **The Production Node** must be scaled up. We work with KCDD to plan and deploy either a dedicated community-governed hardware server (such as clustered GPUs) or a privacy-respecting hybrid host that conforms to our **Civic Memory Safety Doctrine**.
