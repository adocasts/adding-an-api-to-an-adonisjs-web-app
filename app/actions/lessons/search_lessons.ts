import Lesson from '#models/lesson'
import Organization from '#models/organization'
import { lessonSearchValidator } from '#validators/lesson'
import { HasManyQueryBuilderContract } from '@adonisjs/lucid/types/relations'
import { Infer } from '@vinejs/vine/types'
import StringFilter from '../../filters/string_filter.js'
import NumberFilter from '../../filters/number_filter.js'

type Query = HasManyQueryBuilderContract<typeof Lesson, Lesson>
type Data = Infer<typeof lessonSearchValidator>
type Filters = Omit<Data, 'page' | 'perPage'>
type Params = {
  organization: Organization
  filters?: Filters
  page?: number
  perPage?: number
}

export default class SearchLessons {
  static async handle({ organization, filters, page = 1, perPage = 5 }: Params) {
    return organization
      .related('lessons')
      .query()
      .if(filters, (query) => this.#applyFilters(query, filters!))
      .orderBy([
        { column: 'publishAt', order: 'desc', nulls: 'last' },
        { column: 'updatedAt', order: 'desc', nulls: 'last' },
      ])
      .paginate(page, perPage)
  }

  static #applyFilters(query: Query, filters: Filters) {
    StringFilter.build(query, 'name', filters.name)
    NumberFilter.build(query, 'statusId', filters.statusId)
    NumberFilter.build(query, 'accessLevelId', filters.accessLevelId)
    NumberFilter.build(query, 'moduleId', filters.moduleId)

    this.#applyPreloads(query, filters)
    this.#applyPublishAtFilter(query, filters)
  }

  static #applyPreloads(query: Query, { relationships }: Pick<Filters, 'relationships'>) {
    if (!relationships?.length) return

    for (const relationship of relationships) {
      switch (relationship) {
        case 'status':
        case 'accessLevel':
        case 'module':
          query.preload(relationship)
          break
        case 'module.course':
          query.preload('module', (module) => module.preload('course'))
          break
      }
    }
  }

  static #applyPublishAtFilter(query: Query, { publishAt }: Pick<Filters, 'publishAt'>) {
    if (!publishAt) return

    if (publishAt?.after && publishAt.before) {
      query.whereNotNull('publishAt').whereBetween('publishAt', [publishAt.after, publishAt.before])
    } else if (publishAt.after) {
      query.whereNotNull('publishAt').where('publishAt', '>', publishAt.after)
    } else if (publishAt.before) {
      query.whereNotNull('publishAt').where('publishAt', '<', publishAt.before)
    }
  }
}
