import Link from "next/link"
import { notFound } from "next/navigation"
import { clientProfile } from "@/lib/client-profile"

const catalogue = [
  {
    sku: "NGS-WILD-SPACE-3",
    name: "WILD SPACE 3",
    family: "Audio | Video",
    stock: "420 units",
    eta: "48/72h",
    retail: "339.00 EUR",
    b2b: "271.20 EUR",
  },
  {
    sku: "NGS-WILD-BASH-COMPACT",
    name: "WILD BASH COMPACT",
    family: "Audio | Video",
    stock: "1,180 units",
    eta: "24/48h",
    retail: "109.00 EUR",
    b2b: "87.20 EUR",
  },
  {
    sku: "NGS-ROLLER-FURIA-2-BLK",
    name: "ROLLER FURIA 2 BLACK",
    family: "Audio | Video",
    stock: "2,450 units",
    eta: "Immediate",
    retail: "39.99 EUR",
    b2b: "31.99 EUR",
  },
  {
    sku: "NGS-HUB-PRO-7",
    name: "HUB PRO 7",
    family: "PC Accessories",
    stock: "610 units",
    eta: "48/72h",
    retail: "49.90 EUR",
    b2b: "39.92 EUR",
  },
  {
    sku: "NGS-WEBCAM-1080-PRO",
    name: "WEBCAM 1080 PRO",
    family: "PC Accessories",
    stock: "320 units",
    eta: "48/72h",
    retail: "59.90 EUR",
    b2b: "47.92 EUR",
  },
]

const b2bCapabilities = [
  "Company accounts and buyer roles",
  "Contract pricing by distributor",
  "Private catalogues by market",
  "Quick order by SKU or CSV",
  "Quote request for volume deals",
  "Approval rules by order amount",
  "Real-time stock and lead time",
  "ERP/PIM integration ready",
]

const quickOrderRows = [
  ["NGS-WILD-BASH-COMPACT", "240", "87.20 EUR", "20,928.00 EUR"],
  ["NGS-ROLLER-FURIA-2-BLK", "600", "31.99 EUR", "19,194.00 EUR"],
  ["NGS-HUB-PRO-7", "180", "39.92 EUR", "7,185.60 EUR"],
]

export default async function NgsPocPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  if (clientProfile.id !== "ngs") {
    notFound()
  }

  const { countryCode } = await props.params

  return (
    <main className="bg-[#f7f7f3] text-neutral-950">
      <section className="border-b border-neutral-200 bg-white">
        <div className="content-container grid gap-10 py-12 small:grid-cols-[1.15fr_0.85fr] small:py-16">
          <div className="flex flex-col justify-center gap-7">
            <div className="flex flex-wrap items-center gap-3 text-small-semi uppercase tracking-normal text-neutral-600">
              <span className="rounded-full border border-neutral-300 px-3 py-1">
                Medusa B2B POC
              </span>
              <span>NGS distributor portal</span>
            </div>
            <div className="max-w-3xl">
              <h1 className="text-[42px] font-semibold leading-[1.05] small:text-[64px]">
                NGS wholesale commerce, built around accounts, stock and speed.
              </h1>
              <p className="mt-6 max-w-2xl text-large-regular text-neutral-700">
                A focused proof of concept for distributors and corporate buyers:
                contract pricing, quick replenishment, quote requests, approval
                flows and ERP-ready inventory.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${countryCode}/store`}
                className="rounded-full bg-neutral-950 px-5 py-3 text-small-semi text-white"
              >
                View live catalogue
              </Link>
              <Link
                href={`/${countryCode}/account`}
                className="rounded-full border border-neutral-300 px-5 py-3 text-small-semi"
              >
                Open B2B account area
              </Link>
            </div>
          </div>

          <div className="grid content-start gap-4">
            <div className="rounded-lg border border-neutral-200 bg-[#101820] p-5 text-white">
              <p className="text-small-semi uppercase tracking-normal text-[#93c5fd]">
                Demo account
              </p>
              <h2 className="mt-3 text-xl-semi">Iberia Retail Distribution</h2>
              <div className="mt-6 grid grid-cols-2 gap-3 text-small-regular">
                <Metric label="Role" value="Distributor" />
                <Metric label="Price list" value="Gold -20%" />
                <Metric label="Credit limit" value="75,000 EUR" />
                <Metric label="Approval" value="Over 10,000 EUR" />
              </div>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-5">
              <p className="text-small-semi uppercase tracking-normal text-neutral-500">
                Why this matters
              </p>
              <p className="mt-3 text-base-regular text-neutral-700">
                NGS already exposes catalogue, cart, stock, payments and several
                markets online. The POC shows how Medusa adds the B2B layer:
                accounts, negotiated pricing, approvals, quotes and operational
                integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="content-container py-10">
        <div className="grid gap-3 small:grid-cols-4">
          {b2bCapabilities.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-4 text-small-semi"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="content-container grid gap-6 pb-12 small:grid-cols-[1fr_420px]">
        <div className="rounded-lg border border-neutral-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-neutral-200 p-5 small:flex-row small:items-end small:justify-between">
            <div>
              <p className="text-small-semi uppercase tracking-normal text-neutral-500">
                Contract catalogue
              </p>
              <h2 className="mt-2 text-xl-semi">Products with B2B price and availability</h2>
            </div>
            <span className="text-small-regular text-neutral-500">
              Source families mirror NGS public catalogue.
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-small-regular">
              <thead className="bg-neutral-50 text-small-semi text-neutral-500">
                <tr>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Family</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">ETA</th>
                  <th className="px-5 py-3">Retail</th>
                  <th className="px-5 py-3">B2B</th>
                </tr>
              </thead>
              <tbody>
                {catalogue.map((item) => (
                  <tr key={item.sku} className="border-t border-neutral-100">
                    <td className="px-5 py-4 font-mono text-[12px]">{item.sku}</td>
                    <td className="px-5 py-4 text-small-semi">{item.name}</td>
                    <td className="px-5 py-4">{item.family}</td>
                    <td className="px-5 py-4">{item.stock}</td>
                    <td className="px-5 py-4">{item.eta}</td>
                    <td className="px-5 py-4 text-neutral-500">{item.retail}</td>
                    <td className="px-5 py-4 text-small-semi">{item.b2b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-small-semi uppercase tracking-normal text-neutral-500">
              Quick order
            </p>
            <h2 className="mt-2 text-xl-semi">CSV or SKU replenishment</h2>
            <div className="mt-5 grid gap-3">
              {quickOrderRows.map(([sku, qty, price, total]) => (
                <div
                  key={sku}
                  className="grid grid-cols-[1fr_56px] gap-3 rounded-md border border-neutral-200 p-3"
                >
                  <div>
                    <p className="font-mono text-[12px]">{sku}</p>
                    <p className="mt-1 text-small-regular text-neutral-500">
                      {price} per unit
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-small-semi">{qty}</p>
                    <p className="mt-1 text-[11px] text-neutral-500">units</p>
                  </div>
                  <p className="col-span-2 border-t border-neutral-100 pt-3 text-small-semi">
                    {total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#f4c430] bg-[#fff9db] p-5">
            <p className="text-small-semi uppercase tracking-normal text-[#8a6d00]">
              Approval triggered
            </p>
            <h2 className="mt-2 text-xl-semi">Order total: 47,307.60 EUR</h2>
            <p className="mt-3 text-base-regular text-neutral-700">
              This cart exceeds the distributor threshold. Medusa routes it to a
              sales manager, keeps the cart locked, and logs the approval history.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-white">
        <div className="content-container grid gap-6 py-10 small:grid-cols-3">
          <DemoColumn
            title="RFQ to order"
            body="For large speaker or accessory bundles, the buyer can request a quote, negotiate with sales, and convert the accepted quote to an order."
          />
          <DemoColumn
            title="ERP and PIM fit"
            body="Products, prices, stock, customers, orders and invoices can be owned by external systems while Medusa orchestrates commerce workflows."
          />
          <DemoColumn
            title="Multi-market storefront"
            body="The current NGS footprint across languages and regions maps naturally to Medusa regions, sales channels and publishable API keys."
          />
        </div>
      </section>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-3">
      <p className="text-[11px] uppercase text-white/60">{label}</p>
      <p className="mt-1 text-small-semi">{value}</p>
    </div>
  )
}

function DemoColumn({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-[#f7f7f3] p-5">
      <h3 className="text-large-semi">{title}</h3>
      <p className="mt-3 text-base-regular text-neutral-700">{body}</p>
    </div>
  )
}
