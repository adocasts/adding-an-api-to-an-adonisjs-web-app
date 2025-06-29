import GetModules from '#actions/modules/get_modules'
import Organization from '#models/organization'

type Params = {
  id: number
  organization: Organization
}

export default class GetCourse {
  static async handle({ id, organization }: Params) {
    const course = await organization
      .related('courses')
      .query()
      .preload('accessLevel')
      .preload('difficulty')
      .preload('status')
      .withCount('lessons')
      .where({ id })
      .firstOrFail()

    const modules = await GetModules.handle({ 
      courseId: id,
      organization, 
    })

    return { course, modules }
  }
}
