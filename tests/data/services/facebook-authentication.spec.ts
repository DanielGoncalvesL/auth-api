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
  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository & CreateFacebookUserAccountRepository
  >;
  const token = 'any_token';

  beforeEach(() => {
    facebookApi = mock();

    userAccountRepository = mock();

    facebookApi.loadUser.mockResolvedValue({
      name: 'any_name',
      email: 'any_email',
      facebookId: 'any_id',
    });

    sut = new FacebookAuthenticationService(facebookApi, userAccountRepository);
  });

  it('should call LoadFacebookApi with correct params', async () => {
    await sut.perform({
      token,
    });

    expect(facebookApi.loadUser).toHaveBeenCalledWith({ token });
    expect(facebookApi.loadUser).toHaveBeenCalledTimes(1);
  });

  it('should return AuthenticationError when LoadFacebookApiUserApi returns undefined', async () => {
    facebookApi.loadUser.mockResolvedValueOnce(undefined);

    const authResult = await sut.perform({
      token,
    });

    expect(authResult).toEqual(new AuthenticationError());
  });

  it('should call LoadUserAccountRepository when LoadFacebookUserApi returns data', async () => {
    await sut.perform({
      token,
    });

    expect(userAccountRepository.load).toHaveBeenCalledWith({
      email: 'any_email',
    });
    expect(userAccountRepository.load).toHaveBeenCalledTimes(1);
  });

  it('should call CreateUserAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    userAccountRepository.load.mockResolvedValueOnce(undefined);

    await sut.perform({
      token,
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      email: 'any_email',
      name: 'any_name',
      facebookId: 'any_id',
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1);
  });
});
