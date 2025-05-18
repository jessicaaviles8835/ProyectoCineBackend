const pool = require('./db');

const INTERVALO_MINUTOS = 1;

function iniciarLiberadorReservas() {
  setInterval(async () => {
    try {
      const [resultado] = await pool.promise().query(`
        DELETE from reserva
        WHERE estado <> 'Reservada'
          AND TIMESTAMPDIFF(MINUTE, fechatransaccion, NOW()) >= 5
      `);

      const { affectedRows } = resultado;
      if (affectedRows > 0) {
        console.log(`${affectedRows} reservas borradas automáticamente.`);
      }
    } catch (err) {
      console.error('Error al borrar reservas:', err.message);
    }
  }, INTERVALO_MINUTOS * 60 * 1000);
}

module.exports = iniciarLiberadorReservas;