import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const client = new BrevoClient({
        apiKey: process.env.BREVO_KEY,
    });
    await client.contacts.createContact({});
}

export default { main };
