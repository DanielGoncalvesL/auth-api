import { AuthenticationError } from '@/domain/errors'
import { FacebookAuthenticationService } from '@/data/services'
import { mock, MockProxy } from 'jest-mock-extended'
import { LoadFacebookUserApi } from '../../../src/data/contracts/apis/facebook'

type SutTypes = {
  sut: FacebookAuthenticationService
  loadFacebookUserApiSpy: MockProxy<LoadFacebookUserApi>
}

const makeSut = (): SutTypes => {
  const loadFacebookUserApiSpy = mock<LoadFacebookUserApi>()

  const sut = new FacebookAuthenticationService(loadFacebookUserApiSpy)

  return {
    loadFacebookUserApiSpy,
    sut
  }
}

describe('FacebookAuthenticationService', () => {
  it('should call LoadFacebookApi with correct params', async () => {
    const { loadFacebookUserApiSpy, sut } = makeSut()

    await sut.perform({
      token: 'any_token'
    })

    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledWith({ token: 'any_token' })
    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledTimes(1)
  })

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    const { loadFacebookUserApiSpy, sut } = makeSut()

    loadFacebookUserApiSpy.loadUser.mockResolvedValueOnce(undefined)

    const authResult = await sut.perform({
      token: 'any_token'
    })

    expect(authResult).toEqual(new AuthenticationError())
  })
})
