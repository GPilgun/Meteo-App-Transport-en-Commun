const traductionsFR = {
  "Sunny": "Ensoleillé",
  "Partly cloudy": "Partiellement nuageux",
  "Cloudy": "Nuageux",
  "Overcast": "Couvert",
  "Light rain": "Pluie légère",
  "Moderate rain": "Pluie modérée",
  "Heavy rain": "Forte pluie",
  "Patchy rain possible": "Pluie éparse possible",
  "Clear": "Clair",
  "Mist": "Brume",
  "Haze":"Brouillard",
  // Ajoute d'autres traductions au besoin
};

// 1. Load default city from conf.json
async function chargerConfiguration() {
  const response = await fetch("conf.json");
  if (!response.ok) throw new Error("Erreur de chargement de conf.json");
  return response.json();
}

// 2. Get weather data from wttr.in
async function obtenirMeteo(city) {
  //const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;//
  const url = `https://api.open-meteo.com/${encodeURIComponent(city)}?format=j1`;
   // ?latitude=48.85&longitude=2.35&current_weather=true&hourly=temperature_2m,wind_speed_10m"
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Erreur de récupération des données météo.");
  const data = await response.json();

  const condition = data.current_condition[0];
  const rawDescription = condition.weatherDesc[0].value;

  if (!traductionsFR[rawDescription]) {
    console.warn("Traduction manquante pour :", rawDescription);
  }

  const translated = traductionsFR[rawDescription] || rawDescription;

  return {
  temp: condition.temp_C,
  humidity: condition.humidity,
  wind: condition.windspeedKmph, 
  description: translated
};
}

// 3. Display the weather in the HTML
function afficherMeteo(city, data) {
  document.getElementById("weatherCity").textContent = city;
  document.getElementById("weatherDesc").textContent = data.description;
  document.getElementById("weatherTemp").textContent = `Température : ${data.temp} °C`;
  document.getElementById("weatherHumidity").textContent = `Humidité : ${data.humidity}%`;
  document.getElementById("weatherWind").textContent = `Vent : ${data.wind} km/h`;
  document.getElementById("weatherTime").textContent = `Mis à jour : ${new Date().toLocaleTimeString()}`;

  // 4. Show weather icons
  const iconMap = {
    "Ensoleillé": "https://openweathermap.org/img/wn/01d.png",
    "Partiellement nuageux": "https://openweathermap.org/img/wn/02d.png",
    "Nuageux": "https://openweathermap.org/img/wn/03d.png",
    "Couvert": "https://openweathermap.org/img/wn/04d.png",
    "Pluie légère": "https://openweathermap.org/img/wn/09d.png",
    "Pluie modérée": "https://openweathermap.org/img/wn/10d.png",
    "Forte pluie": "https://openweathermap.org/img/wn/10d.png",
    "Brume": "https://openweathermap.org/img/wn/50d.png",
    "Clair": "https://openweathermap.org/img/wn/01n.png",
     "Par défaut": "https://openweathermap.org/img/wn/01d.png",
  };

  const iconURL = iconMap[data.description] || iconMap["Par défaut"];
  const iconEl = document.getElementById("weatherIcon");

  if (iconURL) {
    iconEl.src = iconURL;
    iconEl.style.display = "inline";
  } else {
    iconEl.style.display = "none";
  }
}

// 5. Update weather from conf.json (preset data)
async function miseAJourMeteo() {
  try {
    const config = await chargerConfiguration();
    const data = await obtenirMeteo(config.city);
    afficherMeteo(config.city, data);
  } catch (err) {
    document.getElementById("weather").innerHTML = "Erreur : " + err.message;
    console.error(err);
  }
}

  
// Initial call and hourly refresh  

miseAJourMeteo(); // Call once immediately when the page loads

setInterval(miseAJourMeteo, 3600000); // 3600000 ms = 1 hour

//setInterval(miseAJourMeteo, 10000); // for testing: every 10 sec                 
