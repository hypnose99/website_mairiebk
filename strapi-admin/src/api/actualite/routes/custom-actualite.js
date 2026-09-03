'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/actualites/:id/view',
      handler: 'actualite.incrementView',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/actualites/:id/like',
      handler: 'actualite.incrementLike',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/actualites/:id/like',
      handler: 'actualite.decrementLike',
      config: { auth: false },
    },
  ],
};