import Course from '#models/course'
import Organization from '#models/organization'
import { courseSearchValidator } from '#validators/course'
import { HasManyQueryBuilderContract } from '@adonisjs/lucid/types/relations'
import { Infer } from '@vinejs/vine/types'
import StringFilter from '../../filters/string_filter.js'

type Filters = Infer<typeof courseSearchValidator>
type Query = HasManyQueryBuilderContract<typeof Course, Course>

type Params = {
  organization: Organization
  data: Filters
}

export default class SearchCourses {
  static async handle({ organization, data }: Params) {
    const { page = 1, perPage = 5, ...filters } = data

    return organization
      .related('courses')
      .query()
      .if(filters, (q) => this.#applyFilters(q, filters))
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

    query.if(filters.statusId, (q) => q.where('statusId', filters.statusId!))
    query.if(filters.difficultyId, (q) => q.where('difficultyId', filters.difficultyId!))
    query.if(filters.accessLevelId, (q) => q.where('accessLevelId', filters.accessLevelId!))
  }
}
