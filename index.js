import express from "express";
import bodyParser from "body-parser";
import axios from "axios";


const app = express();
const port = 3000;

// mount static files
app.use(express.static("public"));

// mount middleware
app.use(bodyParser.urlencoded({ extended: true }));

// google APIKey
const googleGeoKeyAPI = "AIzaSyAUyQv4ZKuQTETDEbbh7y11rqChQrLb3bE";

// header for UV light API
const myHeaders = {
    "x-access-token": "openuv-3yquj97rltx5kuhd-io",
    "Content-Type": "application/json"
};
  
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

app.get("/", (req, res) => {
    res.render("index.ejs");
})


app.post("/location", async (req, res) => {
    try {
        const location = req.body.location;
        console.log(location);
        // google API
        const result = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleGeoKeyAPI}`);
        let coordinates = result.data.results[0].geometry.location;
        console.log(coordinates);
        const lat = coordinates.lat;
        const lng = coordinates.lng;

        // uv index API
        const response = await axios.get(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`, requestOptions);
        let data = response.data.result;
        // uv index
        let uv = data.uv;
        uv = (Math.round(uv * 100) / 100).toFixed(2);
        console.log(uv)
        // max uv index
        let maxUv = data.uv_max;
        maxUv = (Math.round(maxUv * 100) / 100).toFixed(2);

        // max uv time in the day
        const maxUvTime = new Date(data.uv_max_time);
        const options = {
            hour: "2-digit",
            minute: "2-digit",
        }
        const formattedTime = maxUvTime.toLocaleTimeString([], options);
        res.render("uv.ejs", { uv: uv, uvMax: maxUv, maxUvTime: formattedTime, cityName: location });
    } catch (error) {
        console.error('error', error);
   }
})

// test port
app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
});
