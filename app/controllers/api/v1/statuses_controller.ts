import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyStatus from '#actions/statuses/destroy_status'
import StoreStatus from '#actions/statuses/store_status'
import UpdateStatus from '#actions/statuses/update_status'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import { statusDestroyValidator, statusValidator } from '#validators/status'
import type { HttpContext } from '@adonisjs/core/http'

export default class StatusesController {
  /**
     * Display a list of resource
     */
    async index({ organization }: HttpContext) {
      AuthorizeToken.read(organization)
      return organization.related('statuses').query().orderBy('order')
    }
  
    /**
     * Handle form submission for the create action
     */
    async store({ request, organization }: HttpContext) {
      AuthorizeToken.create(organization)

      const data = await request.validateUsing(statusValidator)
      const status = await StoreStatus.handle({ organization, data })
  
      return status
    }
  
    /**
     * Show individual record
     */
    async show({ params, organization }: HttpContext) {
      AuthorizeToken.read(organization)
      return organization.related('statuses').query()
        .where({ id: params.id })
        .firstOrFail()
    }
  
    /**
     * Handle form submission for the edit action
     */
    async update({ params, request, organization }: HttpContext) {
      AuthorizeToken.update(organization)

      const data = await request.validateUsing(statusValidator)
      const status = await UpdateStatus.handle({ 
        id: params.id, 
        organization, 
        data 
      })
  
      return status
    }
  
    /**
     * Delete record
     */
    async destroy({ request, response, params, organization }: HttpContext) {
      AuthorizeToken.delete(organization)
      
      const data = await request.validateUsing(statusDestroyValidator, withOrganizationMetaData(organization.id))
  
      await DestroyStatus.handle({ 
        id: params.id,
        organization,
        data
      })
  
      return response.status(204)
    }
}