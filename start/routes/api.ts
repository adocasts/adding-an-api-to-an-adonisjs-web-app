import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.group(() => {
  // api routes
}).use([
  middleware.forceJsonResponse(),
  middleware.auth({ guards: ['api'] }),
  middleware.organization()
])