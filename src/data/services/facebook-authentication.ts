import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  SaveFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';
import { FacebookAccount } from '@/domain/models';

export class FacebookAuthenticationService {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      SaveFacebookUserAccountRepository,
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

      await this.userAccountRepository.saveWithFacebook(fbAccount);
    }
    return new AuthenticationError();
  }
}
