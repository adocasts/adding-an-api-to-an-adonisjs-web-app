import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyDifficulty from '#actions/difficulties/destroy_difficulty'
import StoreDifficulty from '#actions/difficulties/store_difficulty'
import UpdateDifficulty from '#actions/difficulties/update_difficulty'
import { difficultyDestroyValidator, difficultyValidator } from '#validators/difficulty'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  /**
   * Display a list of resource
   */
  async index({ organization }: HttpContext) {
    AuthorizeToken.read(organization)
    return organization.related('difficulties').query().orderBy('order')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(difficultyValidator)
    const difficulty = await StoreDifficulty.handle({ organization, data })

    return difficulty
  }

  /**
   * Show individual record
   */
  async show({ params, organization }: HttpContext) {
    AuthorizeToken.read(organization)
    return organization.related('difficulties').query().where({ id: params.id }).firstOrFail()
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(difficultyValidator)
    const difficulty = await UpdateDifficulty.handle({
      id: params.id,
      organization,
      data,
    })

    return difficulty
  }

  /**
   * Delete record
   */
  async destroy({ request, response, params, organization }: HttpContext) {
    AuthorizeToken.delete(organization)

    const data = await request.validateUsing(
      difficultyDestroyValidator,
      withOrganizationMetaData(organization.id)
    )

    await DestroyDifficulty.handle({
      id: params.id,
      organization,
      data,
    })

    return response.status(204)
  }
}
