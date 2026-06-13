import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts"

export interface PriceData {
  ticker: string
  price: number
  currency: string
  change_1d: number
  change_1d_pct: number
  change_1m_pct: number
  sparkline_6m: number[]
  as_of: string
  source?: string
}

interface Props {
  data: PriceData
  compact?: boolean
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£", USD: "$", EUR: "€", DKK: "kr", CHF: "Fr",
}

function formatPrice(price: number, currency: string): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? ""
  if (currency === "GBP") return `${sym}${price.toFixed(2)}`
  return `${sym}${price.toFixed(2)}`
}

function ChangeChip({ pct, label }: { pct: number; label: string }) {
  const positive = pct >= 0
  return (
    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
      positive ? "bg-forest-100 text-forest-800" : "bg-red-50 text-red-700"
    }`}>
      <span>{positive ? "▲" : "▼"}</span>
      <span>{Math.abs(pct).toFixed(1)}%</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  )
}

export function PriceWidget({ data, compact = false }: Props) {
  const sparkData = (data.sparkline_6m ?? []).map((v, i) => ({ i, v }))
  const isUp = data.change_1d_pct >= 0
  const strokeColor = isUp ? "#16a34a" : "#dc2626"

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div>
          <p className="text-lg font-bold text-gray-900 leading-none">
            {formatPrice(data.price, data.currency)}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{data.currency}</p>
        </div>
        <ChangeChip pct={data.change_1d_pct} label="today" />
        {data.change_1m_pct !== undefined && (
          <ChangeChip pct={data.change_1m_pct} label="1m" />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">
          {formatPrice(data.price, data.currency)}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{data.currency} · {data.as_of}</p>
      </div>
      <div className="flex gap-2">
        <ChangeChip pct={data.change_1d_pct} label="today" />
        <ChangeChip pct={data.change_1m_pct} label="1 month" />
      </div>
      {sparkData.length > 0 && (
        <div className="w-28 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={strokeColor}
                strokeWidth={1.5}
                dot={false}
              />
              <Tooltip
                content={() => null}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {data.source === "static" && (
        <span className="text-xs text-gray-400 italic">indicative</span>
      )}
    </div>
  )
}
