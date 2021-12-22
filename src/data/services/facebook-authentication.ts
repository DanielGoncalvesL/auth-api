import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  SaveFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';
import { FacebookAccount } from '@/domain/models';
import { TokenGenerator } from '../contracts/crypto/token';

export class FacebookAuthenticationService {
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

      await this.crypto.generateToken({ key: id });
    }
    return new AuthenticationError();
  }
}
