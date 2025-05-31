import StoreDifficulty from '#actions/difficulties/store_difficulty'
import UpdateDifficulty from '#actions/difficulties/update_difficulty'
import { difficultyValidator } from '#validators/difficulty'
import type { HttpContext } from '@adonisjs/core/http'

export default class DifficultiesController {
  /**
   * Display a list of resource
   */
  async index({ organization }: HttpContext) {
    return organization.related('difficulties').query().orderBy('order')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)
    const difficulty = await StoreDifficulty.handle({ organization, data })

    return difficulty
  }

  /**
   * Show individual record
   */
  async show({ params, organization }: HttpContext) {
    return organization.related('difficulties').query()
      .where({ id: params.id })
      .firstOrFail()
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    const data = await request.validateUsing(difficultyValidator)
    const difficulty = await UpdateDifficulty.handle({ 
      id: params.id, 
      organization, 
      data 
    })

    return difficulty
  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {}
}