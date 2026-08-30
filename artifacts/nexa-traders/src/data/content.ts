export type PackageTier = {
  name: string;
  amount: string;
  slots: number;
  roi: string;
  returnAmount: string;
  duration: string;
  daily: string;
  featured?: boolean;
  accent: string;
};

export const packages: PackageTier[] = [
  { name: 'Spark', amount: '$100', slots: 2, roi: '85%', returnAmount: '$185', duration: '6 Months', daily: '$1/day', accent: 'gold' },
  { name: 'Boost', amount: '$300', slots: 4, roi: '90%', returnAmount: '$570', duration: '5 Months', daily: '$3.8/day', accent: 'blue' },
  { name: 'Rise', amount: '$1,000', slots: 5, roi: '95%', returnAmount: '$2,000', duration: '5 Months', daily: '$13/day', accent: 'green', featured: true },
  { name: 'Titan', amount: '$5,000', slots: 6, roi: '100%', returnAmount: '$10,000', duration: '5 Months', daily: '$66/day', accent: 'orange' },
  { name: 'Supreme', amount: '$10,000', slots: 8, roi: '120%', returnAmount: '$22,000', duration: '4 Months', daily: '$183/day', accent: 'plum' },
];

export type Article = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  body: string[];
};

export const categories = ['All', 'Market intelligence', 'Arbitrage 101', 'Risk & security', 'Signals'];

export const articles: Article[] = [
  {
    slug: 'why-spreads-appear',
    category: 'Arbitrage 101',
    title: 'Why price spreads appear — and disappear in milliseconds',
    excerpt: 'A practical look at the microstructure behind exchange dislocations and how an automated system reads the noise.',
    date: 'May 28, 2024',
    readTime: '6 min read',
    author: 'Mara Chen',
    body: [
      'Crypto never trades in one place. Every venue has its own order books, liquidity pockets, fee schedule, and crowd. When those markets drift apart, a spread appears — sometimes for a fraction of a second, sometimes long enough to build a repeatable signal.',
      'NexaTraders maps these differences continuously rather than waiting for a headline. Its decision engine weighs the raw price gap against fees, settlement latency, depth, and the probability that the spread survives execution.',
      'The important distinction is not finding the biggest number on a screen. It is finding the cleanest, most executable edge. That is where disciplined automation is useful: it can evaluate many small opportunities without confusing activity for an advantage.',
    ],
  },
  {
    slug: 'inside-the-signal-engine',
    category: 'Market intelligence',
    title: 'Inside the signal engine: from raw ticks to a clear decision',
    excerpt: 'How our three-layer intelligence model filters market motion into an actionable execution score.',
    date: 'May 17, 2024',
    readTime: '8 min read',
    author: 'Elias Voss',
    body: [
      'Our signal engine starts with an intentionally broad view: live prices, order-book depth, network status, venue fees, and realized slippage. This raw layer gives the system context before it makes a call.',
      'A second layer ranks the opportunities. It is designed to favor clarity over excitement, suppressing thin markets and stale quotes. The final layer is a safety gate: if the expected edge cannot clear a defined threshold after costs, the engine does nothing.',
      'In a market that rewards speed, doing nothing is still a decision. NexaTraders is built to make fewer, better-informed moves rather than chase every flicker.',
    ],
  },
  {
    slug: 'the-security-model',
    category: 'Risk & security',
    title: 'The security model behind every automated move',
    excerpt: 'Permission boundaries, encrypted transport, and a human-readable audit trail for every strategy decision.',
    date: 'May 06, 2024',
    readTime: '5 min read',
    author: 'Jon Bell',
    body: [
      'Automation should make an account easier to understand, not harder. Every NexaTraders strategy is surrounded by permissions that limit what the engine can request and where it can move capital.',
      'We separate market observation from execution controls, encrypt data in transit, and keep a readable record of the reason behind each strategy decision. This makes review a part of the product rather than a forensic exercise.',
      'No system can remove market risk. Good security makes the boundaries visible, enforces them consistently, and gives people the context they need to stay in control.',
    ],
  },
  {
    slug: 'reading-volatility',
    category: 'Signals',
    title: 'Reading volatility without mistaking noise for a signal',
    excerpt: 'Volatility is information, but only when read beside liquidity, timing, and the shape of the book.',
    date: 'April 22, 2024',
    readTime: '7 min read',
    author: 'Mara Chen',
    body: [
      'A fast market is not automatically a useful market. Volatility creates motion, but the quality of that motion depends on available liquidity and whether pricing remains coherent across venues.',
      'The engine looks for divergence with structure: a visible price difference, enough depth to support it, and a route that stays viable after fees. A dramatic candle on its own is not a strategy.',
      'For investors, this means the most useful dashboard is not the loudest one. It is the one that explains what changed, why it matters, and what the system chose not to do.',
    ],
  },
];

export const faqs = [
  [
    'What is Crypto Arbitrage?',
    'Crypto arbitrage is a trading strategy that seeks to take advantage of temporary price differences for the same cryptocurrency across different exchanges or markets. The system identifies price discrepancies and evaluates whether an opportunity may remain viable after relevant trading costs.',
  ],
  [
    'How does Nexa Traders’ Arbitrage Engine work?',
    'Nexa Traders continuously monitors supported markets for price differences. The engine observes market data, qualifies potential opportunities based on defined criteria, and can support automated execution according to the platform’s configured strategy and risk parameters.',
  ],
  [
    'Why do cryptocurrency prices differ between exchanges?',
    'Each exchange operates its own order book, liquidity, user base and market conditions. Because these markets are not perfectly synchronized, the same asset can temporarily trade at different prices across exchanges.',
  ],
  [
    'Is crypto arbitrage risk-free?',
    'No. Crypto arbitrage is not risk-free. Potential risks include price movements, execution delays, liquidity limitations, slippage, trading and network fees, exchange downtime and withdrawal restrictions. A displayed price difference does not guarantee that a profitable trade can be completed.',
  ],
  [
    'How does the platform evaluate an arbitrage opportunity?',
    'The platform can evaluate factors such as the price difference, available liquidity, trading costs and other execution conditions before an opportunity is considered suitable. The objective is to assess the net opportunity rather than relying only on the displayed spread.',
  ],
];