import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
/* ROUTE IMPORTS */
import dashboardRoutes from './routes/dashboardRoutes';
import expenseRoutes from './routes/expenseRoutes';
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use('/dashboard', dashboardRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
