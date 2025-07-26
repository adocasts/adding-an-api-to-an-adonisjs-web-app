import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyAccessLevel from '#actions/access_levels/destroy_access_level'
import StoreAccessLevel from '#actions/access_levels/store_access_level'
import UpdateAccessLevel from '#actions/access_levels/update_access_level'
import { accessLevelDestroyValidator, accessLevelValidator } from '#validators/access_level'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import type { HttpContext } from '@adonisjs/core/http'

export default class AccessLevelsController {
  /**
   * Display a list of resource
   */
  async index({ organization }: HttpContext) {
    AuthorizeToken.read(organization)
    return organization.related('accessLevels').query().orderBy('order')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(accessLevelValidator)
    const accessLevel = await StoreAccessLevel.handle({ organization, data })

    return accessLevel
  }

  /**
   * Show individual record
   */
  async show({ params, organization }: HttpContext) {
    AuthorizeToken.read(organization)
    return organization.related('accessLevels').query().where({ id: params.id }).firstOrFail()
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(accessLevelValidator)
    const accessLevel = await UpdateAccessLevel.handle({
      id: params.id,
      organization,
      data,
    })

    return accessLevel
  }

  /**
   * Delete record
   */
  async destroy({ params, request, response, organization }: HttpContext) {
    AuthorizeToken.delete(organization)

    const data = await request.validateUsing(
      accessLevelDestroyValidator,
      withOrganizationMetaData(organization.id)
    )

    await DestroyAccessLevel.handle({
      id: params.id,
      organization,
      data,
    })

    return response.status(204)
  }
}
