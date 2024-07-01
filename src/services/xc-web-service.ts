export interface SignIn {
  username: string;
  password: string;
}

class XcWebService {
  private async signIn(sigiIn: SignIn) {
    console.log(sigiIn);
    return true;
  }

  async execute({ password, username }: SignIn) {
    if (!password || !username) {
      throw new Error('Preecha todos os campos');
    }

    return await this.signIn({ password, username });
  }
}

export { XcWebService };
