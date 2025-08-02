import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyCourse from '#actions/courses/destroy_course'
import GetCourse from '#actions/courses/get_course'
import SearchCourses from '#actions/courses/search_courses'
import StoreCourse from '#actions/courses/store_course'
import UpdateCourse from '#actions/courses/update_course'
import UpdateCourseTag from '#actions/courses/update_course_tag'
import {
  coursePaginateValidator,
  coursePatchTagValidator,
  courseSearchValidator,
  courseValidator,
} from '#validators/course'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

export default class CoursesController {
  /**
   * Display a list of resource
   */
  async index({ request, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    const { page, perPage } = await request.validateUsing(coursePaginateValidator)
    const courses = await SearchCourses.handle({ organization, page, perPage })

    courses.baseUrl(router.makeUrl('api.v1.courses.index'))

    return courses
  }

  async search({ request, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    const { page, perPage, ...filters } = await request.validateUsing(courseSearchValidator)
    const courses = await SearchCourses.handle({ organization, filters, page, perPage })

    courses.baseUrl(router.makeUrl('api.v1.search.courses'))

    return courses
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(
      courseValidator,
      withOrganizationMetaData(organization.id)
    )
    const course = await StoreCourse.handle({ organization, data })

    return course
  }

  /**
   * Show individual record
   */
  async show({ params, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    return GetCourse.handle({
      id: params.id,
      organization,
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(
      courseValidator,
      withOrganizationMetaData(organization.id)
    )
    const course = await UpdateCourse.handle({
      id: params.id,
      organization,
      data,
    })

    return course
  }

  async tag({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(
      coursePatchTagValidator,
      withOrganizationMetaData(organization.id)
    )

    return UpdateCourseTag.handle({
      id: params.id,
      data,
      organization,
    })
  }

  /**
   * Delete record
   */
  async destroy({ response, params, organization }: HttpContext) {
    AuthorizeToken.delete(organization)

    await DestroyCourse.handle({ organization, id: params.id })

    return response.status(204)
  }
}
