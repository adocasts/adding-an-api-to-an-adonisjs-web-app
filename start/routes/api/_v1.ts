const AccessLevelsController = () => import('#controllers/api/v1/access_levels_controller')
const CoursesController = () => import('#controllers/api/v1/courses_controller')
const DifficultiesController = () => import('#controllers/api/v1/difficulties_controller')
const LessonsController = () => import('#controllers/api/v1/lessons_controller')
const ModulesController = () => import('#controllers/api/v1/modules_controller')
const OrganizationsController = () => import('#controllers/api/v1/organizations_controller')
const StatusesController = () => import('#controllers/api/v1/statuses_controller')
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router
  .group(() => {
    router.get('/organization', [OrganizationsController]).as('organization')

    router.resource('difficulties', DifficultiesController).apiOnly()
    router.resource('access-levels', AccessLevelsController).apiOnly()
    router.resource('statuses', StatusesController).apiOnly()
    router.resource('courses', CoursesController).apiOnly()
    router.resource('courses.modules', ModulesController).apiOnly().except(['show'])
    router.resource('lessons', LessonsController).apiOnly().except(['index', 'show'])

    router
      .get('/modules/:module_id/lessons', [LessonsController, 'module'])
      .as('modules.lessons.index')

    router.patch('/courses/:id/tag', [CoursesController, 'tag']).as('courses.tag')
    router
      .patch('/courses/:course_id/modules/:id/tag', [ModulesController, 'tag'])
      .as('courses.modules.tag')
    router.patch('/lessons/:id/tag', [LessonsController, 'tag']).as('lessons.tag')
  })
  .prefix('/api/v1')
  .as('api.v1')
  .use([
    middleware.forceJsonResponse(),
    middleware.auth({ guards: ['api'] }),
    middleware.organization(),
  ])
