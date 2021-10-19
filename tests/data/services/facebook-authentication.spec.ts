import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookApi with correct params', async () => {
    const loadFacebookUserApiSpy = {
      loadUser: jest.fn()
    }

    const sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)

    await sut.perform({
      token: 'any_token'
    })

    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledWith({ token: 'any_token' })
    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    const loadFacebookUserApiSpy = {
      loadUser: jest.fn()
    }

    loadFacebookUserApiSpy.loadUser.mockResolvedValueOnce(undefined)

    const sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)

    const authResult = await sut.perform({
      token: 'any_token'
    })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
