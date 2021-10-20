import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'
import { mock, MockProxy } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '../../../src/data/contracts/apis/facebook'

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService
  let loadFacebookUserApiSpy: MockProxy<LoadFacebookUserApi>

  beforeEach(() => {
    loadFacebookUserApiSpy = mock<LoadFacebookUserApi>()

    sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)
  })

  it('should call LoadFacebookApi with correct params', async () => {
    await sut.perform({
      token: 'any_token'
    })

    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledWith({ token: 'any_token' })
    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    loadFacebookUserApiSpy.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.perform({
      token: 'any_token'
    })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
