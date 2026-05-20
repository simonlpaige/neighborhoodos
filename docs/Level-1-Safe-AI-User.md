# Workshop Manual: Level 1 — The Safe AI User

> **"An AI model is a superpowered auto-complete, not a thinking machine."**

This guide is the core curriculum for our Level 1 AI literacy workshops, co-designed with **KC Digital Drive (KCDD)**. It is written for absolute beginners: neighborhood residents, small business operators, seniors, and local organizers who want to understand how AI works, how to spot scams, and how to protect their personal privacy.

---

## 🧠 Part 1: Strip Away the Magic (How LLMs Work)

When you see a computer chatting with you, writing poetry, or answering questions, it is easy to assume it is "thinking" or has a human-like mind. It doesn't. 

### The Phone Keyboard Analogy
Think about the keyboard on your smartphone. When you type *"I am on my..."* your keyboard suggests three words, like *"way,"* *"phone,"* or *"break."* It does this by looking at patterns in how you and millions of other people have typed in the past.

A Large Language Model (like ChatGPT, Gemini, or our local Qwen models) is exactly like that smartphone keyboard, just on a massive scale. It has read billions of pages of human text. When you ask it a question, it is not "looking up" an answer in an index; it is calculating, word by word, which word is most likely to come next based on the pattern of your question.

*   **Rule**: It is a pattern generator, not a truth database. It calculates probability, not correctness.

---

## 🚫 Part 2: The Two Great Pitfalls (Hallucinations and Hype)

Because these models write with perfect grammar and supreme confidence, they are highly persuasive. This leads to two common pitfalls:

### 1. Hallucinations (Confident Lying)
If a model is just guessing the next most probable word, it will happily invent facts, names, dates, or court cases if they *look* like they belong in the pattern of a correct answer. 
- *The Risk*: If you ask an AI model for the city code on housing maintenance, it might fabricate a realistic-sounding code section (like *"Section 14-B8"*). If you cite that in a letter to your landlord, your argument collapses.
- *The Defense*: **The Triple-Check Rule**. Never rely on an AI-generated fact or source link unless you have verified it yourself directly in the primary public record.

### 2. The Expert Hype
Many tech companies claim AI is an "all-knowing assistant." It is not. It is mediocre at almost everything, but highly fluent at presenting that mediocrity.
- *The Defense*: Treat AI like a brilliant but slightly lazy intern. It can help you organize your thoughts, write drafts, or summarize long documents, but you must audit and proofread every single line of its output before using it.

---

## 🔒 Part 3: Personal Privacy & The Data Feed

When you use free cloud-hosted AI tools (like the web versions of ChatGPT or Gemini), **your conversations are data.** The company uses what you type to train future versions of their models.

### The Privacy Guardrails
1.  **Never Type Sensitive Personal Data**: Do not input your Social Security Number, your bank accounts, your passwords, your medical history, or your full name.
2.  **No Private Documents**: Never upload a tenant lease, a private legal contract, or an internal organization memo to a public cloud model.
3.  **Use Private Local Models for Development**: For NeighborhoodOS, we prototype our pipelines using **Local AI Infrastructure** running completely on-device. This guarantees that your data never leaves your workstation and is never uploaded to a corporate server.

---

## 🛡 Part 4: Spotting the AI Scams

As AI tools become cheaper, scammers are using them to target local residents, particularly seniors and vulnerable neighbors. Here are the three most common AI scams and how to spot them:

### 1. The Voice Clone (The "Grandchild" Scam)
*   **The Scam**: A resident receives a call from their "grandchild" or family member claiming they are in jail, have been in an accident, or need immediate cash. The voice sounds exactly like their relative because the scammer cloned it using a 3-second audio clip from social media.
*   **The Defense**: Set up a **Family Safeword**. If you ever receive an urgent call for money, hang up immediately, call your relative back on their known number, or ask them for the family safeword.

### 2. The Hyper-Personal Phishing Email
*   **The Scam**: AI models allow scammers to write thousands of unique, highly personal emails that match your local neighborhood context, naming local streets, businesses, or municipal offices to trick you into clicking a link.
*   **The Defense**: Never click links or download attachments from unsolicited emails. If an email claims to be from the City Water Department or County Assessor, go to the official municipal website directly and log in.

***

## 🎓 Level 1 Facilitator Exercise: "The Hallucinating Calculator"

To run this exercise in your workshop:
1.  Open an AI chat interface on a projector.
2.  Ask it a highly specific, obscure question about your city's history or a local block (e.g., *"What is the history of the green building on the corner of 15th and Main?"*).
3.  Watch the model confidently generate a plausible-sounding history.
4.  Have the workshop participants search the local library archives or historical maps live to prove where the model made up details.
5.  *The Lesson*: Experience the hallucination yourself so you learn to never trust a computer's unverified word.
