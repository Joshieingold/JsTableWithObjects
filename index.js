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
    return FilterObj(inObj);
}

function FilterObj(inObj) {
    let cityInput = GetValueById("#city-input").toLowerCase();
    let countryInput = GetValueById("#country-input").toLowerCase();
    let regionInput = GetValueById("#region-input");
    let dayInput = GetValueById("#depart-input");
    let minInput = GetValueById("#depart-min");
    let maxInput = GetValueById("#depart-max");
    let pilotBool = document.querySelector("#pilot-required").checked;
    let copilotBool = document.querySelector("#copilot-required").checked;
    let returnArray = [];
    for (let i = 0; i < inObj.flights.length; i++) {
        let currentObj = inObj.flights[i];
        if (!CheckCity(currentObj.destination.city, cityInput)) {
            continue;
        }
        if (!CheckCountry(currentObj.destination.country, countryInput)) {
            continue;
        }
        if (!CheckRegion(currentObj.destination.region, regionInput)) {
            continue;
        }
        if (!CheckDay(currentObj.dayOfWeek, dayInput)) {
            continue;
        }
        if (!CheckMinMax(currentObj.departureTime, minInput, maxInput)) {
            continue;
        }
        if (pilotBool && !CheckPilot(currentObj.pilot)) {
            continue;
        }
        if (copilotBool && !CheckCopilot(currentObj.copilot)) {
            continue;
        }
        // If all pass add it to the return list
        returnArray.push(currentObj);
    }
    return { flights: returnArray };
}

/////////////
// Filters //
/////////////

function CheckCity(currentDataString, targetDataString) {
    currentDataString = currentDataString.toLowerCase();

    // If its empty, do not filter
    if (targetDataString === "") {
        return true;
    }
    // If string does not exist, FAIL
    if (currentDataString === "" || currentDataString === undefined) {
        return false;
    }
    // If the string starts with target PASS
    if (currentDataString.startsWith(targetDataString)) {
        return true;
    }
    // If does not hit a pass case it FAILS
    return false;
}

function CheckCountry(currentDataString, targetDataString) {
    currentDataString = currentDataString.toLowerCase();

    // If its empty, do not filter
    if (targetDataString === "") {
        return true;
    }
    // If string does not exist, FAIL
    if (currentDataString === "" || currentDataString === undefined) {
        return false;
    }
    // If the string starts with target PASS
    if (currentDataString.startsWith(targetDataString)) {
        return true;
    }
    // If does not hit a pass case it FAILS
    return false;
}

function CheckRegion(currentDataInt, targetDataString) {
    // If its empty, do not filter, TRUE
    if (targetDataString === "") {
        return true;
    }
    let targetDataInt = Number(targetDataString); // Probably can pass the function an int
    // If int does not exist, FAIL
    if (currentDataInt === "" || currentDataInt === undefined) {
        return false;
    }
    // If the current data = the target PASS
    if (currentDataInt === targetDataInt) {
        return true;
    }
    // If does not hit a pass case it FAILS
    return false;
}

function CheckDay(currentDataString, targetDataString) {
    // If any is specified return true, PASS
    if (targetDataString === "Any") {
        return true;
    }
    // If string does not exist, FAIL
    if (currentDataString === "" || currentDataString === undefined) {
        return false;
    }
    // If the values are the same, PASS
    if (currentDataString === targetDataString) {
        return true;
    }
    // If does not hit a pass case it FAILS
    return false;
}

function CheckMinMax(currentDataInt, targetMin, targetMax) {
    if (targetMin === "") {
        targetMin = 0;
    }
    if (targetMax === "") {
        targetMax = 2400;
    }
    targetMin = Number(targetMin);
    targetMax = Number(targetMax);

    if (currentDataInt === "" || currentDataInt === undefined) {
        return false;
    }
    if (targetMin <= currentDataInt && currentDataInt <= targetMax) {
        return true;
    }
    return false;
}

function CheckPilot(currentDataString) {
    if (currentDataString === "" || currentDataString === undefined) {
        return false;
    }
    return true;
}

function CheckCopilot(currentDataString) {
    if (currentDataString === "" || currentDataString === undefined) {
        return false;
    }
    return true;
}

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
    if (document.querySelector(id) === null) {
        console.log(id, " Failed!");
    }
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
