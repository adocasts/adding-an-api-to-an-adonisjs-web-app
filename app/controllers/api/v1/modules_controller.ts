import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyModule from '#actions/modules/destroy_module'
import GetModules from '#actions/modules/get_modules'
import StoreModule from '#actions/modules/store_module'
import UpdateModule from '#actions/modules/update_module'
import UpdateModuleTag from '#actions/modules/update_module_tag'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import { modulePatchTagValidator, moduleValidator } from '#validators/module'
import type { HttpContext } from '@adonisjs/core/http'

export default class ModulesController {
  /**
   * Display a list of resource
   */
  async index({ params, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    return GetModules.handle({
      courseId: params.course_id,
      organization
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, params, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(moduleValidator, withOrganizationMetaData(organization.id))

    return StoreModule.handle({
      courseId: params.course_id,
      organization,
      data
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(moduleValidator, withOrganizationMetaData(organization.id))

    return UpdateModule.handle({
      id: params.id,
      organization,
      data
    })
  }

  async tag({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(modulePatchTagValidator, withOrganizationMetaData(organization.id))

    return UpdateModuleTag.handle({
      id: params.id,
      organization,
      data
    })
  }

  /**
   * Delete record
   */
  async destroy({ params, response, organization }: HttpContext) {
    AuthorizeToken.delete(organization)

    await DestroyModule.handle({
      id: params.id,
      courseId: params.course_id,
      organization
    })

    return response.status(204)
  }
}