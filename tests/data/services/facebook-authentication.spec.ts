import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthenticationService } from '@/data/services';
import { mock, MockProxy } from 'jest-mock-extended';
import { LoadFacebookUserApi } from '../../../src/data/contracts/apis/facebook';
import {
  CreateFacebookUserAccountRepository,
  LoadUserAccountRepository,
  UpdateFacebookUserAccountRepository,
} from '@/data/contracts/repositories';

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService;
  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository &
      CreateFacebookUserAccountRepository &
      UpdateFacebookUserAccountRepository
  >;
  const token = 'any_token';

  beforeEach(() => {
    facebookApi = mock();

    userAccountRepository = mock();

    facebookApi.loadUser.mockResolvedValue({
      name: 'any_fb_name',
      email: 'any_email',
      facebookId: 'any_id',
    });

    userAccountRepository.load.mockResolvedValue(undefined);

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

  it('should call CreateFacebookUserAccountRepository when LoadUserAccountRepository returns undefined', async () => {
    await sut.perform({
      token,
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledWith({
      email: 'any_email',
      name: 'any_fb_name',
      facebookId: 'any_id',
    });

    expect(userAccountRepository.createFromFacebook).toHaveBeenCalledTimes(1);
  });

  it('should call UpdateFacebookUserAccountRepository when LoadUserAccountRepository returns data', async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: 'any_id',
      name: 'any_name',
    });

    await sut.perform({
      token,
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      name: 'any_name',
      facebookId: 'any_id',
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledTimes(1);
  });

  it('should update account name ', async () => {
    userAccountRepository.load.mockResolvedValueOnce({
      id: 'any_id',
    });

    await sut.perform({
      token,
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledWith({
      id: 'any_id',
      name: 'any_fb_name',
      facebookId: 'any_id',
    });

    expect(userAccountRepository.updateWithFacebook).toHaveBeenCalledTimes(1);
  });
});
