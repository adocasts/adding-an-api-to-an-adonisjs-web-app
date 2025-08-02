import Course from '#models/course'
import Organization from '#models/organization'
import { courseSearchValidator } from '#validators/course'
import { HasManyQueryBuilderContract } from '@adonisjs/lucid/types/relations'
import { Infer } from '@vinejs/vine/types'
import StringFilter from '../../filters/string_filter.js'
import NumberFilter from '../../filters/number_filter.js'

type Query = HasManyQueryBuilderContract<typeof Course, Course>
type Data = Infer<typeof courseSearchValidator>
type Filters = Omit<Data, 'page' | 'perPage'>
type Params = {
  organization: Organization
  filters?: Filters
  page?: number
  perPage?: number
}

export default class SearchCourses {
  static async handle({ organization, filters, page = 1, perPage = 5 }: Params) {
    return organization
      .related('courses')
      .query()
      .if(filters, (query) => this.#applyFilters(query, filters!))
      .preload('status')
      .preload('difficulty')
      .preload('accessLevel')
      .withCount('modules')
      .withCount('lessons')
      .orderBy('order')
      .paginate(page, perPage)
  }

  static #applyFilters(query: Query, filters: Filters) {
    StringFilter.build(query, 'name', filters.name)
    NumberFilter.build(query, 'statusId', filters.statusId)
    NumberFilter.build(query, 'difficultyId', filters.difficultyId)
    NumberFilter.build(query, 'accessLevelId', filters.accessLevelId)
  }
}
