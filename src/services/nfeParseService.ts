import pup, { Page } from 'puppeteer';
import logService from './log-service';

class NfeParseService {
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

  async findBarcode(barcode: string) {
    const browser = await pup.launch({ headless: false });

    // Cria uma nova página
    const page = await browser.newPage();

    logService.error(JSON.stringify(barcode));
    // Acessa a url
    await page.goto(
      `https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=${barcode}%7C2%7C1%7C1%7C56a3d21a6102bea3f5ef4ae0b51550e0eec07a20`,
      { waitUntil: 'networkidle2' }
    );

    // Extrai os dados da tabela
    const items = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('#myTable tr'));
      return rows.map((row) => {
        const cells = row.querySelectorAll('td');

        const unit = cells[2].innerText.split(': ')[1];
        let quantity = null;
        if (unit === 'kg') {
          quantity = cells[1].innerText.split(': ')[1];
        } else {
          quantity = Number(cells[1].innerText.split(': ')[1]).toFixed(0);
        }
        const name = cells[0].getElementsByTagName('h7').item(0)?.textContent?.trim() || '';
        const value = cells[3].innerText.split(': R$ ')[1];
        return { name, quantity, unit, value };
      });
    });

    await page.waitForSelector('#formPrincipal\\:j_idt74\\:0\\:j_idt82');

    const data = await page.evaluate(() => {
      const elCompany = document.querySelector('b');
      const elPayment = document.querySelector('#formPrincipal\\:j_idt74\\:0\\:j_idt82');
      const elQuantity = document.querySelectorAll('.col-lg-2 strong');

      const quantity = elQuantity[0] ? elQuantity[0].textContent?.trim() : null || '';
      const value = elQuantity[1] ? elQuantity[1]?.textContent?.trim() : null || '';
      const company = elCompany?.textContent?.trim() || '';
      const payment = elPayment?.textContent?.trim().split(' - ')[1].trim() || '';
      return { company, payment, value, quantity };
    });

    return { products: items, ...data };
  }
}

export const nfeParseService = new NfeParseService();
