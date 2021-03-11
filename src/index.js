// Ejemplo llamada => DEBUG=app node src/index.js -i=10 -b=[10,20,40,80] -e=selfconsumption -t=9115

const fs = require('fs');
// Gestión parámetros línea de comandos
const argv = require('minimist')(process.argv.slice(2));
// Mostrar trazas de log a nivel debug
const LOG = require('debug')('app');
// utilidades varias
const Utils = require('./utils');
// variables globales
const { parametrosDefecto } = require('./utils/variables');

const pruebaRendimiento = async () => {
  // Validamos los parámetros de entrada
  const parametros = Utils.validarParametros(argv);

  LOG(
    'Performance Test para entidad ' +
      parametrosDefecto.entidades[parametros.entidad] +
      ' con bloques de tamaño ' +
      parametros.bloques.toString() +
      ' y ' +
      parametros.iteraciones +
      ' iteraciones'
  );

  // Generar los esqueletos de la entidad seleccionada
  const esqueletos = Utils.generarEsqueletos(parametros);
  // enviamos los mensajes
  const resultados = await Utils.performanceTest(esqueletos, parametros);
};

pruebaRendimiento();
