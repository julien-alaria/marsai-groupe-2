import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();


async function main(req, res) {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_KEY,
    });
    await client.contacts.createContact({email: "julien.alaria@laplateforme.io", 
        listIds: [
            4,
        ],
    });
    res.status(200).json({message : "envoi newsletter réussi"});
}

export default { main };
