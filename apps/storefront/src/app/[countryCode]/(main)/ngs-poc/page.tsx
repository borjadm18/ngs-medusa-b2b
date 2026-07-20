import Link from "next/link"
import { notFound } from "next/navigation"
import { clientProfile } from "@/lib/client-profile"

type DemoStep = {
  number: string
  title: string
  focus: string
  show: string[]
  say: string
  route?: string
  status: "ready" | "partial" | "concept"
}

const demoUsers = [
  {
    company: "Iberia Pro Installers",
    buyer: "compras+buyer@iberia-pro-installers.demo",
    approver: "compras+approver@iberia-pro-installers.demo",
    role: "Cliente aprobado, credito 30 dias",
  },
  {
    company: "Distribuciones Norte Audio",
    buyer: "pedidos+buyer@dnaudio.demo",
    approver: "pedidos+approver@dnaudio.demo",
    role: "Distribuidor aprobado, credito 60 dias",
  },
  {
    company: "Retail Campus Group",
    buyer: "it-procurement+buyer@retail-campus.demo",
    approver: "it-procurement+approver@retail-campus.demo",
    role: "Empresa pendiente, transferencia bancaria",
  },
]

const priceComparison = [
  {
    sku: "NGS-WILD-BASH-COMPACT-BLK",
    product: "WILD BASH COMPACT",
    publicPrice: "Acceso requerido",
    iberia: "87,20 EUR",
    dnaudio: "79,95 EUR",
    condition: "Caja 6 uds",
  },
  {
    sku: "NGS-XPRESSCAM-1080-BLK",
    product: "XPRESSCAM 1080",
    publicPrice: "Acceso requerido",
    iberia: "47,92 EUR",
    dnaudio: "44,90 EUR",
    condition: "Caja 24 uds",
  },
  {
    sku: "NGS-FUNKY-KIT-BLK",
    product: "FUNKY KIT",
    publicPrice: "Acceso requerido",
    iberia: "18,90 EUR",
    dnaudio: "17,50 EUR",
    condition: "Min. 12 uds",
  },
]

const workflowStages = [
  {
    title: "Solicitud",
    body: "La empresa se registra con datos fiscales y comerciales.",
    owner: "Cliente",
  },
  {
    title: "Revision",
    body: "El equipo valida CIF, sector, canal, riesgo y condiciones.",
    owner: "Comercial",
  },
  {
    title: "Tarifa",
    body: "Se asigna precio, reglas de catalogo, pago y limites de compra.",
    owner: "Admin",
  },
  {
    title: "Acceso",
    body: "El cliente ve precios privados, compra, solicita quotes y repite pedidos.",
    owner: "Portal",
  },
]

const approvalScenario = [
  {
    label: "Comprador",
    value: "Prepara carrito y supera limite",
  },
  {
    label: "Estado",
    value: "Pedido pendiente de aprobacion",
  },
  {
    label: "Aprobador",
    value: "Revisa, aprueba o rechaza",
  },
  {
    label: "Resultado",
    value: "Checkout queda desbloqueado",
  },
]

const quoteChecklist = [
  "Hay 2 presupuestos pending_customer para aceptar en demo.",
  "El smoke revisa preview y detalle antes de aceptar.",
  "Aceptar una quote consume el escenario: resembrar o preparar otra antes de demo externa.",
]

const integrationSystems = [
  {
    name: "ERP",
    responsibility: "Pedidos, facturacion, credito y stock maestro",
  },
  {
    name: "CRM",
    responsibility: "Cuenta, oportunidad, actividad comercial y seguimiento",
  },
  {
    name: "PIM",
    responsibility: "Catalogo enriquecido, atributos, fichas y documentacion",
  },
  {
    name: "WMS",
    responsibility: "Disponibilidad, preparacion, expediciones y tracking",
  },
]

const demoSteps: DemoStep[] = [
  {
    number: "0",
    title: "El problema actual",
    focus: "Crear identificacion con el cliente.",
    show: ["Email de pedido", "Excel de tarifas", "ERP", "Storefront B2B"],
    say: "Muchas empresas ya tienen ERP, CRM y sistemas internos, pero la relacion comercial sigue dependiendo de emails, llamadas y tareas manuales. La pregunta es: que parte de este proceso podria gestionar directamente el cliente.",
    route: "/store",
    status: "ready",
  },
  {
    number: "1",
    title: "Catalogo digital",
    focus: "El cliente encuentra informacion sin depender del comercial.",
    show: ["Categorias", "Producto", "Documentacion", "Precio oculto"],
    say: "El catalogo puede ser publico. Lo que no tiene por que ser publico son las condiciones comerciales.",
    route: "/store",
    status: "ready",
  },
  {
    number: "2",
    title: "Registro de empresa",
    focus: "El alta de nuevos clientes puede ser autoservicio.",
    show: ["Formulario", "Solicitud", "Aprobacion"],
    say: "Un nuevo cliente puede solicitar acceso sin depender de intercambios de correos. La empresa mantiene control sobre quien accede y en que condiciones.",
    route: "/account?view=register",
    status: "ready",
  },
  {
    number: "3",
    title: "Cuenta de empresa",
    focus: "En B2B el cliente es una organizacion.",
    show: ["Empresa", "Usuarios", "Direcciones", "Historial"],
    say: "En B2C hablamos de usuarios. En B2B hablamos de empresas, equipos, direcciones, historial y condiciones comerciales.",
    route: "/account/company",
    status: "ready",
  },
  {
    number: "4",
    title: "Roles y aprobaciones",
    focus: "La plataforma refleja la estructura de compra del cliente.",
    show: ["Comprador", "Aprobador", "Pedido pendiente", "Aprobacion"],
    say: "No todas las personas pueden comprar lo mismo. Muchas empresas tienen limites, aprobaciones y responsabilidades distintas.",
    route: "/account/approvals",
    status: "ready",
  },
  {
    number: "5",
    title: "Condiciones comerciales",
    focus: "Cada cliente ve sus propias condiciones.",
    show: ["Mismo producto", "Dos clientes", "Dos precios"],
    say: "En B2B no existe un unico precio. Cada cliente puede tener condiciones negociadas diferentes y la plataforma las aplica automaticamente.",
    route: "/store",
    status: "ready",
  },
  {
    number: "6",
    title: "Quick Order",
    focus: "Comprar rapido.",
    show: ["Busqueda por SKU", "Varias referencias", "Pedido masivo"],
    say: "Un comprador profesional normalmente ya sabe que necesita. Quiere introducir referencias, cantidades y generar el pedido rapidamente.",
    route: "/account/quick-order",
    status: "ready",
  },
  {
    number: "7",
    title: "Solicitud de presupuesto",
    focus: "Digitalizar la negociacion.",
    show: ["Carrito", "Solicitar presupuesto", "Revision", "Conversion a pedido"],
    say: "No todas las compras son inmediatas. El presupuesto deja de vivir en emails y pasa a formar parte del proceso digital.",
    route: "/account/quotes",
    status: "ready",
  },
  {
    number: "8",
    title: "Checkout B2B",
    focus: "El pedido recoge toda la informacion operativa.",
    show: ["Direccion", "PO Number", "Condiciones de pago", "Confirmacion"],
    say: "Una empresa no compra igual que un consumidor. Necesita indicar donde entregar, como facturar y en que condiciones comprar.",
    route: "/cart",
    status: "ready",
  },
  {
    number: "9",
    title: "Reorder",
    focus: "La mayoria de compras B2B son recurrentes.",
    show: ["Historial", "Repetir pedido", "Confirmar"],
    say: "El cliente no deberia reconstruir un pedido desde cero cada vez. Puede reutilizar pedidos anteriores y ajustarlos si es necesario.",
    route: "/account/orders",
    status: "ready",
  },
  {
    number: "10",
    title: "Workflows",
    focus: "Automatizar procesos.",
    show: ["Solicitud", "Aprobacion", "Tarifa asignada", "Acceso concedido"],
    say: "Lo importante no es unicamente digitalizar pantallas. Tambien es digitalizar procesos.",
    route: "/account/company",
    status: "ready",
  },
  {
    number: "11",
    title: "Integraciones",
    focus: "El ecommerce forma parte del ecosistema.",
    show: ["ERP", "CRM", "PIM", "WMS"],
    say: "El ecommerce no sustituye a los sistemas existentes. Se conecta con ellos y cada sistema mantiene su responsabilidad.",
    status: "ready",
  },
  {
    number: "12",
    title: "Extensibilidad",
    focus: "Aqui brilla Medusa.",
    show: ["Procesos propios", "Campos propios", "Integraciones"],
    say: "Ninguna empresa funciona exactamente igual. La plataforma debe adaptarse al negocio, no obligar al negocio a adaptarse a una herramienta cerrada.",
    status: "ready",
  },
]

const statusLabel = {
  ready: "Listo para mostrar",
  partial: "Mostrar con contexto",
  concept: "Explicar como arquitectura",
}

const statusClassName = {
  ready: "border-green-200 bg-green-50 text-green-800",
  partial: "border-amber-200 bg-amber-50 text-amber-800",
  concept: "border-neutral-200 bg-neutral-100 text-neutral-700",
}

export default async function NgsPocPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  if (clientProfile.id !== "ngs") {
    notFound()
  }

  const { countryCode } = await props.params

  return (
    <main className="bg-white text-neutral-950">
      <section className="border-b border-neutral-200 bg-neutral-950 text-white">
        <div className="content-container grid gap-8 py-10 small:grid-cols-[1fr_360px] small:py-14">
          <div>
            <p className="text-small-semi uppercase tracking-normal text-red-300">
              Demo B2B playbook
            </p>
            <h1 className="mt-3 max-w-4xl text-[38px] font-semibold leading-tight small:text-[58px]">
              Digitalizar la relacion comercial B2B, no solo montar una tienda.
            </h1>
            <p className="mt-5 max-w-3xl text-base-regular leading-7 text-neutral-300">
              Este guion convierte el POC de Medusa en una demo clara: problema,
              pantalla e impacto. La reunion debe demostrar catalogo,
              condiciones comerciales, negociacion, compra, automatizacion e
              integracion como un unico proceso.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={`/${countryCode}/store`}
                className="rounded border border-white bg-white px-4 py-2 text-small-semi text-neutral-950"
              >
                Abrir catalogo
              </Link>
              <Link
                href={`/${countryCode}/account/quotes`}
                className="rounded border border-white/30 px-4 py-2 text-small-semi text-white"
              >
                Ver presupuestos
              </Link>
            </div>
          </div>

          <aside className="rounded-lg border border-white/15 bg-white/10 p-5">
            <p className="text-small-semi uppercase tracking-normal text-neutral-300">
              Regla de oro
            </p>
            <div className="mt-4 grid gap-3">
              <PlaybookFormula label="Problema" value="Que duele hoy" />
              <PlaybookFormula label="Mostrar" value="Pantalla o flujo" />
              <PlaybookFormula label="Impacto" value="Que cambia para negocio" />
            </div>
          </aside>
        </div>
      </section>

      <section className="content-container grid gap-4 py-8 small:grid-cols-3">
        {demoUsers.map((user) => (
          <div
            key={user.company}
            className="rounded-lg border border-neutral-200 bg-neutral-50 p-4"
          >
            <p className="text-small-semi text-neutral-950">{user.company}</p>
            <p className="mt-2 text-small-regular text-neutral-600">
              {user.role}
            </p>
            <div className="mt-4 grid gap-1 text-[12px] text-neutral-700">
              <p>
                <span className="font-semibold">Comprador:</span> {user.buyer}
              </p>
              <p>
                <span className="font-semibold">Aprobador:</span>{" "}
                {user.approver}
              </p>
              <p>
                <span className="font-semibold">Password:</span> Demo123!
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="content-container grid gap-6 py-10">
          <div className="grid gap-3 small:grid-cols-[1fr_420px] small:items-end">
            <div>
              <p className="text-small-semi uppercase tracking-normal text-red-700">
                Condiciones comerciales
              </p>
              <h2 className="mt-1 text-2xl-semi">
                Mismo producto, dos empresas, dos condiciones
              </h2>
              <p className="mt-3 max-w-3xl text-base-regular leading-7 text-neutral-700">
                En B2B el catalogo puede ser el mismo, pero el precio, el
                minimo de compra, la unidad logistica y las condiciones de pago
                cambian por relacion comercial. Esta vista permite contarlo en
                30 segundos sin cambiar de sesion.
              </p>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase text-neutral-500">
                Mensaje para la demo
              </p>
              <p className="mt-2 text-small-regular leading-6 text-neutral-700">
                Lo importante no es ocultar precios. Lo importante es que cada
                cliente vea automaticamente sus condiciones negociadas y compre
                con las reglas operativas correctas.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full min-w-[860px] text-left text-small-regular">
              <thead className="border-b border-neutral-200 bg-white text-[11px] font-semibold uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Visitante publico</th>
                  <th className="px-4 py-3">Iberia Pro Installers</th>
                  <th className="px-4 py-3">Distribuciones Norte Audio</th>
                  <th className="px-4 py-3">Regla operativa</th>
                </tr>
              </thead>
              <tbody>
                {priceComparison.map((row) => (
                  <tr key={row.sku} className="border-b border-neutral-100">
                    <td className="px-4 py-4 font-mono text-[12px] text-neutral-700">
                      {row.sku}
                    </td>
                    <td className="px-4 py-4 font-semibold text-neutral-950">
                      {row.product}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded border border-red-200 bg-red-50 px-2 py-1 text-[12px] font-semibold text-red-800">
                        {row.publicPrice}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-neutral-950">
                        {row.iberia}
                      </p>
                      <p className="mt-1 text-[12px] text-neutral-500">
                        Credito 30 dias
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-neutral-950">
                        {row.dnaudio}
                      </p>
                      <p className="mt-1 text-[12px] text-neutral-500">
                        Credito 60 dias
                      </p>
                    </td>
                    <td className="px-4 py-4 text-neutral-700">
                      {row.condition}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 small:grid-cols-3">
            <ComparisonCard
              title="Precio publico"
              body="El visitante ve producto, documentacion y disponibilidad, pero no condiciones comerciales."
            />
            <ComparisonCard
              title="Precio negociado"
              body="Cada empresa puede tener tarifa, descuento, canal y condiciones de pago propias."
            />
            <ComparisonCard
              title="Regla operativa"
              body="La compra respeta cajas, minimos, multiplos y flujo de presupuesto cuando aplica."
            />
          </div>
        </div>
      </section>

      <section className="content-container grid gap-6 py-10">
        <div className="grid gap-3 small:grid-cols-[1fr_360px] small:items-end">
          <div>
            <p className="text-small-semi uppercase tracking-normal text-red-700">
              Workflow de alta B2B
            </p>
            <h2 className="mt-1 text-2xl-semi">
              Solicitud, aprobacion, tarifa y acceso en un solo proceso
            </h2>
            <p className="mt-3 max-w-3xl text-base-regular leading-7 text-neutral-700">
              Este es el bloque que conecta storefront y backoffice. La demo no
              vende una pantalla de registro: vende control comercial sin
              volver al email.
            </p>
          </div>
          <Link
            href={`/${countryCode}/account?view=register`}
            className="inline-flex w-fit rounded border border-neutral-950 bg-neutral-950 px-4 py-2 text-small-semi text-white"
          >
            Abrir registro
          </Link>
        </div>

        <div className="grid gap-3 medium:grid-cols-4">
          {workflowStages.map((stage, index) => (
            <article
              key={stage.title}
              className="rounded-lg border border-neutral-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-small-semi">
                  {index + 1}
                </span>
                <span className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-[11px] font-semibold text-neutral-600">
                  {stage.owner}
                </span>
              </div>
              <h3 className="mt-4 text-large-semi">{stage.title}</h3>
              <p className="mt-2 text-small-regular leading-6 text-neutral-600">
                {stage.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="content-container grid gap-6 py-10 small:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-small-semi uppercase tracking-normal text-red-700">
              Roles y aprobaciones
            </p>
            <h2 className="mt-1 text-xl-semi">
              Caso preparado para ensenar jerarquia de compra
            </h2>
            <div className="mt-5 grid gap-3">
              {approvalScenario.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-2 rounded border border-neutral-200 bg-neutral-50 p-3 small:grid-cols-[130px_1fr]"
                >
                  <p className="text-small-semi text-neutral-950">
                    {item.label}
                  </p>
                  <p className="text-small-regular text-neutral-600">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={`/${countryCode}/account/approvals`}
              className="mt-5 inline-flex rounded border border-neutral-950 bg-neutral-950 px-4 py-2 text-small-semi text-white"
            >
              Abrir aprobaciones
            </Link>
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-small-semi uppercase tracking-normal text-red-700">
              Accept quote
            </p>
            <h2 className="mt-1 text-xl-semi">
              Presupuesto listo para convertir a pedido
            </h2>
            <ul className="mt-5 grid gap-3">
              {quoteChecklist.map((item) => (
                <li
                  key={item}
                  className="rounded border border-neutral-200 bg-neutral-50 p-3 text-small-regular leading-6 text-neutral-700"
                >
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/${countryCode}/account/quotes`}
              className="mt-5 inline-flex rounded border border-neutral-950 bg-neutral-950 px-4 py-2 text-small-semi text-white"
            >
              Abrir presupuestos
            </Link>
          </div>
        </div>
      </section>

      <section className="content-container grid gap-6 py-10">
        <div>
          <p className="text-small-semi uppercase tracking-normal text-red-700">
            Integraciones
          </p>
          <h2 className="mt-1 text-2xl-semi">
            El ecommerce se conecta al ecosistema, no lo sustituye
          </h2>
          <p className="mt-3 max-w-3xl text-base-regular leading-7 text-neutral-700">
            Para demo no necesitamos integrar cada sistema. Necesitamos mostrar
            que Medusa puede actuar como capa ecommerce entre sistemas que ya
            existen en industria.
          </p>
        </div>

        <div className="grid gap-3 medium:grid-cols-[1fr_180px_1fr]">
          <div className="grid gap-3">
            {integrationSystems.slice(0, 2).map((system) => (
              <IntegrationCard key={system.name} {...system} />
            ))}
          </div>
          <div className="flex items-center justify-center rounded-lg border border-neutral-950 bg-neutral-950 p-5 text-center text-large-semi text-white">
            Medusa B2B
          </div>
          <div className="grid gap-3">
            {integrationSystems.slice(2).map((system) => (
              <IntegrationCard key={system.name} {...system} />
            ))}
          </div>
        </div>
      </section>

      <section className="content-container pb-12">
        <div className="mb-5 flex flex-col gap-2 small:flex-row small:items-end small:justify-between">
          <div>
            <p className="text-small-semi uppercase tracking-normal text-red-700">
              Recorrido recomendado
            </p>
            <h2 className="mt-1 text-2xl-semi">
              13 bloques para una demo B2B industrial
            </h2>
          </div>
          <p className="max-w-xl text-small-regular text-neutral-600">
            No hace falta mostrar todo con la misma profundidad. La clave es
            mantener ritmo y volver siempre a problema, pantalla e impacto.
          </p>
        </div>

        <div className="grid gap-3">
          {demoSteps.map((step) => (
            <article
              key={step.number}
              className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 small:grid-cols-[72px_1fr_260px]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-xl-semi">
                {step.number}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-large-semi">{step.title}</h3>
                  <span
                    className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusClassName[step.status]}`}
                  >
                    {statusLabel[step.status]}
                  </span>
                </div>
                <p className="mt-2 text-small-semi text-neutral-700">
                  {step.focus}
                </p>
                <p className="mt-3 max-w-4xl text-small-regular leading-6 text-neutral-600">
                  {step.say}
                </p>
              </div>
              <div className="grid content-start gap-3 rounded border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-[11px] font-semibold uppercase text-neutral-500">
                  Mostrar
                </p>
                <ul className="grid gap-1 text-small-regular text-neutral-700">
                  {step.show.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
                {step.route && (
                  <Link
                    href={`/${countryCode}${step.route}`}
                    className="mt-2 inline-flex w-fit rounded border border-neutral-950 bg-neutral-950 px-3 py-2 text-small-semi text-white"
                  >
                    Abrir pantalla
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 bg-neutral-50">
        <div className="content-container grid gap-6 py-10 small:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-xl-semi">Cierre recomendado</h2>
            <p className="mt-3 text-base-regular leading-7 text-neutral-700">
              Lo que hemos visto no es una tienda online. Es la digitalizacion
              de la relacion comercial entre una empresa y sus clientes:
              catalogo, condiciones comerciales, negociacion, compra,
              automatizacion e integracion trabajando como un unico proceso.
            </p>
          </div>
          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h2 className="text-xl-semi">Prioridad despues de la demo</h2>
            <ul className="mt-3 grid gap-2 text-base-regular text-neutral-700">
              <li>- Ejecutar smoke de accept quote antes de ensenar.</li>
              <li>- Mantener un presupuesto pendiente de cliente disponible.</li>
              <li>- Entrar como comprador y aprobador antes de grabar.</li>
              <li>- Usar B2B Control como cierre comercial de la demo.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}

function PlaybookFormula({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-white/15 bg-neutral-950/40 p-3">
      <p className="text-[11px] font-semibold uppercase text-red-200">
        {label}
      </p>
      <p className="mt-1 text-small-regular text-white">{value}</p>
    </div>
  )
}

function ComparisonCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h3 className="text-large-semi">{title}</h3>
      <p className="mt-2 text-small-regular leading-6 text-neutral-600">
        {body}
      </p>
    </div>
  )
}

function IntegrationCard({
  name,
  responsibility,
}: {
  name: string
  responsibility: string
}) {
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-large-semi">{name}</p>
      <p className="mt-2 text-small-regular leading-6 text-neutral-600">
        {responsibility}
      </p>
    </article>
  )
}
