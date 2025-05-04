import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  
  async handle({ organization }: HttpContext) {
    await organization.load('difficulties')
    await organization.load('statuses')
    await organization.load('accessLevels')

    return organization
  }
  
}