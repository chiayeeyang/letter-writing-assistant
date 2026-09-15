export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    model: 'gemini-3.6-flash',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    role: 'Peer Career Advisor / Mentor',
    deployedOn: 'Vercel Serverless Function',
  });
}
