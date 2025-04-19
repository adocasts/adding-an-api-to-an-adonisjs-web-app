import Organization from "#models/organization"
import { apiAccessTokenValidator } from "#validators/setting"
import { Infer } from "@vinejs/vine/types"

type Params = {
  organization: Organization
  data: Infer<typeof apiAccessTokenValidator>
}

export default class StoreApiAccessToken {
  static async handle({ organization, data }: Params) {
    return Organization.accessTokens.create(organization, data.permissions, {
      name: data.name
    })
  }
}