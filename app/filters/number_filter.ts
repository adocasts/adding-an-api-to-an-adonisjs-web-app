import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const numberFilter = vine
  .union([
    vine.union.if((value) => Array.isArray(value), vine.array(vine.number())),
    vine.union.if((value) => !value || typeof value === 'number', vine.number().optional()),
  ])
  .otherwise((_, field) => {
    field.report(
      `${field.name} must be a number, array of numbers, or omitted`,
      'arrayOfNumbersOrNumberOptional',
      field
    )
  })

export default class NumberFilter {
  static get rule() {
    return numberFilter
  }

  static build<T extends LucidModel>(
    query: ModelQueryBuilderContract<T>,
    columnName: string,
    filter: Infer<typeof numberFilter>
  ) {
    if (!filter) return

    if (typeof filter === 'number') {
      return query.where(columnName, filter)
    }

    return query.whereIn(columnName, filter)
  }
}
