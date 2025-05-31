import { test, expect } from "@playwright/test";

test("Editar perfil", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Mi Perfil" }).click();
  await page.getByRole("link", { name: "Editar perfil" }).click();
  await page.locator('input[name="nombre"]').click();
  await page.locator('input[name="nombre"]').fill("Javier");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.locator('text=Perfil actualizado correctamente')).toBeVisible();
});
