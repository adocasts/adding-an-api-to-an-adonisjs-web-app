import CancelOrganizationInvite from '#actions/organizations/cancel_organization_invite'
import GetOrganizationPendingInvites from '#actions/organizations/get_organization_pending_invites'
import GetOrganizationUsers from '#actions/organizations/get_organization_users'
import RemoveOrganizationUser from '#actions/organizations/remove_organization_user'
import SendOrganizationInvite from '#actions/organizations/send_organization_invite'
import DestroyApiAccessToken from '#actions/settings/destroy_api_access_token'
import GetApiAccessTokens from '#actions/settings/get_api_access_tokens'
import StoreApiAccessToken from '#actions/settings/store_api_access_token'
import AccessTokenDto from '#dtos/access_token'
import OrganizationInviteDto from '#dtos/organization_invite'
import RoleDto from '#dtos/role'
import UserDto from '#dtos/user'
import ForbiddenException from '#exceptions/forbidden_exception'
import Role from '#models/role'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import { organizationInviteValidator } from '#validators/organization'
import { apiAccessTokenValidator } from '#validators/setting'
import type { HttpContext } from '@adonisjs/core/http'
import { setTimeout } from 'node:timers/promises'

export default class OrganizationsController {
  async index({ inertia, organization }: HttpContext) {
    return inertia.render('settings/organization', {
      users: inertia.defer(async () => {
        const users = await GetOrganizationUsers.handle({ organization })
        return UserDto.fromArray(users)
      }),
      invites: inertia.optional(async () => {
        await setTimeout(5_000)
        const pendingInvites = await GetOrganizationPendingInvites.handle({ organization })
        return OrganizationInviteDto.fromArray(pendingInvites)
      }),
      roles: async () => {
        const roles = await Role.query().orderBy('name')
        return RoleDto.fromArray(roles)
      },
      accessTokens: async () => {
        const accessTokens = await GetApiAccessTokens.handle({ organization })
        return AccessTokenDto.fromArray(accessTokens)
      }
    })
  }

  async inviteUser({ request, response, organization, session, auth, can }: HttpContext) {
    if (!can.organization.manageUsers) {
      throw new ForbiddenException('You are not authorized to invite users')
    }

    const data = await request.validateUsing(
      organizationInviteValidator,
      withOrganizationMetaData(organization.id)
    )

    await SendOrganizationInvite.handle({
      organization,
      invitedByUserId: auth.use('web').user!.id,
      data,
    })

    session.flash('success', 'Invitation has been sent')

    return response.redirect().back()
  }

  async cancelInvite({ response, organization, params, session, auth, can }: HttpContext) {
    if (!can.organization.manageUsers) {
      throw new ForbiddenException('You are not authorized to cancel invitations')
    }

    await CancelOrganizationInvite.handle({
      organization,
      canceledByUserId: auth.use('web').user!.id,
      inviteId: params.id,
    })

    session.flash('success', 'The invitation has been canceled')

    return response.redirect().back()
  }

  async removeUser({ response, organization, params, session, can, auth }: HttpContext) {
    const user = auth.use('web').user!

    if (!can.organization.manageUsers && params.id !== user.id) {
      throw new ForbiddenException('You are not authorized to remove users')
    }

    await RemoveOrganizationUser.handle({
      organization,
      removeUserId: params.id,
    })

    session.flash('success', 'member has been successfully removed')

    return response.redirect().back()
  }

  async storeAccessToken({ request, response, organization, can }: HttpContext) {
    if (!can.organization.manageAccessTokens) {
      throw new ForbiddenException('You are not authorized to create access tokens')
    }

    const data = await request.validateUsing(apiAccessTokenValidator)
    const token = await StoreApiAccessToken.handle({ organization, data })

    return response.json({
      accessToken: new AccessTokenDto(token),
    })
  }

  async destroyAccessTokens({ params, response, organization, session, can }: HttpContext) {
    if (!can.organization.manageAccessTokens) {
      throw new ForbiddenException('You are not authorized to delete access tokens')
    }

    await DestroyApiAccessToken.handle({ organization, id: params.id })

    session.flash('success', 'Access token was successfully deleted and can no longer be used')

    return response.redirect().back()
  }
}
