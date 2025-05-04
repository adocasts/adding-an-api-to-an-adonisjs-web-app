import OrganizationsController from "#controllers/api/v1/organizations_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
  router.get('/organization', [OrganizationsController])
}).prefix('/api/v1').use([
  middleware.forceJsonResponse(),
  middleware.auth({ guards: ['api'] }),
  middleware.organization()
])
