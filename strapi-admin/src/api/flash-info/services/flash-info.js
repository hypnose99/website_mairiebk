'use strict';

/**
 * flash-info service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::flash-info.flash-info');
