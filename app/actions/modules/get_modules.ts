import Organization from "#models/organization";

type Params = {
  organization: Organization,
  courseId: number
}

export default class GetModules {
  static async handle({ organization, courseId }: Params) {
    return organization
      .related('modules')
      .query()
      .where({ courseId })
      .preload('status')
      .preload('lessons', (query) =>
        query.preload('accessLevel').preload('status').orderBy('order')
      )
      .orderBy('order')
  }
}