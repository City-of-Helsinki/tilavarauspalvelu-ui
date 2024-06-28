// A faulty API route to test Sentry's error monitoring
export default function handler(_req, res) {
  console.log("Sentry Example API Route Error");
  throw new Error("Sentry Example API Route Error");
  res.status(200).json({ name: "John Doe" });
}
