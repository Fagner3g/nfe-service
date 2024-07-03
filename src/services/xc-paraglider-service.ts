import { Page } from 'puppeteer';

class XcParagliderService {
  private async getTakeoff(page: Page, id: string) {
    await page.goto(
      `http://xcbrasil.com.br/stats/world/2024/brand:all,cat:0,class:all,xctype:all,club:all,pilot:0_${id},takeoff:all`
    );

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

  async getGliderAndTakeoff(page: Page, id: string) {
    const takeoff = await this.getTakeoff(page, id);
    const glider = await this.getGlider(page);
    return { takeoff, glider };
  }
}

export const xcParagliderService = new XcParagliderService();
