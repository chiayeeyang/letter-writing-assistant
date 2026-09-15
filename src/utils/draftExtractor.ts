/**
 * Utility to extract strictly the clean email content from an AI advisor response.
 * Filters out all mentor commentary, intro paragraphs, headers, feedback,
 * and alternative phrasing.
 */
export function extractCleanEmailDraft(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Check if the text contains a recognizable email draft (Subject line or greeting + signoff)
  const hasSubject = /(?:^|\n)\s*[*#_\s]*Subject[*#_\s]*:/i.test(text);
  const hasGreeting = /(?:^|\n)\s*(?:Hi|Hello|Dear|Hey)\s+[A-Za-z\[]/i.test(text);
  const hasSignoff = /(?:Best|Sincerely|Thanks|Warmly|Regards|Cheers|All the best|With appreciation)[,\s]+(?:\n|$)/i.test(text);

  // If this message is only conversational (comforting/reassuring/asking for tone), return empty string
  if (!hasSubject && !(hasGreeting && hasSignoff)) {
    return '';
  }

  let cleaned = text;

  // 1. Locate the beginning of the actual email (Subject line or greeting)
  const subjectMatch = cleaned.match(/(?:^|\n)\s*([*#_\s]*Subject[*#_\s]*:[\s\S]*)/i);
  if (subjectMatch) {
    cleaned = subjectMatch[1];
  } else {
    const greetingMatch = cleaned.match(/(?:^|\n)\s*((?:Hi|Hello|Dear|Hey)\s+[A-Za-z\[][\s\S]*)/i);
    if (greetingMatch) {
      cleaned = greetingMatch[1];
    }
  }

  // 2. Remove any markdown headers that might precede the email body
  cleaned = cleaned.replace(/^###?\s*(?:Draft\s*Email|Email\s*Draft|Apology\s*Draft|Email)[\s\S]*?\n+/gi, '');
  cleaned = cleaned.replace(/^\*\*(?:Draft\s*Email|Email\s*Draft|Draft)\*\*\s*\n+/gi, '');

  // 3. Cut off any trailing mentor commentary, feedback, alternative options, or follow-ups
  const cutOffPatterns = [
    /\n\s*###\s*(?:Feedback|Alternative|Notes?|Next Steps)/i,
    /\n\s*\*\*(?:Feedback|Alternative|Notes?|Next Steps|Alternative phrasing|Why this works|How to handle)/i,
    /\n\s*(?:Alternative phrasing|Alternative option|Other options):/i,
    /\n\s*(?:Let me know if you would like|Let me know if you want|Feel free to tweak|How does this feel|Does this feel)/i,
  ];

  for (const pattern of cutOffPatterns) {
    const idx = cleaned.search(pattern);
    if (idx !== -1) {
      cleaned = cleaned.slice(0, idx);
    }
  }

  // 4. Normalize Subject line: remove leading asterisks/hashes and trailing markdown formatting
  cleaned = cleaned.replace(/^[*#_\s]*Subject[*#_\s]*:\s*(?:\*\*)?\s*/i, 'Subject: ');
  cleaned = cleaned.replace(/^Subject:\s*(.*?)\s*\*{1,6}(\n|$)/i, 'Subject: $1$2');

  return cleaned.trim();
}
