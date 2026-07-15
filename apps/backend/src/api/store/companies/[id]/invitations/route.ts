import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/core-flows";
import { createEmployeesWorkflow } from "../../../../../workflows/employee/workflows";
import type { StoreInviteEmployeeType } from "../../validators";

export const POST = async (
  req: MedusaRequest<StoreInviteEmployeeType>,
  res: MedusaResponse
) => {
  const { id: companyId } = req.params;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const customerModule = req.scope.resolve<any>(Modules.CUSTOMER);
  const { email, first_name, last_name, role, spending_limit } =
    req.validatedBody;

  const [existingCustomer] = await customerModule.listCustomers({ email });
  const customer =
    existingCustomer ||
    (
      await createCustomersWorkflow(req.scope).run({
        input: {
          customersData: [
            {
              email,
              first_name: first_name || "Invitado",
              last_name: last_name || "B2B",
              has_account: false,
              metadata: {
                invited_from_company_id: companyId,
                b2b_role: role,
              },
            },
          ],
        },
      })
    ).result[0];

  const { result: createdEmployee } = await createEmployeesWorkflow.run({
    container: req.scope,
    input: {
      customerId: customer.id,
      employeeData: {
        company_id: companyId,
        customer_id: customer.id,
        spending_limit: spending_limit || 0,
        is_admin: role === "company_admin",
        role,
        status: "invited",
        invitation_email: email,
        invitation_token: `invite-${customer.id}`,
        invited_at: new Date(),
      },
    },
  });

  const {
    data: [employee],
  } = await query.graph(
    {
      entity: "employee",
      fields: req.queryConfig.fields,
      filters: { id: createdEmployee.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ employee });
};
