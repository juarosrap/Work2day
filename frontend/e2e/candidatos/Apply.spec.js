import { test, expect } from "@playwright/test";

test("Aplicación exitosa", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.locator('input[name="contrasena"]').press("Enter");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(3000);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Jobs" })
    .click();
  await page.getByRole("link", { name: "Apply" }).nth(2).click();
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.locator('text=Aplicación enviada con éxito')).toBeVisible();
});

test("Aplicación fallida", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.locator('input[name="contrasena"]').press("Enter");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(3000);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Jobs" })
    .click();
  await page.getByRole("link", { name: "Apply" }).nth(1).click();
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(page.locator("text=Ya has aplicado a esta oferta anteriormente")).toBeVisible();
});
