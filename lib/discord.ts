interface DiscordEmbed {
  title: string;
  description?: string;
  color?: number;
}

export async function sendDiscordNotification(
  webhookUrl: string,
  embed: DiscordEmbed
): Promise<void> {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [
          {
            title: embed.title,
            description: embed.description || '',
            color: embed.color || 0x7c3aed, // Purple default
            timestamp: new Date().toISOString(),
            footer: { text: 'systm.re' },
          },
        ],
      }),
    });
  } catch (error) {
    console.error('Discord notification error:', error);
  }
}
