import AccessLevelsController from "#controllers/api/v1/access_levels_controller";
import DifficultiesController from "#controllers/api/v1/difficulties_controller";
import OrganizationsController from "#controllers/api/v1/organizations_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
  router.get('/organization', [OrganizationsController]).as('organization')

  router.resource('difficulties', DifficultiesController).apiOnly()
  router.resource('access-levels', AccessLevelsController).apiOnly()
}).prefix('/api/v1').as('api').use([
  middleware.forceJsonResponse(),
  middleware.auth({ guards: ['api'] }),
  middleware.organization()
])
