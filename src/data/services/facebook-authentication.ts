import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  SaveFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';

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
      const { email, facebookId } = facebookData;

      const userAccountData = await this.userAccountRepository.load({
        email: facebookData.email,
      });

      await this.userAccountRepository.saveWithFacebook({
        id: userAccountData?.id,
        name: userAccountData?.name ?? facebookData.name,
        email,
        facebookId,
      });
    }
    return new AuthenticationError();
  }
}
