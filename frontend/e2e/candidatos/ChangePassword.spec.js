import { test, expect } from "@playwright/test";

test("ChangePassword exitoso", async ({ page }) => {
  const oldPassword = "123456";
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill(oldPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Mi Perfil" }).click();
  await page.getByRole("link", { name: "Cambiar contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña actual" }).click();
  await page
    .getByRole("textbox", { name: "Contraseña actual" })
    .fill(oldPassword);
  await page.getByRole("textbox", { name: "Nueva contraseña" }).click();
  await page.getByRole("textbox", { name: "Nueva contraseña" }).fill("1234567");
  await page.getByRole("button", { name: "Restablecer contraseña" }).click();
  //await expect(page.locator('text=Contraseña actualizada con éxito')).toBeVisible();
  await page.getByRole("button", { name: "Cerrar Sesión" }).click();
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("1234567");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator("text=Login exitoso. ¡Bienvenido!")).toBeVisible();
});

test("ChangePassword fallido", async ({ page }) => {
  const oldPassword = "123456";
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("pontos@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill(oldPassword);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.getByRole("link", { name: "Mi Perfil" }).click();
  await page.getByRole("link", { name: "Cambiar contraseña" }).click();
  await page.getByRole("textbox", { name: "Contraseña actual" }).click();
  await page
    .getByRole("textbox", { name: "Contraseña actual" })
    .fill(oldPassword);
  await page.getByRole("textbox", { name: "Nueva contraseña" }).click();
  await page
    .getByRole("textbox", { name: "Nueva contraseña" })
    .fill(oldPassword);
  await page.getByRole("button", { name: "Restablecer contraseña" }).click();
  await expect(
    page.locator(
      "text=La contraseña nueva no puede ser la misma que la actual."
    )
  ).toBeVisible();
  
});

