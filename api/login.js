export default function handler(req, res) {
  const { login, password } = req.body || {};
  const ADMIN_LOGIN = "acaipoint";
  const ADMIN_PASSWORD = "012208";
  if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Credenciais inválidas." });
  }
}
