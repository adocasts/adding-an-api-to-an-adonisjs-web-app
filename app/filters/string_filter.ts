import TextSearchTypes from '#enums/text_search_types'
import { LucidModel, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

const stringFilterRule = vine.union([
  vine.union.if(
    (value) => typeof value === 'object',
    vine.object({
      text: vine.string(),
      searchType: vine.enum(TextSearchTypes),
    })
  ),
  vine.union.else(vine.string().optional()),
])

export default class StringFilter {
  static get rule() {
    return stringFilterRule
  }

  static build<T extends LucidModel>(
    query: ModelQueryBuilderContract<T>,
    columnName: string,
    filter: Infer<typeof stringFilterRule>
  ) {
    if (!filter) return

    if (typeof filter === 'string') {
      return query.whereILike(columnName, filter)
    }

    const operator = this.#getOperator(filter.searchType)
    const value = this.#getValue(filter.searchType, filter.text)

    return query.where(columnName, operator, value)
  }

  static #getOperator(searchType: TextSearchTypes) {
    switch (searchType) {
      case TextSearchTypes.ENDS_WITH:
      case TextSearchTypes.STARTS_WITH:
      case TextSearchTypes.INCLUDES:
      case TextSearchTypes.EQUALS:
        return 'ILIKE'
      case TextSearchTypes.NOT_ENDS_WITH:
      case TextSearchTypes.NOT_STARTS_WITH:
      case TextSearchTypes.NOT_INCLUDES:
      case TextSearchTypes.NOT_EQUALS:
        return 'NOT ILIKE'
      default:
        return '='
    }
  }

  static #getValue(searchType: TextSearchTypes, text: string) {
    switch (searchType) {
      case TextSearchTypes.ENDS_WITH:
      case TextSearchTypes.NOT_ENDS_WITH:
        return `%${text}`
      case TextSearchTypes.STARTS_WITH:
      case TextSearchTypes.NOT_STARTS_WITH:
        return `${text}%`
      case TextSearchTypes.INCLUDES:
      case TextSearchTypes.NOT_INCLUDES:
        return `%${text}%`
      default:
        return text
    }
  }
}
