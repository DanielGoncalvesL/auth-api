export interface LoadUserAccountRepository {
  load: (
    params: LoadUserAccountRepository.Params,
  ) => Promise<LoadUserAccountRepository.Result>;
}

export namespace LoadUserAccountRepository {
  export type Params = {
    email: string;
  };

  export type Result =
    | undefined
    | {
        id: string;
        name?: string;
      };
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

export interface UpdateFacebookUserAccountRepository {
  updateWithFacebook: (
    params: UpdateFacebookUserAccountRepository.Params,
  ) => Promise<void>;
}

export namespace UpdateFacebookUserAccountRepository {
  export type Params = {
    id: string;
    name: string;
    facebookId: string;
  };
}
