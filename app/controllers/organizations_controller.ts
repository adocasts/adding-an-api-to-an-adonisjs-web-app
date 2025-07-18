import GetOrganizationAbilities from '#actions/abilities/get_organization_abilities'
import AcceptOrganizationInvite from '#actions/organizations/accept_organization_invite'
import DestroyOrganization from '#actions/organizations/destroy_organization'
import GetOrganizationUserRoleId from '#actions/organizations/get_organization_user_role_id'
import SetActiveOrganization from '#actions/organizations/http/set_active_organization'
import StoreOrganization from '#actions/organizations/store_organization'
import UpdateOrganization from '#actions/organizations/update_organization'
import ForbiddenException from '#exceptions/forbidden_exception'
import OrganizationInvite from '#models/organization_invite'
import User from '#models/user'
import { organizationValidator } from '#validators/organization'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class OrganizationsController {
  constructor(protected setActiveOrganization: SetActiveOrganization) {}

  /**
   * Display form to create a new record
   */
  async create({ inertia }: HttpContext) {
    return inertia.render('organizations/create')
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const data = await request.validateUsing(organizationValidator)
    const organization = await StoreOrganization.handle({
      user: auth.use('web').user!,
      data,
    })

    this.setActiveOrganization.handle({ id: organization.id })

    return response.redirect().toRoute('courses.index')
  }

  async active({ request, response, params }: HttpContext) {
    this.setActiveOrganization.handle({ id: params.id })
    
    if (!request.header('X-Inertia')) {
      return response.noContent()
    }

    return response.redirect().toRoute('courses.index')
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response, auth, session }: HttpContext) {
    const roleId = await GetOrganizationUserRoleId.handle({
      organizationId: params.id,
      userId: auth.use('web').user!.id,
    })

    if (!GetOrganizationAbilities.canEdit(roleId)) {
      throw new ForbiddenException('You are not authorized to edit this organization')
    }

    const data = await request.validateUsing(organizationValidator)

    await UpdateOrganization.handle({
      user: auth.use('web').user!,
      id: params.id,
      data,
    })

    session.flash('success', 'Your organization has been updated')

    return response.redirect().back()
  }

  async acceptInvite({ request, response, auth, params, session }: HttpContext) {
    await auth.use('web').check()

    const user = auth.use('web').user

    if (!request.hasValidSignature()) {
      session.flash('errorsBag', 'An invalid invitation URL was provided')
      return user
        ? response.redirect().toRoute('courses.index')
        : response.redirect().toRoute('login.show')
    }

    if (!user) {
      const invite = await OrganizationInvite.findOrFail(params.id)
      const isUser = await User.findBy('email', invite.email)

      session.put('invite_id', invite.id)

      return isUser
        ? response.redirect().toRoute('login.show')
        : response.redirect().toRoute('register.show')
    }

    const result = await AcceptOrganizationInvite.handle({
      inviteId: params.id,
      user,
    })

    session.forget('invite_id')
    session.flash(result.state, result.message)

    return response.redirect().toRoute('courses.index')
  }

  /**
   * Delete record
   */
  async destroy({ params, response, session, auth }: HttpContext) {
    const roleId = await GetOrganizationUserRoleId.handle({
      organizationId: params.id,
      userId: auth.use('web').user!.id,
    })

    if (!GetOrganizationAbilities.canDestroy(roleId)) {
      throw new ForbiddenException('You are not authorized to delete this organization')
    }

    const organization = await DestroyOrganization.handle({
      user: auth.use('web').user!,
      id: params.id,
    })

    session.flash('success', `Your ${organization.name} has been deleted`)

    return response.redirect().toRoute('courses.index')
  }
}
