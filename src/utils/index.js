// Manejo de fechas
const moment = require('moment');
// Librería llamadas http
const axios = require('axios');
// variables globales
const {
  colours,
  parametrosDefecto,
  urls,
  cabeceras,
  cetype,
} = require('./variables');
// Mostrar trazas de log a nivel debug
const LOG = require('debug')('app');
// Generación uuid
const { v4: uuidv4 } = require('uuid');

const validarParametros = (argv) => {
  const params = {};
  let error = false;
  // parseo de parámetros y validaciones
  if (argv.b === undefined) {
    console.log(
      colours.bg.yellow +
        colours.fg.black +
        'WARN: Parámetro -b sin informar. Se usará por defecto ' +
        parametrosDefecto.bloques.toString() +
        colours.reset
    );
    params.bloques = parametrosDefecto.bloques;
  } else {
    console.log(JSON.parse(argv.b));
    if (JSON.parse(argv.b).length < 1) {
      console.log(
        colours.bg.yellow +
          colours.fg.black +
          'WARN: Bloque sin informar. Se usará por defecto ' +
          parametrosDefecto.bloques.toString()
      );
      params.bloques = parametrosDefecto.bloques;
    } else {
      params.bloques = JSON.parse(argv.b);
    }
  }

  if (argv.i === undefined) {
    console.log(
      colours.bg.yellow +
        colours.fg.black +
        'WARN: Parámetro -i sin informar. Se usará por defecto ' +
        parametrosDefecto.iteraciones
    );
    params.iteraciones = parametrosDefecto.iteraciones;
  } else {
    if (argv.i < 1) {
      console.log(
        colours.bg.yellow +
          colours.fg.black +
          'WARN: Número iteraciones incorrecto. Se usará por defecto ' +
          parametrosDefecto.iteraciones
      );
      params.iteraciones = parametrosDefecto.iteraciones;
    } else {
      params.iteraciones = argv.i;
    }
  }

  if (argv.t === undefined) {
    console.log(
      colours.bg.yellow +
        colours.fg.black +
        'WARN: Parámetro -t sin informar. Se usará por defecto ' +
        parametrosDefecto.tienda
    );
    params.tienda = parametrosDefecto.tienda;
  } else {
    if (argv.t < 1) {
      console.log(
        colours.bg.yellow +
          colours.fg.black +
          'WARN: Tienda incorrecta. Se usará por defecto ' +
          parametrosDefecto.tienda
      );
      params.tienda = parametrosDefecto.tienda;
    } else {
      params.tienda = argv.t;
    }
  }

  if (argv.e === undefined) {
    console.log(
      colours.bg.red +
        'ERROR: Parámetro -e sin informar. Se necesita uno de los siguientes valores ' +
        parametrosDefecto.entidades +
        colours.reset
    );
    error = true;
  } else {
    entidad = parametrosDefecto.entidades.indexOf(argv.e);
    if (entidad == -1) {
      console.log(
        colours.bg.red +
          colours.fg.white +
          'ERROR: Entidad ' +
          argv.e +
          ' no parametrizada. Se necesita uno de los siguientes valores ' +
          parametrosDefecto.entidades +
          colours.reset
      );
      error = true;
    } else {
      params.entidad = entidad;
      params.url = urls[entidad];
      // en caso de ser autoconsumo, hay que añadir la tienda a la url
      if (entidad == 2) {
        params.url = params.url.replace('{t}', params.tienda);
      }
      params.headers = cabeceras;
      params.headers['ce-type'] = cetype[entidad];
    }
  }
  if (error) {
    process.exit(1);
  } else {
    return params;
  }
};

const generarEsqueletos = (params) => {
  switch (params.entidad) {
    // order
    case 0:
      return generarEsqueletosOrder(params);
      break;
    // warehouse-returns
    case 1:
      return generarEsqueletosReturns(params);
      break;
    // selfconsumption
    case 2:
      return generarEsqueletosSelf(params);
      break;
    // en caso contrario error
    default:
      console.log(
        colours.bg.red +
          colours.fg.white +
          'ERROR: Entidad ' +
          params.entidad +
          ' no parametrizada. Se necesita uno de los siguientes valores ' +
          parametrosDefecto.entidades +
          colours.reset
      );
      process.exit(1);
      break;
  }
};

const generarEsqueletosOrder = (params) => {
  LOG(
    'GENERAR ESQUELETOS ORDER' +
      params.bloques +
      params.tienda +
      params.iteraciones +
      params.entidad
  );
  // array con los esqueletos generados
  const esqueletos = [];

  // Por cada bloque generamos un esqueleto
  for (let i = 0; i < params.bloques.length; i++) {
    const orderJSON = {};
    // Obtenemos fechas
    const segundoServicio = moment()
      .hour(8)
      .minute(0)
      .second(0)
      .add(2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    orderJSON.storeCode = params.tienda;

    orderJSON.proposalDateTime = moment()
      .hour(8)
      .minute(0)
      .second(0)
      .format('YYYY-MM-DDTHH:mm:ss[Z]');
    orderJSON.proposalDeadlineDateTime = moment()
      .hour(8)
      .minute(30)
      .second(0)
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    orderJSON.firstServiceDateTime = moment()
      .hour(8)
      .minute(0)
      .second(0)
      .add(1, 'days')
      .format('YYYY-MM-DDTHH:mm:ss[Z]');
    orderJSON.orderType = 'RELEX';
    const orderItemTypeInfoArray = [];
    const orderItemTypeInfo = {};
    orderItemTypeInfo.orderItemType = 'Y';
    orderItemTypeInfo.secondServiceDateTime = segundoServicio;
    orderItemTypeInfo.provisioningBulks = 100;
    orderItemTypeInfo.truckingBulks = 100;
    orderJSON.isEditable = true;
    orderItemTypeInfoArray.push(orderItemTypeInfo);
    orderJSON.orderItemTypeInfo = orderItemTypeInfoArray;
    const orderLines = [];
    for (let j = 1; j <= params.bloques[i]; j++) {
      const orderLine = {};
      orderLine.itemCode = j;
      orderLine.quantityFormat = 'UNIT';
      orderLine.proposalQuantity = 10;
      orderLine.undeliveredOrderQuantity = 0;
      orderLine.currentStock = 0;
      orderLine.itemCapacity = 1;
      orderLine.isInPromotion = false;
      orderLine.salesForecast = [];
      orderLines.push(orderLine);
    }
    orderJSON.orderLines = orderLines;
    esqueletos.push(orderJSON);
  }
  return esqueletos;
};

const generarEsqueletosReturns = (params) => {
  LOG(
    'GENERAR ESQUELETOS RETURNS' +
      params.bloques +
      params.tienda +
      params.iteraciones +
      params.entidad
  );
  // array con los esqueletos generados
  const esqueletos = [];

  return esqueletos;
};

const generarEsqueletosSelf = (params) => {
  LOG(
    'GENERAR ESQUELETOS SELF' +
      params.bloques +
      params.tienda +
      params.iteraciones +
      params.entidad
  );
  // array con los esqueletos generados
  const esqueletos = [];

  // Por cada bloque generamos un esqueleto
  for (let i = 0; i < params.bloques.length; i++) {
    const selfJSON = {};

    selfJSON.employeeNumber = 9525113;
    selfJSON.selfConsumptionDateTime = moment()
      .hour(8)
      .minute(0)
      .second(0)
      .format('YYYY-MM-DDTHH:mm:ss[Z]');

    const selfLines = [];
    for (let j = 1; j <= params.bloques[i]; j++) {
      const selfLine = {};
      selfLine.itemCode = j;
      if (j % 2 == 0) {
        selfLine.unitsQuantity = 10;
      } else if (j % 3 == 0) {
        selfLine.weightQuantity = 10;
      } else {
        selfLine.unitsQuantity = 10;
        selfLine.weightQuantity = 10;
      }
      selfLines.push(selfLine);
    }
    selfJSON.selfConsumptionItems = selfLines;
    esqueletos.push(selfJSON);
  }
  return esqueletos;
};

const performanceTest = async (esqueletos, params, id) => {
  // Iteramos por cada esqueleto
  for (let i = 0; i < esqueletos.length; i++) {
    const datos = esqueletos[i];
    const bytes = new Intl.NumberFormat('es-ES').format(
      (JSON.stringify(esqueletos[i], null, 2).length / 1024).toFixed(0)
    );
    console.log(
      'BLOQUE ' +
        (i + 1) +
        ': Número artículos ' +
        params.bloques[i] +
        ' - Tamaño aprox ' +
        bytes +
        ' KB'
    );
    console.log('---------------------------------------------------------');
    let max = 0;
    let min = 999999999;
    let tiempoTotal = 0;
    let id = '';
    // Por cada esqueleto se itera N veces
    for (let j = 0; j < params.iteraciones; j++) {
      switch (params.entidad) {
        case 0:
          datos.orderProposalCode = uuidv4();
          id = datos.orderProposalCode;
          break;
        case 1:
          break;
        case 2:
          datos.movementId = uuidv4();
          id = datos.movementId;
          break;
      }
      const data = JSON.stringify(datos);
      const total = await enviarDatos(data, i, j, params, id);
      tiempoTotal += total;
      if (total > max) {
        max = total;
      }
      if (total < min) {
        min = total;
      }
    }
    console.log(
      'Tiempo Máximo = ' +
        max +
        ' -- Tiempo mínimo = ' +
        min +
        '  -- Media = ' +
        (tiempoTotal / params.iteraciones).toFixed(0) +
        ' -- Media por artículo = ' +
        (tiempoTotal / params.iteraciones / params.bloques[i]).toFixed(2)
    );
    console.log('\n');
  }
};

const enviarDatos = async (data, i, j, params, id) => {
  const start = new Date().getTime();
  let total = 0;
  await axios
    .post(params.url, data, {
      headers: params.headers,
      timeout: 50000,
    })
    .then((res) => {
      const end = new Date().getTime();
      const totalServicio = new Date(end - start).getTime();
      const mensaje =
        'Mensaje ' +
        (j+1) +
        ' de ' +
        params.iteraciones +
        ' - statusCode: ' +
        res.status +
        ' - ' + id +
        ' - Tiempo: ' + totalServicio + ' ms';
      console.log(mensaje);
      total = totalServicio;
    })
    .catch((error) => {
      console.log(error);
    });
  return total;
};

module.exports = { validarParametros, generarEsqueletos, performanceTest };
