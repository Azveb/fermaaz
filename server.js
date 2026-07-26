// server.js
// cPanel (Phusion Passenger) üçün Next.js Standalone server wrapper-i

const path = require('path');

// Mühitin production olduğuna əmin oluruq
process.env.NODE_ENV = 'production';

// Port cPanel tərəfindən (və ya .env-dən) təyin olunur. Standart olaraq 3000
process.env.PORT = process.env.PORT || 3000;

// Hostname üçün (bəzən Next.js bunu tələb edir)
process.env.HOSTNAME = '0.0.0.0';

// Next.js tərəfindən generasiya edilmiş standalone serveri işə salırıq
require('./.next/standalone/server.js');
