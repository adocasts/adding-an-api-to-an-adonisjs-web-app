import Organization from '#models/organization'

type Params = {
  organization: Organization
  moduleId: number
}

export default class GetLessonsByModule {
  static async handle({ organization, moduleId }: Params) {
    return organization.related('lessons').query().where({ moduleId }).orderBy('order')
  }
}
