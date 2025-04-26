const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

require('dotenv').config();
const mongoURI = process.env.MONGO_URL;

// Better error reporting for MongoDB connection
console.log("Attempting to connect to MongoDB...");
if (!mongoURI) {
    console.error("MONGO_URL is not defined in .env file");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => {
        console.error("MongoDB Connection Error:");
        console.error(err);
        console.error("Connection string used (hiding credentials):", 
            mongoURI.replace(/:\/\/([^:]+):([^@]+)@/, "://****:****@"));
    });

// Schema for form data in the format received from the frontend
const formSchema = new mongoose.Schema({
    title: String,
    fields: [
        {
            id: String,
            type: String,
            label: String,
            options: [String],
            selectedOptions: [Number],
            value: String
        }
    ]
});

const Form = mongoose.model("Form", formSchema);

// POST endpoint to receive form data
app.post("/api/forms", async (req, res) => {
    try {
        console.log("Received form submission:", JSON.stringify(req.body, null, 2));
        
        const formData = req.body;
        const newForm = new Form(formData);
        const savedForm = await newForm.save();
        
        console.log("Form saved successfully with ID:", savedForm._id);
        
        res.json({
            message: "Form Submitted Successfully",
            data: savedForm
        });
    } catch (error) {
        console.error("Error saving form:", error);
        res.status(500).json({ message: "Failed To Submit Form", error: error.message });
    }
});

// GET endpoint to retrieve all forms
app.get("/api/forms", async (req, res) => {
    try {
        const forms = await Form.find();
        console.log(`Retrieved ${forms.length} forms from database`);
        res.json(forms);
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({ message: "Failed To Fetch Forms", error: error.message });
    }
});

// DELETE endpoint to delete a form
app.delete("/api/forms/:id", async (req, res) => {
    try {
        const result = await Form.findByIdAndDelete(req.params.id);
        console.log(`Deleted form with ID: ${req.params.id}`);
        res.json({ message: "Form Deleted Successfully" });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({ message: "Failed To Delete Form", error: error.message });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});