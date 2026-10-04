const express = require("express");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();

app.use(cors());
app.use(express.json());

const accidents = [];

fs.createReadStream("./data/indian_roads_dataset.csv")
  .pipe(csv())
  .on("data", (row) => {
    accidents.push(row);
  })
  .on("end", () => {
    console.log(`Loaded ${accidents.length} accident records`);
  });

app.get("/", (req, res) => {
  res.json({
    message: "Road Accident Analytics API is running"
  });
});

app.get("/api/accidents", (req, res) => {
  res.json(accidents);
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//dsdsada

app.get("/api/stats", (req, res) => {
  const totalAccidents = accidents.length;

  const totalCasualties = accidents.reduce(
    (sum, accident) => sum + Number(accident.casualties || 0),
    0
  );

  const fatalAccidents = accidents.filter(
    (accident) => accident.accident_severity === "fatal"
  ).length;

  const peakHourAccidents = accidents.filter(
    (accident) => accident.is_peak_hour === "1"
  ).length;

  res.json({
    totalAccidents,
    totalCasualties,
    fatalAccidents,
    peakHourAccidents
  });
});


app.get("/api/accidents-by-hour", (req, res) => {
  const hourlyData = {};

  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = 0;
  }

  accidents.forEach((accident) => {
    const hour = Number(accident.hour);

    if (hour >= 0 && hour < 24) {
      hourlyData[hour]++;
    }
  });

  const result = Object.entries(hourlyData).map(([hour, count]) => ({
    hour: Number(hour),
    count
  }));

  res.json(result);
});


app.get("/api/accidents-by-severity", (req, res) => {
  const severity = {};

  accidents.forEach((accident) => {
    const value = accident.accident_severity;

    if (!severity[value]) {
      severity[value] = 0;
    }

    severity[value]++;
  });

  const result = Object.entries(severity).map(([name, count]) => ({
    name,
    count
  }));

  res.json(result);
});


app.get("/api/accidents-by-cause", (req, res) => {
  const causes = {};

  accidents.forEach((accident) => {
    const cause = accident.cause;

    if (!causes[cause]) {
      causes[cause] = 0;
    }

    causes[cause]++;
  });

  const result = Object.entries(causes)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});


app.get("/api/accidents-by-weather", (req, res) => {
  const weather = {};

  accidents.forEach((accident) => {
    const condition = accident.weather;

    if (!weather[condition]) {
      weather[condition] = 0;
    }

    weather[condition]++;
  });

  const result = Object.entries(weather)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});


app.get("/api/accidents-by-city", (req, res) => {
  const cities = {};

  accidents.forEach((accident) => {
    const city = accident.city;

    if (!cities[city]) {
      cities[city] = 0;
    }

    cities[city]++;
  });

  const result = Object.entries(cities)
    .map(([name, count]) => ({
      name,
      count
    }))
    .sort((a, b) => b.count - a.count);

  res.json(result);
});


app.get("/api/hotspots", (req, res) => {
  const hotspots = accidents.map((accident) => ({
    city: accident.city,
    state: accident.state,
    latitude: Number(accident.latitude),
    longitude: Number(accident.longitude),
    severity: accident.accident_severity,
    cause: accident.cause,
    riskScore: Number(accident.risk_score)
  }));

  res.json(hotspots);
});