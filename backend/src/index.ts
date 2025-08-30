import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import protectedRoutes from "./routes/protectedRoutes";
import adminRoutes from "./routes/adminRoutes"
import nodemailer from "nodemailer";


dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));

const transporter = nodemailer.createTransport({
    host: "127.0.0.1",
    port: 1025,
    secure: false,
});
  
export default transporter;

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));