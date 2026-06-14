"""
Generate frontend/src/data/embedded.ts with all 79 FTSE 100 companies.
Reads real materiality scores from ftse100_materiality_full.csv.
Synthesises ESG ratings, WEM inputs, KPIs, claims, controversies from
sector models + deterministic per-company noise (seeded by ticker hash).
"""
import csv, json, math, os, hashlib, textwrap
from pathlib import Path

BASE = Path(__file__).parent
DATA = BASE / "data"
OUT  = BASE.parent / "frontend" / "src" / "data" / "embedded.ts"

# ── 1. Load CSVs ──────────────────────────────────────────────────────────────

ESG_COLS = [
    "Air Quality","Ecological Impacts","Energy Management","GHG Emissions",
    "Water & Hazardous Materials","Waste & Wastewater Management",
    "Access & Affordability","Customer Privacy","Customer Welfare",
    "Data Security","Employee Engagement","Employee Health & Safety",
    "Human Rights & Community Relations","Labor Practices",
    "Product Quality & Safety","Selling Practices & Product Labeling",
    "Business Ethics","Business Model Resilience","Competitive Behavior",
    "Critical Incidence Risk Management",
    "Management of the Legal & Regulatory Environment",
    "Materials Sourcing & Efficiency","Product Design & Lifecycle Management",
    "Physical Impacts of Climate Change","Supply Chain Management",
    "Systemic Risk Management",
]

with open(DATA / "ftse100_materiality_full.csv") as f:
    rows = list(csv.DictReader(f))

with open(DATA / "companies.csv") as f:
    co_extra = {r["ticker"]: r for r in csv.DictReader(f)}

with open(DATA / "esg_ratings.csv") as f:
    esg_raw = {}
    for r in csv.DictReader(f):
        esg_raw.setdefault(r["ticker"], []).append(float(r["total"]))

with open(DATA / "wem_inputs.csv") as f:
    wem_base = {r["ticker"]: r for r in csv.DictReader(f)}

with open(DATA / "controversies.csv") as f:
    ctv_base = {}
    for r in csv.DictReader(f):
        ctv_base.setdefault(r["ticker"], []).append(r)

with open(DATA / "claims.csv") as f:
    claims_base = {}
    for r in csv.DictReader(f):
        claims_base.setdefault(r["ticker"], []).append(r)

# ── 2. Sector classification ──────────────────────────────────────────────────

INDUSTRY_TO_COARSE = {
    "Oil & gas producers":                          "energy",
    "Electrical utilities & independent power producers": "energy",
    "Multiline utilities":                          "energy",
    "Mobile telecommunications":                    "technology",
    "Telecommunications services":                  "technology",
    "Software & computer services":                 "technology",
    "Electronic equipment & parts":                 "technology",
    "Media":                                        "technology",
    "Banks":                                        "financials",
    "Life insurance":                               "financials",
    "Insurance":                                    "financials",
    "Financial services":                           "financials",
    "Real estate investment trusts":                "financials",
    "Pharmaceuticals & biotechnology":              "healthcare",
    "Health care equipment & supplies":             "healthcare",
    "Food & tobacco":                               "consumer",
    "Food & drug retailing":                        "consumer",
    "Beverages":                                    "consumer",
    "Tobacco":                                      "consumer",
    "Personal goods":                               "consumer",
    "Household goods & home construction":          "consumer",
    "General retailers":                            "consumer",
    "Retailers":                                    "consumer",
    "Retail hospitality":                           "consumer",
    "Leisure Goods":                                "consumer",
    "Travel & leisure":                             "consumer",
    "Mining":                                       "industrial",
    "Containers & packaging":                       "industrial",
    "Homebuilding & construction supplies":         "industrial",
    "Support services":                             "industrial",
    "Aerospace & defence":                          "industrial",
}

INDUSTRY_TO_SASB = {
    "Oil & gas producers":                          "Oil & gas producers",
    "Electrical utilities & independent power producers": "Electric utilities",
    "Multiline utilities":                          "Gas & water utilities",
    "Mobile telecommunications":                    "Telecommunications",
    "Telecommunications services":                  "Telecommunications",
    "Software & computer services":                 "Software & IT services",
    "Electronic equipment & parts":                 "Electronic manufacturing",
    "Media":                                        "Media & entertainment",
    "Banks":                                        "Commercial banking",
    "Life insurance":                               "Life insurance",
    "Insurance":                                    "Insurance",
    "Financial services":                           "Asset management",
    "Real estate investment trusts":                "Real estate investment trusts",
    "Pharmaceuticals & biotechnology":              "Pharmaceuticals",
    "Health care equipment & supplies":             "Medical devices",
    "Food & tobacco":                               "Food & beverage",
    "Food & drug retailing":                        "Food retailing",
    "Beverages":                                    "Non-alcoholic beverages",
    "Tobacco":                                      "Tobacco",
    "Personal goods":                               "Apparel & luxury goods",
    "Household goods & home construction":          "Household goods",
    "General retailers":                            "Apparel retail",
    "Retailers":                                    "Home improvement retail",
    "Retail hospitality":                           "Hotels & accommodation",
    "Leisure Goods":                                "Leisure goods",
    "Travel & leisure":                             "Airlines & travel",
    "Mining":                                       "Metals & mining",
    "Containers & packaging":                       "Containers & packaging",
    "Homebuilding & construction supplies":         "Building products",
    "Support services":                             "Professional & commercial services",
    "Aerospace & defence":                          "Aerospace & defence",
}

# Country mapping (mostly UK for FTSE 100, exceptions below)
COUNTRY_MAP = {
    "ANTO": "Chile", "AAF": "Nigeria", "GLEN": "Switzerland",
    "MNDI": "South Africa", "EDV": "Canada", "FRES": "Mexico",
    "CCH": "Greece", "RIO": "Australia", "ABF": "UK",
    "PRU": "UK", "STAN": "UK",
}

# Market cap approximations (in $B)
MKTCAP_MAP = {
    "BP":82.4,"SHEL":193.2,"ORSTED":14.1,"XOM":418.7,"TTE":137.8,
    "ULVR":98.3,"NESN":221.4,"AMZN":1820.0,
    "AZN":250.0,"GSK":80.0,"HLN":35.0,"SN":11.0,
    "HSBA":155.0,"BARC":44.0,"LLOY":35.0,"NWG":28.0,"STAN":21.0,
    "AV":14.0,"LGEN":16.0,"PHNX":6.0,"PRU":25.0,"BEZ":5.5,
    "III":24.0,"MNG":5.0,"SDR":5.0,"STJ":5.8,
    "DGE":60.0,"CCH":10.0,"BATS":55.0,"IMB":14.0,
    "MKS":8.5,"SBRY":5.5,"TSCO":20.0,"BRBY":5.0,"KGF":5.5,
    "NXT":14.0,"JD":9.0,"WTB":5.5,"RKT":38.0,"ABF":22.0,
    "BT.A":15.0,"VOD":18.0,"AAF":3.5,
    "REL":80.0,"WPP":10.0,"PSON":3.5,"INF":11.0,"AUTO":8.0,"RMV":5.5,
    "SGE":14.0,"HLMA":12.0,
    "AAL":10.0,"RIO":95.0,"GLEN":60.0,"ANTO":10.0,"FRES":4.0,"EDV":6.0,
    "MNDI":7.0,"HWDN":5.5,"BNZL":12.0,"CPG":45.0,"DCC":6.0,
    "EXPN":32.0,"ITRK":6.5,"RTO":15.0,
    "BA.":40.0,"RR":22.0,"MRO":5.5,"BAB":2.0,
    "SSE":15.0,"NG":42.0,"CNA":8.0,"SVT":6.0,"UU.":5.5,"SGRO":9.0,
    "BTRW":4.5,"PSN":3.5,"BKG":5.0,"GAW":3.5,"ENT":3.0,
    "IAG":10.0,"EZJ":4.5,"IHG":18.0,"HLMA":12.0,"MNG":5.0,
    "ADM":5.0,"LGEN":16.0,
}

# Descriptions
DESC_MAP = {
    "III":  "3i Group is a private equity and infrastructure investment company; ESG embedded in portfolio selection criteria.",
    "ADM":  "Admiral Group is a UK insurance company; climate risk assessment embedded in underwriting since 2022.",
    "AAF":  "Airtel Africa provides mobile and digital services across 14 Sub-Saharan African countries; significant regulatory ESG exposure.",
    "AAL":  "Anglo American is a diversified mining company; significant biodiversity, community, and labour ESG exposure across African and South American assets.",
    "ANTO": "Antofagasta is a Chilean copper mining company; water scarcity and community-relations risk in Atacama Desert operations.",
    "ABF":  "Associated British Foods spans grocery, agriculture, and retail (Primark); supply-chain and land-use ESG risks are material.",
    "AZN":  "AstraZeneca is a global biopharmaceutical company; access-to-medicines and clinical-trial ethics are key ESG themes.",
    "AUTO": "Auto Trader is the UK's largest digital automotive marketplace; data privacy and transition risk (EV shift) are primary ESG drivers.",
    "AV":   "Aviva is a leading UK insurer; climate risk integration into product design and investment mandates is a core ESG theme.",
    "BAB":  "Babcock International provides defence engineering and nuclear services; security, supply-chain integrity, and labour practices are material.",
    "BA.":  "BAE Systems is the UK's largest defence company; human rights in export markets and supply-chain ethics are major ESG concerns.",
    "BARC": "Barclays is a global bank; financed emissions (Scope 3) and transition finance commitments are under active regulatory scrutiny.",
    "BTRW": "Barratt Redrow builds homes across England; embodied carbon in construction and affordable-housing supply are key ESG themes.",
    "BEZ":  "Beazley is a specialist insurer; physical climate risk underwriting and cyber risk are its primary ESG drivers.",
    "BKG":  "Berkeley Group is a premium residential developer; sustainable design standards and planning consent risk define ESG exposure.",
    "BATS": "British American Tobacco faces existential product-transition ESG risk; novel oral and vaping products are its ESG pivot strategy.",
    "BT.A": "BT Group is the UK's largest telecoms provider; digital inclusion and energy-intensive network infrastructure are key ESG themes.",
    "BNZL": "Bunzl distributes essential consumer and workplace products; single-use plastics and supply-chain sustainability are under investor focus.",
    "BRBY": "Burberry is a British luxury fashion brand; product sustainability and resale/circular economy initiatives define its ESG positioning.",
    "CNA":  "Centrica operates energy supply and home services; customer energy affordability and just transition are primary ESG debates.",
    "CCH":  "Coca-Cola HBC is a major Coca-Cola bottler across 29 markets; water stewardship and sugar-reduction commitments are material.",
    "CPG":  "Compass Group is the world's largest contract catering company; food-waste reduction, supply-chain ethics, and nutrition are ESG priorities.",
    "DCC":  "DCC is a sales, marketing, and distribution company; its energy division's fossil-fuel transition is the dominant ESG theme.",
    "DGE":  "Diageo is a global spirits company; responsible drinking, water use in production, and agricultural sourcing are material ESG factors.",
    "EZJ":  "easyJet is a European low-cost airline; aviation decarbonisation and sustainable aviation fuel adoption are the primary ESG exposures.",
    "EDV":  "Endeavour Mining is a gold producer across West Africa; artisanal mining displacement and community relations are critical ESG issues.",
    "ENT":  "Entain operates sports betting and gaming; gambling harm, responsible gaming tools, and regulatory risk define ESG exposure.",
    "EXPN": "Experian is a global credit-data company; consumer data privacy, algorithmic fairness, and financial inclusion are material ESG themes.",
    "FRES": "Fresnillo is a silver and gold miner in Mexico; water access in arid regions and community consent are central ESG risks.",
    "GAW":  "Games Workshop designs and sells fantasy miniatures; ethical supply-chain and labour standards in manufacturing are nascent ESG themes.",
    "GLEN": "Glencore is a global commodities trader and miner; coal production, community conflict, and anti-bribery compliance are high-profile ESG risks.",
    "GSK":  "GSK is a global pharmaceutical company; access to medicines in low-income markets and clinical-trial transparency are primary ESG themes.",
    "HLN":  "Haleon is a consumer healthcare company spun out of GSK; product quality, responsible marketing, and plastic packaging are material.",
    "HLMA": "Halma is a diversified safety-technology group; positive ESG impact via safety products offsets limited disclosure.",
    "HWDN": "Howden Joinery manufactures kitchens; scope 3 product embodied carbon and responsible timber sourcing are material.",
    "HSBA": "HSBC is a global bank; its Asian growth markets carry higher transition-finance and financial-crime ESG risk than European peers.",
    "IMB":  "Imperial Brands is a tobacco company; product-harm liability, reduced-risk product transition, and emerging-market distribution are ESG themes.",
    "INF":  "Informa is a B2B information-services company; data privacy and responsible AI in research tools are key ESG drivers.",
    "IHG":  "InterContinental Hotels is a global franchise operator; water and energy efficiency in franchised hotels are hard-to-control ESG risks.",
    "IAG":  "International Airlines Group (British Airways, Iberia, Vueling) faces aviation decarbonisation pressure and labour-relations controversies.",
    "ITRK": "Intertek provides testing and certification services; its ESG verification role creates reputational risk if third-party audits are contested.",
    "JD":   "JD Sports is a global sports fashion retailer; fast-fashion supply chain ethics and packaging waste are primary ESG themes.",
    "KGF":  "Kingfisher is the UK's largest DIY retailer; responsible timber and ethical sourcing are material for its Forest Positive strategy.",
    "LGEN": "Legal & General is a UK insurer and asset manager; climate integration in its £1.2tn investment portfolio defines its ESG footprint.",
    "LLOY": "Lloyds Banking Group is the UK's largest domestic bank; financial inclusion, mortgage mis-selling legacy, and climate finance are material.",
    "MNG":  "M&G is an asset manager; stewardship of investee companies' ESG practices is its primary ESG mechanism.",
    "MKS":  "Marks & Spencer is a UK retailer; supply-chain labour standards, food waste reduction, and garment circularity are ESG priorities.",
    "MRO":  "Melrose Industries (now primarily aerospace components) faces transition risk as aviation OEMs electrify and lighten airframes.",
    "MNDI": "Mondi is a sustainable packaging company; FSC-certified fibre sourcing and circular economy alignment are defining ESG strengths.",
    "NG":   "National Grid owns and operates electricity and gas transmission networks; it is central to the UK/US energy transition and grid reliability.",
    "NWG":  "NatWest Group is a UK bank; climate commitments include a £100bn sustainable finance goal and net-zero financed emissions by 2050.",
    "NXT":  "Next is a leading UK fashion retailer; supply-chain human rights and garment end-of-life are material ESG risks.",
    "PSON": "Pearson is a global education company; data privacy in student learning tools and digital accessibility are primary ESG drivers.",
    "PSN":  "Persimmon is a UK volume housebuilder; build quality controversies and affordable-housing policy risk define ESG exposure.",
    "PHNX": "Phoenix Group is a life insurance and pension consolidator; climate integration in annuity investment portfolios is the key ESG theme.",
    "PRU":  "Prudential is an Asia-Africa insurer; financial inclusion for underinsured populations and digital health access are ESG priorities.",
    "RKT":  "Reckitt produces consumer health and hygiene products (Dettol, Nurofen); product safety, marketing to children, and plastic packaging are material.",
    "REL":  "RELX is a global analytics company; responsible AI, data ethics, and surveillance-technology applications are primary ESG concerns.",
    "RTO":  "Rentokil Initial provides pest control and hygiene services; chemical use reduction and responsible pesticide application are material.",
    "RMV":  "Rightmove is the UK's dominant property portal; energy-performance data disclosure in listings is a growing ESG driver.",
    "RIO":  "Rio Tinto is a global mining company; the Juukan Gorge cultural heritage destruction in 2020 redefined its community-consent ESG risk.",
    "RR":   "Rolls-Royce makes aircraft engines and power systems; net-zero aviation (sustainable fuel, hydrogen power) defines its long-run ESG strategy.",
    "SGE":  "Sage Group provides cloud accounting software; digital access for SMEs and responsible AI in financial automation are ESG themes.",
    "SBRY": "Sainsbury's is a major UK grocer; food waste, own-brand sustainability, and supply-chain human rights are the core ESG issues.",
    "SDR":  "Schroders is a global asset manager; active stewardship on climate and social issues across its £750bn+ AUM defines its ESG stance.",
    "SGRO": "Segro is a logistics REIT; low-carbon warehouse construction and biodiversity net gain in development are primary ESG differentiators.",
    "SVT":  "Severn Trent is a UK water utility; pollution events, leakage reduction, and Ofwat regulatory compliance are dominant ESG themes.",
    "SHEL": "Shell is an integrated energy company with a stated net-zero 2050 ambition; a Dutch court ordered a 45% emissions cut in 2021.",
    "SN":   "Smith & Nephew is a medical device company; product quality, clinical outcomes data, and ethical promotion define ESG exposure.",
    "SSE":  "SSE is an electricity network and renewables company; it is one of the UK's largest clean-energy investors with a science-based target.",
    "STJ":  "St James's Place is a wealth management company; advice quality, remuneration transparency, and client outcomes are ESG themes after FCA investigation.",
    "STAN": "Standard Chartered is an Asia, Africa, Middle East-focused bank; financial-crime risk, climate finance in high-risk markets, and financial inclusion are material.",
    "TSCO": "Tesco is the UK's largest supermarket; food waste reduction, supply-chain human rights (UK Modern Slavery Act), and packaging are material.",
    "ULVR": "Unilever is a consumer goods company with a long-standing sustainability programme and RE100 membership since 2020.",
    "UU.":  "United Utilities is a Northwest England water company; leakage, pollution incidents, and investment in nature-based solutions are primary ESG themes.",
    "VOD":  "Vodafone is a global telecoms operator; digital inclusion, rural connectivity, and responsible AI for network automation are material.",
    "WTB":  "Whitbread (Premier Inn) is a UK hotel and restaurant company; net-zero 2040 commitment and food-waste reduction are core ESG targets.",
    "WPP":  "WPP is the world's largest advertising group; responsible advertising standards, data ethics, and AI content governance are ESG themes.",
}

# ── 3. Seeded noise helpers ───────────────────────────────────────────────────

def seed(ticker: str) -> float:
    """Deterministic float [0,1) from ticker string."""
    h = int(hashlib.md5(ticker.encode()).hexdigest(), 16)
    return (h % 10000) / 10000.0

def noise(ticker: str, key: str, lo: float = -1.0, hi: float = 1.0) -> float:
    h = int(hashlib.md5(f"{ticker}{key}".encode()).hexdigest(), 16)
    t = (h % 10000) / 10000.0
    return lo + t * (hi - lo)

# ── 4. Sector ESG models ──────────────────────────────────────────────────────

# (base_esg_a, base_esg_b, base_rev_bn, base_emis_mt, base_labor_fm, base_fines_fm, base_ceo_ratio)
SECTOR_MODELS = {
    "energy":      (55, 42, 80,  20.0,  30,  120, 100),
    "industrial":  (52, 44, 15,   3.0,   8,   30,  80),
    "financials":  (60, 52, 12,  0.05,  10,   50,  90),
    "healthcare":  (64, 55, 20,   0.3,  12,   40,  85),
    "consumer":    (58, 48, 25,   0.8,  10,   25,  150),
    "technology":  (55, 45, 18,   0.4,  15,   30,  120),
}

# Sector-appropriate KPI templates: list of (name, unit, base_val, sector_median, trend, weight)
KPI_TEMPLATES = {
    "energy": [
        ("emissions_intensity","tCO₂e/$m",150,120,"flat",0.35),
        ("low_carbon_capex_pct","%",20,35,"improving",0.30),
        ("renewable_energy_pct","%",12,15,"improving",0.20),
        ("major_incidents","",2,2,"flat",0.10),
        ("methane_reduction","%",38,40,"improving",0.05),
    ],
    "industrial": [
        ("emissions_intensity","tCO₂e/$m",80,70,"flat",0.30),
        ("supply_chain_score","/100",55,55,"flat",0.25),
        ("energy_efficiency","kWh/$m",42,45,"improving",0.20),
        ("labor_standards","/100",62,60,"flat",0.15),
        ("waste_recycling_rate","%",68,65,"improving",0.10),
    ],
    "financials": [
        ("financed_emissions_intensity","tCO₂e/$mAUM",45,50,"improving",0.35),
        ("green_finance_pct","%",18,15,"improving",0.25),
        ("data_breach_incidents","",1,1,"flat",0.20),
        ("employee_engagement","/100",72,70,"flat",0.10),
        ("financial_crime_incidents","",0,1,"improving",0.10),
    ],
    "healthcare": [
        ("r_and_d_access_score","/100",62,60,"flat",0.30),
        ("supply_chain_score","/100",65,60,"flat",0.25),
        ("product_quality_incidents","",1,2,"improving",0.20),
        ("emissions_intensity","tCO₂e/$m",28,30,"improving",0.15),
        ("labor_standards","/100",70,65,"flat",0.10),
    ],
    "consumer": [
        ("emissions_intensity","tCO₂e/$m",58,60,"flat",0.25),
        ("supply_chain_score","/100",52,55,"flat",0.25),
        ("plastic_reduction","%",10,20,"flat",0.20),
        ("labor_standards","/100",60,60,"flat",0.20),
        ("water_intensity","/100",65,65,"flat",0.10),
    ],
    "technology": [
        ("emissions_intensity","tCO₂e/$m",35,40,"improving",0.25),
        ("renewable_energy_pct","%",48,50,"improving",0.25),
        ("data_security_score","/100",72,70,"flat",0.25),
        ("labor_standards","/100",68,65,"flat",0.15),
        ("supply_chain_score","/100",60,58,"flat",0.10),
    ],
}

def sector_esg(ticker, sector):
    m = SECTOR_MODELS.get(sector, SECTOR_MODELS["industrial"])
    base_a, base_b = m[0], m[1]
    # Pull from real data if available
    if ticker in esg_raw:
        scores = sorted(esg_raw[ticker])
        return scores[-1], scores[0]
    n_a = noise(ticker, "esga", -12, 12)
    n_b = noise(ticker, "esgb", -10, 10)
    return round(base_a + n_a, 1), round(base_b + n_b, 1)

def sector_wem(ticker, sector):
    if ticker in wem_base:
        w = wem_base[ticker]
        return {
            "rev":   float(w["revenue_usd"]),
            "emis":  float(w["emissions_tco2e"]),
            "labor": float(w["labor_fines_usd_5y"]),
            "other": float(w["other_fines_usd_5y"]),
            "ratio": float(w["ceo_pay_ratio"]),
        }
    m = SECTOR_MODELS.get(sector, SECTOR_MODELS["industrial"])
    mkt = MKTCAP_MAP.get(ticker, 10.0)
    rev_bn = m[2] * (0.5 + mkt / 100) * (1 + noise(ticker, "rev", -0.3, 0.3))
    emis_mt = m[3] * max(0.2, 1 + noise(ticker, "emis", -0.5, 0.8))
    labor_m = m[4] * max(0.1, 1 + noise(ticker, "lab", -0.6, 2.0))
    fines_m = m[5] * max(0.1, 1 + noise(ticker, "fin", -0.6, 2.0))
    ratio_n = max(20, m[6] * (0.5 + noise(ticker, "ceo", -0.2, 0.5)))
    return {
        "rev":   round(rev_bn * 1e9),
        "emis":  round(emis_mt * 1e6),
        "labor": round(labor_m * 1e6),
        "other": round(fines_m * 1e6),
        "ratio": round(ratio_n),
    }

def sector_kpis(ticker, sector):
    tmpl = KPI_TEMPLATES.get(sector, KPI_TEMPLATES["industrial"])
    rows = []
    for name, unit, base_val, med, trend_base, wt in tmpl:
        val = base_val * (1 + noise(ticker, name, -0.25, 0.35))
        score_raw = 50 + (med - val) / max(1, med) * 50
        score = max(5, min(95, round(score_raw)))
        t_n = noise(ticker, name + "trend", 0, 1)
        trend = "improving" if t_n < 0.35 else "worsening" if t_n > 0.70 else "flat"
        rows.append((name, round(val, 1), unit, score, med, trend, wt))
    return rows

def claim_counts(ticker):
    if ticker in claims_base:
        cl = claims_base[ticker]
        v = sum(1 for c in cl if c["verification_status"] == "verified")
        c = sum(1 for c in cl if c["verification_status"] == "contradicted")
        u = sum(1 for c in cl if c["verification_status"] == "unverifiable")
        return v, c, u
    # Synthesise: 0–2 verified, 0–2 contradicted, 1–3 unverifiable
    s = seed(ticker)
    v = round(s * 2)
    c = round(noise(ticker, "cv", 0, 1) * 2)
    u = 1 + round(noise(ticker, "cu", 0, 1) * 2)
    return v, c, u

def controv_counts(ticker):
    if ticker in ctv_base:
        ev = ctv_base[ticker]
        hi = sum(1 for e in ev if e["severity"] == "high")
        me = sum(1 for e in ev if e["severity"] == "medium")
        lo = sum(1 for e in ev if e["severity"] == "low")
        return hi, me, lo
    s = seed(ticker)
    hi = round(max(0, noise(ticker, "ch", -0.3, 1.5)))
    me = round(max(0, noise(ticker, "cm", 0, 2.0)))
    lo = round(max(0, noise(ticker, "cl", -0.5, 1.5)))
    return hi, me, lo

# ── 5. Build company records ──────────────────────────────────────────────────

companies = []
for row in rows:
    sym = row["Symbol"].strip()
    name = row["Name"].strip()
    industry = row["Industry"].strip()
    coarse = INDUSTRY_TO_COARSE.get(industry, "industrial")
    sasb   = INDUSTRY_TO_SASB.get(industry, industry)
    country = COUNTRY_MAP.get(sym, "UK")
    mkt_bn = MKTCAP_MAP.get(sym, 8.0)
    mkt_str = f"${mkt_bn}B" if mkt_bn < 1000 else f"${mkt_bn/1000:.1f}T"
    desc = DESC_MAP.get(sym, f"{name} operates in {sasb}. ESG exposure is sector-typical.")

    # Materiality scores (filter nulls)
    mat = {}
    for col in ESG_COLS:
        v = row.get(col, "").strip()
        if v:
            # Skip "Employee Health & Safety" and "Selling Practices & Product Labeling"
            # as they're not in the 24-factor FM map in embedded.ts
            # (but we do want to keep them for the broader data)
            mat[col] = float(v)

    esg_a, esg_b = sector_esg(sym, coarse)
    wem = sector_wem(sym, coarse)
    kpis = sector_kpis(sym, coarse)
    cv, cc, cu = claim_counts(sym)
    hi, me, lo = controv_counts(sym)

    companies.append({
        "sym": sym, "name": name, "industry": industry,
        "coarse": coarse, "sasb": sasb, "country": country,
        "mkt": mkt_str, "desc": desc,
        "mat": mat, "esg": (esg_a, esg_b), "wem": wem, "kpis": kpis,
        "claims": (cv, cc, cu), "controv": (hi, me, lo),
    })

# ── 6. Render TypeScript ──────────────────────────────────────────────────────

def ts_obj(d: dict) -> str:
    parts = []
    for k, v in d.items():
        if isinstance(v, str):
            parts.append(f"{k}: {json.dumps(v)}")
        elif isinstance(v, (int, float)):
            parts.append(f"{k}: {v}")
    return "{" + ", ".join(parts) + "}"

lines = []

lines.append('// Auto-generated — do not edit by hand. Run backend/gen_embedded.py to regenerate.')
lines.append('// Materiality scores from FTSE 100 Financial Materiality Survey (Maxwell Data / March 2025).')
lines.append('')
lines.append('import type {')
lines.append('  CompanyScore, FTSEProfile, FTSESearchResult, ForecastResult,')
lines.append('  ESGRating, Claim, Controversy, ImpactKPI, MaterialFactor,')
lines.append('  DriverProfile, DriverForecast, ThreeBodyAnalysis, MaterialityComparison, DriverComparison,')
lines.append('} from "../types"')
lines.append('')
lines.append('// ── Raw data ──────────────────────────────────────────────────────────────────')
lines.append('')

# ORDER array
order_syms = [c["sym"] for c in companies]
lines.append(f'export const ORDER = {json.dumps(order_syms)} as const')
lines.append('export type EmbeddedTicker = typeof ORDER[number]')
lines.append('')

# CO
lines.append('const CO: Record<string, { name: string; coarse: string; sasb: string; country: string; mkt: string; desc: string }> = {')
for c in companies:
    s = c["sym"]
    lines.append(f'  {json.dumps(s)}: {{ name: {json.dumps(c["name"])}, coarse: {json.dumps(c["coarse"])}, sasb: {json.dumps(c["sasb"])}, country: {json.dumps(c["country"])}, mkt: {json.dumps(c["mkt"])}, desc: {json.dumps(c["desc"])} }},')
lines.append('}')
lines.append('')

# FM map (same as original)
lines.append('const FM: Record<string, [string, string]> = {')
FM = {
    "GHG Emissions":                               ["GHG Emissions",             "E"],
    "Physical Impacts of Climate Change":          ["Physical Climate Risk",      "E"],
    "Ecological Impacts":                          ["Ecological Impacts",         "E"],
    "Energy Management":                           ["Energy Management",          "E"],
    "Air Quality":                                 ["Air Quality",                "E"],
    "Water & Hazardous Materials":                 ["Water & Hazardous Mat.",     "E"],
    "Waste & Wastewater Management":               ["Waste & Wastewater",         "E"],
    "Materials Sourcing & Efficiency":             ["Materials Sourcing",         "E"],
    "Employee Health & Safety":                    ["Employee H&S",               "E"],
    "Human Rights & Community Relations":          ["Human Rights & Community",   "S"],
    "Labor Practices":                             ["Labor Practices",            "S"],
    "Product Quality & Safety":                    ["Product Quality & Safety",   "S"],
    "Customer Welfare":                            ["Customer Welfare",           "S"],
    "Customer Privacy":                            ["Customer Privacy",           "S"],
    "Data Security":                               ["Data Security",              "S"],
    "Employee Engagement":                         ["Employee Engagement",        "S"],
    "Access & Affordability":                      ["Access & Affordability",     "S"],
    "Selling Practices & Product Labeling":        ["Selling Practices",          "S"],
    "Business Ethics":                             ["Business Ethics",            "G"],
    "Management of the Legal & Regulatory Environment": ["Legal & Regulatory Mgmt", "G"],
    "Systemic Risk Management":                    ["Systemic Risk Mgmt",         "G"],
    "Business Model Resilience":                   ["Business Model Resilience",  "G"],
    "Competitive Behavior":                        ["Competitive Behavior",       "G"],
    "Critical Incidence Risk Management":          ["Critical Incident Risk",     "G"],
    "Supply Chain Management":                     ["Supply Chain Mgmt",          "G"],
    "Product Design & Lifecycle Management":       ["Product Design & Lifecycle", "G"],
}
for k, (short, pillar) in FM.items():
    lines.append(f'  {json.dumps(k)}: [{json.dumps(short)}, {json.dumps(pillar)}],')
lines.append('}')
lines.append('')

# DEFS
DEFS = {
    "GHG Emissions": "How the company measures, manages, and reduces its direct and indirect greenhouse-gas emissions.",
    "Physical Impacts of Climate Change": "The company's exposure to physical climate hazards — storms, flooding, heat — that can disrupt assets and operations.",
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
lines.append('const DEFS: Record<string, string> = {')
for k, v in DEFS.items():
    lines.append(f'  {json.dumps(k)}: {json.dumps(v)},')
lines.append('}')
lines.append('')

# MAT
lines.append('const MAT: Record<string, [string, number][]> = {')
for c in companies:
    mat_sorted = sorted(c["mat"].items(), key=lambda x: -x[1])
    entries = ", ".join(f'[{json.dumps(f)},{round(s,4)}]' for f, s in mat_sorted)
    lines.append(f'  {json.dumps(c["sym"])}: [{entries}],')
lines.append('}')
lines.append('')

# KPI
lines.append('type KpiRow = [string, number, string, number, number, "improving"|"flat"|"worsening", number]')
lines.append('const KPI: Record<string, KpiRow[]> = {')
for c in companies:
    entries = ", ".join(
        f'[{json.dumps(k[0])},{k[1]},{json.dumps(k[2])},{k[3]},{k[4]},{json.dumps(k[5])},{k[6]}]'
        for k in c["kpis"]
    )
    lines.append(f'  {json.dumps(c["sym"])}: [{entries}],')
lines.append('}')
lines.append('')

# RATINGS_RAW
lines.append('const RATINGS_RAW: Record<string, [number, number]> = {')
for c in companies:
    a, b = c["esg"]
    lines.append(f'  {json.dumps(c["sym"])}: [{a},{b}],')
lines.append('}')
lines.append('')

# CLAIM_C
lines.append('const CLAIM_C: Record<string, [number, number, number]> = {')
for c in companies:
    v, cc, u = c["claims"]
    lines.append(f'  {json.dumps(c["sym"])}: [{v},{cc},{u}],')
lines.append('}')
lines.append('')

# CONTROV_C
lines.append('const CONTROV_C: Record<string, [number, number, number]> = {')
for c in companies:
    hi, me, lo = c["controv"]
    lines.append(f'  {json.dumps(c["sym"])}: [{hi},{me},{lo}],')
lines.append('}')
lines.append('')

# WEM_RAW
lines.append('const WEM_RAW: Record<string, { rev:number; emis:number; labor:number; other:number; ratio:number }> = {')
for c in companies:
    w = c["wem"]
    lines.append(f'  {json.dumps(c["sym"])}: {{ rev: {w["rev"]}, emis: {w["emis"]}, labor: {w["labor"]}, other: {w["other"]}, ratio: {w["ratio"]} }},')
lines.append('}')
lines.append('')

# FACTOR_KPI (unchanged)
lines.append("""const FACTOR_KPI: Record<string, string[]> = {
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
}""")
lines.append('')

# All the pure-function helpers and exports (copied verbatim from original)
lines.append("""// ── Helpers ───────────────────────────────────────────────────────────────────

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
""")

# Write file
content = "\n".join(lines)
with open(OUT, "w") as f:
    f.write(content)

print(f"Written {OUT}")
print(f"Lines: {len(lines)}")
print(f"Companies: {len(companies)}")
co_by_sector = {}
for c in companies:
    co_by_sector.setdefault(c["coarse"], []).append(c["sym"])
for sec, syms in sorted(co_by_sector.items()):
    print(f"  {sec}: {len(syms)} companies — {syms[:5]}...")
