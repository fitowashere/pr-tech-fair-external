// Define a variable outside of the function to keep track of the chart instance
let chartInstance = null;

function sendMessage() {
    var message = document.getElementById("messageInput").value;
    fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
    })
    .then((response) => response.json())
    .then((data) => {
        // Display the text response
        document.getElementById("responseArea").innerText = data.response;
        document.getElementById("responseArea").style.display = 'block';
        
        // Extract cities and their population
        var cityPopulationData = extractCitiesAndPopulation(data.response);
        if (cityPopulationData.length > 0) {
            var labels = cityPopulationData.map(data => data.city);
            var populations = cityPopulationData.map(data => data.population);
            displayGraph(populations, labels);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function extractCitiesAndPopulation(text) {
    // Regular expression to match patterns like "San Juan Municipio, Puerto Rico is 334,776"
    var regex = /(\b[\w\s]+), Puerto Rico is (\d{1,3}(,\d{3})*)/g;
    var matches, cityPopulationData = [];

    while ((matches = regex.exec(text)) !== null) {
        cityPopulationData.push({
            city: matches[1],
            population: parseInt(matches[2].replace(/,/g, ''), 10)
        });
    }

    return cityPopulationData;
}

function displayGraph(data, labels) {
    var ctx = document.getElementById('responseGraph').getContext('2d');
    document.getElementById("responseGraph").style.display = 'block';

    // If an instance of the chart already exists, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Create a new chart instance and assign it to the variable
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Population Data',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
