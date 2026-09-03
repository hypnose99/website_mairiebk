'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/actualites/:identifier/view',
      handler: 'actualite.incrementView',
      config: { auth: false },
    },
    {
      method: 'POST',
      path: '/actualites/:identifier/like',
      handler: 'actualite.incrementLike',
      config: { auth: false },
    },
    {
      method: 'DELETE',
      path: '/actualites/:identifier/like',
      handler: 'actualite.decrementLike',
      config: { auth: false },
    },
  ],
};