import AuthorizeToken from '#actions/abilities/authorize_token'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  
  async handle({ organization }: HttpContext) {
    AuthorizeToken.read(organization)

    await organization.load('difficulties')
    await organization.load('statuses')
    await organization.load('accessLevels')

    return organization
  }
  
}