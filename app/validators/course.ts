import vine from '@vinejs/vine'
import { existsInOrganization, OrganizationMetaData } from './helpers/organizations.js'
import StringFilter from '../filters/string_filter.js'

export const coursePaginateValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().min(5).max(50).optional(),
  })
)

export const courseSearchValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().min(5).max(50).optional(),
    name: StringFilter.rule,
    statusId: vine.number().optional(),
    difficultyId: vine.number().optional(),
    accessLevelId: vine.number().optional(),
  })
)

export const courseValidator = vine.withMetaData<OrganizationMetaData>().compile(
  vine.object({
    name: vine.string().maxLength(150),
    statusId: vine.number().exists(existsInOrganization('statuses')),
    difficultyId: vine.number().exists(existsInOrganization('difficulties')),
    accessLevelId: vine.number().exists(existsInOrganization('access_levels')),
    notes: vine.string().optional(),
  })
)

export const coursePatchTagValidator = vine.withMetaData<OrganizationMetaData>().compile(
  vine.object({
    statusId: vine
      .number()
      .exists(existsInOrganization('statuses'))
      .optional()
      .requiredIfMissing(['difficultyId', 'accessLevelId']),
    difficultyId: vine
      .number()
      .exists(existsInOrganization('difficulties'))
      .optional()
      .requiredIfMissing(['statusId', 'accessLevelId']),
    accessLevelId: vine
      .number()
      .exists(existsInOrganization('access_levels'))
      .optional()
      .requiredIfMissing(['difficultyId', 'statusId']),
  })
)
