const fs = require('fs');
fetch('https://raw.githubusercontent.com/eesur/country-codes-lat-long/master/country-codes-lat-long-alpha3.json')
  .then(res => res.json())
  .then(data => {
    const map = {};
    data.ref_country_codes.forEach(c => {
      map[c.country] = { lat: c.latitude, lng: c.longitude };
    });
    fs.writeFileSync('frontend/public/country-coords.json', JSON.stringify(map, null, 2));
    console.log('Saved coords!');
  });
