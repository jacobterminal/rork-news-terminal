export type Quote = {symbol:string; last:number; change:number; pct:number; day_low:number; day_high:number; wk52_low:number; wk52_high:number; volume:number; mktcap:number};
export type Candle = {t:number;o:number;h:number;l:number;c:number;v:number};
export type BookLevel = {price:number; size:number};
export type BookSnapshot = {bids:BookLevel[]; asks:BookLevel[]; ts:number};
export type Print = {t:number;p:number;sz:number;side:'B'|'S'};
export type OptionRow = {expiry:string; strike:number; type:'C'|'P'; bid:number; ask:number; mid:number; oi?:number; vol?:number; iv?:number};
export type NewsItem = {id:string; ts:number; source:string; title:string; body?:string; symbols?:string[]; sentiment?:'pos'|'neu'|'neg'};
export type XPost = {id:string; ts:number; author:string; text:string; metrics?:Record<string,number>; matchedRules?:string[]};

export interface DataShim {
  getQuote(symbol:string):Promise<Quote>;
  getOHLCV(symbol:string, tf:"1d"):Promise<Candle[]>;
  getBook(symbol:string):Promise<BookSnapshot>;
  getTape(symbol:string):Promise<Print[]>;
  getOptions(symbol:string, expiry?:"near"):Promise<OptionRow[]>;
  getNews(params?:{symbols?:string[]}):Promise<NewsItem[]>;
  getXStreamDemo():Promise<XPost[]>; // demo for Boards
}

export const LocalShim: DataShim = {
  async getQuote(s){ const q=(await import('../mock/quotes.json')).default as Record<string, Quote>; return q[s]; },
  async getOHLCV(s){ return (await import(`../mock/${s}_1d.json`)).default as Candle[]; },
  async getBook(s){ return (await import(`../mock/${s}_book.json`)).default as BookSnapshot; },
  async getTape(s){ return (await import(`../mock/${s}_tape.json`)).default as Print[]; },
  async getOptions(s, e='near'){ return (await import(`../mock/${s}_chain_${e}.json`)).default as OptionRow[]; },
  async getNews(){ return (await import('../mock/news.json')).default as NewsItem[]; },
  async getXStreamDemo(){ return (await import('../mock/x_demo_stream.json')).default as XPost[]; },
};
