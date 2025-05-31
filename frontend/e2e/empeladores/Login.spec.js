import { test, expect } from "@playwright/test";

test("Login empleador", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.getByRole("combobox").selectOption("empleadorParticular");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("bust@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("text=Login exitoso. ¡Bienvenido!")).toBeVisible();
}); 