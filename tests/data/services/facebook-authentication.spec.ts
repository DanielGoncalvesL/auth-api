import { FacebookAuthentication } from '@/domain/features'
import { AuthenticationError } from '@/domain/errors'

class FacebookAuthenticationService {
  constructor (private readonly loadFacebookUserApi: LoadFacebookUserApi) {}

  async perform (params: FacebookAuthentication.Params): Promise<FacebookAuthentication.Result> {
    await this.loadFacebookUserApi.loadUser({ token: params.token })

    return new AuthenticationError()
  }
}

interface LoadFacebookUserApi{
  loadUser: (params: LoadFacebookUserApi.Params) => Promise<LoadFacebookUserApi.Result>
}

namespace LoadFacebookUserApi {
  export type Params = {
    token: string
  }

  export type Result = undefined
}

class LoadFacebookUserApiSpy implements LoadFacebookUserApi {
  token?: string
  result = undefined

  async loadUser (params: LoadFacebookUserApi.Params): Promise<LoadFacebookUserApi.Result> {
    this.token = params.token

    return this.result
  }
}

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookApi with correct params', async () => {
    const loadFacebookUserApiSpy = new LoadFacebookUserApiSpy()

    const sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)

    await sut.perform({
      token: 'any_token'
    })

    expect(loadFacebookUserApiSpy.token).toEqual('any_token')
  })

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    const loadFacebookUserApiSpy = new LoadFacebookUserApiSpy()

    loadFacebookUserApiSpy.result = undefined

    const sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)

    const authResult = await sut.perform({
      token: 'any_token'
    })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
