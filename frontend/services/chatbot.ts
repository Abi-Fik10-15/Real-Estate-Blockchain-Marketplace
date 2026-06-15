import type { ChatMessage, ChatbotConfig, ChatbotProvider } from "@/types/chatbot";

/* ------------------------------------------------------------------ */
/*  Service interface — all providers implement this                  */
/* ------------------------------------------------------------------ */

export interface ChatbotService {
  sendMessage(message: string, history: ChatMessage[]): Promise<string>;
}

/* ------------------------------------------------------------------ */
/*  Topic → keyword → response map                                    */
/* ------------------------------------------------------------------ */

interface TopicEntry {
  keywords: string[];
  response: string;
}

const KNOWLEDGE_BASE: TopicEntry[] = [
  // ── Property Discovery ──────────────────────────────────────────
  {
    keywords: ["find property", "find properties", "search property", "search properties", "browse", "discover", "listing", "listings"],
    response:
      "🏠 **Finding Properties on ChainEstate**\n\nYou can browse all available properties on our **Marketplace** page. Use the powerful filters to narrow results by:\n\n• **Type** — Apartment, House, Villa, Condo, Townhouse, or Commercial\n• **Price Range** — Set your minimum and maximum budget\n• **Location** — Search by city or country\n• **Bedrooms & Bathrooms** — Filter by room count\n• **Listing Type** — Sale or Rent\n\nEach listing includes verified ownership history, high-res photos, and on-chain verification status.\n\n→ Head to the **Marketplace** to start exploring!",
  },
  {
    keywords: ["residential", "house", "apartment", "condo", "villa", "townhouse", "home"],
    response:
      "🏡 **Residential Properties**\n\nChainEstate offers a wide range of residential properties:\n\n• **Apartments** — Modern city living with smart amenities\n• **Houses** — Standalone homes with private outdoor space\n• **Villas** — Premium luxury residences with panoramic views\n• **Condos** — Low-maintenance living with shared facilities\n• **Townhouses** — Multi-level urban homes\n\nAll residential listings feature blockchain-verified ownership records, ensuring complete transparency in every transaction.\n\n→ Use the **Type** filter in the Marketplace to browse by category.",
  },
  {
    keywords: ["commercial", "office", "retail", "business"],
    response:
      "🏢 **Commercial Properties**\n\nOur commercial listings include office spaces, retail locations, and mixed-use buildings. Each property features:\n\n• Verified ownership documentation on-chain\n• Square footage and zoning information\n• Location data with interactive maps\n• Transparent pricing and transaction history\n\n→ Filter by **Commercial** type in the Marketplace to view all business properties.",
  },
  {
    keywords: ["rent", "rental", "lease", "tenant", "renting"],
    response:
      "🔑 **Renting on ChainEstate**\n\nTo rent a property on ChainEstate:\n\n1. **Browse** rental listings using the \"Rent\" filter in the Marketplace\n2. **Review** property details, photos, and verification status\n3. **Contact** the property owner or authorized agent\n4. **Sign** a smart-contract-based rental agreement\n5. **Pay** securely through our escrow system\n\nSmart contracts automate rent collection, deposit management, and lease terms — giving both tenants and landlords peace of mind.\n\n→ Filter by **Rent** in the Marketplace to see available rentals.",
  },
  {
    keywords: ["location", "city", "country", "where", "area", "neighborhood"],
    response:
      "📍 **Property Locations**\n\nChainEstate features properties across global markets including:\n\n• **Miami, USA** — Beachfront luxury and urban living\n• **Austin, USA** — Tech hub with growing real estate\n• **Dubai, UAE** — Premium high-rise developments\n• **Lisbon, Portugal** — Historic charm meets modern design\n• **Singapore** — Asia-Pacific financial center\n• **Barcelona, Spain** — Mediterranean lifestyle\n• **Toronto, Canada** — Diverse metropolitan market\n• **Bali, Indonesia** — Tropical resort properties\n\n→ Use the **Location** filter to search properties in your preferred area.",
  },
  {
    keywords: ["price", "cost", "how much", "budget", "afford", "expensive", "cheap"],
    response:
      "💰 **Property Pricing**\n\nProperty prices on ChainEstate vary by type, location, and features:\n\n• **Rentals** — Starting from $2,200/month\n• **Sales** — Range from $250,000 to $2,000,000+\n\nYou can set a custom **price range** using the Marketplace filters to find properties within your budget. All prices are displayed in USD with transparent fee structures.\n\nBlockchain verification ensures price history and past transactions are publicly auditable.\n\n→ Use the **Price Range** slider in the Marketplace to filter by budget.",
  },
  {
    keywords: ["verified", "verification status", "is verified", "not verified", "pending verification"],
    response:
      "✅ **Property Verification Status**\n\nEvery property on ChainEstate has one of three verification statuses:\n\n• **Verified** ✓ — Ownership confirmed on-chain via our title registry oracle\n• **Pending** ⏳ — Verification in progress; documents under review\n• **Unverified** — Not yet submitted for on-chain verification\n\nVerified properties display a green badge, a unique transaction hash, and a timestamp. You can independently verify any property by checking the transaction hash on the blockchain explorer.\n\n→ Look for the **Verified** badge on property listings.",
  },

  // ── Blockchain & Ownership ──────────────────────────────────────
  {
    keywords: ["blockchain", "how blockchain works", "blockchain ownership", "on-chain", "decentralized"],
    response:
      "⛓️ **How Blockchain Ownership Works**\n\nChainEstate uses blockchain technology to create immutable, transparent property records:\n\n1. **Tokenization** — Each property is represented as a unique digital token on-chain\n2. **Immutable Records** — Ownership history cannot be altered or falsified\n3. **Transparent Verification** — Anyone can verify ownership via the blockchain explorer\n4. **Smart Contracts** — Automate transfers, escrow, and agent authorization\n5. **Decentralized Trust** — No single entity controls the records\n\nThis eliminates fraud, reduces paperwork, and creates a trustless system where ownership is mathematically provable.\n\n→ View any property's **Ownership History** tab for full on-chain records.",
  },
  {
    keywords: ["digital title", "title", "property title", "deed"],
    response:
      "📜 **Digital Property Titles**\n\nOn ChainEstate, property titles are recorded as digital tokens on the blockchain:\n\n• Each title has a unique **Chain ID** (e.g., EST-1001)\n• Titles link to the owner's wallet address\n• Transfer history is permanent and auditable\n• Title verification is instant — no waiting for government offices\n\nDigital titles provide the same legal standing as traditional deeds while offering superior security and accessibility.\n\n→ Check any property's **Chain ID** in its listing details.",
  },
  {
    keywords: ["smart contract", "smart contracts", "contract", "automated"],
    response:
      "📋 **Smart Contracts**\n\nChainEstate uses smart contracts to automate key real estate processes:\n\n• **Escrow** — Funds are held securely until all conditions are met\n• **Transfers** — Ownership changes execute automatically upon payment\n• **Agent Authorization** — Owners grant/revoke agent access on-chain\n• **Rental Agreements** — Lease terms, deposits, and payments are automated\n\nSmart contracts are self-executing, transparent, and tamper-proof — ensuring every party in a transaction is protected.\n\n→ All transactions on ChainEstate are powered by audited smart contracts.",
  },
  {
    keywords: ["escrow", "secure payment", "hold funds"],
    response:
      "🔒 **Escrow Process**\n\nOur smart-contract escrow system protects both buyers and sellers:\n\n1. **Buyer deposits funds** into the escrow smart contract\n2. **Conditions are verified** (inspection, verification, title check)\n3. **Both parties approve** the transaction\n4. **Funds release** to the seller and ownership transfers to the buyer\n\nIf conditions aren't met, funds are automatically returned to the buyer. The entire process is transparent and recorded on-chain.\n\n→ Escrow is automatically initiated when you start a property purchase.",
  },
  {
    keywords: ["transfer", "property transfer", "change ownership", "buy property"],
    response:
      "🔄 **Property Transfers**\n\nTransferring property ownership on ChainEstate is secure and streamlined:\n\n1. Buyer and seller agree on terms\n2. Funds are placed in smart-contract escrow\n3. Property verification is confirmed on-chain\n4. Ownership token transfers to the buyer's wallet\n5. Transaction is permanently recorded on the blockchain\n\nThe entire process is transparent, irreversible once completed, and verifiable by anyone.\n\n→ View the **Ownership History** on any property to see past transfers.",
  },
  {
    keywords: ["wallet", "connect wallet", "metamask", "wallet connection", "web3 wallet"],
    response:
      "👛 **Wallet Connection**\n\nTo interact with blockchain features on ChainEstate, you'll need a Web3 wallet:\n\n1. **Install** a wallet like MetaMask, WalletConnect, or Coinbase Wallet\n2. **Click** the \"Connect Wallet\" button in the navigation bar\n3. **Approve** the connection request in your wallet\n4. **Done!** Your wallet address is now linked to your ChainEstate account\n\nYour wallet is used to:\n• Verify your identity as a property owner\n• Sign transactions and authorize agents\n• Receive property tokens upon purchase\n\n→ Click **Connect Wallet** in the top navigation to get started.",
  },
  {
    keywords: ["web3", "what is web3", "crypto", "cryptocurrency", "token", "nft"],
    response:
      "🌐 **Web3 Concepts**\n\nWeb3 is the next evolution of the internet, built on blockchain technology:\n\n• **Decentralization** — No single company controls your data or assets\n• **Digital Ownership** — You truly own your digital assets via cryptographic keys\n• **Tokens** — Digital representations of assets (in our case, properties)\n• **Wallets** — Your digital identity and asset manager\n• **Smart Contracts** — Self-executing agreements written in code\n\nChainEstate leverages Web3 to make real estate ownership transparent, secure, and globally accessible — without intermediaries.\n\n→ Don't worry if you're new to Web3 — our platform handles the complexity for you!",
  },

  // ── Platform Features ───────────────────────────────────────────
  {
    keywords: ["buy", "purchase", "how to buy", "buying"],
    response:
      "🛒 **How to Buy Property**\n\nBuying on ChainEstate is simple and secure:\n\n1. **Browse** the Marketplace and find your ideal property\n2. **Review** the listing details, photos, and blockchain verification\n3. **Connect** your Web3 wallet\n4. **Make an offer** or click \"Buy Now\" for listed prices\n5. **Escrow** secures your funds via smart contract\n6. **Verification** confirms clear title and ownership\n7. **Transfer** — ownership token moves to your wallet\n\nThe entire process is recorded on-chain for complete transparency.\n\n→ Start by browsing the **Marketplace**!",
  },
  {
    keywords: ["list", "list property", "sell", "sell property", "list my property", "become seller"],
    response:
      "📝 **How to List a Property**\n\nTo list your property on ChainEstate:\n\n1. **Sign in** and navigate to your **Dashboard**\n2. **Click** \"Add Property\" or \"List New Property\"\n3. **Fill in** property details — type, location, price, photos, and description\n4. **Submit** for blockchain verification\n5. **Once verified**, your listing goes live on the Marketplace\n\nYou can also authorize an agent to manage your listing and handle inquiries on your behalf.\n\n→ Go to your **Dashboard** to start listing!",
  },
  {
    keywords: ["agent", "become agent", "real estate agent", "broker"],
    response:
      "🤝 **Becoming an Agent**\n\nTo become a verified agent on ChainEstate:\n\n1. **Register** for an account and select the \"Agent\" role\n2. **Complete** identity and broker verification (AML/KYC)\n3. **Connect** your Web3 wallet\n4. **Get authorized** by property owners to manage their listings\n5. **Manage** inquiries, viewings, and transactions from your Dashboard\n\nAgents earn commissions on successful transactions and have access to dedicated lead management tools.\n\n→ Register as an **Agent** to get started!",
  },
  {
    keywords: ["dashboard", "my dashboard", "navigate", "navigation", "how to use"],
    response:
      "📊 **Dashboard Navigation**\n\nYour ChainEstate Dashboard is your command center:\n\n• **Overview** — Key metrics, recent activity, and portfolio summary\n• **My Properties** — Manage your listings and verification status\n• **Transactions** — Track ongoing and completed deals\n• **Inquiries** — Respond to buyer and renter messages\n• **Settings** — Profile, wallet, and notification preferences\n\nThe Dashboard adapts based on your role (Owner, Agent, Buyer, or Admin) to show the most relevant tools.\n\n→ Access your **Dashboard** from the navigation menu.",
  },
  {
    keywords: ["tenant", "tenant management", "manage tenants", "renters"],
    response:
      "👥 **Tenant Management**\n\nProperty owners and agents can manage tenants through the Dashboard:\n\n• **Active Leases** — View all current rental agreements\n• **Rent Collection** — Automated via smart contracts\n• **Maintenance Requests** — Track and respond to tenant issues\n• **Lease Renewals** — Extend or modify contracts on-chain\n• **Deposit Management** — Smart-contract-secured deposits\n\nAll tenant interactions are recorded for transparency and dispute resolution.\n\n→ Access **Tenant Management** from your Dashboard.",
  },
  {
    keywords: ["lead", "leads", "lead management", "inquiry", "inquiries"],
    response:
      "📬 **Lead Management**\n\nAgents and property owners can manage leads efficiently:\n\n• **New Inquiries** — Receive notifications for new buyer/renter interest\n• **Status Tracking** — Mark leads as New, In Progress, or Closed\n• **Communication** — Respond directly to inquiries\n• **Priority Sorting** — Focus on high-value leads first\n• **Analytics** — Track conversion rates and response times\n\nThe lead pipeline helps you stay organized and never miss an opportunity.\n\n→ Check your **Inquiries** section in the Dashboard.",
  },
  {
    keywords: ["yield", "rental yield", "return", "investment", "roi"],
    response:
      "📈 **Rental Yield Tracking**\n\nChainEstate provides rental yield analytics for property investors:\n\n• **Gross Yield** — Annual rental income vs. property value\n• **Net Yield** — Factors in expenses, maintenance, and fees\n• **Historical Performance** — Track yields over time\n• **Market Comparison** — Compare yields across locations\n• **Portfolio View** — Aggregate returns across all properties\n\nAll financial data is powered by on-chain transaction records for accuracy.\n\n→ View **Rental Yield** analytics in your Dashboard.",
  },
  {
    keywords: ["feature", "features", "platform features", "what can", "capabilities"],
    response:
      "✨ **Platform Features**\n\nChainEstate offers a comprehensive suite of real estate tools:\n\n• **Marketplace** — Browse and filter verified property listings\n• **Blockchain Verification** — On-chain ownership records\n• **Smart Contract Escrow** — Secure, automated transactions\n• **Agent Authorization** — Delegate property management on-chain\n• **Interactive Maps** — Explore properties geographically\n• **Dashboard Analytics** — Portfolio tracking and insights\n• **Lead Management** — Organized buyer/renter communication\n• **Multi-role Support** — Owner, Agent, Buyer, and Admin views\n\n→ Explore the **Marketplace** or your **Dashboard** to dive in!",
  },

  // ── Compliance ──────────────────────────────────────────────────
  {
    keywords: ["aml", "anti-money laundering", "money laundering"],
    response:
      "🛡️ **AML Verification**\n\nChainEstate enforces Anti-Money Laundering (AML) compliance:\n\n• **Identity Verification** — All users undergo KYC checks\n• **Source of Funds** — High-value transactions require proof of fund origin\n• **Transaction Monitoring** — Automated systems flag suspicious activity\n• **Reporting** — Compliance team files regulatory reports as required\n• **Sanctions Screening** — Users and wallets are checked against global lists\n\nAML compliance protects the platform and ensures all transactions meet legal requirements.\n\n→ Complete your **verification** in Dashboard Settings.",
  },
  {
    keywords: ["identity", "kyc", "id verification", "verify identity", "identity verification"],
    response:
      "🆔 **Identity Verification (KYC)**\n\nTo use ChainEstate's full features, you'll need to verify your identity:\n\n1. **Upload** a government-issued ID (passport, driver's license)\n2. **Selfie Verification** — Take a photo to match your ID\n3. **Address Proof** — Utility bill or bank statement\n4. **Review** — Our team verifies within 24-48 hours\n\nVerified users get a ✓ badge and access to all platform features including property transactions.\n\n→ Start verification in your **Dashboard Settings**.",
  },
  {
    keywords: ["broker verification", "agent verification", "licensed", "license"],
    response:
      "📋 **Broker Verification**\n\nAgents and brokers must complete additional verification:\n\n• **Professional License** — Valid real estate license required\n• **Background Check** — Criminal and professional history review\n• **Insurance** — Proof of professional liability coverage\n• **References** — Professional references from past transactions\n\nVerified brokers receive a special badge and priority listing access.\n\n→ Submit broker documents in your **Agent Dashboard**.",
  },
  {
    keywords: ["audit", "auditing", "transaction audit", "compliance audit", "transparent"],
    response:
      "🔍 **Transaction Auditing**\n\nEvery transaction on ChainEstate is fully auditable:\n\n• **On-chain Records** — All ownership changes recorded permanently\n• **Transaction Hashes** — Unique identifiers for each blockchain transaction\n• **Event History** — Complete timeline of property events\n• **Third-party Verification** — Anyone can verify via blockchain explorer\n• **Compliance Reports** — Downloadable audit trails for regulatory purposes\n\nThis level of transparency is only possible with blockchain technology.\n\n→ View **Transaction History** on any property page.",
  },
  {
    keywords: ["security", "safe", "secure", "protection", "privacy"],
    response:
      "🔐 **Security Standards**\n\nChainEstate employs enterprise-grade security:\n\n• **Blockchain Immutability** — Records cannot be altered after confirmation\n• **Smart Contract Audits** — Contracts audited by leading security firms\n• **Wallet Security** — Private keys never leave your device\n• **Data Encryption** — All personal data encrypted at rest and in transit\n• **2FA Support** — Two-factor authentication for account access\n• **Role-based Access** — Granular permissions for all user types\n\nYour assets and data are protected by the same cryptographic standards used by major financial institutions.\n\n→ Enable **2FA** in your Dashboard Settings for extra protection.",
  },

  // ── General / Greetings ─────────────────────────────────────────
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"],
    response:
      "👋 Hello! Welcome to ChainEstate.\n\nI'm your AI Real Estate Assistant. I can help you with:\n\n• 🏠 **Property Discovery** — Finding and filtering listings\n• ⛓️ **Blockchain** — Understanding ownership and verification\n• 🛠️ **Platform Features** — Navigating the dashboard and tools\n• 🛡️ **Compliance** — AML, KYC, and security questions\n\nWhat would you like to know?",
  },
  {
    keywords: ["help", "what can you do", "assist", "support"],
    response:
      "🤖 **How I Can Help**\n\nI'm ChainEstate's AI assistant, trained to help you with:\n\n• **Property Discovery** — Find listings, filter by type/price/location\n• **Blockchain & Ownership** — Understand digital titles, verification, and transfers\n• **Platform Navigation** — Learn how to buy, rent, list, or manage properties\n• **Compliance & Security** — AML verification, KYC, and security best practices\n\nJust type your question and I'll do my best to help! If I can't answer something, I'll direct you to our support team.\n\nWhat would you like to know?",
  },
  {
    keywords: ["thank", "thanks", "thank you", "appreciate"],
    response:
      "You're welcome! 😊 I'm glad I could help.\n\nIf you have any more questions about properties, blockchain ownership, or the platform, feel free to ask anytime.\n\nHappy exploring on ChainEstate! 🏠✨",
  },
];

/* ------------------------------------------------------------------ */
/*  Fallback response                                                 */
/* ------------------------------------------------------------------ */

const FALLBACK_RESPONSE =
  "I appreciate your question! While I couldn't find specific information about that topic, I can help you with:\n\n• 🏠 Property discovery and listings\n• ⛓️ Blockchain ownership and verification\n• 🛠️ Platform features and navigation\n• 🛡️ Compliance and security\n\nCould you try rephrasing your question, or choose one of the suggested topics?\n\nIf you need further assistance, please contact our support team for additional help.";

/* ------------------------------------------------------------------ */
/*  Mock service                                                      */
/* ------------------------------------------------------------------ */

function matchResponse(message: string): string {
  const lower = message.toLowerCase().trim();

  // Score each topic by the number of keyword matches
  let bestMatch: TopicEntry | null = null;
  let bestScore = 0;

  for (const topic of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        // Longer keyword matches are weighted higher
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }

  return bestMatch ? bestMatch.response : FALLBACK_RESPONSE;
}

class MockChatbotService implements ChatbotService {
  async sendMessage(message: string): Promise<string> {
    // Simulate realistic AI response latency
    const delay = 800 + Math.random() * 700;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return matchResponse(message);
  }
}

/* ------------------------------------------------------------------ */
/*  Factory (future: OpenAI / Gemini / Claude services go here)       */
/* ------------------------------------------------------------------ */

// Placeholder for future real AI service implementations:
//
// class OpenAIChatbotService implements ChatbotService {
//   constructor(private config: ChatbotConfig) {}
//   async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
//     // Call OpenAI API
//   }
// }
//
// class GeminiChatbotService implements ChatbotService { ... }
// class ClaudeChatbotService implements ChatbotService { ... }

export function createChatbotService(
  provider: ChatbotProvider = "mock",
  _config?: ChatbotConfig
): ChatbotService {
  switch (provider) {
    // case "openai":
    //   return new OpenAIChatbotService(_config!);
    // case "gemini":
    //   return new GeminiChatbotService(_config!);
    // case "claude":
    //   return new ClaudeChatbotService(_config!);
    case "mock":
    default:
      return new MockChatbotService();
  }
}
