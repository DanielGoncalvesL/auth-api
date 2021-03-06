import { LoadFacebookUserApi } from '@/data/contracts/apis';
import { HttpGetClient } from '../http';

export class FacebookApi implements LoadFacebookUserApi {
  private readonly baseUrl = 'https://graph.facebook.com';

  constructor(
    private readonly httpGetClient: HttpGetClient,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async loadUser(
    params: LoadFacebookUserApi.Params,
  ): Promise<LoadFacebookUserApi.Result> {
    const appToken = await this.httpGetClient.get({
      url: `${this.baseUrl}/oauth/access_token`,
      params: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      },
    });

    const debugToken = await this.httpGetClient.get({
      url: `${this.baseUrl}/debug_token`,
      params: {
        access_token: appToken.access_token,
        input_token: params.token,
      },
    });

    const userInfo = await this.httpGetClient.get({
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      url: `${this.baseUrl}/${debugToken.data.user_id}`,
      params: {
        fields: ['id', 'name', 'email'].join(','),
        access_token: params.token,
      },
    });

    return {
      facebookId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
    };
  }
}
