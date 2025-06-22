import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyCourse from '#actions/courses/destroy_course'
import StoreCourse from '#actions/courses/store_course'
import UpdateCourse from '#actions/courses/update_course'
import { courseValidator } from '#validators/course'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import type { HttpContext } from '@adonisjs/core/http'

export default class CoursesController {
  /**
   * Display a list of resource
   */
  async index({ organization }: HttpContext) {
    AuthorizeToken.read(organization)

    const courses = await organization
      .related('courses')
      .query()
      .preload('status')
      .preload('difficulty')
      .preload('accessLevel')
      .withCount('modules')
      .withCount('lessons')
      .orderBy('order')

    return courses
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(courseValidator, withOrganizationMetaData(organization.id))
    const course = await StoreCourse.handle({ organization, data })

    return course
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(courseValidator, withOrganizationMetaData(organization.id))
    const course = await UpdateCourse.handle({
      id: params.id,
      organization,
      data
    })

    return course
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