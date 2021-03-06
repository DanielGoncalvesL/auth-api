import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthenticationService } from '@/data/services';
import { mock, MockProxy } from 'jest-mock-extended';
import { LoadFacebookUserApi } from '../../../src/data/contracts/apis/facebook';
import {
  SaveFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';
import { mocked } from 'ts-jest/utils';
import { FacebookAccount } from '../../../src/domain/models/facebook-account';
import { TokenGenerator } from '@/data/contracts/crypto';
import { AccessToken } from '../../../src/domain/models/access-token';

jest.mock('@/domain/models/facebook-account');

describe('FacebookAuthenticationService', () => {
  let sut: FacebookAuthenticationService;
  let facebookApi: MockProxy<LoadFacebookUserApi>;
  let crypto: MockProxy<TokenGenerator>;
  let userAccountRepository: MockProxy<
    LoadUserAccountRepository & SaveFacebookUserAccountRepository
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

    userAccountRepository.saveWithFacebook.mockResolvedValue({
      id: 'any_account_id',
    });

    crypto = mock();

    crypto.generateToken.mockResolvedValue('any_generated_token');

    sut = new FacebookAuthenticationService(
      facebookApi,
      userAccountRepository,
      crypto,
    );
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

  it('should call SaveFacebookAccountRepository with FacebookAccount', async () => {
    const FacebookAccountStub = jest.fn().mockImplementation(() => ({
      any: 'any',
    }));

    mocked(FacebookAccount).mockImplementation(FacebookAccountStub);

    await sut.perform({
      token,
    });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledWith({
      any: 'any',
    });

    expect(userAccountRepository.saveWithFacebook).toHaveBeenCalledTimes(1);
  });

  it('should call TokenGenerator if correct params', async () => {
    await sut.perform({ token });

    expect(crypto.generateToken).toHaveBeenCalledWith({
      key: 'any_account_id',
      expirationInMs: AccessToken.expirationInMs,
    });
    expect(crypto.generateToken).toHaveBeenCalledTimes(1);
  });

  it('should return an AccessToken on success', async () => {
    const authResult = await sut.perform({ token });

    expect(authResult).toEqual(new AccessToken('any_generated_token'));
  });

  it('should  rethrow if LoadFacebookUserApi throws', async () => {
    facebookApi.loadUser.mockRejectedValueOnce(new Error('facebook_error'));

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error('facebook_error'));
  });

  it('should  rethrow if LoadUserAccountRepository throws', async () => {
    userAccountRepository.load.mockRejectedValueOnce(
      new Error('loadUser_error'),
    );

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error('loadUser_error'));
  });

  it('should  rethrow if SaveUserAccountRepository throws', async () => {
    userAccountRepository.saveWithFacebook.mockRejectedValueOnce(
      new Error('saveUser_error'),
    );

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error('saveUser_error'));
  });

  it('should  rethrow if TokenGenerator throws', async () => {
    crypto.generateToken.mockRejectedValueOnce(new Error('token_error'));

    const promise = sut.perform({ token });

    await expect(promise).rejects.toThrow(new Error('token_error'));
  });
});
