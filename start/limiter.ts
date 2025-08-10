/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from '@adonisjs/limiter/services/main'

export const throttle = limiter.define('global', () => {
  return limiter.allowRequests(3).every('1 minute')
})

export const apiThrottle = limiter.define('global_api', (ctx) => {
  const organizationId = ctx.organization.id
  return limiter
    .allowRequests(10)
    .every('30 seconds')
    .usingKey(`global_api_orgId_${organizationId}`)
})

export const apiSearchThrottle = limiter.define('search_api', (ctx) => {
  const organizationId = ctx.organization.id
  return limiter
    .allowRequests(5)
    .every('30 seconds')
    .blockFor('1 hour')
    .usingKey(`search_api_orgId_${organizationId}`)
})
