export interface LoadUserAccountRepository {
  load: (
    params: LoadUserAccountRepository.Params,
  ) => Promise<LoadUserAccountRepository.Result>;
}

export namespace LoadUserAccountRepository {
  export type Params = {
    email: string;
  };

  export type Result = undefined;
}

export interface CreateFacebookUserAccountRepository {
  createFromFacebook: (
    params: CreateFacebookUserAccountRepository.Params,
  ) => Promise<void>;
}

export namespace CreateFacebookUserAccountRepository {
  export type Params = {
    email: string;
    name: string;
    facebookId: string;
  };
}
