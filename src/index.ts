import express from 'express';
import cors from 'cors';
import eventUsers from './routes/eventUsers.js';
import authRoute from './routes/authRoute.js';
import lapanganRoute from './routes/lapanganRoute.js';
import tenantKriteriaRoute from './routes/tenantKriteriaRoute.js';
import kriteriaRoute from './routes/kriteriaRoute.js';
import tenantRoute from './routes/tenantRoute.js';
import rekomendasiRoute from './routes/rekomendasiRoute.js';
import spkRoute from './routes/spkRoute.js';


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use("/users", eventUsers);
app.use("/auth", authRoute);
app.use("/kriteria", kriteriaRoute);
app.use("/tenant", tenantRoute);
app.use("/lapangan", lapanganRoute);
app.use("/matriks", tenantKriteriaRoute);
app.use("/rekomendasi", rekomendasiRoute);
app.use("/spk", spkRoute);

app.get('/', (req, res) => {
  res.send('Database Berhasil Terhubung!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});