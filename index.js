import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const port = 3000
const app = express()
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "Minhdb2006",
    port: 5432,
});

db.connect()

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


async function checkVisitedCountry() {
    const response = await db.query("SELECT country_code FROM visited_countries")
    let countries = response.rows.map(row => row.country_code)
    return countries
}
async function getCountryCodeByName(countryName) {
    const response = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'", [countryName.toLowerCase()])
    const data = response.rows[0]
    const countryCode = data.country_code
    return countryCode
}
app.get("/", async (req, res) => {
    const countries = await checkVisitedCountry()
    res.render('index.ejs', {
        countries: countries,
        total: countries.length
    })
})

app.post("/add", async (req, res) => {
    const countryName = req.body.country
    try {
        const countryCode = await getCountryCodeByName(countryName)
        try {
            await db.query("INSERT INTO visited_countries (country_code) VALUES($1)", [countryCode])
            res.redirect("/")
        } catch (err) {
            const countries = await checkVisitedCountry()
            res.render('index.ejs', {
                countries: countries,
                total: countries.length,
                error: "Country name has been added"
            })
        }
    } catch (err) {
        const countries = await checkVisitedCountry()
        res.render('index.ejs', {
            countries: countries,
            total: countries.length,
            error: "Country name is not valid"
        })
    }
})
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
