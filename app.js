require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get("/api/lokasi", async (req, res) => {
    // Mengambil nama kota dari input query frontend (default: Bandung City)
    const kota = req.query.kota || "Bandung City";
    const apikey = process.env.MAPTILER_API_KEY;
    const baseUrl = process.env.MAPTILER_BASE_URL;

    const url = `${baseUrl}/${encodeURIComponent(kota)}.json?key=${apikey}&language=id,en`;

    try {
        const response = await axios.get(url);
        const data = response.data;
        const feature = data.features[0];

        // Gunakan .text agar tidak undefined (bukan .matching_text)
        const lokasi = data.features[0].matching_text;
        const koordinat = feature.geometry.coordinates;
        const longitude = koordinat[0];
        const latitude = koordinat[1];

        let negara = "-";
        let provinsi = "-";
        let kecamatan = "-";

        if (feature.context) {
            feature.context.forEach((ctx) => {
                if (ctx.id.startsWith("country")) negara = ctx.text;
                if (ctx.id.startsWith("region") || ctx.id.startsWith("province")) provinsi = ctx.text;
                if (ctx.id.startsWith("subdistrict") || ctx.id.startsWith("district") || ctx.id.startsWith("locality")) {
                    kecamatan = ctx.text;
                }
            });
        }

        res.json({
            lokasi: lokasi,
            negara: negara,
            provinsi: provinsi,
            kecamatan: kecamatan,
            longitude: longitude,
            latitude: latitude
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Gagal mengambil data dari MapTiler." });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});