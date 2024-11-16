const express = require('express');
const cors = require('cors');
const surveiRoutes = require('./surveiRoutes');
const respondenRoutes = require('./respondenRoutes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api/survei', surveiRoutes);
app.use('/api/responden', respondenRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});