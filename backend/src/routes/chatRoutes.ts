import { Router } from "express";

const router = Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are a helpful AI tutor for students." },
          { role: "user", content: message },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    const reply = data.choices?.[0]?.message?.content || "No response generated.";
    res.json({ reply });
  } catch (err: any) {
    console.error("Chat route error:", err);
    res.status(500).json({ error: "Failed to reach AI service" });
  }
});

export default router;