import vine from '@vinejs/vine'
import { existsInOrganization, OrganizationMetaData } from './helpers/organizations.js'
import { DateTime } from 'luxon'
import StringFilter from '../filters/string_filter.js'
import NumberFilter from '../filters/number_filter.js'

export const lessonSearchValidator = vine.compile(
  vine.object({
    page: vine.number().positive().optional(),
    perPage: vine.number().range([1, 5]).optional(),
    name: StringFilter.rule,
    accessLevelId: NumberFilter.rule,
    statusId: NumberFilter.rule,
    moduleId: NumberFilter.rule,
    publishAt: vine
      .object({
        before: vine.date({ formats: { utc: true } }).optional(),
        after: vine.date({ formats: { utc: true } }).optional(),
      })
      .optional(),
    relationships: vine
      .array(vine.enum(['status', 'accessLevel', 'module', 'module.course']))
      .optional(),
  })
)

export const lessonValidator = vine.withMetaData<OrganizationMetaData>().compile(
  vine.object({
    name: vine.string().maxLength(150),
    publishAt: vine
      .date({ formats: { utc: true } })
      .nullable()
      .optional()
      .transform((value) => (value ? DateTime.fromJSDate(value) : null)),
    moduleId: vine.number().exists(existsInOrganization('modules')),
    accessLevelId: vine.number().exists(existsInOrganization('access_levels')),
    statusId: vine.number().exists(existsInOrganization('statuses')),
  })
)

export const lessonPatchTagValidator = vine.withMetaData<OrganizationMetaData>().compile(
  vine.object({
    statusId: vine
      .number()
      .exists(existsInOrganization('statuses'))
      .optional()
      .requiredIfMissing(['accessLevelId']),
    accessLevelId: vine
      .number()
      .exists(existsInOrganization('access_levels'))
      .optional()
      .requiredIfMissing(['statusId']),
  })
)

export const lessonOrderValidator = vine.compile(
  vine.object({
    modules: vine.array(
      vine.object({
        id: vine.number(),
        lessons: vine.array(vine.number()),
      })
    ),
  })
)
