import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  SaveFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';
import { FacebookAccount } from '@/domain/models';
import { TokenGenerator } from '../contracts/crypto/token';
import { AccessToken } from '../../domain/models/access-token';

export class FacebookAuthenticationService implements FacebookAuthentication {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      SaveFacebookUserAccountRepository,
    private readonly crypto: TokenGenerator,
  ) {}

  async perform(
    params: FacebookAuthentication.Params,
  ): Promise<FacebookAuthentication.Result> {
    const facebookData = await this.facebookApi.loadUser({
      token: params.token,
    });

    if (facebookData !== undefined) {
      const userAccountData = await this.userAccountRepository.load({
        email: facebookData.email,
      });

      const fbAccount = new FacebookAccount(facebookData, userAccountData);

      const { id } = await this.userAccountRepository.saveWithFacebook(
        fbAccount,
      );

      const token = await this.crypto.generateToken({
        key: id,
        expirationInMs: AccessToken.expirationInMs,
      });

      return new AccessToken(token);
    }
    return new AuthenticationError();
  }
}
