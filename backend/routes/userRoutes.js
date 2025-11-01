import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
const router = express.Router();

// Register user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: "All fields required" });
        console.log(`Data received: Name: ${name}, Email: ${email}, Password: ${password}`);
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            points: user.points,
            badges: user.badges
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });

        const user = await User.findOne({ email }).populate("badges")
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        res.json({ message: "Login successful", user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default router;
