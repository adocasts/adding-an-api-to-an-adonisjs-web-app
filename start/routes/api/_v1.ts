import AccessLevelsController from "#controllers/api/v1/access_levels_controller";
import CoursesController from "#controllers/api/v1/courses_controller";
import DifficultiesController from "#controllers/api/v1/difficulties_controller";
import ModulesController from "#controllers/api/v1/modules_controller";
import OrganizationsController from "#controllers/api/v1/organizations_controller";
import StatusesController from "#controllers/api/v1/statuses_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
  router.get('/organization', [OrganizationsController]).as('organization')

  router.resource('difficulties', DifficultiesController).apiOnly()
  router.resource('access-levels', AccessLevelsController).apiOnly()
  router.resource('statuses', StatusesController).apiOnly()
  router.resource('courses', CoursesController).apiOnly()
  router.resource('courses.modules', ModulesController).apiOnly().except(['show'])

  router.patch('/courses/:id/tag', [CoursesController, 'tag']).as('courses.tag')
  router.patch('/courses/:course_id/modules/:id/tag', [ModulesController, 'tag']).as('courses.modules.tag')
}).prefix('/api/v1').as('api.v1').use([
  middleware.forceJsonResponse(),
  middleware.auth({ guards: ['api'] }),
  middleware.organization()
])
