import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool de conexiones a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "api_media_db",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función para verificar el estado de la conexión
export const probarConexion = async () => {
  try {
    const conexion = await pool.getConnection();
    console.log("✅ Conexión exitosa a la base de datos MySQL (XAMPP)");
    conexion.release();
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos MySQL:", error.message);
  }
};

export default pool;
