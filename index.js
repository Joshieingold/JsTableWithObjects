/////////////
// Globals //
/////////////

let allFlights;

////////////////////
// Main Functions //
////////////////////

window.onload = function () {
    RequestJsonData(true);
    AddButtonById("#apply-filters", UpdateTableWithFilters);
    AddButtonById("#show-all", UpdateTableWithoutFilters);
};

// Gets values from JSON and builds table with filter depending on user.
function RequestJsonData(alert = false) {
    let url = "./flights.json";
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            allFlights = JSON.parse(xhr.responseText);
            if (alert) {
                window.alert("Flight data is ready!");
            }
            CreateTable(allFlights);
        }
    };
    xhr.open("GET", url, true);
    xhr.send();
}

// Creates HTML table from Obj passed and sets it in the DOM
function CreateTable(inObj) {
    let table = document.querySelector("#the-table-container");
    let html = "";
    html += "<table><tr>";
    html += " <th>Flight Number</th> ";
    html += " <th>Day</th> ";
    html += " <th>Time</th> ";
    html += " <th>Destination</th> ";
    html += " <th>Pilot</th> ";
    html += " <th>Co-Pilot</th> ";
    html += "</tr>";
    for (let i = 0; i < inObj.flights.length; i++) {
        let flightDetails = inObj.flights[i];
        let pilotDetails = FormatPilot(flightDetails.pilot);
        let copilotDetails = FormatPilot(flightDetails.copilot);
        let destDetails = FormatDestination(flightDetails.destination);
        html += "<tr>";
        html += `<td>${flightDetails.flightNumber}</td>`;
        html += `<td>${flightDetails.dayOfWeek}</td>`;
        html += `<td>${flightDetails.departureTime}</td>`;
        html += `<td>${destDetails}</td>`;
        html += `<td>${pilotDetails}</td>`;
        html += `<td>${copilotDetails}</td>`;
        html += "</tr>";
    }
    html += "</table>";
    table.innerHTML = html;
    document.querySelector("#table-title").innerHTML =
        `Flights (${inObj.flights.length})`;
}

// Passes object through all filters unless otherwise stipulated
function FilterJson(inObj, filter = true) {
    if (!filter) {
        return inObj;
    }
    // At the cost of performance I did this, but can be done in one loop
    // instead of filters*O(n)
    inObj = FilterCity(inObj);
    inObj = FilterCountry(inObj);
    inObj = FilterRegion(inObj);
    inObj = FilterDay(inObj);
    inObj = FilterMinMax(inObj);
    inObj = FilterPilot(inObj);
    inObj = FilterCopilot(inObj);
    return inObj;
}
/////////
// New //
/////////

function FilterObj(inObj) {
    let cityInput = GetValueById("#cityInput").toLowerCase();
    let countryInput = GetValueById("#countryInput").toLowerCase();
    let regionInput = GetValueById("#regionInput").toLowerCase();
    let dayInput = GetValueById("#dayInput").toLowerCase();
    let pilotBool = document.querySelector("#pilot-required").checked;
    let copilotBool = document.querySelector("#copilot-required").checked;
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentObj = inObj.flights[i];
        if (!CheckCity(currentObj.destination.city, cityInput)) {
            continue;
        }
        if (!CheckCountry(currentObj.destination.country, countryInput)) {
            continue;
        }

        // Idea if it fails one the loop will continue;
    }
}
function CheckCity(currentDataString, targetDataString) {
    currentDataString = currentDataString.toLowerCase();

    if (targetDataString === "") {
        return true;
    }
    if (currentDataString === "" || undefined) {
        return false;
    }
    if (targetDataString.startsWith(currentDataString)) {
        return true;
    }
    return false;
}

function CheckCountry(currentDataString, targetDataString) {
    currentDataString = currentDataString.toLowerCase();

    if (targetDataString === "") {
        return true;
    }
    if (currentDataString === "" || undefined) {
        return false;
    }
    if (targetDataString.startsWith(currentDataString)) {
        return true;
    }
    return false;
}
function CheckRegion(currentDataString) {}
function CheckDay(currentDataString) {}
function CheckMinMax(currentDataString) {}
function CheckPilot(currentDataString) {}
function CheckCopilot(currentDataString) {}

////////////////////
// Click Handlers //
////////////////////

// For "Apply Filters"
function UpdateTableWithFilters() {
    let filteredData = FilterJson(allFlights);
    CreateTable(filteredData);
}

// For "Show All Flights"
function UpdateTableWithoutFilters() {
    CreateTable(allFlights);
}

/////////////
// Filters //
/////////////

// Double checks data and passes over cities that do not start with input.
function FilterCity(inObj) {
    let searchCity = GetValueById("#city-input").toLowerCase();
    let returnArray = [];
    if (searchCity === "") {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.destination.city === undefined) {
            continue;
        }
        if (currentData.destination.city.toLowerCase().startsWith(searchCity)) {
            returnArray.push(currentData);
        }
    }
    return { flights: returnArray };
}

// Double checks data and passes over countries that do not start with input.
function FilterCountry(inObj) {
    let searchCountry = GetValueById("#country-input").toLowerCase();
    let returnArray = [];
    if (searchCountry === "") {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.destination.country === undefined) {
            continue;
        }
        if (
            currentData.destination.country
                .toLowerCase()
                .startsWith(searchCountry)
        ) {
            returnArray.push(currentData);
        }
    }
    return { flights: returnArray };
}

// Double checks data and passes over regions that do not start with input.
function FilterRegion(inObj) {
    let searchRegion = GetValueById("#region-input");
    let returnArray = [];
    if (searchRegion === "") {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.destination.region === undefined) {
            continue;
        }
        if (currentData.destination.region === Number(searchRegion)) {
            returnArray.push(currentData);
        }
    }
    return { flights: returnArray };
}

// Passes over data that is not selected day, unless "Any"
function FilterDay(inObj) {
    let searchDay = GetValueById("#depart-input");
    let returnArray = [];
    if (searchDay === "Any") {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.dayOfWeek === searchDay) {
            returnArray.push(currentData);
        }
    }
    return { flights: returnArray };
}

// Cleans minimum/maximum inputs and skips data out of bounds
function FilterMinMax(inObj) {
    let min = GetValueById("#depart-min");
    let max = GetValueById("#depart-max");
    let returnArray = [];
    if (min === "") {
        min = 0;
    }
    if (max === "") {
        max = 2400;
    }
    min = Number(min);
    max = Number(max);

    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.departureTime < min) {
            continue;
        }
        if (currentData.departureTime > max) {
            continue;
        }
        returnArray.push(currentData);
    }
    return { flights: returnArray };
}

// Passes over data that does not have a pilot defined
function FilterPilot(inObj) {
    let searchPilot = document.querySelector("#pilot-required").checked;
    let returnArray = [];
    if (searchPilot === false) {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.pilot === undefined) {
            continue;
        }
        returnArray.push(currentData);
    }
    return { flights: returnArray };
}

// Passes over data that does not have a copilot defined
function FilterCopilot(inObj) {
    let searchPilot = document.querySelector("#copilot-required").checked;
    let returnArray = [];
    if (searchPilot === false) {
        return inObj;
    }
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentData = inObj.flights[i];
        if (currentData.copilot === undefined) {
            continue;
        }
        returnArray.push(currentData);
    }
    return { flights: returnArray };
}

///////////////////////////////
// Quality of Life Functions //
///////////////////////////////

// Adds an event listener to form without boilerplate
function AddButtonById(id, func) {
    let btn = document.querySelector(id);
    btn.addEventListener("click", func);
}

// Gets a value from an input and returns the string result.
function GetValueById(id) {
    return document.querySelector(id).value.trim();
}

// Given a pilot object will return formatted string
function FormatPilot(pilotObj) {
    if (pilotObj === undefined) {
        return "not yet assigned";
    }
    let nickName = pilotObj.nickName;
    if (nickName === undefined) {
        nickName = "";
    } else {
        nickName = `(${pilotObj.nickName})`;
    }
    return `${pilotObj.firstName} ${pilotObj.lastName} ${nickName}`;
}

// Given a destination object will return formatted string
function FormatDestination(destinationObj) {
    let returnString = "";
    returnString += destinationObj.code;
    returnString += ` (${destinationObj.city} ${destinationObj.country}), `;
    returnString += ` region = ${destinationObj.region}`;
    return returnString;
}
