export default {
  images: [
    {
      name: 'bangkok',
      url: '/locations/bangkok.jpg',
      N: 13.756330555555556,
      E: 100.50177777777778,
    },
    {
      name: 'brussels',
      url: '/locations/brussels.jpg',
      N: 50.85034,
      E: 4.35171,
    },
    {
      name: 'cannes',
      url: '/locations/cannes.jpg',
      N: 43.550179240915675, 
      E: 7.017164261996151,
    },
    {
      name: 'istanbul',
      url: '/locations/istanbul.jpg',
      N: 41.00823777777778,
      E: 28.97836111111111,
    },
    {
      name: 'london',
      url: '/locations/london.jpg',
      N: 51.5073219,
      E: -0.1276474,
    },
    {
      name: 'muenic',
      url: '/locations/muenic.jpg',
      N: 47.166666666666664,
      E: 8.333333333333334,
    },
    {
      name: 'new_york',
      url: '/locations/new_york.jpg',
      N: 40.7127753,
      E: -74.0059728,
    },
    {
      name: 'paris',
      url: '/locations/paris.jpg',
      N: 48.8566101,
      E: 2.3522219,
    },
    {
      name: 'prague',
      url: '/locations/prague.jpg',
      N: 50.05840817969087, 
      E: 14.435236369676376,
    },
    { name: 'sydney',
      url: '/locations/sydney.jpg',
      N: -33.86882,
      E: 151.20929,
    },
    {
      name: 'singapore',
      url: '/locations/singapore.jpg',
      N: 1.352083,
      E: 103.819839,
    },
    {
      name: 'taipei',
      url: '/locations/taipei.jpg',
      N: 25.037518,
      E: 121.563681,
    },
  ],
  flights: [
      {
        start: { // Frankfurt
          N: 50.05034966743938,
          E: 8.56827466590102,
        },
        ends: [
          {
            N: 13.756330555555556, // bangkok
            E: 100.50177777777778,
          },
          {
            N: 50.85034, // brussels
            E: 4.35171,
          },
          {
            N: 43.550179240915675, // cannes
            E: 7.017164261996151,
          },
          {
            N: 41.00823777777778, // istanbul
            E: 28.97836111111111,
          },
          {
            N: 51.5073219, // london
            E: -0.1276474,
          },
          {
            N: 47.166666666666664, // muenic
            E: 8.333333333333334,
          },
          {
            N: 40.7127753, // new york
            E: -74.0059728,
          },
          {
            N: 48.8566101, // paris
            E: 2.3522219,
          },
          {
            N: 50.05840817969087, // prague
            E: 14.435236369676376,
          },
          {
            N: -33.86882, // sydney
            E: 151.20929,
          },
          {
            N: 1.352083, // singapore
            E: 103.819839,
          },
          {
            N: 25.037518, // taipei
            E: 121.563681,
          },
        ],
      }
  ]
}