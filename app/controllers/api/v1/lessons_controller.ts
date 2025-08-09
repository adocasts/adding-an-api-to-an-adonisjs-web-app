import AuthorizeToken from '#actions/abilities/authorize_token'
import DestroyLesson from '#actions/lessons/destroy_lesson'
import GetLessonsByModule from '#actions/lessons/get_lessons_by_module'
import SearchLessons from '#actions/lessons/search_lessons'
import StoreLesson from '#actions/lessons/store_lesson'
import UpdateLesson from '#actions/lessons/update_lesson'
import UpdateLessonTag from '#actions/lessons/update_lesson_tag'
import { withOrganizationMetaData } from '#validators/helpers/organizations'
import { lessonPatchTagValidator, lessonSearchValidator, lessonValidator } from '#validators/lesson'
import type { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

export default class LessonsController {
  async search({ request, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    const { page, perPage, ...filters } = await request.validateUsing(lessonSearchValidator)
    const lessons = await SearchLessons.handle({ organization, filters, page, perPage })

    lessons.baseUrl(router.makeUrl('api.v1.search.lessons'))

    return lessons
  }

  /**
   * Display a list of resource
   */
  async module({ params, organization }: HttpContext) {
    AuthorizeToken.read(organization)

    return GetLessonsByModule.handle({ organization, moduleId: params.module_id })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, organization }: HttpContext) {
    AuthorizeToken.create(organization)

    const data = await request.validateUsing(
      lessonValidator,
      withOrganizationMetaData(organization.id)
    )

    return StoreLesson.handle({
      organization,
      data,
    })
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(
      lessonValidator,
      withOrganizationMetaData(organization.id)
    )

    return UpdateLesson.handle({
      id: params.id,
      organization,
      data,
    })
  }

  async tag({ params, request, organization }: HttpContext) {
    AuthorizeToken.update(organization)

    const data = await request.validateUsing(
      lessonPatchTagValidator,
      withOrganizationMetaData(organization.id)
    )

    return UpdateLessonTag.handle({
      id: params.id,
      organization,
      data,
    })
  }

  /**
   * Delete record
   */
  async destroy({ params, response, organization }: HttpContext) {
    AuthorizeToken.delete(organization)

    await DestroyLesson.handle({
      id: params.id,
      organization,
    })

    return response.status(204)
  }
}
