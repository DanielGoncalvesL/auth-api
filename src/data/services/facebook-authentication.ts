import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  CreateFacebookUserAccountRepository,
  LoadUserAccountRepository,
  UpdateFacebookUserAccountRepository,
} from '@/data/contracts/repositories';

export class FacebookAuthenticationService {
  constructor(
    private readonly facebookApi: LoadFacebookUserApi,
    private readonly userAccountRepository: LoadUserAccountRepository &
      CreateFacebookUserAccountRepository &
      UpdateFacebookUserAccountRepository,
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

      if (userAccountData !== undefined) {
        await this.userAccountRepository.updateWithFacebook({
          id: userAccountData.id,
          name: userAccountData.name ?? facebookData.name,
          facebookId: facebookData.facebookId,
        });
      } else {
        await this.userAccountRepository.createFromFacebook(facebookData);
      }
    }
    return new AuthenticationError();
  }
}
