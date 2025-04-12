import { BaseDto } from "@adocasts.com/dto/base";
import { AccessToken } from "@adonisjs/auth/access_tokens";

export default class AccessTokenDto extends BaseDto {
  declare id: number | string | BigInt
  declare type: string
  declare name: string | null
  declare token?: string
  declare abilities: string[]
  declare lastUsedAt?: string
  declare expiresAt?: string
  declare createdAt: string
  declare updatedAt: string

  constructor(accessToken: AccessToken) {
    super()

    this.id = accessToken.identifier
    this.type = accessToken.type
    this.name = accessToken.name
    this.token = accessToken.value?.release()
    this.abilities = accessToken.abilities
    this.lastUsedAt = accessToken.lastUsedAt?.toISOString()
    this.expiresAt = accessToken.expiresAt?.toISOString()
    this.createdAt = accessToken.createdAt?.toISOString()
    this.updatedAt = accessToken.updatedAt?.toISOString()
  }
}