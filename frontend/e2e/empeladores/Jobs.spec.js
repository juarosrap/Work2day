import { test, expect } from "@playwright/test";

test("Crear trabajo exitoso", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.selectOption("select[name=tipo]", "Empleador Particular");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("bust@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("link", { name: "+ Nueva oferta de trabajo" }).click();
  await page.locator('input[name="titulo"]').click();
  await page.locator('input[name="titulo"]').fill("Repartidor de flyers");
  await page.locator('input[name="descripcion"]').click();
  await page
    .locator('input[name="descripcion"]')
    .fill("Se busca persona que reparta flyers por la calle.");
  await page.locator('input[name="ubicacion"]').click();
  await page.locator('input[name="ubicacion"]').fill("Sevilla, Triana");
  await page.getByRole("spinbutton").click();
  await page.getByRole("spinbutton").fill("799");
  await page.locator('input[name="fechaInicio"]').fill("2025-06-02");
  await page.locator('input[name="fechaFin"]').fill("2025-06-08");
  await page.locator('input[name="requisitos"]').click();
  await page.locator('input[name="requisitos"]').fill("simpatico");
  await page.getByRole("button", { name: "Crear" }).click();
  await expect(page.locator("text=Oferta creada con éxito.")).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Jobs" })
    .click();
  await page.getByRole("textbox", { name: "Search a job" }).click();
  await page.getByRole("textbox", { name: "Search a job" }).fill("repartidor");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.locator("text=Repartidor de flyers")).toBeVisible();
});


test("Eliminar un trabajo", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.selectOption("select[name=tipo]", "Empleador Particular");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("bust@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", {name: "2"}).click();
  await page.getByRole('link', { name: "Eliminar"}).click();
  await page.getByRole("button", { name: "Sí" }).click();
  await expect(page.locator("text=Oferta eliminada correctamente.")).toBeVisible();
});


test("Editar un trabajo", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign in" }).click();
  await page.selectOption("select[name=tipo]", "Empleador Particular");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("bust@gmail.com");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(4000);
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.waitForTimeout(2000);
  await page.getByRole("button", { name: "2" }).click();
  await page.getByRole("link", { name: "Editar" }).click();
  await page.locator('input[name="titulo"]').click();
  await page.locator('input[name="titulo"]').fill("Gestor de airbnbs");
  await page.getByRole("button", {name: "Actualizar"}).click(); 
  await expect(
    page.locator("text=Oferta actualizada con éxito.")
  ).toBeVisible();
});