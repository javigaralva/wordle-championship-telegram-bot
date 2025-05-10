require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const axios = require('axios');

const uri = process.env.MONGO_URL;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function runMongoDBConnection() {
  console.log("Intentando conectar a MongoDB...");
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    console.log("Conexión a MongoDB establecida con éxito.");
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Ping a la base de datos exitoso. La conexión funciona correctamente.");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  } finally {
    // Ensures that the client will close when you finish/error
    if (client) {
      await client.close();
      console.log("Conexión a MongoDB cerrada.");
    }
  }
}

async function checkWebsiteAccessibilityAxios(url) {
  console.log(`Intentando acceder a la URL: ${url}`);
  try {
    const response = await axios.get(url);
    console.log(`Petición GET a ${url} completada con código de estado: ${response.status}`);

    if (response.status >= 200 && response.status < 300) {
      console.log(`Acceso exitoso a la página: ${url}`);
      console.log(`Código de estado: ${response.status}`);
      console.log(`Tipo de contenido: ${response.headers['content-type']}`);
      return true;
    } else {
      console.error(`Error al acceder a la página: ${url}`);
      console.error(`Código de estado: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`Ocurrió un error durante la petición a ${url}:`, error.message);
    return false;
  }
}

async function main() {
  // Ejecutar la conexión a MongoDB primero
  await runMongoDBConnection();
  console.log("\n--- Comprobando accesibilidad de sitios web ---");

  // Definir las URLs a probar
  const websiteURL = 'https://www.example.com';
  const anotherURL = 'https://httpstat.us/404';
  const invalidURL = 'htps://invalida';

  // Ejecutar las comprobaciones de accesibilidad en orden
  await checkWebsiteAccessibilityAxios(websiteURL);
  console.log("\n---");
  await checkWebsiteAccessibilityAxios(anotherURL);
  console.log("\n---");
  await checkWebsiteAccessibilityAxios(invalidURL);
}

main();