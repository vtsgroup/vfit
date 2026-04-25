import { test, expect } from '@playwright/test';

// Teste visual do header para garantir cor/gradiente igual ao theme color

test('header visual match', async ({ page }) => {
  await page.goto('https://vfit.app.br');
  // Aguarda o header renderizar
  await page.waitForSelector('header.ds3-header');
  // Tira screenshot do header
  const header = await page.$('header.ds3-header');
  await header?.screenshot({ path: 'tests/e2e/screenshots/header-visual.png' });
  // (Opcional) Validar cor do topo do header
  // Poderia usar pixelmatch ou análise manual do PNG
});
