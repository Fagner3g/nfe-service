import pup, { Page } from 'puppeteer';

export interface SignIn {
  username: string;
  password: string;
}

class XcWebService {
  private id: number = 0;
  private loginUrl = 'http://xcbrasil.com.br/index.php?name=leonardo&op=login';

  private async listenSignIn(page: Page): Promise<boolean> {
    return new Promise((resolve) => {
      page.on('response', (resp) => {
        if (resp.url().includes('/pilot')) {
          const url = resp.url();
          const id = url.split('pilot/')[1];
          this.id = Number(id);
          return resolve(true);
        }
        setTimeout(() => {
          return resolve(false);
        }, 1000);
      });
    });
  }

  private async getUserName(page: Page) {
    // Execute o código dentro do contexto da página
    return await page.evaluate(() => {
      // Encontre o elemento com a classe infoHeader
      const infoHeader = document.querySelector('.infoHeader');

      // Se infoHeader for encontrado, pegue a próxima tabela
      if (infoHeader) {
        const table = infoHeader.nextElementSibling as any;

        // Verifique se o próximo elemento é uma tabela
        if (table && table.tagName.toLowerCase() === 'table') {
          const rows = Array.from(table.rows);
          const data = {} as any;
          rows.map((row: any) => {
            const cells = Array.from(row.cells) as any;

            if (cells[0].innerText === 'Nome') {
              data['name'] = cells[1].innerText;
            } else if (cells[0].innerText === 'Sobrenome') {
              data['lastName'] = cells[1].innerText;
            }
          });

          return data;
        }
      }
      return null;
    });
  }

  private async getTakeoff(page: Page) {
    await page.waitForSelector('.pilot_stats_div');
    // Execute o código dentro do contexto da página
    return await page.evaluate(() => {
      // Encontre os elementos que contêm os textos "Breakdown per Takeoff" e "Breakdown per Glider"
      const breakdownTakeoffHeader = Array.from(document.querySelectorAll('h1')).find(
        (element) => element.innerHTML.trim() === 'Breakdown per Takeoff'
      );
      const breakdownGliderHeader = Array.from(document.querySelectorAll('h1')).find(
        (element) => element.innerHTML.trim() === 'Breakdown per Glider'
      );

      let contentObject = [];

      if (breakdownTakeoffHeader && breakdownGliderHeader) {
        let currentElement = breakdownTakeoffHeader.nextElementSibling;

        // Iterar até o próximo elemento até encontrar o cabeçalho "Breakdown per Glider"
        while (currentElement && currentElement !== breakdownGliderHeader) {
          if (currentElement.tagName === 'H2') {
            const key = currentElement.innerHTML.trim();
            contentObject.push(key);
          }
          currentElement = currentElement.nextElementSibling;
        }
      }
      return contentObject;
    });
  }

  private async getGlider(page: Page) {
    // Execute o código dentro do contexto da página
    return await page.evaluate(() => {
      // Encontre o elemento que contém o texto "Breakdown per Glider"
      const breakdownGliderHeader = Array.from(document.querySelectorAll('h1')).find(
        (element) => element.innerHTML.trim() === 'Breakdown per Glider'
      );

      let contentObject = [];

      if (breakdownGliderHeader) {
        let currentElement = breakdownGliderHeader.nextElementSibling;

        // Iterar através dos elementos seguintes e coletar conteúdo das tags <h2>
        while (currentElement) {
          if (currentElement.tagName === 'H2') {
            const key = currentElement.innerHTML.trim();
            contentObject.push(key);
          }
          currentElement = currentElement.nextElementSibling;
        }
      }
      return contentObject;
    });
  }

  private async signIn({ username, password }: SignIn) {
    // Inicia o browser e headless false para ver o browser
    const browser = await pup.launch({ headless: false, ignoreHTTPSErrors: true });
    try {
      // Cria uma nova página
      const page = await browser.newPage();
      // this.getUserId(page);

      // Acessa a url
      await page.goto(this.loginUrl);
      console.log('Fui para a url!');

      // Aguarda o input de login
      await page.waitForSelector('.logintext');
      await page.type('.logintext', username);

      // Aguarda o input de senha
      await page.waitForSelector('.loginpassword');
      await page.type('.loginpassword', password);

      // Aguarda o botão de login
      await page.locator('.submitButton').click();

      const isLogged = await this.listenSignIn(page);
      console.log(isLogged);
      if (!isLogged) {
        throw new Error('Usuário ou senha inválidos');
      }

      await page.waitForSelector('.infoHeader');

      const data = await this.getUserName(page);
      data['id'] = this.id;

      await page.goto(
        `http://xcbrasil.com.br/stats/world/2024/brand:all,cat:0,class:all,xctype:all,club:all,pilot:0_${this.id},takeoff:all`
      );

      const takeoff = await this.getTakeoff(page);
      const glider = await this.getGlider(page);

      data['takeoff'] = takeoff;
      data['glider'] = glider;

      return data;
    } catch (error) {
      console.log(error);
      await browser.close();
      throw error;
    }
  }

  async execute({ password, username }: SignIn) {
    return await this.signIn({ password, username });
  }
}

export { XcWebService };
