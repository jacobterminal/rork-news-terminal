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

const resolveOHLCV = async (s: string): Promise<Candle[]> => {
  const sym = s.toUpperCase();
  if (sym === 'AAPL') {
    return (await import('../mock/AAPL_1d.json')).default as Candle[];
  }
  throw new Error(`No mock OHLCV available for ${s}`);
};

const resolveBook = async (s: string): Promise<BookSnapshot> => {
  const sym = s.toUpperCase();
  if (sym === 'AAPL') {
    return (await import('../mock/AAPL_book.json')).default as BookSnapshot;
  }
  throw new Error(`No mock book available for ${s}`);
};

const resolveTape = async (s: string): Promise<Print[]> => {
  const sym = s.toUpperCase();
  if (sym === 'AAPL') {
    return (await import('../mock/AAPL_tape.json')).default as Print[];
  }
  throw new Error(`No mock tape available for ${s}`);
};

const resolveOptions = async (s: string, e: 'near' = 'near'): Promise<OptionRow[]> => {
  const sym = s.toUpperCase();
  if (sym === 'AAPL' && e === 'near') {
    return (await import('../mock/AAPL_chain_near.json')).default as OptionRow[];
  }
  throw new Error(`No mock options available for ${s} ${e}`);
};

export const LocalShim: DataShim = {
  async getQuote(s){
    const q=(await import('../mock/quotes.json')).default as Record<string, Quote>;
    return q[s];
  },
  async getOHLCV(s){
    return resolveOHLCV(s);
  },
  async getBook(s){
    return resolveBook(s);
  },
  async getTape(s){
    return resolveTape(s);
  },
  async getOptions(s, e='near'){
    return resolveOptions(s, e as 'near');
  },
  async getNews(){
    return (await import('../mock/news.json')).default as NewsItem[];
  },
  async getXStreamDemo(){
    return (await import('../mock/x_demo_stream.json')).default as XPost[];
  },
};
