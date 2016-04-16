var google_directions = require('./google_directions')

if (!process.env.GOOGLE_API_KEY) {
    console.log("Please set Google API key as environment variable!")
    process.exit(1)
}

var client = google_directions(process.env.GOOGLE_API_KEY)

client.walkDirections("Mannheim Hbf", "Alte Feuerwache Mannheim", (err, result) => {
    if (err) throw err
    console.log(result.routes[0].legs[0].steps)
})