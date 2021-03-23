// Listado de colores para salida a consola
const colours = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m', // Scarlet
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m',
  },
};

const parametrosDefecto = {
  bloques: [100, 500, 1000, 2000],
  iteraciones: 10,
  entidades: ['order', 'warehouse-return', 'selfconsumption'],
  tienda: 59,
};

const urls = [
  'https://supply-orders-data-es.test.store.dgrp.io/orders-data',
  'https://warehouse-returns-data-es.dev.store.dgrp.io/v2/warehouse-returns/stores/{t}/returns',
  'https://stock-selfconsumption-event-es.test.store.dgrp.io/v1/self-consumptions/stores/{t}',
];

const cabeceras = {
  'Content-Type': 'application/json',
  'ce-event-method': 'add',
  'ce-id': 'performance-test',
  'ce-source': '/performance',
  'ce-type': ''
};

const cetype = [
  'com.dia.store.supply.order.proposal',
  'com.dia.store.warehouse.returns',
  'com.dia.store.stock.selfconsumption',
];

module.exports = { colours, parametrosDefecto, urls, cabeceras, cetype };
