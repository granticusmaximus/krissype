// src/services/shortLinkService.js
export const shortenUrl = async (longUrl) => {
    const response = await fetch("https://api.tinyurl.com/create", {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_API_TOKEN", // Replace with your actual token
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: longUrl,
        domain: "tinyurl.com",
      }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to shorten URL");
    }
  
    const data = await response.json();
    return data.data.tiny_url;
  };