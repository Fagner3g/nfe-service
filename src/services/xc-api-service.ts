import { Page } from 'puppeteer';
import userDao, { UserLogged } from '../dao/user-dao';
import logService from './log-service';

export class XcApiService {
  private loginUrl = 'http://xcbrasil.com.br/index.php?name=leonardo&op=login';
  private id: string = '0';

  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async listenSignIn(): Promise<boolean> {
    return new Promise((resolve) => {
      this.page.on('response', (resp) => {
        if (resp.url().includes('/pilot')) {
          const url = resp.url();
          const id = url.split('pilot/')[1];
          this.id = id;
          return resolve(true);
        }
        setTimeout(() => {
          return resolve(false);
        }, 1000);
      });
    });
  }

  private async signOut() {
    await this.page.goto('http://xcbrasil.com.br/index.php?name=leonardo&op=login&logout=true');
  }

  getUserId() {
    return this.id;
  }

  async closeInstance() {
    await this.signOut();
    await this.page.close();
  }

  async signIn({ username, password }: { username: string; password: string }): Promise<{ id: string }> {
    // Acessa a url
    await this.page.goto(this.loginUrl, { waitUntil: 'networkidle2' });

    // Aguarda o input de login
    await this.page.waitForSelector('.logintext');
    await this.page.type('.logintext', username);

    // Aguarda o input de senha
    await this.page.waitForSelector('.loginpassword');
    await this.page.type('.loginpassword', password);

    // Aguarda o botão de login
    await this.page.locator('.submitButton').click();

    const isLogged = await this.listenSignIn();
    if (!isLogged) {
      throw new Error('Usuário ou senha inválidos');
    }

    return { id: this.id };
  }
}
