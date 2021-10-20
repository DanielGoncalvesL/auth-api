import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthenticationService } from '@/data/services';
import { mock, MockProxy } from 'jest-mock-extended';
import { LoadFacebookUserApi } from '../../../src/data/contracts/apis/facebook';
import {
  CreateFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService;
  let loadFacebookUserApiSpy: MockProxy<LoadFacebookUserApi>;
  let loadUserAccountRepository: MockProxy<LoadUserAccountRepository>;
  let createFacebookUserAccountRepository: MockProxy<CreateFacebookUserAccountRepository>;
  const token = 'any_token';

  beforeEach(() => {
    loadFacebookUserApiSpy = mock();

    loadUserAccountRepository = mock();

    createFacebookUserAccountRepository = mock();

    loadFacebookUserApiSpy.loadUser.mockResolvedValue({
      name: 'any_name',
      email: 'any_email',
      facebookId: 'any_id',
    });

    sut = new FacebookAuthenticationService(
      loadFacebookUserApiSpy,
      loadUserAccountRepository,
      createFacebookUserAccountRepository,
    );
  });

  it('should call LoadFacebookApi with correct params', async () => {
    await sut.perform({
      token,
    });

    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledWith({ token });
    expect(loadFacebookUserApiSpy.loadUser).toHaveBeenCalledTimes(1);
  });

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    loadFacebookUserApiSpy.loadUser.mockResolvedValueOnce(undefined);

    const authResult = await sut.perform({
      token,
    });

    expect(authResult).toEqual(new AuthenticationError());
  });

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.perform({
      token,
    });

    expect(loadUserAccountRepository.load).toHaveBeenCalledWith({
      email: 'any_email',
    });
    expect(loadUserAccountRepository.load).toHaveBeenCalledTimes(1);
  });

  it('should call CreateUserAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    loadUserAccountRepository.load.mockResolvedValueOnce(undefined);

    await sut.perform({
      token,
    });

    expect(
      createFacebookUserAccountRepository.createFromFacebook,
    ).toHaveBeenCalledWith({
      email: 'any_email',
      name: 'any_name',
      facebookId: 'any_id',
    });

    expect(
      createFacebookUserAccountRepository.createFromFacebook,
    ).toHaveBeenCalledTimes(1);
  });
});
