import vine from '@vinejs/vine'
import { newEmailRule } from './auth.js'
import TokenActions from '#enums/token_actions'

export const updateProfileValidator = vine.compile(
  vine.object({
    fullName: vine.string().maxLength(254),
  })
)

export const updateEmailValidator = vine.compile(
  vine.object({
    email: newEmailRule.clone(),
    password: vine.string(),
  })
)

export const apiAccessTokenValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(100),
    permissions: vine.array(vine.enum(TokenActions))
  })
)