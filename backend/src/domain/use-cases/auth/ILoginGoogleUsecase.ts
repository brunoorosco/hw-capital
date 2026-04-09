export namespace TLoginGoogleUsecase {
  export interface Params {
    token: string;
  }

  export interface Result {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      picture?: string;
    };
  }
}

export interface ILoginGoogleUsecase {
  auth(params: TLoginGoogleUsecase.Params): Promise<TLoginGoogleUsecase.Result>;
}
