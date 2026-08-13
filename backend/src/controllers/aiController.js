// AI features: WhatsApp receptionist / chatbot, powered by the Anthropic API.
// Set ANTHROPIC_API_KEY in your .env to enable these live; without a key
// these endpoints return a helpful placeholder so the rest of the app still runs.

const SYSTEM_PROMPT = `You are the friendly AI receptionist for a car wash business.
Help customers book appointments, answer questions about services and prices,
and be concise. If you don't know something, say so and offer to connect them
to a staff member.`;

async function callClaude(userMessage) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return "AI receptionist is not configured yet. Add ANTHROPIC_API_KEY to the backend .env to enable live replies.";
  }
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  const data = await resp.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return text || 'Sorry, I could not generate a reply right now.';
}

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const reply = await callClaude(message);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Placeholder webhook for WhatsApp Business API (e.g. Meta Cloud API / Twilio).
// Wire your provider's incoming-message webhook to POST here.
exports.whatsappWebhook = async (req, res) => {
  try {
    const { from, text } = req.body; // shape depends on your WhatsApp provider
    const reply = await callClaude(text || '');
    // TODO: send `reply` back to `from` via your WhatsApp provider's send API
    res.json({ to: from, reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
