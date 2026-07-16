import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { COMPANY_MODULE } from "../modules/company";

export default async function approve_all_companies({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const companyModule = container.resolve<any>(COMPANY_MODULE);

  const companies = await companyModule.listCompanies({});
  const pendingCompanies = companies.filter(
    (company: any) => company.onboarding_status !== "approved"
  );

  if (!pendingCompanies.length) {
    logger.info("No companies pending approval.");
    return;
  }

  for (const company of pendingCompanies) {
    await companyModule.updateCompanies({
      id: company.id,
      onboarding_status: "approved",
    });
  }

  logger.info(`Approved ${pendingCompanies.length} companies.`);
}
