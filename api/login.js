export default function handler(req, res) {
  const { login, password } = req.body || {};
  // simple check - change to env vars for production
  if (login === 'acaipoint' && password === '012208') {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false });
  }
}
