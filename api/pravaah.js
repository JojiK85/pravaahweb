export default async function handler(req, res) {
  try {
    const qs = new URLSearchParams(req.query).toString();

    const GAS_URL =
      "https://script.google.com/macros/s/AKfycbyAiWPJSE7Qm3qPyL-vZTlBR07xlhqzSRxfu-eeXMnXowOE8GXc1AZsLGW1ZOwyP7kjow/exec";

    const url = qs ? `${GAS_URL}?${qs}` : GAS_URL;

    const gasRes = await fetch(url, {
      method: req.method,
      headers: { "Content-Type": "application/json" }
    });

    const text = await gasRes.text();

    res.status(200).send(text);

  } catch (e) {
    res.status(500).json({ error: "Proxy failed", details: e.message });
  }
}
