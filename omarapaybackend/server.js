const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors()); // allow RN app
app.use(express.json());

require('./config/db'); // connect DB

app.use('/api/users', require('./routes/userRoutes'));

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
