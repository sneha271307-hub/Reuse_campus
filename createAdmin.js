require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user");

async function resetAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const email = "renest.admin@example.com";
        const newPassword = "ReNestAdmin@2026";

        const passwordHash = await bcrypt.hash(newPassword, 12);

        const admin = await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    name: "reNEST Admin",
                    passwordHash,
                    role: "admin"
                },
                $setOnInsert: {
                    email,
                    campus: "",
                    hostel: ""
                }
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        console.log("Admin account ready!");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("Password reset successfully.");

    } catch (error) {
        console.error("Admin password reset failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
}

resetAdminPassword();