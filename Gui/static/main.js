// Define global variables for Chart.js chart and data
var chart;
var chartData = {
    labels: [],
    datasets: [{
        label: 'Stock Price',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

function showStatus(triggered = false) {
    var companySelect = document.getElementById("company-select");
    var selectedCompany = companySelect.value;
    var statusContainer = document.getElementById("status-container");
    var newsContainer = document.getElementById("news-container");
    var sentimentContainer = document.getElementById("sentiment-container");

    if (triggered) {
        // Make AJAX request to Flask server to get stock data
        fetch(`/get_stock_data/${selectedCompany}`)
            .then(response => response.json())
            .then(data => {
                // Update stock price
                statusContainer.innerHTML = `<h2>${data.company}</h2><p>Stock Price: ${data.price}</p>`;

                 // Parse stock price to remove currency symbol and convert to float
                var price = parseFloat(data.price.replace(/[^0-9.-]+/g, ''));

             if (!isNaN(price)) { // Check if price is a valid number
                    // Update Chart.js data
                    var currentDate = new Date().toLocaleTimeString();
                    chartData.labels.push(currentDate);
                    chartData.datasets[0].data.push(price);

                    console.log("Chart data:", chartData); // Log chartData for debugging

                    // Limit data to show only last 10 points
                    if (chartData.labels.length > 10) {
                        chartData.labels.shift();
                        chartData.datasets[0].data.shift();
                    }

                    // Update Chart.js chart
                    chart.update();
                } else {
                    console.error("Error parsing stock price:", data.price);
                }

                //News content
                var newsContent = "<ul><li>News 1</li><li>News 2</li><li>News 3</li></ul>";
                newsContainer.innerHTML = `<h2>News</h2>${newsContent}`;

                // Fetch sentiment analysis
                var sentiment = "Positive";
                sentimentContainer.innerHTML = `<h2>Sentiment Analysis</h2><p>Sentiment: ${sentiment}</p>`;
            })
            .catch(error => console.error('Error:', error));
    }
}


// Event listener for the "Show Status" button
document.getElementById("show-status-button").addEventListener("click", function() {
    showStatus(true);
});

// Call showStatus initially to prepare the status display and start dynamic updates
showStatus(true);

// Create Chart.js chart
var ctx = document.getElementById('stock-chart').getContext('2d');
chart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Stock Price'
                }
            }
        }
    }
});

// Update every three seconds
setInterval(function() {
    showStatus(true);
}, 3000);
