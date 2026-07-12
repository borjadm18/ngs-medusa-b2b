import { clientProfile } from "@/lib/client-profile"
import { listRegions } from "@/lib/data/regions"
import LoginTemplate from "@/modules/account/templates/login-template"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Log in",
  description: `Accede a tu cuenta B2B ${clientProfile.brand.name}.`,
}

export default async function Login() {
  const regions = await listRegions()

  return <LoginTemplate regions={regions} />
}
