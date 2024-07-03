import pup, { Page } from 'puppeteer';
import userDao, { UserLogged } from '../dao/user-dao';

class XcApiService {
  private loginUrl = 'http://xcbrasil.com.br/index.php?name=leonardo&op=login';
  private id: string = '0';
  private page: Page | undefined = undefined;

  private async listenSignIn(page: Page): Promise<boolean> {
    return new Promise((resolve) => {
      page.on('response', (resp) => {
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
    if (this.page) {
      await this.page?.goto('http://xcbrasil.com.br/index.php?name=leonardo&op=login&logout=true');
    } else {
      throw new Error('Nenhuma instância aberta');
    }
  }

  getUserId() {
    return this.id;
  }

  async closeInstance() {
    if (this.page) {
      await this.signOut();
      // await this.page.close();
    } else {
      console.log('Nenhuma instância aberta');
      throw new Error('Nenhuma instância aberta');
    }
  }

  async getInstance({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ page: Page; id: string }> {
    // Inicia o browser e headless false para ver o browser { headless: false }
    const browser = await pup.launch({ headless: false });
    // Cria uma nova página
    const page = await browser.newPage();
    this.page = page;

    // Acessa a url
    await page.goto(this.loginUrl);

    // Aguarda o input de login
    await page.waitForSelector('.logintext');
    await page.type('.logintext', username);

    // Aguarda o input de senha
    await page.waitForSelector('.loginpassword');
    await page.type('.loginpassword', password);

    // Aguarda o botão de login
    await page.locator('.submitButton').click();

    const isLogged = await this.listenSignIn(page);
    if (!isLogged) {
      throw new Error('Usuário ou senha inválidos');
    }

    const emailRegex = /\S+@\S+\.\S+/;
    const numberRegex = /^\d+$/;

    const payload: UserLogged = {
      id: this.id,
      password,
    };

    if (emailRegex.test(username)) {
      payload.email = username;
    } else if (numberRegex.test(username)) {
      payload.civilId = username;
    } else {
      throw new Error('Nenhum tipo de dado valido');
    }

    try {
      await userDao.siginIn(payload);
    } catch (error) {
      console.log(error);
      throw new Error('Erro ao salvar usuário');
    }

    return { page, id: this.id };
  }
}

export const xcApiService = new XcApiService();
