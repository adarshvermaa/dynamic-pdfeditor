const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());


app.post('/generate-pdf', async (req, res) => {
    const body = req.body;

    const templatePath = path.join(__dirname, '/public/service/1.html');
    const PathExcutive = path.join(__dirname, '/public/excutive/index.html');

    let html = await fs.readFileSync(templatePath, 'utf8');

    html = html.replace('Register-Id:- 12297918', body.RegisterId)
        .replace('E-Mail: Adarsh@gmail.com', body.Email)
        .replace('Phone No.: +919910892371', body.PhoneNo)
        .replace('Anand Farm, Sector 22', body.AnandFarmSector)
        .replace('Gurugram (122016)', body.Gurugram)
        .replace('(Haryana) India', body.Haryana)
        .replace('Certiﬁcate of Half Marathon', body.CertiﬁcateofHalfMarathon)
        .replace('This Certiﬁcate Presented to', body.ThisCertiﬁcatePresented)
        .replace('Rajesh Yadav', body.RajeshYadav)
        .replace('"The certificate of achievement is awarded to individuals who have', body.Thecertificateofachievementisawardedtoindividualswhohave)
        .replace('demonstrated outstanding performance in their field. Here’s an example text', body.demonstratedoutstandingperformanceintheirfieldHereanexampletext)
        .replace('for a certificate.', body.foracertificate)
        .replace('Date of Birth: 20-01-1980', body.DateofBirth)
        .replace('Gender: Male', body.GenderMale)
        .replace('Blood Group: A+', body.BloodGroupA)
        .replace('23-11-2023 22:34:00', body.dateTime)
        .replace('SIGNATURE', body.signature);

    fs.writeFileSync(PathExcutive, html);

    const browser = await puppeteer.launch(
        {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    );
    const page = await browser.newPage();
    await page.goto(`file://${PathExcutive}`, { waitUntil: 'networkidle2' });

    const pdfDir = path.join(__dirname, 'saved-pdfs');
    if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir, { recursive: true });
    }

    const pdfPath = path.join(pdfDir, `${body.RajeshYadav.replace(/ /g, '_')}.pdf`);

    await page.pdf({
        format: 'A4',
        path: pdfPath,
        printBackground: true,
        landscape: true
    });

    await browser.close();
    const fullUrl = `${req.protocol}s://${req.get('host')}/get-pdf/${body.RajeshYadav.replace(/ /g, '_')}`;
    res.send({ message: 'PDF generated successfully', path: pdfPath, pdfLink: fullUrl });
});

app.get("/get-pdf/:name", async (req, res) => {
    const params = req.params.name;
    const filePath = path.join(__dirname, "saved-pdfs", `${params}.pdf`);
    await res.sendFile(filePath);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
