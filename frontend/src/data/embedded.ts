// Auto-generated — do not edit by hand. Run backend/gen_embedded.py to regenerate.
// Materiality scores from FTSE 100 Financial Materiality Survey (Maxwell Data / March 2025).

import type {
  CompanyScore, FTSEProfile, FTSESearchResult, ForecastResult,
  ESGRating, Claim, Controversy, ImpactKPI, MaterialFactor,
  DriverProfile, DriverForecast, ThreeBodyAnalysis, MaterialityComparison, DriverComparison,
} from "../types"

// ── Raw data ──────────────────────────────────────────────────────────────────

export const ORDER = ["III", "ADM", "AAF", "AAL", "ANTO", "ABF", "AZN", "AUTO", "AV", "BAB", "BA.", "BARC", "BTRW", "BEZ", "BKG", "BP", "BATS", "BT.A", "BNZL", "BRBY", "CNA", "CCH", "CPG", "DCC", "DGE", "EZJ", "EDV", "ENT", "EXPN", "FRES", "GAW", "GLEN", "GSK", "HLN", "HLMA", "HWDN", "HSBA", "IMB", "INF", "IHG", "IAG", "ITRK", "JD", "KGF", "LGEN", "LLOY", "MNG", "MKS", "MRO", "MNDI", "NG", "NWG", "NXT", "PSON", "PSN", "PHNX", "PRU", "RKT", "REL", "RTO", "RMV", "RIO", "RR", "SGE", "SBRY", "SDR", "SGRO", "SVT", "SHEL", "SN", "SSE", "STJ", "STAN", "TSCO", "ULVR", "UU.", "VOD", "WTB", "WPP"] as const
export type EmbeddedTicker = typeof ORDER[number]

const CO: Record<string, { name: string; coarse: string; sasb: string; country: string; mkt: string; desc: string }> = {
  "III": { name: "3i Group Plc", coarse: "financials", sasb: "Asset management", country: "UK", mkt: "$24.0B", desc: "3i Group is a private equity and infrastructure investment company; ESG embedded in portfolio selection criteria." },
  "ADM": { name: "Admiral Group", coarse: "financials", sasb: "Insurance", country: "UK", mkt: "$5.0B", desc: "Admiral Group is a UK insurance company; climate risk assessment embedded in underwriting since 2022." },
  "AAF": { name: "Airtel Africa plc", coarse: "technology", sasb: "Telecommunications", country: "Nigeria", mkt: "$3.5B", desc: "Airtel Africa provides mobile and digital services across 14 Sub-Saharan African countries; significant regulatory ESG exposure." },
  "AAL": { name: "Anglo American Plc", coarse: "industrial", sasb: "Metals & mining", country: "UK", mkt: "$10.0B", desc: "Anglo American is a diversified mining company; significant biodiversity, community, and labour ESG exposure across African and South American assets." },
  "ANTO": { name: "Antofagasta plc", coarse: "industrial", sasb: "Metals & mining", country: "Chile", mkt: "$10.0B", desc: "Antofagasta is a Chilean copper mining company; water scarcity and community-relations risk in Atacama Desert operations." },
  "ABF": { name: "Associated British Foods plc", coarse: "consumer", sasb: "Food & beverage", country: "UK", mkt: "$22.0B", desc: "Associated British Foods spans grocery, agriculture, and retail (Primark); supply-chain and land-use ESG risks are material." },
  "AZN": { name: "AstraZeneca plc", coarse: "healthcare", sasb: "Pharmaceuticals", country: "UK", mkt: "$250.0B", desc: "AstraZeneca is a global biopharmaceutical company; access-to-medicines and clinical-trial ethics are key ESG themes." },
  "AUTO": { name: "Auto Trader Group plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$8.0B", desc: "Auto Trader is the UK's largest digital automotive marketplace; data privacy and transition risk (EV shift) are primary ESG drivers." },
  "AV": { name: "Aviva Plc", coarse: "financials", sasb: "Life insurance", country: "UK", mkt: "$14.0B", desc: "Aviva is a leading UK insurer; climate risk integration into product design and investment mandates is a core ESG theme." },
  "BAB": { name: "Babcock International Group", coarse: "industrial", sasb: "Aerospace & defence", country: "UK", mkt: "$2.0B", desc: "Babcock International provides defence engineering and nuclear services; security, supply-chain integrity, and labour practices are material." },
  "BA.": { name: "BAE Systems plc", coarse: "industrial", sasb: "Aerospace & defence", country: "UK", mkt: "$40.0B", desc: "BAE Systems is the UK's largest defence company; human rights in export markets and supply-chain ethics are major ESG concerns." },
  "BARC": { name: "Barclays plc", coarse: "financials", sasb: "Commercial banking", country: "UK", mkt: "$44.0B", desc: "Barclays is a global bank; financed emissions (Scope 3) and transition finance commitments are under active regulatory scrutiny." },
  "BTRW": { name: "Barratt Redrow Plc", coarse: "consumer", sasb: "Household goods", country: "UK", mkt: "$4.5B", desc: "Barratt Redrow builds homes across England; embodied carbon in construction and affordable-housing supply are key ESG themes." },
  "BEZ": { name: "Beazley plc", coarse: "financials", sasb: "Insurance", country: "UK", mkt: "$5.5B", desc: "Beazley is a specialist insurer; physical climate risk underwriting and cyber risk are its primary ESG drivers." },
  "BKG": { name: "Berkeley Group Holdings plc", coarse: "consumer", sasb: "Household goods", country: "UK", mkt: "$5.0B", desc: "Berkeley Group is a premium residential developer; sustainable design standards and planning consent risk define ESG exposure." },
  "BP": { name: "BP Plc", coarse: "energy", sasb: "Oil & gas producers", country: "UK", mkt: "$82.4B", desc: "BP Plc operates in Oil & gas producers. ESG exposure is sector-typical." },
  "BATS": { name: "British American Tobacco plc", coarse: "consumer", sasb: "Tobacco", country: "UK", mkt: "$55.0B", desc: "British American Tobacco faces existential product-transition ESG risk; novel oral and vaping products are its ESG pivot strategy." },
  "BT.A": { name: "BT Group plc", coarse: "technology", sasb: "Telecommunications", country: "UK", mkt: "$15.0B", desc: "BT Group is the UK's largest telecoms provider; digital inclusion and energy-intensive network infrastructure are key ESG themes." },
  "BNZL": { name: "Bunzl plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$12.0B", desc: "Bunzl distributes essential consumer and workplace products; single-use plastics and supply-chain sustainability are under investor focus." },
  "BRBY": { name: "Burberry Group plc", coarse: "consumer", sasb: "Apparel & luxury goods", country: "UK", mkt: "$5.0B", desc: "Burberry is a British luxury fashion brand; product sustainability and resale/circular economy initiatives define its ESG positioning." },
  "CNA": { name: "Centrica plc", coarse: "energy", sasb: "Gas & water utilities", country: "UK", mkt: "$8.0B", desc: "Centrica operates energy supply and home services; customer energy affordability and just transition are primary ESG debates." },
  "CCH": { name: "Coca-Cola HBC AG", coarse: "consumer", sasb: "Non-alcoholic beverages", country: "Greece", mkt: "$10.0B", desc: "Coca-Cola HBC is a major Coca-Cola bottler across 29 markets; water stewardship and sugar-reduction commitments are material." },
  "CPG": { name: "Compass Group plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$45.0B", desc: "Compass Group is the world's largest contract catering company; food-waste reduction, supply-chain ethics, and nutrition are ESG priorities." },
  "DCC": { name: "DCC plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$6.0B", desc: "DCC is a sales, marketing, and distribution company; its energy division's fossil-fuel transition is the dominant ESG theme." },
  "DGE": { name: "Diageo plc", coarse: "consumer", sasb: "Non-alcoholic beverages", country: "UK", mkt: "$60.0B", desc: "Diageo is a global spirits company; responsible drinking, water use in production, and agricultural sourcing are material ESG factors." },
  "EZJ": { name: "easyJet plc", coarse: "consumer", sasb: "Airlines & travel", country: "UK", mkt: "$4.5B", desc: "easyJet is a European low-cost airline; aviation decarbonisation and sustainable aviation fuel adoption are the primary ESG exposures." },
  "EDV": { name: "Endeavour Mining plc", coarse: "industrial", sasb: "Metals & mining", country: "Canada", mkt: "$6.0B", desc: "Endeavour Mining is a gold producer across West Africa; artisanal mining displacement and community relations are critical ESG issues." },
  "ENT": { name: "Entain plc", coarse: "consumer", sasb: "Airlines & travel", country: "UK", mkt: "$3.0B", desc: "Entain operates sports betting and gaming; gambling harm, responsible gaming tools, and regulatory risk define ESG exposure." },
  "EXPN": { name: "Experian Plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$32.0B", desc: "Experian is a global credit-data company; consumer data privacy, algorithmic fairness, and financial inclusion are material ESG themes." },
  "FRES": { name: "Fresnillo", coarse: "industrial", sasb: "Metals & mining", country: "Mexico", mkt: "$4.0B", desc: "Fresnillo is a silver and gold miner in Mexico; water access in arid regions and community consent are central ESG risks." },
  "GAW": { name: "Games Workshop Group", coarse: "consumer", sasb: "Leisure goods", country: "UK", mkt: "$3.5B", desc: "Games Workshop designs and sells fantasy miniatures; ethical supply-chain and labour standards in manufacturing are nascent ESG themes." },
  "GLEN": { name: "Glencore plc", coarse: "industrial", sasb: "Metals & mining", country: "Switzerland", mkt: "$60.0B", desc: "Glencore is a global commodities trader and miner; coal production, community conflict, and anti-bribery compliance are high-profile ESG risks." },
  "GSK": { name: "GSK plc", coarse: "healthcare", sasb: "Pharmaceuticals", country: "UK", mkt: "$80.0B", desc: "GSK is a global pharmaceutical company; access to medicines in low-income markets and clinical-trial transparency are primary ESG themes." },
  "HLN": { name: "Haleon plc", coarse: "healthcare", sasb: "Pharmaceuticals", country: "UK", mkt: "$35.0B", desc: "Haleon is a consumer healthcare company spun out of GSK; product quality, responsible marketing, and plastic packaging are material." },
  "HLMA": { name: "Halma plc", coarse: "technology", sasb: "Electronic manufacturing", country: "UK", mkt: "$12.0B", desc: "Halma is a diversified safety-technology group; positive ESG impact via safety products offsets limited disclosure." },
  "HWDN": { name: "Howden Joinery Group Plc", coarse: "industrial", sasb: "Building products", country: "UK", mkt: "$5.5B", desc: "Howden Joinery manufactures kitchens; scope 3 product embodied carbon and responsible timber sourcing are material." },
  "HSBA": { name: "HSBC Holdings plc", coarse: "financials", sasb: "Commercial banking", country: "UK", mkt: "$155.0B", desc: "HSBC is a global bank; its Asian growth markets carry higher transition-finance and financial-crime ESG risk than European peers." },
  "IMB": { name: "Imperial Brands Group", coarse: "consumer", sasb: "Tobacco", country: "UK", mkt: "$14.0B", desc: "Imperial Brands is a tobacco company; product-harm liability, reduced-risk product transition, and emerging-market distribution are ESG themes." },
  "INF": { name: "Informa plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$11.0B", desc: "Informa is a B2B information-services company; data privacy and responsible AI in research tools are key ESG drivers." },
  "IHG": { name: "InterContinental Hotels Group plc", coarse: "consumer", sasb: "Airlines & travel", country: "UK", mkt: "$18.0B", desc: "InterContinental Hotels is a global franchise operator; water and energy efficiency in franchised hotels are hard-to-control ESG risks." },
  "IAG": { name: "International Consolidated Airlines Group SA", coarse: "consumer", sasb: "Airlines & travel", country: "UK", mkt: "$10.0B", desc: "International Airlines Group (British Airways, Iberia, Vueling) faces aviation decarbonisation pressure and labour-relations controversies." },
  "ITRK": { name: "Intertek Group plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$6.5B", desc: "Intertek provides testing and certification services; its ESG verification role creates reputational risk if third-party audits are contested." },
  "JD": { name: "JD Sports Fashion plc", coarse: "consumer", sasb: "Apparel retail", country: "UK", mkt: "$9.0B", desc: "JD Sports is a global sports fashion retailer; fast-fashion supply chain ethics and packaging waste are primary ESG themes." },
  "KGF": { name: "Kingfisher", coarse: "consumer", sasb: "Home improvement retail", country: "UK", mkt: "$5.5B", desc: "Kingfisher is the UK's largest DIY retailer; responsible timber and ethical sourcing are material for its Forest Positive strategy." },
  "LGEN": { name: "Legal & General Group plc", coarse: "financials", sasb: "Life insurance", country: "UK", mkt: "$16.0B", desc: "Legal & General is a UK insurer and asset manager; climate integration in its \u00a31.2tn investment portfolio defines its ESG footprint." },
  "LLOY": { name: "Lloyds Banking Group plc", coarse: "financials", sasb: "Commercial banking", country: "UK", mkt: "$35.0B", desc: "Lloyds Banking Group is the UK's largest domestic bank; financial inclusion, mortgage mis-selling legacy, and climate finance are material." },
  "MNG": { name: "M&G plc", coarse: "financials", sasb: "Asset management", country: "UK", mkt: "$5.0B", desc: "M&G is an asset manager; stewardship of investee companies' ESG practices is its primary ESG mechanism." },
  "MKS": { name: "Marks & Spencer Group plc", coarse: "consumer", sasb: "Food retailing", country: "UK", mkt: "$8.5B", desc: "Marks & Spencer is a UK retailer; supply-chain labour standards, food waste reduction, and garment circularity are ESG priorities." },
  "MRO": { name: "Melrose Industries plc", coarse: "industrial", sasb: "Aerospace & defence", country: "UK", mkt: "$5.5B", desc: "Melrose Industries (now primarily aerospace components) faces transition risk as aviation OEMs electrify and lighten airframes." },
  "MNDI": { name: "Mondi plc", coarse: "industrial", sasb: "Containers & packaging", country: "South Africa", mkt: "$7.0B", desc: "Mondi is a sustainable packaging company; FSC-certified fibre sourcing and circular economy alignment are defining ESG strengths." },
  "NG": { name: "National Grid", coarse: "energy", sasb: "Gas & water utilities", country: "UK", mkt: "$42.0B", desc: "National Grid owns and operates electricity and gas transmission networks; it is central to the UK/US energy transition and grid reliability." },
  "NWG": { name: "NatWest Group plc", coarse: "financials", sasb: "Commercial banking", country: "UK", mkt: "$28.0B", desc: "NatWest Group is a UK bank; climate commitments include a \u00a3100bn sustainable finance goal and net-zero financed emissions by 2050." },
  "NXT": { name: "Next plc", coarse: "consumer", sasb: "Apparel retail", country: "UK", mkt: "$14.0B", desc: "Next is a leading UK fashion retailer; supply-chain human rights and garment end-of-life are material ESG risks." },
  "PSON": { name: "Pearson plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$3.5B", desc: "Pearson is a global education company; data privacy in student learning tools and digital accessibility are primary ESG drivers." },
  "PSN": { name: "Persimmon plc", coarse: "consumer", sasb: "Household goods", country: "UK", mkt: "$3.5B", desc: "Persimmon is a UK volume housebuilder; build quality controversies and affordable-housing policy risk define ESG exposure." },
  "PHNX": { name: "Phoenix Group Holdings Plc", coarse: "financials", sasb: "Life insurance", country: "UK", mkt: "$6.0B", desc: "Phoenix Group is a life insurance and pension consolidator; climate integration in annuity investment portfolios is the key ESG theme." },
  "PRU": { name: "Prudential plc", coarse: "financials", sasb: "Life insurance", country: "UK", mkt: "$25.0B", desc: "Prudential is an Asia-Africa insurer; financial inclusion for underinsured populations and digital health access are ESG priorities." },
  "RKT": { name: "Reckitt Benckiser Group Plc", coarse: "consumer", sasb: "Household goods", country: "UK", mkt: "$38.0B", desc: "Reckitt produces consumer health and hygiene products (Dettol, Nurofen); product safety, marketing to children, and plastic packaging are material." },
  "REL": { name: "RELX plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$80.0B", desc: "RELX is a global analytics company; responsible AI, data ethics, and surveillance-technology applications are primary ESG concerns." },
  "RTO": { name: "Rentokil Initial Plc", coarse: "industrial", sasb: "Professional & commercial services", country: "UK", mkt: "$15.0B", desc: "Rentokil Initial provides pest control and hygiene services; chemical use reduction and responsible pesticide application are material." },
  "RMV": { name: "Rightmove plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$5.5B", desc: "Rightmove is the UK's dominant property portal; energy-performance data disclosure in listings is a growing ESG driver." },
  "RIO": { name: "Rio Tinto plc", coarse: "industrial", sasb: "Metals & mining", country: "Australia", mkt: "$95.0B", desc: "Rio Tinto is a global mining company; the Juukan Gorge cultural heritage destruction in 2020 redefined its community-consent ESG risk." },
  "RR": { name: "Rolls Royce Holdings Plc", coarse: "industrial", sasb: "Aerospace & defence", country: "UK", mkt: "$22.0B", desc: "Rolls-Royce makes aircraft engines and power systems; net-zero aviation (sustainable fuel, hydrogen power) defines its long-run ESG strategy." },
  "SGE": { name: "Sage Group plc", coarse: "technology", sasb: "Software & IT services", country: "UK", mkt: "$14.0B", desc: "Sage Group provides cloud accounting software; digital access for SMEs and responsible AI in financial automation are ESG themes." },
  "SBRY": { name: "Sainsbury (J) plc", coarse: "consumer", sasb: "Food retailing", country: "UK", mkt: "$5.5B", desc: "Sainsbury's is a major UK grocer; food waste, own-brand sustainability, and supply-chain human rights are the core ESG issues." },
  "SDR": { name: "Schroders plc", coarse: "financials", sasb: "Asset management", country: "UK", mkt: "$5.0B", desc: "Schroders is a global asset manager; active stewardship on climate and social issues across its \u00a3750bn+ AUM defines its ESG stance." },
  "SGRO": { name: "Segro Plc", coarse: "financials", sasb: "Real estate investment trusts", country: "UK", mkt: "$9.0B", desc: "Segro is a logistics REIT; low-carbon warehouse construction and biodiversity net gain in development are primary ESG differentiators." },
  "SVT": { name: "Severn Trent Plc", coarse: "energy", sasb: "Gas & water utilities", country: "UK", mkt: "$6.0B", desc: "Severn Trent is a UK water utility; pollution events, leakage reduction, and Ofwat regulatory compliance are dominant ESG themes." },
  "SHEL": { name: "Shell plc", coarse: "energy", sasb: "Oil & gas producers", country: "UK", mkt: "$193.2B", desc: "Shell is an integrated energy company with a stated net-zero 2050 ambition; a Dutch court ordered a 45% emissions cut in 2021." },
  "SN": { name: "Smith & Nephew plc", coarse: "healthcare", sasb: "Medical devices", country: "UK", mkt: "$11.0B", desc: "Smith & Nephew is a medical device company; product quality, clinical outcomes data, and ethical promotion define ESG exposure." },
  "SSE": { name: "SSE plc", coarse: "energy", sasb: "Electric utilities", country: "UK", mkt: "$15.0B", desc: "SSE is an electricity network and renewables company; it is one of the UK's largest clean-energy investors with a science-based target." },
  "STJ": { name: "St James's Place Plc", coarse: "financials", sasb: "Asset management", country: "UK", mkt: "$5.8B", desc: "St James's Place is a wealth management company; advice quality, remuneration transparency, and client outcomes are ESG themes after FCA investigation." },
  "STAN": { name: "Standard Chartered plc", coarse: "financials", sasb: "Commercial banking", country: "UK", mkt: "$21.0B", desc: "Standard Chartered is an Asia, Africa, Middle East-focused bank; financial-crime risk, climate finance in high-risk markets, and financial inclusion are material." },
  "TSCO": { name: "Tesco plc", coarse: "consumer", sasb: "Food retailing", country: "UK", mkt: "$20.0B", desc: "Tesco is the UK's largest supermarket; food waste reduction, supply-chain human rights (UK Modern Slavery Act), and packaging are material." },
  "ULVR": { name: "Unilever plc", coarse: "consumer", sasb: "Apparel & luxury goods", country: "UK", mkt: "$98.3B", desc: "Unilever is a consumer goods company with a long-standing sustainability programme and RE100 membership since 2020." },
  "UU.": { name: "United Utilities Group Plc", coarse: "energy", sasb: "Gas & water utilities", country: "UK", mkt: "$5.5B", desc: "United Utilities is a Northwest England water company; leakage, pollution incidents, and investment in nature-based solutions are primary ESG themes." },
  "VOD": { name: "Vodafone Group plc", coarse: "technology", sasb: "Telecommunications", country: "UK", mkt: "$18.0B", desc: "Vodafone is a global telecoms operator; digital inclusion, rural connectivity, and responsible AI for network automation are material." },
  "WTB": { name: "Whitbread plc", coarse: "consumer", sasb: "Hotels & accommodation", country: "UK", mkt: "$5.5B", desc: "Whitbread (Premier Inn) is a UK hotel and restaurant company; net-zero 2040 commitment and food-waste reduction are core ESG targets." },
  "WPP": { name: "WPP plc", coarse: "technology", sasb: "Media & entertainment", country: "UK", mkt: "$10.0B", desc: "WPP is the world's largest advertising group; responsible advertising standards, data ethics, and AI content governance are ESG themes." },
}

const FM: Record<string, [string, string]> = {
  "GHG Emissions": ["GHG Emissions", "E"],
  "Physical Impacts of Climate Change": ["Physical Climate Risk", "E"],
  "Ecological Impacts": ["Ecological Impacts", "E"],
  "Energy Management": ["Energy Management", "E"],
  "Air Quality": ["Air Quality", "E"],
  "Water & Hazardous Materials": ["Water & Hazardous Mat.", "E"],
  "Waste & Wastewater Management": ["Waste & Wastewater", "E"],
  "Materials Sourcing & Efficiency": ["Materials Sourcing", "E"],
  "Employee Health & Safety": ["Employee H&S", "E"],
  "Human Rights & Community Relations": ["Human Rights & Community", "S"],
  "Labor Practices": ["Labor Practices", "S"],
  "Product Quality & Safety": ["Product Quality & Safety", "S"],
  "Customer Welfare": ["Customer Welfare", "S"],
  "Customer Privacy": ["Customer Privacy", "S"],
  "Data Security": ["Data Security", "S"],
  "Employee Engagement": ["Employee Engagement", "S"],
  "Access & Affordability": ["Access & Affordability", "S"],
  "Selling Practices & Product Labeling": ["Selling Practices", "S"],
  "Business Ethics": ["Business Ethics", "G"],
  "Management of the Legal & Regulatory Environment": ["Legal & Regulatory Mgmt", "G"],
  "Systemic Risk Management": ["Systemic Risk Mgmt", "G"],
  "Business Model Resilience": ["Business Model Resilience", "G"],
  "Competitive Behavior": ["Competitive Behavior", "G"],
  "Critical Incidence Risk Management": ["Critical Incident Risk", "G"],
  "Supply Chain Management": ["Supply Chain Mgmt", "G"],
  "Product Design & Lifecycle Management": ["Product Design & Lifecycle", "G"],
}

const DEFS: Record<string, string> = {
  "GHG Emissions": "How the company measures, manages, and reduces its direct and indirect greenhouse-gas emissions.",
  "Physical Impacts of Climate Change": "The company's exposure to physical climate hazards \u2014 storms, flooding, heat \u2014 that can disrupt assets and operations.",
  "Ecological Impacts": "How operations affect ecosystems, biodiversity, and protected habitats, and the liabilities that follow.",
  "Energy Management": "How the company sources, prices, and reduces the energy its operations consume.",
  "Air Quality": "Non-GHG air emissions from operations and the regulatory and health exposure they carry.",
  "Water & Hazardous Materials": "Management of water withdrawal, discharge, and hazardous-material handling.",
  "Waste & Wastewater Management": "How the company handles solid waste, effluent, and the disposal liabilities attached.",
  "Materials Sourcing & Efficiency": "Security and efficiency of critical input materials and the risk of supply disruption.",
  "Employee Health & Safety": "Workplace injury, illness, and fatality risk, and the operational and reputational costs of incidents.",
  "Human Rights & Community Relations": "How operations affect local communities and the human-rights exposure across the footprint.",
  "Labor Practices": "Working conditions, pay, and labor-relations risk across the workforce.",
  "Product Quality & Safety": "The safety and reliability of products and the liabilities of failure or recall.",
  "Customer Welfare": "Risks tied to the health, safety, and responsible use of what the company sells.",
  "Customer Privacy": "How the company collects, uses, and protects customer data.",
  "Data Security": "Resilience against breaches and intrusions, and the cost of data loss.",
  "Employee Engagement": "The company's ability to attract, retain, and motivate its workforce.",
  "Access & Affordability": "Whether essential products and services reach customers at workable prices.",
  "Selling Practices & Product Labeling": "Responsible marketing, accurate labelling, and consumer protection compliance.",
  "Business Ethics": "Exposure to bribery, corruption, fraud, and anti-competitive conduct.",
  "Management of the Legal & Regulatory Environment": "How the company anticipates and manages regulation, litigation, and policy shifts.",
  "Systemic Risk Management": "The company's role in, and resilience to, system-wide financial or operational shocks.",
  "Business Model Resilience": "How durable the business model is against structural and transition pressure.",
  "Competitive Behavior": "Antitrust, market-power, and fair-competition exposure.",
  "Critical Incidence Risk Management": "Preparedness for low-probability, high-severity operational events.",
  "Supply Chain Management": "Labor, environmental, and continuity risk carried across suppliers.",
  "Product Design & Lifecycle Management": "How product design drives use-phase and end-of-life costs and liabilities.",
}

const MAT: Record<string, [string, number][]> = {
  "III": [["Customer Privacy",0.505], ["Employee Engagement",0.505], ["Energy Management",0.355], ["GHG Emissions",0.355], ["Water & Hazardous Materials",0.355], ["Access & Affordability",0.355], ["Data Security",0.355], ["Selling Practices & Product Labeling",0.355]],
  "ADM": [["Business Model Resilience",0.953], ["Business Ethics",0.802], ["Selling Practices & Product Labeling",0.505], ["Waste & Wastewater Management",0.397], ["Air Quality",0.355], ["Energy Management",0.355], ["Customer Welfare",0.355]],
  "AAF": [["Critical Incidence Risk Management",0.727], ["Business Ethics",0.699], ["Access & Affordability",0.645], ["Supply Chain Management",0.61], ["Employee Health & Safety",0.505], ["Customer Privacy",0.492], ["Physical Impacts of Climate Change",0.456], ["Energy Management",0.409]],
  "AAL": [["Business Model Resilience",0.73], ["Physical Impacts of Climate Change",0.724], ["Human Rights & Community Relations",0.583], ["Competitive Behavior",0.551], ["Access & Affordability",0.505], ["Product Design & Lifecycle Management",0.493], ["Ecological Impacts",0.487], ["Customer Privacy",0.477]],
  "ANTO": [["Product Design & Lifecycle Management",0.618], ["Data Security",0.505], ["Employee Engagement",0.505], ["Energy Management",0.421], ["Human Rights & Community Relations",0.357], ["Air Quality",0.355], ["Water & Hazardous Materials",0.355], ["Supply Chain Management",0.355]],
  "ABF": [["Business Model Resilience",0.948], ["Product Design & Lifecycle Management",0.715], ["Access & Affordability",0.606], ["Product Quality & Safety",0.523], ["GHG Emissions",0.505], ["Data Security",0.505], ["Air Quality",0.355], ["Energy Management",0.355]],
  "AZN": [],
  "AUTO": [["Customer Privacy",0.867], ["Business Model Resilience",0.59], ["Product Quality & Safety",0.548], ["Air Quality",0.536], ["Management of the Legal & Regulatory Environment",0.534], ["Energy Management",0.509], ["Competitive Behavior",0.5], ["Critical Incidence Risk Management",0.466]],
  "AV": [["Product Design & Lifecycle Management",0.659], ["Product Quality & Safety",0.644], ["Energy Management",0.594], ["Supply Chain Management",0.591], ["Critical Incidence Risk Management",0.576], ["Human Rights & Community Relations",0.505], ["Access & Affordability",0.497], ["Customer Privacy",0.477]],
  "BAB": [["Business Ethics",0.9], ["GHG Emissions",0.706], ["Customer Privacy",0.637], ["Ecological Impacts",0.577], ["Air Quality",0.505], ["Product Quality & Safety",0.505], ["Critical Incidence Risk Management",0.355], ["Materials Sourcing & Efficiency",0.355]],
  "BA.": [["Supply Chain Management",0.666], ["Human Rights & Community Relations",0.66], ["Customer Privacy",0.582], ["Employee Health & Safety",0.568], ["Business Ethics",0.536], ["Systemic Risk Management",0.533], ["Critical Incidence Risk Management",0.51], ["Ecological Impacts",0.493]],
  "BARC": [["Customer Privacy",0.67], ["Ecological Impacts",0.651], ["Business Model Resilience",0.631], ["Access & Affordability",0.583], ["Management of the Legal & Regulatory Environment",0.583], ["Product Design & Lifecycle Management",0.526], ["Business Ethics",0.504], ["Systemic Risk Management",0.405]],
  "BTRW": [["Business Model Resilience",0.849], ["Business Ethics",0.832], ["Human Rights & Community Relations",0.509], ["Access & Affordability",0.505], ["Product Quality & Safety",0.505], ["Management of the Legal & Regulatory Environment",0.464], ["Waste & Wastewater Management",0.463], ["Physical Impacts of Climate Change",0.414]],
  "BEZ": [["Physical Impacts of Climate Change",0.594], ["Access & Affordability",0.505], ["Human Rights & Community Relations",0.505], ["Customer Privacy",0.453], ["Product Quality & Safety",0.356], ["Air Quality",0.355], ["Energy Management",0.355], ["Waste & Wastewater Management",0.355]],
  "BKG": [["Product Design & Lifecycle Management",0.569], ["Employee Health & Safety",0.505], ["Labor Practices",0.505], ["Business Ethics",0.444], ["Waste & Wastewater Management",0.401], ["Energy Management",0.355], ["GHG Emissions",0.355], ["Data Security",0.355]],
  "BP": [["Physical Impacts of Climate Change",0.759], ["Systemic Risk Management",0.6], ["Product Quality & Safety",0.59], ["GHG Emissions",0.581], ["Human Rights & Community Relations",0.558], ["Supply Chain Management",0.518], ["Business Ethics",0.515], ["Management of the Legal & Regulatory Environment",0.428]],
  "BATS": [["Business Model Resilience",0.741], ["Management of the Legal & Regulatory Environment",0.609], ["Customer Welfare",0.586], ["Energy Management",0.559], ["Customer Privacy",0.555], ["Ecological Impacts",0.543], ["Competitive Behavior",0.505], ["GHG Emissions",0.455]],
  "BT.A": [["Product Design & Lifecycle Management",0.717], ["Customer Privacy",0.607], ["Access & Affordability",0.601], ["Supply Chain Management",0.584], ["Business Ethics",0.559], ["Energy Management",0.553], ["GHG Emissions",0.505], ["Physical Impacts of Climate Change",0.425]],
  "BNZL": [["Product Design & Lifecycle Management",0.827], ["Supply Chain Management",0.708], ["Business Model Resilience",0.66], ["Water & Hazardous Materials",0.506], ["Air Quality",0.505], ["Product Quality & Safety",0.505], ["Access & Affordability",0.428], ["Ecological Impacts",0.38]],
  "BRBY": [["Product Design & Lifecycle Management",0.847], ["Ecological Impacts",0.678], ["Management of the Legal & Regulatory Environment",0.577], ["Business Model Resilience",0.573], ["Water & Hazardous Materials",0.54], ["Business Ethics",0.509], ["Product Quality & Safety",0.426], ["Competitive Behavior",0.387]],
  "CNA": [["Competitive Behavior",0.729], ["Energy Management",0.708], ["GHG Emissions",0.606], ["Supply Chain Management",0.57], ["Waste & Wastewater Management",0.561], ["Customer Privacy",0.534], ["Business Ethics",0.476], ["Systemic Risk Management",0.355]],
  "CCH": [["Business Model Resilience",0.794], ["Access & Affordability",0.735], ["Employee Engagement",0.505], ["Product Quality & Safety",0.505], ["Ecological Impacts",0.389], ["Air Quality",0.355], ["Waste & Wastewater Management",0.355], ["Business Ethics",0.355]],
  "CPG": [["Business Ethics",0.712], ["Business Model Resilience",0.654], ["Product Quality & Safety",0.634], ["Energy Management",0.597], ["Ecological Impacts",0.539], ["Employee Engagement",0.516], ["GHG Emissions",0.469], ["Human Rights & Community Relations",0.433]],
  "DCC": [["Product Design & Lifecycle Management",0.788], ["Labor Practices",0.505], ["Air Quality",0.355], ["Water & Hazardous Materials",0.355], ["Waste & Wastewater Management",0.355], ["Customer Welfare",0.355], ["Employee Engagement",0.355]],
  "DGE": [["Systemic Risk Management",0.718], ["Supply Chain Management",0.696], ["Energy Management",0.574], ["Water & Hazardous Materials",0.567], ["Customer Privacy",0.557], ["Physical Impacts of Climate Change",0.534], ["Human Rights & Community Relations",0.451], ["Critical Incidence Risk Management",0.389]],
  "EZJ": [["Business Ethics",0.729], ["Ecological Impacts",0.642], ["Customer Privacy",0.608], ["Product Design & Lifecycle Management",0.557], ["Competitive Behavior",0.538], ["Waste & Wastewater Management",0.534], ["Systemic Risk Management",0.505], ["Materials Sourcing & Efficiency",0.443]],
  "EDV": [["Systemic Risk Management",0.752], ["Business Ethics",0.607], ["Customer Privacy",0.505], ["Employee Health & Safety",0.505], ["Ecological Impacts",0.355], ["Water & Hazardous Materials",0.355], ["Waste & Wastewater Management",0.355], ["Customer Welfare",0.355]],
  "ENT": [["Ecological Impacts",0.863], ["Customer Privacy",0.65], ["Human Rights & Community Relations",0.558], ["Management of the Legal & Regulatory Environment",0.529], ["Supply Chain Management",0.518], ["Waste & Wastewater Management",0.505], ["Critical Incidence Risk Management",0.472], ["Competitive Behavior",0.437]],
  "EXPN": [["Customer Privacy",0.759], ["Product Design & Lifecycle Management",0.676], ["Systemic Risk Management",0.659], ["Business Ethics",0.56], ["Product Quality & Safety",0.525], ["Air Quality",0.505], ["Energy Management",0.505], ["GHG Emissions",0.355]],
  "FRES": [["Business Model Resilience",0.784], ["Customer Privacy",0.505], ["Customer Welfare",0.505], ["Energy Management",0.355], ["Water & Hazardous Materials",0.355], ["Waste & Wastewater Management",0.355], ["Selling Practices & Product Labeling",0.355], ["Business Ethics",0.355]],
  "GAW": [],
  "GLEN": [["Human Rights & Community Relations",0.704], ["Ecological Impacts",0.688], ["Materials Sourcing & Efficiency",0.634], ["Competitive Behavior",0.528], ["Product Design & Lifecycle Management",0.526], ["Product Quality & Safety",0.513], ["Supply Chain Management",0.512], ["Waste & Wastewater Management",0.453]],
  "GSK": [["Business Ethics",0.799], ["Ecological Impacts",0.661], ["Human Rights & Community Relations",0.622], ["Competitive Behavior",0.522], ["Labor Practices",0.52], ["Critical Incidence Risk Management",0.51], ["Product Quality & Safety",0.475], ["Supply Chain Management",0.443]],
  "HLN": [["Water & Hazardous Materials",0.676], ["Customer Privacy",0.611], ["Business Model Resilience",0.603], ["Critical Incidence Risk Management",0.593], ["Energy Management",0.538], ["Supply Chain Management",0.532], ["Product Quality & Safety",0.505], ["Access & Affordability",0.499]],
  "HLMA": [["Business Model Resilience",0.647], ["Employee Engagement",0.505], ["Selling Practices & Product Labeling",0.505], ["Supply Chain Management",0.428], ["GHG Emissions",0.355], ["Water & Hazardous Materials",0.355], ["Waste & Wastewater Management",0.355]],
  "HWDN": [["GHG Emissions",0.84], ["Product Design & Lifecycle Management",0.791], ["Access & Affordability",0.505], ["Data Security",0.505], ["Business Ethics",0.404], ["Energy Management",0.355], ["Water & Hazardous Materials",0.355], ["Business Model Resilience",0.355]],
  "HSBA": [["Customer Privacy",0.83], ["Business Model Resilience",0.808], ["Critical Incidence Risk Management",0.619], ["Access & Affordability",0.541], ["GHG Emissions",0.54], ["Product Design & Lifecycle Management",0.51], ["Management of the Legal & Regulatory Environment",0.453], ["Product Quality & Safety",0.448]],
  "IMB": [["Business Ethics",0.867], ["Management of the Legal & Regulatory Environment",0.814], ["Data Security",0.505], ["Product Quality & Safety",0.505], ["Physical Impacts of Climate Change",0.441], ["Energy Management",0.355], ["GHG Emissions",0.355], ["Water & Hazardous Materials",0.355]],
  "INF": [["Customer Privacy",0.684], ["Access & Affordability",0.656], ["Business Model Resilience",0.647], ["Product Design & Lifecycle Management",0.572], ["Management of the Legal & Regulatory Environment",0.537], ["Energy Management",0.531], ["Materials Sourcing & Efficiency",0.505], ["Business Ethics",0.411]],
  "IHG": [["Supply Chain Management",0.738], ["Product Quality & Safety",0.649], ["Systemic Risk Management",0.571], ["Physical Impacts of Climate Change",0.567], ["GHG Emissions",0.552], ["Labor Practices",0.544], ["Waste & Wastewater Management",0.466], ["Employee Engagement",0.466]],
  "IAG": [["Access & Affordability",0.764], ["Product Design & Lifecycle Management",0.662], ["Business Model Resilience",0.634], ["Physical Impacts of Climate Change",0.536], ["Customer Welfare",0.505], ["Ecological Impacts",0.497], ["Competitive Behavior",0.49], ["GHG Emissions",0.463]],
  "ITRK": [["Business Model Resilience",0.792], ["Product Design & Lifecycle Management",0.676], ["Supply Chain Management",0.552], ["Business Ethics",0.538], ["Air Quality",0.505], ["Water & Hazardous Materials",0.505], ["Product Quality & Safety",0.492], ["Ecological Impacts",0.474]],
  "JD": [["Business Ethics",0.725], ["Supply Chain Management",0.652], ["Materials Sourcing & Efficiency",0.634], ["Product Quality & Safety",0.582], ["Human Rights & Community Relations",0.545], ["Ecological Impacts",0.513], ["Waste & Wastewater Management",0.505], ["Systemic Risk Management",0.396]],
  "KGF": [["Customer Privacy",0.69], ["Materials Sourcing & Efficiency",0.662], ["Business Model Resilience",0.623], ["Ecological Impacts",0.61], ["Business Ethics",0.564], ["Air Quality",0.505], ["Access & Affordability",0.444], ["Waste & Wastewater Management",0.442]],
  "LGEN": [["Business Model Resilience",0.881], ["Product Design & Lifecycle Management",0.779], ["Energy Management",0.606], ["Customer Privacy",0.545], ["Access & Affordability",0.505], ["Data Security",0.505], ["Air Quality",0.355], ["GHG Emissions",0.355]],
  "LLOY": [["Competitive Behavior",0.744], ["Business Model Resilience",0.719], ["Human Rights & Community Relations",0.611], ["Management of the Legal & Regulatory Environment",0.55], ["Ecological Impacts",0.533], ["Product Design & Lifecycle Management",0.516], ["Business Ethics",0.463], ["Product Quality & Safety",0.401]],
  "MNG": [["Product Design & Lifecycle Management",0.735], ["Business Ethics",0.671], ["Customer Welfare",0.505], ["Labor Practices",0.505], ["Air Quality",0.355], ["Water & Hazardous Materials",0.355], ["Waste & Wastewater Management",0.355], ["Employee Engagement",0.355]],
  "MKS": [["Business Ethics",0.703], ["Business Model Resilience",0.612], ["Access & Affordability",0.585], ["Systemic Risk Management",0.577], ["Waste & Wastewater Management",0.543], ["Customer Privacy",0.537], ["GHG Emissions",0.504], ["Human Rights & Community Relations",0.493]],
  "MRO": [["Energy Management",0.78], ["Customer Privacy",0.744], ["Product Quality & Safety",0.63], ["Ecological Impacts",0.597], ["Air Quality",0.505], ["Employee Health & Safety",0.505], ["Systemic Risk Management",0.388], ["Physical Impacts of Climate Change",0.36]],
  "MNDI": [["Business Ethics",0.71], ["Business Model Resilience",0.675], ["GHG Emissions",0.634], ["Energy Management",0.58], ["Customer Privacy",0.537], ["Air Quality",0.505], ["Systemic Risk Management",0.458], ["Physical Impacts of Climate Change",0.445]],
  "NG": [["Business Ethics",0.659], ["GHG Emissions",0.648], ["Supply Chain Management",0.574], ["Air Quality",0.557], ["Physical Impacts of Climate Change",0.55], ["Materials Sourcing & Efficiency",0.532], ["Product Quality & Safety",0.523], ["Energy Management",0.511]],
  "NWG": [["Business Model Resilience",0.677], ["Product Design & Lifecycle Management",0.669], ["Customer Privacy",0.666], ["Critical Incidence Risk Management",0.552], ["Materials Sourcing & Efficiency",0.535], ["Labor Practices",0.517], ["Human Rights & Community Relations",0.481], ["Product Quality & Safety",0.458]],
  "NXT": [["Materials Sourcing & Efficiency",0.684], ["Business Ethics",0.613], ["Access & Affordability",0.586], ["Water & Hazardous Materials",0.584], ["Customer Welfare",0.578], ["Energy Management",0.544], ["Labor Practices",0.508], ["Systemic Risk Management",0.457]],
  "PSON": [["Customer Privacy",0.787], ["Business Ethics",0.764], ["Employee Health & Safety",0.664], ["Physical Impacts of Climate Change",0.523], ["GHG Emissions",0.505], ["Ecological Impacts",0.449], ["Management of the Legal & Regulatory Environment",0.431], ["Supply Chain Management",0.421]],
  "PSN": [["Energy Management",0.787], ["Access & Affordability",0.505], ["Product Quality & Safety",0.505], ["Customer Privacy",0.421], ["Product Design & Lifecycle Management",0.398], ["Competitive Behavior",0.374], ["GHG Emissions",0.355], ["Water & Hazardous Materials",0.355]],
  "PHNX": [["Business Model Resilience",0.723], ["Product Design & Lifecycle Management",0.658], ["Human Rights & Community Relations",0.595], ["Product Quality & Safety",0.58], ["Business Ethics",0.579], ["Employee Engagement",0.503], ["Supply Chain Management",0.462], ["Physical Impacts of Climate Change",0.456]],
  "PRU": [["Customer Privacy",0.808], ["Business Ethics",0.633], ["Critical Incidence Risk Management",0.615], ["Physical Impacts of Climate Change",0.586], ["Energy Management",0.505], ["Water & Hazardous Materials",0.505], ["Human Rights & Community Relations",0.46], ["Supply Chain Management",0.437]],
  "RKT": [["Ecological Impacts",0.801], ["Business Model Resilience",0.7], ["Business Ethics",0.591], ["Water & Hazardous Materials",0.585], ["Physical Impacts of Climate Change",0.57], ["Access & Affordability",0.483], ["Employee Engagement",0.404], ["Supply Chain Management",0.403]],
  "REL": [["Customer Privacy",0.873], ["Labor Practices",0.775], ["Energy Management",0.505], ["Waste & Wastewater Management",0.505], ["Access & Affordability",0.502], ["Ecological Impacts",0.47], ["Employee Engagement",0.465], ["Critical Incidence Risk Management",0.441]],
  "RTO": [["Customer Privacy",0.983], ["Waste & Wastewater Management",0.793], ["Customer Welfare",0.505], ["Employee Engagement",0.505], ["Air Quality",0.371], ["Business Ethics",0.36], ["Energy Management",0.355], ["Employee Health & Safety",0.355]],
  "RMV": [["Energy Management",0.616], ["Customer Welfare",0.505], ["Selling Practices & Product Labeling",0.505], ["Air Quality",0.355], ["Water & Hazardous Materials",0.355], ["Access & Affordability",0.355], ["Employee Health & Safety",0.355], ["Labor Practices",0.355]],
  "RIO": [],
  "RR": [["Business Model Resilience",0.847], ["Supply Chain Management",0.63], ["Ecological Impacts",0.576], ["Air Quality",0.574], ["Waste & Wastewater Management",0.505], ["Product Quality & Safety",0.505], ["Physical Impacts of Climate Change",0.465], ["Materials Sourcing & Efficiency",0.439]],
  "SGE": [["Business Model Resilience",0.767], ["Critical Incidence Risk Management",0.618], ["Human Rights & Community Relations",0.549], ["Air Quality",0.505], ["Customer Welfare",0.505], ["Access & Affordability",0.383], ["Energy Management",0.355], ["Waste & Wastewater Management",0.355]],
  "SBRY": [["Competitive Behavior",0.718], ["Water & Hazardous Materials",0.713], ["Waste & Wastewater Management",0.582], ["Customer Privacy",0.517], ["Management of the Legal & Regulatory Environment",0.517], ["Access & Affordability",0.506], ["Product Design & Lifecycle Management",0.495], ["GHG Emissions",0.485]],
  "SDR": [],
  "SGRO": [["Business Model Resilience",0.669], ["Employee Health & Safety",0.505], ["Business Ethics",0.505], ["Air Quality",0.401], ["Energy Management",0.355], ["Waste & Wastewater Management",0.355], ["Customer Welfare",0.355], ["Human Rights & Community Relations",0.355]],
  "SVT": [["Business Model Resilience",0.748], ["Competitive Behavior",0.699], ["Product Quality & Safety",0.604], ["Systemic Risk Management",0.549], ["Critical Incidence Risk Management",0.528], ["Customer Privacy",0.505], ["Air Quality",0.355]],
  "SHEL": [["Ecological Impacts",0.645], ["Energy Management",0.587], ["GHG Emissions",0.582], ["Product Design & Lifecycle Management",0.582], ["Systemic Risk Management",0.556], ["Supply Chain Management",0.544], ["Product Quality & Safety",0.543], ["Labor Practices",0.511]],
  "SN": [["Business Model Resilience",0.965], ["Product Design & Lifecycle Management",0.905], ["Customer Privacy",0.58], ["Data Security",0.505], ["Business Ethics",0.505], ["Air Quality",0.355], ["GHG Emissions",0.355], ["Waste & Wastewater Management",0.355]],
  "SSE": [["Physical Impacts of Climate Change",0.679], ["Customer Privacy",0.64], ["Materials Sourcing & Efficiency",0.622], ["Air Quality",0.56], ["Waste & Wastewater Management",0.523], ["Systemic Risk Management",0.523], ["Human Rights & Community Relations",0.499], ["Business Ethics",0.494]],
  "STJ": [["Access & Affordability",0.505], ["Employee Engagement",0.505], ["Human Rights & Community Relations",0.41], ["Customer Privacy",0.378], ["Ecological Impacts",0.355], ["Energy Management",0.355], ["Waste & Wastewater Management",0.355], ["Business Ethics",0.355]],
  "STAN": [["Business Model Resilience",0.68], ["Physical Impacts of Climate Change",0.669], ["Customer Privacy",0.622], ["Supply Chain Management",0.618], ["Management of the Legal & Regulatory Environment",0.573], ["Air Quality",0.505], ["Water & Hazardous Materials",0.505], ["Energy Management",0.38]],
  "TSCO": [["Business Model Resilience",0.798], ["Product Design & Lifecycle Management",0.646], ["Labor Practices",0.593], ["Ecological Impacts",0.559], ["Air Quality",0.54], ["Customer Welfare",0.495], ["GHG Emissions",0.49], ["Human Rights & Community Relations",0.435]],
  "ULVR": [["Physical Impacts of Climate Change",0.741], ["Business Model Resilience",0.678], ["Human Rights & Community Relations",0.566], ["Management of the Legal & Regulatory Environment",0.556], ["Water & Hazardous Materials",0.535], ["GHG Emissions",0.522], ["Critical Incidence Risk Management",0.51], ["Customer Welfare",0.447]],
  "UU.": [["Product Design & Lifecycle Management",0.721], ["Business Model Resilience",0.697], ["Ecological Impacts",0.657], ["Supply Chain Management",0.533], ["GHG Emissions",0.519], ["Business Ethics",0.518], ["Management of the Legal & Regulatory Environment",0.501], ["Product Quality & Safety",0.401]],
  "VOD": [["Customer Privacy",0.7], ["Business Model Resilience",0.61], ["Product Design & Lifecycle Management",0.606], ["GHG Emissions",0.585], ["Access & Affordability",0.584], ["Systemic Risk Management",0.517], ["Product Quality & Safety",0.508], ["Materials Sourcing & Efficiency",0.442]],
  "WTB": [["Business Model Resilience",0.754], ["Product Design & Lifecycle Management",0.729], ["Access & Affordability",0.505], ["Business Ethics",0.505], ["Energy Management",0.384], ["GHG Emissions",0.356], ["Air Quality",0.355], ["Labor Practices",0.355]],
  "WPP": [["Product Design & Lifecycle Management",0.898], ["Customer Privacy",0.783], ["Business Ethics",0.574], ["Air Quality",0.505], ["Energy Management",0.505], ["Supply Chain Management",0.476], ["Access & Affordability",0.44], ["Product Quality & Safety",0.37]],
}

type KpiRow = [string, number, string, number, number, "improving"|"flat"|"worsening", number]
const KPI: Record<string, KpiRow[]> = {
  "III": [["financed_emissions_intensity",48.5,"tCO\u2082e/$mAUM",52,50,"improving",0.35], ["green_finance_pct",22.8,"%",24,15,"worsening",0.25], ["data_breach_incidents",0.8,"",60,1,"flat",0.2], ["employee_engagement",79.5,"/100",43,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "ADM": [["financed_emissions_intensity",50.8,"tCO\u2082e/$mAUM",49,50,"improving",0.35], ["green_finance_pct",22.9,"%",24,15,"worsening",0.25], ["data_breach_incidents",0.9,"",54,1,"flat",0.2], ["employee_engagement",83.3,"/100",41,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"improving",0.1]],
  "AAF": [["emissions_intensity",26.5,"tCO\u2082e/$m",67,40,"improving",0.25], ["renewable_energy_pct",50.9,"%",49,50,"improving",0.25], ["data_security_score",70.7,"/100",50,70,"flat",0.25], ["labor_standards",80.5,"/100",38,65,"worsening",0.15], ["supply_chain_score",66.7,"/100",42,58,"improving",0.1]],
  "AAL": [["emissions_intensity",95.3,"tCO\u2082e/$m",32,70,"flat",0.3], ["supply_chain_score",44.7,"/100",59,55,"improving",0.25], ["energy_efficiency",54.4,"kWh/$m",40,45,"improving",0.2], ["labor_standards",48.4,"/100",60,60,"flat",0.15], ["waste_recycling_rate",76.4,"%",41,65,"worsening",0.1]],
  "ANTO": [["emissions_intensity",78.3,"tCO\u2082e/$m",44,70,"worsening",0.3], ["supply_chain_score",54.5,"/100",50,55,"improving",0.25], ["energy_efficiency",39.0,"kWh/$m",57,45,"worsening",0.2], ["labor_standards",54.1,"/100",55,60,"flat",0.15], ["waste_recycling_rate",90.2,"%",31,65,"flat",0.1]],
  "ABF": [["emissions_intensity",78.1,"tCO\u2082e/$m",35,60,"improving",0.25], ["supply_chain_score",54.1,"/100",51,55,"flat",0.25], ["plastic_reduction",8.4,"%",79,20,"worsening",0.2], ["labor_standards",80.3,"/100",33,60,"improving",0.2], ["water_intensity",67.0,"/100",48,65,"worsening",0.1]],
  "AZN": [["r_and_d_access_score",74.3,"/100",38,60,"flat",0.3], ["supply_chain_score",87.6,"/100",27,60,"improving",0.25], ["product_quality_incidents",0.8,"",80,2,"improving",0.2], ["emissions_intensity",30.3,"tCO\u2082e/$m",49,30,"worsening",0.15], ["labor_standards",68.7,"/100",47,65,"improving",0.1]],
  "AUTO": [["emissions_intensity",42.4,"tCO\u2082e/$m",47,40,"improving",0.25], ["renewable_energy_pct",51.4,"%",49,50,"flat",0.25], ["data_security_score",63.7,"/100",55,70,"flat",0.25], ["labor_standards",78.1,"/100",40,65,"improving",0.15], ["supply_chain_score",65.6,"/100",43,58,"flat",0.1]],
  "AV": [["financed_emissions_intensity",56.4,"tCO\u2082e/$mAUM",44,50,"worsening",0.35], ["green_finance_pct",16.8,"%",44,15,"flat",0.25], ["data_breach_incidents",0.9,"",55,1,"improving",0.2], ["employee_engagement",77.3,"/100",45,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "BAB": [["emissions_intensity",67.4,"tCO\u2082e/$m",52,70,"flat",0.3], ["supply_chain_score",58.7,"/100",47,55,"flat",0.25], ["energy_efficiency",43.6,"kWh/$m",52,45,"worsening",0.2], ["labor_standards",64.4,"/100",46,60,"improving",0.15], ["waste_recycling_rate",54.5,"%",58,65,"flat",0.1]],
  "BA.": [["emissions_intensity",94.9,"tCO\u2082e/$m",32,70,"improving",0.3], ["supply_chain_score",54.9,"/100",50,55,"flat",0.25], ["energy_efficiency",32.3,"kWh/$m",64,45,"flat",0.2], ["labor_standards",69.1,"/100",42,60,"worsening",0.15], ["waste_recycling_rate",75.8,"%",42,65,"improving",0.1]],
  "BARC": [["financed_emissions_intensity",60.4,"tCO\u2082e/$mAUM",40,50,"improving",0.35], ["green_finance_pct",24.1,"%",20,15,"improving",0.25], ["data_breach_incidents",1.2,"",39,1,"flat",0.2], ["employee_engagement",65.0,"/100",54,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "BTRW": [["emissions_intensity",45.0,"tCO\u2082e/$m",63,60,"flat",0.25], ["supply_chain_score",48.3,"/100",56,55,"improving",0.25], ["plastic_reduction",12.8,"%",68,20,"improving",0.2], ["labor_standards",51.6,"/100",57,60,"improving",0.2], ["water_intensity",52.5,"/100",60,65,"worsening",0.1]],
  "BEZ": [["financed_emissions_intensity",48.7,"tCO\u2082e/$mAUM",51,50,"worsening",0.35], ["green_finance_pct",23.6,"%",21,15,"flat",0.25], ["data_breach_incidents",0.9,"",57,1,"worsening",0.2], ["employee_engagement",96.6,"/100",31,70,"worsening",0.1], ["financial_crime_incidents",0.0,"",95,1,"improving",0.1]],
  "BKG": [["emissions_intensity",43.9,"tCO\u2082e/$m",63,60,"improving",0.25], ["supply_chain_score",50.2,"/100",54,55,"flat",0.25], ["plastic_reduction",8.0,"%",80,20,"improving",0.2], ["labor_standards",53.4,"/100",55,60,"flat",0.2], ["water_intensity",81.5,"/100",37,65,"flat",0.1]],
  "BP": [["emissions_intensity",193.2,"tCO\u2082e/$m",19,120,"improving",0.35], ["low_carbon_capex_pct",19.8,"%",72,35,"worsening",0.3], ["renewable_energy_pct",10.9,"%",64,15,"flat",0.2], ["major_incidents",2.2,"",45,2,"flat",0.1], ["methane_reduction",46.7,"%",42,40,"flat",0.05]],
  "BATS": [["emissions_intensity",56.6,"tCO\u2082e/$m",53,60,"flat",0.25], ["supply_chain_score",68.4,"/100",38,55,"improving",0.25], ["plastic_reduction",8.0,"%",80,20,"improving",0.2], ["labor_standards",78.7,"/100",34,60,"worsening",0.2], ["water_intensity",52.6,"/100",60,65,"improving",0.1]],
  "BT.A": [["emissions_intensity",29.4,"tCO\u2082e/$m",63,40,"improving",0.25], ["renewable_energy_pct",61.7,"%",38,50,"improving",0.25], ["data_security_score",54.0,"/100",61,70,"improving",0.25], ["labor_standards",70.1,"/100",46,65,"flat",0.15], ["supply_chain_score",46.7,"/100",60,58,"improving",0.1]],
  "BNZL": [["emissions_intensity",104.5,"tCO\u2082e/$m",25,70,"worsening",0.3], ["supply_chain_score",49.4,"/100",55,55,"improving",0.25], ["energy_efficiency",48.9,"kWh/$m",46,45,"worsening",0.2], ["labor_standards",63.1,"/100",47,60,"flat",0.15], ["waste_recycling_rate",53.4,"%",59,65,"worsening",0.1]],
  "BRBY": [["emissions_intensity",77.0,"tCO\u2082e/$m",36,60,"improving",0.25], ["supply_chain_score",61.4,"/100",44,55,"worsening",0.25], ["plastic_reduction",8.5,"%",79,20,"flat",0.2], ["labor_standards",76.2,"/100",37,60,"worsening",0.2], ["water_intensity",62.9,"/100",52,65,"worsening",0.1]],
  "CNA": [["emissions_intensity",114.7,"tCO\u2082e/$m",52,120,"flat",0.35], ["low_carbon_capex_pct",22.3,"%",68,35,"flat",0.3], ["renewable_energy_pct",14.3,"%",52,15,"worsening",0.2], ["major_incidents",1.9,"",52,2,"worsening",0.1], ["methane_reduction",33.2,"%",58,40,"flat",0.05]],
  "CCH": [["emissions_intensity",63.1,"tCO\u2082e/$m",47,60,"flat",0.25], ["supply_chain_score",62.5,"/100",43,55,"improving",0.25], ["plastic_reduction",11.1,"%",72,20,"improving",0.2], ["labor_standards",72.5,"/100",40,60,"flat",0.2], ["water_intensity",73.6,"/100",43,65,"flat",0.1]],
  "CPG": [["emissions_intensity",89.3,"tCO\u2082e/$m",36,70,"worsening",0.3], ["supply_chain_score",62.7,"/100",43,55,"flat",0.25], ["energy_efficiency",47.8,"kWh/$m",47,45,"improving",0.2], ["labor_standards",80.4,"/100",33,60,"worsening",0.15], ["waste_recycling_rate",70.6,"%",46,65,"improving",0.1]],
  "DCC": [["emissions_intensity",61.8,"tCO\u2082e/$m",56,70,"worsening",0.3], ["supply_chain_score",72.2,"/100",34,55,"improving",0.25], ["energy_efficiency",55.0,"kWh/$m",39,45,"flat",0.2], ["labor_standards",61.6,"/100",49,60,"flat",0.15], ["waste_recycling_rate",85.3,"%",34,65,"improving",0.1]],
  "DGE": [["emissions_intensity",73.8,"tCO\u2082e/$m",38,60,"improving",0.25], ["supply_chain_score",49.4,"/100",55,55,"worsening",0.25], ["plastic_reduction",10.7,"%",73,20,"worsening",0.2], ["labor_standards",67.3,"/100",44,60,"improving",0.2], ["water_intensity",72.6,"/100",44,65,"worsening",0.1]],
  "EZJ": [["emissions_intensity",77.5,"tCO\u2082e/$m",35,60,"flat",0.25], ["supply_chain_score",60.8,"/100",45,55,"flat",0.25], ["plastic_reduction",8.8,"%",78,20,"improving",0.2], ["labor_standards",49.3,"/100",59,60,"worsening",0.2], ["water_intensity",83.3,"/100",36,65,"worsening",0.1]],
  "EDV": [["emissions_intensity",102.0,"tCO\u2082e/$m",27,70,"worsening",0.3], ["supply_chain_score",69.2,"/100",37,55,"worsening",0.25], ["energy_efficiency",37.9,"kWh/$m",58,45,"worsening",0.2], ["labor_standards",83.4,"/100",30,60,"worsening",0.15], ["waste_recycling_rate",84.2,"%",35,65,"improving",0.1]],
  "ENT": [["emissions_intensity",57.7,"tCO\u2082e/$m",52,60,"worsening",0.25], ["supply_chain_score",59.2,"/100",46,55,"improving",0.25], ["plastic_reduction",9.4,"%",76,20,"flat",0.2], ["labor_standards",69.3,"/100",42,60,"flat",0.2], ["water_intensity",78.2,"/100",40,65,"flat",0.1]],
  "EXPN": [["emissions_intensity",80.1,"tCO\u2082e/$m",43,70,"worsening",0.3], ["supply_chain_score",49.3,"/100",55,55,"improving",0.25], ["energy_efficiency",41.3,"kWh/$m",54,45,"worsening",0.2], ["labor_standards",57.2,"/100",52,60,"flat",0.15], ["waste_recycling_rate",53.6,"%",59,65,"flat",0.1]],
  "FRES": [["emissions_intensity",99.7,"tCO\u2082e/$m",29,70,"flat",0.3], ["supply_chain_score",66.0,"/100",40,55,"improving",0.25], ["energy_efficiency",39.3,"kWh/$m",56,45,"improving",0.2], ["labor_standards",70.1,"/100",42,60,"flat",0.15], ["waste_recycling_rate",88.5,"%",32,65,"flat",0.1]],
  "GAW": [["emissions_intensity",69.6,"tCO\u2082e/$m",42,60,"improving",0.25], ["supply_chain_score",59.1,"/100",46,55,"worsening",0.25], ["plastic_reduction",13.2,"%",67,20,"improving",0.2], ["labor_standards",50.1,"/100",58,60,"improving",0.2], ["water_intensity",72.4,"/100",44,65,"improving",0.1]],
  "GLEN": [["emissions_intensity",92.3,"tCO\u2082e/$m",34,70,"worsening",0.3], ["supply_chain_score",42.0,"/100",62,55,"improving",0.25], ["energy_efficiency",49.2,"kWh/$m",45,45,"improving",0.2], ["labor_standards",49.5,"/100",59,60,"flat",0.15], ["waste_recycling_rate",87.4,"%",33,65,"flat",0.1]],
  "GSK": [["r_and_d_access_score",73.8,"/100",39,60,"flat",0.3], ["supply_chain_score",86.7,"/100",28,60,"worsening",0.25], ["product_quality_incidents",1.1,"",72,2,"improving",0.2], ["emissions_intensity",26.5,"tCO\u2082e/$m",56,30,"flat",0.15], ["labor_standards",60.8,"/100",53,65,"worsening",0.1]],
  "HLN": [["r_and_d_access_score",52.1,"/100",57,60,"improving",0.3], ["supply_chain_score",63.8,"/100",47,60,"worsening",0.25], ["product_quality_incidents",0.9,"",77,2,"flat",0.2], ["emissions_intensity",37.5,"tCO\u2082e/$m",38,30,"flat",0.15], ["labor_standards",83.0,"/100",36,65,"flat",0.1]],
  "HLMA": [["emissions_intensity",43.3,"tCO\u2082e/$m",46,40,"flat",0.25], ["renewable_energy_pct",48.5,"%",52,50,"improving",0.25], ["data_security_score",94.0,"/100",33,70,"flat",0.25], ["labor_standards",84.8,"/100",35,65,"flat",0.15], ["supply_chain_score",63.3,"/100",45,58,"flat",0.1]],
  "HWDN": [["emissions_intensity",106.7,"tCO\u2082e/$m",24,70,"worsening",0.3], ["supply_chain_score",59.1,"/100",46,55,"worsening",0.25], ["energy_efficiency",54.8,"kWh/$m",39,45,"flat",0.2], ["labor_standards",65.7,"/100",45,60,"improving",0.15], ["waste_recycling_rate",84.8,"%",35,65,"improving",0.1]],
  "HSBA": [["financed_emissions_intensity",34.1,"tCO\u2082e/$mAUM",66,50,"improving",0.35], ["green_finance_pct",17.3,"%",42,15,"flat",0.25], ["data_breach_incidents",1.1,"",46,1,"worsening",0.2], ["employee_engagement",60.3,"/100",57,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "IMB": [["emissions_intensity",58.6,"tCO\u2082e/$m",51,60,"flat",0.25], ["supply_chain_score",59.2,"/100",46,55,"worsening",0.25], ["plastic_reduction",11.8,"%",71,20,"worsening",0.2], ["labor_standards",52.9,"/100",56,60,"worsening",0.2], ["water_intensity",78.5,"/100",40,65,"flat",0.1]],
  "INF": [["emissions_intensity",39.1,"tCO\u2082e/$m",51,40,"flat",0.25], ["renewable_energy_pct",63.8,"%",36,50,"flat",0.25], ["data_security_score",58.1,"/100",58,70,"worsening",0.25], ["labor_standards",84.8,"/100",35,65,"improving",0.15], ["supply_chain_score",59.6,"/100",49,58,"worsening",0.1]],
  "IHG": [["emissions_intensity",56.1,"tCO\u2082e/$m",53,60,"flat",0.25], ["supply_chain_score",50.3,"/100",54,55,"improving",0.25], ["plastic_reduction",9.3,"%",77,20,"improving",0.2], ["labor_standards",55.6,"/100",54,60,"flat",0.2], ["water_intensity",72.2,"/100",44,65,"flat",0.1]],
  "IAG": [["emissions_intensity",62.3,"tCO\u2082e/$m",48,60,"flat",0.25], ["supply_chain_score",47.1,"/100",57,55,"flat",0.25], ["plastic_reduction",13.4,"%",66,20,"improving",0.2], ["labor_standards",69.1,"/100",42,60,"improving",0.2], ["water_intensity",79.1,"/100",39,65,"flat",0.1]],
  "ITRK": [["emissions_intensity",70.6,"tCO\u2082e/$m",50,70,"improving",0.3], ["supply_chain_score",41.7,"/100",62,55,"worsening",0.25], ["energy_efficiency",56.4,"kWh/$m",37,45,"flat",0.2], ["labor_standards",59.2,"/100",51,60,"flat",0.15], ["waste_recycling_rate",55.5,"%",57,65,"improving",0.1]],
  "JD": [["emissions_intensity",47.0,"tCO\u2082e/$m",61,60,"flat",0.25], ["supply_chain_score",47.9,"/100",56,55,"flat",0.25], ["plastic_reduction",9.6,"%",76,20,"worsening",0.2], ["labor_standards",80.7,"/100",33,60,"improving",0.2], ["water_intensity",66.9,"/100",49,65,"improving",0.1]],
  "KGF": [["emissions_intensity",63.2,"tCO\u2082e/$m",47,60,"flat",0.25], ["supply_chain_score",50.5,"/100",54,55,"worsening",0.25], ["plastic_reduction",11.5,"%",71,20,"flat",0.2], ["labor_standards",68.7,"/100",43,60,"worsening",0.2], ["water_intensity",75.0,"/100",42,65,"worsening",0.1]],
  "LGEN": [["financed_emissions_intensity",34.2,"tCO\u2082e/$mAUM",66,50,"flat",0.35], ["green_finance_pct",21.0,"%",30,15,"flat",0.25], ["data_breach_incidents",1.3,"",37,1,"worsening",0.2], ["employee_engagement",71.7,"/100",49,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "LLOY": [["financed_emissions_intensity",54.8,"tCO\u2082e/$mAUM",45,50,"improving",0.35], ["green_finance_pct",20.1,"%",33,15,"worsening",0.25], ["data_breach_incidents",1.0,"",52,1,"improving",0.2], ["employee_engagement",77.5,"/100",45,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "MNG": [["financed_emissions_intensity",34.5,"tCO\u2082e/$mAUM",65,50,"improving",0.35], ["green_finance_pct",20.5,"%",32,15,"improving",0.25], ["data_breach_incidents",0.9,"",56,1,"flat",0.2], ["employee_engagement",94.3,"/100",33,70,"worsening",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "MKS": [["emissions_intensity",55.7,"tCO\u2082e/$m",54,60,"flat",0.25], ["supply_chain_score",64.8,"/100",41,55,"improving",0.25], ["plastic_reduction",9.0,"%",78,20,"worsening",0.2], ["labor_standards",65.2,"/100",46,60,"worsening",0.2], ["water_intensity",51.4,"/100",60,65,"improving",0.1]],
  "MRO": [["emissions_intensity",69.9,"tCO\u2082e/$m",50,70,"flat",0.3], ["supply_chain_score",48.7,"/100",56,55,"improving",0.25], ["energy_efficiency",49.8,"kWh/$m",45,45,"flat",0.2], ["labor_standards",54.8,"/100",54,60,"flat",0.15], ["waste_recycling_rate",81.0,"%",38,65,"worsening",0.1]],
  "MNDI": [["emissions_intensity",73.1,"tCO\u2082e/$m",48,70,"improving",0.3], ["supply_chain_score",63.3,"/100",42,55,"improving",0.25], ["energy_efficiency",56.4,"kWh/$m",37,45,"flat",0.2], ["labor_standards",53.2,"/100",56,60,"worsening",0.15], ["waste_recycling_rate",74.7,"%",43,65,"improving",0.1]],
  "NG": [["emissions_intensity",138.0,"tCO\u2082e/$m",42,120,"flat",0.35], ["low_carbon_capex_pct",16.4,"%",77,35,"worsening",0.3], ["renewable_energy_pct",10.6,"%",65,15,"improving",0.2], ["major_incidents",1.8,"",54,2,"improving",0.1], ["methane_reduction",48.9,"%",39,40,"flat",0.05]],
  "NWG": [["financed_emissions_intensity",54.2,"tCO\u2082e/$mAUM",46,50,"improving",0.35], ["green_finance_pct",18.8,"%",37,15,"flat",0.25], ["data_breach_incidents",1.0,"",51,1,"improving",0.2], ["employee_engagement",57.9,"/100",59,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "NXT": [["emissions_intensity",47.8,"tCO\u2082e/$m",60,60,"flat",0.25], ["supply_chain_score",56.8,"/100",48,55,"improving",0.25], ["plastic_reduction",12.6,"%",68,20,"worsening",0.2], ["labor_standards",76.7,"/100",36,60,"flat",0.2], ["water_intensity",56.1,"/100",57,65,"flat",0.1]],
  "PSON": [["emissions_intensity",30.1,"tCO\u2082e/$m",62,40,"improving",0.25], ["renewable_energy_pct",52.8,"%",47,50,"flat",0.25], ["data_security_score",72.1,"/100",49,70,"flat",0.25], ["labor_standards",59.2,"/100",54,65,"worsening",0.15], ["supply_chain_score",49.4,"/100",57,58,"flat",0.1]],
  "PSN": [["emissions_intensity",66.0,"tCO\u2082e/$m",45,60,"flat",0.25], ["supply_chain_score",62.8,"/100",43,55,"improving",0.25], ["plastic_reduction",8.8,"%",78,20,"worsening",0.2], ["labor_standards",49.6,"/100",59,60,"flat",0.2], ["water_intensity",81.3,"/100",37,65,"worsening",0.1]],
  "PHNX": [["financed_emissions_intensity",54.9,"tCO\u2082e/$mAUM",45,50,"worsening",0.35], ["green_finance_pct",20.3,"%",32,15,"flat",0.25], ["data_breach_incidents",0.9,"",57,1,"worsening",0.2], ["employee_engagement",67.6,"/100",52,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "PRU": [["financed_emissions_intensity",42.5,"tCO\u2082e/$mAUM",58,50,"flat",0.35], ["green_finance_pct",21.3,"%",29,15,"improving",0.25], ["data_breach_incidents",1.3,"",35,1,"flat",0.2], ["employee_engagement",77.6,"/100",45,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "RKT": [["emissions_intensity",53.8,"tCO\u2082e/$m",55,60,"worsening",0.25], ["supply_chain_score",62.4,"/100",43,55,"improving",0.25], ["plastic_reduction",9.2,"%",77,20,"flat",0.2], ["labor_standards",71.8,"/100",40,60,"improving",0.2], ["water_intensity",86.5,"/100",33,65,"flat",0.1]],
  "REL": [["emissions_intensity",35.4,"tCO\u2082e/$m",56,40,"worsening",0.25], ["renewable_energy_pct",36.3,"%",64,50,"improving",0.25], ["data_security_score",81.2,"/100",42,70,"flat",0.25], ["labor_standards",79.1,"/100",39,65,"worsening",0.15], ["supply_chain_score",68.4,"/100",41,58,"improving",0.1]],
  "RTO": [["emissions_intensity",98.9,"tCO\u2082e/$m",29,70,"flat",0.3], ["supply_chain_score",70.1,"/100",36,55,"worsening",0.25], ["energy_efficiency",39.5,"kWh/$m",56,45,"worsening",0.2], ["labor_standards",80.5,"/100",33,60,"improving",0.15], ["waste_recycling_rate",62.5,"%",52,65,"improving",0.1]],
  "RMV": [["emissions_intensity",42.0,"tCO\u2082e/$m",48,40,"flat",0.25], ["renewable_energy_pct",51.8,"%",48,50,"improving",0.25], ["data_security_score",88.3,"/100",37,70,"improving",0.25], ["labor_standards",86.9,"/100",33,65,"improving",0.15], ["supply_chain_score",66.9,"/100",42,58,"improving",0.1]],
  "RIO": [["emissions_intensity",89.8,"tCO\u2082e/$m",36,70,"flat",0.3], ["supply_chain_score",46.2,"/100",58,55,"worsening",0.25], ["energy_efficiency",55.3,"kWh/$m",39,45,"flat",0.2], ["labor_standards",63.4,"/100",47,60,"worsening",0.15], ["waste_recycling_rate",59.4,"%",54,65,"worsening",0.1]],
  "RR": [["emissions_intensity",64.5,"tCO\u2082e/$m",54,70,"worsening",0.3], ["supply_chain_score",53.4,"/100",51,55,"improving",0.25], ["energy_efficiency",31.7,"kWh/$m",65,45,"improving",0.2], ["labor_standards",63.7,"/100",47,60,"improving",0.15], ["waste_recycling_rate",63.0,"%",52,65,"flat",0.1]],
  "SGE": [["emissions_intensity",28.4,"tCO\u2082e/$m",64,40,"worsening",0.25], ["renewable_energy_pct",37.4,"%",63,50,"worsening",0.25], ["data_security_score",84.8,"/100",39,70,"worsening",0.25], ["labor_standards",56.9,"/100",56,65,"worsening",0.15], ["supply_chain_score",60.8,"/100",48,58,"flat",0.1]],
  "SBRY": [["emissions_intensity",62.9,"tCO\u2082e/$m",48,60,"improving",0.25], ["supply_chain_score",65.6,"/100",40,55,"improving",0.25], ["plastic_reduction",12.6,"%",68,20,"improving",0.2], ["labor_standards",80.3,"/100",33,60,"improving",0.2], ["water_intensity",52.8,"/100",59,65,"flat",0.1]],
  "SDR": [["financed_emissions_intensity",60.2,"tCO\u2082e/$mAUM",40,50,"worsening",0.35], ["green_finance_pct",22.9,"%",24,15,"flat",0.25], ["data_breach_incidents",1.1,"",44,1,"improving",0.2], ["employee_engagement",63.6,"/100",55,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "SGRO": [["financed_emissions_intensity",39.2,"tCO\u2082e/$mAUM",61,50,"worsening",0.35], ["green_finance_pct",23.3,"%",22,15,"flat",0.25], ["data_breach_incidents",1.2,"",39,1,"improving",0.2], ["employee_engagement",90.0,"/100",36,70,"worsening",0.1], ["financial_crime_incidents",0.0,"",95,1,"improving",0.1]],
  "SVT": [["emissions_intensity",143.4,"tCO\u2082e/$m",40,120,"flat",0.35], ["low_carbon_capex_pct",17.7,"%",75,35,"improving",0.3], ["renewable_energy_pct",12.3,"%",59,15,"worsening",0.2], ["major_incidents",1.7,"",57,2,"flat",0.1], ["methane_reduction",45.3,"%",43,40,"flat",0.05]],
  "SHEL": [["emissions_intensity",194.5,"tCO\u2082e/$m",19,120,"flat",0.35], ["low_carbon_capex_pct",20.7,"%",70,35,"flat",0.3], ["renewable_energy_pct",10.3,"%",66,15,"worsening",0.2], ["major_incidents",2.5,"",36,2,"flat",0.1], ["methane_reduction",49.7,"%",38,40,"improving",0.05]],
  "SN": [["r_and_d_access_score",64.9,"/100",46,60,"worsening",0.3], ["supply_chain_score",53.0,"/100",56,60,"flat",0.25], ["product_quality_incidents",1.1,"",73,2,"flat",0.2], ["emissions_intensity",24.8,"tCO\u2082e/$m",59,30,"worsening",0.15], ["labor_standards",82.7,"/100",36,65,"flat",0.1]],
  "SSE": [["emissions_intensity",174.8,"tCO\u2082e/$m",27,120,"improving",0.35], ["low_carbon_capex_pct",17.3,"%",75,35,"worsening",0.3], ["renewable_energy_pct",9.1,"%",70,15,"flat",0.2], ["major_incidents",2.1,"",47,2,"flat",0.1], ["methane_reduction",31.0,"%",61,40,"flat",0.05]],
  "STJ": [["financed_emissions_intensity",55.4,"tCO\u2082e/$mAUM",45,50,"flat",0.35], ["green_finance_pct",18.7,"%",38,15,"improving",0.25], ["data_breach_incidents",1.2,"",41,1,"worsening",0.2], ["employee_engagement",73.4,"/100",48,70,"improving",0.1], ["financial_crime_incidents",0.0,"",95,1,"worsening",0.1]],
  "STAN": [["financed_emissions_intensity",41.1,"tCO\u2082e/$mAUM",59,50,"worsening",0.35], ["green_finance_pct",14.4,"%",52,15,"flat",0.25], ["data_breach_incidents",1.1,"",47,1,"improving",0.2], ["employee_engagement",67.6,"/100",52,70,"flat",0.1], ["financial_crime_incidents",0.0,"",95,1,"flat",0.1]],
  "TSCO": [["emissions_intensity",56.2,"tCO\u2082e/$m",53,60,"worsening",0.25], ["supply_chain_score",58.7,"/100",47,55,"flat",0.25], ["plastic_reduction",9.9,"%",75,20,"improving",0.2], ["labor_standards",45.4,"/100",62,60,"worsening",0.2], ["water_intensity",61.8,"/100",52,65,"flat",0.1]],
  "ULVR": [["emissions_intensity",60.0,"tCO\u2082e/$m",50,60,"worsening",0.25], ["supply_chain_score",61.6,"/100",44,55,"flat",0.25], ["plastic_reduction",11.2,"%",72,20,"improving",0.2], ["labor_standards",53.5,"/100",55,60,"worsening",0.2], ["water_intensity",63.3,"/100",51,65,"worsening",0.1]],
  "UU.": [["emissions_intensity",151.7,"tCO\u2082e/$m",37,120,"worsening",0.35], ["low_carbon_capex_pct",21.6,"%",69,35,"improving",0.3], ["renewable_energy_pct",13.2,"%",56,15,"flat",0.2], ["major_incidents",2.3,"",42,2,"flat",0.1], ["methane_reduction",31.6,"%",60,40,"flat",0.05]],
  "VOD": [["emissions_intensity",27.4,"tCO\u2082e/$m",66,40,"flat",0.25], ["renewable_energy_pct",55.8,"%",44,50,"worsening",0.25], ["data_security_score",90.6,"/100",35,70,"flat",0.25], ["labor_standards",60.9,"/100",53,65,"flat",0.15], ["supply_chain_score",52.2,"/100",55,58,"flat",0.1]],
  "WTB": [["emissions_intensity",72.1,"tCO\u2082e/$m",40,60,"worsening",0.25], ["supply_chain_score",64.8,"/100",41,55,"worsening",0.25], ["plastic_reduction",13.0,"%",68,20,"flat",0.2], ["labor_standards",71.3,"/100",41,60,"worsening",0.2], ["water_intensity",83.7,"/100",36,65,"improving",0.1]],
  "WPP": [["emissions_intensity",30.9,"tCO\u2082e/$m",61,40,"improving",0.25], ["renewable_energy_pct",36.4,"%",64,50,"flat",0.25], ["data_security_score",55.6,"/100",60,70,"worsening",0.25], ["labor_standards",74.2,"/100",43,65,"worsening",0.15], ["supply_chain_score",59.5,"/100",49,58,"improving",0.1]],
}

const RATINGS_RAW: Record<string, [number, number]> = {
  "III": [64.5,61.7],
  "ADM": [62.9,48.0],
  "AAF": [66.3,41.5],
  "AAL": [46.4,34.2],
  "ANTO": [40.9,53.1],
  "ABF": [58.0,51.0],
  "AZN": [64.1,61.7],
  "AUTO": [62.0,42.7],
  "AV": [58.1,47.7],
  "BAB": [50.7,49.6],
  "BA.": [63.1,38.9],
  "BARC": [63.1,55.7],
  "BTRW": [60.9,55.4],
  "BEZ": [57.0,60.4],
  "BKG": [53.4,50.8],
  "BP": [58.3,38.0],
  "BATS": [54.9,49.8],
  "BT.A": [58.3,43.1],
  "BNZL": [48.0,51.1],
  "BRBY": [51.5,38.6],
  "CNA": [46.5,32.8],
  "CCH": [53.0,49.9],
  "CPG": [55.5,43.5],
  "DCC": [60.4,34.7],
  "DGE": [59.6,48.0],
  "EZJ": [47.6,44.4],
  "EDV": [52.3,34.8],
  "ENT": [62.0,57.8],
  "EXPN": [51.3,47.4],
  "FRES": [46.0,49.0],
  "GAW": [61.0,56.9],
  "GLEN": [50.8,51.9],
  "GSK": [55.5,56.2],
  "HLN": [57.5,57.2],
  "HLMA": [51.3,46.4],
  "HWDN": [61.7,41.8],
  "HSBA": [55.0,51.5],
  "IMB": [46.4,42.0],
  "INF": [54.8,36.5],
  "IHG": [50.0,50.4],
  "IAG": [52.6,45.2],
  "ITRK": [48.0,39.6],
  "JD": [63.6,54.4],
  "KGF": [48.6,51.4],
  "LGEN": [61.2,59.9],
  "LLOY": [60.0,58.6],
  "MNG": [64.9,52.4],
  "MKS": [59.7,54.3],
  "MRO": [54.1,45.1],
  "MNDI": [48.8,48.0],
  "NG": [51.3,50.7],
  "NWG": [55.2,51.0],
  "NXT": [58.0,57.0],
  "PSON": [64.4,49.0],
  "PSN": [56.9,50.6],
  "PHNX": [67.4,52.2],
  "PRU": [59.0,52.2],
  "RKT": [62.4,55.8],
  "REL": [63.5,48.8],
  "RTO": [55.2,47.8],
  "RMV": [55.4,51.5],
  "RIO": [40.9,50.8],
  "RR": [57.5,49.7],
  "SGE": [63.8,44.7],
  "SBRY": [51.8,43.9],
  "SDR": [63.4,43.8],
  "SGRO": [64.7,60.1],
  "SVT": [44.7,44.4],
  "SHEL": [51.7,42.0],
  "SN": [55.8,57.9],
  "SSE": [49.2,50.9],
  "STJ": [55.0,57.7],
  "STAN": [59.5,55.6],
  "TSCO": [68.4,52.4],
  "ULVR": [70.0,63.7],
  "UU.": [64.8,46.1],
  "VOD": [52.5,38.5],
  "WTB": [58.9,49.4],
  "WPP": [56.3,41.2],
}

const CLAIM_C: Record<string, [number, number, number]> = {
  "III": [1,1,3],
  "ADM": [2,1,3],
  "AAF": [0,2,2],
  "AAL": [1,1,3],
  "ANTO": [0,1,2],
  "ABF": [2,2,2],
  "AZN": [1,1,1],
  "AUTO": [1,1,3],
  "AV": [1,0,2],
  "BAB": [1,1,2],
  "BA.": [0,2,2],
  "BARC": [0,1,1],
  "BTRW": [0,2,2],
  "BEZ": [0,0,3],
  "BKG": [1,2,3],
  "BP": [1,1,3],
  "BATS": [0,0,2],
  "BT.A": [0,0,2],
  "BNZL": [0,1,2],
  "BRBY": [1,1,2],
  "CNA": [0,1,2],
  "CCH": [1,1,3],
  "CPG": [0,1,1],
  "DCC": [1,2,1],
  "DGE": [2,1,1],
  "EZJ": [2,0,1],
  "EDV": [2,2,3],
  "ENT": [2,1,3],
  "EXPN": [0,1,3],
  "FRES": [0,1,3],
  "GAW": [2,0,2],
  "GLEN": [2,2,3],
  "GSK": [1,2,2],
  "HLN": [0,1,3],
  "HLMA": [1,1,3],
  "HWDN": [1,1,1],
  "HSBA": [2,2,2],
  "IMB": [1,0,3],
  "INF": [2,0,3],
  "IHG": [1,1,3],
  "IAG": [1,2,2],
  "ITRK": [0,2,2],
  "JD": [2,1,3],
  "KGF": [0,2,1],
  "LGEN": [0,2,3],
  "LLOY": [0,1,3],
  "MNG": [0,0,2],
  "MKS": [2,1,2],
  "MRO": [2,1,1],
  "MNDI": [1,1,2],
  "NG": [1,0,2],
  "NWG": [0,0,1],
  "NXT": [0,1,3],
  "PSON": [2,0,1],
  "PSN": [1,1,1],
  "PHNX": [2,1,2],
  "PRU": [0,1,3],
  "RKT": [2,2,2],
  "REL": [1,0,2],
  "RTO": [1,0,2],
  "RMV": [2,2,2],
  "RIO": [1,0,2],
  "RR": [1,1,1],
  "SGE": [1,1,2],
  "SBRY": [1,1,1],
  "SDR": [0,2,1],
  "SGRO": [1,0,1],
  "SVT": [1,2,2],
  "SHEL": [0,1,1],
  "SN": [2,1,1],
  "SSE": [2,1,2],
  "STJ": [2,1,3],
  "STAN": [0,1,2],
  "TSCO": [2,2,1],
  "ULVR": [1,0,1],
  "UU.": [2,1,1],
  "VOD": [1,2,2],
  "WTB": [0,2,3],
  "WPP": [0,0,2],
}

const CONTROV_C: Record<string, [number, number, number]> = {
  "III": [1,2,0],
  "ADM": [1,2,0],
  "AAF": [0,2,1],
  "AAL": [0,1,0],
  "ANTO": [1,2,0],
  "ABF": [1,1,0],
  "AZN": [1,2,0],
  "AUTO": [0,1,1],
  "AV": [1,1,0],
  "BAB": [1,1,1],
  "BA.": [1,2,0],
  "BARC": [1,0,1],
  "BTRW": [0,0,1],
  "BEZ": [0,2,1],
  "BKG": [1,2,0],
  "BP": [3,2,0],
  "BATS": [1,1,0],
  "BT.A": [1,1,1],
  "BNZL": [1,1,1],
  "BRBY": [0,1,1],
  "CNA": [1,0,0],
  "CCH": [0,0,1],
  "CPG": [1,1,0],
  "DCC": [0,1,0],
  "DGE": [1,0,0],
  "EZJ": [1,2,0],
  "EDV": [0,0,1],
  "ENT": [1,1,0],
  "EXPN": [0,1,1],
  "FRES": [1,0,0],
  "GAW": [1,1,0],
  "GLEN": [1,2,0],
  "GSK": [1,1,1],
  "HLN": [1,1,1],
  "HLMA": [1,1,0],
  "HWDN": [0,1,1],
  "HSBA": [1,1,0],
  "IMB": [1,1,1],
  "INF": [1,1,1],
  "IHG": [0,0,0],
  "IAG": [1,2,0],
  "ITRK": [1,1,1],
  "JD": [1,2,0],
  "KGF": [1,1,1],
  "LGEN": [0,1,1],
  "LLOY": [1,1,0],
  "MNG": [0,1,0],
  "MKS": [0,1,1],
  "MRO": [0,1,0],
  "MNDI": [0,0,0],
  "NG": [0,0,1],
  "NWG": [0,0,1],
  "NXT": [0,1,1],
  "PSON": [0,1,1],
  "PSN": [1,1,0],
  "PHNX": [1,1,1],
  "PRU": [0,0,0],
  "RKT": [0,1,1],
  "REL": [1,0,0],
  "RTO": [1,2,0],
  "RMV": [1,1,1],
  "RIO": [1,0,1],
  "RR": [0,1,0],
  "SGE": [0,2,0],
  "SBRY": [0,2,1],
  "SDR": [1,1,0],
  "SGRO": [1,0,0],
  "SVT": [0,1,1],
  "SHEL": [1,1,0],
  "SN": [1,2,1],
  "SSE": [1,1,0],
  "STJ": [1,0,1],
  "STAN": [1,0,0],
  "TSCO": [0,0,1],
  "ULVR": [0,1,1],
  "UU.": [1,1,1],
  "VOD": [1,2,1],
  "WTB": [0,2,0],
  "WPP": [0,2,0],
}

const WEM_RAW: Record<string, { rev:number; emis:number; labor:number; other:number; ratio:number }> = {
  "III": { rev: 10355323200, emis: 31565, labor: 10325800, other: 46806000, ratio: 57 },
  "ADM": { rev: 7482288000, emis: 69707, labor: 6204800, other: 147413000, ratio: 59 },
  "AAF": { rev: 9174115800, emis: 548608, labor: 42394800, other: 35540400, ratio: 61 },
  "AAL": { rev: 7046280000, emis: 1926660, labor: 22743680, other: 37498200, ratio: 55 },
  "ANTO": { rev: 10764720000, emis: 3848190, labor: 9962080, other: 72106800, ratio: 32 },
  "ABF": { rev: 20347920000, emis: 753288, labor: 28291800, other: 41369000, ratio: 56 },
  "AZN": { rev: 50456400000, emis: 365085, labor: 13692000, other: 18371200, ratio: 60 },
  "AUTO": { rev: 9294314400, emis: 227612, labor: 30940500, other: 85983000, ratio: 41 },
  "AV": { rev: 5465395200, emis: 31799, labor: 8186000, other: 26786000, ratio: 80 },
  "BAB": { rev: 6244368000, emis: 2728500, labor: 17352320, other: 38863200, ratio: 24 },
  "BA.": { rev: 9957870000, emis: 4517040, labor: 7657440, other: 24035400, ratio: 70 },
  "BARC": { rev: 11354448000, emis: 64059, labor: 14800400, other: 29802000, ratio: 46 },
  "BTRW": { rev: 14897030000, emis: 896288, labor: 26464000, other: 13133000, ratio: 65 },
  "BEZ": { rev: 4750311600, emis: 40574, labor: 17273000, other: 102134000, ratio: 48 },
  "BKG": { rev: 16409800000, emis: 629320, labor: 29695800, other: 23650000, ratio: 51 },
  "BP": { rev: 211000000000.0, emis: 39000000.0, labor: 52000000.0, other: 310000000.0, ratio: 107.0 },
  "BATS": { rev: 30116625000, emis: 901072, labor: 12645000, other: 67200000, ratio: 57 },
  "BT.A": { rev: 9367956000, emis: 632536, labor: 28378200, other: 44362200, ratio: 57 },
  "BNZL": { rev: 11247978000, emis: 3613020, labor: 19455200, other: 49947000, ratio: 53 },
  "BRBY": { rev: 15164050000, emis: 699936, labor: 21355000, other: 60277500, ratio: 81 },
  "CNA": { rev: 41405504000, emis: 26369600, labor: 75359400, other: 195264000, ratio: 57 },
  "CCH": { rev: 12025500000, emis: 1364600, labor: 14171200, other: 48512500, ratio: 132 },
  "CPG": { rev: 12382680000, emis: 3134100, labor: 6815040, other: 20330400, ratio: 33 },
  "DCC": { rev: 8277528000, emis: 5077860, labor: 17140160, other: 21063600, ratio: 69 },
  "DGE": { rev: 19327550000, emis: 861448, labor: 9896800, other: 25340000, ratio: 100 },
  "EZJ": { rev: 11332730000, emis: 1332048, labor: 6982200, other: 69072000, ratio: 71 },
  "EDV": { rev: 10065216000, emis: 4159800, labor: 6536320, other: 31094400, ratio: 72 },
  "ENT": { rev: 11208440000, emis: 1139544, labor: 15252800, other: 37592500, ratio: 111 },
  "EXPN": { rev: 14561970000, emis: 3140730, labor: 9591840, other: 21952800, ratio: 77 },
  "FRES": { rev: 5977152000, emis: 3408270, labor: 14450720, other: 71163000, ratio: 68 },
  "GAW": { rev: 10448282500, emis: 846264, labor: 6124200, other: 36754000, ratio: 57 },
  "GLEN": { rev: 14588310000, emis: 3699600, labor: 22770720, other: 49151400, ratio: 62 },
  "GSK": { rev: 23199800000, emis: 444879, labor: 33216960, other: 75581600, ratio: 64 },
  "HLN": { rev: 20953520000, emis: 315438, labor: 19919520, other: 98867200, ratio: 69 },
  "HLMA": { rev: 9836870400, emis: 367752, labor: 39044700, other: 85437000, ratio: 76 },
  "HWDN": { rev: 9677146500, emis: 1908330, labor: 11578240, other: 14059200, ratio: 30 },
  "HSBA": { rev: 30036108000, emis: 27548, labor: 19194400, other: 115108000, ratio: 65 },
  "IMB": { rev: 20314240000, emis: 1272872, labor: 17754000, other: 15928000, ratio: 114 },
  "INF": { rev: 11240226000, emis: 498428, labor: 27863400, other: 64189800, ratio: 56 },
  "IHG": { rev: 14678480000, emis: 459280, labor: 4946400, other: 42025500, ratio: 82 },
  "IAG": { rev: 18348000000, emis: 1210160, labor: 12249800, other: 66628000, ratio: 77 },
  "ITRK": { rev: 10773420000, emis: 2854080, labor: 9660480, other: 15065400, ratio: 38 },
  "JD": { rev: 15745625000, emis: 696712, labor: 6243800, other: 31664500, ratio: 90 },
  "KGF": { rev: 10836375000, emis: 1094928, labor: 15195600, other: 44619000, ratio: 89 },
  "LGEN": { rev: 5785876800, emis: 53691, labor: 25361600, other: 130799000, ratio: 53 },
  "LLOY": { rev: 10076376000, emis: 87276, labor: 18081600, other: 121725000, ratio: 77 },
  "MNG": { rev: 7018968000, emis: 84150, labor: 19347800, other: 61145000, ratio: 89 },
  "MKS": { rev: 12251362500, emis: 1314680, labor: 7221400, other: 14407000, ratio: 132 },
  "MRO": { rev: 9120204000, emis: 4249500, labor: 7574240, other: 80647800, ratio: 45 },
  "MNDI": { rev: 9704763000, emis: 4086870, labor: 23792000, other: 15042000, ratio: 50 },
  "NG": { rev: 54734848000, emis: 25631200, labor: 47146800, other: 252547200, ratio: 39 },
  "NWG": { rev: 8003736000, emis: 48848, labor: 24563400, other: 68503000, ratio: 71 },
  "NXT": { rev: 12486400000, emis: 496408, labor: 14956400, other: 46679500, ratio: 76 },
  "PSON": { rev: 10368428400, emis: 537688, labor: 13289100, other: 73448400, ratio: 119 },
  "PSN": { rev: 12879857500, emis: 484552, labor: 8929600, other: 70781500, ratio: 57 },
  "PHNX": { rev: 7057075200, emis: 85762, labor: 20892200, other: 91942000, ratio: 41 },
  "PRU": { rev: 9887220000, emis: 34633, labor: 5700400, other: 50485000, ratio: 87 },
  "RKT": { rev: 20950600000, emis: 886512, labor: 6093000, other: 31463000, ratio: 108 },
  "REL": { rev: 30158856000, emis: 436444, labor: 22344900, other: 67816800, ratio: 58 },
  "RTO": { rev: 7573800000, emis: 2479290, labor: 19941920, other: 28504800, ratio: 70 },
  "RMV": { rev: 7348444200, emis: 238792, labor: 10582500, other: 21789000, ratio: 95 },
  "RIO": { rev: 25561905000, emis: 3926580, labor: 3613920, other: 62091600, ratio: 33 },
  "RR": { rev: 11301552000, emis: 2223060, labor: 14748160, other: 65734200, ratio: 60 },
  "SGE": { rev: 8714419200, emis: 223920, labor: 42866700, other: 74368800, ratio: 76 },
  "SBRY": { rev: 15104602500, emis: 459800, labor: 6886000, other: 25301000, ratio: 82 },
  "SDR": { rev: 7254588000, emis: 83949, labor: 11033000, other: 76888000, ratio: 84 },
  "SGRO": { rev: 5524382400, emis: 88784, labor: 14917400, other: 108868000, ratio: 62 },
  "SVT": { rev: 33720064000, emis: 18270600, labor: 48465000, other: 59013600, ratio: 82 },
  "SHEL": { rev: 301000000000.0, emis: 68000000.0, labor: 28000000.0, other: 175000000.0, ratio: 88.0 },
  "SN": { rev: 13878476000, emis: 293559, labor: 23988000, other: 85045600, ratio: 58 },
  "SSE": { rev: 50773840000, emis: 27204200, labor: 21531600, other: 209148000, ratio: 99 },
  "STJ": { rev: 5818556160, emis: 61153, labor: 28130600, other: 100730000, ratio: 84 },
  "STAN": { rev: 6027900000, emis: 50734, labor: 17566800, other: 28294000, ratio: 43 },
  "TSCO": { rev: 13710550000, emis: 1016200, labor: 19212600, other: 65276000, ratio: 119 },
  "ULVR": { rev: 60100000000.0, emis: 1950000.0, labor: 12000000.0, other: 22000000.0, ratio: 196.0 },
  "UU.": { rev: 33022056000, emis: 10574600, labor: 49947000, other: 128246400, ratio: 73 },
  "VOD": { rev: 13278441600, emis: 292924, labor: 21693600, other: 70718400, ratio: 74 },
  "WTB": { rev: 18009195000, emis: 655008, labor: 19852200, other: 44320000, ratio: 105 },
  "WPP": { rev: 13920120000, emis: 576844, labor: 37925400, other: 33106800, ratio: 116 },
}

const FACTOR_KPI: Record<string, string[]> = {
  "GHG Emissions":                      ["emissions_intensity","methane_reduction"],
  "Ecological Impacts":                 ["major_incidents"],
  "Energy Management":                  ["low_carbon_capex_pct","renewable_energy_pct","energy_efficiency","renewable_energy_pct"],
  "Labor Practices":                    ["labor_standards"],
  "Human Rights & Community Relations": ["labor_standards"],
  "Supply Chain Management":            ["supply_chain_score"],
  "Product Quality & Safety":           ["major_incidents","product_quality_incidents"],
  "Physical Impacts of Climate Change": ["emissions_intensity"],
  "Business Model Resilience":          ["low_carbon_capex_pct","green_finance_pct","financed_emissions_intensity"],
  "Water & Hazardous Materials":        ["water_intensity"],
  "Employee Engagement":                ["labor_standards","employee_engagement"],
  "Critical Incidence Risk Management": ["major_incidents","financial_crime_incidents"],
  "Product Design & Lifecycle Management": ["low_carbon_capex_pct","waste_recycling_rate"],
  "Air Quality":                        ["emissions_intensity"],
  "Data Security":                      ["data_security_score","data_breach_incidents"],
  "Customer Privacy":                   ["data_security_score","data_breach_incidents"],
  "Systemic Risk Management":           ["financed_emissions_intensity","financial_crime_incidents"],
  "Employee Health & Safety":           ["labor_standards"],
  "Access & Affordability":             ["r_and_d_access_score","green_finance_pct"],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)) }
function erf(x: number) {
  const s = x >= 0 ? 1 : -1; x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - (((((1.061405429*t - 1.453152027)*t) + 1.421413741)*t - 0.284496736)*t + 0.254829592)*t*Math.exp(-x*x)
  return s * y
}
function stdev(a: number[]) {
  const m = a.reduce((p,c) => p+c, 0) / a.length
  const v = a.reduce((p,c) => p + (c-m)*(c-m), 0) / (a.length - 1)
  return Math.sqrt(v)
}
function ftsePct(wem: number) {
  const z = (wem - 50) / 20
  return clamp(Math.round(50 * (1 + erf(z / Math.SQRT2))), 2, 98)
}

function topN(ticker: string, n: number): [string, number][] {
  return [...(MAT[ticker] ?? [])].sort((a,b) => b[1]-a[1]).slice(0, n)
}

function matMap(ticker: string): Record<string, number> {
  const m: Record<string, number> = {}
  ;(MAT[ticker] ?? []).forEach(([f,s]) => { m[f] = s })
  return m
}

function peerTickers(ticker: string): string[] {
  const coarse = CO[ticker]?.coarse
  const peers = ORDER.filter(t => CO[t]?.coarse === coarse)
  return peers.length > 1 ? peers : [...ORDER]
}

function kpiDirection(factor: string, kp: KpiRow[]): "leading"|"stable"|"lagging" {
  const names = FACTOR_KPI[factor] ?? []
  const matched = kp.filter(k => names.includes(k[0]))
  if (!matched.length) return "stable"
  const ni = matched.filter(k => k[5] === "improving").length
  const nw = matched.filter(k => k[5] === "worsening").length
  if (ni > nw) return "leading"
  if (nw > ni) return "lagging"
  return "stable"
}

function computeScores(ticker: string) {
  const r = RATINGS_RAW[ticker] ?? [50, 50]
  const esgAvg = (r[0] + r[1]) / 2
  const divergence = Math.abs(r[0] - r[1])
  const [v, c, u] = CLAIM_C[ticker] ?? [0, 0, 0]
  const n = v + c + u
  const [hi, me, lo] = CONTROV_C[ticker] ?? [0, 0, 0]
  const divScore  = clamp(100 - divergence * 3.5, 0, 100)
  const verScore  = n ? clamp(50 + (v - c - u * 0.3) / n * 50, 0, 100) : 50
  const conScore  = clamp(100 - hi * 18 - me * 7 - lo * 3, 0, 100)
  const integrity = 0.35 * divScore + 0.40 * verScore + 0.25 * conScore
  const kp        = KPI[ticker] ?? []
  const impact    = kp.reduce((a, k) => a + k[3] * k[6], 0)
  const wi        = WEM_RAW[ticker] ?? { rev: 1e9, emis: 1e6, labor: 1e6, other: 1e6, ratio: 50 }
  const intensity = wi.emis / (wi.rev / 1e6)
  const finesM    = (wi.labor + wi.other) / 1e6
  const d_carbon  = clamp(intensity / 5, 0, 40)
  const d_labor   = clamp((wi.ratio - 50) * 0.1, 0, 30)
  const d_theft   = clamp(Math.log10(finesM + 1) * 13, 0, 40)
  const wem       = clamp(100 - (d_carbon + d_labor + d_theft), 0, 100)
  const raw       = 0.6 * (esgAvg - wem) + 0.4 * (100 - integrity)
  const placebo   = 1 / (1 + Math.exp(-raw / 20))
  const iTier     = integrity >= 50 ? "high" : "low"
  const mTier     = impact >= 50 ? "high" : "low"
  const momentum  = kp.reduce((a,k) => a + (k[5]==="improving"?k[6]:k[5]==="worsening"?-k[6]:0), 0)
  const highSev   = hi
  return { esgAvg, divergence, integrity, impact, wem, placebo, iTier, mTier,
           divScore, verScore, conScore, d_carbon, d_labor, d_theft, intensity, kp, momentum, highSev }
}

// ── Public exports ────────────────────────────────────────────────────────────

export function isEmbedded(ticker: string): boolean {
  return ticker in CO
}

export function getEmbeddedCompanies(): FTSESearchResult[] {
  return ORDER.map(t => ({
    ticker: t,
    name: CO[t].name,
    industry: CO[t].sasb,
    sector: CO[t].coarse,
    has_full_score: true,
  }))
}

export function getEmbeddedScore(ticker: string): CompanyScore | null {
  if (!CO[ticker]) return null
  const co = CO[ticker]
  const s  = computeScores(ticker)
  const wi = WEM_RAW[ticker]
  const [v, c, u] = CLAIM_C[ticker] ?? [0,0,0]
  const [hi, me, lo] = CONTROV_C[ticker] ?? [0,0,0]

  const ratings: ESGRating[] = [
    { source: "Provider A", environmental: s.esgAvg * 1.05, social: s.esgAvg * 0.95, governance: s.esgAvg, total: RATINGS_RAW[ticker][0], year: 2024 },
    { source: "Provider B", environmental: s.esgAvg * 0.95, social: s.esgAvg * 1.05, governance: s.esgAvg, total: RATINGS_RAW[ticker][1], year: 2024 },
  ]

  const claims: Claim[] = [
    ...Array.from({length:v}, (_,i) => ({ claim_text:`Verified sustainability claim ${i+1}`, category:"Environment", verifiable_metric:"emissions", stated_value:"reduction target", verification_status:"verified" as const, verification_note:"Confirmed against reported data", source_filing:"Annual Report 2024" })),
    ...Array.from({length:c}, (_,i) => ({ claim_text:`Sustainability claim ${i+1} (contradicted)`, category:"Governance", verifiable_metric:"targets", stated_value:"commitment", verification_status:"contradicted" as const, verification_note:"External data conflicts with claim", source_filing:"Sustainability Report 2024" })),
    ...Array.from({length:u}, (_,i) => ({ claim_text:`Sustainability claim ${i+1} (unverifiable)`, category:"Social", verifiable_metric:"initiatives", stated_value:"programme", verification_status:"unverifiable" as const, verification_note:"No public data source to verify", source_filing:"ESG Report 2024" })),
  ]

  const controversies: Controversy[] = [
    ...Array.from({length:hi}, (_,i) => ({ headline:`High-severity ESG incident ${i+1}`, incident_date:"2024-06-01", esg_category:"Environment", severity:"high" as const, source_outlet:"Reuters" })),
    ...Array.from({length:me}, (_,i) => ({ headline:`Medium-severity ESG incident ${i+1}`, incident_date:"2024-03-01", esg_category:"Governance", severity:"medium" as const, source_outlet:"Bloomberg" })),
    ...Array.from({length:lo}, (_,i) => ({ headline:`Low-severity ESG incident ${i+1}`, incident_date:"2023-12-01", esg_category:"Social", severity:"low" as const, source_outlet:"FT" })),
  ]

  const top8 = topN(ticker, 8)
  const material_factors: MaterialFactor[] = [...MAT[ticker]]
    .sort((a,b) => b[1]-a[1])
    .map(([f,score],i) => ({ factor: f, materiality_score: score, rank: i+1, source: "Maxwell Data FTSE 100 Survey" }))

  const kpis: ImpactKPI[] = s.kp.map(k => ({
    kpi_name:            k[0],
    kpi_label:           k[0].replace(/_/g, " "),
    kpi_value:           k[1],
    kpi_unit:            k[2],
    kpi_score:           k[3],
    sector_median:       k[4],
    sector_median_score: 50,
    trend:               k[5],
    materiality_weight:  k[6],
  }))

  type QColor = "green"|"blue"|"yellow"|"red"
  const qlabels: Record<string, {label:string; action:string; action_label:string; color:QColor}> = {
    "high-high": { label:"Preferred Sustainability Leader", action:"increase_weight", action_label:"Consider increasing allocation", color:"green" },
    "high-low":  { label:"Engagement Priority",             action:"engage",          action_label:"Engage on material KPIs",        color:"blue"  },
    "low-high":  { label:"Under-recognised Performer",      action:"investigate",     action_label:"Investigate data gaps",          color:"yellow"},
    "low-low":   { label:"Greenwashing Risk / Laggard",     action:"exclude",         action_label:"Apply risk premium or exclude",  color:"red"   },
  }
  const qKey = s.iTier + "-" + s.mTier
  const q    = qlabels[qKey] ?? qlabels["low-low"]

  return {
    ticker, name: co.name, sector: co.coarse, country: co.country,
    ratings, claims, controversies,
    integrity: {
      divergence_score:    s.divScore,
      verification_score:  s.verScore,
      controversy_score:   s.conScore,
      integrity_score:     s.integrity,
      weights: { divergence: 0.35, verification: 0.40, controversy: 0.25 },
    },
    impact: { impact_score: s.impact, kpis },
    wem: { wem_score: s.wem, d_carbon: s.d_carbon, d_labor: s.d_labor, d_theft: s.d_theft, emissions_intensity: s.intensity },
    wem_inputs: { ticker, year: 2024, revenue_usd: wi.rev, emissions_tco2e: wi.emis, labor_fines_usd_5y: wi.labor, other_fines_usd_5y: wi.other, ceo_pay_ratio: wi.ratio },
    quadrant: { quadrant: qKey, label: q.label, action: q.action, action_label: q.action_label, placebo_risk: s.placebo >= 0.55, color: q.color, recommendations: [] },
    esg_score_avg: s.esgAvg,
    placebo_index: s.placebo,
    material_factors,
  }
}

export function getEmbeddedProfile(ticker: string): FTSEProfile | null {
  if (!CO[ticker]) return null
  const co    = CO[ticker]
  const peers = peerTickers(ticker)
  const top8  = topN(ticker, 8)

  const peerMaps = Object.fromEntries(peers.map(p => [p, matMap(p)]))

  const top_8_drivers: DriverProfile[] = top8.map(([f, score]) => {
    const others = peers.filter(p => p !== ticker && peerMaps[p][f] != null).map(p => peerMaps[p][f])
    const peerMedian = others.length ? others.reduce((a,b) => a+b, 0) / others.length : score
    const ftseAll = ORDER.map(t => matMap(t)[f]).filter((x): x is number => x != null)
    const ftse100Median = ftseAll.length ? ftseAll.reduce((a,b) => a+b, 0) / ftseAll.length : score
    const dir = kpiDirection(f, KPI[ticker] ?? [])
    const pillar = FM[f]?.[1] ?? "G"
    const category = pillar === "E" ? "Environment" : pillar === "S" ? "Social" : "Governance"
    return {
      driver: f, category,
      materiality_score:    score,
      peer_median:          peerMedian,
      ftse100_median:       ftse100Median,
      deviation_from_peer:  score - peerMedian,
      deviation_from_ftse:  score - ftse100Median,
      direction_3m:         dir,
      direction_12m:        dir,
      confidence:           "medium" as const,
      layman_explanation:   DEFS[f] ?? "",
    }
  })

  const spreads = top_8_drivers.map(d =>
    (Math.abs(d.materiality_score - d.peer_median) + Math.abs(d.materiality_score - d.ftse100_median) + Math.abs(d.peer_median - d.ftse100_median)) / 3
  )
  const three_body_instability = spreads.length ? spreads.reduce((a,b) => a+b, 0) / spreads.length : 0

  return {
    ticker, name: co.name, industry: co.sasb, sector: co.coarse,
    has_full_score: true,
    peer_count: peers.length,
    peer_names: peers.filter(p => p !== ticker).map(p => CO[p]?.name ?? p),
    top_8_drivers,
    all_26_drivers: top_8_drivers,
    three_body_instability,
  }
}

export function getEmbeddedForecast(ticker: string): ForecastResult | null {
  if (!CO[ticker]) return null
  const co  = CO[ticker]
  const s   = computeScores(ticker)
  const peers = peerTickers(ticker)

  const universe = peers.map(t => ({ tk: t, wem: computeScores(t).wem })).sort((a,b) => b.wem - a.wem)
  const peerCount = universe.length
  const rankNow   = universe.findIndex(e => e.tk === ticker) + 1

  let rank3 = rankNow
  if (s.highSev >= 3) { /* high controversy — hold */ }
  else if (s.momentum >= 0.30) rank3 = Math.max(1, rankNow - 1)
  else if (s.momentum <= -0.30) rank3 = Math.min(peerCount, rankNow + 1)

  const ftseNow = ftsePct(s.wem)
  const ftse3   = clamp(ftseNow + Math.round(s.momentum * 3), 2, 98)
  const ftse12  = clamp(ftseNow + Math.round(s.momentum * 7), 2, 98)

  const body1 = s.esgAvg
  const body2 = 100 * (1 - (rankNow - 1) / Math.max(peerCount - 1, 1))
  const body3 = ftseNow
  const vals  = [body1, body2, body3]
  const instabScore = stdev(vals)
  const spread      = Math.max(...vals) - Math.min(...vals)
  const verdict     = instabScore >= 25 ? "severe" : instabScore >= 12 ? "moderate" : "low"

  const driver_forecasts: DriverForecast[] = topN(ticker, 6).map(([f, matScore]) => ({
    factor:            f,
    materiality_score: matScore,
    direction_3m:      kpiDirection(f, s.kp),
    direction_12m:     kpiDirection(f, s.kp),
    confidence:        "medium" as const,
    note:              "",
  }))

  const rankVerb   = rank3 < rankNow ? "rise" : rank3 > rankNow ? "fall" : "hold steady"
  const wemLabel   = s.wem < 40 ? "material ESG risk" : s.wem < 65 ? "moderate harm exposure" : "credible sustainability"
  const summary    = `${co.name} is projected to ${rankVerb} in its ${co.coarse} peer ranking (#${rankNow}→#${rank3} of ${peerCount}) over 3 months. WEM ${Math.round(s.wem)}/100 — ${wemLabel}.`

  const hiLab  = ["ESG score","sector peer rank","FTSE 100 position"][vals.indexOf(Math.max(...vals))]
  const loLab  = ["ESG score","sector peer rank","FTSE 100 position"][vals.indexOf(Math.min(...vals))]
  const note   = verdict === "severe"
    ? `${hiLab} flatters vs ${loLab} — a ${spread.toFixed(0)}-pt spread. ESG score is contaminated by peer-group construction.`
    : verdict === "moderate"
    ? `Moderate conflict (${spread.toFixed(0)}-pt spread): ${hiLab} reads better than ${loLab} implies.`
    : `Low instability — ESG score, sector position, and FTSE 100 rank tell a consistent story (${spread.toFixed(0)}-pt spread).`

  return {
    ticker, peer_sector: co.coarse, peer_count: peerCount,
    peer_rank_now: rankNow, peer_rank_3m: rank3, peer_rank_12m: rank3,
    ftse100_percentile_now: ftseNow, ftse100_percentile_3m: ftse3, ftse100_percentile_12m: ftse12,
    driver_forecasts,
    three_body: {
      body1_esg: body1, body2_peer_normalized: body2, body3_ftse_percentile: body3,
      instability_score:   instabScore,
      instability_verdict: verdict as "severe"|"moderate"|"low",
      instability_note:    note,
      resolution: verdict === "severe"
        ? `${hiLab} (${Math.max(...vals).toFixed(0)}/100) flatters ${ticker} versus ${loLab} (${Math.min(...vals).toFixed(0)}/100). Focus on WEM components to understand real exposure.`
        : verdict === "moderate"
        ? `Moderate signal conflict: the FTSE 100's overweight in energy and mining inflates relative ESG rankings for ${co.coarse} companies.`
        : `Low instability — all three signals corroborate each other. The ESG narrative is internally consistent.`,
    },
    summary_investor: summary,
    summary_corporate: summary,
    summary_auditor:   summary,
    crowd_consensus:   "Source: Maxwell Data embedded financial materiality data (March 2025).",
  }
}

export function getEmbeddedMaterialityComparison(ticker: string): MaterialityComparison | null {
  if (!CO[ticker]) return null
  const co      = CO[ticker]
  const peers   = peerTickers(ticker)
  const compMap = matMap(ticker)

  const allDrivers = Array.from(new Set([
    ...Object.keys(compMap),
    ...peers.flatMap(p => Object.keys(matMap(p))),
  ]))

  const top8factors = new Set(topN(ticker, 8).map(([f]) => f))

  const all_26: DriverComparison[] = allDrivers.map(f => {
    const compScore = compMap[f] ?? null
    const peerScores = peers.filter(p => p !== ticker).map(p => matMap(p)[f]).filter((x): x is number => x != null)
    const ftseScores = ORDER.map(t => matMap(t)[f]).filter((x): x is number => x != null)
    const peerMedian  = peerScores.length ? peerScores.reduce((a,b) => a+b, 0) / peerScores.length : null
    const ftseMedian  = ftseScores.length ? ftseScores.reduce((a,b) => a+b, 0) / ftseScores.length : null
    const pillar      = FM[f]?.[1] ?? "G"
    const topic       = pillar === "E" ? "Environment" : pillar === "S" ? "Social" : "Governance"
    const divPeer     = compScore != null && peerMedian != null ? compScore - peerMedian : 0
    const divFtse     = compScore != null && ftseMedian != null ? compScore - ftseMedian : 0
    const spread      = [compScore, peerMedian, ftseMedian].filter((x): x is number => x != null)
    const spreadVal   = spread.length > 1 ? Math.max(...spread) - Math.min(...spread) : 0

    let uniqueness: string
    if (compScore == null && peerMedian == null) uniqueness = "absent"
    else if (compScore != null && peerMedian == null) uniqueness = "company_only"
    else if (compScore == null && peerMedian != null) uniqueness = "peer_only"
    else if (divPeer >= 0.05) uniqueness = "company_leading"
    else if (divPeer <= -0.05) uniqueness = "company_lagging"
    else uniqueness = "sector_norm"

    const why = compScore == null
      ? `${f} is not in ${co.name}'s material drivers.`
      : peerMedian == null
      ? `${f} is unique to ${co.name} — no sector peer scores this driver.`
      : divPeer >= 0.05
      ? `${co.name} weights ${f} ${(divPeer*100).toFixed(0)} pts above the sector average.`
      : divPeer <= -0.05
      ? `${co.name} weights ${f} ${(Math.abs(divPeer)*100).toFixed(0)} pts below the sector average.`
      : `${f} is broadly sector-normal for ${co.name}.`

    return {
      driver: f, topic,
      company_score:       compScore,
      peer_median:         peerMedian,
      ftse100_median:      ftseMedian,
      peer_n:              peerScores.length,
      ftse100_n:           ftseScores.length,
      divergence_from_peer: divPeer,
      divergence_from_ftse: divFtse,
      uniqueness, spread: spreadVal, why,
    }
  })

  const top_8 = all_26.filter(d => top8factors.has(d.driver))
  const instab = top_8.length
    ? top_8.reduce((acc, d) => acc + d.spread, 0) / top_8.length
    : 0

  const unique_to_company = all_26.filter(d => d.uniqueness === "company_only").map(d => d.driver)
  const unique_to_peers   = all_26.filter(d => d.uniqueness === "peer_only").map(d => d.driver)

  return {
    ticker, company_name: co.name, industry: co.sasb, ftse_industry: co.sasb,
    peer_count: peers.filter(p => p !== ticker).length,
    top_8, all_26,
    three_body_instability: instab,
    unique_to_company, unique_to_peers,
  }
}

// ── Pairwise comparison ───────────────────────────────────────────────────────

export interface ComparedDriver {
  driver:       string
  pillar:       string
  category:     string
  scoreA:       number
  scoreB:       number | null
  inTopA:       boolean
  inTopB:       boolean
  diff:         number
  explanation:  string
}

export interface PairCompany {
  ticker: string
  name:   string
  sector: string
  sasb:   string
  desc:   string
  integrity: number
  impact:    number
  wem:       number
}

export interface PairComparison {
  companyA:        PairCompany
  companyB:        PairCompany
  common:          ComparedDriver[]
  onlyA:           ComparedDriver[]
  onlyB:           ComparedDriver[]
  overlapCount:    number
  divergenceScore: number
  explanation:     string
}

export function getEmbeddedPairComparison(tickerA: string, tickerB: string): PairComparison | null {
  if (!CO[tickerA] || !CO[tickerB]) return null
  const coA = CO[tickerA]; const coB = CO[tickerB]
  const sA  = computeScores(tickerA); const sB = computeScores(tickerB)
  const mapA = matMap(tickerA);        const mapB = matMap(tickerB)
  const top8A = new Set(topN(tickerA, 8).map(([f]) => f))
  const top8B = new Set(topN(tickerB, 8).map(([f]) => f))

  const union = [...new Set([...top8A, ...top8B])]

  const drivers: ComparedDriver[] = union.map(f => {
    const sA_ = mapA[f] ?? null
    const sB_ = mapB[f] ?? null
    const pillar   = FM[f]?.[1] ?? "G"
    const category = pillar === "E" ? "Environment" : pillar === "S" ? "Social" : "Governance"
    return {
      driver: f, pillar, category,
      scoreA: sA_ ?? 0,
      scoreB: sB_,
      inTopA: top8A.has(f),
      inTopB: top8B.has(f),
      diff:   (sA_ ?? 0) - (sB_ ?? 0),
      explanation: DEFS[f] ?? "",
    }
  })

  const common = drivers.filter(d => d.inTopA && d.inTopB).sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff))
  const onlyA  = drivers.filter(d => d.inTopA && !d.inTopB).sort((a,b) => b.scoreA - a.scoreA)
  const onlyB  = drivers.filter(d => !d.inTopA && d.inTopB).sort((a,b) => (b.scoreB ?? 0) - (a.scoreB ?? 0))

  const overlapCount    = common.length
  const divergenceScore = Math.round((1 - overlapCount / Math.max(1, Math.min(8, union.length))) * 100)
  const sameSector      = coA.coarse === coB.coarse
  const biggestDiff     = common[0]
  const bigMore  = biggestDiff ? (biggestDiff.diff > 0 ? coA.name : coB.name) : null
  const bigLess  = biggestDiff ? (biggestDiff.diff > 0 ? coB.name : coA.name) : null

  let explanation = ""
  if (sameSector) {
    explanation = `${coA.name} and ${coB.name} both operate in ${coA.sasb}, yet only ${overlapCount} of their 8 most financially material drivers coincide.`
    if (biggestDiff && bigMore && bigLess) {
      explanation += ` The sharpest gap in shared drivers is ${biggestDiff.driver}: ${bigMore} weights it ${Math.round(Math.abs(biggestDiff.diff)*100)} pts higher than ${bigLess} — reflecting company-specific operational and legal exposure, not just sector membership.`
    }
    if (onlyA[0]) {
      explanation += ` ${coA.name}'s ${onlyA[0].driver} (score ${Math.round(onlyA[0].scoreA*100)}) is material for it but absent from ${coB.name}'s top 8 — pointing to distinct incident history or asset footprint.`
    }
    if (onlyB[0]) {
      explanation += ` Conversely, ${coB.name}'s ${onlyB[0].driver} (score ${Math.round((onlyB[0].scoreB ?? 0)*100)}) does not rank for ${coA.name}.`
    }
  } else {
    const aTop2 = onlyA.slice(0,2).map(d => d.driver).join(" and ")
    const bTop2 = onlyB.slice(0,2).map(d => d.driver).join(" and ")
    explanation = `${coA.name} (${coA.sasb}) and ${coB.name} (${coB.sasb}) operate in structurally different sectors, so their material driver profiles diverge substantially — only ${overlapCount} of 8 drivers appear in both top-8 lists (divergence score ${divergenceScore}/100).`
    if (aTop2) explanation += ` ${coA.name}'s profile is defined by ${aTop2} — exposures specific to ${coA.sasb} operations.`
    if (bTop2) explanation += ` ${coB.name}'s profile centres on ${bTop2} — the dominant materiality theme for ${coB.sasb}.`
    if (biggestDiff && bigMore && bigLess) {
      explanation += ` Where they do share a driver (${biggestDiff.driver}), ${bigMore} still weights it ${Math.round(Math.abs(biggestDiff.diff)*100)} pts higher — showing that even cross-sector overlap is quantitatively unequal.`
    }
  }
  explanation += " Jangani, Date & Tucker (SSRN 5618192, 2026) show this divergence is structural: company-specific history, operational footprint, and stakeholder exposure shift which topics move the stock independently of industry classification."

  const mkCo = (tk: string, co: typeof coA, s: ReturnType<typeof computeScores>): PairCompany => ({
    ticker: tk, name: co.name, sector: co.coarse, sasb: co.sasb, desc: co.desc,
    integrity: Math.round(s.integrity), impact: Math.round(s.impact), wem: Math.round(s.wem),
  })

  return {
    companyA: mkCo(tickerA, coA, sA),
    companyB: mkCo(tickerB, coB, sB),
    common, onlyA, onlyB, overlapCount, divergenceScore, explanation,
  }
}

export function getEmbeddedPortfolio() {
  const companies = ORDER.map(t => {
    const s = getEmbeddedScore(t)!
    return {
      ticker: t, name: s.name, sector: s.sector,
      integrity_score: s.integrity.integrity_score,
      impact_score:    s.impact.impact_score,
      wem_score:       s.wem.wem_score,
      placebo_index:   s.placebo_index,
      quadrant:        s.quadrant.label,
      quadrant_color:  s.quadrant.color,
      esg_score_avg:   s.esg_score_avg,
    }
  })
  const byEsg  = [...companies].sort((a,b) => b.esg_score_avg - a.esg_score_avg)
  const byIxI  = [...companies].sort((a,b) => (b.integrity_score * b.impact_score) - (a.integrity_score * a.impact_score))
  const byWem  = [...companies].sort((a,b) => b.wem_score - a.wem_score)
  const total  = companies.length
  const naive_esg_tilt         = byEsg.map((c,i) => ({ ticker:c.ticker, name:c.name, weight: (total-i)/total }))
  const integrity_impact_tilt  = byIxI.map((c,i) => ({ ticker:c.ticker, name:c.name, weight: (total-i)/total }))
  const wem_tilt               = byWem.map((c,i) => ({ ticker:c.ticker, name:c.name, weight: (total-i)/total }))
  return { companies, naive_esg_tilt, integrity_impact_tilt, wem_tilt }
}
