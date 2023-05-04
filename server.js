const { default: mongoose } = require('mongoose')
const app = require('./app')
require('dotenv').config()
const { DB_HOST, PORT } = process.env
mongoose
  .connect(DB_HOST)
  .then(() => app.listen(PORT, () => console.log("Database connection successful!")))
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })

