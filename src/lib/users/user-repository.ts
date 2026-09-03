export interface CreateUserInput {
  readonly email: string
  readonly name: null | string
}

export interface UserRecord {
  readonly createdAt: Date
  readonly email: string
  readonly id: string
  readonly name: null | string
  readonly updatedAt: Date
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserRecord>
  listNewest(limit: number): Promise<UserRecord[]>
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('A user with this email already exists')
    this.name = 'DuplicateEmailError'
  }
}
