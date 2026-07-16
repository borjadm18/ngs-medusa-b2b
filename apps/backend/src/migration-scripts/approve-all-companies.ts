import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "../modules/company";

const DEMO_LOGIN_EMAILS = [
  "compras+buyer@iberia-pro-installers.demo",
  "compras+approver@iberia-pro-installers.demo",
  "pedidos+buyer@dnaudio.demo",
  "pedidos+approver@dnaudio.demo",
  "it-procurement+buyer@retail-campus.demo",
  "it-procurement+approver@retail-campus.demo",
];

export default async function approve_all_companies({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const companyModule = container.resolve<any>(COMPANY_MODULE);
  const customerModule = container.resolve<any>(Modules.CUSTOMER);

  const companies = await companyModule.listCompanies({});
  const pendingCompanies = companies.filter(
    (company: any) => company.onboarding_status !== "approved"
  );

  for (const company of pendingCompanies) {
    await companyModule.updateCompanies({
      id: company.id,
      onboarding_status: "approved",
    });
  }

  if (pendingCompanies.length) {
    logger.info(`Approved ${pendingCompanies.length} companies.`);
  } else {
    logger.info("No companies pending approval.");
  }

  const { data: providerIdentities } = await query.graph({
    entity: "provider_identity",
    fields: ["entity_id"],
    filters: {
      provider: "emailpass",
    },
    pagination: {
      take: 1000,
      skip: 0,
    },
  });

  const loginEmails = new Set<string>([
    ...DEMO_LOGIN_EMAILS,
    ...providerIdentities
      .map((identity: any) => identity.entity_id)
      .filter(Boolean),
  ]);

  const customers = await customerModule.listCustomers({
    email: Array.from(loginEmails),
  });
  const customersWithoutAccount = customers.filter(
    (customer: any) => customer.has_account === false
  );

  for (const customer of customersWithoutAccount) {
    await customerModule.updateCustomers({
      id: customer.id,
      has_account: true,
    });
  }

  logger.info(`Validated ${customersWithoutAccount.length} customer accounts.`);
}
