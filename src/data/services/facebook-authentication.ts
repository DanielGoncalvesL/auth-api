import { AuthenticationError } from '@/domain/errors';
import { FacebookAuthentication } from '@/domain/features';
import { LoadFacebookUserApi } from '@/data/contracts/apis';
import {
  CreateFacebookUserAccountRepository,
  LoadUserAccountRepository,
} from '@/data/contracts/repositories';

export class FacebookAuthenticationService {
  constructor(
    private readonly loadFacebookUserApi: LoadFacebookUserApi,
    private readonly loadUserAccountRepository: LoadUserAccountRepository,
    private readonly createFacebookUserAccountRepository: CreateFacebookUserAccountRepository,
  ) {}

  async perform(
    params: FacebookAuthentication.Params,
  ): Promise<FacebookAuthentication.Result> {
    const facebookData = await this.loadFacebookUserApi.loadUser({
      token: params.token,
    });

    if (facebookData !== undefined) {
      const userAccountData = await this.loadUserAccountRepository.load({
        email: facebookData.email,
      });

      if (userAccountData === undefined) {
        await this.createFacebookUserAccountRepository.createFromFacebook(
          facebookData,
        );
      }
    }

    return new AuthenticationError();
  }
}
