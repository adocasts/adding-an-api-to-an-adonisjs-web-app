import OrganizationsController from "#controllers/api/organizations_controller";
import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
  router.get('/organization', [OrganizationsController])
}).prefix('/api').use([
  middleware.forceJsonResponse(),
  middleware.auth({ guards: ['api'] }),
  middleware.organization()
])
