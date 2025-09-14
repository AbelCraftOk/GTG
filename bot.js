const BOT_TOKEN = "MTQxNjg4NTUxMzc4ODU5MjE2MA.Gxt0es.yKBRYcC-C9ZQnoPn59OxALoMIbIXU7osHJky28";
const CHANNEL_ID = "1416893017222283377";

const boton = document.getElementById("sendBtn");
const status = document.getElementById("status");

boton.addEventListener("click", async () => {
    const embed = {
        embeds: [
            {
                title: "Mensaje de prueba",
                description: "¡Este es un embed enviado desde mi bot!",
                color: 0x00ff00
            }
        ]
    };

    try {
        const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bot ${BOT_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(embed)
        });

        if (response.ok) {
            status.textContent = "Embed enviado ✅";
            status.style.color = "green";
        } else {
            status.textContent = `Error ❌ ${response.status}`;
            status.style.color = "red";
            console.error(await response.text());
        }
    } catch (error) {
        status.textContent = "Error de conexión ❌";
        status.style.color = "red";
        console.error(error);
    }
});