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
      .preload('accessLevel')
      .preload('status')
      .preload('module', (query) => query.preload('course'))
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
  }
}
