import { test, expect } from '@playwright/test';

test("Registrar Candidato exitoso", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign up" }).click();
  await page.locator('input[name="nombre"]').click();
  await page.locator('input[name="nombre"]').fill("Juan Ros ");
  await page.locator('input[name="telefono"]').click();
  await page.locator('input[name="telefono"]').fill("695865948");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("barrameda1@gmail.com");
  await page.locator('input[name="fechaNacimiento"]').fill("2003-03-10");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.locator('input[name="confirmarContrasena"]').click();
  await page.locator('input[name="confirmarContrasena"]').fill("123456");
  await page.locator('input[name="informacionPersonal"]').click();
  await page
    .locator('input[name="informacionPersonal"]')
    .fill("Ingeniero informatico");
  await page.locator('input[name="ubicacionCurriculum"]').click();
  await page.locator('input[name="ubicacionCurriculum"]').fill("Sevilla");
  await page.locator('input[name="formacionAcademica"]').click();
  await page
    .locator('input[name="formacionAcademica"]')
    .fill("Carrera universitaria");
  await page.locator('input[name="idiomasRaw"]').click();
  await page.locator('input[name="idiomasRaw"]').fill("inglés,español");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.locator("text=Registro exitoso. ¡Bienvenido!")).toBeVisible();
});

//Primero ejecutar el de arriba
test("Registrar Candidato repetido", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByRole("link", { name: "Sign up" }).click();
  await page.locator('input[name="nombre"]').click();
  await page.locator('input[name="nombre"]').fill("Juan Ros ");
  await page.locator('input[name="telefono"]').click();
  await page.locator('input[name="telefono"]').fill("695865948");
  await page.locator('input[name="correo"]').click();
  await page.locator('input[name="correo"]').fill("barrameda1@gmail.com");
  await page.locator('input[name="fechaNacimiento"]').fill("2003-03-10");
  await page.locator('input[name="contrasena"]').click();
  await page.locator('input[name="contrasena"]').fill("123456");
  await page.locator('input[name="confirmarContrasena"]').click();
  await page.locator('input[name="confirmarContrasena"]').fill("123456");
  await page.locator('input[name="informacionPersonal"]').click();
  await page
    .locator('input[name="informacionPersonal"]')
    .fill("Ingeniero informatico");
  await page.locator('input[name="ubicacionCurriculum"]').click();
  await page.locator('input[name="ubicacionCurriculum"]').fill("Sevilla");
  await page.locator('input[name="formacionAcademica"]').click();
  await page
    .locator('input[name="formacionAcademica"]')
    .fill("Carrera universitaria");
  await page.locator('input[name="idiomasRaw"]').click();
  await page.locator('input[name="idiomasRaw"]').fill("inglés,español");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(
    page.locator("text=Ya existe un candidato con ese correo electrónico")
  ).toBeVisible();
});



