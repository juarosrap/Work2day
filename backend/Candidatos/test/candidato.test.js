const candidatoController = require("../candidato.controller");
const Candidato = require("../candidato.model");
const Aplicacion = require("../../Aplicaciones/aplicacion.model");
const ValoracionCandidato = require("../../ValoracionesCandidato/valoracionCandidato.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the required modules
jest.mock("../candidato.model");
jest.mock("../../Aplicaciones/aplicacion.model");
jest.mock("../../ValoracionesCandidato/valoracionCandidato.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");


describe("Candidato Controller", () => {
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

  describe("obtenerCandidatos", () => {
    it("debería retornar todos los candidatos", async () => {
      const mockCandidatos = [
        { nombre: "Test User 1" },
        { nombre: "Test User 2" },
      ];
      Candidato.find.mockResolvedValue(mockCandidatos);

      await candidatoController.obtenerCandidatos(req, res);

      expect(Candidato.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCandidatos);
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      Candidato.find.mockRejectedValue(mockError);

      await candidatoController.obtenerCandidatos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener candidatos",
        detalle: errorMsg,
      });
    });
  });

  describe("obtenerCandidatoPorId", () => {
    it("debería retornar un candidato por ID", async () => {
      const mockCandidato = {
        _id: "123",
        nombre: "Test User",
        aplicaciones: [],
        valoraciones: [],
      };

      req.params.id = "123";

      // Creamos un mock para la primera llamada a populate
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockCandidato),
      });

      // Configuramos el mock de findById para devolver el objeto con el primer populate
      Candidato.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await candidatoController.obtenerCandidatoPorId(req, res);

      expect(Candidato.findById).toHaveBeenCalledWith("123");
      expect(primerPopulateMock).toHaveBeenCalledWith("aplicaciones");
      expect(res.json).toHaveBeenCalledWith(mockCandidato);
    });

    it("debería retornar 404 si el candidato no existe", async () => {
      req.params.id = "123";

      // Configuramos para que la segunda llamada a populate retorne null
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      Candidato.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await candidatoController.obtenerCandidatoPorId(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Candidato no encontrado",
      });
    });
  });

  describe("crearCandidato", () => {
    it("debería crear un candidato exitosamente", async () => {
      const candidatoData = {
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: "password123",
      };

      req.body = candidatoData;

      Candidato.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const mockCandidatoGuardado = {
        _id: "123",
        nombre: "Test User",
        correo: "test@example.com",
      };

      const saveMock = jest.fn().mockResolvedValue(mockCandidatoGuardado);
      Candidato.mockImplementation(() => ({
        save: saveMock,
      }));

      await candidatoController.crearCandidato(req, res);

      expect(Candidato.findOne).toHaveBeenCalledWith({
        correo: "test@example.com",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCandidatoGuardado);
    });

    it("debería rechazar si el correo ya existe", async () => {
      req.body = {
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: "password123",
      };

      Candidato.findOne.mockResolvedValue({
        _id: "123",
        correo: "test@example.com",
      });

      await candidatoController.crearCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ya existe un candidato con ese correo electrónico",
      });
    });

    it("debería rechazar si la contraseña no es proporcionada", async () => {
      req.body = {
        nombre: "Test User",
        correo: "test@example.com",
      };

      Candidato.findOne.mockResolvedValue(null);

      await candidatoController.crearCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña es requerida",
      });
    });

    it("debería rechazar si la contraseña no es un string", async () => {
      req.body = {
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: 123456,
      };

      Candidato.findOne.mockResolvedValue(null);

      await candidatoController.crearCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe ser un string",
      });
    });

    it("debería rechazar si la contraseña es muy corta", async () => {
      req.body = {
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: "12345",
      };

      Candidato.findOne.mockResolvedValue(null);

      await candidatoController.crearCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: "password123",
      };

      Candidato.findOne.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.crearCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al crear candidato",
        detalle: errorMsg,
      });
    });
  });

  describe("loginCandidato", () => {
    it("debería iniciar sesión exitosamente", async () => {
      req.body = {
        correo: "test@example.com",
        contrasena: "password123",
      };

      const mockCandidato = {
        _id: "123",
        nombre: "Test User",
        correo: "test@example.com",
        contrasena: "hashedPassword",
        tokenVersion: 1,
      };

      Candidato.findOne.mockResolvedValue(mockCandidato);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      await candidatoController.loginCandidato(req, res);

      expect(Candidato.findOne).toHaveBeenCalledWith({
        correo: "test@example.com",
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
        candidato: {
          id: "123",
          nombre: "Test User",
          correo: "test@example.com",
        },
        accessToken: "access-token",
      });
    });

    it("debería rechazar si el correo o contraseña no son proporcionados", async () => {
      req.body = { correo: "test@example.com" };

      await candidatoController.loginCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Correo y contraseña son requeridos",
      });
    });

    it("debería rechazar si el candidato no existe", async () => {
      req.body = {
        correo: "test@example.com",
        contrasena: "password123",
      };

      Candidato.findOne.mockResolvedValue(null);

      await candidatoController.loginCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería rechazar si la contraseña es incorrecta", async () => {
      req.body = {
        correo: "test@example.com",
        contrasena: "password123",
      };

      const mockCandidato = {
        _id: "123",
        correo: "test@example.com",
        contrasena: "hashedPassword",
      };

      Candidato.findOne.mockResolvedValue(mockCandidato);
      bcrypt.compare.mockResolvedValue(false);

      await candidatoController.loginCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        correo: "test@example.com",
        contrasena: "password123",
      };

      Candidato.findOne.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.loginCandidato(req, res);

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

      const mockCandidato = {
        _id: "123",
        correo: "test@example.com",
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(mockPayload);
      Candidato.findById.mockResolvedValue(mockCandidato);
      jwt.sign.mockReturnValue("new-access-token");

      await candidatoController.refreshToken(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-refresh-token",
        process.env.REFRESH_TOKEN_SECRET
      );
      expect(Candidato.findById).toHaveBeenCalledWith("123");
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Token renovado exitosamente",
        accessToken: "new-access-token",
      });
    });

    it("debería rechazar si no se proporciona refresh token", async () => {
      req.cookies = {};

      await candidatoController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token no proporcionado",
      });
    });

    it("debería rechazar si el candidato no existe", async () => {
      req.cookies.refresh_token = "valid-refresh-token";

      const mockPayload = {
        id: "123",
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(mockPayload);
      Candidato.findById.mockResolvedValue(null);

      await candidatoController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Candidato no encontrado",
      });
    });

    it("debería rechazar si la tokenVersion no coincide", async () => {
      req.cookies.refresh_token = "valid-refresh-token";

      const mockPayload = {
        id: "123",
        tokenVersion: 1,
      };

      const mockCandidato = {
        _id: "123",
        correo: "test@example.com",
        tokenVersion: 2,
      };

      jwt.verify.mockReturnValue(mockPayload);
      Candidato.findById.mockResolvedValue(mockCandidato);

      await candidatoController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Token ya no es válido" });
    });

    it("debería manejar errores generales", async () => {
      const errorMsg = "Error general";
      const mockError = new Error(errorMsg);
      req.cookies.refresh_token = "valid-refresh-token";

      jwt.verify.mockImplementation(() => {
        return { id: "123" }; 
      });

      Candidato.findById.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token inválido o expirado",
      });
    });
  });

  describe("logoutCandidato", () => {
    it("debería cerrar sesión exitosamente", async () => {
      await candidatoController.logoutCandidato(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout succesful" });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error al cerrar sesión";
      const mockError = new Error(errorMsg);

      res.clearCookie.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.logoutCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al cerrar sesión",
        detalle: errorMsg,
      });
    });
  });

  describe("actualizarCandidato", () => {
    it("debería actualizar un candidato exitosamente", async () => {
      req.params.id = "123";
      req.body = {
        nombre: "Updated Name",
        habilidades: ["JavaScript", "Node.js"],
      };

      const mockCandidatoActualizado = {
        _id: "123",
        nombre: "Updated Name",
        correo: "test@example.com",
        habilidades: ["JavaScript", "Node.js"],
      };

      Candidato.findByIdAndUpdate.mockResolvedValue(mockCandidatoActualizado);

      await candidatoController.actualizarCandidato(req, res);

      expect(Candidato.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockCandidatoActualizado);
    });

    it("debería retornar 404 si el candidato no existe", async () => {
      req.params.id = "123";
      req.body = { nombre: "Updated Name" };

      Candidato.findByIdAndUpdate.mockResolvedValue(null);

      await candidatoController.actualizarCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Candidato no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";
      req.body = { nombre: "Updated Name" };

      Candidato.findByIdAndUpdate.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.actualizarCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al actualizar candidato",
        detalle: errorMsg,
      });
    });
  });

  describe("eliminarCandidato", () => {
    it("debería eliminar un candidato y sus datos relacionados", async () => {
      req.params.id = "123";

      const mockCandidatoEliminado = {
        _id: "123",
        nombre: "Test User",
        correo: "test@example.com",
      };

      Candidato.findByIdAndDelete.mockResolvedValue(mockCandidatoEliminado);
      Aplicacion.deleteMany.mockResolvedValue({ deletedCount: 2 });
      ValoracionCandidato.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await candidatoController.eliminarCandidato(req, res);

      expect(Candidato.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(Aplicacion.deleteMany).toHaveBeenCalledWith({
        candidatoId: "123",
      });
      expect(ValoracionCandidato.deleteMany).toHaveBeenCalledWith({
        candidatoId: "123",
      });
      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Candidato eliminado correctamente",
      });
    });

    it("debería retornar 404 si el candidato no existe", async () => {
      req.params.id = "123";

      Candidato.findByIdAndDelete.mockResolvedValue(null);

      await candidatoController.eliminarCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Candidato no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";

      Candidato.findByIdAndDelete.mockImplementation(() => {
        throw mockError;
      });

      await candidatoController.eliminarCandidato(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al eliminar candidato",
        detalle: errorMsg,
      });
    });
  });
});

