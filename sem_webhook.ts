import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import express, { Request, Response } from 'express';
import qrcode from 'qrcode-terminal';

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr: string) => {
    console.log('Escaneie o QR Code abaixo com o WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp conectado!');
});

client.on('message', (msg: Message) => {
    console.log(`Mensagem recebida de ${msg.from}: ${msg.body}`);
});

// Endpoint para enviar mensagens
app.post('/send-message', async (req: Request, res: Response) => {
    const { number, message }: { number: string; message: string } = req.body;

    try {
        await client.sendMessage(`${number}@c.us`, message);
        res.status(200).json({ status: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar a mensagem', details: error });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});

client.initialize();
