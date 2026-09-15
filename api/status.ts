export default function handler(req: any, res: any) {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY
  );

  res.status(200).json({
    status: 'ok',
    model: 'gemini-3.6-flash',
    hasKey,
    role: 'Peer Career Advisor / Mentor',
    deployedOn: 'Vercel Serverless Function',
  });
}
