const empleadorParticularController = require("../empleadorParticular.controller");
const EmpleadorParticular = require("../empleadorParticular.model");
const Oferta = require("../../Ofertas/oferta.model");
const Aplicacion = require("../../Aplicaciones/aplicacion.model");
const Candidato = require("../../Candidatos/candidato.model");
const ValoracionEmpleador = require("../../ValoracionesEmpleador/valoracionEmpleador.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Mock the required modules
jest.mock("../empleadorParticular.model");
jest.mock("../../Ofertas/oferta.model");
jest.mock("../../Aplicaciones/aplicacion.model");
jest.mock("../../Candidatos/candidato.model");
jest.mock("../../ValoracionesEmpleador/valoracionEmpleador.model");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("EmpleadorParticular Controller", () => {
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

  describe("obtenerEmpleadoresParticular", () => {
    it("debería retornar todos los empleadores", async () => {
      const mockEmpleadores = [
        { nombre: "Juan Pérez", correo: "juan@example.com" },
        { nombre: "María López", correo: "maria@example.com" },
      ];
      EmpleadorParticular.find.mockResolvedValue(mockEmpleadores);

      await empleadorParticularController.obtenerEmpleadoresParticular(
        req,
        res
      );

      expect(EmpleadorParticular.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockEmpleadores);
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      EmpleadorParticular.find.mockRejectedValue(mockError);

      await empleadorParticularController.obtenerEmpleadoresParticular(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener empleadores",
        detalle: errorMsg,
      });
    });
  });

  describe("obtenerEmpleadorParticularPorId", () => {
    it("debería retornar un empleador por ID", async () => {
      const mockEmpleador = {
        _id: "123",
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        ofertas: [],
        valoraciones: [],
      };

      req.params.id = "123";

      // Creamos un mock para la primera llamada a populate
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEmpleador),
      });

      // Configuramos el mock de findById para devolver el objeto con el primer populate
      EmpleadorParticular.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await empleadorParticularController.obtenerEmpleadorParticularPorId(
        req,
        res
      );

      expect(EmpleadorParticular.findById).toHaveBeenCalledWith("123");
      expect(primerPopulateMock).toHaveBeenCalledWith("ofertas");
      expect(res.json).toHaveBeenCalledWith(mockEmpleador);
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";

      // Configuramos para que la segunda llamada a populate retorne null
      const primerPopulateMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      EmpleadorParticular.findById.mockReturnValue({
        populate: primerPopulateMock,
      });

      await empleadorParticularController.obtenerEmpleadorParticularPorId(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador particular no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";

      EmpleadorParticular.findById.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.obtenerEmpleadorParticularPorId(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener el empleador",
        detalle: errorMsg,
      });
    });
  });

  describe("crearEmpleadorParticular", () => {
    it("debería crear un empleador exitosamente", async () => {
      const empleadorData = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
        contrasena: "password123",
      };

      req.body = empleadorData;

      EmpleadorParticular.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const mockEmpleadorGuardado = {
        _id: "123",
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
      };

      const saveMock = jest.fn().mockResolvedValue(mockEmpleadorGuardado);
      EmpleadorParticular.mockImplementation(() => ({
        save: saveMock,
      }));

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(EmpleadorParticular.findOne).toHaveBeenCalledWith({
        correo: "juan@example.com",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockEmpleadorGuardado);
    });

    it("debería rechazar si el correo ya existe", async () => {
      req.body = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
        contrasena: "password123",
      };

      EmpleadorParticular.findOne.mockResolvedValue({
        _id: "123",
        correo: "juan@example.com",
      });

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Ya existe un empleador con ese correo electrónico",
      });
    });

    it("debería rechazar si la contraseña no es proporcionada", async () => {
      req.body = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
      };

      EmpleadorParticular.findOne.mockResolvedValue(null);

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña es requerida",
      });
    });

    it("debería rechazar si la contraseña no es un string", async () => {
      req.body = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
        contrasena: 123456,
      };

      EmpleadorParticular.findOne.mockResolvedValue(null);

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe ser un string",
      });
    });

    it("debería rechazar si la contraseña es muy corta", async () => {
      req.body = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
        contrasena: "12345",
      };

      EmpleadorParticular.findOne.mockResolvedValue(null);

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        telefono: "123456789",
        contrasena: "password123",
      };

      EmpleadorParticular.findOne.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.crearEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al crear empleador particular",
        detalle: errorMsg,
      });
    });
  });

  describe("loginEmpleadorParticular", () => {
    it("debería iniciar sesión exitosamente", async () => {
      req.body = {
        correo: "juan@example.com",
        contrasena: "password123",
      };

      const mockEmpleador = {
        _id: "123",
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        contrasena: "hashedPassword",
        tokenVersion: 1,
      };

      EmpleadorParticular.findOne.mockResolvedValue(mockEmpleador);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      await empleadorParticularController.loginEmpleadorParticular(req, res);

      expect(EmpleadorParticular.findOne).toHaveBeenCalledWith({
        correo: "juan@example.com",
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
        Empleador: {
          id: "123",
          nombre: "Juan Pérez",
          correo: "juan@example.com",
        },
        accessToken: "access-token",
      });
    });

    it("debería rechazar si el correo o contraseña no son proporcionados", async () => {
      req.body = { correo: "juan@example.com" };

      await empleadorParticularController.loginEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Correo y contraseña son requeridos",
      });
    });

    it("debería rechazar si el empleador no existe", async () => {
      req.body = {
        correo: "juan@example.com",
        contrasena: "password123",
      };

      EmpleadorParticular.findOne.mockResolvedValue(null);

      await empleadorParticularController.loginEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería rechazar si la contraseña es incorrecta", async () => {
      req.body = {
        correo: "juan@example.com",
        contrasena: "password123",
      };

      const mockEmpleador = {
        _id: "123",
        correo: "juan@example.com",
        contrasena: "hashedPassword",
      };

      EmpleadorParticular.findOne.mockResolvedValue(mockEmpleador);
      bcrypt.compare.mockResolvedValue(false);

      await empleadorParticularController.loginEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: "Credenciales inválidas",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.body = {
        correo: "juan@example.com",
        contrasena: "password123",
      };

      EmpleadorParticular.findOne.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.loginEmpleadorParticular(req, res);

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
        correo: "juan@example.com",
        tokenVersion: 1,
      };

      jwt.verify.mockReturnValue(mockPayload);
      EmpleadorParticular.findById.mockResolvedValue(mockEmpleador);
      jwt.sign.mockReturnValue("new-access-token");

      await empleadorParticularController.refreshToken(req, res);

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-refresh-token",
        process.env.REFRESH_TOKEN_SECRET
      );
      expect(EmpleadorParticular.findById).toHaveBeenCalledWith("123");
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        mensaje: "Token renovado exitosamente",
        accessToken: "new-access-token",
      });
    });

    it("debería rechazar si no se proporciona refresh token", async () => {
      req.cookies = {};

      await empleadorParticularController.refreshToken(req, res);

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
      EmpleadorParticular.findById.mockResolvedValue(null);

      await empleadorParticularController.refreshToken(req, res);

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
        correo: "juan@example.com",
        tokenVersion: 2,
      };

      jwt.verify.mockReturnValue(mockPayload);
      EmpleadorParticular.findById.mockResolvedValue(mockEmpleador);

      await empleadorParticularController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Token ya no es válido" });
    });

    it("debería manejar errores de verificación de token", async () => {
      req.cookies.refresh_token = "invalid-refresh-token";

      jwt.verify.mockImplementation(() => {
        throw new Error("Token inválido");
      });

      await empleadorParticularController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Refresh token inválido o expirado",
      });
    });
  });

  describe("logoutEmpleadorParticular", () => {
    it("debería cerrar sesión exitosamente", async () => {
      await empleadorParticularController.logoutEmpleadorParticular(req, res);

      expect(res.clearCookie).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith({ message: "Logout succesful" });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error al cerrar sesión";
      const mockError = new Error(errorMsg);

      res.clearCookie.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.logoutEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al cerrar sesión",
        detalle: errorMsg,
      });
    });
  });

  describe("actualizarEmpleadorParticular", () => {
    it("debería actualizar un empleador exitosamente", async () => {
      req.params.id = "123";
      req.body = {
        nombre: "Juan Pérez Actualizado",
        telefono: "987654321",
      };

      const mockEmpleadorActualizado = {
        _id: "123",
        nombre: "Juan Pérez Actualizado",
        correo: "juan@example.com",
        telefono: "987654321",
      };

      EmpleadorParticular.findByIdAndUpdate.mockResolvedValue(
        mockEmpleadorActualizado
      );

      await empleadorParticularController.actualizarEmpleadorParticular(
        req,
        res
      );

      expect(EmpleadorParticular.findByIdAndUpdate).toHaveBeenCalledWith(
        "123",
        req.body,
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockEmpleadorActualizado);
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";
      req.body = { nombre: "Juan Pérez Actualizado" };

      EmpleadorParticular.findByIdAndUpdate.mockResolvedValue(null);

      await empleadorParticularController.actualizarEmpleadorParticular(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador particular no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";
      req.body = { nombre: "Juan Pérez Actualizado" };

      EmpleadorParticular.findByIdAndUpdate.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.actualizarEmpleadorParticular(
        req,
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al actualizar empleador",
        detalle: errorMsg,
      });
    });
  });

  describe("eliminarEmpleadorParticular", () => {
    it("debería eliminar un empleador y sus datos relacionados", async () => {
      req.params.id = "123";

      const mockEmpleador = {
        _id: "123",
        nombre: "Juan Pérez",
        correo: "juan@example.com",
        ofertas: ["oferta1", "oferta2"],
      };

      const mockAplicaciones = [
        { _id: "app1", candidatoId: "candidato1", ofertaId: "oferta1" },
        { _id: "app2", candidatoId: "candidato2", ofertaId: "oferta2" },
      ];

      EmpleadorParticular.findById.mockResolvedValue(mockEmpleador);
      EmpleadorParticular.findByIdAndDelete.mockResolvedValue(mockEmpleador);
      ValoracionEmpleador.deleteMany.mockResolvedValue({ deletedCount: 2 });

      Aplicacion.find
        .mockResolvedValueOnce([mockAplicaciones[0]])
        .mockResolvedValueOnce([mockAplicaciones[1]]);

      Candidato.findByIdAndUpdate.mockResolvedValue({ n: 1 });
      Aplicacion.deleteMany.mockResolvedValue({ deletedCount: 2 });
      Oferta.deleteMany.mockResolvedValue({ deletedCount: 2 });

      await empleadorParticularController.eliminarEmpleadorParticular(req, res);

      expect(EmpleadorParticular.findById).toHaveBeenCalledWith("123");
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
      expect(EmpleadorParticular.findByIdAndDelete).toHaveBeenCalledWith("123");
      expect(res.json).toHaveBeenCalledWith({
        mensaje:
          "Empleador particular y sus datos relacionados eliminados correctamente",
      });
    });

    it("debería retornar 404 si el empleador no existe", async () => {
      req.params.id = "123";

      EmpleadorParticular.findById.mockResolvedValue(null);

      await empleadorParticularController.eliminarEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Empleador particular no encontrado",
      });
    });

    it("debería manejar errores", async () => {
      const errorMsg = "Error de base de datos";
      const mockError = new Error(errorMsg);
      req.params.id = "123";

      EmpleadorParticular.findById.mockImplementation(() => {
        throw mockError;
      });

      await empleadorParticularController.eliminarEmpleadorParticular(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al eliminar empleador particular",
        detalle: errorMsg,
      });
    });
  });
});
