export function summarizeTweet(text: string): string {
  if (!text) return "";
  const cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[@#]\w+/g, (m) => m)
    .replace(/\s+/g, " ")
    .trim();
  const maxLen = 220;
  let s = cleaned;
  if (s.length > maxLen) s = s.slice(0, maxLen - 1).trim() + " …";
  const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 2) return s;
  return sentences.slice(0, 2).join(" ");
}

export type Opinion = { label: 'bullish' | 'bearish' | 'neutral'; conf: number };

export function opinionTag(text: string): Opinion {
  const t = (text || "").toLowerCase();
  const bullHints = [
    "up", "beat", "strong", "bull", "bullish", "accelerate", "expand", "growth", "record", "improve",
  ];
  const bearHints = [
    "down", "miss", "weak", "bear", "bearish", "slow", "contract", "risk", "cut", "delay", "halt",
  ];
  let bull = 0;
  let bear = 0;
  for (const k of bullHints) if (t.includes(k)) bull += 1;
  for (const k of bearHints) if (t.includes(k)) bear += 1;
  if (bull === 0 && bear === 0) return { label: 'neutral', conf: 0.5 };
  if (bull > bear) {
    const conf = Math.min(0.95, 0.55 + (bull - bear) * 0.1);
    return { label: 'bullish', conf: Number(conf.toFixed(2)) };
  }
  if (bear > bull) {
    const conf = Math.min(0.95, 0.55 + (bear - bull) * 0.1);
    return { label: 'bearish', conf: Number(conf.toFixed(2)) };
  }
  return { label: 'neutral', conf: 0.6 };
}
