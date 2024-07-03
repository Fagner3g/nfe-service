import { Page } from 'puppeteer';

class XcUserService {
  async getUserName(page: Page) {
    await page.waitForSelector('.infoHeader');
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
}

export const xcUserService = new XcUserService();
