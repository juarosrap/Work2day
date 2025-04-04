const empleadorEmpresaController = require("../empleadorEmpresa.controller");
const EmpleadorEmpresa = require("../empleadorEmpresa.model");
const Oferta = require("../../Ofertas/oferta.model");
const Aplicacion = require("../../Aplicaciones/aplicacion.model");
const Candidato = require("../../Candidatos/candidato.model");
const ValoracionEmpleador = require("../../ValoracionesEmpleador/valoracionEmpleador.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the required modules
jest.mock("../empleadorEmpresa.model");
jest.mock("../../Ofertas/oferta.model");
jest.mock("../../Aplicaciones/aplicacion.model");
jest.mock("../../Candidatos/candidato.model");
jest.mock("../../ValoracionesEmpleador/valoracionEmpleador.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("EmpleadorEmpresa Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request and response objects
    req = {
      params: {},
      body: {},
      cookies: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    // Set environment variables for JWT
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.REFRESH_TOKEN_SECRET = "test-refresh-token-secret";
  });

  describe("obtenerEmpleadoresEmpresa", () => {
    it("debería retornar todos los empleadores", async () => {
      const mockEmpleadores = [
        { nombre: "Empresa 1", correo: "empresa1@example.com" },
        { nombre: "Empresa 2", correo: "empresa2@example.com" },
      ];
      EmpleadorEmpresa.find.mockResolvedValue(mockEmpleadores);

      await empleadorEmpresaController.obtenerEmpleadoresEmpresa(req, res);

      expect(EmpleadorEmpresa.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEmpleadores);
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      EmpleadorEmpresa.find.mockRejectedValue(mockError);

      await empleadorEmpresaController.obtenerEmpleadoresEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener empleadores",
        detalle: errorMsg,
      });
    });
  });

  describe("obtenerEmpleadorEmpresaPorId", () => {
    it("debería retornar un empleador por ID", async () => {
      const mockEmpleador = {
        _id: "123",
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        ofertas: [],
        valoraciones: [],
      };

      req.params.id = "123";

      // Creamos un mock para la primera llamada a populate
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEmpleador),
      });

      // Configuramos el mock de findById para devolver el objeto con el primer populate
      EmpleadorEmpresa.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await empleadorEmpresaController.obtenerEmpleadorEmpresaPorId(req, res);

      expect(EmpleadorEmpresa.findById).toHaveBeenCalledWith("123");
      expect(primerPopulateMock).toHaveBeenCalledWith("ofertas");
      expect(res.json).toHaveBeenCalledWith(mockEmpleador);
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";

      // Configuramos para que la segunda llamada a populate retorne null
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      EmpleadorEmpresa.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await empleadorEmpresaController.obtenerEmpleadorEmpresaPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador empresa no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";

      EmpleadorEmpresa.findById.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.obtenerEmpleadorEmpresaPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener el empleador",
        detalle: errorMsg,
      });
    });
  });

  describe("crearEmpleadorEmpresa", () => {
    it("debería crear un empleador exitosamente", async () => {
      const empleadorData = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: "password123",
      };

      req.body = empleadorData;

      EmpleadorEmpresa.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const mockEmpleadorGuardado = {
        _id: "123",
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
      };

      const saveMock = jest.fn().mockResolvedValue(mockEmpleadorGuardado);
      EmpleadorEmpresa.mockImplementation(() => ({
        save: saveMock,
      }));

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(EmpleadorEmpresa.findOne).toHaveBeenCalledWith({
        correo: "empresa@example.com",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockEmpleadorGuardado);
    });

    it("debería rechazar si el correo ya existe", async () => {
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: "password123",
      };

      EmpleadorEmpresa.findOne.mockResolvedValueOnce({
        _id: "123",
        correo: "empresa@example.com",
      });

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ya existe un empleador con ese correo electrónico",
      });
    });

    it("debería rechazar si el correoEmpresa ya existe", async () => {
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: "password123",
      };

      EmpleadorEmpresa.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: "123",
          correoEmpresa: "info@empresa.com",
        });

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ya existe un empleador con ese correo electrónico",
      });
    });

    it("debería rechazar si la contraseña no es proporcionada", async () => {
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
      };

      EmpleadorEmpresa.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña es requerida",
      });
    });

    it("debería rechazar si la contraseña no es un string", async () => {
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: 123456,
      };

      EmpleadorEmpresa.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe ser un string",
      });
    });

    it("debería rechazar si la contraseña es muy corta", async () => {
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: "12345",
      };

      EmpleadorEmpresa.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        correoEmpresa: "info@empresa.com",
        contrasena: "password123",
      };

      EmpleadorEmpresa.findOne.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.crearEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al crear empleador empresa",
        detalle: errorMsg,
      });
    });
  });

  describe("loginEmpleadorEmpresa", () => {
    it("debería iniciar sesión exitosamente", async () => {
      req.body = {
        correo: "empresa@example.com",
        contrasena: "password123",
      };

      const mockEmpleador = {
        _id: "123",
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        contrasena: "hashedPassword",
        tokenVersion: 1,
      };

      EmpleadorEmpresa.findOne.mockResolvedValue(mockEmpleador);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      await empleadorEmpresaController.loginEmpleadorEmpresa(req, res);

      expect(EmpleadorEmpresa.findOne).toHaveBeenCalledWith({
        correo: "empresa@example.com",
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Login exitoso",
        empleador: {
          id: "123",
          nombre: "Empresa Test",
          correo: "empresa@example.com",
        },
        accessToken: "access-token",
      });
    });

    it("debería rechazar si el correo o contraseña no son proporcionados", async () => {
      req.body = { correo: "empresa@example.com" };

      await empleadorEmpresaController.loginEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Correo y contraseña son requeridos",
      });
    });

    it("debería rechazar si el empleador no existe", async () => {
      req.body = {
        correo: "empresa@example.com",
        contrasena: "password123",
      };

      EmpleadorEmpresa.findOne.mockResolvedValue(null);

      await empleadorEmpresaController.loginEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería rechazar si la contraseña es incorrecta", async () => {
      req.body = {
        correo: "empresa@example.com",
        contrasena: "password123",
      };

      const mockEmpleador = {
        _id: "123",
        correo: "empresa@example.com",
        contrasena: "hashedPassword",
      };

      EmpleadorEmpresa.findOne.mockResolvedValue(mockEmpleador);
      bcrypt.compare.mockResolvedValue(false);

      await empleadorEmpresaController.loginEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        correo: "empresa@example.com",
        contrasena: "password123",
      };

      EmpleadorEmpresa.findOne.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.loginEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al iniciar sesión",
        detalle: errorMsg,
      });
    });
  });

  describe("refreshToken", () => {
    it("debería renovar el token exitosamente", async () => {
      req.cookies.refresh_token = "valid-refresh-token";

      const mockPayload = {
        id: "123",
        tokenVersion: 1,
      };

      const mockEmpleador = {
        _id: "123",
        correo: "empresa@example.com",
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(mockPayload);
      EmpleadorEmpresa.findById.mockResolvedValue(mockEmpleador);
      jwt.sign.mockReturnValue("new-access-token");

      await empleadorEmpresaController.refreshToken(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-refresh-token",
        process.env.REFRESH_TOKEN_SECRET
      );
      expect(EmpleadorEmpresa.findById).toHaveBeenCalledWith("123");
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Token renovado exitosamente",
        accessToken: "new-access-token",
      });
    });

    it("debería rechazar si no se proporciona refresh token", async () => {
      req.cookies = {};

      await empleadorEmpresaController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token no proporcionado",
      });
    });

    it("debería rechazar si el empleador no existe", async () => {
      req.cookies.refresh_token = "valid-refresh-token";

      const mockPayload = {
        id: "123",
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(mockPayload);
      EmpleadorEmpresa.findById.mockResolvedValue(null);

      await empleadorEmpresaController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "empleador no encontrado",
      });
    });

    it("debería rechazar si la tokenVersion no coincide", async () => {
      req.cookies.refresh_token = "valid-refresh-token";

      const mockPayload = {
        id: "123",
        tokenVersion: 1,
      };

      const mockEmpleador = {
        _id: "123",
        correo: "empresa@example.com",
        tokenVersion: 2,
      };

      jwt.verify.mockReturnValue(mockPayload);
      EmpleadorEmpresa.findById.mockResolvedValue(mockEmpleador);

      await empleadorEmpresaController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Token ya no es válido" });
    });

    it("debería manejar errores de verificación de token", async () => {
      req.cookies.refresh_token = "invalid-refresh-token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Token inválido");
      });

      await empleadorEmpresaController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token inválido o expirado",
      });
    });

    it("debería manejar errores generales", async () => {
      const errorMsg = "Error general";
      req.cookies.refresh_token = "valid-refresh-token";

      jwt.verify.mockReturnValue({ id: "123" });
      EmpleadorEmpresa.findById.mockImplementation(() => {
        throw new Error(errorMsg);
      });

      await empleadorEmpresaController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token inválido o expirado",
      });
    });
  });

  describe("logoutEmpleadorEmpresa", () => {
    it("debería cerrar sesión exitosamente", async () => {
      await empleadorEmpresaController.logoutEmpleadorEmpresa(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout succesful" });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error al cerrar sesión";
      const mockError = new Error(errorMsg);

      res.clearCookie.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.logoutEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al cerrar sesión",
        detalle: errorMsg,
      });
    });
  });

  describe("actualizarEmpleadorEmpresa", () => {
    it("debería actualizar un empleador exitosamente", async () => {
      req.params.id = "123";
      req.body = {
        nombre: "Updated Empresa",
        industria: "Tecnología",
      };

      const mockEmpleadorActualizado = {
        _id: "123",
        nombre: "Updated Empresa",
        correo: "empresa@example.com",
        industria: "Tecnología",
      };

      EmpleadorEmpresa.findByIdAndUpdate.mockResolvedValue(
        mockEmpleadorActualizado
      );

      await empleadorEmpresaController.actualizarEmpleadorEmpresa(req, res);

      expect(EmpleadorEmpresa.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockEmpleadorActualizado);
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";
      req.body = { nombre: "Updated Empresa" };

      EmpleadorEmpresa.findByIdAndUpdate.mockResolvedValue(null);

      await empleadorEmpresaController.actualizarEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador empresa no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";
      req.body = { nombre: "Updated Empresa" };

      EmpleadorEmpresa.findByIdAndUpdate.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.actualizarEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al actualizar empleador",
        detalle: errorMsg,
      });
    });
  });

  describe("eliminarEmpleadorEmpresa", () => {
    it("debería eliminar un empleador y sus datos relacionados", async () => {
      req.params.id = "123";

      const mockEmpleador = {
        _id: "123",
        nombre: "Empresa Test",
        correo: "empresa@example.com",
        ofertas: ["oferta1", "oferta2"],
      };

      const mockAplicaciones = [
        { _id: "app1", candidatoId: "candidato1", ofertaId: "oferta1" },
        { _id: "app2", candidatoId: "candidato2", ofertaId: "oferta2" },
      ];

      EmpleadorEmpresa.findById.mockResolvedValue(mockEmpleador);
      EmpleadorEmpresa.findByIdAndDelete.mockResolvedValue(mockEmpleador);
      ValoracionEmpleador.deleteMany.mockResolvedValue({ deletedCount: 2 });

      Aplicacion.find
        .mockResolvedValueOnce([mockAplicaciones[0]])
        .mockResolvedValueOnce([mockAplicaciones[1]]);

      Candidato.findByIdAndUpdate.mockResolvedValue({ n: 1 });
      Aplicacion.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Oferta.deleteMany.mockResolvedValue({ deletedCount: 2 });

      await empleadorEmpresaController.eliminarEmpleadorEmpresa(req, res);

      expect(EmpleadorEmpresa.findById).toHaveBeenCalledWith("123");
      expect(ValoracionEmpleador.deleteMany).toHaveBeenCalledWith({
        empleadorId: "123",
      });
      expect(Aplicacion.find).toHaveBeenCalledWith({ ofertaId: "oferta1" });
      expect(Aplicacion.find).toHaveBeenCalledWith({ ofertaId: "oferta2" });
      expect(Candidato.findByIdAndUpdate).toHaveBeenCalledWith("candidato1", {
        $pull: { aplicaciones: "app1" },
      });
      expect(Candidato.findByIdAndUpdate).toHaveBeenCalledWith("candidato2", {
        $pull: { aplicaciones: "app2" },
      });
      expect(Aplicacion.deleteMany).toHaveBeenCalledWith({
        ofertaId: "oferta1",
      });
      expect(Aplicacion.deleteMany).toHaveBeenCalledWith({
        ofertaId: "oferta2",
      });
      expect(Oferta.deleteMany).toHaveBeenCalledWith({
        _id: { $in: ["oferta1", "oferta2"] },
      });
      expect(EmpleadorEmpresa.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({
        mensaje:
          "Empleador empresa y sus datos relacionados eliminados correctamente",
      });
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";

      EmpleadorEmpresa.findById.mockResolvedValue(null);

      await empleadorEmpresaController.eliminarEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador empresa no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";

      EmpleadorEmpresa.findById.mockImplementation(() => {
        throw mockError;
      });

      await empleadorEmpresaController.eliminarEmpleadorEmpresa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al eliminar empleador empresa",
        detalle: errorMsg,
      });
    });
  });
});
